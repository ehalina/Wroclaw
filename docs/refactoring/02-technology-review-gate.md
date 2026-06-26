# Technology Review Gate

Дата: 2026-06-26  
Контекст: решение о готовых технологиях после Stage 1-2  
Текущий stack: vanilla HTML/CSS/JS + Capacitor

## Уже принято

Runtime framework сейчас не внедряем. Полный переход на React/Vue/Svelte/Angular является rewrite, а не refactor, потому что текущая сложность проекта находится в iframe SPA shell, маршрутах, ассетах, карте, квестах, аудио, локализации и Capacitor build.

Внедрены технологии для safety net:

- ESLint;
- Playwright;
- Node-based static checkers;
- Makefile targets для `lint`, `test`, `test-e2e`, `smoke`.

## Когда проводить gate

Gate проводится после:

1. Stage 1 baseline стабилен.
2. Stage 2 закрыл критичные runtime defects:
   - `MapModal.handleMarkerClick`/`pages`;
   - `tumski_06.html`;
   - active missing assets/scripts;
   - duplicate `bookSound`.

## Кандидаты

### Howler.js

Проверять, если audio unlock, route transitions и дубли audio nodes останутся хрупкими после Stage 2.

POC:

- только один flow: unified background music + one page transition;
- без миграции всех звуков;
- сравнить поведение desktop/mobile/Capacitor WebView.

Решение "да", если:

- код audio lifecycle заметно проще;
- unlock behavior стабильнее;
- нет проблем с Capacitor.

Решение "нет", если:

- библиотека только оборачивает текущую сложность;
- WebView/autoplay restrictions не становятся понятнее.

### Vite

Проверять не как framework migration, а как dev/build слой для ES modules и asset handling.

POC:

- отдельная ветка/папка;
- 1-2 страницы;
- сохранить текущие relative paths;
- проверить Capacitor `www`.

Решение "да", если:

- сборка становится понятнее;
- modules/imports проще проверять;
- assets не ломаются;
- dev server ускоряет feedback loop.

Решение "нет", если:

- path rewrite ломает HTML pages;
- сборка требует большой миграции всех страниц.

### Templating / Static Site Generation

Наиболее вероятный runtime-light кандидат для сокращения HTML duplication.

Варианты:

- Eleventy/Nunjucks;
- простой собственный генератор из page metadata;
- shared JS helpers без генератора, если этого достаточно.

POC:

- сгенерировать 1-2 похожие страницы;
- сохранить итоговый static HTML;
- проверить `make test`, `make build`, `make test-e2e`.

Решение "да", если:

- head/scripts/audio/arrows/page metadata перестают копироваться вручную;
- output остается простым static HTML;
- non-generated legacy pages могут сосуществовать.

Решение "нет", если:

- генератор требует переписать весь контент сразу;
- source/output mapping становится сложнее, чем текущий HTML.

### i18next

Пока не внедрять. Вернуться к нему только если появятся pluralization, interpolation, namespace fallback или внешний localization workflow.

До этого дешевле укрепить текущий `i18n.js`:

- `textContent` по умолчанию;
- allowlist rich HTML keys;
- translation key checker.

## Правила POC

1. POC не должен менять production flow.
2. POC должен затрагивать максимум 1-2 страницы или один subsystem.
3. До POC должны проходить:

```bash
make lint
make test
make test-e2e
make build
make security
```

4. После POC должен быть короткий ADR:
   - candidate;
   - problem solved;
   - files touched;
   - result;
   - decision: adopt / reject / postpone.

## Текущая рекомендация

После Stage 2 первым проверять templating/static generation, потому что это напрямую бьет в HTML duplication и Full Localization из `BACKLOG.md`.

Howler.js проверять только если аудио остается источником дефектов.

Vite проверять после того, как routes/assets стали чистыми, иначе POC будет диагностировать старые path-проблемы, а не пользу Vite.

## Gate Result - 2026-06-26

Выполнен POC для templating/static generation:

- `tools/template-poc/pages.json`;
- `tools/template-poc/generate.mjs`;
- `tools/template-poc/generated/tumski05.html`;
- `tools/template-poc/generated/tumski06.html`;
- запуск через `make poc-template`.

Решение:

- принять internal metadata + static generator как Stage 5 candidate;
- не добавлять Eleventy/Nunjucks до массовой миграции страниц;
- Vite отложить до завершения SPA/message boundary и page-template cleanup;
- Howler.js отложить до отдельного audio lifecycle POC, если Audio Unlock Improvement останется хрупким;
- i18next не внедрять до появления pluralization/interpolation/external workflow.

Детали: `docs/refactoring/02-template-poc-result.md`.
