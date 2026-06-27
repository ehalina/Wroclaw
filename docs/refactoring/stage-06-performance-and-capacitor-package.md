# Stage 6 - Performance и Capacitor package

## Цель

Снизить вес сборки и стабилизировать поведение в WebView без ухудшения визуального качества.

## Контекст

Стартовый Stage 6 baseline: `make build` собирал `www/` размером `350 files, 138.2 MB -> www/`.
После Stage 6.17 текущий baseline: `331 files, 84.5 MB -> www/`.
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

## Status Update - 2026-06-27 - Stage 6.9

Stage 6.9 выполнен:

- Принято решение выровнять sunset preload с реально видимым sky layer:
  - `sunset_parallax.js` теперь preloads `media/tumski/sunset/sunset3.jpg`;
  - `sunset_parallax.html` standalone demo тоже использует `sunset3.jpg` для sky layer.
- `media/tumski/sunset/sunset3.png` добавлен в `excludedRuntimePaths` для Capacitor package.
- Source original `media/tumski/sunset/sunset3.png` не удалялся.
- Build exclusion reference guard уточнен: он больше не сканирует root reference files, которые сами исключаются из package, например `* copy.*` backups.
- Build baseline улучшен:
  - было после Stage 6.8: `334 files, 89.0 MB -> www/`;
  - стало: `333 files, 87.0 MB -> www/`;
  - `du -sh www`: 99M.

Validation:

```bash
node --check sunset_parallax.js
node --check scripts/build-capacitor-web.mjs
make build
```

Следующий подэтап:

- Stage 6.10: продолжить Stage 6 по remaining runtime-heavy assets: либо review `sunset1.png` / `sunset2.png` через screenshot-safe derivative plan, либо перейти к audio lifecycle route/use review для heavy MP3.

## Status Update - 2026-06-27 - Stage 6.10

Stage 6.10 выполнен:

- Создан `docs/refactoring/stage-06-10-audio-route-use-review.md`.
- Зафиксирован package/source audio inventory.
- Зафиксирована canonical route policy из `spa_config.js`:
  - `minsk` для `minsk01.html`, `minsk02.html`;
  - `kostel` для `tumski19.html`;
  - `hang` для `tumski21.html`;
  - `birds` для garden routes;
  - `town` как default fallback.
- Подтверждено, что heavy MP3 assets являются runtime assets и не являются cleanup-only exclusion candidates.
- Найден следующий low-risk package cleanup candidate: duplicate effect copies `media/zwyki/opening-a-book.wav` и `media/zwyki/step.wav`, если build reference guard подтвердит отсутствие runtime refs.
- Baseline не менялся: `333 files, 87.0 MB -> www/`.

Следующий подэтап:

- Stage 6.11: проверить и, если guard разрешит, исключить duplicate `media/zwyki/*.wav` effect copies из Capacitor package без удаления source files.

## Status Update - 2026-06-27 - Stage 6.11

Stage 6.11 выполнен:

- `media/zwyki/opening-a-book.wav` и `media/zwyki/step.wav` добавлены в `excludedRuntimePaths`.
- Source files не удалялись.
- Runtime root effects остаются в package:
  - `media/opening-a-book.wav`;
  - `media/step.wav`.
- Build reference guard подтвердил отсутствие runtime refs на excluded duplicate WAV paths.
- Build baseline улучшен:
  - было после Stage 6.10: `333 files, 87.0 MB -> www/`;
  - стало: `331 files, 86.9 MB -> www/`;
  - `du -sh www`: 99M.

Validation:

```bash
node --check scripts/build-capacitor-web.mjs
make build
```

Следующий подэтап:

- Stage 6.12: перейти к audio lifecycle refactor plan for `preloadBackgroundMusic()` / `quest.mp3` duplication, без изменения аудио файлов.

## Status Update - 2026-06-27 - Stage 6.12

Stage 6.12 выполнен:

