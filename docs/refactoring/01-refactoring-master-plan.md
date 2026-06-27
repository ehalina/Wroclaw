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
- Stage 4.6 выполнен:
  - quest/book overlay behavior вынесен в `quest_overlay.js`;
  - `map_modal.js` лениво подключает helper через stable `#quest-overlay-script`;
  - сохранены `window.renderQuestIntro`, `window.showQuestConfirmDialog` и текущая структура `sessionStorage.questState`;
  - Playwright smoke проверяет открытие `.book-overlay` и render contract квестовой книги.
- Stage 4.7 выполнен:
  - map/quest debug logging загейчен через `map_debug.js` и `window.MapDebug`;
  - диагностика включается явно через `window.DEBUG_MAP`, `localStorage.DEBUG_MAP = "1"` или legacy `localStorage.__quest_debug = "1"`;
  - `quest_marker_handler.js`, `tumski_cathedral_handler.js` и `tumski_page_common.js` больше не шумят в production console;
  - Playwright smoke проверяет disabled/default mode и все поддержанные debug flags.
- Stage 5.1 выполнен:
  - `i18n.js` перешёл на `textContent` по умолчанию для центрального `data-i18n` flow;
  - rich HTML разрешён только через allowlist из 7 ключей и sanitizer, который сохраняет только `<br>`;
  - `scripts/check-translations.mjs` теперь строго проверяет HTML в переводах по allowlist;
  - Playwright smoke проверяет plain text escaping, known rich key и блокировку чужого `<script>`.
- Stage 5.2 выполнен:
  - `locales/be/translations.json` синхронизирован с canonical key set;
  - удалён неиспользуемый корневой дубль `blue_goat.*`, runtime key остаётся `gnomes.blue_goat.*`;
  - translation key consistency в `scripts/check-translations.mjs` стал strict failure;
  - `make test` подтверждает одинаковый набор ключей для 7 локалей.
- Stage 5.3 выполнен:
  - text-only `innerHTML` sinks в `common.js` заменены на `setI18nText()`/`textContent`;
  - wrapper использует центральный `window.i18n.setTranslatedContent()` при наличии;
  - tooltip, legacy Tumski book title/text, Most title и audio-unlock sync больше не вставляют HTML напрямую;
  - `make smoke` подтверждает текущий SPA/map/language baseline.
- Stage 5.4 выполнен:
  - `gnome_marker_handler.js` сохраняет только `<br>` в gnome descriptions через `sanitizeGnomeDescription()`;
  - весь прочий HTML в gnome descriptions экранируется;
  - Playwright smoke проверяет сохранение `<br>` и отсутствие реального `<script>` DOM-узла.
- Stage 5.5 выполнен:
  - `quest_overlay.js` строит intro paragraphs через DOM API и `textContent`;
  - `quest_overlay.js` и legacy `quest_marker_handler.js` очищают task list через `replaceChildren()`;
  - перевод `quest.intro` больше не интерполируется как HTML;
  - Playwright smoke проверяет escaped HTML в intro paragraphs.
- Stage 5.6 выполнен:
  - `updatePageContent()` делегирует общий `[data-i18n]` проход в `updateDataI18nElements()`;
  - дублирующие audio-unlock проходы удалены, legacy fallback сохранён только для кнопки без `data-i18n`;
  - `window.i18n.updateDataI18nElements()` подготовлен как малый helper для будущего shared page init;
  - `make test` и `make smoke` подтверждают текущий baseline.
- Stage 5.7 выполнен:
  - создан `docs/refactoring/stage-05-page-block-inventory.md`;
  - проверены 59 top-level HTML страниц и выделено стабильное семейство из 51 content page;
  - inventory зафиксировал повторяющиеся head/script, scene, cursor, marker и common init blocks;
  - исключены из первого rollout `index.html`, `tumski.html`, `tumski02.html`, `katedra_*` и standalone/debug pages;
  - первым кандидатом для shared helper rollout выбран `dwor01.html`.
- Stage 5.8 выполнен:
  - создан additive `page_shell_helpers.js` без подключения к production HTML;
  - helper создаёт standard scene shell, route cursor pair и marker block с текущими classes/data attrs;
  - helper доступен как ES module и `window.PageShellHelpers` для будущей compatibility-миграции;
  - Playwright smoke проверяет synthetic fragment contract;
  - `make smoke` расширен до 40 тестов.
