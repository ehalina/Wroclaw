# Stage 7 - Cleanup, docs и governance

## Цель

Завершить рефакторинг так, чтобы проектная документация и рабочие правила соответствовали фактическому коду.

## Scope

Входит:

- удаление или архивирование временных файлов;
- обновление `BACKLOG.md`;
- обновление `ARCHITECTURE.md`;
- обновление `README.md`;
- обновление `AGENTS.md`, если появились новые правила;
- фиксация новых Makefile commands;
- финальный review.

Не входит:

- изменение статусов в `BACKLOG.md` без реальной реализации;
- release/commit/push без явной команды пользователя;
- cleanup, который меняет runtime behavior.

## Кандидаты на cleanup

- ✅ `arrow_handlers.js.backup` - removed in Stage 7.1;
- ✅ `quest_marker_handler.js.new` - removed in Stage 7.1;
- ✅ `sunset_parallax copy.js` - removed in Stage 7.1;
- устаревшие localization duplicates после Stage 5;
- unreferenced assets после Stage 6.

Перед удалением:

- проверить references через checker;
- проверить git history при необходимости;
- убедиться, что файл не нужен для восстановления контента;
- сделать удаление отдельным маленьким изменением.

## Status Update - 2026-06-27 - Stage 7.1

Stage 7.1 выполнен:

- Удалены root-level temporary JS files:
  - `arrow_handlers.js.backup`;
  - `quest_marker_handler.js.new`;
  - `sunset_parallax copy.js`.
- Перед удалением проверено:
  - runtime references отсутствуют по `rg`;
  - `scripts/check-js-syntax.mjs` уже пропускал `.backup`, `.new` и ` copy.` файлы;
  - `scripts/build-capacitor-web.mjs` уже исключал `.backup`, `.new` и ` copy.` файлы из package build.
- Runtime behavior не менялся.
- Validation: `make audit` passed; build summary remains `332 files, 84.5 MB -> www/`.

Следующий подэтап:

- Stage 7.2: cleanup known static inventory allowlist entries for debug/test pages or legacy route entry, one category at a time.

## Status Update - 2026-06-27 - Stage 7.2

Stage 7.2 выполнен:

- `debug_styles.html` и `quick_test.html` больше не ссылаются на отсутствующие:
  - `input_compatibility.css`;
  - `input_detection.js`.
- Для этих debug/test страниц добавлен маленький inline input-mode detector, который:
  - уважает `localStorage.input-type-override`;
  - выставляет `html[data-input-type]` через pointer/touch detection;
  - сохраняет существующие кнопки `Desktop режим` / `Touch режим`.
- `scripts/static-check-known-issues.json` больше не содержит `missingAssets` allowlist entries.
- Runtime tour pages не менялись.
- Validation: `make audit` passed; static inventory now reports only the remaining known route entry.

Следующий подэтап:

- Stage 7.3: cleanup оставшийся legacy route allowlist entry `right_arrow_handler.js -> tumski_02.html`.

## Status Update - 2026-06-27 - Stage 7.3

Stage 7.3 выполнен:

- Удалён unreferenced legacy handler `right_arrow_handler.js`.
- Перед удалением проверено:
  - ни одна runtime HTML page не подключает `right_arrow_handler.js`;
  - активная стрелочная навигация использует `arrow_handlers.js` / `common.js`;
  - canonical page существует как `tumski02.html`, а `tumski_02.html` отсутствует.
- `scripts/static-check-known-issues.json` больше не содержит `missingRoutes` allowlist entries.
- Validation: `make audit` passed; static inventory reports no known missing assets/routes, JS syntax check covers `62 files`, build summary is `331 files, 84.5 MB -> www/`.

Следующий подэтап:

- Stage 7.4: cleanup remaining governance/docs warnings, starting with legacy locale duplicate policy.

## Status Update - 2026-06-27 - Stage 7.4

Stage 7.4 выполнен:

- Удалены obsolete legacy locale files:
  - `locales/be/translation.json`;
  - `locales/cs/translation.json`;
  - `locales/de/translation.json`;
  - `locales/en/translation.json`;
  - `locales/pl/translation.json`;
  - `locales/ru/translation.json`;
  - `locales/uk/translation.json`.
- Перед удалением проверено:
  - runtime `i18n.js` загружает только `locales/<lang>/translations.json`;
  - legacy files содержали только 2 old keys против 393 canonical keys;
  - `scripts/check-translations.mjs` проверяет canonical `translations.json`.
- Canonical localization source теперь единственный в `locales/*/translations.json`.
- Validation: `make audit` passed; translation checker no longer prints legacy duplicate warnings, build summary is `324 files, 84.5 MB -> www/`.