- Создан `docs/refactoring/stage-06-12-audio-lifecycle-refactor-plan.md`.
- Зафиксирован текущий audio lifecycle риск:
  - route policy уже централизована в `spa_config.js`;
  - source URL policy всё ещё локальна в `index.html`;
  - `preloadBackgroundMusic()` eager-loads route tracks after unlock;
  - `quest.mp3` имеет нескольких владельцев (`index.html`, `language_menu.js`, `quest_marker_handler.js`, `quest_overlay.js`).
- Выбран безопасный порядок следующих шагов:
  1. Stage 6.13: extract audio source policy into `spa_config.js`;
  2. Stage 6.14: add browser/network characterization for eager MP3 loading;
  3. Stage 6.15: reduce eager preload;
  4. Stage 6.16: consolidate quest audio owner.
- Playback behavior и package baseline в Stage 6.12 не менялись: `331 files, 86.9 MB -> www/`.

Следующий подэтап:

- Stage 6.13: вынести audio source URL policy из `index.html` в `spa_config.js`, сохранив exact source paths и route behavior.

## Status Update - 2026-06-27 - Stage 6.13

Stage 6.13 выполнен:

- В `spa_config.js` добавлены:
  - `AUDIO_SOURCES`;
  - `AUDIO_TRACKS.QUEST`;
  - `getAudioSourceForTrack(trackName)`.
- `index.html` использует `spaAudioSourceForTrack()` вместо локального `trackUrls`.
- `preloadBackgroundMusic()` теперь получает source URLs через тот же helper.
- Exact source paths не менялись.
- Playback behavior и package baseline не менялись: `331 files, 86.9 MB -> www/`.
- `tests/smoke.spec.mjs` проверяет `getAudioSourceForTrack('hang')` и `getAudioSourceForTrack('quest')`.

Validation:

```bash
node --check spa_config.js
node --check tests/smoke.spec.mjs
make smoke
```

Следующий подэтап:

- Stage 6.14: добавить browser/network characterization для текущего eager MP3 loading перед изменением `preloadBackgroundMusic()`.

## Status Update - 2026-06-27 - Stage 6.14

Stage 6.14 выполнен:

- Создан `docs/refactoring/stage-06-14-audio-lifecycle-characterization.md`.
- Добавлен Playwright config `playwright.stage-06-14.config.mjs`.
- Добавлен characterization spec `tools/stage-06-14/audio-lifecycle-characterization.spec.mjs`.
- Добавлен Makefile target `make stage-06-14-audio`.
- Созданы artifacts:
  - `docs/refactoring/artifacts/stage-06-14-audio/desktop-audio-lifecycle.json`;
  - `docs/refactoring/artifacts/stage-06-14-audio/mobile-pixel5-audio-lifecycle.json`.
- Зафиксировано, что текущий `preloadBackgroundMusic()` constructs/loads:
  - `media/zwyki/birds.mp3`;
  - `media/zwyki/kostel.mp3`;
  - `media/zwyki/hang.mp3`;
  - `media/zwyki/quest.mp3`.
- Runtime behavior и package baseline не менялись: `331 files, 86.9 MB -> www/`.

Validation:

```bash
make stage-06-14-audio
```

Следующий подэтап:

- Stage 6.15: изменить `preloadBackgroundMusic()` на lazy bookkeeping без eager `new Audio(...).load()` для route-specific MP3, сохранив `switchTrack()` behavior.

## Status Update - 2026-06-27 - Stage 6.15

Stage 6.15 выполнен:

- Создан `docs/refactoring/stage-06-15-lazy-audio-preload.md`.
- `preloadBackgroundMusic()` больше не создает `Audio` elements и не вызывает `load()` для:
  - `birds`;
  - `kostel`;
  - `hang`;
  - `quest`.
- Метод теперь только инициализирует `trackTimes` bookkeeping.
- `switchTrack(trackName)` продолжает lazy-load actual MP3 через `spaAudioSourceForTrack()`.
- Добавлен Makefile target `make stage-06-15-audio`.
- Stage 6.14 characterization runner получил режимы `record` / `lazy`.
- Созданы artifacts:
  - `docs/refactoring/artifacts/stage-06-15-audio/desktop-audio-lifecycle.json`;
  - `docs/refactoring/artifacts/stage-06-15-audio/mobile-pixel5-audio-lifecycle.json`.
