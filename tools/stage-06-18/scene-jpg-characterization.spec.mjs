import { expect, test } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const outputDir = path.join(
  rootDir,
  process.env.STAGE_06_SCENE_JPG_ARTIFACT_DIR || 'docs/refactoring/artifacts/stage-06-18-scene-jpg'
);

const scenePages = [
  {
    asset: 'media/tumski/tumski_11.jpg',
    page: 'tumski11.html',
    slug: 'tumski11',
    title: 'Tumski 11'
  },
  {
    asset: 'media/tumski/dwor_01.jpg',
    page: 'dwor01.html',
    slug: 'dwor01',
    title: 'Dwor 01'
  },
  {
    asset: 'media/tumski/tumski_14.jpg',
    page: 'tumski14.html',
    slug: 'tumski14',
    title: 'Tumski 14'
  }
];

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

async function collectSceneMeasurements(page, expectedAsset) {
  return page.evaluate(async (assetPath) => {
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
    const nextImageElement = document.querySelector('.next-image-container');
    const imageContainer = document.querySelector('.image-container');
    const imageScrollWrapper = document.querySelector('.image-scroll-wrapper');

    const imageStyle = imageElement ? window.getComputedStyle(imageElement) : null;
    const nextImageStyle = nextImageElement ? window.getComputedStyle(nextImageElement) : null;
    const imageBackgroundUrl = extractBackgroundUrl(imageStyle?.backgroundImage);
    const nextImageBackgroundUrl = extractBackgroundUrl(nextImageStyle?.backgroundImage);

    return {
      body: {
        overflowX: window.getComputedStyle(document.body).overflowX,
        overflowY: window.getComputedStyle(document.body).overflowY
      },
      expectedAsset: assetPath,
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
      imageContainer: imageContainer ? rectToObject(imageContainer.getBoundingClientRect()) : null,
      imageScrollWrapper: imageScrollWrapper ? rectToObject(imageScrollWrapper.getBoundingClientRect()) : null,
      nextImage: nextImageElement
        ? {
            backgroundImage: nextImageStyle.backgroundImage.replace(window.location.origin + '/', ''),
            backgroundPosition: nextImageStyle.backgroundPosition,
            backgroundRepeat: nextImageStyle.backgroundRepeat,
            backgroundSize: nextImageStyle.backgroundSize,
            image: await loadImage(nextImageBackgroundUrl),
            rect: rectToObject(nextImageElement.getBoundingClientRect()),
            selector: '.next-image-container'
          }
        : { selector: '.next-image-container', status: 'missing' },
      title: document.title,
      viewport: {
        height: window.innerHeight,
        width: window.innerWidth
      }
    };
  }, expectedAsset);
}

test('capture largest scene JPG baseline screenshots', async ({ page }, testInfo) => {
  await mkdir(outputDir, { recursive: true });
  await installLocalOnlyExternalStubs(page);

  const consoleMessages = [];
  const pageErrors = [];
  const pages = [];
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

  for (const scenePage of scenePages) {
    await page.goto(`/${scenePage.page}`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.image')).toBeVisible();
    await page.waitForTimeout(300);

    const measurements = await collectSceneMeasurements(page, scenePage.asset);
    expect(measurements.image.image.status).toBe('loaded');
    expect(measurements.image.image.url).toBe(scenePage.asset);

    const screenshotName = `${slug}-${scenePage.slug}.png`;
    await page.screenshot({
      fullPage: false,
      path: path.join(outputDir, screenshotName)
    });

    pages.push({
      ...scenePage,
      measurements,
      screenshot: `${path.relative(rootDir, outputDir).split(path.sep).join('/')}/${screenshotName}`
    });
  }

  await writeFile(
    path.join(outputDir, `${slug}-measurements.json`),
    `${JSON.stringify({
      consoleMessages,
      pageErrors,
      pages,
      project: testInfo.project.name
    }, null, 2)}\n`,
    'utf8'
  );
});
