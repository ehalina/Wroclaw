# Stage 6.1 - Asset size report

Дата: 2026-06-27

## Команды

```bash
make audit
du -sh media thumbs locales www
find media -type f -exec du -k {} + | sort -nr | head -n 30
find www -type f -exec du -k {} + | sort -nr | head -n 30
find media -type f \( -iname '*.mp3' -o -iname '*.wav' -o -iname '*.mp4' \) -exec du -k {} + | sort -nr
find media -type f \( -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.png' -o -iname '*.webp' \) -exec du -k {} + | sort -nr | head -n 40
```

## Текущий размер

- `make audit` build summary: `350 files, 138.2 MB -> www/`.
- Disk usage:
  - `media`: 141M;
  - `thumbs`: 12K;
  - `locales`: 660K;
  - `www`: 158M.
- File count:
  - `media`: 194 files;
  - `www`: 350 files.

`www` больше logical build summary из-за filesystem block accounting; для package budget использовать build summary, для локального storage pressure можно смотреть `du`.

## Top source assets

| Size KB | File | Notes |
|---:|---|---|
| 10480 | `media/book/12345.psd` | source-only; excluded from `www` by build script |
| 9108 | `media/Wroclaw_Saver.mp4` | runtime reference in `katedra_panorama.html` |
| 8328 | `media/zwyki/maksim-mrvica-croatian-rhapsody.mp3` | runtime reference in SPA minsk route policy |
| 7780 | `media/krasnolud/u7173139994_Bronze_gnome_figurine_same_perspective_do_not_chang_42cebd36-ece2-491f-91b2-67f0cc47d8aa.png` | no runtime reference found in code search |
| 7380 | `media/krasnolud/u7173139994_Bronze_gnome_figurine_same_perspective_do_not_chang_f574f9f5-15cb-4d89-857e-e46a0ac1ac3d.png` | no runtime reference found in code search |
| 6380 | `media/zwyki/hang.mp3` | runtime route/audio policy |
| 6000 | `media/watercolor/22.png` | no runtime reference found; `media/watercolor/22.jpg` is referenced |
| 5088 | `media/zwyki/quest.mp3` | runtime quest audio |
| 4092 | `media/tumski/sunset/sunset1.png` | candidate for visual review before optimization |
| 3524 | `media/Wroclaw_Saver.png` | no runtime reference found in code search |
| 3248 | `media/tumski/sunset/sunset2.png` | candidate for visual review before optimization |
| 2344 | `media/book/Gemini_Generated_Image_5x2pd05x2pd05x2p.png` | no runtime reference found in code search |

## Top package assets in `www`

| Size KB | File | Notes |
|---:|---|---|
| 9280 | `www/media/zwyki/maksim-mrvica-croatian-rhapsody.mp3` | runtime audio |
| 9280 | `www/media/Wroclaw_Saver.mp4` | runtime video |
| 8256 | `www/media/krasnolud/u7173139994_Bronze_gnome_figurine_same_perspective_do_not_chang_f574f9f5-15cb-4d89-857e-e46a0ac1ac3d.png` | candidate |
| 8256 | `www/media/krasnolud/u7173139994_Bronze_gnome_figurine_same_perspective_do_not_chang_42cebd36-ece2-491f-91b2-67f0cc47d8aa.png` | candidate |
| 7232 | `www/media/zwyki/hang.mp3` | runtime audio |
| 6208 | `www/media/watercolor/22.png` | candidate |
| 5184 | `www/media/zwyki/quest.mp3` | runtime audio |
| 4160 | `www/music.mp3` | root-level asset; no runtime reference found |
| 4160 | `www/media/tumski/sunset/sunset2.png` | candidate for visual optimization |
| 4160 | `www/media/tumski/sunset/sunset1.png` | candidate for visual optimization |
| 4160 | `www/media/Wroclaw_Saver.png` | no runtime reference found |
| 3136 | `www/Gemini_Generated_Image_5x2pd05x2pd05x2p.png` | root-level duplicate/candidate |

