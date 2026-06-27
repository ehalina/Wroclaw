# Project Backlog

**Project:** Wroclaw - Interactive Tumski Island Tour
**Version:** 0.1.0
**Last Updated:** 2026-06-27

> **📋 Authoritative Source:** This is the SINGLE SOURCE OF TRUTH for:
> - ✅ **Detailed implementation plan** with checklists
> - ✅ **Current status** of all features (TODO/IN PROGRESS/DONE)
> - ✅ **Sprint roadmap** and task breakdown
>
> **⚠️ NOT in ARCHITECTURE.md:**
> ARCHITECTURE.md explains WHY (technology choices, design principles).
> THIS file contains WHAT to do (tasks, checklists, status).
>
> **For AI Agents:**
> When user asks for checklist or "what's next?" → Read THIS file, not ARCHITECTURE.md
>
> **📋 После завершения каждой фазы:**
> - Обнови этот файл согласно [`PROCESS.md`](./PROCESS.md)
> - Обнови [`PROJECT_SNAPSHOT.md`](./PROJECT_SNAPSHOT.md) с текущим прогрессом
> - См. [`DEVELOPMENT_PLAN_TEMPLATE.md`](./DEVELOPMENT_PLAN_TEMPLATE.md) для методологии планирования
>
> All AI agents and developers MUST check this file before starting work.

---

## 📊 Project Status Overview

**Current Phase:** Development - Content & Localization
**Active Sprint:** Phase 2
**Completion:** 75% of MVP features

### Quick Stats
- ✅ **Completed:** 8 core features
- 🚧 **In Progress:** 3 features (Content, Localization, Optimization)
- 📋 **Planned:** 5 features
- 🔴 **Blocked:** 0 features

---

## 🎯 MVP (Minimum Viable Product)

### Core Features Status

#### ✅ Completed Features

- [x] **SPA Navigation System** - Seamless navigation between pages via iframe
  - Implemented: 2024-12
  - Files: `index.html`, `spa_integration.js`
  - Notes: SPAManager class handles page loading and transitions

- [x] **GeoMarker System** - Clickable markers on map with modal windows
  - Implemented: 2024-12
  - Files: `tumski_cathedral_handler.js`, `map_modal.js`
  - Notes: Universal handler for all geo markers

- [x] **Music System** - Background music switching between locations
  - Implemented: 2024-12
  - Files: `index.html` (SPAManager music methods)
  - Notes: Supports 5 tracks (town, birds, kostel, hang, quest)

- [x] **i18n Localization** - Multi-language support (7 languages)
  - Implemented: 2024-12
  - Files: `i18n.js`, `locales/*/translations.json`
  - Notes: JSON-based translation system

- [x] **Quest Marker System** - Interactive quest points on map
  - Implemented: 2024-12
  - Files: `quest_marker_handler.js`
  - Notes: Separate handler for quest-specific markers

- [x] **Responsive Design** - Mobile and desktop support
  - Implemented: 2024-12
  - Files: All CSS files with media queries
  - Notes: Adaptive positioning via data-x-desktop/data-x-mobile attributes

- [x] **Custom Cursors** - Navigation arrows with custom cursors
  - Implemented: 2024-12
  - Files: `arrow_handlers.js`, CSS cursor styles
  - Notes: Custom PNG cursors for navigation

- [x] **Capacitor Native Wrapper** - Android/iOS shell for the static tour
  - Implemented: 2026-06-26
  - Files: `package.json`, `capacitor.config.json`, `scripts/build-capacitor-web.mjs`, `android/`, `ios/`, `Makefile`
  - Notes: `make cap-sync` builds `www/` and syncs native projects; Android debug build passes with JDK 21

**Template:**
```markdown
- [x] **Feature Name** - Description
  - Implemented: YYYY-MM-DD
  - Files: `path/to/file.ts`
  - Notes: Any notes
```

---

#### 🚧 In Progress

- [ ] **Content Completion** - Fill all 24 tumski pages with full content
  - Status: 60% complete
  - Blocked by: None
  - ETA: 2025-01-20
  - Assignee: Content team / AI Agent
  - Notes: Some pages have placeholder content

- [ ] **Full Localization** - Complete translations for all 7 languages
  - Status: 70% complete
  - Blocked by: None
  - ETA: 2025-01-25
  - Assignee: Translators / AI Agent
  - Notes: ru - 100%, pl - 80%, en - 75%, others 60-70%

- [ ] **Performance Optimization** - Image optimization and lazy loading
  - Status: 30% complete
  - Blocked by: None
  - ETA: 2025-01-30
  - Assignee: Developer / AI Agent
  - Notes: Need to optimize large images in media/tumski/

**Template:**
```markdown
- [ ] **Feature Name** - Description
  - Status: X% complete
  - Blocked by: None
  - ETA: YYYY-MM-DD
  - Assignee: Name
```

---

#### 📋 Planned (High Priority)

1. [ ] **Missing GeoMarkers** - Add geo markers to pages that don't have them yet
   - Priority: High
   - Dependencies: Content Completion
   - Estimated effort: Medium (2-3 hours)
   - Notes: Check all tumski pages for missing markers

