# PROJECT SNAPSHOT — Текущее состояние проекта

*Последнее обновление: 2026-06-27*

> 📋 **Процесс обновления этого файла:** см. [`PROCESS.md`](./PROCESS.md)
>
> **⚠️ ВАЖНО:** Обновляй этот файл после завершения КАЖДОЙ фазы!

---

## 📊 Статус разработки

**Phase 1: MVP Core Features** [статус: ✅]
**Phase 2: Content & Localization** [статус: 🔄]
**Phase 3: Optimization & Polish** [статус: ⏳]

**Общий прогресс:** 99% (66 завершённых задач текущего плана)

**Текущая фаза:** Phase 2 - Content & Localization

---

## 📦 Установленные зависимости

### Production:
- Capacitor runtime: `@capacitor/core`, `@capacitor/android`, `@capacitor/ios`

### Development:
- ESLint
- Playwright
- Capacitor CLI

**Примечание:** Web runtime остаётся vanilla JavaScript без frontend framework/build bundler; Node scripts используются для проверок и сборки Capacitor assets.

---

## 🗂️ Структура проекта

```
Wroclaw/
├── www/ ✅                          # Web source of truth and Capacitor webDir
│   ├── index.html ✅                # SPA главная страница
│   ├── tumski*.html/css ✅          # Tumski pages
│   ├── dwor*.html/css ✅            # Страницы дворов
│   ├── ogrod*.html/css ✅           # Страницы садов
│   ├── katedra_*.html ✅            # Страницы собора
│   ├── spa_message_contract.js ✅   # Safe postMessage contract
│   ├── spa_config.js ✅             # SPA registry/config
│   ├── spa_lifecycle.js ✅          # SPA lifecycle helpers
│   ├── spa_loading_state.js ✅      # SPA loading overlay helper
│   ├── spa_minimap_manager.js ✅    # MiniMapManager
│   ├── map_modal.js/css ✅          # Map modal lifecycle/styles
│   ├── quest_overlay.js ✅          # Quest/book overlay rendering
│   ├── i18n.js ✅                   # Runtime localization boundary
│   ├── locales/ ✅                  # Переводы (7 языков)
│   └── media/ ✅                    # Packaged media files
├── non_runtime_assets/ ✅           # Source-only assets excluded from Capacitor package
├── Makefile ✅                      # Стандартизированные команды
├── scripts/ ✅                      # Static checks и Capacitor web validation
└── Init/ ✅                         # Документация фреймворка
    ├── CLAUDE.md
    ├── PROJECT_INTAKE.md
    ├── ARCHITECTURE.md
    └── ...

Легенда:
✅ — реализовано и протестировано
🔄 — в процессе разработки
⏳ — ожидает выполнения
```

---

## ✅ Завершенные задачи

