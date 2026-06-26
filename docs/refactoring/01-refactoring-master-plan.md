# Верхнеуровневый план рефакторинга

Дата: 2026-06-26  
Язык плана: русский  
Source of truth по продуктовым задачам: `BACKLOG.md`  
Входной review: `docs/refactoring/00-code-review.md`  
Методология: `safe-refactoring-playbook`, `agent-programming-planner`

## Цель

Провести крупный рефакторинг без потери текущего поведения приложения: SPA shell, iframe-навигация, карта, геометки, квесты, локализация, аудио и Capacitor build должны продолжать работать.

Рефакторинг должен поддержать актуальные задачи из `BACKLOG.md`:

- Development Phase 2: Content & Localization;
- Content Completion;
- Full Localization;
- Performance Optimization;
- Missing GeoMarkers;
- Audio Unlock Improvement;
- Error Handling;
- Loading States;
- Documentation.

## Основной принцип

Сначала фиксируем наблюдаемое поведение и закрываем runtime-дефекты. Потом двигаем код маленькими этапами.

Запрещено начинать с большого перемещения файлов, пока нет:

- минимального smoke baseline;
- списка активных страниц/ассетов;
- понятного route inventory;
- зафиксированных критичных runtime fixes из code review.

## Границы

Входит:

- safety net для refactoring sprint;
- исправление выявленных runtime-багов;
- декомпозиция SPA shell и iframe message boundary;
- декомпозиция `map_modal.js`;
- нормализация page templates, ассетов и i18n;
- performance/package-size этап;
- документация и governance.

Не входит на первом проходе:

- смена стека на React/Vue/Next;
- переписывание на TypeScript;
- изменение визуального дизайна без отдельной задачи;
- изменение маршрутов/контента без сверки с `BACKLOG.md`;
- массовая оптимизация изображений без визуальной проверки.

## Порядок этапов

| Этап | Документ | Цель | Можно начинать после |
|---|---|---|---|
| 1 | `stage-01-safety-net-and-inventory.md` | Создать проверочную сетку и inventory | Сейчас |
| 2 | `stage-02-routing-assets-and-runtime-bugs.md` | Закрыть runtime-дефекты из review | Stage 1 baseline |
| Gate | `02-technology-review-gate.md` | Решить, нужны ли Howler/Vite/templating через маленький POC | Stage 1-2 |
| 3 | `stage-03-spa-and-message-boundaries.md` | Укрепить SPA shell и `postMessage` contract | Stage 2 |
| 4 | `stage-04-map-quest-modularization.md` | Разделить карту/квесты без смены поведения | Stage 2, частично Stage 3 |
| 5 | `stage-05-page-template-and-i18n-consolidation.md` | Нормализовать страницы и локализацию | Stage 2 |
| 6 | `stage-06-performance-and-capacitor-package.md` | Уменьшить вес и стабилизировать WebView | Stage 1-5 частично |
| 7 | `stage-07-cleanup-docs-and-governance.md` | Убрать мусор, обновить docs/backlog | После основных изменений |

## Runbook каждого refactor-шагa

1. Сверить задачу с `BACKLOG.md`.
2. Сформулировать ожидаемое неизменное поведение.
3. Добавить или обновить проверку, если поведение еще не покрыто.
4. Сделать маленькое изменение.
5. Запустить минимальную проверку для измененной области.
6. Запустить общий baseline перед завершением этапа.
7. Обновить stage-plan: что сделано, что отложено, какие риски остались.

## Validation ladder

Минимальный baseline после Stage 1:

```bash
make lint
make typecheck
make test
make build
make security
```

Дополнительно должны появиться постоянные проверки:

- JS syntax check для runtime `.js`;
- local asset/link checker;
- route target checker;
- duplicate-id checker;
- translation key consistency checker;
- smoke-сценарии для SPA, карты, языка и аудио.

Текущий baseline после внедрения tooling:

```bash
make lint
make test
make test-e2e
make smoke
```

`make test` использует allowlist известных дефектов из `scripts/static-check-known-issues.json`, чтобы фиксировать новые регрессии, не смешивая Stage 1 tooling с Stage 2 runtime fixes.

Когда появится браузерный baseline:

- desktop viewport smoke;
- mobile viewport smoke;
- navigation through iframe;
- map marker click;
- language switch;
- audio unlock flow;
- representative Capacitor/web build load.

## Риск-регистр

