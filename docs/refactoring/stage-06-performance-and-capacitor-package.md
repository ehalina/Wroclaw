# Stage 6 - Performance и Capacitor package

## Цель

Снизить вес сборки и стабилизировать поведение в WebView без ухудшения визуального качества.

## Контекст

Стартовый Stage 6 baseline: `make build` собирал `www/` размером `350 files, 138.2 MB -> www/`.
После cleanup-only package exclusions текущий baseline: `334 files, 89.0 MB -> www/`.
В `BACKLOG.md` Performance Optimization уже находится в активных задачах Phase 2.

## Scope

Входит:

- inventory тяжелых ассетов;
- проверка неиспользуемых runtime файлов;
- image optimization plan;
- lazy/preload policy;
- audio lifecycle review;
- loading states;
- Capacitor smoke.

Не входит:

- потеря качества ключевых изображений без review;
- удаление ассетов без доказательства неиспользования;
- изменение художественного направления.

## Шаги

1. Составить asset size report.
   - Топ изображений по размеру.
   - Топ аудио по размеру.
   - Что попадает в `www`.
   - Что реально referenced.

2. Разделить assets по назначению.
   - Background/fullscreen;
   - thumbnails;
   - icons/UI;
   - book/quest art;
   - audio;
   - unused candidates.

3. Ввести package budget.
   - Общий размер `www`;
   - размер critical path;
   - max размер одного изображения;
   - исключения с причиной.

4. Оптимизировать изображения партиями.
   - Сначала obvious duplicates/unreferenced.
   - Потом thumbnails.
   - Потом fullscreen assets с screenshot comparison.

5. Проверить loading states.
   - На медленной загрузке не должно быть пустого экрана.
   - Ошибки ассетов должны быть диагностируемыми.

6. Проверить audio lifecycle.
   - Audio unlock;
   - route transition;
   - stop/pause per page;
   - отсутствие дублированных audio nodes после SPA navigation.

7. Capacitor validation.
   - Web build;
   - mobile viewport;
   - Android/iOS build only when requested and environment ready.

## Проверки

```bash
make test
make build
make security
```

Дополнительно:

- asset size report before/after;
- browser screenshot comparison для оптимизированных сцен;
- mobile viewport smoke;
- audio unlock smoke.

## Done

- Есть понятный asset budget.
- `www/` стал меньше или имеет документированное объяснение размера.
- Нет active missing assets.
- Loading states покрывают медленные загрузки.
- Audio behavior не регрессировал.

## Stop signals

- Невозможно визуально проверить оптимизированные изображения.
- Сжатие портит ключевые сцены.
- Capacitor build требует внешних действий/подписей/SDK, не готовых в окружении.

## Status Update - 2026-06-27 - Stage 6.1

Stage 6.1 выполнен:

- Создан `docs/refactoring/stage-06-asset-size-report.md`.
- Зафиксирован текущий build baseline: `350 files, 138.2 MB -> www/`.
- Зафиксирован disk usage baseline: `media` 141M, `www` 158M, `locales` 660K, `thumbs` 12K.
- Составлены top source/package assets по размеру.
- Отделены runtime-heavy assets от cleanup/package-exclusion candidates.
- Подтверждено, что build script уже исключает `.psd`, `.xlsx`, `.textClipping`, `.DS_Store`, backup/log/archive типы и ` copy.` assets.
- Найдены root-level package candidates без runtime refs: `music.mp3`, `Gemini_Generated_Image_5x2pd05x2pd05x2p.png`.
- Найдены крупные `media/**` candidates без runtime refs, которые нельзя удалять без отдельного decision gate.

Следующий подэтап:

- Stage 6.2: cleanup-only package exclusion для root-level unreferenced assets и, возможно, явный allowlist/denylist для крупных unreferenced media candidates без source deletion.

## Status Update - 2026-06-27 - Stage 6.2

Stage 6.2 выполнен:

- В `scripts/build-capacitor-web.mjs` добавлен path-specific `excludedRuntimePaths`.
- Из Capacitor `www/` исключены только root-level assets без runtime refs:
  - `music.mp3`;
  - `Gemini_Generated_Image_5x2pd05x2pd05x2p.png`.
