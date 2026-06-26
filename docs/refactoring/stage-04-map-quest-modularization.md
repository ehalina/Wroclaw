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

1. Сделать `MapModal.init()` идемпотентным.
   - Если DOM уже есть, не вставлять повторно.
   - Если style уже есть, не добавлять повторный `<style>`.
   - Если listeners уже привязаны, не дублировать.

2. Вынести template без логики.
   - Сначала как функция в том же файле.
   - Потом отдельный файл, если smoke чистый.
   - Сохранить exact DOM ids/classes.

3. Вынести style injection.
   - Добавить stable `id` для style element.
   - Проверить, что CSS порядок не ломается.

4. Изолировать marker navigation.
   - Использовать fix из Stage 2 как baseline.
   - Не менять route behavior.

5. Изолировать visited markers.
   - Оставить текущий storage key.
   - Добавить функции чтения/записи с tolerant parsing.
   - Проверить старые данные в localStorage.

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

