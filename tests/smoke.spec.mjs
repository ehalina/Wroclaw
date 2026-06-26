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

  test('MapModal.init is idempotent on direct Tumski page', async ({ page }) => {
    await page.goto('/tumski.html');
    await expect(page.locator('#open-map-modal')).toBeVisible();

    const counts = await page.evaluate(() => {
      window.__stage4MapExpandCount = 0;
      window.miniMapManager = {
        expand() {
          window.__stage4MapExpandCount += 1;
        }
      };

      let windowListenersAdded = 0;
      let documentListenersAdded = 0;
      const originalWindowAddEventListener = window.addEventListener;
      const originalDocumentAddEventListener = document.addEventListener;

      window.addEventListener = function addEventListenerSpy(type, listener, options) {
        windowListenersAdded += 1;
        return originalWindowAddEventListener.call(this, type, listener, options);
      };
      document.addEventListener = function addEventListenerSpy(type, listener, options) {
        documentListenersAdded += 1;
        return originalDocumentAddEventListener.call(this, type, listener, options);
      };

      try {
        window.MapModal.init();
        window.MapModal.init();
      } finally {
        window.addEventListener = originalWindowAddEventListener;
        document.addEventListener = originalDocumentAddEventListener;
      }

      document.getElementById('open-map-modal').click();

      const templateSelectors = [
        '.map-and-quest-buttons',
        '.quest-button#open-quest',
        'a.map-button#open-map-modal',
        '#map-modal > div',
        'img#map-image[src="media/tumski/map.jpg"]',
        'img#map-marker[src="media/mapmark.png"]',
        '#visited-markers-layer.visited-markers-layer',
        '#map-tooltip',
        'button#close-map-modal',
        'button#toggle-tooltips',
        '.book-overlay > .close-button',
        '.book-container',
        '.book-image-content-wrapper',
        '.quest-top-image[src="media/book/quest_01.jpg"]',
        '.book-content-area',
        '.book-title',
        '.quest-tasks',
        '.quest-bottom-image[src="media/book/quest_02.jpg"]',
        '.book-content',
        '.scroll-indicator',
        '.most-overlay > .close-button',
        '.most-container',
        '.image-wrapper',
        '.most-image[data-src="BOOK_IMAGE_02"]',
        '.overlay-image',
        '.additional-image',
        '.book-31-image',
        '.book-32-image',
        '.most-text-block.most-text-block-left .most-title',
        '.most-text-block.most-text-block-left .most-description',
        '.most-text-block.most-text-block-right .most-title',
        '.most-text-block.most-text-block-right .most-description',
        'audio#stepSound[src="media/step.wav"]',
        'audio#mapSound[src="media/zwyki/bb6f2b8ec908f28.mp3"]',
        'audio#bookSound[src="media/opening-a-book.wav"]',
        'audio#sceneSound',
        '.quest-confirm-dialog-overlay',
        '.quest-confirm-dialog .dialog-text',
        '.quest-confirm-dialog .dialog-buttons',
        '.quest-confirm-dialog .confirm-yes',
        '.quest-confirm-dialog .confirm-no'
      ];

      return {
        bookOverlays: document.querySelectorAll('.book-overlay').length,
        bookZoneCount: document.querySelectorAll('.book-zone[data-zone]').length,
        confirmDialogs: document.querySelectorAll('.quest-confirm-dialog').length,
        documentListenersAdded,
        expandCalls: window.__stage4MapExpandCount,
        legacyInlineMainStyles: document.querySelectorAll('style#map-modal-styles').length,
        mainStyleHref: document.getElementById('map-modal-styles')?.getAttribute('href'),
        mainStyles: document.querySelectorAll('link#map-modal-styles[rel="stylesheet"]').length,
        markerNavigationScripts: document.querySelectorAll('script#map-marker-navigation-script[src="map_marker_navigation.js"]').length,
        mapButtons: document.querySelectorAll('#open-map-modal').length,
        mapModals: document.querySelectorAll('#map-modal').length,
        missingTemplateSelectors: templateSelectors.filter(selector => document.querySelectorAll(selector).length !== 1),
        questButtons: document.querySelectorAll('#open-quest').length,
        tooltipStyles: document.querySelectorAll('#map-modal-mobile-tooltip-styles').length,
        visitedMarkerScripts: document.querySelectorAll('script#visited-markers-script[src="visited_markers.js"]').length,
        windowListenersAdded
      };
    });

    expect(counts).toEqual({
      bookOverlays: 1,
      bookZoneCount: 8,
      confirmDialogs: 1,
      documentListenersAdded: 0,
      expandCalls: 1,
      legacyInlineMainStyles: 0,
      mainStyleHref: 'map_modal.css',
      mainStyles: 1,
      markerNavigationScripts: 1,
      mapButtons: 1,
      mapModals: 1,
      missingTemplateSelectors: [],
      questButtons: 1,
      tooltipStyles: 1,
      visitedMarkerScripts: 1,
      windowListenersAdded: 0
    });
  });

  test('MapMarkerNavigation keeps SPA priority and location fallback behavior', async ({ page }) => {
    await page.goto('/tumski.html');
    await page.waitForFunction(() => window.MapMarkerNavigation?.navigate);

    const result = await page.evaluate(async () => {
      const localCalls = [];
      const parentCalls = [];
      const localStorageCalls = [];
      const fallbackStorageCalls = [];
      const localLocation = { href: '' };
      const fallbackLocation = { href: '' };
      const localStorage = {
        setItem(key, value) {
          localStorageCalls.push([key, value]);
        }
      };
      const fallbackStorage = {
        setItem(key, value) {
          fallbackStorageCalls.push([key, value]);
        }
      };

      const localRoot = {
        SPAManager: {
          loadPage(pageName) {
            localCalls.push(pageName);
          }
        },
        location: localLocation,
        parent: {
          SPAManager: {
            loadPage(pageName) {
              parentCalls.push(pageName);
            }
          }
        },
        sessionStorage: localStorage
      };

      const localResult = window.MapMarkerNavigation.navigate(
        ['tumski05.html', 'tumski06.html'],
        {
          location: localLocation,
          root: localRoot,
          secondaryDelayMs: 0,
          sessionStorage: localStorage
        }
      );

      await new Promise(resolve => setTimeout(resolve, 20));

      const fallbackRoot = {
        location: fallbackLocation,
        parent: null,
        sessionStorage: fallbackStorage
      };
      const fallbackResult = window.MapMarkerNavigation.navigate('tumski08.html', {
        location: fallbackLocation,
        root: fallbackRoot,
        sessionStorage: fallbackStorage
      });

      return {
        fallbackHref: fallbackLocation.href,
        fallbackResult,
        fallbackStorageCalls,
        localCalls,
        localHref: localLocation.href,
        localResult,
        localStorageCalls,
        parentCalls
      };
    });

    expect(result).toEqual({
      fallbackHref: 'tumski08.html',
      fallbackResult: {
        mode: 'location',
        page: 'tumski08.html',
        pages: ['tumski08.html']
      },
      fallbackStorageCalls: [['navigateViaMap', '1']],
      localCalls: ['tumski05.html', 'tumski06.html'],
      localHref: '',
      localResult: {
        mode: 'spa',
        page: 'tumski05.html',
        pages: ['tumski05.html', 'tumski06.html']
      },
      localStorageCalls: [['navigateViaMap', '1']],
      parentCalls: []
    });
  });

  test('visited marker click delegates route changes to MapMarkerNavigation', async ({ page }) => {
    await page.goto('/tumski.html');
    await expect(page.locator('#open-map-modal')).toBeVisible();

    await page.evaluate(() => {
      window.__stage4MarkerNavigationCalls = [];
      window.SPAManager = {
        loadPage(pageName) {
          window.__stage4MarkerNavigationCalls.push(pageName);
        }
      };
      localStorage.setItem('visitedPages', JSON.stringify({
        'tumski05.html': {
          page: 'tumski05.html',
          point: 5,
          title: 'Smoke target'
        }
      }));
    });

    await page.waitForFunction(() => window.MapMarkerNavigation?.navigate);
    await page.evaluate(async () => {
      await window.openFullscreenMap();
    });

    const marker = page.locator('#visited-markers-layer .visited-marker').first();
    await expect(marker).toBeAttached();
    await marker.click({ force: true });

    await expect.poll(() => page.evaluate(() => window.__stage4MarkerNavigationCalls)).toEqual(['tumski05.html']);
    await expect.poll(() => page.evaluate(() => sessionStorage.getItem('navigateViaMap'))).toBe('1');
    await expect.poll(() => page.evaluate(() => getComputedStyle(document.getElementById('map-modal')).display)).toBe('none');
  });

  test('VisitedMarkers helper preserves storage parsing, save and render contract', async ({ page }) => {
    await page.goto('/tumski.html');
    await expect(page.locator('#open-map-modal')).toBeVisible();
    await page.waitForFunction(() => window.VisitedMarkers?.renderVisitedMarkers);

    const result = await page.evaluate(async () => {
      localStorage.setItem('visitedPages', '{not valid json');
      const malformedStore = window.VisitedMarkers.getVisitedPages();

      localStorage.removeItem('visitedPages');
      await window.VisitedMarkers.saveVisitedPageIfNeeded();

      const currentPage = window.VisitedMarkers.getCurrentPageName();
      const savedStore = JSON.parse(localStorage.getItem('visitedPages') || '{}');
      const currentPoint = Number(document.querySelector('.image-container')?.getAttribute('data-map-point'));

      localStorage.setItem('visitedPages', JSON.stringify({
        [currentPage]: {
          page: currentPage,
          point: currentPoint,
          title: 'Current smoke'
        },
        'tumski05.html': {
          page: 'tumski05.html',
          point: 5,
          title: 'Smoke target'
        }
      }));

      document.getElementById('map-modal').style.display = 'flex';
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));

      const attachedPages = [];
      const renderResult = await window.VisitedMarkers.renderVisitedMarkers({
        attachMarkerHandlers(marker, pageName, isSmallScreen) {
          marker.dataset.smokePage = pageName;
          marker.dataset.smokeSmallScreen = String(isSmallScreen);
          attachedPages.push(pageName);
        }
      });

      const markers = Array.from(document.querySelectorAll('#visited-markers-layer .visited-marker')).map(marker => ({
        className: marker.className,
        left: marker.style.left,
        page: marker.dataset.smokePage,
        smallScreen: marker.dataset.smokeSmallScreen,
        title: marker.title,
        top: marker.style.top
      }));

      return {
        attachedPages,
        currentPage,
        malformedStore,
        markers,
        renderResult,
        savedCurrent: savedStore[currentPage]
      };
    });

    expect(result.malformedStore).toEqual({});
    expect(result.currentPage).toBe('tumski.html');
    expect(result.savedCurrent.page).toBe('tumski.html');
    expect(result.savedCurrent.point).toBeGreaterThan(0);
    expect(result.renderResult).toEqual({ markerCount: 2 });
    expect(result.attachedPages).toEqual(['tumski.html', 'tumski05.html']);
    expect(result.markers).toHaveLength(2);
    expect(result.markers[0]).toEqual(expect.objectContaining({
      className: 'visited-marker current-page',
      page: 'tumski.html',
      title: 'Current smoke'
    }));
    expect(result.markers[1]).toEqual(expect.objectContaining({
      className: 'visited-marker',
      page: 'tumski05.html',
      title: 'Smoke target'
    }));
    expect(result.markers.every(marker => marker.left && marker.top)).toBe(true);
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

  test('SPA lifecycle helpers parse routes and build page containers', async ({ page }) => {
    await page.goto('/');

    const lifecycle = await page.evaluate(() => {
      const split = window.SpaLifecycle.splitPageReference('minsk01.html#patsa#vatsa');
      const iframe = window.SpaLifecycle.createPageIframe('tumski05.html', 12345);
      const container = window.SpaLifecycle.createPageContainer('tumski05.html', iframe);

      return {
        containerClass: container.className,
        containerId: container.id,
        containerIframeCount: container.querySelectorAll('iframe').length,
        iframePosition: iframe.style.position,
        iframeSrc: iframe.getAttribute('src'),
        split
      };
    });

    expect(lifecycle).toEqual({
      containerClass: 'page-content',
      containerId: 'page-tumski05',
      containerIframeCount: 1,
      iframePosition: 'absolute',
      iframeSrc: 'tumski05.html?t=12345',
      split: {
        hash: 'patsa#vatsa',
        pageName: 'minsk01.html',
        requestedPageName: 'minsk01.html#patsa#vatsa'
      }
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

  test('PAGE_HASH handoff reaches only the active iframe from parent', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => window.spaManager?.currentPage === 'tumski.html');

    const frame = await getActiveFrame(page);
    await frame.waitForFunction(() => window.SpaMessages);
    await frame.evaluate(() => {
      window.__pendingGnomeHash = '';
    });

    await frame.evaluate(() => {
      window.postMessage({ type: 'PAGE_HASH', hash: 'ignored_hash' }, window.location.origin);
    });

    await page.waitForTimeout(250);
    expect(await frame.evaluate(() => window.__pendingGnomeHash)).toBe('');

    await page.evaluate(() => {
      const activeIframe = document.querySelector(window.SpaConfig.SELECTORS.activeIframe);
      window.SpaMessages.postToFrame(activeIframe, window.SpaMessages.TYPES.PAGE_HASH, { hash: 'patsa_vatsa' });
    });

    await expect.poll(() => frame.evaluate(() => window.__pendingGnomeHash)).toBe('patsa_vatsa');
  });

  test('AUDIO_UNLOCKED handoff is accepted only from the parent window', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => window.spaManager?.currentPage === 'tumski.html');

    const frame = await getActiveFrame(page);
    await frame.waitForFunction(() => window.SpaMessages);
    await expect(frame.locator('.sound-menu-button')).toBeAttached();

    await frame.evaluate(() => {
      const soundButton = document.querySelector('.sound-menu-button');
      soundButton.classList.add('muted');
      localStorage.setItem('soundMuted', 'true');
    });

    await frame.evaluate(() => {
      window.postMessage({ type: 'AUDIO_UNLOCKED', source: 'spa' }, window.location.origin);
    });

    await page.waitForTimeout(250);
    expect(await frame.evaluate(() => document.querySelector('.sound-menu-button').classList.contains('muted'))).toBe(true);
    expect(await frame.evaluate(() => localStorage.getItem('soundMuted'))).toBe('true');

    await page.evaluate(() => {
      const activeIframe = document.querySelector(window.SpaConfig.SELECTORS.activeIframe);
      window.SpaMessages.postToFrame(activeIframe, window.SpaMessages.TYPES.AUDIO_UNLOCKED, { source: 'spa' });
    });

    await expect.poll(() => frame.evaluate(() => document.querySelector('.sound-menu-button').classList.contains('muted'))).toBe(false);
    await expect.poll(() => frame.evaluate(() => localStorage.getItem('soundMuted'))).toBe('false');
  });

  test('OPEN_MINI_MAP is accepted only from the active iframe', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => window.spaManager?.currentPage === 'tumski.html');

    await page.evaluate(() => {
      window.postMessage(
        { type: 'OPEN_MINI_MAP', source: 'iframe' },
        window.location.origin
      );
    });

    await page.waitForTimeout(250);
    await expect(page.locator('#mini-map-container')).toHaveCount(0);

    const frame = await getActiveFrame(page);
    await frame.waitForFunction(() => window.SpaMessages);
    await frame.evaluate(() => {
      window.SpaMessages.postToParent(window.SpaMessages.TYPES.OPEN_MINI_MAP, { source: 'iframe' });
    });

    await expect(page.locator('#mini-map-container')).toBeVisible();
    await expect(page.locator('#mini-map-image')).toHaveAttribute('src', 'media/tumski/map.jpg');
  });

  test('mini map expand opens fullscreen map through the parent message boundary', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => window.spaManager?.currentPage === 'tumski.html');

    const frame = await getActiveFrame(page);
    await frame.waitForFunction(() => window.SpaMessages && document.getElementById('map-modal'));

    await frame.evaluate(() => {
      window.postMessage(
        { type: 'OPEN_FULLSCREEN_MAP', source: 'parent' },
        window.location.origin
      );
    });

    await page.waitForTimeout(250);
    expect(await frame.evaluate(() => getComputedStyle(document.getElementById('map-modal')).display)).not.toBe('flex');

    await frame.evaluate(() => {
      window.SpaMessages.postToParent(window.SpaMessages.TYPES.OPEN_MINI_MAP, { source: 'iframe' });
    });
    await expect(page.locator('#mini-map-container')).toBeVisible();

    await page.locator('#mini-map-expand').click();

    await expect(page.locator('#mini-map-container')).toHaveCount(0);
    await expect.poll(() => frame.evaluate(() => getComputedStyle(document.getElementById('map-modal')).display)).toBe('flex');
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