2. [ ] **Audio Unlock Improvement** - Better UX for audio unlock on mobile devices
   - Priority: Medium
   - Dependencies: None
   - Estimated effort: Small (1-2 hours)
   - Notes: Current implementation works but can be smoother

3. [ ] **Error Handling** - Better error handling for failed page loads
   - Priority: Medium
   - Dependencies: None
   - Estimated effort: Small (1 hour)
   - Notes: Add fallback UI for failed iframe loads

4. [ ] **Loading States** - Better loading indicators during page transitions
   - Priority: Low
   - Dependencies: None
   - Estimated effort: Small (1 hour)
   - Notes: Current overlay works, but can be enhanced

5. [ ] **Documentation** - Complete project documentation
   - Priority: High
   - Dependencies: None
   - Estimated effort: Medium (3-4 hours)
   - Notes: In progress (this file), needs completion

**Template:**
```markdown
- [ ] **Feature Name** - Description
  - Priority: High
  - Dependencies: None
  - Estimated effort: Medium
```

---

#### 🔴 Blocked

[ЗАПОЛНИТЬ - features that are blocked]

- [ ] **[Feature Name]** - [Description]
  - Blocked by: [Reason]
  - Action needed: [What needs to happen]
  - Owner: [Who needs to unblock]

---

## 🎨 UI/UX Improvements

[ЗАПОЛНИТЬ - UI/UX enhancements]

### Planned
- [ ] [UI improvement]
- [ ] [UX enhancement]

### Completed
- [x] [Completed UI change] - [DATE]

---

## 🐛 Known Issues

[ЗАПОЛНИТЬ - tracked bugs and issues]

### Critical (Fix ASAP)
- [ ] **[Bug Name]** - [Description]
  - Impact: [Who/what is affected]
  - Workaround: [Temporary solution if any]
  - Assignee: [Name]

### Medium Priority
- [ ] **[Bug Name]** - [Description]

### Low Priority
- [ ] **[Minor Issue]** - [Description]

**Template:**
```markdown
- [ ] **Bug: Issue Name** - Description
  - Impact: Affects all users
  - Workaround: None
  - Assignee: Name
```

---

## 🔧 Technical Debt

### Completed

- [x] **Refactor: SPA message boundary first pass** - Added explicit same-origin `postMessage` contract and smoke coverage
  - Completed: 2026-06-26
  - Files: `spa_message_contract.js`, `index.html`, `tumski_page_common.js`, `tumski.html`, `language_menu.js`, `map_modal.js`, `tests/smoke.spec.mjs`
  - Benefit: iframe navigation and language messages now have schema/source/origin checks before deeper SPA extraction

- [x] **Refactor: SPA config extraction** - Moved pure SPA shell constants out of `index.html`
  - Completed: 2026-06-26
  - Files: `spa_config.js`, `index.html`, `tests/smoke.spec.mjs`
  - Benefit: page order, start page, iframe selectors and audio route policy now have one source before lifecycle extraction

- [x] **Refactor: SPA lifecycle helper extraction** - Moved first pure page lifecycle helpers out of `index.html`
  - Completed: 2026-06-27
  - Files: `spa_lifecycle.js`, `index.html`, `tests/smoke.spec.mjs`
  - Benefit: page/hash parsing, iframe/container creation and active iframe lookup are isolated before stateful SPA lifecycle extraction

- [x] **Refactor: MiniMapManager extraction** - Moved mini-map UI/state class out of `index.html`
  - Completed: 2026-06-27
  - Files: `spa_minimap_manager.js`, `index.html`, `tests/smoke.spec.mjs`
  - Benefit: mini-map DOM/state/message handoff logic is isolated before `map_modal.js` and quest modularization

- [x] **Refactor: MapModal init idempotency** - Made `MapModal.init()` safe to call repeatedly
  - Completed: 2026-06-27
  - Files: `map_modal.js`, `tests/smoke.spec.mjs`
  - Benefit: map/quest DOM, style injection and listeners are no longer duplicated before template/style extraction

- [x] **Refactor: MapModal template helper extraction** - Moved inline modal template out of `MapModal.init()`
  - Completed: 2026-06-27
  - Files: `map_modal.js`, `tests/smoke.spec.mjs`
  - Benefit: modal DOM template and insertion are isolated before deciding whether to create `map_modal_template.js`

- [x] **Refactor: MapModal CSS extraction** - Moved main map modal styles into a standalone stylesheet
  - Completed: 2026-06-27
  - Files: `map_modal.css`, `map_modal.js`, `tests/smoke.spec.mjs`
  - Benefit: the largest static style block is out of `map_modal.js` without editing 54 HTML script includes

- [x] **Refactor: Map marker navigation extraction** - Moved visited-marker route decisions into a standalone helper
  - Completed: 2026-06-27
  - Files: `map_marker_navigation.js`, `map_modal.js`, `tests/smoke.spec.mjs`
  - Benefit: marker clicks now delegate SPA/fallback navigation through a focused helper while `map_modal.js` keeps modal cleanup and marker rendering

- [x] **Refactor: Visited markers storage/render extraction** - Moved visited-marker persistence and DOM rendering into a standalone helper
  - Completed: 2026-06-27
  - Files: `visited_markers.js`, `map_modal.js`, `tests/smoke.spec.mjs`
  - Benefit: `map_modal.js` keeps modal/preview/navigation wiring while visited-page parsing, saving and marker layer rendering are isolated behind a focused helper