- Package baseline после build: `331 files, 86.8 MB -> www/`.

Validation:

```bash
make stage-06-15-audio
```

Следующий подэтап:

- Stage 6.16: consolidate quest audio owner, не смешивая с route-track lazy preload.

## Status Update - 2026-06-27 - Stage 6.16

Stage 6.16 выполнен:

- Создан `docs/refactoring/stage-06-16-quest-audio-owner.md`.
- Добавлен `window.QuestAudio` helper в `language_menu.js`.
- `LanguageMenu.initializeQuestMusic()` и `LanguageMenu.initializeQuestMusicInIframe()` используют общий helper.
- SPA `initializeIframeQuestMusic()` теперь attaches shared parent `questMusic` to iframe вместо создания iframe-local `audio#questMusic`.
- `quest_marker_handler.js` получает shared audio через `window.QuestAudio` или `window.parent.QuestAudio`.
- `tests/smoke.spec.mjs` проверяет single owner: один parent `audio#questMusic`, ноль iframe-local `#questMusic`, iframe reference указывает на тот же объект.
- `quest_overlay.js` local overlay sound оставлен как deferred decision.
- Package baseline после build: `331 files, 86.8 MB -> www/`.

Validation:

```bash
node --check language_menu.js
node --check quest_marker_handler.js
node --check tests/smoke.spec.mjs
make smoke
make audit
```

## Status Update - 2026-06-27 - Stage 6.17

Stage 6.17 выполнен:

- Создан `docs/refactoring/stage-06-17-sunset-webp-runtime.md`.
- Созданы lossless WebP derivatives:
  - `media/tumski/sunset/sunset1.webp` (`4.0M` PNG -> `2.6M` WebP);
  - `media/tumski/sunset/sunset2.webp` (`3.2M` PNG -> `2.2M` WebP).
- `tumski21.html`, `tumski21.css`, `sunset_parallax.html` и `sunset_parallax.js` переключены на WebP runtime layers.
- `scripts/build-capacitor-web.mjs` исключает `sunset1.png` и `sunset2.png` из Capacitor package; source originals остаются в repo.
- Добавлен `make stage-06-17-sunset-webp`.
- Добавлен `tools/stage-06-17/compare-sunset-screenshots.mjs` с `ssimulacra2` threshold 90.
- Screenshot similarity against Stage 6.8 baseline: `92.32`-`93.82`.
- Package baseline улучшен: `331 files, 86.8 MB -> www/` -> `331 files, 84.5 MB -> www/`.

Validation:

```bash
make stage-06-17-sunset-webp
make build
```

## Status Update - 2026-06-27 - Stage 6.18

Stage 6.18 выполнен:

- Создан `docs/refactoring/stage-06-18-scene-jpg-characterization.md`.
- Добавлен `playwright.stage-06-18.config.mjs`.
- Добавлен `tools/stage-06-18/scene-jpg-characterization.spec.mjs`.
- Добавлен Makefile target `make stage-06-18-scene-jpg-screenshots`.
- Сняты desktop/mobile screenshots для крупнейших runtime scene JPG:
  - `tumski11.html` / `media/tumski/tumski_11.jpg`;
  - `dwor01.html` / `media/tumski/dwor_01.jpg`;
  - `tumski14.html` / `media/tumski/tumski_14.jpg`.
- Созданы artifacts:
  - `docs/refactoring/artifacts/stage-06-18-scene-jpg/desktop-*.png`;
  - `docs/refactoring/artifacts/stage-06-18-scene-jpg/mobile-pixel5-*.png`;
  - `docs/refactoring/artifacts/stage-06-18-scene-jpg/*-measurements.json`.
- Runtime assets и package baseline не менялись: `331 files, 84.5 MB -> www/`.

Validation:

```bash
node --check playwright.stage-06-18.config.mjs
node --check tools/stage-06-18/scene-jpg-characterization.spec.mjs
make stage-06-18-scene-jpg-screenshots
```

Следующий подэтап:

- Stage 6.19: сделать derivative для одного scene JPG и сравнить с Stage 6.18 baseline на desktop/mobile, прежде чем менять остальные scene JPG.
