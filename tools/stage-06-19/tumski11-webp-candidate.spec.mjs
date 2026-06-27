import { expect, test } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const outputDir = path.join(
  rootDir,
  process.env.STAGE_06_TUMSKI11_WEBP_ARTIFACT_DIR || 'docs/refactoring/artifacts/stage-06-19-tumski11-webp'
);
const candidateAsset = process.env.STAGE_06_TUMSKI11_WEBP_CANDIDATE ||
  'docs/refactoring/artifacts/stage-06-19-tumski11-webp/tumski_11-q85-icc.webp';

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

async function collectSceneMeasurements(page) {
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

    function normalizeUrl(url) {
      return url ? new URL(url).pathname.replace(/^\//, '') : '';
    }

    function loadImage(url) {
      return new Promise((resolve) => {
        if (!url) {
          resolve({ status: 'missing-url' });
          return;
        }

        const image = new Image();
        const timeout = window.setTimeout(() => {
          resolve({ status: 'timeout', url: normalizeUrl(url) });
        }, 5000);

        image.onload = () => {
          window.clearTimeout(timeout);
          resolve({
            height: image.naturalHeight,
            status: 'loaded',
            url: normalizeUrl(url),
            width: image.naturalWidth
          });
        };

        image.onerror = () => {
          window.clearTimeout(timeout);
          resolve({
            status: 'error',
            url: normalizeUrl(url)
          });
        };

        image.src = url;
      });
    }

    const imageElement = document.querySelector('.image');
    const imageStyle = imageElement ? window.getComputedStyle(imageElement) : null;
    const imageBackgroundUrl = extractBackgroundUrl(imageStyle?.backgroundImage);

    return {
      body: {
        overflowX: window.getComputedStyle(document.body).overflowX,
        overflowY: window.getComputedStyle(document.body).overflowY
      },
      image: imageElement
        ? {
            backgroundImage: imageStyle.backgroundImage.replace(window.location.origin + '/', ''),
            backgroundPosition: imageStyle.backgroundPosition,
            backgroundRepeat: imageStyle.backgroundRepeat,
            backgroundSize: imageStyle.backgroundSize,
            image: await loadImage(imageBackgroundUrl),
            rect: rectToObject(imageElement.getBoundingClientRect()),
            selector: '.image'
          }
        : { selector: '.image', status: 'missing' },
      title: document.title,
      viewport: {
        height: window.innerHeight,
        width: window.innerWidth
      }
    };
  });
}

test('capture tumski11 WebP candidate screenshots', async ({ page }, testInfo) => {
  await mkdir(outputDir, { recursive: true });
  await installLocalOnlyExternalStubs(page);

  const consoleMessages = [];
  const pageErrors = [];
  const slug = projectSlug(testInfo.project.name);

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

  await page.goto('/tumski11.html', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.image')).toBeVisible();
  await page.evaluate((assetPath) => {
    const image = document.querySelector('.image');
    image.style.backgroundImage = `url("${assetPath}")`;
  }, `/${candidateAsset}`);
  await page.waitForTimeout(300);

  const measurements = await collectSceneMeasurements(page);
  expect(measurements.image.image.status).toBe('loaded');
  expect(measurements.image.image.url).toBe(candidateAsset);

  const screenshotName = `${slug}-tumski11.png`;
  await page.screenshot({
    fullPage: false,
    path: path.join(outputDir, screenshotName)
  });

  await writeFile(
    path.join(outputDir, `${slug}-measurements.json`),
    `${JSON.stringify({
      candidateAsset,
      consoleMessages,
      measurements,
      page: 'tumski11.html',
      pageErrors,
      project: testInfo.project.name,
      screenshot: `${path.relative(rootDir, outputDir).split(path.sep).join('/')}/${screenshotName}`
    }, null, 2)}\n`,
    'utf8'
  );
});
