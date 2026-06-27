# Stage 2 - Routing, assets и runtime bugs

## Цель

Закрыть реальные runtime-дефекты, найденные в code review и Stage 1 inventory, не меняя архитектуру шире необходимого.

## Scope

Входит:

- `MapModal.handleMarkerClick` и undefined `pages`;
- битая ссылка `tumski_06.html`;
- missing active assets/scripts;
- duplicate `id="bookSound"`;
- первичная нормализация route constants, если это нужно для фикса.

Не входит:

- большая декомпозиция `map_modal.js`;
- перенос `SPAManager` из `index.html`;
- оптимизация всех изображений;
- редизайн UI.

## Шаги

1. Исправить `MapModal.handleMarkerClick`.
   - Нормализовать аргумент в массив страниц.
   - Сохранить текущее fallback-поведение для non-SPA контекста.
   - Убрать широкий silent failure там, где можно логировать через debug logger.
   - Проверить клик по одиночному и потенциальному multi-page marker.

2. Исправить `katedra_01.html` back route.
   - Подтвердить ожидаемую страницу: вероятно `tumski06.html`.
   - Заменить `tumski_06.html` только после сверки с navigation flow.
   - Добавить этот кейс в route checker.

3. Разобрать missing assets.
   - Для каждого missing path принять одно из решений:
     - восстановить файл;
     - исправить путь на существующий;
     - удалить ссылку, если feature устарела;
     - добавить explicit expected-missing только временно и с причиной.
   - Особое внимание:
     - `media/tumski/katedra_panorama.jpg`;
     - `input_detection.js`;
     - `media/book.jpg`;
     - `media/book02.jpg`;
     - `media/Roboto-ExtraLightItalic.ttf`;
     - `media/book/quest_03.jpg`;
     - `media/book/quest_04.jpg`;
     - `media/tumski/pk_03.jpg`.

4. Исправить duplicate audio id.
   - На `katedra_panorama.html` оставить один `id="bookSound"` или заменить повторяющиеся элементы на class/data-role.
   - Проверить, какой код реально ищет `bookSound`.

5. Проверить глобальные утечки в inline scripts.
   - `tumskiTxtX = ...` и похожие assignment без `let/const` заменить на локальные объявления.
   - Делать точечно, только в проверенных местах.

6. Обновить findings.
   - В `00-code-review.md` не переписывать историю.
   - Добавить status/update section или перенести закрытые пункты в stage completion note.

## Проверки

Минимум:

```bash
make test
make build
make security
```

Ручной smoke:

- открыть cathedral page;
- нажать back arrow;
- открыть карту;
- перейти по marker из SPA и iframe;
- проверить отсутствие 404 по ассетам в browser devtools.

## Done

- Нет active 404 для перечисленных в review ассетов/скриптов.
- Route checker не видит `tumski_06.html`.
- `MapModal.handleMarkerClick` не содержит обращения к undefined `pages`.
- Duplicate-id checker чист или имеет только документированные исключения.
- Поведение SPA-навигации сохранено.

## Status Update - 2026-06-26

Выполнено:

- `MapModal.handleMarkerClick(page)` нормализует вход в массив `pages` и сохраняет fallback на `location.href`.
- `katedra_01.html` исправлен с `tumski_06.html` на `tumski06.html`.
- Active missing assets из Stage 1 allowlist закрыты:
  - cathedral background/preload переведен на существующий `media/tumski/katedra_01.jpg`;
  - book images переведены на `media/book/book_island.jpg` и `media/book/book02.jpg`;
  - отсутствующий local `Roboto-ExtraLightItalic.ttf` больше не запрашивается;
  - отсутствующие quest side images убраны из CSS background;
  - `pk02.css` больше не запрашивает отсутствующий `pk_03.jpg`.
- Active `input_detection.js` удален из cathedral pages.
- Duplicate `id="bookSound"` в `katedra_panorama.html` устранен.
- `scripts/static-check-known-issues.json` сокращен до debug/test и legacy cleanup исключений.

Осталось не в active runtime:

- debug/test pages: `input_compatibility.css`, `input_detection.js` - Stage 7 cleanup;
- `right_arrow_handler.js -> tumski_02.html` - resolved in Stage 7.3 by removing the unreferenced legacy handler.

Проверено:

```bash
make test
make lint
make test-e2e
make build
make security
make smoke
make audit
```

## Stop signals

- Оказывается, `tumski_06.html` должен существовать как отдельная новая страница.
- Missing assets невозможно восстановить без продуктового решения.
- Исправление `MapModal` меняет карту/квесты за пределами navigation flow.
