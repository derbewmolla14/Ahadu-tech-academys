import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { deflateRawSync } from "node:zlib";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const packageJson = require("../package.json");

const distDir = path.resolve("dist");
const zipPath = path.join(distDir, "ota-bundle.zip");
const manifestPath = path.join(distDir, "version.json");

async function loadBuildEnvironment() {
  for (const name of [".env.production.local", ".env.local", ".env.production", ".env"]) {
    try {
      const contents = await fs.readFile(path.resolve(name), "utf8");
      for (const line of contents.split(/\r?\n/)) {
        const match = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
        if (!match || Object.hasOwn(process.env, match[1])) continue;
        let value = match[2];
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
        process.env[match[1]] = value;
      }
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function dosDateTime(date) {
  return {
    time: (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2),
    date: ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate(),
  };
}

async function collectFiles(directory, base = directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collectFiles(absolute, base));
    else if (absolute !== zipPath) files.push({ absolute, name: path.relative(base, absolute).split(path.sep).join("/") });
  }
  return files;
}

async function createZip(files) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  const now = dosDateTime(new Date());

  for (const file of files) {
    const name = Buffer.from(file.name, "utf8");
    const original = await fs.readFile(file.absolute);
    const compressed = deflateRawSync(original, { level: 9 });
    const checksum = crc32(original);

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x0800, 6);
    local.writeUInt16LE(8, 8);
    local.writeUInt16LE(now.time, 10);
    local.writeUInt16LE(now.date, 12);
    local.writeUInt32LE(checksum, 14);
    local.writeUInt32LE(compressed.length, 18);
    local.writeUInt32LE(original.length, 22);
    local.writeUInt16LE(name.length, 26);
    local.writeUInt16LE(0, 28);
    localParts.push(local, name, compressed);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(8, 10);
    central.writeUInt16LE(now.time, 12);
    central.writeUInt16LE(now.date, 14);
    central.writeUInt32LE(checksum, 16);
    central.writeUInt32LE(compressed.length, 20);
    central.writeUInt32LE(original.length, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt16LE(0, 30);
    central.writeUInt16LE(0, 32);
    central.writeUInt16LE(0, 34);
    central.writeUInt16LE(0, 36);
    central.writeUInt32LE(0, 38);
    central.writeUInt32LE(offset, 42);
    centralParts.push(central, name);
    offset += local.length + name.length + compressed.length;
  }

  const centralDirectory = Buffer.concat(centralParts);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(centralDirectory.length, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);
  await fs.writeFile(zipPath, Buffer.concat([...localParts, centralDirectory, end]));
}

await loadBuildEnvironment();
const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
const buildDate = new Date().toISOString();
const bundleId = `ahadu-${packageJson.version}-${buildDate.replace(/[^0-9]/g, "").slice(0, 14)}`;

manifest.version = packageJson.version;
manifest.buildDate = buildDate;
manifest.bundleId = bundleId;
manifest.bundleUrl = process.env.VITE_OTA_BUNDLE_URL || "/ota-bundle.zip";
manifest.checksum = "";
manifest.androidUpdateUrl = process.env.VITE_ANDROID_UPDATE_URL || manifest.androidUpdateUrl || "";
manifest.iosUpdateUrl = process.env.VITE_IOS_UPDATE_URL || manifest.iosUpdateUrl || "";
manifest.nativeUpdateRequired = process.env.VITE_NATIVE_UPDATE_REQUIRED === "true";
manifest.webBundleMode = "ota";

await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
const files = await collectFiles(distDir);
if (!files.some((file) => file.name === "index.html")) throw new Error("dist/index.html is missing; run vite build first.");
await createZip(files);
manifest.checksum = createHash("sha256").update(await fs.readFile(zipPath)).digest("hex");
await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n");

console.log(`Created OTA bundle: ${zipPath}`);
console.log(`Bundle ID: ${manifest.bundleId}`);
console.log(`SHA-256: ${manifest.checksum}`);
