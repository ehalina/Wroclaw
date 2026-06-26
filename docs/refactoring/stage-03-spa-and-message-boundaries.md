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

1. Описать message types.
   - `AUDIO_UNLOCKED`;
   - `SPA_NAVIGATE`;
   - `LANGUAGE_CHANGE`;
   - `LANGUAGE_CHANGE_FROM_IFRAME`;
   - `PAGE_HASH`;
   - другие types, найденные inventory.

2. Создать маленький message utility.
   - `isAllowedOrigin(event)`;
   - `isActiveIframeSource(event)`;
   - `parseMessage(data)`;
   - `postToActiveIframe(type, payload)`;
   - `postToParent(type, payload)`.

3. Ввести guards без смены payload.
   - Сначала добавить проверки и оставить старый payload.
   - Проверить язык, hash navigation, audio unlock.

4. Подготовить constants.
   - Page registry;
   - стартовая страница;
   - audio route policy;
   - iframe selectors.

5. Начать вынос из `index.html`.
   - Первый безопасный вынос: pure constants/config.
   - Второй: message helpers.
   - Третий: SPA lifecycle methods.
   - Четвертый: MiniMapManager.

6. Добавить smoke для SPA boundary.
   - iframe -> parent navigation;
   - parent -> iframe language change;
   - audio unlock notification;
   - hash handoff.

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