- [x] **Refactor: Quest overlay extraction** - Moved quest/book overlay rendering out of `map_modal.js`
  - Completed: 2026-06-27
  - Files: `quest_overlay.js`, `map_modal.js`, `tests/smoke.spec.mjs`
  - Benefit: `map_modal.js` keeps modal lifecycle wiring while quest book opening, intro rendering, reset confirmation and prepared-task controls live behind a focused helper

- [x] **Refactor: Map/quest debug logging gate** - Moved map and quest diagnostics behind explicit debug flags
  - Completed: 2026-06-27
  - Files: `map_debug.js`, `quest_marker_handler.js`, `tumski_cathedral_handler.js`, `tumski_page_common.js`, `tests/smoke.spec.mjs`
  - Benefit: production console stays quiet while map/quest diagnostics remain available through `DEBUG_MAP` and legacy `__quest_debug`

- [x] **Refactor: i18n rich HTML safety gate** - Moved central i18n updates to text-by-default with explicit rich HTML allowlist
  - Completed: 2026-06-27
  - Files: `i18n.js`, `scripts/check-translations.mjs`, `tests/smoke.spec.mjs`
  - Benefit: `data-i18n` no longer inserts arbitrary HTML by default while vetted long-form text keeps `<br>` formatting through a strict sanitizer

- [x] **Refactor: strict translation key consistency** - Made locale key mismatches fail in `make test`
  - Completed: 2026-06-27
  - Files: `locales/be/translations.json`, `i18n.js`, `scripts/check-translations.mjs`
  - Benefit: all 7 canonical `translations.json` files now share the same key set and future localization drift fails fast

- [x] **Refactor: common.js text-only i18n sinks** - Removed low-risk direct `innerHTML` writes from shared common UI text updates
  - Completed: 2026-06-27
  - Files: `common.js`
  - Benefit: shared tooltip, legacy book labels and audio-unlock sync now use text-safe i18n updates before deeper overlay cleanup

- [x] **Refactor: gnome description sanitizer** - Restricted gnome rich text rendering to escaped HTML plus `<br>`
  - Completed: 2026-06-27
  - Files: `gnome_marker_handler.js`, `tests/smoke.spec.mjs`
  - Benefit: gnome descriptions keep current line-break formatting without allowing arbitrary translation/content HTML into the DOM

- [x] **Refactor: quest intro/list DOM rendering** - Replaced quest intro/list HTML string writes with DOM API rendering
  - Completed: 2026-06-27
  - Files: `quest_overlay.js`, `quest_marker_handler.js`, `tests/smoke.spec.mjs`
  - Benefit: quest intro paragraphs and task list cleanup no longer depend on raw `innerHTML`, reducing XSS-shaped risk before page template work

- [x] **Refactor: i18n updatePageContent simplification** - Removed duplicate audio-unlock localization passes from central page updates
  - Completed: 2026-06-27
  - Files: `i18n.js`, `tests/smoke.spec.mjs`
  - Benefit: `[data-i18n]` is now the single normal localization path while legacy audio-unlock fallback remains compatible for older markup

- [x] **Refactor: page block inventory** - Documented repeated HTML page blocks before shared helper rollout
  - Completed: 2026-06-27
  - Files: `docs/refactoring/stage-05-page-block-inventory.md`
  - Benefit: shared page helper work now has a concrete stable page family, known exceptions and a first low-risk migration candidate

- [x] **Refactor: additive page shell helper** - Added pure DOM helpers for future shared content page fragments
  - Completed: 2026-06-27
  - Files: `page_shell_helpers.js`, `tests/smoke.spec.mjs`
  - Benefit: scene, cursor and marker fragments now have a tested helper contract before any production HTML page is migrated

- [x] **Refactor: dwor01 cursor helper migration** - Migrated one low-risk page cursor pair to the shared page shell helper
  - Completed: 2026-06-27
  - Files: `dwor01.html`, `page_shell_helpers.js`, `tests/smoke.spec.mjs`
  - Benefit: first production content page now uses the shared helper for route cursors under a dedicated DOM contract smoke test

- [x] **Refactor: route cursor render helper** - Added descriptor-based route cursor rendering for page shell migrations
  - Completed: 2026-06-27
  - Files: `page_shell_helpers.js`, `dwor01.html`, `tests/smoke.spec.mjs`
  - Benefit: production pages can pass cursor config as data while helper owns DOM creation and exact route cursor class/attribute output

- [x] **Refactor: marker render helper** - Migrated `dwor01` marker blocks to descriptor-based shared helper rendering
  - Completed: 2026-06-27
  - Files: `page_shell_helpers.js`, `dwor01.html`, `tests/smoke.spec.mjs`
  - Benefit: production pages can render marker blocks from data while preserving existing marker ids, quest attrs, audio nodes and i18n keys under smoke coverage

- [x] **Refactor: dwor01 page descriptor module** - Moved `dwor01` helper setup out of inline HTML modules
  - Completed: 2026-06-27
  - Files: `dwor01.html`, `dwor01_page.js`, `tests/smoke.spec.mjs`
  - Benefit: `dwor01` now has a reusable page-specific data/render module pattern while the HTML shell stays simple and the helper-generated DOM remains smoke-covered

