# Stage 2 execution plan - runtime fixes

Дата старта: 2026-06-26  
Режим: bugfix/refactor  
Source of truth: `BACKLOG.md`  
Методология: `agent-programming-planner`, `safe-refactoring-playbook`

## Recommended Approach

Name: маленькие behavior-preserving fixes с сокращением allowlist.

Why:

- Stage 1 уже дал baseline через `make test`, `make test-e2e`, `make smoke`.
- Stage 2 закрывает конкретные runtime-дефекты из code review, а не меняет архитектуру.
- Каждый исправленный 404/route/duplicate-id должен удаляться из `scripts/static-check-known-issues.json`.

## Scope

Входит:

- исправить `MapModal.handleMarkerClick(page)` без смены public API;
- исправить `tumski_06.html` на существующий `tumski06.html`;
- убрать active 404 по cathedral/book/font/quest/pk assets;
- убрать active missing `input_detection.js` из cathedral pages;
- убрать duplicate `id="bookSound"`;
- заменить неявные globals `tumskiTxtX`/`tumskiTxt` на локальные `const`.

Не входит:

- удаление legacy/debug страниц;
- восстановление отсутствующих оригинальных изображений, если в репозитории нет исходника;
- декомпозиция `map_modal.js`;
- смена runtime framework/build tool.

## Implementation Order

1. Навигация и route:
   - нормализовать аргумент `handleMarkerClick` в массив;
   - сохранить одиночный `string` как основной сценарий;
   - оставить delayed second page только если caller передал массив;
   - заменить `tumski_06.html`.

2. Active assets:
   - заменить отсутствующие `media/book.jpg` и `media/book02.jpg` на существующие `media/book/book_island.jpg` и `media/book/book02.jpg`;
   - убрать битый локальный `@font-face` для `Roboto-ExtraLightItalic.ttf`;
   - убрать отсутствующие side background URLs в quest overlay;
   - убрать default `pk_03.jpg` из `pk02.css`, потому что реальные next images выставляются обработчиками переходов;
   - заменить отсутствующий cathedral panorama asset на существующий cathedral fallback `media/tumski/katedra_01.jpg` до продуктового восстановления отдельной панорамы.

3. DOM/id hygiene:
   - оставить один `id="bookSound"` на `katedra_panorama.html`;
   - второй audio элемент заменить на `class="book-sound"` или убрать, если не используется;
   - локализовать `tumskiTxtX`/`tumskiTxt`.

4. Inventory:
   - удалить закрытые entries из `static-check-known-issues.json`;
   - оставить debug/test и legacy handler entries до Stage 7 cleanup.

5. Validation:
   - `make test`;
   - `make lint`;
   - `make test-e2e`;
   - `make build`;
   - `make security`;
   - при необходимости `make smoke`/`make audit`.

## Assumptions

- `tumski06.html` является правильным route target, потому что он используется в других страницах, `map_points.js`, `index.html` и `user_account.js`.
- Отдельный `media/tumski/katedra_panorama.jpg` отсутствует в репозитории; временный fallback лучше runtime 404, но отдельный ассет можно восстановить позже как content task.
- Debug/test страницы не являются active production tour runtime, поэтому их missing compatibility assets остаются известным Stage 7 cleanup.

## Progress

- [x] Execution plan создан.
- [x] Navigation/runtime route fixes.
- [x] Active asset fixes.
- [x] Duplicate id/global leak fixes.
- [x] Known issues allowlist сокращен.
- [x] Validation пройдена.

## Execution Notes - 2026-06-26

- `MapModal.handleMarkerClick(page)` теперь принимает и строку, и массив страниц без `ReferenceError`.
- `katedra_01.html` возвращает на существующий `tumski06.html`.
- Active 404 по cathedral/book/font/quest/pk assets закрыты без добавления новых runtime dependencies.
- `input_detection.js` удален из active cathedral pages; debug/test references оставлены до Stage 7 cleanup.
- `katedra_panorama.html` больше не содержит duplicate `id="bookSound"`.
- Неявные globals `tumskiTxtX` и `tumskiTxt` заменены на локальные `const` в cathedral pages.
- `make test`, `make lint`, `make test-e2e`, `make build`, `make security`, `make smoke`, `make audit` прошли.
