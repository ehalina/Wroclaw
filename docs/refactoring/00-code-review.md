# Code Review перед рефакторингом

Дата: 2026-06-26  
Контекст: подготовка большого рефакторинга Wroclaw static/Capacitor app  
Source of truth по задачам: `BACKLOG.md`  
Методология: `safe-refactoring-playbook`, `agent-programming-planner`

## Короткий вывод

Проект уже собирается и не имеет npm-audit уязвимостей, но сейчас нет настоящей автоматической сетки безопасности: `make lint`, `make typecheck` и `make test` являются заглушками. Перед крупным рефакторингом нужно сначала закрыть несколько runtime-дефектов и добавить smoke-проверки, иначе поведение легко сломать незаметно.

Самые важные проблемы:

1. Переход через карту может падать на `ReferenceError` из-за переменной `pages`, которой нет в области видимости.
2. На странице собора есть активная битая навигация на `tumski_06.html`, хотя в проекте есть `tumski06.html`.
3. Несколько активных страниц ссылаются на отсутствующие ассеты и скрипт `input_detection.js`.
4. `index.html` и `map_modal.js` содержат слишком много смешанных ответственностей и должны рефакториться только после добавления проверок.

## Выполненные проверки

```bash
make lint
# No linter configured for this static JavaScript project.

make typecheck
# No TypeScript typecheck configured for this JavaScript project.

make test
# No automated test suite configured yet.

make build
# Built Capacitor web assets: 338 files, 138.2 MB -> www/

make security
# npm audit: 0 vulnerabilities
```

Дополнительно:

```bash
find . -maxdepth 1 -name '*.js' -print0 | xargs -0 -n 1 node --check
# JS syntax check passed
```

Были также выполнены локальные проверки ссылок/ассетов и дубликатов `id`. Они не являются частью проекта, поэтому результат ниже надо сначала превратить в постоянные smoke-скрипты.

## Findings

### CR-01 - HIGH - Переход по маркеру карты использует undefined `pages`

Файл: `map_modal.js:2617-2664`  
Код: `handleMarkerClick(page)` задает `const firstPage = page`, но затем проверяет `pages.length` и обращается к `pages[1]`.

Риск:

- при наличии `window.SPAManager.loadPage` выполнение падает на `ReferenceError`;
- ошибка ловится широким `catch`, после чего происходит `location.href = firstPage`;
- SPA-переход превращается в полный reload, состояние аудио/языка/истории может вести себя иначе.

Рекомендация:

- явно нормализовать вход в `const pages = Array.isArray(page) ? page : [page]`;
- разделить `handleMarkerClick` на закрытие UI, запись navigation context и собственно навигацию;
- добавить smoke-проверку клика по каждому маркеру карты.

### CR-02 - HIGH - Активная навигация ведет на отсутствующий `tumski_06.html`

Файл: `katedra_01.html:643-648`  
Код:

```js
Common.setupBackArrowHandler(cursorBack, cursorBackArea, stepSound, () => {
    window.location.href = 'tumski_06.html';
});
```

В проекте есть `tumski06.html`, но нет `tumski_06.html`.

Риск:

- back-navigation со страницы собора ведет на 404;
- в Capacitor это может выглядеть как пустой/сломанный экран.

Рекомендация:

- исправить цель на существующий файл после проверки ожидаемого маршрута;
- добавить route-existence checker для `window.location.href`, `href`, `src`, inline CSS `url(...)` и основных `postMessage` navigation payloads.

### CR-03 - HIGH - Активные страницы ссылаются на отсутствующие ассеты и скрипты

Обнаруженные активные ссылки:

- `katedra_01.html:86` и `katedra_panorama.html:63`: `media/tumski/katedra_panorama.jpg`;
- `katedra_01.html:553` и `katedra_panorama.html:599`: `input_detection.js`;
- `katedra_01.html:577`, `katedra_01.html:590`, `katedra_panorama.html:630`, `katedra_panorama.html:643`: `media/book.jpg`, `media/book02.jpg`;
- `katedra_01.html:404`, `katedra_panorama.html:373`, `styles.css:350`: `media/Roboto-ExtraLightItalic.ttf`;
- `map_modal.js:636`: `media/book/quest_03.jpg`, `media/book/quest_04.jpg`;
- `pk02.css:8`: `media/tumski/pk_03.jpg`.

Риск:

- 404 на изображениях и шрифтах ломают визуальный слой;
- отсутствующий `input_detection.js` может скрыть проблемы с desktop/mobile input mode;
- часть ошибок проявится только в браузере или в Capacitor WebView.

Рекомендация:

- сначала решить: восстановить ассеты, поправить пути или удалить неиспользуемые ссылки;
- для `media/book.jpg`/`media/book02.jpg` проверить, должны ли использоваться существующие `media/book/...`;
- зафиксировать обязательный asset-checker в `make test` или отдельном `make smoke`.

### CR-04 - MEDIUM - Нет настоящего test/lint/typecheck baseline

Файлы: `Makefile`, project scripts  
Факт: стандартные команды существуют, но `lint`, `typecheck`, `test` сейчас не проверяют поведение.

Риск:

- крупный рефакторинг будет опираться в основном на ручную проверку;
- safe refactoring невозможен без characterization/smoke checks хотя бы для маршрутов, ассетов, синтаксиса и базового DOM.

Рекомендация:

- Stage 1 рефакторинга должен быть не про изменение архитектуры, а про safety net;
- минимальная сетка: JS syntax, HTML asset/link checker, duplicate-id checker, route checker, build/security;
- после этого можно добавлять браузерные smoke-сценарии для SPA, карты, языка и аудио.

### CR-05 - MEDIUM - `postMessage` использует `'*'` и не валидирует источник/форму сообщения

Файлы:

- `index.html:535-538`: `activeIframe.contentWindow.postMessage(..., '*')`;
- `index.html:1283-1295`: listener `SPA_NAVIGATE` без проверки `event.origin`, `event.source` и схемы payload;
- `tumski_page_common.js:35-45`: listener `LANGUAGE_CHANGE`/`PAGE_HASH` без проверки source/origin;
- `tumski_page_common.js:115-123`: `window.parent.postMessage(..., '*')`.

Риск:

- сейчас это static same-origin iframe app, поэтому риск ограничен;
- при расширении контента, внешних ссылках или WebView-особенностях message boundary станет хрупкой;
- рефакторинг SPA без контракта сообщений может сломать язык, hash-переходы и audio unlock.

Рекомендация:

- описать единый message contract: allowed types, required fields, expected source;
- заменить wildcard target на вычисленный same-origin target там, где это возможно;
- в listener-ах проверять `event.source`, `event.origin` и структуру `event.data`.

Status 2026-06-26:

- first pass выполнен в Stage 3;
- добавлен `spa_message_contract.js`;
- `index.html`, `common.js`, `tumski.html`, `tumski_page_common.js`, `map_modal.js` проверяют входящие сообщения по schema/source/origin;
- исходящие сообщения в центральных потоках переведены на same-origin helper;
- добавлены Playwright smoke-тесты для валидного/невалидного `SPA_NAVIGATE` и `LANGUAGE_CHANGE`.

### CR-06 - MEDIUM - i18n пишет переводы через `innerHTML`

Файл: `i18n.js:76-80`, `i18n.js:83-108` и далее по функции `updatePageContent`.

Риск:

- локальные JSON-переводы сейчас являются доверенным источником, но любая ошибка в контенте может вставить HTML в DOM;
- при расширении локализации и передаче переводов не-разработчикам это станет XSS-классом проблем;
- сложно понять, какие ключи действительно требуют HTML.

Рекомендация:

- по умолчанию использовать `textContent`;
- сделать явный allowlist для rich HTML keys;
- добавить проверку переводов на неожиданные теги и синхронность ключей по языкам.

Статус 2026-06-27:

- Stage 5.1 выполнен для центрального `i18n.js`;
- `updatePageContent()` и `setTranslatedContent()` используют `textContent` по умолчанию;
- rich HTML разрешён только для 7 описательных ключей через allowlist;
- sanitizer сохраняет только `<br>`, остальной HTML экранируется;
- `scripts/check-translations.mjs` теперь падает на HTML вне allowlist или на теги кроме `<br>`;
- Stage 5.2 сделал missing/extra locale keys hard failure;
- Stage 5.3 убрал text-only `innerHTML` из `common.js`;
- Stage 5.4 добавил sanitizer для gnome descriptions;
- Stage 5.5 перевёл quest intro/list rendering на DOM API и `textContent`/`replaceChildren()`;
- Stage 5.6 упростил `updatePageContent()` и убрал дублирующие audio-unlock проходы;
- smoke проверяет plain text escaping, known rich key, audio-unlock fallback, gnome descriptions и quest intro без реального `<script>` в DOM.

Остаточный риск:

- активные HTML sinks в Stage 5 scope сведены к controlled sanitizer paths (`i18n.js`, `gnome_marker_handler.js`) и static template insertion в `map_modal.js`;
- template insertion остаётся отдельным архитектурным решением, не переводческим sink.

### CR-07 - MEDIUM - `MapModal.init()` не выглядит идемпотентным

Файлы:

