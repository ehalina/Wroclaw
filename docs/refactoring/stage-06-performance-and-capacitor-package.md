# Stage 6 - Performance и Capacitor package

## Цель

Снизить вес сборки и стабилизировать поведение в WebView без ухудшения визуального качества.

## Контекст

Текущий `make build` собирает `www/` размером около `138.2 MB`. В `BACKLOG.md` Performance Optimization уже находится в активных задачах Phase 2.

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
