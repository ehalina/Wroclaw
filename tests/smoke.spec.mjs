import { expect, test } from '@playwright/test';

async function getActiveFrame(page) {
  const iframeHandle = await page.locator('.page-content.active iframe').first().elementHandle();
  if (!iframeHandle) {
    throw new Error('Active iframe was not found');
  }

  const frame = await iframeHandle.contentFrame();
  if (!frame) {
    throw new Error('Active iframe content frame was not available');
  }

  return frame;
}

test.describe('Wroclaw static app smoke', () => {
  test('SPA shell loads an iframe page and global controls', async ({ page }) => {
    await page.goto('/');

    const activeIframe = page.locator('.page-content.active iframe').first();
    await expect(activeIframe).toBeAttached();

    const frame = page.frameLocator('.page-content.active iframe').first();
    await expect(frame.locator('body')).toBeVisible();

    await expect(page.locator('#audioUnlockButton')).toHaveCount(1);
  });

  test('direct Tumski page exposes map and quest controls after init', async ({ page }) => {
    await page.goto('/tumski.html');

    await expect(page.locator('#open-map-modal')).toBeVisible();
    await expect(page.locator('#open-quest')).toBeVisible();
  });

  test('SPA config exposes page registry, selectors and audio policy', async ({ page }) => {
    await page.goto('/');

    const config = await page.evaluate(() => ({
      activeIframeSelector: window.SpaConfig.SELECTORS.activeIframe,
      defaultTrack: window.SpaConfig.getAudioTrackForPage('tumski02.html'),
      firstPage: window.SpaConfig.PAGE_ORDER[0],
      minskTrack: window.SpaConfig.getAudioTrackForPage('minsk01.html#patsa_vatsa'),
      nextFromStart: window.SpaConfig.getNextPage('tumski.html'),
      ogrodTrack: window.SpaConfig.getAudioTrackForPage('ogrod13.html'),
      previousFromSecond: window.SpaConfig.getPreviousPage('tumski02.html'),
      startPage: window.SpaConfig.START_PAGE,
      tumski19Track: window.SpaConfig.getAudioTrackForPage('tumski19.html')
    }));

    expect(config).toEqual({
      activeIframeSelector: '.page-content.active iframe',
      defaultTrack: 'town',
      firstPage: 'tumski.html',
      minskTrack: 'minsk',
      nextFromStart: 'tumski02.html',
      ogrodTrack: 'birds',
      previousFromSecond: 'tumski.html',
      startPage: 'tumski.html',
      tumski19Track: 'kostel'
    });
  });

  test('SPA navigation message is accepted only from the active iframe', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => window.spaManager?.currentPage === 'tumski.html');

    await page.evaluate(() => {
      window.postMessage(
        { type: 'SPA_NAVIGATE', page: 'tumski05.html', action: 'navigate' },
        window.location.origin
      );
    });

    await page.waitForTimeout(250);
    expect(await page.evaluate(() => window.spaManager?.currentPage)).toBe('tumski.html');

    const frame = await getActiveFrame(page);
    await frame.evaluate(() => {
      window.parent.postMessage(
        { type: 'SPA_NAVIGATE', page: 'tumski05.html', action: 'navigate' },
        window.location.origin
      );
    });

    await expect.poll(() => page.evaluate(() => window.spaManager?.currentPage)).toBe('tumski05.html');
  });

  test('iframe language message is accepted only from the parent window', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => window.spaManager?.currentPage === 'tumski.html');

    const frame = await getActiveFrame(page);
    await frame.evaluate(() => {
      window.__stage3LanguageMessages = [];
      const originalChangeLang = window.i18n?.changeLang;
      window.i18n = window.i18n || {};
      window.i18n.changeLang = function changeLang(lang) {
        window.__stage3LanguageMessages.push(lang);
        if (typeof originalChangeLang === 'function') {
          return originalChangeLang.call(this, lang);
        }
        return undefined;
      };
    });

    await frame.evaluate(() => {
      window.postMessage({ type: 'LANGUAGE_CHANGE', lang: 'de' }, window.location.origin);
    });

    await page.waitForTimeout(250);
    expect(await frame.evaluate(() => window.__stage3LanguageMessages)).toEqual([]);

    await page.evaluate(() => {
      const activeIframe = document.querySelector('.page-content.active iframe');
      window.SpaMessages.postToFrame(activeIframe, window.SpaMessages.TYPES.LANGUAGE_CHANGE, { lang: 'en' });
    });

    await expect.poll(() => frame.evaluate(() => window.__stage3LanguageMessages.includes('en'))).toBe(true);
  });
});
