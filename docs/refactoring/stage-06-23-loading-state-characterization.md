# Stage 6.23 - SPA loading state characterization

Дата: 2026-06-27

## Цель

Зафиксировать текущее поведение loading overlay при медленной SPA-навигации перед любыми UX-изменениями loading states.

Этот шаг не меняет runtime behavior. Он добавляет проверяемый oracle для будущего улучшения planned BACKLOG item `Loading States`.

## Проверяемый сценарий

Маршрут:

- initial SPA shell: `/`;
- стартовый iframe: `tumski.html`;
- искусственно задержанная навигация: `SPAManager.loadPage('tumski02.html')`.

Ожидания:

- перед навигацией `#loadingOverlay` скрыт;
- во время задержки `#loadingOverlay` видим и содержит `Loading...`;
- во время задержки активный iframe остаётся старой страницей `tumski.html`, то есть экран не становится пустым;
- новая страница уже добавлена в DOM, но не активирована до `iframe.onload`;
- после загрузки `#loadingOverlay` снова скрыт;
- после загрузки активный iframe становится `tumski02.html`;
- `pageErrors` пустые.

## Реализация

Добавлено:

- `playwright.stage-06-23.config.mjs`;
- `tools/stage-06-23/loading-state-characterization.spec.mjs`;
- `make stage-06-23-loading-state`.

Playwright route intercept задерживает только запрос `tumski02.html`, чтобы получить стабильное промежуточное состояние loading overlay на desktop/mobile.

## Артефакты

Созданы:

- `docs/refactoring/artifacts/stage-06-23-loading-state/desktop-loading-overlay.png`;
- `docs/refactoring/artifacts/stage-06-23-loading-state/desktop-after-navigation.png`;
- `docs/refactoring/artifacts/stage-06-23-loading-state/desktop-loading-state.json`;
- `docs/refactoring/artifacts/stage-06-23-loading-state/mobile-pixel5-loading-overlay.png`;
- `docs/refactoring/artifacts/stage-06-23-loading-state/mobile-pixel5-after-navigation.png`;
- `docs/refactoring/artifacts/stage-06-23-loading-state/mobile-pixel5-loading-state.json`.

Observed baseline:

- desktop during slow navigation:
  - `overlayVisible=true`;
  - `activeIframeSrc=tumski.html?...`;
  - `pageCount=2`;
  - `pageErrors=[]`.
- mobile Pixel 5 during slow navigation:
  - `overlayVisible=true`;
  - `activeIframeSrc=tumski.html?...`;
  - `pageCount=2`;
  - `pageErrors=[]`.
- after navigation on both projects:
  - `overlayVisible=false`;
  - `activeIframeSrc=tumski02.html?...`.

## Validation

```bash
node --check playwright.stage-06-23.config.mjs
node --check tools/stage-06-23/loading-state-characterization.spec.mjs
make stage-06-23-loading-state
```

Result:

- 2 Playwright tests passed on desktop/mobile.

Known local-server note:

- Python `http.server` can print `BrokenPipeError` when Playwright closes a page while assets are still being streamed. This was observed after assertions had already passed and matches existing local smoke noise.

## Decision

Stage 6.23 is characterization-only.

Next safe loading-state step can change implementation behind this oracle, for example:

- extract loading overlay helpers from `index.html`;
- add route-load timeout/error state;
- improve loading overlay visual/translated text.
