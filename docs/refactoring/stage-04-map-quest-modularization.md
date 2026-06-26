# Stage 4 - Модульность карты и квестов

## Цель

Разделить `map_modal.js` на понятные ответственности, сохранив поведение карты, посещенных маркеров, квестов, модалок и звуков.

## Scope

Входит:

- идемпотентность `MapModal.init()`;
- отделение DOM template от logic;
- отделение CSS injection;
- visited markers storage/rendering;
- marker navigation;
- quest/book overlay;
- debug logger для карты/квестов.

Не входит:

- новый дизайн карты;
- изменение координат маркеров без задачи Missing GeoMarkers из `BACKLOG.md`;
- переписывание квестовой логики с нуля;
- оптимизация изображений, кроме путей, необходимых для работоспособности.

## Предлагаемые модули

Имена можно скорректировать по фактическому стилю проекта:

- `map_modal.js` - публичный фасад совместимости `window.MapModal`;
- `map_modal_styles.js` - CSS string или style injection helper;
- `map_modal_template.js` - DOM template/ensure DOM;
- `map_marker_navigation.js` - переходы по маркерам;
- `visited_markers.js` - localStorage/sessionStorage и render layer;
- `quest_overlay.js` - book/quest overlay behavior;
- `map_debug.js` - gated logging.

## Шаги

1. ✅ Сделать `MapModal.init()` идемпотентным.
   - ✅ Если DOM уже есть, не вставлять повторно.
   - ✅ Если style уже есть, не добавлять повторный `<style>`.
   - ✅ Если listeners уже привязаны, не дублировать.

2. ✅ Вынести template без логики.
   - ✅ Сначала как функция в том же файле.
   - Deferred: отдельный файл отложен, потому что `map_modal.js` подключается как classic script в 54 HTML-файлах.
   - ✅ Сохранить exact DOM ids/classes.

3. ✅ Вынести основной style injection.
   - ✅ Основной CSS вынесен в `map_modal.css`.
   - ✅ `map_modal.js` сам подключает stylesheet через `<link id="map-modal-styles">`.
   - ✅ Проверить, что CSS порядок не ломается.
   - ⏳ Малый `.mobile-tooltip` style пока остаётся inline.

4. ✅ Изолировать marker navigation.
   - ✅ Использовать fix из Stage 2 как baseline.
   - ✅ Не менять route behavior.

5. ✅ Изолировать visited markers.
   - ✅ Оставить текущий storage key.
   - ✅ Добавить функции чтения/записи с tolerant parsing.
   - ✅ Проверить старые данные в localStorage.

6. Изолировать quest overlay.
   - Разделить открытие/закрытие, заполнение текста, картинки, звук.
   - Не менять структуру данных квестов до отдельной задачи.

7. Убрать/загейтить debug logs.
   - Ввести `DEBUG_MAP`.
   - Сохранить возможность включить диагностику вручную.

## Проверки

```bash
make test
make build
make security
```

Ручной smoke:

- `MapModal.init()` два раза подряд не дублирует DOM;
- `MapModal.init()` два раза подряд не дублирует style/listeners;
- карта открывается/закрывается;
- tooltip работает;
- visited markers отображаются;
- marker click делает SPA navigation;
- quest overlay открывается/закрывается;
- звуки карты/книги не дублируются.

## Done

- `map_modal.js` перестал быть единственным большим файлом всей области.
- Публичный API `window.MapModal` совместим со старыми вызовами.
- Нет дублирования DOM/listeners при повторном init.
- Marker/quest smoke стабилен.

## Stop signals

- Геометки завязаны на implicit global state, который не удалось описать.
- После выноса template ломается CSS specificity.
- Quest overlay использует скрытую зависимость от порядка DOM.

## Status Update - 2026-06-27

Stage 4.1 выполнен:

- `MapModal.init()` больше не дублирует основной DOM карты/квеста при повторном вызове.
- Основной style injection получил stable id `map-modal-styles`.
- Style injection для `.mobile-tooltip` получил stable id `map-modal-mobile-tooltip-styles`.
- Event listeners привязываются один раз через guard `MapModal._initialized`.
- `saveVisitedPageIfNeeded()` оставлен на каждом init-вызове, чтобы повторная синхронизация посещённой страницы не терялась.
- Добавлен Playwright smoke `MapModal.init is idempotent on direct Tumski page`.
- Проверка после изменения: `make smoke` — 22 теста прошли на desktop/mobile.

Следующий подэтап Stage 4.2:

- вынести `modalHTML` в pure template helper внутри `map_modal.js`;
- сохранить exact ids/classes;
- после smoke решить, нужен ли отдельный `map_modal_template.js`.

## Status Update - 2026-06-27 - Stage 4.2

Stage 4.2 выполнен:

