# Android upload key

```bash
make android-signing-create SIGNING_ARGS=--dry-run
make android-signing-create SIGNING_ARGS=--confirm-create
```

This creates `___keys/android/upload-keystore.jks` and `signing.properties` once. Both are ignored by Git and never overwritten by the script. Back up **both** files and their passwords before uploading to Google Play. The upload key is distinct from Play App Signing's distribution key.
