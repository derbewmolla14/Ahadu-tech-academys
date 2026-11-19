Static assets and native app branding notes for Ahadu Tech Academy.

Web/PWA branding:
- /icon.svg is the scalable 512x512 Ahadu Tech Academy launcher mark.
- /favicon.svg uses the same mark for browser tabs.
- /manifest.json references /icon.svg.
- index.html references /icon.svg and /manifest.json.

Native Android/iOS project status:
- This repository branch currently has no frontend/android/ directory, no Capacitor config file,
  and no native mipmap-* launcher resources. Therefore Android launcher resources and
  strings.xml cannot be updated or validated in this branch.
- When the Capacitor Android project is generated, place the approved high-resolution
  source artwork at frontend/resources/icon.png (1024x1024 PNG, square, transparent or
  solid background) and frontend/resources/splash.png (2732x2732 PNG with centered mark).
- Generate platform launcher assets with @capacitor/assets after installing the Capacitor
  packages and adding the Android platform. Then run npx cap sync android.
- Set the Android app label to "Ahadu Tech Academy" in the generated app/src/main/res/values/strings.xml
  and verify app/src/main/AndroidManifest.xml uses the generated @mipmap/ic_launcher.
- Do not manually copy an SVG into mipmap-* PNG slots; use a proper raster asset generator.

The current frontend package.json does not include @capacitor/core, @capacitor/cli,
@capacitor/android, or @capacitor/assets. Native generation is a separate step and has
not been performed by this repository change.