### Phase 1: MVP Core Features
1. ✅ SPA система навигации (SPAManager)
2. ✅ Система геометок с модальными окнами
3. ✅ Музыкальная система с переключением треков
4. ✅ Базовая локализация (i18n.js)
5. ✅ Адаптивный дизайн для desktop/mobile
6. ✅ Кастомные курсоры навигации
7. ✅ Квест-маркеры система
8. ✅ Capacitor Android/iOS wrapper
9. ✅ Refactoring safety net: ESLint, static checks, Playwright smoke
10. ✅ Stage 3 SPA shell helpers: message contract, config, lifecycle, MiniMapManager
11. ✅ Stage 4.1 MapModal init idempotency
12. ✅ Stage 4.2 MapModal template helper extraction
13. ✅ Stage 4.3 MapModal CSS extraction
14. ✅ Stage 4.4 Map marker navigation extraction
15. ✅ Stage 4.5 Visited markers storage/render extraction
16. ✅ Stage 4.6 Quest overlay extraction
17. ✅ Stage 4.7 Map/quest debug logging gate
18. ✅ Stage 5.1 i18n rich HTML safety gate
19. ✅ Stage 5.2 Strict translation key consistency
20. ✅ Stage 5.3 common.js text-only i18n sink cleanup
21. ✅ Stage 5.4 Gnome description sanitizer
22. ✅ Stage 5.5 Quest intro/list DOM rendering
23. ✅ Stage 5.6 i18n updatePageContent simplification
24. ✅ Stage 5.7 Page block inventory before shared helper rollout
25. ✅ Stage 5.8 Additive page shell helper with synthetic smoke coverage
26. ✅ Stage 5.9 dwor01 route cursor helper migration
27. ✅ Stage 5.10 Descriptor-based route cursor render helper
28. ✅ Stage 5.11 Descriptor-based marker render helper
29. ✅ Stage 5.12 dwor01 page descriptor module
30. ✅ Stage 5.13 dwor02 page descriptor module
31. ✅ Stage 5.14 Configured page renderer helper
32. ✅ Stage 5.15 Content page workflow documented
33. ✅ Stage 6.1 Asset size report and package baseline
34. ✅ Stage 6.2 Package root asset exclusions
35. ✅ Stage 6.3 Package exclusion reference guard
36. ✅ Stage 6.4 Package media asset exclusions
37. ✅ Stage 6.5 Package size budget guard
38. ✅ Stage 6.6 Package gnome source-only exclusions
39. ✅ Stage 6.7 Runtime asset optimization policy
40. ✅ Stage 6.8 Tumski21 sunset screenshot characterization
41. ✅ Stage 6.9 Sunset3 preload/package cleanup
42. ✅ Stage 6.10 Heavy audio route/use review
43. ✅ Stage 6.11 Duplicate WAV package cleanup
44. ✅ Stage 6.12 Audio lifecycle refactor plan
45. ✅ Stage 6.13 Audio source policy extraction
46. ✅ Stage 6.14 Audio lifecycle characterization
47. ✅ Stage 6.15 Lazy background audio preload
48. ✅ Stage 6.16 Quest audio owner consolidation
49. ✅ Stage 6.17 Sunset WebP runtime derivatives
50. ✅ Stage 6.18 Scene JPG characterization
51. ✅ Stage 6.19 Tumski11 WebP candidate POC
52. ✅ Stage 6.20 Panorama video review
53. ✅ Stage 6.21 Panorama video metadata preload
54. ✅ Stage 6.22 Panorama video lazy source
55. ✅ Stage 6.23 SPA loading state characterization
56. ✅ Stage 6.24 SPA loading helper extraction
57. ✅ Stage 6.25 SPA loading timeout state
58. ✅ Stage 7.1 Root temporary JS cleanup
59. ✅ Stage 7.2 Debug/test missing input asset cleanup
60. ✅ Stage 7.3 Legacy right arrow handler cleanup
61. ✅ Stage 7.4 Legacy locale duplicate cleanup
62. ✅ Stage 7.5 README/AGENTS governance refresh
63. ✅ Stage 7.6 Arrow diagnostics debug gate
64. ✅ Stage 7.7 User account diagnostics debug gate
65. ✅ Stage 7.8 User database diagnostics debug gate
66. ✅ Stage 7.9 Gnome diagnostics debug gate
67. ✅ Stage 7.10 Runtime diagnostics inventory
68. ✅ Stage 7.11 SPA shell diagnostics debug gate
69. ✅ Stage 7.12 Audio promise rejection diagnostics gate
70. ✅ Stage 7.13 One-line runtime init diagnostics gate
71. ✅ Stage 7.14 Legacy audio diagnostics module cleanup
72. ✅ Stage 7.15 Standalone/debug page diagnostics policy
73. ✅ Stage 7.16 `www/` source of truth
74. ✅ Stage 7.17 Stale generated AI context cleanup
75. ✅ Stage 7.18 Runtime console noise cleanup
76. ✅ Stage 7.19 Native artifact naming

---

## 🔜 Следующий этап: Phase 2

**Content & Localization**

### Задачи:
1. 🔄 Заполнить все 24 tumski страницы полным контентом
2. 🔄 Полная локализация всех строк интерфейса (7 языков)
3. ⏳ Проверка качества переводов
4. ⏳ Добавление недостающих геометок на страницах
5. ⏳ Оптимизация изображений для веба

**Примерное время:** ~20 часов

**Зависимости:** PROJECT_INTAKE.md заполнен, архитектура определена

---

## 🔧 Технологии

- **Frontend:** Vanilla JavaScript (ES6+ modules)
- **Styling:** Plain CSS с модульной структурой
- **Backend:** Нет (статический сайт)
- **Database:** Нет (данные в JSON файлах)
- **Deployment:** Static hosting (Netlify/GitHub Pages/Vercel)
- **Localization:** JSON-based i18n system

---

## 📝 Заметки

