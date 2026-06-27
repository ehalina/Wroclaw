# Stage 6.19 - Tumski11 WebP candidate POC

Дата: 2026-06-27

## Цель

Проверить один scene JPG derivative перед runtime switch: `media/tumski/tumski_11.jpg`.
Этот этап намеренно не меняет runtime CSS/HTML и не добавляет candidate в `media/`, чтобы `make build` не начал паковать непроверенный asset.

## Candidate assets

Candidates сохранены только в artifacts:

| Asset | Size | Direct decoded SSIMULACRA2 vs source | Result |
|---|---:|---:|---|
| `media/tumski/tumski_11.jpg` | 1.3M | baseline | keep runtime |
| `docs/refactoring/artifacts/stage-06-19-tumski11-webp/tumski_11-q75.webp` | 908K | 65.11 | rejected |
| `docs/refactoring/artifacts/stage-06-19-tumski11-webp/tumski_11-q85.webp` | 1.3M | 74.31 | rejected |
| `docs/refactoring/artifacts/stage-06-19-tumski11-webp/tumski_11-q85-icc.webp` | 1.3M | 74.31 | rejected |
| `docs/refactoring/artifacts/stage-06-19-tumski11-webp/tumski_11-q90.webp` | 1.6M | 82.24 | rejected, larger than source |

## Изменения

- Добавлен `playwright.stage-06-19.config.mjs`.
- Добавлен `tools/stage-06-19/tumski11-webp-candidate.spec.mjs`.
- Добавлен `tools/stage-06-19/compare-tumski11-screenshots.mjs`.
- Добавлен Makefile target `make stage-06-19-tumski11-webp-poc`.
- Runtime references to `media/tumski/tumski_11.jpg` were not changed.

## Screenshot gate

Final screenshot gate used `tumski_11-q85-icc.webp` because it preserves ICC metadata and is not larger than the original.
The candidate is injected only inside Playwright:

- page: `tumski11.html`;
- selector: `.image`;
- candidate: `docs/refactoring/artifacts/stage-06-19-tumski11-webp/tumski_11-q85-icc.webp`;
- baseline screenshots: `docs/refactoring/artifacts/stage-06-18-scene-jpg/*-tumski11.png`;
- threshold: `90`.

Final report:

| Screenshot | Score | Result |
|---|---:|---|
| `desktop-tumski11.png` | 61.10 | FAIL |
| `mobile-pixel5-tumski11.png` | 34.35 | FAIL |

Report file:

- `docs/refactoring/artifacts/stage-06-19-tumski11-webp/similarity-report.json`

## Decision

Do not switch `tumski_11.jpg` to WebP in runtime.

Reasons:

- Q75 saves package weight but fails visual similarity badly.
- Q85/Q85+ICC has little or no useful package saving and still fails visual similarity.
- Q90 is larger than the source JPG and still fails the threshold.

## Validation

```bash
node --check playwright.stage-06-19.config.mjs
node --check tools/stage-06-19/tumski11-webp-candidate.spec.mjs
node --check tools/stage-06-19/compare-tumski11-screenshots.mjs
make stage-06-19-tumski11-webp-poc
```

Result:

- Playwright candidate screenshot capture passed on desktop/mobile.
- Comparison report recorded expected failures with `allowFailures: true`.
- No runtime files changed, no package baseline change expected.

## Next safe step

Do not continue scene JPG WebP conversion as a blind batch.
Next Stage 6 work should either use a better image-specific strategy with a strict visual gate, or move to the video review for `media/Wroclaw_Saver.mp4`.
