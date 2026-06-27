import { expect, test } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const outputDir = path.join(
  rootDir,
  process.env.STAGE_06_VIDEO_ARTIFACT_DIR || 'docs/refactoring/artifacts/stage-06-20-video-review'
);
const haveMetadataReadyState = 1;
const haveCurrentDataReadyState = 2;
const expectedPreload = process.env.STAGE_06_VIDEO_EXPECTED_PRELOAD || 'auto';
const expectedLoadedReadyState = expectedPreload === 'metadata'
  ? haveMetadataReadyState
  : haveCurrentDataReadyState;

function projectSlug(projectName) {
  return projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

async function installLocalOnlyExternalStubs(page) {
  await page.route('https://fonts.googleapis.com/**', (route) => {
    route.fulfill({
      body: '',
      contentType: 'text/css'
    });
  });

  await page.route('https://fonts.gstatic.com/**', (route) => {
    route.abort();
  });
}

async function collectVideoState(page) {
  return page.evaluate(() => {
    function rectToObject(rect) {
      return {
        height: Math.round(rect.height),
        width: Math.round(rect.width),
        x: Math.round(rect.x),
        y: Math.round(rect.y)
      };
    }

    const video = document.querySelector('.video-background');
    const videoContainer = document.querySelector('.video-container');
    const image = document.querySelector('.image');
    const playButton = document.querySelector('.play-button');
    const pauseButton = document.querySelector('.pause-button');
    const source = video?.querySelector('source');

    return {
      image: image
        ? {
            opacity: window.getComputedStyle(image).opacity,
            rect: rectToObject(image.getBoundingClientRect())
          }
        : null,
      playButton: playButton
        ? {
            className: playButton.className,
            display: window.getComputedStyle(playButton).display,
            opacity: window.getComputedStyle(playButton).opacity,
            visibleClass: playButton.classList.contains('visible')
          }
        : null,
      pauseButton: pauseButton
        ? {
            className: pauseButton.className,
            display: window.getComputedStyle(pauseButton).display,
            opacity: window.getComputedStyle(pauseButton).opacity,
            visibleClass: pauseButton.classList.contains('visible')
          }
        : null,
      video: video
        ? {
            autoplay: video.autoplay,
            bufferedRanges: Array.from({ length: video.buffered.length }, (_, index) => ({
              end: Number(video.buffered.end(index).toFixed(3)),
              start: Number(video.buffered.start(index).toFixed(3))
            })),
            currentSrc: video.currentSrc ? new URL(video.currentSrc).pathname.replace(/^\//, '') : '',
            currentTime: Number(video.currentTime.toFixed(3)),
            duration: Number.isFinite(video.duration) ? Number(video.duration.toFixed(3)) : null,
            ended: video.ended,
            loop: video.loop,
            muted: video.muted,
            networkState: video.networkState,
            paused: video.paused,
            playsInline: video.playsInline,
            preload: video.preload,
            readyState: video.readyState,
            rect: rectToObject(video.getBoundingClientRect()),
            source: source?.getAttribute('src') || '',
            volume: video.volume
          }
        : null,
      videoContainer: videoContainer
        ? {
            opacity: window.getComputedStyle(videoContainer).opacity,
            rect: rectToObject(videoContainer.getBoundingClientRect())
          }
        : null,
      viewport: {
        height: window.innerHeight,
        width: window.innerWidth
      }
    };
  });
}

test('capture katedra panorama video baseline', async ({ page }, testInfo) => {
  await mkdir(outputDir, { recursive: true });
  await installLocalOnlyExternalStubs(page);

  const consoleMessages = [];
  const pageErrors = [];
  const slug = projectSlug(testInfo.project.name);

  page.on('console', (message) => {
    if (['error', 'warning', 'log'].includes(message.type())) {
      consoleMessages.push({
        text: message.text(),
        type: message.type()
      });
    }
  });

  page.on('pageerror', (error) => {
    pageErrors.push(error.message);
  });

  await page.goto('/katedra_panorama.html', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.video-background')).toBeAttached();
  await expect(page.locator('.play-button')).toBeAttached();

  await page.waitForFunction((minimumReadyState) => {
    const video = document.querySelector('.video-background');
    return video && video.readyState >= minimumReadyState;
  }, expectedLoadedReadyState, { timeout: 15_000 });

  const loadedState = await collectVideoState(page);
  expect(loadedState.video.source).toBe('media/Wroclaw_Saver.mp4');
  expect(loadedState.video.preload).toBe(expectedPreload);
  expect(loadedState.video.readyState).toBeGreaterThanOrEqual(expectedLoadedReadyState);

  await page.locator('.play-button').click();
  await page.waitForFunction(() => {
    const video = document.querySelector('.video-background');
    return video && !video.paused && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA;
  }, null, { timeout: 15_000 });
  await page.waitForTimeout(800);
  const afterPlayState = await collectVideoState(page);

  const screenshotName = `${slug}-after-play.png`;
  await page.screenshot({
    fullPage: false,
    path: path.join(outputDir, screenshotName)
  });

  await writeFile(
    path.join(outputDir, `${slug}-video-state.json`),
    `${JSON.stringify({
      consoleMessages,
      expectedPreload,
      measurements: {
        afterPlay: afterPlayState,
        loaded: loadedState
      },
      page: 'katedra_panorama.html',
      pageErrors,
      project: testInfo.project.name,
      screenshot: `${path.relative(rootDir, outputDir).split(path.sep).join('/')}/${screenshotName}`
    }, null, 2)}\n`,
    'utf8'
  );
});
