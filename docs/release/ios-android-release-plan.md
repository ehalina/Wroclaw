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
| iOS compilation/upload | Processing done | Signed `1.0 (1)` was uploaded on 2026-09-22. App Store Connect API reports `processingState=VALID`; distribution still requires export compliance and a tester group. |
| Android compilation | Partial | `make android-debug` and `make android-release` pass with the new package ID. A signed AAB remains. |
| Automated checks | Done locally | `make audit` reports zero npm vulnerabilities and `make smoke` passes all 74 browser tests. |
| Store records | iOS record and group exist | App Store Connect confirms `Wroclaw Storywalk` / `com.event.horizon.wroclaw`. An `Internal Testing` group exists with no linked build yet. Create the Android record later. |
| Export compliance | Needs owner determination | The build has `internalBuildState=MISSING_EXPORT_COMPLIANCE`; Apple's API rejected linking it to the internal group. Review the app and included libraries, then complete Apple's encryption declaration. Do not mark the build exempt without a supported decision. |
| Release content | Needs review | BACKLOG tracks incomplete tour content and translations. Audit actual EN/RU/PL pages and routes before external testing. |
| Data practices | Needs review | Web runtime loads Firebase Auth/Firestore scripts and Google Fonts; account code can use Firestore and an IP lookup. Determine what is enabled in native builds before answering privacy forms. |
| Store assets and contacts | Needs review | The iOS icon is still the default Capacitor artwork. Replace it before public release; prepare screenshots, a public privacy policy URL, support URL/email, and licensed media inventory. |

## iOS: internal TestFlight first

1. **Account and identity — confirmed.** The app record uses `com.event.horizon.wroclaw`; the Wroclaw key authenticates with the team Issuer ID found in Models42's local App Store Connect configuration. Xcode signs with Team `AB8LFY64PF`. Keep the `.p8` file outside Git; it authenticates Apple services but is not an app signing certificate. Check pending agreements.
2. **Build readiness.** Resolve any broken first-run route, audio, orientation, online/offline, Firebase sign-in, and navigation behavior on a real iPhone and supported iPad. Audit EN/RU/PL text and missing content. Confirm media rights and icon quality. Make a fresh `make cap-sync` before archiving.
3. **Release metadata.** Draft EN/RU/PL name, subtitle, description, keywords, support/privacy URLs, copyright, and TestFlight “What to Test” text. Reuse the guarded API metadata pattern from Dino for editable text fields; inspect the remote values before any write. Set age rating, privacy answers, and export compliance from observed app behavior in App Store Connect. Do not guess “no data collected” while Firebase and IP lookup code remain available.
4. **Signed archive — done for 1.0 (1).** Xcode automatic signing used Team `AB8LFY64PF`; the generic iOS archive has the expected bundle ID, display name, version and embedded provisioning profile. Keep the archive and diagnostics outside Git; validate runtime and icon on device.
5. **Upload and processing — done.** Xcode reported `Upload succeeded` on 2026-09-22, and App Store Connect API now reports the build as `VALID`.
6. **Internal testing — group created, build blocked.** The `Internal Testing` group exists, but Apple reports `MISSING_EXPORT_COMPLIANCE` and rejected the build assignment. Complete the encryption determination, link the build, supply feedback contact and “What to Test”, add eligible internal testers, install through TestFlight, and collect crash/route/audio/localization feedback. Internal testing precedes any external TestFlight group; external testing may need Beta App Review.
7. **App Store release later.** Finish screenshots, app privacy, age rating, accessibility and support information, pricing/availability, and a final content review. Submit a tested build to App Review only after owner review of the public listing.

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