- [x] **Refactor: dwor02 page descriptor module** - Validated the page module pattern on a second low-risk content page
  - Completed: 2026-06-27
  - Files: `dwor02.html`, `dwor02_page.js`, `tests/smoke.spec.mjs`
  - Benefit: shared page helper rollout is now proven on two adjacent production pages before adding any broader renderer abstraction

- [x] **Refactor: configured page renderer** - Centralized page module rendering for marker and route descriptors
  - Completed: 2026-06-27
  - Files: `page_shell_helpers.js`, `dwor01_page.js`, `dwor02_page.js`, `tests/smoke.spec.mjs`
  - Benefit: page modules now keep descriptor data separate from shared DOM rendering calls, reducing copy/paste before additional page migrations

- [x] **Docs: content page workflow** - Documented the controlled Stage 5 page migration workflow
  - Completed: 2026-06-27
  - Files: `docs/refactoring/stage-05-content-workflow.md`, `docs/refactoring/stage-05-page-template-and-i18n-consolidation.md`
  - Benefit: future content pages can follow a documented shell/module/descriptor pattern with required smoke contracts and rollout rules

- [x] **Docs: asset size report** - Created the Stage 6 package and media size baseline
  - Completed: 2026-06-27
  - Files: `docs/refactoring/stage-06-asset-size-report.md`, `docs/refactoring/stage-06-performance-and-capacitor-package.md`
  - Benefit: performance work now has a measured `www` baseline, top-heavy asset list and cleanup candidates before any source deletion or image optimization

- [x] **Build: package root asset exclusions** - Excluded unreferenced root assets from Capacitor `www`
  - Completed: 2026-06-27
  - Files: `scripts/build-capacitor-web.mjs`, `docs/refactoring/stage-06-asset-size-report.md`, `docs/refactoring/stage-06-performance-and-capacitor-package.md`
  - Benefit: build output dropped from 350 files / 138.2 MB to 348 files / 132.3 MB without deleting source assets or touching runtime media

- [x] **Build: package exclusion reference guard** - Added a build-time guard for explicitly excluded runtime paths
  - Completed: 2026-06-27
  - Files: `scripts/build-capacitor-web.mjs`, `docs/refactoring/stage-06-asset-size-report.md`, `docs/refactoring/stage-06-performance-and-capacitor-package.md`
  - Benefit: `make build` now fails if a path excluded from `www` becomes referenced again in runtime HTML/CSS/JS/JSON

- [x] **Build: package media asset exclusions** - Excluded large unreferenced media candidates from Capacitor `www`
  - Completed: 2026-06-27
  - Files: `scripts/build-capacitor-web.mjs`, `docs/refactoring/stage-06-asset-size-report.md`, `docs/refactoring/stage-06-performance-and-capacitor-package.md`
  - Benefit: build output dropped from 348 files / 132.3 MB to 343 files / 105.9 MB without deleting source assets or touching referenced runtime media

- [x] **Build: package size budget guard** - Enforced a logical size budget for Capacitor `www`
  - Completed: 2026-06-27
  - Files: `scripts/build-capacitor-web.mjs`, `docs/refactoring/stage-06-asset-size-report.md`, `docs/refactoring/stage-06-performance-and-capacitor-package.md`
  - Benefit: `make build` now fails if the generated web package exceeds the documented 120 MB budget

- [x] **Build: package gnome source-only exclusions** - Excluded large unreferenced gnome PNG sources from Capacitor `www`
  - Completed: 2026-06-27
  - Files: `scripts/build-capacitor-web.mjs`, `docs/refactoring/stage-06-asset-size-report.md`, `docs/refactoring/stage-06-performance-and-capacitor-package.md`
  - Benefit: build output dropped from 343 files / 105.9 MB to 334 files / 89.0 MB while keeping runtime `krasnal_*.jpg` and `koza.jpg` assets packaged

- [x] **Docs: runtime asset optimization policy** - Documented safe rules for optimizing remaining runtime-heavy assets
  - Completed: 2026-06-27
  - Files: `docs/refactoring/stage-06-runtime-asset-optimization-policy.md`, `docs/refactoring/stage-06-asset-size-report.md`, `docs/refactoring/stage-06-performance-and-capacitor-package.md`
  - Benefit: future image/audio/video optimization now requires derivative assets, screenshot comparison and route/audio review instead of blind source overwrites

- [x] **Docs: tumski21 sunset screenshot characterization** - Captured desktop/mobile baseline before changing sunset assets
  - Completed: 2026-06-27
  - Files: `docs/refactoring/stage-06-08-sunset-characterization.md`, `playwright.stage-06-08.config.mjs`, `tools/stage-06-08/sunset-characterization.spec.mjs`, `docs/refactoring/artifacts/stage-06-08-sunset/`
  - Benefit: `tumski21` sunset optimization now has screenshots and measurements; `sunset3.png` was identified as preload-only on this page while visible sky uses `sunset3.jpg`

