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

- `arrow_handlers.js.backup`;
- `quest_marker_handler.js.new`;
- `sunset_parallax copy.js`;
- устаревшие localization duplicates после Stage 5;
- unreferenced assets после Stage 6.

Перед удалением:

- проверить references через checker;
- проверить git history при необходимости;
- убедиться, что файл не нужен для восстановления контента;
- сделать удаление отдельным маленьким изменением.

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