- Stage 5.9 выполнен:
  - добавлен smoke contract для `dwor01.html`;
  - `dwor01.html` мигрировал только route cursor pairs на `PageShellHelpers.createRouteCursor()`;
  - markers/scene/head/page init пока оставлены статическими;
  - smoke подтвердил сохранение classes/data attrs/routes после исправления inline module currentScript issue;
  - `make smoke` расширен до 42 тестов.
- Stage 5.10 выполнен:
  - `page_shell_helpers.js` получил `renderRouteCursors(target, cursors)`;
  - `dwor01.html` теперь задаёт cursor descriptors одним массивом вместо ручного append;
  - synthetic helper smoke покрывает `renderRouteCursors()`;
  - DOM contract smoke для `dwor01.html` остался стабильным.
- Stage 5.11 выполнен:
  - `page_shell_helpers.js` получил `renderMarkers(target, markers, options)`;
  - оба marker blocks в `dwor01.html` мигрированы на descriptor-based helper rendering;
  - DOM contract smoke для `dwor01.html` теперь фиксирует marker ids/order, quest attrs, audio src и i18n keys;
  - scene shell/head/scripts/page init пока оставлены статическими.
- Stage 5.12 выполнен:
  - создан `dwor01_page.js` как page-specific descriptor/render module;
  - inline module setup удалён из `dwor01.html`;
  - `dwor01.html` подключает `dwor01_page.js` перед `tumski_init.js`, сохраняя порядок создания markers/routes;
  - DOM contract smoke для `dwor01.html` остался стабильным.
- Stage 5.13 выполнен:
  - вторым rollout candidate выбран `dwor02.html`;
  - создан `dwor02_page.js` с marker/cursor descriptors;
  - `dwor02.html` переведён на HTML shell + page module pattern;
  - добавлен отдельный DOM contract smoke для `dwor02.html`;
  - `make smoke` расширен до 44 тестов.
- Stage 5.14 выполнен:
  - `page_shell_helpers.js` получил `renderConfiguredPage(config)`;
  - `dwor01_page.js` и `dwor02_page.js` теперь содержат descriptors и один renderer call;
  - synthetic helper smoke покрывает общий renderer;
  - DOM contract smoke для обеих rollout pages остался стабильным.
- Stage 5.15 выполнен:
  - создан `docs/refactoring/stage-05-content-workflow.md`;
  - зафиксирован preferred pattern для HTML shell + `<page>_page.js` descriptors + `renderConfiguredPage(...)`;
  - описан минимальный smoke contract для page migrations;
  - Stage 5 закрыт как техническая основа для page templates и i18n consolidation.
- Stage 6.1 выполнен:
  - создан `docs/refactoring/stage-06-asset-size-report.md`;
  - зафиксирован build baseline `350 files, 138.2 MB -> www/`;
  - отделены runtime-heavy assets от cleanup/package-exclusion candidates;
  - следующий Stage 6 шаг должен быть cleanup-only package exclusion без source deletion.
- Stage 6.2 выполнен:
  - build script получил path-specific `excludedRuntimePaths`;
  - из `www/` исключены root-level unreferenced `music.mp3` и `Gemini_Generated_Image_5x2pd05x2pd05x2p.png`;
  - source files не удалялись, `media/**` не трогался;
  - build baseline улучшен до `348 files, 132.3 MB -> www/`;
  - `make smoke` остаётся зелёным на 44 тестах.
- Stage 6.3 выполнен:
  - build script получил guard для `excludedRuntimePaths`;
  - `make build` теперь падает, если явно исключённый runtime path снова появился как ссылка в HTML/CSS/JS/JSON;
  - baseline `348 files, 132.3 MB -> www/` сохранён.
- Stage 6.4 выполнен:
  - decision gate для крупных unreferenced `media/**` candidates принят как package-only exclusion без source deletion;
  - из `www/` исключены `media/Wroclaw_Saver.png`, `media/book/Gemini_Generated_Image_5x2pd05x2pd05x2p.png`, два больших `media/krasnolud/u717...png` и `media/watercolor/22.png`;
  - runtime assets `media/Wroclaw_Saver.mp4`, `media/watercolor/22.jpg` и heavy route audio остаются в пакете;
  - baseline улучшен до `343 files, 105.9 MB -> www/`.
- Stage 6.5 выполнен:
  - build script получил package budget guard на `120 MB`;
  - `make build` теперь падает, если итоговый logical size `www` превышает budget;
  - следующий Stage 6 шаг: visual-review-safe optimization policy или loading/audio lifecycle review.