## Runtime references observed

Likely runtime assets:

- `media/Wroclaw_Saver.mp4`: referenced from `katedra_panorama.html`.
- `media/zwyki/maksim-mrvica-croatian-rhapsody.mp3`: SPA route policy for Minsk pages.
- `media/zwyki/hang.mp3`: SPA/audio policy for `tumski21`.
- `media/zwyki/quest.mp3`: quest overlay and quest marker handlers.
- `media/zwyki/town.mp3`, `birds.mp3`, `kostel.mp3`, `bb6f2b8ec908f28.mp3`: SPA/audio/map runtime.
- `media/watercolor/22.jpg`: referenced as quest image in `tumski02.html`.

No runtime reference found in code search:

- root `music.mp3`;
- root `Gemini_Generated_Image_5x2pd05x2pd05x2p.png`;
- `media/Wroclaw_Saver.png`;
- `media/watercolor/22.png`;
- `media/book/Gemini_Generated_Image_5x2pd05x2pd05x2p.png`;
- two large `media/krasnolud/u7173139994_Bronze...png` files.

These are cleanup/package-exclusion candidates, not deletion decisions.

## Build script behavior

`scripts/build-capacitor-web.mjs` already excludes:

- `.psd`;
- `.xlsx`;
- `.textClipping`;
- `.zip`;
- `.bak` / `.backup`;
- files with ` copy.` in the basename;
- `.DS_Store`.

However, root-level runtime extensions are copied automatically, so root `music.mp3` and root `Gemini_Generated_Image_5x2pd05x2pd05x2p.png` enter `www` even though no runtime references were found.

## Initial package budget proposal

Use these as Stage 6 working budgets until after visual review:

- `www` logical build size: target below 130 MB after cleanup-only pass.
- Single unreferenced package asset: should not enter `www`.
- Runtime audio/video over 5 MB: allowed only with documented route/use.
- Runtime PNG over 2 MB: requires visual review or a smaller derivative.
- Source-only design files can remain in `media` only if build script excludes them.

## Recommended next step

Stage 6.2 should be cleanup-only for package contents:

- add explicit build exclusions for root-level unreferenced `music.mp3` and `Gemini_Generated_Image_5x2pd05x2pd05x2p.png`;
- decide whether unreferenced large `media/**` candidates should be excluded from Capacitor package before any source deletion;
- run `make build`, compare `www` size, then `make smoke`/`make audit`.

## Stage 6.2 result

Completed on 2026-06-27:

- `scripts/build-capacitor-web.mjs` now supports path-specific `excludedRuntimePaths`.
- Excluded from `www`:
  - root `music.mp3`;
  - root `Gemini_Generated_Image_5x2pd05x2pd05x2p.png`.
- Source files were not deleted.
- `media/**` was not excluded in this pass.

Build comparison:

| Metric | Before Stage 6.2 | After Stage 6.2 |
|---|---:|---:|
| Build summary files | 350 | 348 |
| Build summary size | 138.2 MB | 132.3 MB |
| `du -sh www` | 158M | 151M |

Validation:

```bash
make build
make test
make smoke
```

All passed.

## Stage 6.10 result

Completed on 2026-06-27:

- Created `docs/refactoring/stage-06-10-audio-route-use-review.md`.
- Reviewed source/package audio sizes.
- Mapped heavy MP3 files to route/use owners.
- Confirmed that heavy MP3 files are runtime assets, not unused package cleanup candidates.
- Identified duplicate packaged WAV candidates for a later cleanup-only guard step:
  - `media/zwyki/opening-a-book.wav`;
  - `media/zwyki/step.wav`.

Package baseline remains `333 files, 87.0 MB -> www/`.

Decision:

- Do not compress audio blindly.
- Do not exclude heavy MP3 files without a playback/lifecycle-specific change.
- Prefer a small duplicate-WAV package cleanup before larger audio lifecycle refactors.

