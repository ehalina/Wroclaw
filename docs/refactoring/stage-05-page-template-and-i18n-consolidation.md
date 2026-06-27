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

5. Найти повторяющиеся page blocks.
   - head/meta/scripts;
   - audio nodes;
   - стрелки;
   - language menu;
   - map/quest buttons;
   - common page init.

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