- [x] **Build: sunset3 preload/package cleanup** - Aligned sunset preload/demo sky asset with visible `tumski21` sky layer
  - Completed: 2026-06-27
  - Files: `sunset_parallax.js`, `sunset_parallax.html`, `scripts/build-capacitor-web.mjs`, `docs/refactoring/stage-06-asset-size-report.md`, `docs/refactoring/stage-06-performance-and-capacitor-package.md`
  - Benefit: `sunset3.png` is no longer packaged for Capacitor runtime; build output dropped from 334 files / 89.0 MB to 333 files / 87.0 MB while keeping the source original

- [x] **Docs: heavy audio route/use review** - Mapped runtime audio files before compression or lifecycle changes
  - Completed: 2026-06-27
  - Files: `docs/refactoring/stage-06-10-audio-route-use-review.md`, `docs/refactoring/stage-06-asset-size-report.md`, `docs/refactoring/stage-06-performance-and-capacitor-package.md`
  - Benefit: heavy MP3 files are confirmed as runtime assets; next safe work is lifecycle/package cleanup rather than blind compression

- [x] **Build: duplicate WAV package cleanup** - Excluded duplicate effect WAV copies from Capacitor `www`
  - Completed: 2026-06-27
  - Files: `scripts/build-capacitor-web.mjs`, `docs/refactoring/stage-06-asset-size-report.md`, `docs/refactoring/stage-06-performance-and-capacitor-package.md`
  - Benefit: build output dropped from 333 files / 87.0 MB to 331 files / 86.9 MB while root runtime WAV files remain packaged

- [x] **Docs: audio lifecycle refactor plan** - Planned safe stages for audio source policy and eager preload changes
  - Completed: 2026-06-27
  - Files: `docs/refactoring/stage-06-12-audio-lifecycle-refactor-plan.md`, `docs/refactoring/stage-06-performance-and-capacitor-package.md`
  - Benefit: next audio refactors are staged behind source-policy extraction and network characterization instead of changing playback and ownership together

- [x] **Refactor: audio source policy extraction** - Moved SPA track source URLs into `spa_config.js`
  - Completed: 2026-06-27
  - Files: `spa_config.js`, `index.html`, `tests/smoke.spec.mjs`, `docs/refactoring/stage-06-performance-and-capacitor-package.md`
  - Benefit: route policy and track URL policy now share the SPA config boundary; source paths and playback behavior are unchanged

- [x] **Test: audio lifecycle characterization** - Added Playwright baseline for `preloadBackgroundMusic()`
  - Completed: 2026-06-27
  - Files: `playwright.stage-06-14.config.mjs`, `tools/stage-06-14/audio-lifecycle-characterization.spec.mjs`, `docs/refactoring/stage-06-14-audio-lifecycle-characterization.md`, `docs/refactoring/artifacts/stage-06-14-audio/`
  - Benefit: Stage 6.15 lazy-preload refactor now has a desktop/mobile method-level oracle for current eager MP3 loading

- [x] **Refactor: lazy background audio preload** - Removed eager route-specific MP3 loading from `preloadBackgroundMusic()`
  - Completed: 2026-06-27
  - Files: `index.html`, `tools/stage-06-14/audio-lifecycle-characterization.spec.mjs`, `docs/refactoring/stage-06-15-lazy-audio-preload.md`, `docs/refactoring/artifacts/stage-06-15-audio/`
  - Benefit: `birds`, `kostel`, `hang`, and `quest` are no longer constructed/loaded by preload bookkeeping; actual playback still loads through `switchTrack()`

- [x] **Refactor: quest audio owner consolidation** - Consolidated shared `questMusic` creation and iframe attachment behind one helper
  - Completed: 2026-06-27
  - Files: `language_menu.js`, `index.html`, `quest_marker_handler.js`, `tests/smoke.spec.mjs`, `docs/refactoring/stage-06-16-quest-audio-owner.md`
  - Benefit: shared quest loop ownership now has one `QuestAudio` helper; `quest_overlay.js` local overlay sound remains a separate deferred decision

- [x] **Performance: sunset WebP runtime derivatives** - Replaced packaged visible sunset PNG runtime layers with lossless WebP derivatives
  - Completed: 2026-06-27
  - Files: `media/tumski/sunset/sunset1.webp`, `media/tumski/sunset/sunset2.webp`, `tumski21.html`, `tumski21.css`, `sunset_parallax.html`, `sunset_parallax.js`, `scripts/build-capacitor-web.mjs`, `Makefile`, `tools/stage-06-17/compare-sunset-screenshots.mjs`, `docs/refactoring/stage-06-17-sunset-webp-runtime.md`, `docs/refactoring/artifacts/stage-06-17-sunset-webp/`
  - Benefit: package build summary dropped from `331 files, 86.8 MB` to `331 files, 84.5 MB`; screenshot similarity passed on desktop/mobile

- [x] **Performance: scene JPG characterization** - Captured desktop/mobile baseline for the largest runtime scene JPGs
  - Completed: 2026-06-27
  - Files: `playwright.stage-06-18.config.mjs`, `tools/stage-06-18/scene-jpg-characterization.spec.mjs`, `Makefile`, `docs/refactoring/stage-06-18-scene-jpg-characterization.md`, `docs/refactoring/artifacts/stage-06-18-scene-jpg/`
  - Benefit: `tumski_11.jpg`, `dwor_01.jpg` and `tumski_14.jpg` now have desktop/mobile screenshot and measurement baselines before derivative optimization

