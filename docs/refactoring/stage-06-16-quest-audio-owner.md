# Stage 6.16 - Quest Audio Owner Consolidation

Date: 2026-06-27

## Goal

Consolidate shared `questMusic` ownership without changing quest UI behavior.

## Changes

- Added `window.QuestAudio` helper in `language_menu.js`.
- Moved shared quest-loop creation/lookup into:
  - `QuestAudio.getOrCreateSharedQuestMusic()`;
  - `QuestAudio.primeSharedQuestMusic()`;
  - `QuestAudio.attachSharedQuestMusicToFrame()`;
  - `QuestAudio.pauseSharedQuestMusic()`.
- Migrated `LanguageMenu.initializeQuestMusic()` and `LanguageMenu.initializeQuestMusicInIframe()` to the helper.
- Migrated SPA `initializeIframeQuestMusic()` in `index.html` to attach the shared owner audio to iframes instead of creating iframe-local `audio#questMusic`.
- Migrated `quest_marker_handler.js` to find shared quest audio through `window.QuestAudio` or `window.parent.QuestAudio`.
- Added a smoke assertion that the SPA shell has one parent `audio#questMusic` and the active iframe references the same shared audio object.

## Deferred Decision

`quest_overlay.js` still creates a local short overlay sound with `new Audio('media/zwyki/quest.mp3')`.

This is intentionally deferred because it behaves like an overlay-local control, while this stage only consolidates the shared quest loop owner used by `language_menu.js`, iframe initialization, and `quest_marker_handler.js`.

## Package Impact

No package-size change is expected.

Current package baseline remains:

```text
331 files, 86.8 MB -> www/
```

## Validation

```bash
node --check language_menu.js
node --check quest_marker_handler.js
node --check tests/smoke.spec.mjs
make smoke
make audit
```
