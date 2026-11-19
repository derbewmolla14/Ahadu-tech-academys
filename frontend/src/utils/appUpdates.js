const SHELL_CACHE_PREFIX = "ahadu-academy-shell-";

export function getAppVersion() {
  return typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "1.0.1";
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

export async function fetchLatestVersion() {
  const response = await fetch(`/version.json?check=${Date.now()}`, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error(`Version check failed (HTTP ${response.status}).`);
  const metadata = await response.json();
  if (!metadata?.version) throw new Error("The remote version manifest is missing its version.");
  return metadata;
}

export async function refreshAppShell() {
  let registration = null;
  if ("serviceWorker" in navigator) {
    try {
      registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.update().catch(() => undefined);
        if (registration.waiting) {
          registration.waiting.postMessage({ type: "SKIP_WAITING" });
          await new Promise((resolve) => {
            const timeout = window.setTimeout(resolve, 4000);
            navigator.serviceWorker.addEventListener("controllerchange", () => {
              window.clearTimeout(timeout);
              resolve();
            }, { once: true });
          });
        }
      }
    } catch {
      // A WebView or browser may not expose a usable service-worker registration.
    }
  }

  // Only remove this app's static shell caches. Offline study files live in IndexedDB
  // (ahadu-tech-offline) and are deliberately never touched here.
  if ("caches" in window) {
    const keys = await caches.keys().catch(() => []);
    await Promise.all(keys
      .filter((key) => key.startsWith(SHELL_CACHE_PREFIX))
      .map((key) => caches.delete(key).catch(() => false)));
  }

  window.location.reload();
}