- [x] **Performance: tumski11 WebP candidate POC** - Tested WebP derivatives without switching runtime assets
  - Completed: 2026-06-27
  - Files: `playwright.stage-06-19.config.mjs`, `tools/stage-06-19/tumski11-webp-candidate.spec.mjs`, `tools/stage-06-19/compare-tumski11-screenshots.mjs`, `Makefile`, `docs/refactoring/stage-06-19-tumski11-webp-poc.md`, `docs/refactoring/artifacts/stage-06-19-tumski11-webp/`
  - Benefit: WebP conversion for `tumski_11.jpg` was rejected by visual gate before any runtime/package change; original JPG remains packaged

- [x] **Performance: panorama video review** - Characterized `Wroclaw_Saver.mp4` route/use and browser video lifecycle
  - Completed: 2026-06-27
  - Files: `playwright.stage-06-20.config.mjs`, `tools/stage-06-20/video-characterization.spec.mjs`, `Makefile`, `docs/refactoring/stage-06-20-video-review.md`, `docs/refactoring/artifacts/stage-06-20-video-review/`
  - Benefit: `katedra_panorama.html` video preload/play behavior and mobile autoplay baseline are documented before any video compression or preload changes

- [x] **Performance: panorama video metadata preload** - Reduced eager video preload while preserving click-to-play behavior
  - Completed: 2026-06-27
  - Files: `katedra_panorama.html`, `tools/stage-06-20/video-characterization.spec.mjs`, `Makefile`, `docs/refactoring/stage-06-21-video-metadata-preload.md`, `docs/refactoring/artifacts/stage-06-21-video-metadata/`
  - Benefit: `Wroclaw_Saver.mp4` now uses `preload="metadata"` with `loadedmetadata` play-button readiness; desktop/mobile after-play behavior remains covered

- [x] **Performance: panorama video lazy source** - Deferred `Wroclaw_Saver.mp4` source assignment until user click
  - Completed: 2026-06-27
  - Files: `katedra_panorama.html`, `tools/stage-06-20/video-characterization.spec.mjs`, `Makefile`, `docs/refactoring/stage-06-22-video-lazy-source.md`, `docs/refactoring/artifacts/stage-06-22-video-lazy-source/`
  - Benefit: `katedra_panorama.html` no longer assigns video `src` before user intent; click-to-play still passes on desktop/mobile

- [x] **Performance: SPA loading state characterization** - Captured slow iframe navigation loading behavior
  - Completed: 2026-06-27
  - Files: `playwright.stage-06-23.config.mjs`, `tools/stage-06-23/loading-state-characterization.spec.mjs`, `Makefile`, `docs/refactoring/stage-06-23-loading-state-characterization.md`, `docs/refactoring/artifacts/stage-06-23-loading-state/`
  - Benefit: planned loading-state UX work now has a desktop/mobile oracle for overlay visibility, non-blank current page behavior and post-load activation

- [x] **Refactor: SPA loading state helper** - Moved loading overlay control behind a small helper
  - Completed: 2026-06-27
  - Files: `spa_loading_state.js`, `index.html`, `tests/smoke.spec.mjs`, `Makefile`, `docs/refactoring/stage-06-24-loading-helper.md`, `docs/refactoring/artifacts/stage-06-24-loading-helper/`
  - Benefit: `SPAManager` keeps the same `showLoading()` / `hideLoading()` surface while timeout/error loading UX can now build on `SpaLoadingState`

- [x] **UX: SPA loading timeout state** - Added a bounded error state for hung iframe navigation
  - Completed: 2026-06-27
  - Files: `spa_config.js`, `spa_loading_state.js`, `index.html`, `tests/smoke.spec.mjs`, `playwright.stage-06-25.config.mjs`, `tools/stage-06-25/loading-timeout.spec.mjs`, `Makefile`, `docs/refactoring/stage-06-25-loading-timeout.md`, `docs/refactoring/artifacts/stage-06-25-loading-timeout/`
  - Benefit: a stuck iframe request no longer leaves an endless loading overlay; the app keeps the previous page active, cleans pending DOM/state and shows a recoverable error message

- [x] **Cleanup: root temporary JS files** - Removed obsolete backup/new/copy JavaScript files from the project root
  - Completed: 2026-06-27
  - Files: `arrow_handlers.js.backup`, `quest_marker_handler.js.new`, `sunset_parallax copy.js`, `docs/refactoring/stage-07-cleanup-docs-and-governance.md`
  - Benefit: Stage 7 cleanup has started with a no-runtime-behavior deletion; temporary JS files no longer remain in the source tree

- [x] **Cleanup: debug/test missing input assets** - Removed stale debug-page references to missing input compatibility files
  - Completed: 2026-06-27
  - Files: `debug_styles.html`, `quick_test.html`, `scripts/static-check-known-issues.json`, `docs/refactoring/stage-07-cleanup-docs-and-governance.md`
  - Benefit: static inventory no longer needs `missingAssets` allowlist entries for `input_compatibility.css` / `input_detection.js`; debug pages remain usable through an inline input-mode detector

