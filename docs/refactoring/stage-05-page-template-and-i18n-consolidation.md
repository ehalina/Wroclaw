# Stage 5 - Page templates и i18n consolidation

## Цель

Снизить дублирование HTML-страниц и сделать локализацию безопасной и проверяемой.

## Technology Gate Input - 2026-06-26

POC `tools/template-poc` показал, что data-driven страницы можно генерировать в static HTML без смены runtime framework.

Stage 5 должен использовать это как кандидат, но не начинать массовую миграцию:

- сначала новая или низкорисковая страница;
- metadata для markers/arrows/page shell;
- generated HTML остается обычным HTML;
- замена production page только после `make test`, `make test-e2e`, `make build`.

## Scope

Входит:

- inventory повторяющихся page patterns;
- общий набор подключений для страниц;
- нормализация `data-i18n`;
- canonical localization files;
- `textContent` по умолчанию вместо `innerHTML`;
- allowlist для rich HTML translations;
- проверка полноты переводов.

Не входит:

- перевод нового контента без задачи из `BACKLOG.md`;
- изменение copywriting;
- визуальный редизайн страниц;
- генератор сайта, если простой shared helper достаточен.

## Шаги

1. ✅ Выбрать canonical localization source.
   - ✅ Runtime сейчас использует `translations.json`.
   - ✅ Checker фиксирует legacy `translation.json` как предупреждение.
   - ✅ `translations.json` зафиксирован как runtime source of truth.

2. ✅ Добавить checker ключей.
   - ✅ Все языки имеют одинаковый набор ключей.
   - ✅ Отсутствующие ключи показываются как failures.
   - ✅ Лишние/отсутствующие ключи показываются отдельно.
   - ✅ Rich HTML в переводах проверяется строго по allowlist.

3. ✅ Разделить text и rich HTML в центральном `i18n.js`.
   - ✅ В `i18n.js` по умолчанию писать `textContent`.
   - ✅ Создать allowlist ключей, которым разрешен `innerHTML`.
   - ✅ Для rich keys добавить sanitizer или строго контролируемый набор тегов.

4. ✅ Упростить `updatePageContent`.
   - ✅ Убрать повторные специальные проходы, если общий механизм покрывает `.audio-unlock-text`.
   - ✅ Сохранить compatibility для текущих страниц.

5. ✅ Найти повторяющиеся page blocks.
   - ✅ head/meta/scripts;
   - ✅ audio nodes;
   - ✅ стрелки;
   - ✅ language menu;
   - ✅ map/quest buttons;
   - ✅ common page init.

6. Ввести shared page helper.
   - Маленькими шагами, начиная с новых/наименее рискованных страниц.
   - Не мигрировать все HTML сразу.

7. Подготовить future content workflow.
   - Как добавлять страницу;
   - как добавлять перевод;
   - как проверять ассеты;
   - как обновлять `BACKLOG.md`.

## Проверки

```bash
make test
make build
make security
```

Дополнительно:

- translation key checker;
- smoke смены языка;
- проверка страниц с rich HTML content;
- browser console без i18n errors.

## Done

- Один canonical localization file format.
- `i18n.js` не вставляет HTML без явного разрешения.
- Ключи переводов синхронизированы между языками.
- Новая страница может использовать shared pattern без копирования большого inline JS.
- Full Localization из `BACKLOG.md` получила техническую основу.

## Stop signals

- В переводах много намеренного HTML, который нельзя быстро классифицировать.
- Старые страницы зависят от side effects `innerHTML`.
- Дубли `translation.json`/`translations.json` используются внешним workflow.

## Status Update - 2026-06-27 - Stage 5.1

Stage 5.1 выполнен:

- `translations.json` закреплён как runtime canonical source; legacy `translation.json` пока остаются предупреждением checker-а, чтобы не ломать возможный внешний workflow.
- В `i18n.js` добавлен `setTranslatedContent()`: обычные `data-i18n` и service labels обновляются через `textContent`.
- Rich HTML разрешён только для 7 явных описательных ключей: длинные book/gnome тексты, где текущий контент использует `<br>`.
- `sanitizeRichTranslation()` экранирует весь HTML и возвращает только `<br>`/`<br />` как разметку.
- `scripts/check-translations.mjs` теперь падает на HTML вне allowlist и на любые теги кроме canonical `<br>`.
- Playwright smoke добавлен для plain `data-i18n`, known rich key, экранирования чужого `<script>` и сохранения `<br>`.
- Проверки после изменения: `make test` и `make smoke` прошли; smoke расширен до 34 тестов на desktop/mobile.

Осталось в Stage 5:

- разобрать прямые `innerHTML` вне `i18n.js` (gnome/book handlers) отдельными маленькими шагами;
- затем переходить к `updatePageContent` simplification и page template inventory.

## Status Update - 2026-06-27 - Stage 5.2

Stage 5.2 выполнен:

- `locales/be/translations.json` синхронизирован с canonical key set: добавлены `account.stats.rating` и `account.stats.save_result`.
- Удалён неиспользуемый корневой дубль `blue_goat.*`; актуальный runtime key остаётся `gnomes.blue_goat.*`.
- Rich HTML allowlist сокращён до 7 реально существующих canonical ключей.
- `scripts/check-translations.mjs` теперь завершает `make test` с ошибкой при любых missing/extra translation keys.
- Проверка после изменения: `make test` прошёл; key consistency strict passed для 7 локалей.

Следующий подэтап:

- Stage 5.3: разобрать прямые `innerHTML` вне центрального `i18n.js`, начиная с низкорисковых text-only мест.

## Status Update - 2026-06-27 - Stage 5.3

Stage 5.3 выполнен:

- В `common.js` добавлен локальный `setI18nText()` wrapper с использованием `window.i18n.setTranslatedContent()` при наличии.
- `updateMapTooltipText()`, `openTumskiIslandBook()`, `openTumskiMostOverlay()` и iframe language audio-unlock sync больше не используют active `innerHTML`.
- Text-only labels/titles/tooltip теперь обновляются через `textContent` или центральный i18n text/rich boundary.
- Остальные `innerHTML` оставлены намеренно: template insertion, list clearing и rich/paragraph rendering требуют отдельных шагов.
- Проверки после изменения: `make test` и `make smoke` прошли; smoke остаётся 34 теста на desktop/mobile.

Следующий подэтап:

- Stage 5.4/5.5: классифицировать оставшиеся `innerHTML` sinks (`gnome_marker_handler.js`, `quest_overlay.js`, `quest_marker_handler.js`, template insertion) и вынести text-only/rich-only helpers без изменения overlay UX.

## Status Update - 2026-06-27 - Stage 5.4

Stage 5.4 выполнен:

- `gnome_marker_handler.js` больше не вставляет description через raw `innerHTML`.
- Добавлен `sanitizeGnomeDescription()` с делегированием в `window.i18n.sanitizeRichTranslation()` и локальным fallback.
- Для gnome descriptions сохраняется только `<br>` форматирование, остальной HTML экранируется.
- Добавлен Playwright smoke для gnome description: `<br>` остаётся, `<script>` не становится DOM-узлом.
- Проверки после изменения: `make test` и `make smoke` прошли; smoke расширен до 36 тестов на desktop/mobile.

## Status Update - 2026-06-27 - Stage 5.5

Stage 5.5 выполнен:

- `quest_overlay.js` и legacy `quest_marker_handler.js` очищают quest task list через `replaceChildren()` вместо `innerHTML = ''`.
- `renderQuestIntro()` теперь строит `<p>` через DOM API и задаёт paragraph text через `textContent`.
- Перевод `quest.intro` больше не интерполируется как HTML.
- Добавлен Playwright smoke для intro paragraphs: HTML в переводе остаётся текстом, `<script>` не становится DOM-узлом.
- Проверки после изменения: `make test` и `make smoke` прошли; smoke расширен до 38 тестов на desktop/mobile.

Текущее состояние HTML sinks в Stage 5 scope:

- `i18n.js`: `innerHTML` только после `sanitizeRichTranslation()`.
- `gnome_marker_handler.js`: `innerHTML` только после `sanitizeGnomeDescription()`.
- `map_modal.js`: `insertAdjacentHTML()` только для static modal template insertion.

Следующий подэтап:

- Stage 5.6: упростить `updatePageContent()` после введения `setTranslatedContent()`, убрать дублирующие audio-unlock проходы без смены language UX.

## Status Update - 2026-06-27 - Stage 5.6

Stage 5.6 выполнен:

- `updatePageContent()` теперь делегирует общий `data-i18n` проход в `updateDataI18nElements()`.
- Повторные специальные обновления `.audio-unlock-text[data-i18n]` и `[data-i18n="music.audio_unlock_text"]` удалены.
- Legacy compatibility сохранена через `updateLegacyAudioUnlockText()` только для старой кнопки `#audioUnlockButton .audio-unlock-text` без `data-i18n`.
- `window.i18n.updateDataI18nElements()` экспортирован как маленький helper для будущего shared page init.
- Smoke проверяет text-safe audio-unlock update и legacy fallback без вставки HTML.
- Проверки после изменения: `make test` и `make smoke` прошли; smoke остаётся 38 тестов на desktop/mobile.