## Stage 6.11 result

Completed on 2026-06-27:

- Added duplicate effect WAV copies to `excludedRuntimePaths`:
  - `media/zwyki/opening-a-book.wav`;
  - `media/zwyki/step.wav`.
- Kept source files in the repository.
- Kept runtime root effect files packaged:
  - `media/opening-a-book.wav`;
  - `media/step.wav`.

Build comparison:

| Metric | Before Stage 6.11 | After Stage 6.11 |
|---|---:|---:|
| Build summary files | 333 | 331 |
| Build summary size | 87.0 MB | 86.9 MB |
| `du -sh www` | 99M | 99M |

Validation:

```bash
node --check scripts/build-capacitor-web.mjs
make build
```

Both passed.

## Stage 6.12 result

Completed on 2026-06-27:

- Created `docs/refactoring/stage-06-12-audio-lifecycle-refactor-plan.md`.
- No runtime/package behavior changed.
- Package baseline remains `331 files, 86.9 MB -> www/`.

Next code stage:

- extract audio source URL policy to `spa_config.js` before changing eager preload behavior.

## Stage 6.13 result

Completed on 2026-06-27:

- Moved SPA track source URL policy into `spa_config.js`.
- Updated `index.html` to use `getAudioSourceForTrack()` through a local compatibility wrapper.
- No package files changed.
- Package baseline remains `331 files, 86.9 MB -> www/`.

## Stage 6.14 result

Completed on 2026-06-27:

- Created `docs/refactoring/stage-06-14-audio-lifecycle-characterization.md`.
- Added `make stage-06-14-audio`.
- Captured desktop/mobile JSON artifacts for current `preloadBackgroundMusic()` behavior.
- Confirmed current eager method behavior constructs/loads `birds`, `kostel`, `hang`, and `quest`.
- Package baseline remains `331 files, 86.9 MB -> www/`.

## Stage 6.15 result

Completed on 2026-06-27:

- Created `docs/refactoring/stage-06-15-lazy-audio-preload.md`.
- Changed `preloadBackgroundMusic()` from eager `Audio(...).load()` calls to lazy bookkeeping.
- Added `make stage-06-15-audio`.
- Captured desktop/mobile artifacts showing no route-specific construct/load calls for `birds`, `kostel`, `hang`, `quest`.
- Package baseline remains `331 files, 86.9 MB -> www/`.

## Stage 6.17 result

Completed on 2026-06-27:

- Created lossless WebP runtime derivatives for visible sunset parallax alpha layers:
  - `media/tumski/sunset/sunset1.webp`;
  - `media/tumski/sunset/sunset2.webp`.
- Switched `tumski21` and standalone sunset demo runtime references to WebP.
- Excluded source PNG originals from Capacitor `www`:
  - `media/tumski/sunset/sunset1.png`;
  - `media/tumski/sunset/sunset2.png`.
- Stage 6.17 screenshot similarity against Stage 6.8 baseline passed with scores `92.32`-`93.82`.

Build comparison:

| Metric | Before Stage 6.17 | After Stage 6.17 |
|---|---:|---:|
| Build summary files | 331 | 331 |
| Build summary size | 86.8 MB | 84.5 MB |

Validation:

```bash
make stage-06-17-sunset-webp
make build
```

## Stage 6.18 result

Completed on 2026-06-27:

- Created `docs/refactoring/stage-06-18-scene-jpg-characterization.md`.
- Added `make stage-06-18-scene-jpg-screenshots`.
- Captured desktop/mobile baseline screenshots and measurements for:
  - `tumski11.html` / `media/tumski/tumski_11.jpg` (source size 1380 KB, natural size 2528x1920);
  - `dwor01.html` / `media/tumski/dwor_01.jpg` (source size 1296 KB, natural size 2688x1792);
  - `tumski14.html` / `media/tumski/tumski_14.jpg` (source size 1096 KB, natural size 3136x1536).
