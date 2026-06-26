# Template/static generation POC result

Дата: 2026-06-26  
Gate: `docs/refactoring/02-technology-review-gate.md`  
Статус: adopt as Stage 5 candidate, no production migration yet

## Candidate

Runtime-light page templating через metadata + static HTML generation.

Проверенный POC:

- metadata: `tools/template-poc/pages.json`;
- generator: `tools/template-poc/generate.mjs`;
- generated samples:
  - `tools/template-poc/generated/tumski05.html`;
  - `tools/template-poc/generated/tumski06.html`;
- запуск: `make poc-template`.

## Problem Solved

Текущие tour pages вручную копируют одинаковые блоки:

- common head links/scripts;
- marker DOM;
- arrow DOM с координатами;
- scene/image wrapper;
- `tumski_init.js` подключение.

POC показывает, что для data-driven страниц этот повтор можно выразить metadata без изменения runtime JS.

## Files Touched

- `Makefile` - добавлен target `poc-template`;
- `tools/template-poc/pages.json` - metadata для двух страниц;
- `tools/template-poc/generate.mjs` - генератор static HTML;
- `tools/template-poc/generated/*.html` - POC output.

Production pages не менялись.

## Validation

```bash
make poc-template
make test
make lint
make smoke
make audit
```

Результат:

- generator создает 2 static pages;
- generated HTML проходит static inventory;
- JS syntax/lint baseline не ломается;
- output находится в `tools/` и не попадает в `www/` через `make build`.

Дополнительно:

- static inventory и JS syntax checker теперь игнорируют `test-results/` и `playwright-report/`, чтобы Playwright artifacts не попадали в project scan.

## Decision

Adopt for Stage 5 as an internal, incremental generator pattern.

Не внедрять Eleventy/Nunjucks прямо сейчас:

- текущий POC закрывает главный риск без dependency install и без build-pipeline migration;
- для 1-2 страниц внешняя SSG-библиотека добавляет больше процесса, чем пользы;
- если metadata workflow расширится на десятки страниц, можно снова сравнить с Eleventy/Nunjucks.

Не внедрять Vite сейчас:

- path/build migration не нужна для Stage 3 message boundary;
- текущие Makefile checks уже дают достаточный feedback loop.

Не внедрять Howler.js сейчас:

- Stage 2 убрал часть audio DOM debt;
- отдельный audio POC нужен только после Stage 3/Audio Unlock work, если lifecycle останется хрупким.

Не внедрять i18next сейчас:

- текущую локализацию сначала нужно укрепить безопасным `textContent` по умолчанию и key checker strict mode.

## Stage 5 Recommendation

1. Не мигрировать старые страницы массово.
2. Начать с новой или низкорисковой страницы.
3. Сгенерированный HTML должен оставаться обычным static HTML.
4. Production migration делать по одной странице:
   - добавить metadata;
   - сгенерировать output;
   - сравнить DOM-critical blocks;
   - прогнать `make test`, `make test-e2e`, `make build`;
   - заменить production page только после smoke.