### Важные файлы конфигурации:
- `.migrationignore` — исключения для миграции документации
- Нет `.env` файлов (проект полностью статический)

### Важные документы:
- `PROCESS.md` — процесс обновления метафайлов после каждой фазы
- `BACKLOG.md` — детальный план задач (обновляется после каждой фазы)
- `CLAUDE.md` — контекст проекта для AI
- `PROJECT_SNAPSHOT.md` — этот файл, снапшот текущего состояния
- `PROJECT_RULES.md` — правила работы с кодом проекта
- `QUICK_RULES.md` — быстрые правила для промптов

### Build команды:
```bash
make dev
make test
make lint
make smoke
make build
make stage-06-08-screenshots
make stage-06-18-scene-jpg-screenshots
make stage-06-19-tumski11-webp-poc
make stage-06-20-video-review
make stage-06-21-video-metadata
make stage-06-22-video-lazy-source
make stage-06-23-loading-state
make stage-06-24-loading-helper
make stage-06-25-loading-timeout
make security
make audit
```

### Текущий Capacitor package baseline:
- Initial Stage 6 build: `350 files, 138.2 MB -> www/`
- Current `www/` validation: `323 files, 84.5 MB in www/`
- Package budget guard: `120 MB`
- Runtime asset optimization policy: `docs/refactoring/stage-06-runtime-asset-optimization-policy.md`

### Безопасность:
- Нет обработки чувствительных данных
- Статический контент без серверной логики
- Локализация через JSON: strict key consistency, rich HTML allowlist и textContent-by-default rendering

---

## 🎯 Цель MVP

**Минимальная версия продукта:**
Интерактивная экскурсия по Тумскому острову с базовой навигацией, геометками и локализацией для основных языков.

**Ожидаемое время до MVP:** ~30 часов (осталось ~10 часов)

**Ключевые функции MVP:**
- ✅ SPA навигация между локациями
- ✅ Геометки с модальными окнами
- ✅ Музыкальная система
- ✅ Базовая локализация
- 🔄 Полное заполнение контента всех страниц
- ⏳ Полная локализация всех строк
- ⏳ Оптимизация производительности

---

## 🔄 История обновлений

### 2026-06-27 - Refactoring Stage 7.19 выполнен
- Android debug APK now builds as `android/app/build/outputs/apk/debug/wroclaw_debug.apk`
- Android release APK now builds as `android/app/build/outputs/apk/release/wroclaw_release.apk`
- `make android-release` добавлен рядом с `make android-debug`
- iOS Debug/Release product names зафиксированы как `wroclaw_debug` / `wroclaw_release`

### 2026-06-27 - Refactoring Stage 7.18 выполнен
- `tumski_init.js` больше не пишет error для отсутствующего optional play/video блока
- legacy `stepSound.play()` в `arrow_handlers.js` безопасно гасит autoplay promise rejection
- `unload` cleanup заменён на `pagehide`, `/favicon.ico` добавлен в `www/`
- iframe load handlers назначаются до DOM insertion; pending iframe timers отменяются при удалении/перезагрузке pending страницы

### 2026-06-27 - Refactoring Stage 7.17 выполнен
- удалён tracked `project-context.md`, устаревший generated context dump со старой root runtime layout
- `.gitignore` теперь исключает `project-context.md`, `context-*.md` и `.llm/context-*.md`
- source of truth для agent context остаётся в maintained docs: `BACKLOG.md`, `ARCHITECTURE.md`, `CLAUDE.md`, `PROJECT_SNAPSHOT.md`

### 2026-06-27 - Refactoring Stage 7.16 выполнен
- `www/` стал tracked web source of truth и Capacitor `webDir`
- `make dev`, Playwright and static checks теперь работают от `www/`
- `make build` валидирует `www/` и package budget вместо копирования root runtime files
- source-only excluded assets перенесены в `non_runtime_assets/`

### 2026-06-27 - Refactoring Stage 7.15 выполнен
- `katedra_panorama.html` video diagnostics переведены на `DEBUG_PANORAMA` / legacy-style `__panorama_debug`
- `audio_visibility_test.html` оформлен как intentional manual debug-page console mirror
- CR-11 production runtime logging cleanup закрыт