- inline `modalHTML` вынесен из `MapModal.init()` в pure helper `getMapModalTemplate()`.
- DOM insertion вынесен в `ensureMapModalDom()`.
- `MapModal.init()` сохранил порядок: `ensureMapModalStyles()`, `ensureMapModalDom()`, `saveVisitedPageIfNeeded()`, затем `_initialized` guard.
- Exact ids/classes закреплены в Playwright smoke через DOM contract selectors для карты, book overlay, most overlay, audio nodes и quest confirm dialog.
- Проверка после изменения: `make smoke` - 22 теста прошли на desktop/mobile.

Следующий подэтап Stage 4.3:

- решить, выносить ли template в отдельный `map_modal_template.js`;
- если переносить, сохранить совместимость load order для direct pages и iframe pages;
- после этого переходить к style extraction или marker navigation isolation.

## Status Update - 2026-06-27 - Stage 4.3

Stage 4.3 выполнен:

- Decision gate: отдельный `map_modal_template.js` отложен, потому что `map_modal.js` подключается напрямую как classic script в 54 HTML-файлах.
- Вместо отдельного template-файла выполнен более полезный следующий шаг: большой `mapStyles` вынесен из `map_modal.js` в `map_modal.css`.
- `ensureMapModalStyles()` теперь создаёт/обновляет `<link id="map-modal-styles" rel="stylesheet" href="map_modal.css">`.
- `mobileTooltipStyles` оставлен inline как маленький scoped style с отдельным id `map-modal-mobile-tooltip-styles`.
- Playwright smoke обновлён: проверяет, что основной CSS подключён как `link`, а legacy inline `style#map-modal-styles` отсутствует.
- Проверка после изменения: `make smoke` - 22 теста прошли на desktop/mobile.

Следующий подэтап Stage 4.4:

- изолировать marker navigation из `map_modal.js`;
- сохранить текущий route behavior и fallback на `location.href`;
- использовать существующие smoke checks как baseline, при необходимости добавить marker click smoke.

## Status Update - 2026-06-27 - Stage 4.4

Stage 4.4 выполнен:

- Добавлен `map_marker_navigation.js` как classic-script helper с global API `window.MapMarkerNavigation`.
- `map_modal.js` лениво подключает helper через `<script id="map-marker-navigation-script" src="map_marker_navigation.js">`, поэтому 51 runtime HTML-файл с `<script src="map_modal.js">` не менялись.
- `handleMarkerClick()` больше не содержит route decision; он закрывает карту/чистит menu, swipe и audio state, затем делегирует переход в `MapMarkerNavigation`.
- Сохранён прежний приоритет перехода: `window.SPAManager.loadPage(page)` → `window.parent.SPAManager.loadPage(page)` → `location.href = page`.
- Сохранён `sessionStorage.navigateViaMap = "1"` и delay 100 ms для второго page entry.
- Добавлены smoke checks:
  - helper сохраняет local SPA priority и fake-location fallback;
  - реальный click по `.visited-marker` делегирует переход в `MapMarkerNavigation`;
  - проверки выполняются на desktop/mobile.
- Проверка после изменения: `make smoke` - 26 тестов прошли на desktop/mobile.

Следующий подэтап Stage 4.5:

- изолировать visited markers storage/rendering из `map_modal.js`;
- оставить storage key `visitedPages` и tolerant parsing;
- не менять координаты, классы маркеров и mobile/desktop positioning.

## Status Update - 2026-06-27 - Stage 4.5

Stage 4.5 выполнен:

- Добавлен `visited_markers.js` как classic-script helper с global API `window.VisitedMarkers`.
- `map_modal.js` лениво подключает helper через `<script id="visited-markers-script" src="visited_markers.js">`, поэтому runtime HTML-файлы не менялись.
- Из `map_modal.js` вынесены current-page detection, tolerant parsing `localStorage.visitedPages`, запись посещённой страницы и render layer `#visited-markers-layer`.
- `MapModal.renderVisitedMarkers()` сохранён как публичный wrapper и передаёт `attachMarkerHandlers`, поэтому preview/navigation поведение остаётся в `map_modal.js`.
- Сохранены storage key `visitedPages`, классы `.visited-marker`, `.visited-marker-double-light`, `.visited-marker-double-dark`, `.current-page`, координаты, double-marker offsets и mobile/desktop positioning.
- Playwright smoke добавлен для invalid storage parsing, save contract, render contract и idempotent script injection.
- Проверка после изменения: `make smoke` - 28 тестов прошли на desktop/mobile.

Следующий подэтап Stage 4.6:

- изолировать quest/book overlay behavior из `map_modal.js`;
- разделить открытие/закрытие, заполнение текста, картинки и звук;
- не менять структуру данных квестов до отдельной задачи.