- [x] **Cleanup: legacy right arrow handler** - Removed unreferenced handler that pointed at missing `tumski_02.html`
  - Completed: 2026-06-27
  - Files: `right_arrow_handler.js`, `scripts/static-check-known-issues.json`, `docs/refactoring/stage-07-cleanup-docs-and-governance.md`
  - Benefit: static inventory no longer needs `missingRoutes` allowlist entries; the source tree no longer contains a legacy handler for a non-canonical route name, and build output dropped to `331 files, 84.5 MB`

- [x] **Cleanup: legacy locale duplicates** - Removed obsolete `translation.json` files after confirming canonical runtime source
  - Completed: 2026-06-27
  - Files: `locales/*/translation.json`, `ARCHITECTURE.md`, `docs/refactoring/stage-07-cleanup-docs-and-governance.md`
  - Benefit: localization now has one file format in the source tree, `locales/*/translations.json`; translation checks no longer print legacy duplicate warnings, and build output dropped to `324 files, 84.5 MB`

- [x] **Docs: README/AGENTS governance refresh** - Updated agent-facing and developer-facing docs for current commands and project boundaries
  - Completed: 2026-06-27
  - Files: `README.md`, `AGENTS.md`, `docs/refactoring/stage-07-cleanup-docs-and-governance.md`
  - Benefit: docs now point to current refactoring artifacts, canonical localization files, actual Makefile checks and project-specific safety constraints

- [x] **Refactor: arrow diagnostics debug gate** - Moved arrow handler diagnostic logs behind explicit debug flags
  - Completed: 2026-06-27
  - Files: `arrow_handlers.js`, `tests/smoke.spec.mjs`, `docs/refactoring/stage-07-cleanup-docs-and-governance.md`
  - Benefit: route arrow setup/click/touch diagnostics no longer write to production console by default while remaining available through `DEBUG_ARROWS`

- [x] **Refactor: user account diagnostics gate** - Moved verbose auth/rating diagnostics behind explicit account debug flags
  - Completed: 2026-06-27
  - Files: `user_account.js`, `tests/smoke.spec.mjs`, `docs/refactoring/stage-07-cleanup-docs-and-governance.md`
  - Benefit: `user_account.js` no longer writes verbose auth/rating `console.log` / `console.warn` diagnostics by default; diagnostics remain available through `DEBUG_ACCOUNT` and legacy `__account_debug`

- [x] **Refactor: user database diagnostics gate** - Moved verbose Firebase/auth/leaderboard diagnostics behind account debug flags
  - Completed: 2026-06-27
  - Files: `user_database.js`, `tests/smoke.spec.mjs`, `docs/refactoring/stage-07-cleanup-docs-and-governance.md`
  - Benefit: `user_database.js` no longer writes verbose Firebase/auth/leaderboard `console.log` diagnostics by default; diagnostics share `DEBUG_ACCOUNT` and legacy `__account_debug` with `user_account.js`

- [x] **Refactor: gnome diagnostics debug gate** - Moved gnome popup/navigation diagnostics behind `MapDebug`
  - Completed: 2026-06-27
  - Files: `gnome_marker_handler.js`, `tests/smoke.spec.mjs`, `docs/refactoring/stage-07-cleanup-docs-and-governance.md`
  - Benefit: Gnome marker flows stay debuggable through `DEBUG_MAP` without writing to production console by default

- [x] **Refactor: remaining runtime diagnostics inventory** - Classified remaining active runtime `console.log` / `console.warn`
  - Completed: 2026-06-27
  - Files: `docs/refactoring/stage-07-runtime-diagnostics-inventory.md`, `BACKLOG.md`, `docs/refactoring/stage-07-cleanup-docs-and-governance.md`
  - Benefit: CR-11 leftovers are split into small follow-up stages instead of one broad logging cleanup

- [ ] **Refactor: SPA shell diagnostics gate** - Gate remaining active SPA route/hash diagnostics in `index.html`
  - Reason: `index.html` still has active route/hash `console.log` plus audio promise `.catch(console.log)` handlers
  - Benefit: SPA shell stays quiet by default while route debugging remains available
  - Effort: Medium

- [ ] **Refactor: audio promise rejection diagnostics** - Replace remaining audio `.catch(console.log)` handlers with quiet debug-aware handling
  - Reason: `language_menu.js` and `index.html` still route playback rejections to production console
  - Benefit: expected autoplay/playback rejections will not create devtools noise
  - Effort: Medium

- [ ] **Refactor: one-line runtime init diagnostics** - Gate/remove low-value success logs in minimap/Firebase init
  - Reason: `spa_minimap_manager.js` and `firebase_config.js` still write success/disabled diagnostics unconditionally
  - Benefit: routine initialization remains quiet while errors stay visible
  - Effort: Small

- [ ] **Cleanup: legacy audio diagnostics module review** - Confirm and remove or gate `background_music111.js`
  - Reason: repo scan shows many diagnostics in a likely legacy audio module with no runtime script references
  - Benefit: reduces source noise or documents retained legacy behavior explicitly
  - Effort: Medium

