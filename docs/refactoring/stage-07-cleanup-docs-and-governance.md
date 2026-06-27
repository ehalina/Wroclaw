# Stage 7 - Cleanup, docs и governance

## Цель

Завершить рефакторинг так, чтобы проектная документация и рабочие правила соответствовали фактическому коду.

## Scope

Входит:

- удаление или архивирование временных файлов;
- обновление `BACKLOG.md`;
- обновление `ARCHITECTURE.md`;
- обновление `README.md`;
- обновление `AGENTS.md`, если появились новые правила;
- фиксация новых Makefile commands;
- финальный review.

Не входит:

- изменение статусов в `BACKLOG.md` без реальной реализации;
- release/commit/push без явной команды пользователя;
- cleanup, который меняет runtime behavior.

## Кандидаты на cleanup

- ✅ `arrow_handlers.js.backup` - removed in Stage 7.1;
- ✅ `quest_marker_handler.js.new` - removed in Stage 7.1;
- ✅ `sunset_parallax copy.js` - removed in Stage 7.1;
- устаревшие localization duplicates после Stage 5;
- unreferenced assets после Stage 6.

Перед удалением:

- проверить references через checker;
- проверить git history при необходимости;
- убедиться, что файл не нужен для восстановления контента;
- сделать удаление отдельным маленьким изменением.

## Status Update - 2026-06-27 - Stage 7.1

Stage 7.1 выполнен:

- Удалены root-level temporary JS files:
  - `arrow_handlers.js.backup`;
  - `quest_marker_handler.js.new`;
  - `sunset_parallax copy.js`.
- Перед удалением проверено:
  - runtime references отсутствуют по `rg`;
  - `scripts/check-js-syntax.mjs` уже пропускал `.backup`, `.new` и ` copy.` файлы;
  - `scripts/build-capacitor-web.mjs` уже исключал `.backup`, `.new` и ` copy.` файлы из package build.
- Runtime behavior не менялся.
- Validation: `make audit` passed; build summary remains `332 files, 84.5 MB -> www/`.

Следующий подэтап:

- Stage 7.2: cleanup known static inventory allowlist entries for debug/test pages or legacy route entry, one category at a time.

## Status Update - 2026-06-27 - Stage 7.2

Stage 7.2 выполнен:

- `debug_styles.html` и `quick_test.html` больше не ссылаются на отсутствующие:
  - `input_compatibility.css`;
  - `input_detection.js`.
- Для этих debug/test страниц добавлен маленький inline input-mode detector, который:
  - уважает `localStorage.input-type-override`;
  - выставляет `html[data-input-type]` через pointer/touch detection;
  - сохраняет существующие кнопки `Desktop режим` / `Touch режим`.
- `scripts/static-check-known-issues.json` больше не содержит `missingAssets` allowlist entries.
- Runtime tour pages не менялись.
- Validation: `make audit` passed; static inventory now reports only the remaining known route entry.

Следующий подэтап:

- Stage 7.3: cleanup оставшийся legacy route allowlist entry `right_arrow_handler.js -> tumski_02.html`.

## Documentation updates

`BACKLOG.md`:

- обновить статусы только для реально завершенных работ;
- добавить оставшиеся refactor debts как задачи, если они не закрыты;
- не использовать план как замену backlog.

`ARCHITECTURE.md`:

- описать новую структуру SPA modules;
- описать message contract;
- описать MapModal/Quest module boundaries;
- описать localization source of truth.

`README.md`:

- обновить команды запуска/проверок;
- добавить актуальный development workflow, если изменился;
- не перегружать внутренними деталями.

`AGENTS.md`:

- добавить project-specific правила, которые реально появились;
- указать обязательные smoke checks;
- описать, где лежат refactoring docs.

## Финальный review

Провести повторный code review по вопросам:

- остались ли P1/P2 findings из `00-code-review.md`;
- есть ли новые runtime risks;
- все ли проверки запускаются через Makefile;
- не появились ли новые backup/temp files;
- совпадает ли документация с фактической архитектурой.

## Проверки

```bash
make lint
make typecheck
make test
make build
make security
```

Дополнительно:

- full manual smoke checklist;
- asset/link checker;
- translation checker;
- git status review.

## Done

- Runtime tree очищен от временных файлов.
- Документация отражает фактический код.
- `BACKLOG.md` остается единственным source of truth по задачам.
- Все новые проверки описаны и запускаются через Makefile.
- Финальный review не содержит незакрытых P1/P2 без явного backlog item.

## Stop signals

- Есть незавершенные runtime fixes из Stage 2.
- Документация требует продуктовых решений.
- Cleanup затрагивает файлы, назначение которых не удалось доказать.
