const SHELL_CACHE_PREFIX = "ahadu-academy-shell-";

export function getAppVersion() {
  return typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "1.0.3";
}

export function getBuildDate() {
  return typeof __APP_BUILD_DATE__ !== "undefined" ? __APP_BUILD_DATE__ : "unknown";
}

export function compareVersions(left = "0", right = "0") {
  const a = String(left).split(/[.+-]/).slice(0, 3).map((part) => Number.parseInt(part, 10) || 0);
  const b = String(right).split(/[.+-]/).slice(0, 3).map((part) => Number.parseInt(part, 10) || 0);
  for (let index = 0; index < 3; index += 1) {
    if ((a[index] || 0) > (b[index] || 0)) return 1;
    if ((a[index] || 0) < (b[index] || 0)) return -1;
  }
  return 0;
}

export function getRuntimePlatform() {
  const capacitor = typeof window !== "undefined" ? window.Capacitor : null;
  if (!capacitor?.isNativePlatform?.()) return "web";
  return capacitor.getPlatform?.() || "native";
}

function getManifestUrl() {
  const configured = import.meta.env.VITE_UPDATE_MANIFEST_URL;
  return new URL(configured || "/version.json", window.location.origin);
}

export async function fetchLatestVersion() {
  const url = getManifestUrl();
  url.searchParams.set("check", String(Date.now()));
  const response = await fetch(url.toString(), {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error(`Version check failed (HTTP ${response.status}).`);
  const metadata = await response.json();
  if (!metadata?.version) throw new Error("The remote version manifest is missing its version.");
  if (metadata.bundleUrl) metadata.bundleUrl = new URL(metadata.bundleUrl, getManifestUrl()).toString();
  return metadata;
}

async function getLiveUpdate() {
  if (getRuntimePlatform() === "web") return null;
  const module = await import("@capawesome/capacitor-live-update");
  return module.LiveUpdate || null;
}

// The plugin must confirm the currently running bundle before any bundle
// download or switch. Share one initialization promise to avoid races between
// app startup and a user pressing Update immediately after opening Settings.
let liveUpdateReadyPromise = null;
let otaApplyInFlight = null;

async function ensureLiveUpdateReady() {
  if (!liveUpdateReadyPromise) {
    liveUpdateReadyPromise = (async () => {
      const liveUpdate = await getLiveUpdate();
      if (!liveUpdate) throw new Error("OTA updates are available only in the installed Capacitor app.");
      await liveUpdate.ready();
      return liveUpdate;
    })().catch((error) => {
      liveUpdateReadyPromise = null;
      throw error;
    });
  }
  return liveUpdateReadyPromise;
}

export async function getCurrentOtaBundleId() {
  const liveUpdate = await ensureLiveUpdateReady();
  const current = await liveUpdate.getCurrentBundle();
  return current?.bundleId || null;
}

export async function applyOtaBundle(metadata) {
  if (otaApplyInFlight) return otaApplyInFlight;

  otaApplyInFlight = (async () => {
    if (!metadata?.bundleId || !metadata?.bundleUrl) throw new Error("The update manifest is missing bundleId or bundleUrl.");
    if (!metadata?.checksum) throw new Error("The OTA bundle checksum is missing; refusing an unverified download.");

    const liveUpdate = await ensureLiveUpdateReady();
    const current = await liveUpdate.getCurrentBundle();
    if (current?.bundleId === metadata.bundleId) {
      return { alreadyCurrent: true, reloadPending: false };
    }

    await liveUpdate.downloadBundle({
      artifactType: "zip",
      bundleId: metadata.bundleId,
      checksum: metadata.checksum,
      url: metadata.bundleUrl,
    });
    await liveUpdate.setNextBundle({ bundleId: metadata.bundleId });

    // This app keeps offline study content in IndexedDB. Reloading a WebView
    // while a database connection is held can hang the web layer even though
    // the new bundle was downloaded successfully. Stage the verified bundle
    // and apply it on the next cold app launch instead of risking that hang.
    return { alreadyCurrent: false, restartRequired: true };
  })();

  try {
    return await otaApplyInFlight;
  } finally {
    otaApplyInFlight = null;
  }
}

export async function initializeLiveUpdates() {
  if (getRuntimePlatform() === "web") return;
  try {
    // Confirm the running bundle on every native launch, even when offline.
    // Downloads are deliberately user-initiated from Settings to prevent a
    // startup download racing with the Update button's own download.
    await ensureLiveUpdateReady();
  } catch (error) {
    // OTA initialization must never block startup or offline study access.
    console.warn("Live Update initialization failed; continuing with the installed bundle.", error);
  }
}

export async function openExternalUpdateUrl(url) {
  if (!url) throw new Error("No app download URL is configured.");
  const parsed = new URL(url);
  if (parsed.protocol !== "https:") throw new Error("App download links must use HTTPS.");
  if (getRuntimePlatform() !== "web") {
    const { Browser } = await import("@capacitor/browser");
    await Browser.open({ url: parsed.toString() });
    return;
  }
  window.open(parsed.toString(), "_blank", "noopener,noreferrer");
}

function waitForControllerChange(timeoutMs = 5000) {
  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeout);
      navigator.serviceWorker.removeEventListener("controllerchange", finish);
      resolve();
    };
    const timeout = window.setTimeout(finish, timeoutMs);
    navigator.serviceWorker.addEventListener("controllerchange", finish, { once: true });
  });
}

export async function refreshAppShell() {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.update().catch(() => undefined);
        if (!registration.waiting && registration.installing) {
          await new Promise((resolve) => {
            const worker = registration.installing;
            const timeout = window.setTimeout(resolve, 7000);
            const onStateChange = () => {
              if (["installed", "activated", "redundant"].includes(worker.state)) {
                window.clearTimeout(timeout);
                worker.removeEventListener("statechange", onStateChange);
                resolve();
              }
            };
            worker.addEventListener("statechange", onStateChange);
            onStateChange();
          });
        }

        if (registration.waiting) {
          const controllerChanged = waitForControllerChange();
          registration.waiting.postMessage({ type: "SKIP_WAITING" });
          await controllerChanged;
        }

        // Remove only old shell caches when the active worker supports it.
        // If not, retain caches so offline pages/resources remain available.
        const worker = navigator.serviceWorker.controller || registration.active;
        if (worker && typeof MessageChannel !== "undefined") {
          await new Promise((resolve) => {
            const channel = new MessageChannel();
            const timeout = window.setTimeout(() => {
              channel.port1.close();
              resolve(false);
            }, 2500);
            channel.port1.onmessage = (event) => {
              window.clearTimeout(timeout);
              channel.port1.close();
              resolve(Boolean(event.data?.ok));
            };
            worker.postMessage({ type: "CLEAR_STALE_SHELL_CACHES" }, [channel.port2]);
          });
        }
      }
    } catch {
      // Service workers may be unavailable in some native WebViews.
    }
  }
  window.location.reload();
}
