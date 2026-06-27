# Stage 6.10 - Audio route/use review

Дата: 2026-06-27

## Цель

Зафиксировать фактическое использование heavy audio перед любым сжатием, lazy-loading изменением или исключением файлов из Capacitor package.

Этот этап не меняет playback behavior и не сжимает аудио.

## Commands

```bash
find media -type f \( -iname '*.mp3' -o -iname '*.wav' -o -iname '*.m4a' -o -iname '*.ogg' \) -print0 | xargs -0 du -k | sort -nr
find www/media -type f \( -iname '*.mp3' -o -iname '*.wav' -o -iname '*.m4a' -o -iname '*.ogg' \) -print0 | xargs -0 du -k | sort -nr
rg -n "\.mp3|\.wav|\.m4a|\.ogg|zwyki/|opening-a-book|step\.wav" --glob '!www/**' --glob '!node_modules/**' --glob '!docs/refactoring/artifacts/**'
rg -n "switchTrack\(|switchMusicSource\(|new Audio\(|src = 'media/zwyki|src=\"media/zwyki|source src=\"media/zwyki" --glob '!www/**' --glob '!node_modules/**' --glob '!project-context.md' --glob '!docs/refactoring/artifacts/**'
```

## Package audio inventory

| Package KB | Source KB | File | Current role |
|---:|---:|---|---|
| 9280 | 8328 | `media/zwyki/maksim-mrvica-croatian-rhapsody.mp3` | Minsk route music |
| 7232 | 6380 | `media/zwyki/hang.mp3` | `tumski21.html` / sunset route music |
| 5184 | 5088 | `media/zwyki/quest.mp3` | quest overlay / quest marker music |
| 2112 | 1856 | `media/zwyki/town.mp3` | default SPA background music |
| 2112 | 1768 | `media/zwyki/kostel.mp3` | `tumski19.html` music |
| 2112 | 1352 | `media/zwyki/birds.mp3` | garden route music |
| 2112 | 1408 | `media/zwyki/bb6f2b8ec908f28.mp3` | map modal sound |
| 768 | 760 | `media/na-gorodskoy-allee-utro-rassvet-34067.mp3` | `katedra_panorama.html` background sound |
| 128 | 124 | `media/opening-a-book.wav` | page marker/book effect |
| 128 | 124 | `media/zwyki/opening-a-book.wav` | duplicate effect copy in `zwyki` |
| 128 | 84 | `media/step.wav` | navigation step effect |
| 128 | 84 | `media/zwyki/step.wav` | duplicate effect copy in `zwyki` |

## Route policy

Canonical route policy is in `spa_config.js`:

| Track | Pages |
|---|---|
| `minsk` | `minsk01.html`, `minsk02.html` |
| `kostel` | `tumski19.html` |
| `hang` | `tumski21.html` |
| `birds` | `ogrod02.html` through `ogrod09.html`, plus `ogrod12.html`, `ogrod13.html` |
| `town` | default fallback |

`index.html` maps these track names to files in `spaManager.switchTrack()`:

- `town` -> `media/zwyki/town.mp3`;
- `birds` -> `media/zwyki/birds.mp3`;
- `kostel` -> `media/zwyki/kostel.mp3`;
- `hang` -> `media/zwyki/hang.mp3`;
- `quest` -> `media/zwyki/quest.mp3`;
- `minsk` -> `media/zwyki/maksim-mrvica-croatian-rhapsody.mp3`.

## Additional direct uses

- `index.html` has a persistent initial `<audio>` source for `media/zwyki/town.mp3`.
- `index.html` preloads `birds`, `kostel`, `hang`, and `quest` inside `preloadBackgroundMusic()` after audio unlock.
- `quest_overlay.js` creates local `new Audio('media/zwyki/quest.mp3')`.
- `quest_marker_handler.js` creates or reuses `questMusic`, falling back to `new Audio('media/zwyki/quest.mp3')`.
- `language_menu.js` can create `questMusic` and also contains older direct management for `kostel`, `birds`, `hang`, and `quest`.
- `tumski_page_common.js` has explicit transition handlers:
  - `tumski18.html` -> `tumski19.html`: switch to `kostel`;
  - `tumski20.html` -> `tumski21.html`: switch to `hang`;
  - `tumski15.html` -> `ogrod13.html`: switch to `birds`.
- `tumski21.html` switches back to `town` before showing quest content from the back arrow flow.
- `map_modal.js` embeds `media/zwyki/bb6f2b8ec908f28.mp3` as `mapSound`.
- `katedra_panorama.html` embeds `media/na-gorodskoy-allee-utro-rassvet-34067.mp3`.
- Many content pages embed `media/opening-a-book.wav`.

## Findings

1. No heavy MP3 is currently safe to exclude from `www` as unused.
2. `quest.mp3` has the highest lifecycle complexity: it is referenced by SPA preload, language menu helpers, quest overlay, and quest marker handler.
3. `preloadBackgroundMusic()` eagerly creates and loads several non-default tracks after unlock. That can load `hang.mp3` and `quest.mp3` even before the user reaches those flows.
4. The route policy has already been centralized in `spa_config.js`, but some transition-specific audio behavior still lives in page/common handlers.
5. `media/zwyki/opening-a-book.wav` and `media/zwyki/step.wav` are packaged duplicate effect copies. Runtime references found in active pages/scripts use the root `media/opening-a-book.wav` and `media/step.wav`.

## Decision

Do not compress or exclude heavy MP3 files in Stage 6.10.

The next safe code step is lifecycle-only:

1. Reduce eager audio loading risk before bitrate/format changes.
2. Start with duplicate small WAV package cleanup only if build reference guard proves `media/zwyki/opening-a-book.wav` and `media/zwyki/step.wav` are unreferenced in runtime package files.
3. Treat `quest.mp3` consolidation as a separate refactor because it spans SPA, language menu, overlay, and marker handler behavior.

## Validation

Stage 6.10 is documentation/audit-only. Minimum validation:

```bash
make build
make audit
```

Expected current package baseline remains `333 files, 87.0 MB -> www/`.