### 2026-06-27 - Refactoring Stage 7.14 выполнен
- `background_music111.js` удалён после проверки отсутствия active runtime references
- создан `docs/refactoring/stage-07-14-legacy-audio-module-review.md`
- `AUDIO_VISIBILITY_README.md` обновлён под текущую модель MutationObserver/manual audio registration

### 2026-06-27 - Refactoring Stage 7.13 выполнен
- `spa_minimap_manager.js` tumski21 disabled diagnostic gated through `DEBUG_MINIMAP`
- `firebase_config.js` success diagnostic gated through `DEBUG_FIREBASE`; `console.error` failure paths preserved
- smoke проверяет mini-map quiet default/debug-enable paths and waits for initial loading overlay hide in loading-state contract test

### 2026-06-27 - Refactoring Stage 7.12 выполнен
- `index.html` и `language_menu.js` больше не используют active `audio.play().catch(console.log)`
- audio rejection diagnostics включаются через `DEBUG_AUDIO` / `localStorage.DEBUG_AUDIO` / legacy `__audio_debug`
- smoke проверяет quiet default и debug-enable paths через реальные SPA/language-menu audio call sites

### 2026-06-27 - Refactoring Stage 7.11 выполнен
- `index.html` SPA route/hash diagnostics переведены на `spaDebugLog`
- SPA diagnostics включаются через `DEBUG_SPA` / `localStorage.DEBUG_SPA` / legacy `__spa_debug`
- smoke проверяет quiet default и debug-enable paths; audio `.catch(console.log)` оставлен для Stage 7.12

### 2026-06-27 - Refactoring Stage 7.10 выполнен
- создан `docs/refactoring/stage-07-runtime-diagnostics-inventory.md`
- remaining active runtime diagnostics classified into Stage 7.11-7.15 follow-up items
- already gated helper internals excluded from future logging cleanup

### 2026-06-27 - Refactoring Stage 7.9 выполнен
- `gnome_marker_handler.js` popup/navigation diagnostic `console.log` переведены на `MapDebug.log`
- gnome diagnostics используют `DEBUG_MAP` / `localStorage.DEBUG_MAP` / legacy `__quest_debug`
- smoke проверяет quiet default и debug-enable path для Patsa Vatsa route branch
- CR-11 остаётся открытым для remaining runtime/debug diagnostics inventory

### 2026-06-27 - Refactoring Stage 7.8 выполнен
- `user_database.js` Firebase/auth/leaderboard diagnostic `console.log` переведены на `_dlog`
- database diagnostics используют `DEBUG_ACCOUNT` / `localStorage.DEBUG_ACCOUNT` / legacy `__account_debug`
- smoke проверяет quiet default и global/storage/legacy debug-enable paths
- CR-11 оставался открытым для `gnome_marker_handler.js` и remaining runtime/debug diagnostics

### 2026-06-27 - Refactoring Stage 7.7 выполнен
- `user_account.js` auth/rating diagnostic `console.log/warn` переведены на `_alog/_awarn`
- account diagnostics выключены по умолчанию и включаются через `DEBUG_ACCOUNT` / `localStorage.DEBUG_ACCOUNT` / legacy `__account_debug`
- smoke проверяет quiet default и global/storage/legacy debug-enable paths
- CR-11 оставался открытым для Firebase/auth/leaderboard diagnostics (`user_database.js`)

### 2026-06-27 - Refactoring Stage 7.6 выполнен
- `arrow_handlers.js` diagnostic `console.log/warn` переведены на `debugLog/debugWarn`
- arrow diagnostics выключены по умолчанию и включаются через `DEBUG_ARROWS` / `localStorage.DEBUG_ARROWS`
- smoke проверяет quiet default и debug-enable paths
- CR-11 оставался открытым для auth/rating diagnostics (`user_account.js`)

### 2026-06-27 - Refactoring Stage 7.5 выполнен
- `README.md` обновлён под текущие Makefile checks, refactoring docs и package baseline
- `AGENTS.md` заполнен project-specific core files, stack, commands and constraints
- canonical localization path documented as `locales/<lang>/translations.json`

### 2026-06-27 - Refactoring Stage 7.4 выполнен
- удалены obsolete `locales/*/translation.json`; canonical runtime source остаётся `locales/*/translations.json`
- перед удалением подтверждено: legacy files содержали только 2 old keys против 393 canonical keys
- translation checker продолжает проверять canonical files и больше не печатает legacy duplicate warning
- build summary после cleanup: `324 files, 84.5 MB -> www/`