- [ ] **Refactor: standalone/debug page diagnostics policy** - Gate or document remaining standalone page logs
  - Reason: `katedra_panorama.html` and `audio_visibility_test.html` still contain active diagnostics
  - Benefit: standalone/debug exceptions become explicit and CR-11 can be closed cleanly
  - Effort: Small

### Planned

- [ ] **[Refactoring Task]** - [Description]
  - Reason: [Why it's needed]
  - Benefit: [What will improve]
  - Effort: [Estimated time]

- [ ] **[Optimization Task]** - [Description]

**Template:**
```markdown
- [ ] **Refactor: Component Name** - Description
  - Reason: Current implementation is X
  - Benefit: Will improve Y
  - Effort: Medium (2-3 hours)
```

---

## 📚 Documentation Tasks

[ЗАПОЛНИТЬ - documentation that needs to be created/updated]

- [ ] **[Doc Task]** - [Description]
  - File: [Which file needs update]
  - Type: [API docs/User guide/Architecture/etc]

---

## 🚀 Future Enhancements (Post-MVP)

[ЗАПОЛНИТЬ - features for future versions]

### v2.0 Ideas
- [ ] **[Feature]** - [Description]
- [ ] **[Feature]** - [Description]

### Nice to Have
- [ ] **[Enhancement]** - [Description]
- [ ] **[Enhancement]** - [Description]

---

## 📋 Sprint Planning

### Current Sprint: [Sprint Name/Number]
**Duration:** [Start Date] - [End Date]
**Goal:** [Sprint goal]

#### Sprint Backlog
- [ ] [Task 1]
- [ ] [Task 2]
- [ ] [Task 3]

#### Sprint Progress
- [X] tasks completed / [Y] total tasks
- On track: ✅ / ⚠️ At risk / 🔴 Behind schedule

---

### Sprint History

#### Sprint [N-1]: [Sprint Name]
**Completed:** [End Date]
**Goal:** [What was accomplished]
**Metrics:**
- ✅ [X] tasks completed
- ⏱️ [X] hours spent
- 🎯 [X]% goal achievement

---

## 🎯 Roadmap

### Q[N] YYYY
- [Major milestone 1]
- [Major milestone 2]

### Q[N+1] YYYY
- [Major milestone 3]

---

## 📊 Metrics & Analytics

[ЗАПОЛНИТЬ - key project metrics]

### Development Velocity
- **Average sprint velocity:** [X] tasks/sprint
- **Code quality:** [metrics if tracked]
- **Bug rate:** [X] bugs per feature

### User Metrics (if applicable)
- **Active users:** [number]
- **User satisfaction:** [score/feedback]

---

## 🔄 Change Log

### [VERSION] - [DATE]
**Added:**
- [New feature 1]
- [New feature 2]

**Changed:**
- [Change 1]

**Fixed:**
- [Bug fix 1]

**Removed:**
- [Deprecated feature]

---

### Template for Change Log Entry:
```markdown
### [VERSION] - YYYY-MM-DD
**Added:**
- Feature description

**Changed:**
- What changed and why

**Fixed:**
- Bug description

**Removed:**
- What was removed (if applicable)
```

---

## 📝 Decision Log

[ЗАПОЛНИТЬ - important decisions made during development]

### [DATE] - [Decision Title]
**Decision:** [What was decided]
**Reason:** [Why this decision was made]
**Impact:** [What this affects]
**Alternatives considered:** [Other options]

---

## 🎯 Priority Matrix

```
High Impact, Quick Win → Do FIRST
│ - [Feature/Task]
│ - [Feature/Task]

High Impact, Long Term → Do SECOND
│ - [Feature/Task]

Low Impact, Quick Win → Do THIRD
│ - [Feature/Task]

Low Impact, Long Term → Do LAST (or never)
│ - [Feature/Task]
```

---

## 📝 Notes & Reminders

[ЗАПОЛНИТЬ - important notes]

- **[Important Note]:** [Description]
- **Remember:** [Reminder]
- **Technical Constraint:** [Constraint description]

---

## 🔍 How to Use This Document

### For Developers
1. **Starting work?** → Check "In Progress" and "Planned" sections
2. **Completed feature?** → Move to "Completed" with date and notes
3. **Found bug?** → Add to "Known Issues" with details
4. **Sprint planning?** → Update "Sprint Planning" section

### For AI Agents
1. **Always read this file FIRST** before starting any work
2. **Check dependencies** before implementing features
3. **Update status** after completing tasks
4. **Add to "Common Issues"** in AGENTS.md if you solve a problem

### For Project Managers
1. **Weekly review** of all sections
2. **Update priorities** based on business needs
3. **Track metrics** in "Metrics & Analytics"
4. **Plan sprints** using "Sprint Planning"

---

## 📝 Maintenance Guidelines

**Update Frequency:**
- ✅ After every sprint completion
- ✅ When starting/completing features
- ✅ When bugs are found/fixed
- ✅ During sprint planning

**What to Update:**
- Move completed items to "Completed" section
- Update progress percentages
- Add new features/bugs as discovered
- Update roadmap quarterly

**Who Can Update:**
- Any team member working on the project
- AI agents after completing tasks
- Project lead during planning

---

*This is the SINGLE SOURCE OF TRUTH for project status*
*When in doubt, check this file first*
*Last updated: [DATE]*
