# Stage 5 - Content page workflow

## Цель

Сделать добавление или миграцию content pages повторяемой: HTML остаётся простым shell, page-specific данные живут в module descriptors, DOM создаётся через `PageShellHelpers`.

## Source of truth

- Статус задач и приоритеты: `BACKLOG.md`.
- Архитектурное правило: `ARCHITECTURE.md` → "Static HTML shell + page modules".
- Технический план Stage 5: `docs/refactoring/stage-05-page-template-and-i18n-consolidation.md`.
- Повторяющиеся blocks и исключения: `docs/refactoring/stage-05-page-block-inventory.md`.

## Preferred pattern для content page

1. HTML page содержит только стабильный shell:
   - common scripts/styles;
   - `#musicHint`;
   - `.scene`;
   - `.image-container[data-map-point]`;
   - `.image-scroll-wrapper > .image`;
   - `.next-image-container`;
   - `<script type="module" src="<page>_page.js"></script>`;
   - `<script type="module" src="tumski_init.js"></script>`.
2. `<page>_page.js` импортирует `PageShellHelpers`.
3. Markers описываются массивом `MARKERS`.
4. Route cursors описываются массивом `ROUTE_CURSORS`.
5. Module вызывает один renderer:

```js
PageShellHelpers.renderConfiguredPage({
    markers: MARKERS,
    routeCursors: ROUTE_CURSORS,
    routeTarget: '.image-container[data-map-point="40"] .image'
});
```

## Descriptor rules

- Coordinates должны переноситься без пересчёта и переименования.
- Existing ids/classes/data attrs являются contract: `map-mark`, `map-mark-area`, `data-quest-number`, `data-quest-image`, `data-i18n`, `data-next-page`, `data-prev-page`.
- Audio ids и src должны сохраняться, если страница уже использовала audio node.
- Для route cursors использовать только поддержанные helper types: `prosto`, `back`, `left`, `prostoLeft`, `default`.
- Для нестандартной страницы не расширять helper сразу; сначала добавить page smoke и зафиксировать special case.

## Smoke contract для миграции страницы

Перед изменением production page добавить или расширить Playwright smoke:

- `sceneCount`;
- `imageCount`;
- `imageContainerMapPoint`;
- `nextImageContainers`;
- marker count и marker ids/order;
- marker i18n keys;
- marker quest attrs, если есть;
- marker audio src, если есть;
- route cursor classes;
- route target attrs;
- наличие `<page>_page.js` module script.

## Проверки

Минимум для одной page migration:

```bash
make test
make smoke
```

После нескольких page migrations или изменения helper-а:

```bash
make audit
```

## Rollout rule

- Мигрировать по одной странице или одному маленькому семейству страниц.
- Не мигрировать exception pages первым проходом: `index.html`, `tumski.html`, `tumski02.html`, `katedra_*`, standalone/debug pages.
- Если page module требует больше custom logic, остановиться и оформить отдельный decision gate в Stage 5 doc.
- После каждого rollout обновлять `BACKLOG.md` и Stage 5 status notes.