Следующий подэтап:

- Stage 5.7: inventory повторяющихся page blocks перед shared page helper, без массовой миграции HTML-страниц.

## Status Update - 2026-06-27 - Stage 5.7

Stage 5.7 выполнен:

- Создан `docs/refactoring/stage-05-page-block-inventory.md`.
- Проверены 59 top-level HTML страниц.
- Зафиксировано стабильное семейство из 51 content page с `data-map-point` + `tumski_init.js`.
- Зафиксированы повторяющиеся blocks: head/script set, scene shell, route cursor pairs, `map-mark-area`, marker text/audio/quest attrs.
- Зафиксированы исключения, которые нельзя мигрировать первым проходом: `index.html`, `tumski.html`, `tumski02.html`, `katedra_*`, standalone/debug pages.
- Первым кандидатом для helper rollout выбран `dwor01.html`, потому что он входит в стабильное семейство и не содержит Firebase/inline parent-message special cases.

Следующий подэтап:

- Stage 5.8: создать additive shared page helper и smoke для synthetic fragment, затем решать миграцию одной страницы.

## Status Update - 2026-06-27 - Stage 5.8

Stage 5.8 выполнен:

- Создан additive helper `page_shell_helpers.js`.
- Helper не подключается к production HTML и не меняет runtime behavior существующих страниц.
- Добавлены pure DOM helpers для стандартных fragments:
  - `createSceneShell()`;
  - `createRouteCursor()`;
  - `createMarker()`;
  - `setCoordinateData()`.
- Helper экспортируется как ES module и как `window.PageShellHelpers` для будущей compatibility-миграции.
- Добавлен Playwright smoke для synthetic scene/cursor/marker fragment с проверкой классов, ids, data attrs, audio src и route target.
- Проверки после изменения: `make test` и `make smoke` прошли; smoke расширен до 40 тестов на desktop/mobile.

Следующий подэтап:

- Stage 5.9: зафиксировать DOM contract для `dwor01.html`, затем мигрировать одну повторяющуюся часть через helper или отложить миграцию, если diff получается слишком широким.

## Status Update - 2026-06-27 - Stage 5.9

Stage 5.9 выполнен:

- Добавлен Playwright smoke contract для `dwor01.html`.
- Контракт фиксирует scene shell, route cursor pairs, marker count, quest marker attrs, `kleck_gate` i18n key и marker audio src.
- В `dwor01.html` мигрированы только route cursor pairs (`custom-cursor-prosto`/area и `custom-cursor-back`/area) на `PageShellHelpers.createRouteCursor()`.
- Markers, scene shell, head/scripts и page init оставлены статическими.
- Smoke поймал несовместимость `document.currentScript` в inline module; реализация исправлена на явный selector `.image-container[data-map-point="40"] .image`.
- Проверки после изменения: `make test` и `make smoke` прошли; smoke остаётся 42 теста на desktop/mobile.

Следующий подэтап:

- Stage 5.10: решить, мигрировать ли marker blocks в `dwor01.html` через helper или сначала вынести page-specific cursor config из inline module в отдельный data/helper слой.

## Status Update - 2026-06-27 - Stage 5.10

Stage 5.10 выполнен:

- В `page_shell_helpers.js` добавлен `renderRouteCursors(target, cursors)`.
- `dwor01.html` теперь передаёт cursor descriptors одним массивом вместо ручного создания и append каждого cursor pair.
- Synthetic helper smoke переведён на `renderRouteCursors()`, чтобы новый helper method был покрыт напрямую.
- DOM contract smoke для `dwor01.html` остался без изменений и подтверждает сохранение routes/classes/data attrs.
- Проверки после изменения: `make test` и `make smoke` прошли; smoke остаётся 42 теста на desktop/mobile.

Следующий подэтап:

- Stage 5.11: мигрировать один marker block в `dwor01.html` через `createMarker()` под существующим DOM contract или остановиться на cursor-only rollout, если marker migration даёт слишком шумный HTML diff.

## Status Update - 2026-06-27 - Stage 5.11

Stage 5.11 выполнен:

- В `page_shell_helpers.js` добавлен `renderMarkers(target, markers, options)`.
- `renderMarkers()` принимает marker descriptors, создаёт стандартные `map-mark-area` blocks через `createMarker()` и умеет вставлять их перед stable anchor (`options.before`).
- В `dwor01.html` оба marker blocks (`black_klotska_quest`, `kleck_gate`) мигрированы на descriptor-based helper rendering.
- Route cursors остаются на `renderRouteCursors()`, scene shell/head/scripts/page init пока оставлены статическими.
- Synthetic helper smoke покрывает `renderMarkers()` напрямую.
- DOM contract smoke для `dwor01.html` теперь фиксирует marker ids/order, quest attrs, audio src и i18n keys после helper rendering.
- Проверки после изменения: `make test` и `make smoke` прошли; smoke остаётся 42 теста на desktop/mobile.

