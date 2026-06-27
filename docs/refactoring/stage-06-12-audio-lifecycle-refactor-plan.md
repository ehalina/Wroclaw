# Stage 6.12 - Audio lifecycle refactor plan

Дата: 2026-06-27

## Цель

Подготовить безопасный кодовый рефакторинг audio lifecycle после Stage 6.10/6.11, не меняя playback behavior в этом шаге.

## Current behavior

### Central route policy

`spa_config.js` уже содержит canonical route policy:

- `minsk01.html`, `minsk02.html` -> `minsk`;
- `tumski19.html` -> `kostel`;
- `tumski21.html` -> `hang`;
- garden pages -> `birds`;
- fallback -> `town`.

### Track source policy

`index.html` локально мапит track names to files inside `spaManager.switchTrack()`:

- `town` -> `media/zwyki/town.mp3`;
- `birds` -> `media/zwyki/birds.mp3`;
- `kostel` -> `media/zwyki/kostel.mp3`;
- `hang` -> `media/zwyki/hang.mp3`;
- `quest` -> `media/zwyki/quest.mp3`;
- `minsk` -> `media/zwyki/maksim-mrvica-croatian-rhapsody.mp3`.

This means route policy is centralized, but source URL policy is still local to `index.html`.

### Eager preload behavior

`index.html` calls `preloadBackgroundMusic()` after audio unlock. It creates audio elements and calls `load()` for:

- `birds.mp3`;
- `kostel.mp3`;
- `hang.mp3`;
- `quest.mp3`.

This can load `hang.mp3` and `quest.mp3` before the user reaches those flows.

### Quest audio ownership

`quest.mp3` currently has multiple owners:

- `index.html` eager preload and iframe quest initialization;
- `language_menu.js` global `questMusic` initialization;
- `quest_marker_handler.js` global `questMusic` fallback;
- `quest_overlay.js` local `new Audio('media/zwyki/quest.mp3')`.

Because this spans SPA, menu, marker, and overlay behavior, quest consolidation should be a separate stage.

## Refactor sequence

### Stage 6.13 - Extract audio source policy

Small code move:

- add `AUDIO_SOURCES` to `spa_config.js`;
- expose `getAudioSourceForTrack(trackName)`;
- update `index.html` `switchTrack()` to use `SpaConfig.getAudioSourceForTrack()`;
- keep all current source URLs unchanged.

Why first:

- no lifecycle behavior changes;
- reduces duplicated source policy before preload changes;
- gives future tests a stable API to assert.

Status: completed on 2026-06-27.

### Stage 6.14 - Characterize eager audio loading

Add a Playwright characterization or focused smoke assertion for the first audio unlock flow:

- record network requests for `media/zwyki/*.mp3`;
- verify current eager request set before changing it;
- keep artifacts textual, not screenshots.

Why:

- changing audio preload can be user-visible on slow networks;
- a network-request oracle is more useful than visual screenshots here.

### Stage 6.15 - Reduce eager preload

Only after characterization:

- keep `town.mp3` as initial unlock/default track;
- avoid eager `load()` for route-specific tracks that are not needed yet;
- preserve `trackTimes` behavior;
- verify route switching to `kostel`, `hang`, `birds`, `minsk`, and quest flows.

Potential implementation:

- initialize track time bookkeeping without creating/loading every audio file;
- lazy-load route tracks through `switchTrack(trackName)`;
- leave sound effects preload unchanged because they are small and widely used.

### Stage 6.16 - Quest audio owner consolidation

Separate refactor:

- introduce one helper for finding/creating `questMusic`;
- migrate `language_menu.js`, `quest_marker_handler.js`, and iframe initialization to it;
- decide separately whether `quest_overlay.js` should keep a local short overlay sound or use the shared loop.

Do not mix this with Stage 6.15.

## Stop signals

- Any route-specific music fails to start after user gesture.
- `quest.mp3` no longer pauses/resumes with visibility handling.
- Mobile Safari/iOS audio unlock behavior changes without manual playback check.
- Network characterization is too noisy to compare.

## Validation for the next code step

Minimum:

```bash
make smoke
make audit
```

For lifecycle changes, add a focused browser/network characterization before changing eager preload behavior.
