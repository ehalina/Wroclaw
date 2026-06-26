# Stage 3 - SPA shell и message boundaries

## Цель

Сделать SPA shell управляемым: описать и укрепить контракт между `index.html` и iframe-страницами, подготовить постепенный вынос inline JS из `index.html`.

## Scope

Входит:

- message contract для `postMessage`;
- проверка `event.source`, `event.origin`, `event.data`;
- замена wildcard `'*'` там, где есть безопасный same-origin target;
- подготовка SPA modules без изменения внешнего поведения;
- минимальная декомпозиция `SPAManager` и `MiniMapManager`.

Не входит:

- переписывание shell на framework;
- изменение URL scheme;
- изменение аудио UX;
- массовая правка всех страниц без Stage 5.

## Текущие риски

- `index.html` отправляет сообщения в iframe через `postMessage(..., '*')`.
- `index.html` принимает `SPA_NAVIGATE` без проверки источника.
- `tumski_page_common.js` принимает `LANGUAGE_CHANGE`/`PAGE_HASH` без source/origin guard.
- iframe отправляет language change parent-у через wildcard target.

## Шаги

1. ✅ Описать message types.
   - `AUDIO_UNLOCKED`;
   - `SPA_NAVIGATE`;
   - `LANGUAGE_CHANGE`;
   - `LANGUAGE_CHANGE_FROM_IFRAME`;
   - `PAGE_HASH`;
   - другие types, найденные inventory.

2. ✅ Создать маленький message utility.
   - `isAllowedOrigin(event)`;
   - `isActiveIframeSource(event)`;
   - `parseMessage(data)`;
   - `postToActiveIframe(type, payload)`;
   - `postToParent(type, payload)`.

3. ✅ Ввести guards без смены payload.
   - Сначала добавить проверки и оставить старый payload.
   - Проверить язык, hash navigation, audio unlock.

4. ✅ Подготовить constants.
   - Page registry;
   - стартовая страница;
   - audio route policy;
   - iframe selectors.

5. 🚧 Начать вынос из `index.html`.
   - ✅ Первый безопасный вынос: pure constants/config.
   - ✅ Второй: message helpers.
   - Третий: SPA lifecycle methods.
   - Четвертый: MiniMapManager.

6. 🚧 Добавить smoke для SPA boundary/config.
   - ✅ iframe -> parent navigation;
   - ✅ parent -> iframe language change;
   - ✅ page registry/audio route policy/selectors config;
   - audio unlock notification;
   - hash handoff.

## Status Update - 2026-06-26

Первый проход Stage 3 выполнен.

Сделано:

- добавлен `spa_message_contract.js` с known message types, origin/source guards и same-origin `postToFrame`/`postToParent`;
- `index.html` подключает контракт до legacy-скриптов;
- центральные listeners в `index.html`, `common.js`, `tumski.html`, `tumski_page_common.js`, `map_modal.js` валидируют schema/source/origin;
- исходящие сообщения в `index.html`, `language_menu.js`, `map_modal.js`, `tumski_page_common.js`, `tumski21.html` больше не используют прямой wildcard target;
- добавлен execution-plan: `docs/refactoring/stage-03-execution-plan.md`;
- добавлены Playwright smoke-проверки для `SPA_NAVIGATE` и `LANGUAGE_CHANGE` boundary.

## Status Update - 2026-06-26, Stage 3.2

Второй проход Stage 3 выполнен.

Сделано:

- добавлен `spa_config.js` с page registry, стартовой страницей, iframe selectors и audio route policy;
- `index.html` подключает config до inline SPA module;
- `SPAManager` использует config для стартовой страницы, keyboard prev/next navigation, active iframe lookup и выбора фонового трека;
- дублированная audio-policy в `soundControl` unmute path заменена на тот же config helper;
- добавлен Playwright smoke для `SpaConfig`: порядок страниц, selectors и audio route policy.

Отложено:

- вынос SPA lifecycle methods;
- вынос `MiniMapManager`;
- отдельные smoke для `AUDIO_UNLOCKED`, `PAGE_HASH`, `OPEN_MINI_MAP`/`OPEN_FULLSCREEN_MAP`.

Проверки:

```bash
make test
make lint
make smoke
make audit
```

Результат: все проверки прошли. `make smoke` выполняет 8 Playwright тестов на desktop/mobile.

## Проверки

```bash
make test
make build
make security
```

Браузерный smoke:

- стартовая загрузка;
- переход внутри iframe;
- back/forward history;
- смена языка;
- audio unlock;
- hash-переход на геометку.

## Done

- Message types описаны в коде и документации.
- Listener-ы проверяют source/origin/schema.
- Wildcard `'*'` удален там, где это безопасно.
- `index.html` уменьшен хотя бы за счет constants/message helpers.
- Нет изменения пользовательского navigation/audio/language behavior.

## Stop signals

- WebView/Capacitor ведет себя иначе по `event.origin`.
- Невозможно надежно определить active iframe source.
- Smoke показывает отличие history behavior.
