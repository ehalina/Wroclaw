# Launcher icons

`resources/icon-source.png` is the single opaque square master (at least 1024 px). The current illustration was made for Wroclaw Storywalk using the project's Wroclaw watercolor as a visual reference.

```bash
make icons-dry-run
make icons
```

The wrapper scripts `ios-icons.sh` and `android-icons.sh` run the same generator for one platform. The iOS output is a 1024 px App Store icon; Android gets launcher and adaptive foreground PNGs for all five densities. Inspect the resulting launcher at small size and with the Android adaptive mask. Rebuild and upload a **new build number** after changing a released icon.