### 2026-06-27 - Refactoring Stage 7.3 выполнен
- удалён unreferenced `right_arrow_handler.js`, который указывал на отсутствующий `tumski_02.html`
- `scripts/static-check-known-issues.json` очищен от `missingRoutes` allowlist entries
- static inventory теперь проходит без known missing assets/routes
- build summary после cleanup: `331 files, 84.5 MB -> www/`
- активные handlers `arrow_handlers.js` / `common.js` не менялись

### 2026-06-27 - Refactoring Stage 7.2 выполнен
- `debug_styles.html` и `quick_test.html` больше не ссылаются на отсутствующие `input_compatibility.css` / `input_detection.js`
- debug/test pages получили inline input-mode detector для `html[data-input-type]`
- `scripts/static-check-known-issues.json` очищен от `missingAssets` allowlist entries

### 2026-06-27 - Refactoring Stage 7.1 выполнен
- удалены root-level временные JS-файлы: `arrow_handlers.js.backup`, `quest_marker_handler.js.new`, `sunset_parallax copy.js`
- перед удалением проверено отсутствие runtime references
- runtime behavior и package logic не менялись

### 2026-06-27 - Refactoring Stage 6.25 выполнен
- добавлен `IFRAME_LOAD_TIMEOUT_MS = 15000`
- `SpaLoadingState` получил loading/error message helpers
- `SPAManager.loadPage()` теперь очищает зависший pending iframe по timeout/error, оставляя текущую страницу активной
- `make stage-06-25-loading-timeout` подтвердил error overlay и cleanup pending state на desktop/mobile

### 2026-06-27 - Refactoring Stage 6.24 выполнен
- добавлен `spa_loading_state.js` с `SpaLoadingState` helper
- `SPAManager.showLoading()` / `hideLoading()` делегируют управление `#loadingOverlay` helper-у
- добавлен focused smoke на helper contract и `make stage-06-24-loading-helper`
- slow-navigation oracle подтвердил сохранение loading behavior на desktop/mobile

### 2026-06-27 - Refactoring Stage 6.23 выполнен
- добавлен `make stage-06-23-loading-state`
- slow iframe navigation oracle задерживает `tumski02.html` и проверяет loading overlay на desktop/mobile
- baseline подтверждает: во время задержки overlay видим, active iframe остаётся `tumski.html`, после load активируется `tumski02.html`
- runtime behavior и package size не менялись

### 2026-06-27 - Refactoring Stage 6.22 выполнен
- `Wroclaw_Saver.mp4` source перенесён из `src` в `data-src`
- video preload переведён на `none`, source назначается после click по play button
- lazy-source characterization подтвердил: до click `readyState=0`, после click видео играет и размьючено
- media files и package size не менялись

### 2026-06-27 - Refactoring Stage 6.21 выполнен
- `katedra_panorama.html` video preload переведён с `auto` на `metadata`
- play button readiness перенесён с `loadeddata` на `loadedmetadata`
- metadata-mode characterization подтвердил loaded `readyState=1` и рабочий after-play на desktop/mobile
- media files и package size не менялись

### 2026-06-27 - Refactoring Stage 6.20 выполнен
- добавлен `make stage-06-20-video-review`
- зафиксирован `Wroclaw_Saver.mp4`: H.264 1800x1080, 21.153s, AAC audio, 8.9M source
- browser characterization подтвердил `preload=auto`, after-play playback и unmuted state
- mobile baseline содержит existing autoplay pageError до user gesture

### 2026-06-27 - Refactoring Stage 6.19 выполнен
- создан WebP POC для `tumski_11.jpg` без runtime switch
- q75/q85/q85-ICC/q90 candidates сохранены только в artifacts
- screenshot gate q85-ICC зафиксировал FAIL: desktop 61.10, mobile 34.35
- принято решение не переводить `tumski_11.jpg` на WebP

### 2026-06-27 - Refactoring Stage 6.18 выполнен
- добавлены `playwright.stage-06-18.config.mjs`, `tools/stage-06-18/scene-jpg-characterization.spec.mjs` и `make stage-06-18-scene-jpg-screenshots`
- сняты desktop/mobile screenshots для `tumski11.html`, `dwor01.html`, `tumski14.html`
- подтверждены loaded backgrounds: `tumski_11.jpg`, `dwor_01.jpg`, `tumski_14.jpg`
- runtime assets и package baseline не менялись