Следующий подэтап:

- Stage 5.12: убрать дубли inline module setup в `dwor01.html`, вынести page-specific cursor/marker descriptors в отдельный маленький page config/render module или общий page renderer, не мигрируя массово остальные страницы.

## Status Update - 2026-06-27 - Stage 5.12

Stage 5.12 выполнен:

- Создан `dwor01_page.js` как маленький page-specific module.
- Cursor и marker descriptors вынесены из inline module-скриптов `dwor01.html`.
- `dwor01.html` теперь держит статический page shell и подключает `dwor01_page.js` перед `tumski_init.js`.
- Порядок module scripts сохраняет прежнее требование: helper-generated markers/routes создаются до запуска `tumski_init.js`.
- DOM contract smoke для `dwor01.html` остался стабильным после выноса page descriptors.
- Проверки после изменения: `make test` и `make smoke` прошли; smoke остаётся 42 теста на desktop/mobile.

Следующий подэтап:

- Stage 5.13: решить, делать ли общий page renderer для marker/cursor descriptor modules или мигрировать второй низкорисковый page candidate по текущему pattern, чтобы проверить повторяемость.

## Status Update - 2026-06-27 - Stage 5.13

Stage 5.13 выполнен:

- Вторым низкорисковым кандидатом выбран `dwor02.html`: тот же stable shell, один marker block, две route arrows, без inline special cases.
- Создан `dwor02_page.js` с marker/cursor descriptors.
- `dwor02.html` переведён на тот же pattern: HTML shell + page module перед `tumski_init.js`.
- Добавлен отдельный DOM contract smoke для `dwor02.html`.
- Контракт фиксирует scene shell, marker id, marker i18n/audio, route targets/classes и наличие page module script.
- Проверки после изменения: `make test` и `make smoke` прошли; smoke расширен до 44 тестов на desktop/mobile.

Следующий подэтап:

- Stage 5.14: вынести общий `renderConfiguredPage()` для page modules, чтобы `dwor01_page.js` и `dwor02_page.js` оставались только descriptor data без повторения helper calls/selectors.

## Status Update - 2026-06-27 - Stage 5.14

Stage 5.14 выполнен:

- В `page_shell_helpers.js` добавлен `renderConfiguredPage(config)`.
- Renderer централизует стандартный порядок для page modules:
  - render markers в `document.body` перед `.scene`;
  - render route cursors в explicit `routeTarget`;
  - возвращает созданные markers и route elements для тестируемости.
- `dwor01_page.js` и `dwor02_page.js` больше не вызывают `renderMarkers()`/`renderRouteCursors()` напрямую.
- Оба page modules теперь содержат descriptors и один вызов `PageShellHelpers.renderConfiguredPage(...)`.
- Synthetic helper smoke покрывает `renderConfiguredPage()` напрямую.
- DOM contract smoke для `dwor01.html` и `dwor02.html` остался стабильным.
- Проверки после изменения: `make test` и `make smoke` прошли; smoke остаётся 44 теста на desktop/mobile.

Следующий подэтап:

- Stage 5.15: зафиксировать future content workflow: как добавлять/мигрировать страницу через page module descriptors, какие smoke contracts нужны, и когда можно переходить к следующему page candidate.

## Status Update - 2026-06-27 - Stage 5.15

Stage 5.15 выполнен:

- Создан `docs/refactoring/stage-05-content-workflow.md`.
- Зафиксирован preferred pattern для content pages: HTML shell + `<page>_page.js` descriptors + `PageShellHelpers.renderConfiguredPage(...)`.
- Описаны descriptor rules для coordinates, marker ids/classes/data attrs, audio nodes, route cursor types и special cases.
- Описан минимальный smoke contract для каждой page migration.
- Зафиксировано rollout rule: мигрировать по одной странице/маленькому семейству, не начинать с exception pages, обновлять `BACKLOG.md` и Stage 5 notes после rollout.

Stage 5 как техническая основа page templates и i18n consolidation закрыт. Дальше можно идти двумя путями:

- продолжать controlled page rollout по `docs/refactoring/stage-05-content-workflow.md`;
- или вернуться к верхнеуровневому refactoring plan и выбрать следующий stage из `BACKLOG.md`.
