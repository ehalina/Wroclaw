# App Store Connect metadata status

Checked and updated: 2026-09-22. App: `Wroclaw Storywalk`, bundle ID `com.event.horizon.wroclaw`, iOS version `1.0`. This file records verified remote state; [BACKLOG.md](../../BACKLOG.md) remains the task source of truth.

## Filled through the API

- Primary category **Travel**; secondary category **Education**.
- Version copyright `2026 Halina Yarmolenka`, `usesIdfa=false`, release type **Manual**. Manual release prevents automatic App Store publication after a future approval.
- English (U.S.), Russian and Polish: name, subtitle, description, keywords and promotional text. Exact text is in [config/app-store-metadata.json](../../config/app-store-metadata.json).
- TestFlight app description in all three languages.
- “What to Test” for the uploaded TestFlight build `1.0 (1)` in all three languages.
- “What to Test” for processed build `1.0 (2)` in all three languages; iOS version `1.0` is linked to this build for a future App Review submission. Linking the build did not submit the app for review.
- Added build `1.0 (2)` to the existing **Internal Testing** group. Apple returned `204`, and a follow-up group read lists builds `2` and `1`.
- Verified public Privacy Policy URL, saved for all three App Store and TestFlight localizations.
- Support URL for all three App Store localizations. It currently opens the published policy page, which includes the contact email; replace it with a dedicated support page when available.
- TestFlight feedback email in all three languages; Halina Yarmolenka's email and phone in App Review and Beta Review contact details.
- Age rating questionnaire: rare, mild historical references to realistic violence and weapons; no graphic violence, chat, user publishing, advertising, or unrestricted web access. Apple calculated `TWELVE_PLUS` for the current app info. The owner confirmed that historical violence appears only in non-scary text. Apple normalized both nonzero descriptors to `INFREQUENT_OR_MILD` in the API.
- App Store screenshots: three landscape images each for iPhone 6.9-inch and iPad 13-inch displays in English (U.S.), Russian and Polish. All 18 assets were uploaded through the API, and Apple reports `COMPLETE` for every image. The source PNGs are browser captures of the app UI and remain under ignored `artifacts/store-screenshots/`.

The write script checks the bundle ID, version, editable status, lengths and current values. It refuses to replace nonempty text that differs from the local file. It was rerun in dry-run mode after writing; the API reported no remaining differences.

```bash
# For metadata commands, set ASC_KEY_ID, ASC_ISSUER_ID, and ASC_KEY_PATH
# in your shell without printing them. The build upload script can also read
# ASC_ISSUER_ID from ignored ___keys/ios/asc.env or ___keys/ios/issuer-id.txt.
make asc-inspect
make asc-dry-run
make asc-apply
make asc-screenshots-inspect
make asc-screenshots-dry-run
make asc-screenshots-apply
```

The App Store Connect API key is ignored under `___keys/ios/`. It is never included in this metadata file or printed by the script.

## Still open

- **App Privacy answers.** The public policy is live. The runtime loads Firebase Auth/Firestore; account initialization can create an anonymous user, store username, email (if the user registers), and quest progress in Firestore. `saveUser()` requests the public IP from ipify and stores it with the user record. Answer **Yes** to data collection. The likely declarations are **User ID**, **Email Address** (optional account), **Gameplay Content** (saved quest state), and the relevant data type for the stored IP address. For each, review purpose, user linkage and tracking against actual Firebase and ipify practices before publishing. Do not select “No data collected.” The policy is generic and mentions advertising, which is not planned for this release; an app-specific update would improve accuracy.
- **Dedicated support page.** The current support URL points to the policy page because it contains the supplied contact email.
- **Age rating after content changes.** Recheck the answers if scenes, illustrations, or features change; the current questionnaire is saved.
- **App Review access.** Contact fields are set. The tour appears accessible without login, but this must be confirmed on a device before setting the demo-account answer.
- **Content rights, accessibility, pricing and regions.** Content rights and first-release price await owner confirmation; no declarations were guessed. The selected build is no longer a review blocker.
- **Screenshot validation.** The 18 iOS browser captures are uploaded and processed. Compare them with the installed native app on iPhone and iPad before App Review. The nine Android captures are for later Google Play preparation.
- **New icon build.** App Store Connect has processed `1.0 (2)` as valid. Confirm that invited internal testers can install this build and that its new icon looks correct on a device.

No public App Store submission was made.