- No runtime asset paths changed.
- No package size change: current build baseline remains `331 files, 84.5 MB -> www/`.

Validation:

```bash
node --check playwright.stage-06-18.config.mjs
node --check tools/stage-06-18/scene-jpg-characterization.spec.mjs
make stage-06-18-scene-jpg-screenshots
```

## Stage 6.19 result

Completed on 2026-06-27:

- Created `docs/refactoring/stage-06-19-tumski11-webp-poc.md`.
- Added `make stage-06-19-tumski11-webp-poc`.
- Generated WebP candidates for `media/tumski/tumski_11.jpg` in artifacts only.
- Rejected WebP runtime switch:
  - q75 saves size but direct similarity is only `65.11`;
  - q85/q85-ICC direct similarity is `74.31`;
  - q90 is larger than the source and still only scores `82.24`;
  - screenshot q85-ICC comparison scored `61.10` desktop and `34.35` mobile.
- No runtime asset paths changed.
- No package size change: current build baseline remains `331 files, 84.5 MB -> www/`.

## Stage 6.3 result

Completed on 2026-06-27:

- Added a build-time reference guard for `excludedRuntimePaths`.
- The guard scans runtime source files (`.html`, `.css`, `.js`, `.json`, plus `locales`) before copying to `www`.
- If an excluded runtime path becomes referenced again, `make build` fails before producing a broken package.

Validation:

```bash
make build
```

Result: `348 files, 132.3 MB -> www/`.

## Stage 6.4 result

Completed on 2026-06-27:

- Large unreferenced `media/**` candidates were excluded from the Capacitor package through `excludedRuntimePaths`.
- Source files were not deleted.
- The existing reference guard protects the exclusions from future explicit runtime references.

Excluded from `www`:

- `media/Wroclaw_Saver.png`;
- `media/book/Gemini_Generated_Image_5x2pd05x2pd05x2p.png`;
- `media/krasnolud/u7173139994_Bronze_gnome_figurine_same_perspective_do_not_chang_42cebd36-ece2-491f-91b2-67f0cc47d8aa.png`;
- `media/krasnolud/u7173139994_Bronze_gnome_figurine_same_perspective_do_not_chang_f574f9f5-15cb-4d89-857e-e46a0ac1ac3d.png`;
- `media/watercolor/22.png`.

Confirmed still packaged:

- `media/Wroclaw_Saver.mp4`;
- `media/watercolor/22.jpg`;
- `media/zwyki/maksim-mrvica-croatian-rhapsody.mp3`.

Build comparison:

| Metric | Before Stage 6.4 | After Stage 6.4 |
|---|---:|---:|
| Build summary files | 348 | 343 |
| Build summary size | 132.3 MB | 105.9 MB |
| `du -sh www` | 151M | 122M |

Validation:

```bash
make build
make test
make smoke
```

All passed.

## Stage 6.5 result

Completed on 2026-06-27:

- `scripts/build-capacitor-web.mjs` now enforces a `120 MB` logical package budget.
- The guard runs after `www` is copied and summarized.
- If the budget is exceeded, `make build` fails with the actual size and configured limit.

Current result:

```bash
make build
```

Result: `343 files, 105.9 MB -> www/`.

## Stage 6.6 result

Completed on 2026-06-27:

- Additional package-only cleanup was applied to large `media/krasnolud` PNG assets.
- No source files were deleted.
- No explicit runtime references were found for the excluded `Gemini_Generated_Image_*.png` and screenshot PNG files.
- `gnome_marker_handler.js` default runtime image convention remains `media/krasnolud/krasnal_<page>.jpg`.

Excluded from `www`:

- `media/krasnolud/Gemini_Generated_Image_1q2txm1q2txm1q2t.png`;
- `media/krasnolud/Gemini_Generated_Image_1v0m2q1v0m2q1v0m.png`;
- `media/krasnolud/Gemini_Generated_Image_1v8dfm1v8dfm1v8d.png`;
- `media/krasnolud/Gemini_Generated_Image_7lker47lker47lke.png`;
- `media/krasnolud/Gemini_Generated_Image_axo74iaxo74iaxo7.png`;
- `media/krasnolud/Gemini_Generated_Image_v3t5jnv3t5jnv3t5.png`;
- `media/krasnolud/Gemini_Generated_Image_vtmv4vvtmv4vvtmv.png`;
- `media/krasnolud/Gemini_Generated_Image_xal0grxal0grxal0.png`;
- `media/krasnolud/Снимок экрана 2026-01-25 в 18.04.04.png`.

Confirmed still packaged:

- `media/krasnolud/krasnal_tumski.jpg`;
- `media/krasnolud/krasnal_tumski032.jpg`;
- `media/krasnolud/koza.jpg`;
- existing runtime audio/video and `media/tumski/sunset/*.png`.

Build comparison:

| Metric | Before Stage 6.6 | After Stage 6.6 |
|---|---:|---:|
| Build summary files | 343 | 334 |
| Build summary size | 105.9 MB | 89.0 MB |
| `du -sh www` | 122M | 101M |

Validation:

```bash
make build
```

Result: `334 files, 89.0 MB -> www/`.

## Stage 6.7 result

Completed on 2026-06-27:

- Created `docs/refactoring/stage-06-runtime-asset-optimization-policy.md`.
- Current package baseline after cleanup remains `334 files, 89.0 MB -> www/`.
- Remaining heavy assets are treated as runtime assets, not cleanup candidates:
  - `media/zwyki/maksim-mrvica-croatian-rhapsody.mp3`;
  - `media/Wroclaw_Saver.mp4`;
  - `media/zwyki/hang.mp3`;
  - `media/zwyki/quest.mp3`;
  - `media/tumski/sunset/sunset1.png`;
  - `media/tumski/sunset/sunset2.png`;
  - `media/tumski/sunset/sunset3.png`.
- Future optimization must use derivative assets plus screenshot/audio review; source originals must not be overwritten blindly.

## Stage 6.8 result

Completed on 2026-06-27:

- Created `docs/refactoring/stage-06-08-sunset-characterization.md`.
- Captured desktop/mobile screenshots for `tumski21.html` before changing sunset assets.
- Artifact directory: `docs/refactoring/artifacts/stage-06-08-sunset/` (6.1M).
- No runtime assets were changed in this stage.

Key asset finding:

- Visible `tumski21.html` sky layer uses `media/tumski/sunset/sunset3.jpg`.
- `sunset_parallax.js` still preloads `media/tumski/sunset/sunset3.png`.
- Therefore `sunset3.png` is a runtime preload dependency, but not the visible `tumski21` background layer.

Validation:

```bash
make stage-06-08-screenshots
```

Result: 2 Playwright characterization tests passed (desktop and mobile).

## Stage 6.9 result

Completed on 2026-06-27:

- Aligned `sunset_parallax.js` preload list with the visible `tumski21.html` sky asset:
  - before: `media/tumski/sunset/sunset3.png`;
  - after: `media/tumski/sunset/sunset3.jpg`.
- Aligned standalone `sunset_parallax.html` demo sky layer and info text with `sunset3.jpg`.
- Added `media/tumski/sunset/sunset3.png` to `excludedRuntimePaths`.
- Kept source original `media/tumski/sunset/sunset3.png` in the repository.
- Refined the package reference guard so it scans only reference files that are packaged into `www`.

Build comparison:

| Metric | Before Stage 6.9 | After Stage 6.9 |
|---|---:|---:|
| Build summary files | 334 | 333 |
| Build summary size | 89.0 MB | 87.0 MB |
| `du -sh www` | 101M | 99M |

Validation:

```bash
node --check sunset_parallax.js
node --check scripts/build-capacitor-web.mjs
make build
```

All passed.