- Stage 6.6 выполнен:
  - дополнительный cleanup-only audit исключил из `www` крупные source-only `media/krasnolud/Gemini_Generated_Image_*.png` и screenshot PNG;
  - runtime gnome assets `krasnal_*.jpg` и `koza.jpg` остаются в package;
  - source files не удалялись, reference guard продолжает защищать exclusion list;
  - baseline улучшен до `334 files, 89.0 MB -> www/`.
- Stage 6.7 выполнен:
  - создан `docs/refactoring/stage-06-runtime-asset-optimization-policy.md`;
  - оставшиеся heavy assets классифицированы как runtime audio/video/scene assets, не cleanup candidates;
  - дальнейшая оптимизация требует derivative files, screenshot comparison для images и route/audio review для audio/video.
- Stage 6.8 выполнен:
  - создан `docs/refactoring/stage-06-08-sunset-characterization.md`;
  - добавлен отдельный `make stage-06-08-screenshots` для desktop/mobile screenshots `tumski21.html`;
  - зафиксировано, что видимые `tumski21` слои используют `sunset3.jpg`, `sunset2.png`, `sunset1.png`;
  - `sunset3.png` выявлен как preload-only runtime dependency в `sunset_parallax.js`.
- Stage 6.9 выполнен:
  - preload в `sunset_parallax.js` и standalone demo `sunset_parallax.html` выровнены на видимый `sunset3.jpg`;
  - `media/tumski/sunset/sunset3.png` исключен из Capacitor `www` как source-only original, без удаления из репозитория;
  - build reference guard уточнен: он проверяет только файлы, реально попадающие в package;
  - baseline улучшен до `333 files, 87.0 MB -> www/`.
- Stage 6.10 выполнен:
  - создан `docs/refactoring/stage-06-10-audio-route-use-review.md`;
  - зафиксированы route/use роли heavy audio assets;
  - подтверждено, что heavy MP3 сейчас нельзя исключать из `www` как unused;
  - следующий безопасный audio шаг: lifecycle/package cleanup, а не blind compression.
- Stage 6.11 выполнен:
  - duplicate effect copies `media/zwyki/opening-a-book.wav` и `media/zwyki/step.wav` исключены из Capacitor `www`;
  - source files не удалялись;
  - root runtime files `media/opening-a-book.wav` и `media/step.wav` остаются packaged;
  - baseline улучшен до `331 files, 86.9 MB -> www/`.
- Stage 6.12 выполнен:
  - создан `docs/refactoring/stage-06-12-audio-lifecycle-refactor-plan.md`;
  - зафиксирован порядок audio lifecycle refactor: source policy extraction -> network characterization -> lazy preload -> quest owner consolidation;
  - playback behavior не менялся.
- Stage 6.13 выполнен:
  - `spa_config.js` получил `AUDIO_SOURCES` и `getAudioSourceForTrack()`;
  - `index.html` больше не держит локальный `trackUrls` в `switchTrack()`;
  - `preloadBackgroundMusic()` использует тот же source policy helper;
  - smoke test закрепляет `hang` и `quest` source paths.
- Stage 6.14 выполнен:
  - создан `docs/refactoring/stage-06-14-audio-lifecycle-characterization.md`;
  - добавлен `make stage-06-14-audio`;
  - зафиксирован desktop/mobile baseline: `preloadBackgroundMusic()` constructs/loads `birds`, `kostel`, `hang`, `quest`.
- Stage 6.15 выполнен:
  - `preloadBackgroundMusic()` больше не создает `Audio` и не вызывает `load()` для route-specific MP3;
  - метод сохраняет только `trackTimes` bookkeeping;
  - добавлен `make stage-06-15-audio`;
  - desktop/mobile artifacts подтверждают lazy behavior.
- Stage 6.16 выполнен:
  - добавлен `window.QuestAudio` helper для shared `questMusic`;
  - `language_menu.js`, SPA iframe initialization и `quest_marker_handler.js` используют общий owner;
  - smoke test закрепляет один parent `audio#questMusic` и shared iframe reference;
  - `quest_overlay.js` local overlay sound оставлен как deferred decision.
- Stage 6.17 выполнен:
  - созданы lossless WebP derivatives для `sunset1.png` и `sunset2.png`;
  - `tumski21` и standalone sunset demo переключены на `sunset1.webp` / `sunset2.webp`;
  - PNG originals исключены из Capacitor package, source originals оставлены в repo;
  - `make stage-06-17-sunset-webp` подтвердил similarity scores 92.32-93.82;
  - package baseline улучшен до `331 files, 84.5 MB -> www/`.
