# Stage 6.8 - Tumski21 sunset screenshot characterization

Дата: 2026-06-27

## Цель

Зафиксировать визуальный baseline для `tumski21.html` перед любыми изменениями `media/tumski/sunset/*`.
На этом этапе runtime assets не менялись.

## Команда

```bash
make stage-06-08-screenshots
```

Команда использует отдельный Playwright config:

- `playwright.stage-06-08.config.mjs`;
- test file: `tools/stage-06-08/sunset-characterization.spec.mjs`;
- output: `docs/refactoring/artifacts/stage-06-08-sunset/`.

Обычный `make smoke` этот characterization spec не запускает.

## Артефакты

Screenshots:

- `docs/refactoring/artifacts/stage-06-08-sunset/desktop-initial.png`;
- `docs/refactoring/artifacts/stage-06-08-sunset/desktop-after-1500ms.png`;
- `docs/refactoring/artifacts/stage-06-08-sunset/mobile-pixel5-initial.png`;
- `docs/refactoring/artifacts/stage-06-08-sunset/mobile-pixel5-after-1500ms.png`.

Measurements:

- `docs/refactoring/artifacts/stage-06-08-sunset/desktop-measurements.json`;
- `docs/refactoring/artifacts/stage-06-08-sunset/mobile-pixel5-measurements.json`.

Artifact directory size: 6.1M.

## Capture notes

The capture intentionally stubs external-only resources:

- Google Fonts are fulfilled as empty CSS;
- CDN GSAP is stubbed to avoid network dependency in CI/sandbox;
- local sunset assets are loaded through the project static server.

This keeps the capture focused on local visual assets and layout. It is not an animation timing test.

## Runtime asset findings

Visible layers on `tumski21.html`:

| Layer | Selector | Runtime background | Natural size | Loaded |
|---|---|---|---:|---|
| sky | `.layer-sky` | `media/tumski/sunset/sunset3.jpg` | 2464x1856 | yes |
| horizon | `.layer-horizon` | `media/tumski/sunset/sunset2.png` | 2464x1856 | yes |
| buildings | `.layer-buildings` | `media/tumski/sunset/sunset1.png` | 2464x1856 | yes |

Additional preload dependency:

- `sunset_parallax.js` preloads `media/tumski/sunset/sunset3.png`.
- `tumski21.html` and `tumski21.css` render the visible sky layer from `media/tumski/sunset/sunset3.jpg`.
- Therefore `sunset3.png` is a runtime preload dependency, but not the visible `tumski21` background layer.

## Layout observations

Desktop baseline:

- viewport: 1280x800;
- page container: 1077x800 centered at x=102;
- no blank scene;
- right-side controls stay outside the main visual focus.

Mobile Pixel 5 baseline:

- viewport: 393x727, device pixel ratio 2.75;
- parallax container viewport: 393x727;
- parallax scroll width: 965;
- no blank scene;
- visible controls overlay the scene but do not hide the central sunset layer.

## Console/runtime observations

No page errors were captured.

Known console message during capture:

- `Не все элементы найдены для кнопки play`

This is not new in Stage 6.8 and is unrelated to sunset asset optimization.

## Decision

Do not optimize or replace `sunset1.png` / `sunset2.png` blindly.
They are visible layered runtime assets and need before/after screenshot comparison.

`sunset3.png` should be handled as a separate Stage 6.9 candidate:

- either align preload with the visible `sunset3.jpg`;
- or keep `sunset3.png` if animation behavior depends on preloading the PNG.

## Validation

Completed:

```bash
node --check playwright.stage-06-08.config.mjs
node --check tools/stage-06-08/sunset-characterization.spec.mjs
make stage-06-08-screenshots
```

Next required validation before closing the stage:

```bash
make test
make smoke
make audit
```
