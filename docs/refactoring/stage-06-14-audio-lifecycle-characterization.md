# Stage 6.14 - Audio lifecycle characterization

Дата: 2026-06-27

## Цель

Зафиксировать текущий baseline для `preloadBackgroundMusic()` перед Stage 6.15 lazy-preload refactor.

Этот этап не меняет runtime behavior.

## Command

```bash
make stage-06-14-audio
```

## Artifacts

Directory: `docs/refactoring/artifacts/stage-06-14-audio/`

Files:

- `desktop-audio-lifecycle.json`;
- `mobile-pixel5-audio-lifecycle.json`.

## Method

The Playwright characterization:

- opens `/`;
- records audio network requests for `.mp3` and `.wav`;
- installs a recorder for `window.Audio` construction plus `load()` / `play()` calls;
- calls `window.spaManager.preloadBackgroundMusic()` directly;
- asserts that current eager preload behavior constructs/loads:
  - `media/zwyki/birds.mp3`;
  - `media/zwyki/kostel.mp3`;
  - `media/zwyki/hang.mp3`;
  - `media/zwyki/quest.mp3`.

Direct method characterization is used because browser autoplay behavior can vary. In Playwright, `tryAutoStartMusic()` may or may not set `audioUnlocked` before a synthetic click, so the stable refactor oracle is the lifecycle method itself.

## Findings

Both desktop and mobile baselines showed the same method behavior:

| Source | Constructed | `load()` called |
|---|---:|---:|
| `media/zwyki/birds.mp3` | yes | yes |
| `media/zwyki/kostel.mp3` | yes | yes |
| `media/zwyki/hang.mp3` | yes | yes |
| `media/zwyki/quest.mp3` | yes | yes |

Observed requested audio set also included:

- `media/zwyki/town.mp3`;
- `media/opening-a-book.wav`;
- `media/step.wav`;
- `media/zwyki/bb6f2b8ec908f28.mp3`;
- `media/zwyki/quest.mp3`.

## Decision

Stage 6.15 can safely target `preloadBackgroundMusic()` lazy behavior with a clear oracle:

- before Stage 6.15: `birds`, `kostel`, `hang`, `quest` are constructed and loaded by `preloadBackgroundMusic()`;
- after Stage 6.15: route-specific tracks should not be loaded by default unless explicitly needed.

Do not combine Stage 6.15 with `quest.mp3` owner consolidation.

## Validation

```bash
node --check playwright.stage-06-14.config.mjs
node --check tools/stage-06-14/audio-lifecycle-characterization.spec.mjs
make stage-06-14-audio
```

Result: 2 Playwright characterization tests passed.
