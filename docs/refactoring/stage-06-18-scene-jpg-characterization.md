# Stage 6.18 - Scene JPG characterization

Дата: 2026-06-27

## Цель

Зафиксировать визуальный baseline для крупнейших runtime scene JPG перед любыми derivative/compression изменениями.
Этот этап не меняет runtime assets и не должен менять размер `www`.

## Scope

Взяты первые три runtime scene JPG по текущему source size inventory:

| Source size | Asset | Primary page | Extra runtime references |
|---:|---|---|---|
| 1380 KB | `media/tumski/tumski_11.jpg` | `tumski11.html` | `tumski06.css`, `ogrod07.css` |
| 1296 KB | `media/tumski/dwor_01.jpg` | `dwor01.html` | `pk02.html`, `arrow_handlers.js` transition previews |
| 1096 KB | `media/tumski/tumski_14.jpg` | `tumski14.html` | `tumski11.css`, `arrow_handlers.js` transition previews |

## Изменения

- Добавлен `playwright.stage-06-18.config.mjs`.
- Добавлен `tools/stage-06-18/scene-jpg-characterization.spec.mjs`.
- Добавлен Makefile target `make stage-06-18-scene-jpg-screenshots`.
- Созданы desktop/mobile artifacts в `docs/refactoring/artifacts/stage-06-18-scene-jpg/`.

## Artifacts

Screenshots:

- `docs/refactoring/artifacts/stage-06-18-scene-jpg/desktop-tumski11.png`;
- `docs/refactoring/artifacts/stage-06-18-scene-jpg/desktop-dwor01.png`;
- `docs/refactoring/artifacts/stage-06-18-scene-jpg/desktop-tumski14.png`;
- `docs/refactoring/artifacts/stage-06-18-scene-jpg/mobile-pixel5-tumski11.png`;
- `docs/refactoring/artifacts/stage-06-18-scene-jpg/mobile-pixel5-dwor01.png`;
- `docs/refactoring/artifacts/stage-06-18-scene-jpg/mobile-pixel5-tumski14.png`.

Measurements:

- `docs/refactoring/artifacts/stage-06-18-scene-jpg/desktop-measurements.json`;
- `docs/refactoring/artifacts/stage-06-18-scene-jpg/mobile-pixel5-measurements.json`.

## Measurements summary

| Project | Page | Loaded asset | Natural size |
|---|---|---|---|
| desktop | `tumski11.html` | `media/tumski/tumski_11.jpg` | 2528x1920 |
| desktop | `dwor01.html` | `media/tumski/dwor_01.jpg` | 2688x1792 |
| desktop | `tumski14.html` | `media/tumski/tumski_14.jpg` | 3136x1536 |
| mobile-pixel5 | `tumski11.html` | `media/tumski/tumski_11.jpg` | 2528x1920 |
| mobile-pixel5 | `dwor01.html` | `media/tumski/dwor_01.jpg` | 2688x1792 |
| mobile-pixel5 | `tumski14.html` | `media/tumski/tumski_14.jpg` | 3136x1536 |

Observed baseline:

- `pageErrors`: `0` in both projects.
- `consoleMessages`: existing `Не все элементы найдены для кнопки play` appears once per page in both projects.

## Validation

```bash
node --check playwright.stage-06-18.config.mjs
node --check tools/stage-06-18/scene-jpg-characterization.spec.mjs
make stage-06-18-scene-jpg-screenshots
```

Result:

- 2 Playwright characterization tests passed: desktop and mobile Pixel 5.
- All expected `.image` background JPGs loaded and matched the target asset paths.

## Next safe step

Stage 6.19 should create a derivative for one scene JPG first, likely `media/tumski/tumski_11.jpg`, then compare against this Stage 6.18 baseline on desktop/mobile before changing more scene files.
