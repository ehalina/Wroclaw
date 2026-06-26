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

1. Выбрать canonical localization source.
   - Runtime сейчас использует `translations.json`.
   - Проверить, где используются `translation.json`.
   - Зафиксировать одно имя как source of truth.

2. Добавить checker ключей.
   - Все языки имеют одинаковый набор ключей.
   - Отсутствующие ключи показываются как failures.
   - Лишние ключи показываются отдельно.

3. Разделить text и rich HTML.
   - В `i18n.js` по умолчанию писать `textContent`.
   - Создать allowlist ключей, которым разрешен `innerHTML`.
   - Для rich keys добавить sanitizer или строго контролируемый набор тегов.

4. Упростить `updatePageContent`.
   - Убрать повторные специальные проходы, если общий механизм покрывает `.audio-unlock-text`.
   - Сохранить compatibility для текущих страниц.

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
