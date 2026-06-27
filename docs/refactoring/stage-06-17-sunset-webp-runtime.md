# Stage 6.17 - Sunset WebP Runtime Derivatives

Date: 2026-06-27

## Goal

Reduce packaged runtime size for visible `tumski21` sunset parallax layers without overwriting source PNG originals.

## Decision

Use lossless WebP derivatives for the two alpha PNG runtime layers:

- `media/tumski/sunset/sunset1.webp` from `sunset1.png`;
- `media/tumski/sunset/sunset2.webp` from `sunset2.png`.

The q90 lossy WebP trial was rejected because mobile screenshot similarity scored below the Stage 6.17 threshold.

## Size Impact

| Asset | Before | After |
|---|---:|---:|
| `sunset1` runtime layer | 4.0M PNG | 2.6M WebP |
| `sunset2` runtime layer | 3.2M PNG | 2.2M WebP |

Package build summary:

| Metric | Before Stage 6.17 | After Stage 6.17 |
|---|---:|---:|
| Build summary files | 331 | 331 |
| Build summary size | 86.8 MB | 84.5 MB |

Packaged sunset directory now contains:

```text
sunset1.webp
sunset2.webp
sunset3.jpg
```

Source originals remain in the repository and are excluded from Capacitor `www`:

- `media/tumski/sunset/sunset1.png`;
- `media/tumski/sunset/sunset2.png`;
- `media/tumski/sunset/sunset3.png`.

## Runtime Changes

- `tumski21.html` and `tumski21.css` use `sunset1.webp` / `sunset2.webp`.
- `sunset_parallax.html` uses `sunset1.webp` / `sunset2.webp`.
- `sunset_parallax.js` preloads `sunset1.webp` / `sunset2.webp`.
- `scripts/build-capacitor-web.mjs` excludes the PNG originals from the package.

## Visual Validation

Command:

```bash
make stage-06-17-sunset-webp
```

Artifacts:

- `docs/refactoring/artifacts/stage-06-17-sunset-webp/desktop-initial.png`;
- `docs/refactoring/artifacts/stage-06-17-sunset-webp/desktop-after-1500ms.png`;
- `docs/refactoring/artifacts/stage-06-17-sunset-webp/mobile-pixel5-initial.png`;
- `docs/refactoring/artifacts/stage-06-17-sunset-webp/mobile-pixel5-after-1500ms.png`;
- `docs/refactoring/artifacts/stage-06-17-sunset-webp/similarity-report.json`.

Similarity against Stage 6.8 baseline, minimum score 90:

| Screenshot | Score |
|---|---:|
| desktop initial | 93.79 |
| desktop after 1500ms | 93.82 |
| mobile Pixel 5 initial | 92.32 |
| mobile Pixel 5 after 1500ms | 92.46 |

## Validation

```bash
node --check sunset_parallax.js
node --check tools/stage-06-08/sunset-characterization.spec.mjs
node --check tools/stage-06-17/compare-sunset-screenshots.mjs
node --check scripts/build-capacitor-web.mjs
make stage-06-17-sunset-webp
make build
```
