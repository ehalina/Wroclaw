# Wroclaw Storywalk: iOS and Android release plan

Updated: 2026-09-22. This plan covers the current Tumski Island tour and leaves room for later historic Wroclaw routes. [BACKLOG.md](../../BACKLOG.md) remains the status source of truth.

## Release scope

- First milestone: an **internal TestFlight build** of the iOS app, followed by testing and a separate App Store submission decision.
- Android follows with a Google Play internal test, then production submission.
- Launch languages: English, Russian, Polish. Check both the in-app text and the store listing in each language; other in-app locales can be added to store metadata after editorial review.
- No subscriptions, advertising, or in-app purchases in the first release. Do not copy the ads, RevenueCat, subscription, or paywall setup from the reference projects.
- Later: opt-in analytics with an updated privacy/data inventory; separately, one-time purchases for additional quests or languages with entitlement restoration and store billing on both platforms.

## Current baseline

| Area | Status on 2026-09-22 | Evidence / next action |
| --- | --- | --- |
| App identity | Done locally | Capacitor, Xcode and Android use `com.event.horizon.wroclaw`; display name is `Wroclaw Storywalk`. |
| Web and native sync | Done locally | `make cap-sync` passes. |
| iOS compilation/upload | In internal TestFlight | Signed `1.0 (1)` was uploaded on 2026-09-22. App Store Connect API reports `processingState=VALID` and `internalBuildState=IN_BETA_TESTING`. `build-ios.sh` now automates icon generation, build-number incrementing, archive logging, export, and upload; add the issuer ID under `___keys/ios/` before uploading `1.0 (2)`. |
| Android compilation | Partial | `make android-debug` and `make android-release` pass with the new package ID. A signed AAB remains. |
| Automated checks | Done locally | `make audit` reports zero npm vulnerabilities and `make smoke` passes all 74 browser tests. |
| Store records | iOS listing partly filled | App Store Connect confirms `Wroclaw Storywalk` / `com.event.horizon.wroclaw`. Travel/Education categories and EN/RU/PL listing and TestFlight text are set; see `app-store-connect-status.md`. The build is linked to `Internal Testing`; two testers are `INVITED`. Create the Android record later. |
| Export compliance | Done for current build | The owner confirmed that the current build and libraries use no non-exempt encryption. Apple reports `usesNonExemptEncryption=false`; `Info.plist` now carries the same declaration for future builds with this dependency set. Recheck if encryption behavior or libraries change. |
| Release content | Needs review | BACKLOG tracks incomplete tour content and translations. Audit actual EN/RU/PL pages and routes before external testing. |
| Data practices | Needs review | Web runtime loads Firebase Auth/Firestore scripts and Google Fonts; account code can use Firestore and an IP lookup. Determine what is enabled in native builds before answering privacy forms. |
| Store assets and contacts | In progress | New Wroclaw icon art is generated for iOS/Android, but the uploaded TestFlight `1.0 (1)` still has the old icon. Local `1.0 (2)` can be uploaded with `IOS_BUILD_NUMBER=2 ./build-ios.sh` after the App Store Connect issuer ID is stored locally. All 18 EN/RU/PL iPhone/iPad browser screenshots are uploaded and processed by Apple; compare them with native rendering before review. Privacy/support URLs and contact fields are set; a dedicated support page and licensed media inventory remain. |

## iOS: internal TestFlight first

