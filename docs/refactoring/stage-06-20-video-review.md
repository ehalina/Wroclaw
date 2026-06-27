# Stage 6.20 - Panorama video review

Дата: 2026-06-27

## Цель

Зафиксировать route/use и browser behavior для `media/Wroclaw_Saver.mp4` перед любыми video derivative, poster или preload изменениями.
Этот этап не меняет runtime behavior.

## Route/use

- Page: `katedra_panorama.html`.
- Element: `<video class="video-background" preload="auto" loop playsinline muted>`.
- Source: `media/Wroclaw_Saver.mp4`.
- User flow:
  - initial image layer remains visible;
  - `loadeddata` makes `.play-button` visible;
  - clicking `.play-button` hides `.image`, shows `.video-container`, sets `currentTime = 0`, calls `video.play()`, then sets `muted = false`;
  - clicking `.pause-button` pauses video and returns to the image layer.

## Media inventory

`ffprobe` summary:

- container: MP4 / QuickTime;
- duration: `21.153333` seconds;
- file size: `9325968` bytes (`8.9M` source, `9280 KB` in `www`);
- overall bitrate: `3526997` bps;
- video stream:
  - codec: H.264 High;
  - dimensions: `1800x1080`;
  - fps: `30`;
  - bitrate: `3397541` bps;
  - color: BT.709;
- audio stream:
  - codec: AAC LC;
  - sample rate: `44100`;
  - channels: stereo;
  - bitrate: `127999` bps.

## Browser characterization

Added:

- `playwright.stage-06-20.config.mjs`;
- `tools/stage-06-20/video-characterization.spec.mjs`;
- `make stage-06-20-video-review`.

Artifacts:

- `docs/refactoring/artifacts/stage-06-20-video-review/desktop-after-play.png`;
- `docs/refactoring/artifacts/stage-06-20-video-review/desktop-video-state.json`;
- `docs/refactoring/artifacts/stage-06-20-video-review/mobile-pixel5-after-play.png`;
- `docs/refactoring/artifacts/stage-06-20-video-review/mobile-pixel5-video-state.json`.

Measurements:

| Project | readyState | duration | preload | loop | muted loaded | after-play paused | after-play muted | after-play currentTime |
|---|---:|---:|---|---|---|---|---|---:|
| desktop | 4 | 21.153 | auto | true | true | false | false | 0.803 |
| mobile-pixel5 | 4 | 21.153 | auto | true | true | false | false | 0.815 |

Observed baseline:

- Desktop: one console log `Видео загружено`, no page errors.
- Mobile Pixel 5: one console log `Видео загружено`, one existing page error: `play() failed because the user didn't interact with the document first`.

The mobile error is consistent with `backgroundSound.play()` being called during `DOMContentLoaded`, before user gesture. It is not caused by a video optimization change in this stage.

## Decision

Do not transcode or replace `media/Wroclaw_Saver.mp4` yet.

Reasons:

- The video has both visual and audio behavior after the play button.
- It is currently eager-loaded with `preload="auto"`.
- There is an adjacent mobile autoplay issue in the page lifecycle that should be separated from media compression.

## Validation

```bash
ffprobe -hide_banner -v error -show_format -show_streams -of json media/Wroclaw_Saver.mp4
node --check playwright.stage-06-20.config.mjs
node --check tools/stage-06-20/video-characterization.spec.mjs
make stage-06-20-video-review
```

Result:

- 2 Playwright characterization tests passed: desktop and mobile Pixel 5.
- Runtime assets and package baseline did not change.

## Next safe step

Stage 6.21 should address video lifecycle before compression: decide whether `preload="auto"` should become `metadata` or whether a poster/lazy-load flow is needed, with a browser characterization before and after.