- Stage 6.18 выполнен:
  - добавлен `make stage-06-18-scene-jpg-screenshots`;
  - сняты desktop/mobile screenshots и JSON measurements для `tumski11.html`, `dwor01.html`, `tumski14.html`;
  - подтверждено, что `.image` backgrounds загружают `tumski_11.jpg`, `dwor_01.jpg`, `tumski_14.jpg`;
  - runtime assets и package baseline не менялись.
- Stage 6.19 выполнен:
  - создан WebP POC для `tumski_11.jpg` без runtime switch;
  - q75/q85/q85-ICC/q90 candidates сохранены только в artifacts;
  - screenshot gate для q85-ICC зафиксировал FAIL: desktop 61.10, mobile 34.35 при threshold 90;
  - принято решение не переводить `tumski_11.jpg` на WebP.
- Stage 6.20 выполнен:
  - создан `make stage-06-20-video-review`;
  - зафиксирован `Wroclaw_Saver.mp4`: H.264 1800x1080, 21.153s, AAC audio, 8.9M source;
  - browser characterization подтвердил `preload=auto`, loaded `readyState=4`, after-play video playing/unmuted;
  - mobile baseline содержит existing autoplay pageError до user gesture.
- Stage 6.21 выполнен:
  - `katedra_panorama.html` video preload переведён с `auto` на `metadata`;
  - play button readiness перенесён с `loadeddata` на `loadedmetadata`;
  - metadata-mode characterization: loaded `readyState=1`, after-play video playing/unmuted на desktop/mobile;
  - media files и package size не менялись.
- Stage 6.22 выполнен:
  - `Wroclaw_Saver.mp4` source перенесён из `src` в `data-src`;
  - video preload переведён на `none`;
  - source назначается только после click по play button;
  - lazy-source characterization: до click `readyState=0`, после click video playing/unmuted на desktop/mobile.
- Stage 6.23 выполнен:
  - создан `docs/refactoring/stage-06-23-loading-state-characterization.md`;
  - добавлен `make stage-06-23-loading-state`;
  - slow iframe navigation oracle подтверждает: overlay видим во время задержки, активный iframe остаётся `tumski.html`, после load активируется `tumski02.html`;
  - runtime behavior и package baseline не менялись.
- Stage 6.24 выполнен:
  - создан `spa_loading_state.js`;
  - `SPAManager.showLoading()` / `hideLoading()` делегируют в `SpaLoadingState`;
  - добавлен focused smoke для helper contract;
  - `make stage-06-24-loading-helper` подтверждает Stage 6.23 slow-navigation behavior после extraction.
- Stage 6.25 выполнен:
  - добавлен `IFRAME_LOAD_TIMEOUT_MS = 15000`;
  - `SpaLoadingState` получил loading/error message helpers;
  - `SPAManager.loadPage()` теперь очищает зависший pending iframe по timeout/error и оставляет текущую страницу активной;
  - `make stage-06-25-loading-timeout` подтверждает error overlay и cleanup pending page на desktop/mobile.
- Stage 7.1 выполнен:
  - удалены root-level temporary JS files `arrow_handlers.js.backup`, `quest_marker_handler.js.new`, `sunset_parallax copy.js`;
  - перед удалением проверено отсутствие runtime references;
  - runtime behavior не менялся.
- Stage 7.2 выполнен:
  - `debug_styles.html` и `quick_test.html` больше не ссылаются на отсутствующие `input_compatibility.css` / `input_detection.js`;
  - debug/test pages получили inline input-mode detector;
  - static inventory allowlist очищен от `missingAssets`.
- Stage 7.3 выполнен:
  - удалён unreferenced legacy handler `right_arrow_handler.js`;
  - static inventory allowlist очищен от `missingRoutes`;
  - активная стрелочная навигация не менялась.
- Stage 7.4 выполнен:
  - удалены obsolete `locales/*/translation.json`;
  - canonical localization source теперь единственный: `locales/*/translations.json`;
  - translation checker больше не печатает legacy duplicate warning.
- Stage 7.5 выполнен:
  - `README.md` обновлён под текущие Makefile checks, refactoring docs и package baseline;
  - `AGENTS.md` заполнен project-specific core files, stack, commands and constraints;
  - governance docs теперь указывают на canonical localization path и Stage 7 cleanup state.
