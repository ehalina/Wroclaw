# Stage 6.21 - Panorama video metadata preload

Дата: 2026-06-27

## Цель

Уменьшить eager video lifecycle на `katedra_panorama.html` без transcode/compression:

- не менять `media/Wroclaw_Saver.mp4`;
- не менять visual flow после play click;
- показать play button после metadata load, а не после current frame data load.

## Изменения

- `katedra_panorama.html`:
  - `<video preload="auto">` заменён на `preload="metadata"`;
  - handler `loadeddata` заменён на `loadedmetadata`;
  - текст console log оставлен прежним: `Видео загружено`.
- `tools/stage-06-20/video-characterization.spec.mjs` параметризован:
  - `STAGE_06_VIDEO_EXPECTED_PRELOAD`;
  - `STAGE_06_VIDEO_ARTIFACT_DIR`.
- Добавлен Makefile target `make stage-06-21-video-metadata`.

## Artifacts

- `docs/refactoring/artifacts/stage-06-21-video-metadata/desktop-after-play.png`;
- `docs/refactoring/artifacts/stage-06-21-video-metadata/desktop-video-state.json`;
- `docs/refactoring/artifacts/stage-06-21-video-metadata/mobile-pixel5-after-play.png`;
- `docs/refactoring/artifacts/stage-06-21-video-metadata/mobile-pixel5-video-state.json`.

## Before / after

| Metric | Stage 6.20 baseline | Stage 6.21 result |
|---|---|---|
| Video preload attr | `auto` | `metadata` |
| Loaded readyState, desktop | 4 | 1 |
| Loaded readyState, mobile | 4 | 1 |
| Play button visible after load event | yes | yes |
| After click paused | false | false |
| After click muted | false | false |
| After click currentTime desktop | ~0.803s | ~0.865s |
| After click currentTime mobile | ~0.815s | ~0.859s |

Observed Stage 6.21 baseline:

- Desktop: one console log `Видео загружено`, no page errors.
- Mobile Pixel 5: one console log `Видео загружено`, no page errors.

## Decision

Keep `preload="metadata"` for `katedra_panorama.html`.

Rationale:

- The play button still appears before user interaction.
- User-click playback still works on desktop/mobile.
- Initial loaded state no longer requires current video frame data.
- This reduces video lifecycle pressure before any risky compression/transcode work.

## Validation

```bash
node --check tools/stage-06-20/video-characterization.spec.mjs
make stage-06-21-video-metadata
```

Result:

- 2 Playwright characterization tests passed: desktop and mobile Pixel 5.
- Runtime package size is unchanged because media files were not changed.

## Next safe step

Do not transcode `Wroclaw_Saver.mp4` yet.
If Stage 6 continues, the next useful step is either:

- add a poster/lazy video source decision gate; or
- move to another runtime-heavy group with a measurable before/after oracle.
