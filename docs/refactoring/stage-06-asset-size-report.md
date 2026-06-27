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
