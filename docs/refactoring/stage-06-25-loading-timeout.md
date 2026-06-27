# Stage 6.25 - SPA loading timeout state

Дата: 2026-06-27

## Цель

Добавить bounded timeout для зависшей iframe-навигации, чтобы loading overlay не мог оставаться вечным чёрным экраном.

Stage 6.24 уже вынес overlay control в `SpaLoadingState`; Stage 6.25 использует этот helper для error state.

## Изменения

`spa_config.js`:

- добавлен `IFRAME_LOAD_TIMEOUT_MS = 15000`.

`spa_loading_state.js`:

- добавлены message constants:
  - `DEFAULT_LOADING_MESSAGE = 'Loading...'`;
  - `DEFAULT_ERROR_MESSAGE = 'Loading failed. Please try again.'`;
- добавлены `setMessage(message, root)` и `showError(root)`;
- `show()` сбрасывает текст к loading message;
- `hide()` также возвращает loading message, чтобы следующий normal load начинался с `Loading...`.

`index.html`:

- `loadPage()` ставит timeout на новый iframe load;
- при timeout/error:
  - timeout очищается;
  - pending page container удаляется из DOM;
  - pending page удаляется из `this.pages`;
  - current active page остаётся прежней;
  - overlay остаётся видимым с error message;
  - поздний `iframe.onload` после timeout игнорируется.
- для тестов есть debug override `window.__SPA_IFRAME_LOAD_TIMEOUT_MS`.

## Проверяемый сценарий

Добавлено:

- `playwright.stage-06-25.config.mjs`;
- `tools/stage-06-25/loading-timeout.spec.mjs`;
- `make stage-06-25-loading-timeout`.

Playwright подвешивает запрос `tumski02.html`, выставляет timeout override `250ms`, затем проверяет:

- active iframe остаётся `tumski.html`;
- `window.spaManager.currentPage` остаётся `tumski.html`;
- `#loadingOverlay` видим;
- overlay text: `Loading failed. Please try again.`;
- pending target page удалён из DOM и `spaManager.pages`;
- `pageErrors=[]`.

## Артефакты

Созданы:

- `docs/refactoring/artifacts/stage-06-25-loading-timeout/desktop-timeout-error.png`;
- `docs/refactoring/artifacts/stage-06-25-loading-timeout/desktop-loading-timeout.json`;
- `docs/refactoring/artifacts/stage-06-25-loading-timeout/mobile-pixel5-timeout-error.png`;
- `docs/refactoring/artifacts/stage-06-25-loading-timeout/mobile-pixel5-loading-timeout.json`.

Observed baseline after timeout:

- desktop:
  - `currentPage=tumski.html`;
  - `overlayVisible=true`;
  - `pageCount=1`;
  - `pagesHasTarget=false`;
  - `targetPageNodes=0`;
  - `pageErrors=[]`.
- mobile Pixel 5:
  - `currentPage=tumski.html`;
  - `overlayVisible=true`;
  - `pageCount=1`;
  - `pagesHasTarget=false`;
  - `targetPageNodes=0`;
  - `pageErrors=[]`.

## Validation

```bash
node --check spa_config.js
node --check spa_loading_state.js
node --check playwright.stage-06-25.config.mjs
node --check tools/stage-06-25/loading-timeout.spec.mjs
make stage-06-25-loading-timeout
```

Result:

- 2 Playwright timeout tests passed on desktop/mobile.

## Next safe step

Stage 6.26 should keep loading/error behavior stable and can focus on small UX polish only if it has a clear visual oracle, or move to the next BACKLOG item outside Stage 6 performance.