- `map_modal.js:1283-1380`: каждый вызов создает `<style>` и вставляет большой `modalHTML`;
- `tumski_page_common.js:148`: вызов `MapModal.init()` без локального DOM guard;
- `quest_marker_handler.js:116-119`: fallback-вызов `MapModal.init()`.

Риск:

- повторная инициализация может дублировать DOM, аудио-элементы, listeners и стили;
- баги будут зависеть от порядка загрузки страниц в SPA;
- это усложняет извлечение `MapModal` на модули.

Рекомендация:

- первым шагом сделать `MapModal.init()` идемпотентным;
- разделить `ensureStyles()`, `ensureDom()`, `bindEventsOnce()`, `syncVisitedMarkers()`;
- добавить smoke-проверку повторной инициализации.

Статус 2026-06-27:

- Stage 4.1 выполнен;
- `MapModal.init()` больше не вставляет повторный `#map-modal`, `#open-map-modal`, `.book-overlay` и связанные DOM-узлы;
- style injection использует stable ids `map-modal-styles` и `map-modal-mobile-tooltip-styles`;
- listeners привязываются один раз через `MapModal._initialized`;
- добавлен Playwright smoke для повторного `MapModal.init()` на direct Tumski page.
- Stage 4.2 выполнен: inline `modalHTML` вынесен в `getMapModalTemplate()`, DOM insertion - в `ensureMapModalDom()`, smoke закрепляет ключевые ids/classes template.
- Stage 4.3 выполнен: `map_modal_template.js` отложен из-за classic script load order, основной CSS вынесен в `map_modal.css`, `#map-modal-styles` теперь является stylesheet link.
- Stage 4.4 выполнен: marker navigation вынесен в `map_marker_navigation.js`, `map_modal.js` лениво подключает helper через `#map-marker-navigation-script`, smoke проверяет SPA priority/fallback и реальный click по `.visited-marker`.
- Stage 4.5 выполнен: visited-marker storage/rendering вынесены в `visited_markers.js`, `map_modal.js` лениво подключает helper через `#visited-markers-script`, smoke проверяет tolerant parsing, сохранение текущей страницы и render contract без изменения классов/координат маркеров.
- Stage 4.6 выполнен: quest/book overlay behavior вынесен в `quest_overlay.js`, `map_modal.js` лениво подключает helper через `#quest-overlay-script`, compatibility globals `renderQuestIntro`/`showQuestConfirmDialog` сохранены, smoke проверяет открытие `.book-overlay` и render contract квестовой книги.
- Stage 4.7 выполнен: map/quest debug logging загейчен через `map_debug.js`/`MapDebug`, ручное включение доступно через `DEBUG_MAP` и legacy `__quest_debug`, smoke проверяет quiet default и debug flags.

### CR-08 - MEDIUM - `index.html` содержит крупные inline-классы и бизнес-логику SPA

Файлы:

- `index.html:348+`: `SPAManager`;
- `spa_minimap_manager.js:35+`: `MiniMapManager` после Stage 3.4;
- `index.html` после Stage 3.4 уменьшен примерно до 1616 строк, но всё ещё содержит крупный `SPAManager`.

Риск:

- трудно тестировать и ревьюить изменения SPA отдельно от HTML shell;
- inline-код усложняет повторное использование и статическую проверку;
- дальнейшие изменения аудио, языка, истории и iframe lifecycle будут конфликтовать.

Рекомендация:

- не выносить сразу все;
- сначала зафиксировать контракт текущего поведения;
- затем извлекать маленькими шагами: constants/page registry, message handling, audio state, iframe lifecycle, minimap.

Статус 2026-06-26:

- Stage 3 first pass: message contract вынесен в `spa_message_contract.js`;
- Stage 3.2: page registry, стартовая страница, iframe selectors и audio route policy вынесены в `spa_config.js`;
- Stage 3.3: первый слой pure SPA lifecycle helpers вынесен в `spa_lifecycle.js`;
- Stage 3.4: `MiniMapManager` вынесен в `spa_minimap_manager.js`, `index.html` оставляет только dependency wiring и listener для `OPEN_MINI_MAP`;
- остаются крупные inline-ответственности: stateful SPA lifecycle и audio state details в `SPAManager`.

### CR-09 - MEDIUM - Дублирующий `id="bookSound"` на странице панорамы

Файл: `katedra_panorama.html:617` и `katedra_panorama.html:625`

Риск:

- `document.getElementById('bookSound')` вернет первый элемент;
- второй звук может не управляться ожидаемо;
- при общем аудио-рефакторинге это даст неочевидные побочные эффекты.

Рекомендация:

- заменить повторяющийся `id` на class/data-role или один общий audio node;
- добавить duplicate-id checker.

