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
  const configuredManifestUrl = import.meta.env.VITE_UPDATE_MANIFEST_URL;
  const manifestUrl = configuredManifestUrl || "/version.json";
  const url = new URL(manifestUrl, window.location.origin);
  url.searchParams.set("check", String(Date.now()));
  const response = await fetch(url.toString(), {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error(`Version check failed (HTTP ${response.status}).`);
  const metadata = await response.json();
  if (!metadata?.version) throw new Error("The remote version manifest is missing its version.");
  return metadata;
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

async function askActiveWorkerToCleanStaleCaches(worker) {
  if (!worker || typeof MessageChannel === "undefined") return false;
  return new Promise((resolve) => {
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

export async function refreshAppShell() {
  let registration = null;
  if ("serviceWorker" in navigator) {
    try {
      registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.update().catch(() => undefined);

        // Allow a newly discovered worker a short window to finish installing.
        if (!registration.waiting && registration.installing) {
          await new Promise((resolve) => {
            const worker = registration.installing;
            const timeout = window.setTimeout(resolve, 7000);
            const onStateChange = () => {
              if (worker.state === "installed" || worker.state === "activated" || worker.state === "redundant") {
                window.clearTimeout(timeout);
                worker.removeEventListener("statechange", onStateChange);
                resolve();
              }
            };
            worker.addEventListener("statechange", onStateChange);
            onStateChange();
          });
        }

        const waitingWorker = registration.waiting;
        if (waitingWorker) {
          const controllerChanged = waitForControllerChange();
          waitingWorker.postMessage({ type: "SKIP_WAITING" });
          await controllerChanged;
        }

        // The active worker keeps its current shell cache and removes only older
        // caches in this app's namespace. IndexedDB and authentication storage are untouched.
        const activeWorker = navigator.serviceWorker.controller || registration.active;
        await askActiveWorkerToCleanStaleCaches(activeWorker);
      }
    } catch {
      // Service workers are not available in every Capacitor WebView.
    }
  }

  // Capacitor live-server builds refresh the WebView document; bundled builds
  // reach this point only when no native binary replacement is required.
  window.location.reload();
}