Следующий подэтап:

- Stage 7.5: update README/AGENTS governance notes for current Makefile checks and refactoring docs.

## Status Update - 2026-06-27 - Stage 7.5

Stage 7.5 выполнен:

- `README.md` обновлён под текущий project state:
  - actual quality commands (`make test`, `make test-e2e`, `make smoke`, `make audit`);
  - current package baseline `324 files, 84.5 MB -> www/`;
  - canonical localization path `locales/<lang>/translations.json`;
  - `PROJECT_SNAPSHOT.md` и `docs/refactoring/` как важные docs entry points.
- `AGENTS.md` обновлён под фактический проект:
  - заполнены project name/date, core application files, configuration/check scripts;
  - зафиксирован vanilla JS/Capacitor stack;
  - command block приведён к реальному Makefile;
  - добавлены project-specific constraints for `www/`, localization, media assets and route filenames.
- Validation: `make audit` passed; build summary remains `324 files, 84.5 MB -> www/`.

Следующий подэтап:

- Stage 7.6: final cleanup review for remaining CR-11/debug logging and stale placeholders.

## Status Update - 2026-06-27 - Stage 7.6

Stage 7.6 выполнен:

- `arrow_handlers.js` active `console.log` / `console.warn` diagnostics переведены на local gated helpers:
  - `debugLog(...)`;
  - `debugWarn(...)`.
- Диагностика стрелок выключена по умолчанию и включается явно через:
  - `window.DEBUG_ARROWS = true`;
  - `localStorage.DEBUG_ARROWS = "1"`;
  - legacy `localStorage.__arrow_debug = "1"`.
- `console.error` в arrow handlers оставлен для реальных ошибок.
- Добавлен Playwright smoke на quiet default и оба debug-enable paths.
- CR-11 частично закрыт для `arrow_handlers.js`; auth/rating diagnostics in `user_account.js` remain separate debt.
- Validation: `make smoke` passed with 50 Playwright tests; `make audit` passed with build summary `324 files, 84.5 MB -> www/`.

Следующий подэтап:

- Stage 7.7: decide whether to gate `user_account.js` diagnostics or document them as post-MVP auth/rating observability debt.

## Status Update - 2026-06-27 - Stage 7.7

Stage 7.7 выполнен:

- `user_account.js` active auth/rating `console.log` / `console.warn` diagnostics переведены на existing local account debug helpers:
  - `_alog(...)`;
  - `_awarn(...)`.
- Account diagnostics выключены по умолчанию и включаются явно через:
  - `window.DEBUG_ACCOUNT = true`;
  - `localStorage.DEBUG_ACCOUNT = "1"`;
  - legacy `localStorage.__account_debug = "1"`.
- `console.error` в account manager оставлен для реальных runtime/database errors.
- Добавлен Playwright smoke на quiet default, global flag, storage flag и legacy flag.
- CR-11 закрыт для `user_account.js`; remaining Firebase/auth/leaderboard diagnostics in `user_database.js` remain separate debt.
- Validation: `make smoke` passed with 52 Playwright tests.

Следующий подэтап:

- Stage 7.8: gate `user_database.js` diagnostics through the same account debug policy, preserving current error reporting.

## Status Update - 2026-06-27 - Stage 7.8

Stage 7.8 выполнен:

- `user_database.js` active Firebase/auth/leaderboard `console.log` diagnostics переведены на existing local database debug helper:
  - `_dlog(...)`.
- Database diagnostics используют ту же account debug policy, что и Stage 7.7:
  - `window.DEBUG_ACCOUNT = true`;
  - `localStorage.DEBUG_ACCOUNT = "1"`;
  - legacy `localStorage.__account_debug = "1"`.
- `console.error` в database layer оставлен для реальных Firebase/Firestore failures.
- Добавлен Playwright smoke на quiet default, global flag, storage flag и legacy flag.
- Repo-wide logging scan показал, что CR-11 ещё открыт для отдельных runtime/debug clusters:
  - `gnome_marker_handler.js`;
  - SPA shell / standalone diagnostics;
  - legacy/debug audio utilities.
- Validation: `make smoke` passed with 54 Playwright tests.

Следующий подэтап:

- Stage 7.9: gate `gnome_marker_handler.js` diagnostics, preserving gnome popup/navigation behavior.

## Status Update - 2026-06-27 - Stage 7.9

Stage 7.9 выполнен:

- `gnome_marker_handler.js` active gnome popup/navigation `console.log` diagnostics переведены на shared map diagnostics helper:
  - `MapDebug.log(...)`.
- Gnome diagnostics используют существующую map debug policy:
  - `window.DEBUG_MAP = true`;
  - `localStorage.DEBUG_MAP = "1"`;
  - legacy `localStorage.__quest_debug = "1"`.
