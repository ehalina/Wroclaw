import { expect, test } from '@playwright/test';

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
});
