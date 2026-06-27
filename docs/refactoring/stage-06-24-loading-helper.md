# Stage 6.24 - SPA loading helper extraction

Дата: 2026-06-27

## Цель

Вынести управление `#loadingOverlay` из `index.html` в маленький behavior-preserving helper, чтобы следующий loading-state шаг мог менять timeout/error UI без разрастания `SPAManager`.

## Изменения

Добавлен `spa_loading_state.js`:

- `SpaLoadingState.LOADING_OVERLAY_SELECTOR`;
- `SpaLoadingState.getOverlay(root)`;
- `SpaLoadingState.show(root)`;
- `SpaLoadingState.hide(root)`;
- `SpaLoadingState.isVisible(root)`.

`index.html`:

- подключает `spa_loading_state.js` перед SPA module;
- `SPAManager.showLoading()` делегирует в `SpaLoadingState.show(document)`;
- `SPAManager.hideLoading()` делегирует в `SpaLoadingState.hide(document)`;
- fallback остаётся локальным и сохраняет тот же class contract (`hidden`).

`tests/smoke.spec.mjs`:

- добавлен focused helper contract:
  - helper доступен на `window`;
  - selector остаётся `#loadingOverlay`;
  - `show()` снимает `hidden`;
  - `hide()` добавляет `hidden`;
  - `isVisible()` отражает computed visibility.

## Поведение

Runtime UX не менялся:

- loading overlay по-прежнему управляется классом `hidden`;
- текст overlay по-прежнему `Loading...`;
- slow iframe navigation behavior из Stage 6.23 сохраняется.

## Артефакты

Созданы:

- `docs/refactoring/artifacts/stage-06-24-loading-helper/desktop-loading-overlay.png`;
- `docs/refactoring/artifacts/stage-06-24-loading-helper/desktop-after-navigation.png`;
- `docs/refactoring/artifacts/stage-06-24-loading-helper/desktop-loading-state.json`;
- `docs/refactoring/artifacts/stage-06-24-loading-helper/mobile-pixel5-loading-overlay.png`;
- `docs/refactoring/artifacts/stage-06-24-loading-helper/mobile-pixel5-after-navigation.png`;
- `docs/refactoring/artifacts/stage-06-24-loading-helper/mobile-pixel5-loading-state.json`.

Observed baseline after extraction:

- during delayed `tumski02.html` iframe request:
  - `overlayVisible=true`;
  - `activeIframeSrc=tumski.html?...`;
  - `pageCount=2`;
  - `pageErrors=[]`.
- after navigation:
  - `overlayVisible=false`;
  - `activeIframeSrc=tumski02.html?...`.

## Validation

```bash
node --check spa_loading_state.js
node --check tests/smoke.spec.mjs
make stage-06-24-loading-helper
```

Result:

- 2 Playwright loading-state tests passed on desktop/mobile.

## Next safe step

Stage 6.25 can add a bounded iframe loading timeout/error state using `SpaLoadingState` without mixing helper extraction and UX behavior changes in one commit.