### CR-10 - LOW/MEDIUM - В корне лежат временные/устаревшие файлы

Файлы:

- `arrow_handlers.js.backup`;
- `quest_marker_handler.js.new`;
- `sunset_parallax copy.js`.

Риск:

- build script их сейчас не копирует в `www`, но поиск и review будут постоянно цепляться за устаревший код;
- есть риск случайно подключить не тот файл;
- это мешает автоматическим inventory-проверкам.

Рекомендация:

- после stabilization stage удалить или переместить в явный архив вне runtime tree;
- перед удалением проверить git history и фактические подключения.

### CR-11 - LOW/MEDIUM - Много production `console.log`

Примеры:

- `tumski_page_common.js:47`;
- `arrow_handlers.js`: активные логи в обработчиках стрелок;
- `quest_marker_handler.js`: активные debug logs вокруг маркеров.

Риск:

- шум в WebView/devtools затруднит диагностику реальных ошибок;
- часть логов содержит внутреннее состояние переходов и маркеров.

Рекомендация:

- ввести маленький debug logger с флагом;
- не удалять все логи массово до стабилизации, чтобы не потерять диагностическую ценность.

### CR-12 - LOW/MEDIUM - Локализация имеет потенциально два source-of-truth файла на язык

Наблюдение: в locale directories встречаются `translation.json` и `translations.json`. Runtime в `i18n.js` загружает `translations.json`.

Риск:

- контент можно обновить не в том файле;
- планы по Full Localization из `BACKLOG.md` будут расходиться с runtime;
- трудно проверять полноту ключей.

Рекомендация:

- выбрать один формат как canonical;
- добавить checker равенства ключей между языками;
- удалить/архивировать дубликаты только после проверки, что они не используются.

Статус 2026-06-27:

- `translations.json` закреплён как runtime canonical source;
- obsolete legacy `translation.json` files удалены в Stage 7.4 после проверки, что runtime их не использует;
- rich HTML checker стал strict;
- Stage 5.2 синхронизировал `be` keys и сделал key consistency strict failure для всех локалей.

## Приоритет исправления

Сначала исправлять не архитектуру, а дефекты, которые мешают честной проверке:

1. Safety net: постоянные smoke-проверки для синтаксиса, ссылок, ассетов, duplicate ids и build.
2. Runtime fixes: `pages` в `MapModal`, `tumski_06.html`, missing active assets/scripts, duplicate `bookSound`.
3. Boundary hardening: `postMessage`, idempotent init, i18n text/rich split.
4. Только после этого - модульный рефакторинг `index.html`, `map_modal.js`, page templates.

## Что не делалось в рамках review

- Не исправлялся production code.
- Не удалялись временные файлы.
- Не менялся `BACKLOG.md`.
- Не запускался браузерный/Capacitor smoke, потому что сначала нужно оформить проверочные сценарии и понять целевые маршруты.

## Status Update - 2026-06-26

Закрыто в Stage 1 tooling:

- CR-04: `make lint`, `make test`, `make test-e2e`, `make smoke`, `make audit` теперь являются реальными проверками.

Закрыто в Stage 2 runtime fixes:

- CR-01: `MapModal.handleMarkerClick(page)` больше не обращается к undefined `pages`.
- CR-02: `katedra_01.html` ведет на существующий `tumski06.html`.
- CR-03: active missing assets/scripts из review закрыты; в allowlist остались только debug/test и legacy cleanup исключения.
- CR-09: duplicate `id="bookSound"` в `katedra_panorama.html` устранен.

Остается на следующих этапах:

- CR-05: `postMessage` boundary hardening - Stage 3.
- CR-06: split safe text/rich HTML для i18n - Stage 5.
- CR-07: идемпотентный `MapModal.init()` - Stage 4.
- CR-08: декомпозиция inline SPA shell - Stage 3.
- CR-10: cleanup временных/устаревших файлов - Stage 7.
- CR-11: debug logger вместо production `console.log` - Stage 7.
- CR-12: canonical localization files - Stage 5.

Проверено после Stage 2 fixes:

```bash
make test
make lint
make test-e2e
make build
make security
make smoke
make audit
```

## Status Update - 2026-06-27

Закрыто последующими refactoring stages:

- CR-05: `postMessage` boundary hardening - Stage 3.
- CR-06: split safe text/rich HTML для i18n - Stage 5.
- CR-07: идемпотентный `MapModal.init()` - Stage 4.
- CR-08: декомпозиция inline SPA shell - Stage 3.
- CR-10: cleanup временных/устаревших root JS files - Stage 7.1.
- CR-12: canonical runtime localization source и strict key consistency - Stage 5.

Остается:

- CR-11: remaining production console/debug cleanup - Stage 7.
