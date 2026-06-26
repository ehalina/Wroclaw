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
