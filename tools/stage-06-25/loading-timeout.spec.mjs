import { expect, test } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const artifactDir = process.env.STAGE_06_TIMEOUT_ARTIFACT_DIR
  || 'docs/refactoring/artifacts/stage-06-25-loading-timeout';
const targetPage = process.env.STAGE_06_TIMEOUT_TARGET_PAGE || 'tumski02.html';
const timeoutMs = Number(process.env.STAGE_06_TIMEOUT_MS || 250);

function safeName(name) {
  return name.replace(/[^a-z0-9_-]+/gi, '-').toLowerCase();
}

async function collectTimeoutState(page, label) {
  return page.evaluate(({ stateLabel, targetPage }) => {
    const overlay = document.getElementById('loadingOverlay');
    const overlayStyle = overlay ? getComputedStyle(overlay) : null;
    const activePage = document.querySelector('.page-content.active');
    const activeIframe = activePage?.querySelector('iframe') || null;
    const pageNodes = Array.from(document.querySelectorAll('.page-content'));

    return {
      activeIframeSrc: activeIframe?.getAttribute('src') || null,
      activePageId: activePage?.id || null,
      currentPage: window.spaManager?.currentPage || null,
      label: stateLabel,
      overlayClassName: overlay?.className || null,
      overlayText: overlay?.textContent?.trim() || null,
      overlayVisible: Boolean(overlay && overlayStyle?.display !== 'none' && overlayStyle?.visibility !== 'hidden'),
      pageCount: pageNodes.length,
      pagesHasTarget: Boolean(window.spaManager?.pages?.has(targetPage)),
      targetPageNodes: pageNodes.filter((node) => node.id === `page-${targetPage.replace('.html', '')}`).length,
      timeoutOverride: window.__SPA_IFRAME_LOAD_TIMEOUT_MS
    };
  }, { stateLabel: label, targetPage });
}

test.describe('Stage 6.25 SPA loading timeout behavior', () => {
  test('hung iframe load shows bounded error state and keeps the current page active', async ({ page }, testInfo) => {
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
        releaseRoute = async () => {
          await route.abort('timedout').catch(() => {});
          resolve();
        };
      });
    });

    await page.goto('/');
    await expect(page.locator('#loadingOverlay')).toHaveClass(/hidden/);
    await expect(page.locator('.page-content.active iframe')).toHaveAttribute('src', /tumski\.html/);

    await page.evaluate((debugTimeoutMs) => {
      window.__SPA_IFRAME_LOAD_TIMEOUT_MS = debugTimeoutMs;
    }, timeoutMs);

    const beforeTimeout = await collectTimeoutState(page, 'before-timeout-navigation');
    await page.evaluate((pageName) => window.SPAManager.loadPage(pageName), targetPage);
    const interceptedUrl = await routeSeen;

    await expect(page.locator('#loadingOverlay')).toContainText('Loading failed. Please try again.');
    const afterTimeout = await collectTimeoutState(page, 'after-timeout');

    await page.screenshot({
      fullPage: true,
      path: path.join(artifactDir, `${safeName(testInfo.project.name)}-timeout-error.png`)
    });

    if (releaseRoute) {
      await releaseRoute();
    }

    const result = {
      afterTimeout,
      beforeTimeout,
      consoleMessages,
      interceptedUrl,
      pageErrors,
      targetPage,
      timeoutMs
    };

    await writeFile(
      path.join(artifactDir, `${safeName(testInfo.project.name)}-loading-timeout.json`),
      `${JSON.stringify(result, null, 2)}\n`
    );

    expect(beforeTimeout.currentPage).toBe('tumski.html');
    expect(afterTimeout.activeIframeSrc).toContain('tumski.html');
    expect(afterTimeout.currentPage).toBe('tumski.html');
    expect(afterTimeout.overlayText).toBe('Loading failed. Please try again.');
    expect(afterTimeout.overlayVisible).toBe(true);
    expect(afterTimeout.pagesHasTarget).toBe(false);
    expect(afterTimeout.pageCount).toBe(1);
    expect(afterTimeout.targetPageNodes).toBe(0);
    expect(pageErrors).toEqual([]);
  });
});
