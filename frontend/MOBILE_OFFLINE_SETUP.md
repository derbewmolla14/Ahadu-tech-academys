# Ahadu Tech Academy — PWA, offline library, and Capacitor setup

## Included in this change
- PWA manifest and production service-worker registration.
- App-shell caching for the frontend only. Authenticated API responses and /uploads/ are deliberately excluded from service-worker caching.
- IndexedDB offline library for files downloaded through the existing authenticated download flow. The backend's current Premium approval checks still run before a file can be downloaded and saved.
- Dashboard route: My Offline Library (/dashboard/offline) to open or delete saved files.
- Cached, non-secret user profile state so an existing session can restore its dashboard shell during a temporary network outage. The app still needs the server to validate the JWT before protected API operations.

## Important authentication security note
The existing app stores its bearer JWT in localStorage. This is persistent across restarts, but it is not secure native storage and is exposed to JavaScript running in the app origin. This change does not claim to solve that. Before production native distribution, migrate native JWT storage to iOS Keychain / Android Keystore using a maintained Capacitor secure-storage plugin and update the API interceptor/auth provider to read it. Never put JWTs in IndexedDB or the PWA cache. Consider rotating/revoking tokens and setting a shorter access-token lifetime as part of that migration.

## Install Capacitor packages locally
From the frontend directory:

```powershell
npm install @capacitor/core @capacitor/android @capacitor/ios @capacitor/filesystem
npm install --save-dev @capacitor/cli
```

Then add native platforms and sync:

```powershell
npm run build
npx cap add android
npx cap sync android
npx cap open android
```

For iOS, run on macOS with Xcode installed:

```bash
npx cap add ios
npx cap sync ios
npx cap open ios
```

The Capacitor config is in capacitor.config.ts and uses the Vite output folder dist.

## Native filesystem follow-up
The current offline library stores authorized files in IndexedDB, which works for supported browsers and many WebViews. For large video libraries and reliable device-level file management, use @capacitor/filesystem on native platforms, store file metadata in IndexedDB, and provide migration/cleanup logic. Verify available disk space and handle filesystem permissions/quota errors. YouTube streams cannot be cached by this feature; only downloadable course files are saved.

## Desktop packaging
Capacitor targets Android and iOS, not desktop executables. A desktop build needs a separate wrapper such as Tauri or Electron, with its own packaging, signing, and update workflow.

## Release checks still required
- Install native dependencies and commit the regenerated package-lock.json.
- Test Android WebView login, app restart, offline launch, file save/open/delete, video playback, and storage limits on physical devices.
- Test iOS on macOS/Xcode.
- Confirm Premium approval/revocation while online; offline files already saved to a device cannot be remotely erased or revalidated until the device reconnects. For content requiring immediate revocation, do not permit offline caching.
- Configure HTTPS, app icons/splash screens, signing keys, privacy disclosures, store screenshots, and Play Console metadata before publishing.