1. **Account and identity — confirmed.** The app record uses `com.event.horizon.wroclaw`; the Wroclaw key authenticates with the team Issuer ID found in Models42's local App Store Connect configuration. Xcode signs with Team `AB8LFY64PF`. Keep the `.p8` file outside Git; it authenticates Apple services but is not an app signing certificate. Check pending agreements.
2. **Build readiness.** Resolve any broken first-run route, audio, orientation, online/offline, Firebase sign-in, and navigation behavior on a real iPhone and supported iPad. Audit EN/RU/PL text and missing content. Confirm media rights and icon quality. Make a fresh `make cap-sync` before archiving.
3. **Release metadata.** EN/RU/PL name, subtitle, description, keywords, support/privacy URLs, copyright and TestFlight “What to Test” text are set. The age rating questionnaire is saved and Apple reports `TWELVE_PLUS`; export compliance is recorded for the current build. Complete App Privacy answers from observed data flows. Do not guess “no data collected” while Firebase and IP lookup code remain available.
4. **Signed archive — done for 1.0 (1), local `1.0 (2)` ready.** Xcode automatic signing used Team `AB8LFY64PF`; the generic iOS archive has the expected bundle ID, display name, version and embedded provisioning profile. Keep the archive and diagnostics outside Git; validate runtime and icon on device.
5. **Upload and processing — done for `1.0 (1)`, automated for next builds.** Xcode reported `Upload succeeded` on 2026-09-22, and App Store Connect API reports the build as `VALID`. The current script exports/uploads through `xcodebuild -exportArchive`; use `IOS_BUILD_NUMBER=2 ./build-ios.sh` to upload the existing new-icon archive, or `./build-ios.sh` for the next build number.
6. **Internal testing — build assigned.** The `Internal Testing` group has build `1.0 (1)` and two testers in `INVITED` state. Confirm they receive and accept invitations, supply feedback contact and “What to Test”, install through TestFlight, and collect crash/route/audio/localization feedback. Internal testing precedes any external TestFlight group; external testing may need Beta App Review.
7. **App Store release later.** Compare uploaded screenshots with the native app, then finish App Privacy, accessibility, dedicated support information, pricing/availability, and a final content review. Submit a tested build to App Review only after owner review of the public listing.

## Android: prepare after iOS internal test

1. Create the Play Console app with package `com.event.horizon.wroclaw`; confirm account and distribution eligibility before investing in production assets.
2. Build a **release AAB**, not just the existing APK. Generate an upload key, enable Play App Signing, and keep keystore/passwords out of Git. Increase `versionCode` for each upload.
3. Run internal testing on physical Android devices. Check audio unlock, Back navigation, WebView behavior, Firebase login, orientation, memory/package size, and EN/RU/PL pages.
4. Fill store listing in EN/RU/PL, screenshots, icon/feature graphic, privacy policy, Data safety, target audience, ads declaration (“No” at launch), content rating, and app access instructions from actual behavior.
5. Recheck Google Play's target API requirement at upload time. The project currently targets API 36. Follow the account-specific testing gate if Play Console requires it, then submit production separately.

## Future analytics and purchases

- Analytics: choose events and provider only after defining purpose, retention, consent needs, and the store privacy answers. Keep the first release operational without it.
- One-time IAP: design product IDs and durable entitlements for quests/languages; implement native StoreKit/Google Play Billing, purchase restoration, error handling, cross-device rules, and a reviewable unlocked-content UX. Avoid placing purchasable content behind current free navigation before the full flow exists.
- Revisit store metadata, app privacy/Data safety, and age/content declarations when either capability is added.

## References and reusable examples

- Local examples (read only): Dino `docs/IOS_RELEASE.md`, `scripts/app-store-connect-metadata.mjs`, `scripts/ios-testflight.mjs`; Models42 `docs/IOS_TESTFLIGHT.md`, `scripts/ios-testflight.mjs`, `scripts/google-play-internal-release.mjs`. Borrow their guards and release sequence, not unrelated provider configuration.
- Apple: [upload builds](https://developer.apple.com/help/app-store-connect/manage-builds/upload-builds), [TestFlight overview](https://developer.apple.com/help/app-store-connect/test-a-beta-version/testflight-overview/), [app privacy](https://developer.apple.com/help/app-store-connect/manage-app-information/manage-app-privacy), [age rating](https://developer.apple.com/help/app-store-connect/manage-app-information/set-an-app-age-rating).
- Google: [create an app](https://support.google.com/googleplay/android-developer/answer/9859152), [Play App Signing](https://support.google.com/googleplay/android-developer/answer/9842756), [target API](https://developer.android.com/google/play/requirements/target-sdk), [Data safety](https://support.google.com/googleplay/android-developer/answer/10787469).
