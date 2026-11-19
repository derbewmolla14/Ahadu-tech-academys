# Ahadu Tech Academy OTA updates

## Origin and stored user data

Keep the Capacitor app on its existing local WebView origin (normally `https://localhost` on Android). Do not set `server.url` to the public Vercel site: changing origins can make existing WebView localStorage and IndexedDB data appear missing.

The OTA flow never clears localStorage, authentication/profile data, or the `ahadu-tech-offline` IndexedDB database. The existing `frontend/public/sw.js` is intentionally unchanged. Its `ahadu-academy-shell-*` cache namespace remains separate from offline study materials. If an older worker does not understand the stale-cache message, caches are retained rather than deleted.

## What OTA can update

The Capawesome Live Update plugin downloads a ZIP of built web assets, verifies its SHA-256 checksum, activates it, and reloads the WebView. OTA is for compatible HTML, CSS, JavaScript, and static assets. Native Android/iOS code, permissions, plugins, or platform configuration still require a new native app release.

## Build-time environment variables

Configure these in `frontend/.env.production` or the frontend hosting provider's build environment:

- `VITE_UPDATE_MANIFEST_URL`: optional absolute HTTPS URL for `version.json`. Leave blank to use `/version.json` on the deployed frontend.
- `VITE_OTA_BUNDLE_URL`: optional absolute HTTPS URL for the generated `ota-bundle.zip`. Leave blank to use `/ota-bundle.zip` beside the manifest.
- `VITE_ANDROID_UPDATE_URL`: HTTPS URL of the signed Android APK, preferably a stable GitHub Release asset or controlled HTTPS download.
- `VITE_IOS_UPDATE_URL`: optional App Store page or official iOS release page.
- `VITE_NATIVE_UPDATE_REQUIRED`: set to `true` only when a release requires a native binary update.

These values are public client configuration. Never put signing keys, passwords, or private tokens in Vite environment variables.

## Hosting

Every production build creates:

- `dist/version.json`: generated manifest with a unique bundle ID, ZIP URL, and SHA-256 checksum.
- `dist/ota-bundle.zip`: ZIP containing the built web assets.

Deploy the complete `dist/` directory to the same HTTPS origin. If using a separate CDN, set `VITE_UPDATE_MANIFEST_URL` and `VITE_OTA_BUNDLE_URL` to absolute HTTPS URLs and configure CORS for the app origin. The APK URL is a separate release download link.

## Capacitor configuration

Install and sync the plugin after pulling the changes:

```powershell
npm install
npx cap sync android
```

The plugin supports self-hosted ZIP bundles and does not require a Capawesome Cloud app ID. No `server.url` or remote `webDir` setting is needed. Preserve the existing local `frontend/capacitor.config.ts` values: `appId`, `appName`, and `webDir: "dist"`. Do not replace the config file. Optional Capawesome Cloud mode uses `plugins.LiveUpdate.appId` and a channel, but this project uses self-hosted URLs instead.

## Local Android test

From `frontend`:

```powershell
npm install
npm run build
npx cap sync android
```

Open `frontend/android` in Android Studio and select a Gradle JDK compatible with the project's Gradle wrapper. Keep the same application ID and signing key as the installed app. Do not uninstall the app while testing updates; uninstalling removes app-local data.

For local ADB testing after building the APK:

```powershell
adb install -r .\\android\\app\\build\\outputs\\apk\\debug\\app-debug.apk
```

## Release workflow

1. Run the frontend production build.
2. Deploy all files in `dist/`, including `version.json` and `ota-bundle.zip`.
3. Test an OTA update with the existing native app installed.
4. For native changes, build and sign a new APK, upload it to the configured HTTPS URL, and set `VITE_NATIVE_UPDATE_REQUIRED=true` for that release.
5. Set the flag back to `false` after the native release is no longer required.

The OTA ZIP contains executable app code. Publish it only from a trusted HTTPS deployment pipeline and protect deployment credentials.
