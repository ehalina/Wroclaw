# Stage 6.15 - Lazy audio preload

Дата: 2026-06-27

## Цель

Убрать eager loading route-specific MP3 из `preloadBackgroundMusic()`, сохранив route switching через `switchTrack()`.

## Change

Before Stage 6.15, `preloadBackgroundMusic()` created `Audio` elements and called `load()` for:

- `media/zwyki/birds.mp3`;
- `media/zwyki/kostel.mp3`;
- `media/zwyki/hang.mp3`;
- `media/zwyki/quest.mp3`.

After Stage 6.15, `preloadBackgroundMusic()` only initializes `trackTimes` bookkeeping for those track names.

Actual MP3 loading remains lazy through `switchTrack(trackName)`.

## Artifacts

Directory: `docs/refactoring/artifacts/stage-06-15-audio/`

Files:

- `desktop-audio-lifecycle.json`;
- `mobile-pixel5-audio-lifecycle.json`.

## Result

Stage 6.15 verification mode: `lazy`.

Both desktop and mobile artifacts show:

- constructed route-specific sources: none;
- `load()` route-specific sources: none.

Observed requested audio set still includes runtime audio used by current page/init flows:

- `media/zwyki/town.mp3`;
- `media/opening-a-book.wav`;
- `media/step.wav`;
- `media/zwyki/bb6f2b8ec908f28.mp3`;
- `media/zwyki/quest.mp3`.

`quest.mp3` is still requested by quest/map initialization paths and remains a separate owner-consolidation task.

## Validation

```bash
node --check tools/stage-06-14/audio-lifecycle-characterization.spec.mjs
make stage-06-15-audio
```

Result: 2 Playwright characterization tests passed.