| Риск | Вероятность | Влияние | Контроль |
|---|---:|---:|---|
| Сломать iframe SPA navigation | Высокая | Высокое | Stage 1 smoke + Stage 3 contract |
| Потерять состояние аудио при навигации | Средняя | Высокое | Audio flow characterization |
| Сломать геометки/квесты при декомпозиции `map_modal.js` | Высокая | Высокое | Idempotent init + marker smoke |
| Удалить нужный ассет как "мусор" | Средняя | Среднее | Asset inventory до cleanup |
| Оптимизировать изображения с визуальной деградацией | Средняя | Среднее | Before/after screenshots |
| Развести `BACKLOG.md` и планы | Средняя | Высокое | BACKLOG остается source of truth |

## Definition of Done всего рефакторинга

- Все P1/P2 findings из `00-code-review.md` закрыты или явно перенесены в `BACKLOG.md`.
- `make build` стабильно собирает `www`.
- `make security` без уязвимостей.
- `make test` перестал быть пустой заглушкой и включает smoke baseline.
- SPA, карта, квесты, язык и аудио имеют хотя бы smoke-проверки.
- Крупные файлы разбиты по ответственностям без смены поведения.
- `BACKLOG.md`, `ARCHITECTURE.md`, `README.md` и `AGENTS.md` обновлены там, где изменения реально затронули процессы или архитектуру.

## Status Update - 2026-06-26

- Stage 1 baseline/tooling выполнен.
- Stage 2 runtime fixes выполнен.
- Technology Review Gate выполнен:
  - ESLint/Playwright/static checkers остаются принятыми safety-net технологиями;
  - runtime framework не меняется;
  - templating/static generation принят как Stage 5 candidate через internal metadata generator POC;
  - Howler/Vite/i18next отложены до более сильных сигналов.
- Stage 3 first pass выполнен:
  - добавлен `spa_message_contract.js`;
  - центральные `postMessage` listeners проверяют schema/source/origin;
  - wildcard target заменен в центральных потоках на same-origin helper;
  - добавлены Playwright smoke для iframe -> parent navigation и parent -> iframe language change.
- Stage 3.2 выполнен:
  - добавлен `spa_config.js`;
  - из `index.html` вынесены page registry, стартовая страница, iframe selectors и audio route policy;
  - `SPAManager` использует config для prev/next navigation и выбора фонового трека;
  - добавлен Playwright smoke для SPA config.
- Stage 3.3 выполнен:
  - добавлен `spa_lifecycle.js`;
  - из `index.html` вынесен первый слой pure lifecycle helpers: page/hash parsing, iframe/container creation, DOM lookup;
  - добавлены Playwright smoke для lifecycle helpers, `PAGE_HASH` и `AUDIO_UNLOCKED` boundary.
- Stage 3.4 выполнен:
  - добавлен `spa_minimap_manager.js`;
  - `MiniMapManager` вынесен из inline `index.html` в отдельный модуль с явными shell dependencies;
  - добавлены Playwright smoke для `OPEN_MINI_MAP` и `OPEN_FULLSCREEN_MAP` boundary.
- Stage 4.1 выполнен:
  - `MapModal.init()` сделан идемпотентным перед декомпозицией `map_modal.js`;
  - style injection получил stable ids;
  - DOM/listeners больше не дублируются при повторном init;
  - добавлен Playwright smoke для повторной инициализации direct Tumski page.
- Stage 4.2 выполнен:
  - inline `modalHTML` вынесен в `getMapModalTemplate()` внутри `map_modal.js`;
  - DOM insertion вынесен в `ensureMapModalDom()`;
  - Playwright smoke теперь закрепляет ключевые ids/classes modal template.
- Stage 4.3 выполнен:
  - отдельный `map_modal_template.js` отложен из-за classic script load order в 54 HTML-файлах;
  - основной `mapStyles` вынесен в `map_modal.css`;
  - `map_modal.js` подключает CSS через `<link id="map-modal-styles" rel="stylesheet">`;
  - Playwright smoke проверяет внешний stylesheet вместо legacy inline style.
- Stage 4.4 выполнен:
  - marker route decision вынесен в `map_marker_navigation.js`;
  - `map_modal.js` лениво подключает helper через stable `#map-marker-navigation-script`;
  - сохранён приоритет `window.SPAManager` → `window.parent.SPAManager` → `location.href`;
  - Playwright smoke проверяет helper modes и реальный click по `.visited-marker`.
- Stage 4.5 выполнен:
  - visited-marker storage/rendering вынесены в `visited_markers.js`;
  - `map_modal.js` лениво подключает helper через stable `#visited-markers-script`;
  - сохранены `visitedPages`, классы маркеров, координаты, double offsets и mobile/desktop positioning;
  - Playwright smoke проверяет tolerant parsing, save contract, render contract и idempotent script injection.
