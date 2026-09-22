# Android AAB signing

The upload keystore and password file live in ignored `___keys/android/`. `sign-aab.sh check` validates their presence without printing secrets; `verify` checks a built AAB signature with `jarsigner`.

```bash
make android-signing-check
make android-bundle
make android-signing-verify AAB_PATH=android/app/build/outputs/bundle/release/app-release.aab
```

The release Gradle configuration reads the local properties. `make android-bundle` fails before building if signing is absent. It does not submit anything to Google Play.
