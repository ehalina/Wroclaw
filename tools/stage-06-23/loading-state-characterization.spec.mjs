import { expect, test } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const artifactDir = process.env.STAGE_06_LOADING_ARTIFACT_DIR
  || 'docs/refactoring/artifacts/stage-06-23-loading-state';
const targetPage = process.env.STAGE_06_LOADING_TARGET_PAGE || 'tumski02.html';

function safeName(name) {
  return name.replace(/[^a-z0-9_-]+/gi, '-').toLowerCase();
}

async function collectLoadingState(page, label) {
  return page.evaluate((stateLabel) => {
    const overlay = document.getElementById('loadingOverlay');
    const overlayStyle = overlay ? getComputedStyle(overlay) : null;
    const activePage = document.querySelector('.page-content.active');
    const activeIframe = activePage?.querySelector('iframe') || null;
    const pages = Array.from(document.querySelectorAll('.page-content')).map((pageNode) => {
      const iframe = pageNode.querySelector('iframe');
      const style = getComputedStyle(pageNode);

      return {
        className: pageNode.className,
        id: pageNode.id,
        iframeSrc: iframe?.getAttribute('src') || null,
        opacity: style.opacity,
        visibility: style.visibility
      };
    });

    return {
      activeIframeSrc: activeIframe?.getAttribute('src') || null,
      activePageId: activePage?.id || null,
      label: stateLabel,
      overlayClassName: overlay?.className || null,
      overlayDisplay: overlayStyle?.display || null,
      overlayText: overlay?.textContent?.trim() || null,
      overlayVisibility: overlayStyle?.visibility || null,
      overlayVisible: Boolean(overlay && overlayStyle?.display !== 'none' && overlayStyle?.visibility !== 'hidden'),
      pageCount: pages.length,
      pages
    };
  }, label);
}

test.describe('Stage 6.23 SPA loading state characterization', () => {
  test('slow iframe navigation keeps loading overlay visible without blanking the current page', async ({ page }, testInfo) => {
    await mkdir(artifactDir, { recursive: true });

    const consoleMessages = [];
    const pageErrors = [];
    page.on('console', (message) => {
      consoleMessages.push({ text: message.text(), type: message.type() });
    });
    page.on('pageerror', (error) => {
      pageErrors.push(error.message);
    });

    let releaseRoute;
    let resolveRouteSeen;
    const routeSeen = new Promise((resolve) => {
      resolveRouteSeen = resolve;
    });

    await page.route(`**/${targetPage}*`, async (route) => {
      resolveRouteSeen(route.request().url());
      await new Promise((resolve) => {
        releaseRoute = resolve;
      });
      await route.continue();
    });

    await page.goto('/');
    await expect(page.locator('#loadingOverlay')).toHaveClass(/hidden/);
    await expect(page.locator('.page-content.active iframe')).toHaveAttribute('src', /tumski\.html/);

    const beforeNavigation = await collectLoadingState(page, 'before-navigation');

    await page.evaluate((pageName) => window.SPAManager.loadPage(pageName), targetPage);
    const interceptedUrl = await routeSeen;

    await expect(page.locator('#loadingOverlay')).toBeVisible();
    await expect(page.locator('.page-content.active iframe')).toHaveAttribute('src', /tumski\.html/);

    const duringNavigation = await collectLoadingState(page, 'during-slow-navigation');
    await page.screenshot({
      fullPage: true,
      path: path.join(artifactDir, `${safeName(testInfo.project.name)}-loading-overlay.png`)
    });

    releaseRoute();

    await expect(page.locator('#loadingOverlay')).toHaveClass(/hidden/);
    await expect(page.locator('.page-content.active iframe')).toHaveAttribute(
      'src',
      new RegExp(targetPage.replace('.', '\\.'))
    );

    const afterNavigation = await collectLoadingState(page, 'after-navigation');
    await page.screenshot({
      fullPage: true,
      path: path.join(artifactDir, `${safeName(testInfo.project.name)}-after-navigation.png`)
    });

    const result = {
      afterNavigation,
      beforeNavigation,
      consoleMessages,
      duringNavigation,
      interceptedUrl,
      pageErrors,
      targetPage
    };

    await writeFile(
      path.join(artifactDir, `${safeName(testInfo.project.name)}-loading-state.json`),
      `${JSON.stringify(result, null, 2)}\n`
    );

    expect(beforeNavigation.overlayVisible).toBe(false);
    expect(beforeNavigation.activeIframeSrc).toContain('tumski.html');
    expect(duringNavigation.overlayText).toBe('Loading...');
    expect(duringNavigation.overlayVisible).toBe(true);
    expect(duringNavigation.activeIframeSrc).toContain('tumski.html');
    expect(duringNavigation.pageCount).toBeGreaterThanOrEqual(2);
    expect(afterNavigation.overlayVisible).toBe(false);
    expect(afterNavigation.activeIframeSrc).toContain(targetPage);
    expect(pageErrors).toEqual([]);
  });
});
