# Stage 3 Execution Plan - SPA shell и message boundaries

Дата старта: 2026-06-26

## Цель шага

Укрепить контракт `postMessage` между `index.html` и iframe-страницами без смены пользовательского поведения навигации, языка, карты и аудио.

## Message Inventory

Parent -> iframe:

- `AUDIO_UNLOCKED` - SPA уведомляет активную страницу, что аудио разблокировано.
- `AUDIO_UNLOCK_CLICKED` - legacy-кнопка разблокировки просит iframe включить звук.
- `LANGUAGE_CHANGE` - SPA/языковое меню передает новый язык активному iframe.
- `OPEN_FULLSCREEN_MAP` - мини-карта в parent просит iframe открыть полноэкранную карту.
- `PAGE_HASH` - SPA передает hash уже загруженному или новому iframe.
- `PAGE_SHOWN` - SPA сообщает iframe, что страница снова стала активной.

Iframe -> parent:

- `LANGUAGE_CHANGE_FROM_IFRAME` - iframe синхронизирует язык с parent.
- `OPEN_MINI_MAP` - iframe просит parent открыть мини-карту.
- `soundControl` - iframe просит parent mute/unmute фоновую музыку.
- `SPA_NAVIGATE` - iframe просит SPA перейти на другую HTML-страницу.

## Безопасный порядок

1. Ввести `spa_message_contract.js` как маленький UMD-style global helper.
2. Подключить helper в `index.html` до общих legacy-скриптов.
3. Перевести исходящие сообщения shell/common-модулей на same-origin target через helper.
4. Добавить guards для входящих сообщений:
   - schema: объект с известным `type`;
   - origin: текущий origin, fallback только для opaque/file origin;
   - source: active iframe для iframe -> parent, parent для parent -> iframe.
5. Оставить payload-ы совместимыми.
6. Добавить Playwright smoke на валидный и невалидный source.
7. Обновить Stage 3 docs и прогнать стандартные проверки.

## Что не трогаем в этом шаге

- Не выносим `SPAManager` и `MiniMapManager` в отдельные классы.
- Не меняем URL/hash scheme.
- Не меняем аудио UX.
- Не массово редактируем все HTML ради подключения helper.

## Done для этого шага

- Новый message contract есть в коде и документации.
- Центральные listeners отбрасывают неподходящие source/origin/schema.
- Wildcard target заменен в центральных потоках и известных legacy-точках, где same-origin безопасен.
- Smoke покрывает игнор неактивного/невалидного отправителя и валидную iframe-навигацию.
