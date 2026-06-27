import { test, expect } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const artifactDir = path.join(
  rootDir,
  process.env.STAGE_06_AUDIO_ARTIFACT_DIR || 'docs/refactoring/artifacts/stage-06-14-audio'
);
const expectedMode = process.env.STAGE_06_AUDIO_EXPECTED || 'record';

const expectedEagerPreloadSources = [
  'media/zwyki/birds.mp3',
  'media/zwyki/kostel.mp3',
  'media/zwyki/hang.mp3',
  'media/zwyki/quest.mp3'
];

function normalizeAssetPath(url) {
  try {
    return new URL(url).pathname.replace(/^\/+/, '');
  } catch {
    return url;
  }
}

function unique(values) {
  return [...new Set(values)].sort();
}

async function installAudioLifecycleRecorder(page) {
  await page.evaluate(() => {
    window.__audioLifecycleEvents = [];

    const record = (kind, element) => {
      window.__audioLifecycleEvents.push({
        currentSrc: element.currentSrc || '',
        id: element.id || '',
        kind,
        preload: element.preload || '',
        src: element.src || '',
        time: performance.now()
      });
    };

    const patchElement = (element) => {
      if (!element || element.__stage0614Patched) {
        return element;
      }

      const originalLoad = element.load.bind(element);
      const originalPlay = element.play.bind(element);

      element.load = (...args) => {
        record('load', element);
        return originalLoad(...args);
      };
      element.play = (...args) => {
        record('play', element);
        return originalPlay(...args);
      };
      element.__stage0614Patched = true;

      return element;
    };

    document.querySelectorAll('audio').forEach((element) => {
      patchElement(element);
    });

    const NativeAudio = window.Audio;
    window.Audio = function Stage0614Audio(...args) {
      const element = patchElement(new NativeAudio(...args));
      record('construct', element);
      return element;
    };
    window.Audio.prototype = NativeAudio.prototype;
  });
}

test.describe('Stage 6.14 audio lifecycle characterization', () => {
  test('records current preloadBackgroundMusic audio behavior', async ({ page }, testInfo) => {
    const audioRequests = [];
    let phase = 'initial-load';

    page.on('request', (request) => {
      const assetPath = normalizeAssetPath(request.url());

      if (!/\.(?:mp3|wav)$/i.test(assetPath)) {
        return;
      }

      audioRequests.push({
        assetPath,
        method: request.method(),
        phase,
        resourceType: request.resourceType(),
        time: Date.now()
      });
    });

    await page.goto('/');
    await expect(page.locator('#spa-container')).toBeVisible();
    await page.waitForTimeout(1_000);
    const autoStartState = await page.evaluate(() => ({
      audioUnlocked: Boolean(window.spaManager?.audioUnlocked),
      currentTrack: window.spaManager?.currentTrack || null
    }));
    await installAudioLifecycleRecorder(page);

    phase = 'direct-preload-method';
    await page.evaluate(async () => {
      await window.spaManager.preloadBackgroundMusic();
    });
    await page.waitForTimeout(2_000);

    const lifecycleEvents = await page.evaluate(() => window.__audioLifecycleEvents || []);
    const loadSources = unique(
      lifecycleEvents
        .filter((event) => event.kind === 'load')
        .map((event) => normalizeAssetPath(event.currentSrc || event.src))
        .filter(Boolean)
    );
    const playSources = unique(
      lifecycleEvents
        .filter((event) => event.kind === 'play')
        .map((event) => normalizeAssetPath(event.currentSrc || event.src))
        .filter(Boolean)
    );
    const constructSources = unique(
      lifecycleEvents
        .filter((event) => event.kind === 'construct')
        .map((event) => normalizeAssetPath(event.currentSrc || event.src))
        .filter(Boolean)
    );
    const eagerSources = unique([...constructSources, ...loadSources]);
    const requestedSources = unique(audioRequests.map((request) => request.assetPath));

    const artifact = {
      autoStartState,
      constructSources,
      eagerSources,
      expectedEagerPreloadSources,
      expectedMode,
      lifecycleEvents,
      loadSources,
      playSources,
      requestedSources,
      requests: audioRequests,
      url: page.url(),
      viewport: testInfo.project.use.viewport || null
    };

    await mkdir(artifactDir, { recursive: true });
    await writeFile(
      path.join(artifactDir, `${testInfo.project.name}-audio-lifecycle.json`),
      `${JSON.stringify(artifact, null, 2)}\n`,
      'utf8'
    );

    if (expectedMode === 'eager') {
      expectedEagerPreloadSources.forEach((source) => {
        expect(eagerSources).toContain(source);
      });
    }

    if (expectedMode === 'lazy') {
      expectedEagerPreloadSources.forEach((source) => {
        expect(eagerSources).not.toContain(source);
      });
    }
  });
});