- Source files не удалялись.
- `media/**` пока не исключался, чтобы не рисковать динамическими/контентными ссылками без отдельного decision gate.
- Build baseline улучшен:
  - было: `350 files, 138.2 MB -> www/`;
  - стало: `348 files, 132.3 MB -> www/`;
  - disk usage `www`: 151M.
- Проверки после изменения: `make build`, `make test`, `make smoke` прошли; smoke остаётся 44 теста на desktop/mobile.

Следующий подэтап:

- Stage 6.3: добавить package reference guard или build-time report для excluded candidates, затем решать, можно ли исключать крупные `media/**` candidates без source deletion.

## Status Update - 2026-06-27 - Stage 6.3

Stage 6.3 выполнен:

- В `scripts/build-capacitor-web.mjs` добавлен build-time guard `assertExcludedRuntimePathsUnreferenced()`.
- Guard сканирует runtime source files (`.html`, `.css`, `.js`, `.json`, плюс `locales`) и падает, если явно исключённый runtime path снова появился как ссылка.
- Это защищает `excludedRuntimePaths` от тихой регрессии: нельзя случайно сослаться на asset, который build script исключает из `www`.
- `make build` прошёл и сохранил baseline `348 files, 132.3 MB -> www/`.

Следующий подэтап:

- Stage 6.4: decision gate для крупных unreferenced `media/**` candidates. Варианты: оставить как source-only debt, исключить из package через path list с guard/report, или готовить визуальный review перед image optimization.

## Status Update - 2026-06-27 - Stage 6.4

Stage 6.4 выполнен:

- Decision gate принят в пользу cleanup-only package exclusion через `excludedRuntimePaths` с уже существующим reference guard.
- Source files не удалялись.
- Из Capacitor `www/` дополнительно исключены крупные `media/**` candidates без найденных runtime refs:
  - `media/Wroclaw_Saver.png`;
  - `media/book/Gemini_Generated_Image_5x2pd05x2pd05x2p.png`;
  - `media/krasnolud/u7173139994_Bronze_gnome_figurine_same_perspective_do_not_chang_42cebd36-ece2-491f-91b2-67f0cc47d8aa.png`;
  - `media/krasnolud/u7173139994_Bronze_gnome_figurine_same_perspective_do_not_chang_f574f9f5-15cb-4d89-857e-e46a0ac1ac3d.png`;
  - `media/watercolor/22.png`.
- Проверено, что runtime assets остаются в пакете:
  - `media/Wroclaw_Saver.mp4`;
  - `media/watercolor/22.jpg`;
  - `media/zwyki/maksim-mrvica-croatian-rhapsody.mp3`.
- Build baseline улучшен:
  - было после Stage 6.3: `348 files, 132.3 MB -> www/`;
  - стало: `343 files, 105.9 MB -> www/`;
  - disk usage `www`: 122M.
- Проверки после изменения: `make build`, `make test`, `make smoke` прошли; smoke остаётся 44 теста на desktop/mobile.

Следующий подэтап:

- Stage 6.5: закрепить package budget guard, чтобы `www` не вырос обратно без явного решения.

## Status Update - 2026-06-27 - Stage 6.5

Stage 6.5 выполнен:

- В `scripts/build-capacitor-web.mjs` добавлен package budget guard.
- Текущий лимит: `120 MB` logical build size.
- `make build` теперь завершится ошибкой, если итоговый `www` превысит budget.
- Текущий build проходит budget: `343 files, 105.9 MB -> www/`.

Следующий подэтап:

- Stage 6.6: переходить к visual-review-safe optimization policy для крупных runtime PNG/audio/video или к loading/audio lifecycle review из Stage 6 scope.

## Status Update - 2026-06-27 - Stage 6.6

Stage 6.6 выполнен:

- Проведён дополнительный cleanup-only audit `media/krasnolud`.
- Подтверждено, что runtime gnome handler строит default images как `media/krasnolud/krasnal_<page>.jpg`, а крупные `Gemini_Generated_Image_*.png` и screenshot PNG не имеют явных runtime refs.
- Из Capacitor `www/` дополнительно исключены source-only gnome PNG:
  - `media/krasnolud/Gemini_Generated_Image_1q2txm1q2txm1q2t.png`;
  - `media/krasnolud/Gemini_Generated_Image_1v0m2q1v0m2q1v0m.png`;
  - `media/krasnolud/Gemini_Generated_Image_1v8dfm1v8dfm1v8d.png`;
  - `media/krasnolud/Gemini_Generated_Image_7lker47lker47lke.png`;
  - `media/krasnolud/Gemini_Generated_Image_axo74iaxo74iaxo7.png`;
  - `media/krasnolud/Gemini_Generated_Image_v3t5jnv3t5jnv3t5.png`;
  - `media/krasnolud/Gemini_Generated_Image_vtmv4vvtmv4vvtmv.png`;
  - `media/krasnolud/Gemini_Generated_Image_xal0grxal0grxal0.png`;
  - `media/krasnolud/Снимок экрана 2026-01-25 в 18.04.04.png`.
- Source files не удалялись.
- Проверено, что runtime gnome assets остаются в пакете: `krasnal_*.jpg`, `koza.jpg`.
- Build baseline улучшен:
  - было после Stage 6.4/6.5: `343 files, 105.9 MB -> www/`;
  - стало: `334 files, 89.0 MB -> www/`;
  - disk usage `www`: 101M.

Следующий подэтап:

- Stage 6.7: visual-review-safe optimization policy для оставшихся runtime-heavy assets: audio/video, `sunset*.png`, map/book/tumski images.

## Status Update - 2026-06-27 - Stage 6.7

Stage 6.7 выполнен:

- Создан `docs/refactoring/stage-06-runtime-asset-optimization-policy.md`.
- Зафиксирован текущий post-cleanup baseline: `334 files, 89.0 MB -> www/`, disk usage `www` 101M.
- Выделены оставшиеся top runtime-heavy groups:
  - audio/video: `maksim-mrvica-croatian-rhapsody.mp3`, `Wroclaw_Saver.mp4`, `hang.mp3`, `quest.mp3`;
  - visual assets: `sunset1.png`, `sunset2.png`, `sunset3.png`, крупнейшие scene JPG.
- Принято правило: не переписывать originals, не оптимизировать визуальные assets без desktop/mobile screenshot comparison, не трогать audio/video без route/use review.

Следующий подэтап:

- Stage 6.8: screenshot-only characterization для `tumski21.html` sunset assets перед любой заменой или сжатием PNG.

## Status Update - 2026-06-27 - Stage 6.8

Stage 6.8 выполнен:

- Создан `docs/refactoring/stage-06-08-sunset-characterization.md`.
- Добавлен отдельный Playwright config `playwright.stage-06-08.config.mjs`.
- Добавлен characterization spec `tools/stage-06-08/sunset-characterization.spec.mjs`.
- Добавлен Makefile target `make stage-06-08-screenshots`.
- Сняты baseline screenshots desktop/mobile для `tumski21.html`:
  - `docs/refactoring/artifacts/stage-06-08-sunset/desktop-initial.png`;
  - `docs/refactoring/artifacts/stage-06-08-sunset/desktop-after-1500ms.png`;
  - `docs/refactoring/artifacts/stage-06-08-sunset/mobile-pixel5-initial.png`;
  - `docs/refactoring/artifacts/stage-06-08-sunset/mobile-pixel5-after-1500ms.png`.
- Зафиксировано, что видимые слои `tumski21.html` используют:
  - `sunset3.jpg` для sky;
  - `sunset2.png` для horizon;
  - `sunset1.png` для buildings.
- Зафиксировано, что `sunset3.png` сейчас является preload dependency в `sunset_parallax.js`, но не видимым background layer на `tumski21.html`.

Следующий подэтап:

- Stage 6.9: решить и проверить маленькую правку по `sunset3.png` preload dependency: выровнять preload с `sunset3.jpg` или явно оставить PNG как runtime dependency.
