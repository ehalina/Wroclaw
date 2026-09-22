# Native release tools

These scripts are adapted from the local Dino and Models42 projects for Wroclaw Storywalk (`com.event.horizon.wroclaw`). Run them from the repository through `make`. They create local build assets and do not upload to either store.

## Icons

`resources/icon-source.png` is the editable square master. The current art uses the project's Wroclaw watercolor as a reference. Inspect it at launcher size before release.

```bash
make icons-dry-run
make icons
```

`make icons` updates the Xcode AppIcon and Android legacy/adaptive launcher PNGs. `_iconBuilder/` has per-platform wrappers. The current build uses one Wroclaw Storywalk image on both platforms. Check the Android adaptive mask on a device and make a new build number after changing an uploaded icon.

## Android builds and signing

```bash
make android-build                                    # Capacitor sync + debug APK
make android-signing-create SIGNING_ARGS=--dry-run
make android-signing-create SIGNING_ARGS=--confirm-create
make android-signing-check
make android-bundle ANDROID_VERSION_CODE=1 ANDROID_VERSION_NAME=1.0
```

The signing command creates `___keys/android/upload-keystore.jks` and `signing.properties` once. Both are ignored by Git. Back up both files securely before the first Play upload; losing the upload key complicates future updates. `make android-bundle` requires these files, builds a signed AAB and APK, then verifies the AAB signature. Increase `ANDROID_VERSION_CODE` for every Play upload. The AAB is at `android/app/build/outputs/bundle/release/app-release.aab`. `_signAAB/` also contains a standalone signature checker.

The key has **not** been created by adding these scripts. Google Play app creation, Play App Signing enrollment, internal test, Data safety and store listing are separate steps.

## iOS archive

```bash
make ios-archive BUILD_ARGS=--dry-run
make ios-archive
make ios-archive BUILD_ARGS=--no-upload
```

The script regenerates the iOS launcher icon from `resources/icon-source.png`, increments `CURRENT_PROJECT_VERSION` in the Xcode project, syncs Capacitor, creates a Release archive at `artifacts/native/ios/App-<version>-<build>.xcarchive`, then exports/uploads it to App Store Connect/TestFlight through `xcodebuild -exportArchive`. It appends each run to `artifacts/native/ios/build-ios.log`, including the selected version, build number, archive path, export path, upload status, and build output, so old archives can be reviewed and removed manually from the same directory when needed. Pass `BUILD_ARGS=--no-upload` for a local archive only, or `IOS_BUILD_NUMBER=N` when you need to force a specific build number; if that archive already exists and upload is enabled, the script skips rebuilding and uploads the existing archive. Upload authentication reads `ASC_ISSUER_ID` from `___keys/ios/asc.env`, `___keys/ios/issuer-id.txt`, `.env`, or the shell, and auto-detects the single `___keys/ios/AuthKey_*.p8` file unless `ASC_KEY_ID`/`ASC_KEY_PATH` override it. The first TestFlight build is already `1.0 (1)`, so replacements need higher build numbers. Review the new icon in TestFlight before distribution.

Example ignored `___keys/ios/asc.env`:

```dotenv
ASC_ISSUER_ID=...
```

## Store screenshots

```bash
make store-screenshots SCREENSHOT_ARGS='--dry-run'
make store-screenshots SCREENSHOT_ARGS='--profile ios-phone --language en --state start,map,story'
make store-screenshots
```

The Playwright script captures the current app UI in English, Russian and Polish for an iPhone landscape, iPad landscape and Android phone profile. It writes PNGs to ignored `artifacts/store-screenshots/<language>/<profile>/<state>.png`, checks pixel dimensions, and never alters app content. These are browser captures of the Capacitor web UI. Review every image for localization, layout and store suitability; capture final native screenshots if the store requires device-specific chrome or rendering. The `story` state is the second tour scene, not a completed quest. The app currently has incomplete content and translations, so these files are candidates, not approved listing assets.