### 2026-06-27 - Refactoring Stage 6.17 выполнен
- `sunset1.png` и `sunset2.png` заменены в runtime на lossless WebP derivatives
- PNG originals оставлены в source и исключены из Capacitor package
- добавлен `make stage-06-17-sunset-webp` и similarity report через `ssimulacra2`
- build baseline улучшен до `331 files, 84.5 MB -> www/`

### 2026-06-27 - Refactoring Stage 6.16 выполнен
- добавлен `window.QuestAudio` helper для shared `questMusic`
- `language_menu.js`, SPA iframe initialization и `quest_marker_handler.js` используют общий owner
- smoke test закрепляет single parent owner и shared iframe reference
- `quest_overlay.js` local overlay sound оставлен как deferred decision

### 2026-06-27 - Refactoring Stage 6.15 выполнен
- `preloadBackgroundMusic()` больше не создает и не загружает route-specific MP3
- метод оставляет только `trackTimes` bookkeeping
- добавлен `make stage-06-15-audio`
- desktop/mobile artifacts подтверждают lazy behavior

### 2026-06-27 - Refactoring Stage 6.14 выполнен
- добавлены `playwright.stage-06-14.config.mjs`, `tools/stage-06-14/audio-lifecycle-characterization.spec.mjs` и `make stage-06-14-audio`
- создан `docs/refactoring/stage-06-14-audio-lifecycle-characterization.md`
- зафиксирован desktop/mobile baseline: `preloadBackgroundMusic()` constructs/loads `birds`, `kostel`, `hang`, `quest`
- package baseline не менялся

### 2026-06-27 - Refactoring Stage 6.13 выполнен
- `spa_config.js` получил `AUDIO_SOURCES` и `getAudioSourceForTrack()`
- `index.html` больше не держит локальный `trackUrls` в `switchTrack()`
- `preloadBackgroundMusic()` использует общий source policy helper
- smoke test закрепляет `hang` и `quest` source paths

### 2026-06-27 - Refactoring Stage 6.12 выполнен
- создан `docs/refactoring/stage-06-12-audio-lifecycle-refactor-plan.md`
- выбран порядок audio lifecycle refactor: source policy extraction -> network characterization -> lazy preload -> quest owner consolidation
- playback behavior и package baseline не менялись

### 2026-06-27 - Refactoring Stage 6.11 выполнен
- duplicate `media/zwyki/opening-a-book.wav` и `media/zwyki/step.wav` исключены из Capacitor `www`
- source files не удалялись
- root runtime WAV остаются packaged
- build baseline улучшен с `333 files, 87.0 MB` до `331 files, 86.9 MB`

### 2026-06-27 - Refactoring Stage 6.10 выполнен
- создан `docs/refactoring/stage-06-10-audio-route-use-review.md`
- heavy MP3 assets сопоставлены с route/use policy
- подтверждено: heavy MP3 нельзя исключать из `www` как unused
- следующий safe candidate: duplicate WAV package cleanup под build guard

### 2026-06-27 - Refactoring Stage 6.9 выполнен
- `sunset_parallax.js` и `sunset_parallax.html` выровнены на `media/tumski/sunset/sunset3.jpg`
- `media/tumski/sunset/sunset3.png` исключен из Capacitor `www`, но оставлен в source
- build reference guard теперь сканирует только package-included reference files
- build baseline улучшен с `334 files, 89.0 MB` до `333 files, 87.0 MB`

### 2026-06-27 - Refactoring Stage 6.8 выполнен
- создан `docs/refactoring/stage-06-08-sunset-characterization.md`
- добавлены `playwright.stage-06-08.config.mjs`, `tools/stage-06-08/sunset-characterization.spec.mjs` и `make stage-06-08-screenshots`
- сняты desktop/mobile baseline screenshots для `tumski21.html`
- зафиксировано: видимый sky layer использует `sunset3.jpg`, а `sunset3.png` сейчас является preload-only dependency в `sunset_parallax.js`

### 2026-06-27 - Refactoring Stage 6.7 выполнен
- создан `docs/refactoring/stage-06-runtime-asset-optimization-policy.md`
- оставшиеся heavy assets классифицированы как runtime audio/video/scene assets
- дальнейшая оптимизация требует derivative files, screenshot comparison и route/audio review
- текущий post-cleanup package baseline остаётся `334 files, 89.0 MB`

