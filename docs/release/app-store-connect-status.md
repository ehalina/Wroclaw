# App Store Connect metadata status

Checked and updated: 2026-09-22. App: `Wroclaw Storywalk`, bundle ID `com.event.horizon.wroclaw`, iOS version `1.0`. This file records verified remote state; [BACKLOG.md](../../BACKLOG.md) remains the task source of truth.

## Filled through the API

- Primary category **Travel**; secondary category **Education**.
- Version copyright `2026 Halina Yarmolenka`, `usesIdfa=false`, release type **Manual**. Manual release prevents automatic App Store publication after a future approval.
- English (U.S.), Russian and Polish: name, subtitle, description, keywords and promotional text. Exact text is in [config/app-store-metadata.json](../../config/app-store-metadata.json).
- TestFlight app description in all three languages.
- “What to Test” for the uploaded TestFlight build `1.0 (1)` in all three languages.

The write script checks the bundle ID, version, editable status, lengths and current values. It refuses to replace nonempty text that differs from the local file. It was rerun in dry-run mode after writing; the API reported no remaining differences.

```bash
# Set ASC_KEY_ID, ASC_ISSUER_ID, and ASC_KEY_PATH in your shell without printing them.
make asc-inspect
make asc-dry-run
make asc-apply
```

The App Store Connect API key is ignored under `___keys/ios/`. It is never included in this metadata file or printed by the script.

## Still open

- **Public Privacy Policy URL and App Privacy answers.** The guessed GitHub Pages path `/Wroclaw/privacy.html` returns 404. The app loads Firebase Auth/Firestore; account initialization can create an anonymous user, save username/quest progress to Firestore, and request the public IP from ipify. Do not declare “no data collected” without a full data-flow review and policy.
- **Support URL and email.** The project has no verified public support page or designated support mailbox. The owner was asked for these.
- **Age rating.** Historical content includes descriptions of war and torture; review Apple's current questionnaire against all content before answering. No rating was submitted.
- **App Review contact and access.** Contact name, email and phone are required for review. The tour appears accessible without login, but this must be confirmed on a device before setting the demo-account answer.
- **Content rights, accessibility, pricing and regions.** These require owner decisions or verification; no declarations were guessed.
- **Screenshots.** The 27 browser-captured candidate images under ignored `artifacts/store-screenshots/` need native rendering and editorial review before upload.
- **New icon build.** TestFlight currently has `1.0 (1)` with the old icon. Local `1.0 (2)` contains the new icon but has not been uploaded.

No public App Store submission was made.
