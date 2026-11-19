export async function initializeLiveUpdates() {
  if (getRuntimePlatform() === "web") return;
  try {
    const liveUpdate = await getLiveUpdate();
    if (!liveUpdate) return;
    // ready() must run on every native launch, including offline launches,
    // so the plugin can confirm the active bundle and avoid rollback.
    await liveUpdate.ready();
    if (!navigator.onLine) return;

    const metadata = await fetchLatestVersion();
    if (!metadata.bundleId || !metadata.bundleUrl || !metadata.checksum) return;

    const current = await liveUpdate.getCurrentBundle();
    if (current?.bundleId === metadata.bundleId) return;

    await liveUpdate.downloadBundle({
      artifactType: "zip",
      bundleId: metadata.bundleId,
      checksum: metadata.checksum,
      url: metadata.bundleUrl,
    });
    await liveUpdate.setNextBundle({ bundleId: metadata.bundleId });
    await liveUpdate.reload();
  } catch (error) {
    // OTA failures must never block startup or offline study access.
    console.warn("Automatic OTA update check failed; continuing with the installed bundle.", error);
  }
}