- `console.error` в gnome handler оставлен для real popup/navigation failures.
- Добавлен Playwright smoke на quiet default и `DEBUG_MAP` / storage-enable paths для Patsa Vatsa route branch.
- Validation: `make smoke` passed with 56 Playwright tests.

Следующий подэтап:

- Stage 7.10: remaining runtime diagnostics inventory and small gates/defer decisions for SPA shell, standalone pages and legacy/debug audio utilities.

## Status Update - 2026-06-27 - Stage 7.10

Stage 7.10 выполнен:

- Проведен focused repo-wide scan remaining active `console.log` / `console.warn` outside tests/scripts/tools/docs/build output.
- Создан inventory: `docs/refactoring/stage-07-runtime-diagnostics-inventory.md`.
- Оставшиеся diagnostics split на follow-up stages:
  - Stage 7.11: SPA shell diagnostics gate;
  - Stage 7.12: audio promise rejection diagnostics;
  - Stage 7.13: one-line runtime init diagnostics;
  - Stage 7.14: legacy audio diagnostics module review;
  - Stage 7.15: standalone/debug page diagnostics policy.
- Already gated helper internals (`arrow_handlers.js`, `map_debug.js`, `user_account.js`, `user_database.js`) explicitly excluded from further action.

Следующий подэтап:

- Stage 7.11: gate remaining active SPA route/hash diagnostics in `index.html`, preserving current navigation behavior.

## Status Update - 2026-06-27 - Stage 7.11

Stage 7.11 выполнен:

- `index.html` active SPA route/hash diagnostics переведены на local `spaDebugLog`.
- SPA diagnostics включаются явно через:
  - `window.DEBUG_SPA = true`;
  - `localStorage.DEBUG_SPA = "1"`;
  - legacy `localStorage.__spa_debug = "1"`.
- `console.error` failure paths остаются visible.
- Audio `.catch(console.log)` handlers intentionally left unchanged for Stage 7.12.
- Добавлен Playwright smoke на quiet default и global/storage/legacy debug-enable paths.
- Validation: `make smoke` passed with 58 Playwright tests.

Следующий подэтап:

- Stage 7.12: replace remaining audio `.catch(console.log)` handlers with quiet debug-aware handling.

## Status Update - 2026-06-27 - Stage 7.12

Stage 7.12 выполнен:

- `index.html` remaining `audio.play().catch(console.log)` handlers replaced with `handleSpaAudioPlayRejection`.
- `language_menu.js` remaining `audio.play().catch(console.log)` handlers replaced with `handleLanguageMenuAudioPlayRejection`.
- Audio rejection diagnostics включаются явно через:
  - `window.DEBUG_AUDIO = true`;
  - `localStorage.DEBUG_AUDIO = "1"`;
  - legacy `localStorage.__audio_debug = "1"`.
- Default behavior stays quiet for expected autoplay/playback promise rejections.
- Added Playwright smoke through real SPA `ended` and `LanguageMenu.startTownMusic()` call sites.
- Validation: `make smoke` passed with 60 Playwright tests.

Следующий подэтап:

- Stage 7.13: gate/remove low-value one-line runtime init diagnostics in `spa_minimap_manager.js` and `firebase_config.js`.

## Status Update - 2026-06-27 - Stage 7.13

Stage 7.13 выполнен:

- `spa_minimap_manager.js` low-value tumski21 disabled diagnostic moved behind local mini-map debug gate.
- Mini-map diagnostics включаются явно через:
  - `window.DEBUG_MINIMAP = true`;
  - `localStorage.DEBUG_MINIMAP = "1"`;
  - legacy-style `localStorage.__minimap_debug = "1"`.
- `firebase_config.js` Firebase success diagnostic moved behind local Firebase debug gate.
- Firebase success diagnostics включаются явно через:
  - `window.DEBUG_FIREBASE = true`;
  - `localStorage.DEBUG_FIREBASE = "1"`;
  - legacy-style `localStorage.__firebase_debug = "1"`.
- `console.error` Firebase placeholder/init failure paths stay visible.
- Added Playwright smoke for mini-map quiet default and global/storage/legacy-style debug-enable paths.
- Stabilized loading-state smoke to wait for initial overlay hide before helper contract assertions.
- Validation: `make smoke` passed with 62 Playwright tests.

Следующий подэтап:

- Stage 7.14: review `background_music111.js` runtime references and remove or gate retained legacy diagnostics.

## Status Update - 2026-06-27 - Stage 7.14

Stage 7.14 выполнен:

