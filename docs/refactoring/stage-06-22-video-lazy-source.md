# Stage 6.22 - Panorama video lazy source

Дата: 2026-06-27

## Цель

Убрать initial video source load с `katedra_panorama.html`, сохранив пользовательский click-to-play flow.
Этот этап не меняет `media/Wroclaw_Saver.mp4` и не делает transcode.

## Изменения

- `katedra_panorama.html`:
  - video preload изменён с `metadata` на `none`;
  - `<source src="media/Wroclaw_Saver.mp4">` заменён на `<source data-src="media/Wroclaw_Saver.mp4">`;
  - добавлен `ensureVideoSourceLoaded()`;
  - play button показывается сразу после DOM setup;
  - video source назначается только внутри click handler перед `video.play()`.
- `tools/stage-06-20/video-characterization.spec.mjs` расширен для `preload=none` / lazy-source режима.
- Добавлен Makefile target `make stage-06-22-video-lazy-source`.

## Artifacts

- `docs/refactoring/artifacts/stage-06-22-video-lazy-source/desktop-after-play.png`;
- `docs/refactoring/artifacts/stage-06-22-video-lazy-source/desktop-video-state.json`;
- `docs/refactoring/artifacts/stage-06-22-video-lazy-source/mobile-pixel5-after-play.png`;
- `docs/refactoring/artifacts/stage-06-22-video-lazy-source/mobile-pixel5-video-state.json`.

## Before / after

| Metric | Stage 6.21 metadata | Stage 6.22 lazy source |
|---|---|---|
| Video preload attr | `metadata` | `none` |
| Source before user click | `src=media/Wroclaw_Saver.mp4` | `src=""`, `data-src=media/Wroclaw_Saver.mp4` |
| Loaded readyState desktop | 1 | 0 |
| Loaded readyState mobile | 1 | 0 |
| Play button visible before click | yes | yes |
| After click currentSrc | `media/Wroclaw_Saver.mp4` | `media/Wroclaw_Saver.mp4` |
| After click paused | false | false |
| After click muted | false | false |
| Page errors | none | none |

Observed Stage 6.22 state:

- Desktop: loaded `source=""`, `dataSrc=media/Wroclaw_Saver.mp4`, after-play `currentTime=0.831`.
- Mobile Pixel 5: loaded `source=""`, `dataSrc=media/Wroclaw_Saver.mp4`, after-play `currentTime=0.874`.

## Decision

Keep lazy source loading for `Wroclaw_Saver.mp4`.

Rationale:

- The browser no longer receives a video `src` before user intent.
- Click-to-play still works on desktop/mobile.
- The video remains packaged because `data-src` preserves the runtime reference for the build/static inventory.
- This is lower risk than transcode/compression and directly reduces initial page media pressure.

## Validation

```bash
node --check tools/stage-06-20/video-characterization.spec.mjs
make stage-06-22-video-lazy-source
```

Result:

- 2 Playwright characterization tests passed: desktop and mobile Pixel 5.
- No media files changed.
- Runtime package size is unchanged.

## Next safe step

Stage 6 can stop video work here unless manual product review asks for a poster or transcode.
Next useful optimization work should focus on a different runtime-heavy group or UX issue with a clear oracle.
