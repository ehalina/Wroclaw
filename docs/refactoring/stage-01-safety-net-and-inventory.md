# Stage 1 - Safety Net и inventory

## Цель

Создать минимальную проверочную сетку до архитектурных изменений. Этот этап не должен менять пользовательское поведение.

## Почему первым

Code review показал, что стандартные команды `make lint`, `make typecheck`, `make test` сейчас в основном заглушки. Без baseline дальнейший рефакторинг `index.html`, `map_modal.js`, маршрутов и локализации будет слишком рискованным.

## Scope

Входит:

- inventory runtime HTML/JS/CSS/assets;
- checker для локальных ссылок и ассетов;
- checker для `window.location.href` и других route targets;
- duplicate-id checker;
- JS syntax check;
- translation key consistency checker;
- документированный smoke checklist для ручной браузерной проверки.

Не входит:

- исправление найденных багов, кроме если checker невозможно запустить;
- перенос логики по файлам;
- оптимизация изображений.

## Шаги

1. Зафиксировать список runtime entrypoints.
   - `index.html`;
   - страницы `tumski*.html`, `katedra*.html`, `pk*.html`, `most*.html`, `book*.html`;
   - runtime JS, подключаемые из HTML;
   - CSS, подключаемые из HTML.

2. Добавить постоянный JS syntax check.
   - Проверять только runtime `.js`, исключая `www`, `node_modules`, backup/temp.
   - Команда должна быть доступна через `make test` или `make smoke`.

3. Добавить local asset/link checker.
   - Проверять `src`, `href`, CSS `url(...)`, inline style `url(...)`.
   - Игнорировать внешние URL, anchors, `mailto:`, `tel:`.
   - Явно поддержать пробелы в именах файлов.

4. Добавить route target checker.
   - Искать `window.location.href = '...'`.
   - Искать `location.href = ...` там, где значение статическое.
   - Проверять существование локального HTML target.
   - Сформировать allowlist только если route создается динамически.

5. Добавить duplicate-id checker.
   - Проверять каждый HTML документ отдельно.
   - Исключить ложные срабатывания на `data-*-id`.

6. Добавить translation checker.
   - Выбрать canonical файл локализации после проверки runtime.
   - Сравнивать набор ключей между языками.
   - Отдельно репортить HTML-теги в переводах.

7. Обновить `make test`.
   - Пока проект без unit tests, `make test` должен запускать smoke baseline.
   - Если нужно оставить старое поведение, добавить `make smoke` и вызывать его из `make test`.

8. Описать ручной smoke checklist.
   - загрузка `index.html`;
   - переходы вперед/назад;
   - открытие карты;
   - клик по нескольким маркерам;
   - открытие квеста;
   - смена языка;
   - audio unlock;
   - mobile viewport.

## Candidate files

- `Makefile`;
- `scripts/` или существующая директория для project scripts;
- `package.json`;
- `docs/refactoring/`.

## Проверки

После этапа:

```bash
make lint
make typecheck
make test
make build
make security
```

Ожидаемый результат:

- `make test` больше не пустая заглушка;
- текущие known failures либо исправлены в Stage 2, либо зафиксированы как expected failures с явным списком;
- `www/` продолжает собираться.

## Done

- Есть постоянный baseline, который можно запускать перед каждым refactor-шагом.
- Все findings checker-ов сохранены в отчете Stage 1.
- Stage 2 может исправлять баги, не споря о том, как их обнаруживать.

## Stop signals

- Checker показывает сотни нерелевантных false positives.
- Для маршрутов нет понятного canonical source.
- `make build` начинает менять неожиданные tracked files.