- Reviewed runtime references for `background_music111.js` with focused `rg` scans.
- Confirmed no active runtime HTML/script references outside the module itself and generated/stale docs context.
- Deleted unreferenced `background_music111.js` instead of adding debug gates to dead code.
- Added review artifact: `docs/refactoring/stage-07-14-legacy-audio-module-review.md`.
- Updated `AUDIO_VISIBILITY_README.md` to remove the stale direct integration claim and describe current dynamic/manual audio registration.

Следующий подэтап:

- Stage 7.15: define standalone/debug page diagnostics policy for `katedra_panorama.html` and `audio_visibility_test.html`.

## Status Update - 2026-06-27 - Stage 7.15

Stage 7.15 выполнен:

- `katedra_panorama.html` active video `console.log` / `console.warn` diagnostics переведены на local gated helper:
  - `window.DEBUG_PANORAMA = true`;
  - `localStorage.DEBUG_PANORAMA = "1"`;
  - legacy-style `localStorage.__panorama_debug = "1"`.
- `console.error` в panorama source/playback failure paths оставлен visible для реальных ошибок.
- `audio_visibility_test.html` задокументирован как manual debug/test page exception: его in-page event log намеренно зеркалируется в DevTools через `console.log`.
- Добавлен Playwright smoke на quiet default и global/storage/legacy debug-enable paths для `PanoramaDebug`.
- CR-11 production runtime logging cleanup закрыт; оставшиеся `console.error` paths и manual debug-page console mirror считаются intentional.

Следующий подэтап:

- Stage 7.16: switch `www/` from generated Capacitor output to tracked web source of truth.

## Status Update - 2026-06-27 - Stage 7.16

Stage 7.16 выполнен:

- `www/` стал tracked web source of truth и остаётся `capacitor.config.json` `webDir`.
- Root-level HTML/CSS/JS runtime files, `media/`, `locales/` and `thumbs/` сняты с роли source tree; редактировать нужно `www/*`.
- `make dev`, Playwright web servers, static inventory, JS syntax check and translation check now use `www/` as document/runtime root.
- `scripts/build-capacitor-web.mjs` больше не удаляет и не копирует `www/`; `make build` валидирует tracked `www/`, forbidden non-runtime paths and 120 MB package budget.
- Source-only assets that were previously excluded from Capacitor package moved to `non_runtime_assets/`.
- `make clean` no longer removes `www/`; it only cleans test/report artifacts.

Следующий подэтап:

- Stage 7.17: remove stale tracked generated AI context dump after `www/` became the source of truth.

## Status Update - 2026-06-27 - Stage 7.17

Stage 7.17 выполнен:

- Removed tracked `project-context.md`, which was a stale generated full-context dump from the pre-`www/` source layout.
- Added git ignore rules for generated AI context dumps:
  - `project-context.md`;
  - `context-*.md`;
  - `.llm/context-*.md`.
- Canonical project context remains in maintained docs: `BACKLOG.md`, `ARCHITECTURE.md`, `CLAUDE.md` and `PROJECT_SNAPSHOT.md`.

Следующий подэтап:

- Stage 8 decision gate: define whether the next track is content completion, localization, or image optimization.

## Documentation updates

`BACKLOG.md`:

- обновить статусы только для реально завершенных работ;
- добавить оставшиеся refactor debts как задачи, если они не закрыты;
- не использовать план как замену backlog.

`ARCHITECTURE.md`:

- описать новую структуру SPA modules;
- описать message contract;
- описать MapModal/Quest module boundaries;
- описать localization source of truth.

`README.md`:

- обновить команды запуска/проверок;
- добавить актуальный development workflow, если изменился;
- не перегружать внутренними деталями.

`AGENTS.md`:

- добавить project-specific правила, которые реально появились;
- указать обязательные smoke checks;
- описать, где лежат refactoring docs.

## Финальный review

Провести повторный code review по вопросам:

- остались ли P1/P2 findings из `00-code-review.md`;
- есть ли новые runtime risks;
- все ли проверки запускаются через Makefile;
- не появились ли новые backup/temp files;
- совпадает ли документация с фактической архитектурой.

## Проверки

```bash
make lint
make typecheck
make test
make build
make security
```

Дополнительно:

- full manual smoke checklist;
- asset/link checker;
- translation checker;
- git status review.

## Done

- Runtime tree очищен от временных файлов.
- Документация отражает фактический код.
- `BACKLOG.md` остается единственным source of truth по задачам.
- Все новые проверки описаны и запускаются через Makefile.
- Финальный review не содержит незакрытых P1/P2 без явного backlog item.

## Stop signals

- Есть незавершенные runtime fixes из Stage 2.
- Документация требует продуктовых решений.
- Cleanup затрагивает файлы, назначение которых не удалось доказать.