### 2026-06-27 - Refactoring Stage 6.6 выполнен
- дополнительный cleanup-only audit исключил из `www` крупные source-only `media/krasnolud/Gemini_Generated_Image_*.png` и screenshot PNG
- runtime gnome assets `krasnal_*.jpg` и `koza.jpg` остаются в package
- source files не удалялись
- build baseline улучшен с `343 files, 105.9 MB` до `334 files, 89.0 MB`

### 2026-06-27 - Refactoring Stage 6.5 выполнен
- `scripts/build-capacitor-web.mjs` получил package budget guard
- текущий logical budget для `www`: 120 MB
- `make build` теперь падает, если итоговый package size превышает бюджет
- текущий build проходит: `343 files, 105.9 MB -> www/`

### 2026-06-27 - Refactoring Stage 6.4 выполнен
- крупные unreferenced `media/**` candidates исключены из Capacitor `www` без удаления source files
- исключены `media/Wroclaw_Saver.png`, `media/watercolor/22.png`, book Gemini PNG и два больших gnome PNG
- runtime assets `media/Wroclaw_Saver.mp4`, `media/watercolor/22.jpg` и heavy audio остаются в пакете
- build baseline улучшен с `348 files, 132.3 MB` до `343 files, 105.9 MB`

### 2026-06-27 - Refactoring Stage 5.3 выполнен
- text-only `innerHTML` sinks в `common.js` заменены на `setI18nText()`/`textContent`
- shared tooltip, legacy Tumski book title/text, Most title и audio-unlock sync больше не вставляют HTML напрямую
- `common.js` делегирует в `window.i18n.setTranslatedContent()` при наличии
- `make smoke` подтверждает текущий SPA/map/language baseline: 34 теста

### 2026-06-27 - Refactoring Stage 5.2 выполнен
- `locales/be/translations.json` синхронизирован с canonical key set
- удалён неиспользуемый корневой дубль `blue_goat.*`; runtime key остаётся `gnomes.blue_goat.*`
- translation key consistency теперь strict failure в `scripts/check-translations.mjs`
- `make test` подтверждает одинаковые ключи для 7 локалей

### 2026-06-27 - Refactoring Stage 5.1 выполнен
- центральный `i18n.js` теперь пишет `data-i18n` через `textContent` по умолчанию
- rich HTML разрешён только для 7 allowlisted описательных ключей
- sanitizer сохраняет только `<br>`, остальной HTML экранируется
- `scripts/check-translations.mjs` строго проверяет HTML в переводах
- smoke расширен до 34 тестов: plain text escaping, rich key `<br>` и блокировка чужого `<script>`

### 2026-06-27 - Refactoring Stage 4.7 выполнен
- map/quest diagnostics загейчены через `map_debug.js` и `window.MapDebug`
- ручное включение диагностики доступно через `window.DEBUG_MAP`, `localStorage.DEBUG_MAP` и legacy `localStorage.__quest_debug`
- `quest_marker_handler.js`, `tumski_cathedral_handler.js` и `tumski_page_common.js` больше не пишут active debug logs в production console по умолчанию
- smoke расширен до 32 тестов: quiet default mode и debug flag variants

### 2026-06-27 - Refactoring Stage 4.6 выполнен
- quest/book overlay behavior вынесен из `map_modal.js` в `quest_overlay.js`
- `map_modal.js` лениво подключает helper через stable `#quest-overlay-script`
- сохранены `renderQuestIntro`, `showQuestConfirmDialog` и текущая структура `sessionStorage.questState`
- smoke расширен до 30 тестов: opening/render contract квестовой книги и idempotent script injection

### 2026-06-27 - Refactoring Stage 4.5 выполнен
- visited marker storage/rendering вынесены из `map_modal.js` в `visited_markers.js`
- `map_modal.js` лениво подключает helper через stable `#visited-markers-script`
- сохранены `visitedPages`, классы маркеров, координаты и mobile/desktop positioning
- smoke расширен до 28 тестов: parsing/save/render contract и idempotent script injection

### 2026-06-27 - Refactoring Stage 4.4 выполнен
- marker route decision вынесен из `map_modal.js` в `map_marker_navigation.js`
- сохранён route priority `window.SPAManager` → `window.parent.SPAManager` → `location.href`
- smoke расширен до 26 тестов: helper modes и реальный click по `.visited-marker`

