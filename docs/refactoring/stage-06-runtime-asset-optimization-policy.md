# Stage 6.7 - Runtime asset optimization policy

Дата: 2026-06-27

## Цель

Зафиксировать правила дальнейшей оптимизации runtime assets после cleanup-only package exclusions.
Этот этап не меняет художественные файлы и не сжимает изображения вслепую.

## Текущий package baseline

После Stage 6.9:

- build summary: `333 files, 87.0 MB -> www/`;
- disk usage: `www` 99M;
- package budget guard: 120 MB.

## Оставшиеся top runtime assets

### Audio/video

| Size KB in `www` | File | Runtime role | Policy |
|---:|---|---|---|
| 9280 | `media/zwyki/maksim-mrvica-croatian-rhapsody.mp3` | SPA route audio for Minsk pages | review by audio lifecycle/route policy before compression |
| 9280 | `media/Wroclaw_Saver.mp4` | `katedra_panorama.html` video | keep until video-specific review |
| 7232 | `media/zwyki/hang.mp3` | `tumski21`/quest route audio | review by audio lifecycle/route policy before compression |
| 5184 | `media/zwyki/quest.mp3` | quest overlay and quest marker audio | review by audio lifecycle/route policy before compression |
| 2112 each | `town.mp3`, `kostel.mp3`, `birds.mp3`, `bb6f2b8ec908f28.mp3` | background/runtime audio | lower priority |

### Images

| Size KB in `www` | File | Runtime role | Policy |
|---:|---|---|---|
| 4160 | `media/tumski/sunset/sunset1.png` | `tumski21` / sunset parallax | visual before/after required |
| 4160 | `media/tumski/sunset/sunset2.png` | `tumski21` / sunset parallax | visual before/after required |
| 2112 | `media/tumski/tumski_14.jpg` | scene image | batch screenshot review required |
| 2112 | `media/tumski/tumski_11.jpg` | scene image | batch screenshot review required |
| 2112 | `media/tumski/dwor_01.jpg` | scene image | batch screenshot review required |

Note after Stage 6.9: `media/tumski/sunset/sunset3.png` remains in source but is no longer packaged; runtime preload/demo references now use the visible `sunset3.jpg`.

## Rules

1. Do not overwrite original source assets during optimization.
2. Create a derivative only when runtime HTML/CSS/JS can be switched deliberately.
3. Every image optimization batch needs desktop and mobile screenshot comparison.
4. Every audio/video optimization batch needs a route/use check and at least one manual listening/playback pass.
5. Do not convert `png` to `jpg` when transparency, layering or parallax composition could matter.
6. Do not introduce a bundler or framework for asset optimization; keep this in scripts or explicit file replacements.
7. Update `docs/refactoring/stage-06-asset-size-report.md` after each batch with before/after size and validation.

## Batch order

1. Runtime PNG review:
   - `media/tumski/sunset/sunset1.png`;
   - `media/tumski/sunset/sunset2.png`.

2. Scene JPG review:
   - start with 2-3 largest scene images only;
   - compare pages that directly display them;
   - keep originals until screenshots are accepted.

3. Audio lifecycle review:
   - map every heavy audio track to route policy and direct uses;
   - check whether duplicate loading/playback exists before compression;
   - only then decide compression bitrate or format.

Stage 6.10 result: heavy MP3 files are confirmed runtime assets. Do not exclude them as unused.

Stage 6.11 result: duplicate effect WAV copies under `media/zwyki/` are excluded from the package. Root runtime effects remain packaged.

Stage 6.12 result: audio lifecycle refactor must start with source policy extraction and network characterization before reducing eager MP3 preload.

Stage 6.17 result: `sunset1.png` and `sunset2.png` were replaced in runtime by lossless WebP derivatives after screenshot similarity passed; PNG originals remain in source and are excluded from the Capacitor package.

Stage 6.18 result: desktop/mobile baselines were captured for the largest remaining runtime scene JPGs (`tumski_11.jpg`, `dwor_01.jpg`, `tumski_14.jpg`) before any derivative optimization.

Stage 6.19 result: WebP candidates for `tumski_11.jpg` failed the visual gate or were larger than the source. Do not switch this scene JPG to WebP.

4. Video review:
   - inspect `katedra_panorama.html` playback;
   - decide whether a smaller derivative video or poster/loading strategy is needed.

## Validation

Minimum after a visual/audio batch:

```bash
make build
make smoke
make audit
```

Additional checks:

- screenshot comparison for changed image routes;
- direct browser playback for changed audio/video routes;
- verify package budget remains below 120 MB.

## Next safe implementation step

Move to video review for `media/Wroclaw_Saver.mp4`, or try a different image-specific strategy only if it uses the same strict visual gate and does not overwrite originals.
