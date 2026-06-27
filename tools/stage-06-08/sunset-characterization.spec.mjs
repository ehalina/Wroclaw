import { expect, test } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const outputDir = path.join(
  rootDir,
  process.env.STAGE_06_SUNSET_ARTIFACT_DIR || 'docs/refactoring/artifacts/stage-06-08-sunset'
);

function projectSlug(projectName) {
  return projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

async function installLocalOnlyExternalStubs(page) {
  await page.addInitScript(() => {
    window.__stage608GaspStub = true;
    window.gsap = {
      set(element, props = {}) {
        if (element && props.scale) {
          element.style.transform = `scale(${props.scale})`;
        }
      },
      timeline() {
        return {
          kill() {},
          pause() {},
          play() {},
          to() {
            return this;
          }
        };
      }
    };
  });

  await page.route('https://cdnjs.cloudflare.com/ajax/libs/gsap/**', (route) => {
    route.fulfill({
      body: 'window.__stage608GaspStub = true;',
      contentType: 'text/javascript'
    });
  });

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

async function collectLayerMeasurements(page) {
  return page.evaluate(async () => {
    function extractBackgroundUrl(value) {
      const match = /url\(["']?(.*?)["']?\)/.exec(value || '');
      return match ? new URL(match[1], window.location.href).href : '';
    }

    function rectToObject(rect) {
      return {
        height: Math.round(rect.height),
        width: Math.round(rect.width),
        x: Math.round(rect.x),
        y: Math.round(rect.y)
      };
    }

    function loadImage(url) {
      return new Promise((resolve) => {
        if (!url) {
          resolve({ status: 'missing-url' });
          return;
        }

        const image = new Image();
        const timeout = window.setTimeout(() => {
          resolve({ status: 'timeout', url });
        }, 5000);

        image.onload = () => {
          window.clearTimeout(timeout);
          resolve({
            height: image.naturalHeight,
            status: 'loaded',
            url: new URL(url).pathname.replace(/^\//, ''),
            width: image.naturalWidth
          });
        };

        image.onerror = () => {
          window.clearTimeout(timeout);
          resolve({
            status: 'error',
            url: new URL(url).pathname.replace(/^\//, '')
          });
        };

        image.src = url;
      });
    }

    const layerSelectors = [
      ['sky', '.layer-sky'],
      ['horizon', '.layer-horizon'],
      ['buildings', '.layer-buildings']
    ];

    const layers = [];
    for (const [name, selector] of layerSelectors) {
      const element = document.querySelector(selector);
      if (!element) {
        layers.push({ name, selector, status: 'missing' });
        continue;
      }

      const style = window.getComputedStyle(element);
      const backgroundUrl = extractBackgroundUrl(style.backgroundImage);
      const image = await loadImage(backgroundUrl);

      layers.push({
        backgroundImage: style.backgroundImage.replace(window.location.origin + '/', ''),
        backgroundPosition: style.backgroundPosition,
        backgroundSize: style.backgroundSize,
        image,
        name,
        rect: rectToObject(element.getBoundingClientRect()),
        selector,
        transform: style.transform,
        zIndex: style.zIndex
      });
    }

    const parallaxContainer = document.querySelector('.parallax-container');
    const pageContainer = document.querySelector('.page-container');

    return {
      body: {
        overflowX: window.getComputedStyle(document.body).overflowX,
        overflowY: window.getComputedStyle(document.body).overflowY
      },
      devicePixelRatio: window.devicePixelRatio,
      gsapAvailable: Boolean(window.gsap),
      gsapStubbed: Boolean(window.__stage608GaspStub),
      layers,
      pageContainer: pageContainer ? rectToObject(pageContainer.getBoundingClientRect()) : null,
      parallaxContainer: parallaxContainer
        ? {
            rect: rectToObject(parallaxContainer.getBoundingClientRect()),
            scrollHeight: parallaxContainer.scrollHeight,
            scrollLeft: parallaxContainer.scrollLeft,
            scrollWidth: parallaxContainer.scrollWidth
          }
        : null,
      sunsetParallax: window.sunsetParallax
        ? {
            animationStarted: Boolean(window.sunsetParallax.animationStarted),
            direction: window.sunsetParallax.direction,
            hasTimeline: Boolean(window.sunsetParallax.timeline),
            isPaused: Boolean(window.sunsetParallax.isPaused),
            maxScale: window.sunsetParallax.maxScale
          }
        : null,
      title: document.title,
      viewport: {
        height: window.innerHeight,
        width: window.innerWidth
      }
    };
  });
}

test('capture tumski21 sunset baseline screenshots', async ({ page }, testInfo) => {
  await mkdir(outputDir, { recursive: true });
  await installLocalOnlyExternalStubs(page);

  const consoleMessages = [];
  const pageErrors = [];

  page.on('console', (message) => {
    if (['error', 'warning'].includes(message.type())) {
      consoleMessages.push({
        text: message.text(),
        type: message.type()
      });
    }
  });

  page.on('pageerror', (error) => {
    pageErrors.push(error.message);
  });

  await page.goto('/tumski21.html', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.parallax-layer.layer-buildings')).toBeVisible();

  const slug = projectSlug(testInfo.project.name);
  const initialScreenshot = `${slug}-initial.png`;
  const afterDelayScreenshot = `${slug}-after-1500ms.png`;

  const initialMeasurements = await collectLayerMeasurements(page);
  await page.screenshot({
    fullPage: false,
    path: path.join(outputDir, initialScreenshot)
  });

  await page.waitForTimeout(1500);
  const afterDelayMeasurements = await collectLayerMeasurements(page);
  await page.screenshot({
    fullPage: false,
    path: path.join(outputDir, afterDelayScreenshot)
  });

  await writeFile(
    path.join(outputDir, `${slug}-measurements.json`),
    `${JSON.stringify({
      consoleMessages,
      measurements: {
        afterDelay: afterDelayMeasurements,
        initial: initialMeasurements
      },
      page: 'tumski21.html',
      pageErrors,
      project: testInfo.project.name,
      screenshots: {
        afterDelay: `${path.relative(rootDir, outputDir).split(path.sep).join('/')}/${afterDelayScreenshot}`,
        initial: `${path.relative(rootDir, outputDir).split(path.sep).join('/')}/${initialScreenshot}`
      }
    }, null, 2)}\n`,
    'utf8'
  );
});