### 2026-06-27 - Refactoring Stage 4.3 выполнен
- `map_modal_template.js` отложен, чтобы не менять load order в 54 HTML-файлах
- основной `mapStyles` вынесен из `map_modal.js` в `map_modal.css`
- `map_modal.js` подключает CSS через stable `#map-modal-styles` link

### 2026-06-27 - Refactoring Stage 4.2 выполнен
- inline `modalHTML` вынесен из `MapModal.init()` в `getMapModalTemplate()`
- DOM insertion вынесен в `ensureMapModalDom()`
- Smoke contract закрепляет ключевые ids/classes шаблона карты, book/most overlays, audio и confirm dialog

### 2026-06-27 - Refactoring Stage 4.1 выполнен
- `MapModal.init()` сделан идемпотентным перед декомпозицией `map_modal.js`
- Style injection получил stable ids для основной карты и mobile tooltips
- Добавлен smoke check на повторный init без дублирования DOM/listeners

### 2026-06-27 - Refactoring Stage 3.4 выполнен
- `MiniMapManager` вынесен из `index.html` в `spa_minimap_manager.js`
- Добавлены smoke checks для `OPEN_MINI_MAP` и `OPEN_FULLSCREEN_MAP`
- Stage 3 SPA shell теперь разделён на message contract, config, lifecycle helpers и mini-map manager

### 2025-01-11 - Phase 2 начата
- Документация проекта создана
- PROJECT_INTAKE.md заполнен
- Структура проекта задокументирована
- Следующий этап: заполнение контента и локализация

### До 2025-01-11 - Phase 1 завершена
- Реализована SPA система
- Добавлены геометки и модальные окна
- Музыкальная система работает
- Базовая локализация функционирует
- Прогресс: 75% (15/20)

---

## 📊 Модули и их статус

| Модуль | Статус | Зависимости | Тестирование |
|--------|--------|-------------|--------------|
| SPAManager | ✅ Готов | Нет | ✅ Passed |
| GeoMarker System | ✅ Готов | SPAManager | ✅ Passed |
| Quest Marker System | ✅ Готов | GeoMarker | ✅ Passed |
| i18n System | ✅ Готов | Нет | ✅ Passed |
| Music System | ✅ Готов | SPAManager | ✅ Passed |
| Modal System | ✅ Готов | Нет | ✅ Smoke |
| Navigation System | ✅ Готов | SPAManager | ✅ Passed |
| SPA Message Contract | ✅ Готов | SPAManager | ✅ Smoke |
| SPA Config/Lifecycle Helpers | ✅ Готов | SPAManager | ✅ Smoke |
| MiniMapManager | ✅ Готов | SPAManager, Map Points | ✅ Smoke |
| Content (Pages) | 🔄 В работе | Все модули | ⏳ Pending |
| Localization (Full) | 🔄 В работе | i18n | ⏳ Pending |
| Optimization | ⏳ Ожидает | Все модули | ⏳ Pending |

---

## 🚨 Блокеры и проблемы

### Текущие блокеры:
- Нет критических блокеров

### Решенные проблемы:
- [x] Проблема с воспроизведением аудио на iOS - решено через разблокировку по клику
- [x] Конфликты курсоров между страницами - решено через унификацию в SPA
- [x] Проблемы с позиционированием на мобильных - решено через адаптивные data-атрибуты

---

## 📈 Метрики проекта

**Файлы:**
- HTML страниц: 51 (tumski + dwor + ogrod + katedra)
- JavaScript модулей: 15+
- CSS файлов: 30+
- JSON переводов: 7 языков × ~200+ строк

**Локализации:**
- ru (русский) - ✅ 100%
- pl (польский) - 🔄 80%
- en (английский) - 🔄 75%
- de (немецкий) - 🔄 70%
- cs (чешский) - 🔄 65%
- be (белорусский) - 🔄 60%
- uk (украинский) - 🔄 60%

**Контент:**
- Геометок реализовано: ~50+
- Квест-маркеров: ~10+
- Аудио треков: 5 (town, birds, kostel, hang, quest)
- Звуковых эффектов: 2 (step, opening-a-book)

---

*Этот файл — SINGLE SOURCE OF TRUTH для текущего состояния проекта*
*Обновляй после каждой фазы согласно PROCESS.md!*
