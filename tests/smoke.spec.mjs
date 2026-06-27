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

  test('shared quest audio helper owns quest music in SPA shell', async ({ page }) => {
    await page.goto('/');

    const activeIframe = page.locator('.page-content.active iframe').first();
    await expect(activeIframe).toBeAttached();

    const result = await page.evaluate(() => {
      const iframe = document.querySelector('.page-content.active iframe');
      const firstQuestMusic = window.QuestAudio.getOrCreateSharedQuestMusic();
      const attachedQuestMusic = window.QuestAudio.attachSharedQuestMusicToFrame(iframe);

      return {
        helperAvailable: !!window.QuestAudio,
        iframeAudioCount: iframe.contentWindow.document.querySelectorAll('#questMusic').length,
        iframeReferenceShared: iframe.contentWindow.questMusic === firstQuestMusic,
        loop: firstQuestMusic.loop,
        parentAudioCount: document.querySelectorAll('#questMusic').length,
        preload: firstQuestMusic.preload,
        sameAudio: firstQuestMusic === attachedQuestMusic,
        source: firstQuestMusic.getAttribute('src'),
        volume: firstQuestMusic.volume
      };
    });

    expect(result).toEqual({
      helperAvailable: true,
      iframeAudioCount: 0,
      iframeReferenceShared: true,
      loop: true,
      parentAudioCount: 1,
      preload: 'auto',
      sameAudio: true,
      source: 'media/zwyki/quest.mp3',
      volume: 0.7
    });
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
        questOverlayScripts: document.querySelectorAll('script#quest-overlay-script[src="quest_overlay.js"]').length,
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
      questOverlayScripts: 1,
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

    const marker = page.locator('#visited-markers-layer .visited-marker[title="Smoke target"]');
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

  test('QuestOverlay helper preserves book overlay render contract', async ({ page }) => {
    await page.goto('/tumski.html');
    await expect(page.locator('#open-quest')).toBeVisible();
    await page.waitForFunction(() => window.QuestOverlay?.open);

    const result = await page.evaluate(async () => {
      window.isSoundEnabled = () => false;
      window.__stage4QuestDisableMenuCount = 0;
      const existingLanguageMenu = window.LanguageMenu || {};
      window.LanguageMenu = {
        ...existingLanguageMenu,
        disableMenu() {
          window.__stage4QuestDisableMenuCount += 1;
        }
      };
      sessionStorage.setItem('questState', JSON.stringify({
        __lastPreparedNumber: 2,
        tasks: {
          2: true,
          3: {
            prepared: true,
            image: 'media/watercolor/3.jpg'
          }
        }
      }));

      document.getElementById('open-quest').click();
      await new Promise(resolve => setTimeout(resolve, 250));

      const overlay = document.querySelector('.book-overlay');
      const questTasks = overlay.querySelector('.quest-tasks');

      return {
        disableMenuCalls: window.__stage4QuestDisableMenuCount,
        display: getComputedStyle(overlay).display,
        flipButtons: overlay.querySelectorAll('.quest-flip-button').length,
        introBlocks: overlay.querySelectorAll('.quest-intro').length,
        questOverlayAvailable: typeof window.QuestOverlay?.open === 'function',
        resetButtons: overlay.querySelectorAll('.quest-reset-button').length,
        scriptCount: document.querySelectorAll('script#quest-overlay-script[src="quest_overlay.js"]').length,
        soundButtons: overlay.querySelectorAll('.quest-sound-button').length,
        taskImages: questTasks.querySelectorAll(':scope > img.task-image').length,
        taskItems: questTasks.querySelectorAll(':scope > li').length,
        titleDisplay: overlay.querySelector('.book-title')?.style.display,
        titleImages: overlay.querySelectorAll('img[src="media/watercolor/tumski.jpeg"]').length
      };
    });

    expect(result).toMatchObject({
      disableMenuCalls: 2,
      display: 'flex',
      flipButtons: 2,
      introBlocks: 1,
      questOverlayAvailable: true,
      resetButtons: 1,
      scriptCount: 1,
      soundButtons: 2,
      taskImages: 11,
      taskItems: 13,
      titleDisplay: 'block',
      titleImages: 1
    });
  });

  test('QuestOverlay intro renders translated paragraphs as text', async ({ page }) => {
    await page.goto('/tumski.html');
    await page.waitForFunction(() => window.renderQuestIntro);

    const result = await page.evaluate(() => {
      const originalI18n = window.i18n;
      const bookContentArea = document.createElement('div');
      const questTasksList = document.createElement('ul');
      bookContentArea.appendChild(questTasksList);

      window.i18n = {
        ...originalI18n,
        t(key) {
          if (key === 'quest.intro') {
            return 'First <strong>paragraph</strong>\n\nSecond <script>bad()</script>';
          }

          return originalI18n?.t?.(key) || key;
        }
      };

      try {
        window.renderQuestIntro(bookContentArea, questTasksList);
        const intro = bookContentArea.querySelector('.quest-intro');
        return {
          innerHTML: intro.innerHTML,
          paragraphCount: intro.querySelectorAll('p').length,
          scriptCount: intro.querySelectorAll('script').length,
          text: intro.textContent
        };
      } finally {
        window.i18n = originalI18n;
      }
    });

    expect(result).toEqual({
      innerHTML: '<p>First &lt;strong&gt;paragraph&lt;/strong&gt;</p><p>Second &lt;script&gt;bad()&lt;/script&gt;</p>',
      paragraphCount: 2,
      scriptCount: 0,
      text: 'First <strong>paragraph</strong>Second <script>bad()</script>'
    });
  });

  test('MapDebug gates map and quest diagnostics behind explicit flags', async ({ page }) => {
    await page.goto('/tumski.html');

    const result = await page.evaluate(async () => {
      await import('./map_debug.js');
      const calls = [];
      const originalLog = console.log;

      console.log = (...args) => {
        calls.push(args);
      };

      try {
        delete window.DEBUG_MAP;
        localStorage.removeItem('DEBUG_MAP');
        localStorage.removeItem('__quest_debug');
        window.MapDebug.log('hidden');
        const disabled = window.MapDebug.isEnabled();

        window.DEBUG_MAP = true;
        window.MapDebug.log('global-enabled');
        const globalEnabled = window.MapDebug.isEnabled();

        window.DEBUG_MAP = false;
        localStorage.setItem('DEBUG_MAP', '1');
        window.MapDebug.log('storage-enabled');
        const storageEnabled = window.MapDebug.isEnabled();

        localStorage.removeItem('DEBUG_MAP');
        localStorage.setItem('__quest_debug', '1');
        window.MapDebug.log('legacy-enabled');
        const legacyEnabled = window.MapDebug.isEnabled();

        return {
          disabled,
          globalEnabled,
          legacyEnabled,
          storageEnabled,
          messages: calls.map(args => args.slice(0, 2))
        };
      } finally {
        console.log = originalLog;
        delete window.DEBUG_MAP;
        localStorage.removeItem('DEBUG_MAP');
        localStorage.removeItem('__quest_debug');
      }
    });

    expect(result).toEqual({
      disabled: false,
      globalEnabled: true,
      legacyEnabled: true,
      storageEnabled: true,
      messages: [
        ['[map]', 'global-enabled'],
        ['[map]', 'storage-enabled'],
        ['[map]', 'legacy-enabled']
      ]
    });
  });

  test('arrow diagnostics are quiet by default and gated by DEBUG_ARROWS', async ({ page }) => {
    await page.goto('/tumski.html');

    const result = await page.evaluate(() => {
      const calls = [];
      const created = [];
      const originalLog = console.log;

      function createArrowPair(id) {
        const cursor = document.createElement('div');
        const area = document.createElement('div');
        cursor.id = `${id}-cursor`;
        area.id = `${id}-area`;
        area.appendChild(cursor);
        document.body.appendChild(area);
        created.push(area);
        return { area, cursor };
      }

      console.log = (...args) => {
        calls.push(args);
      };

      try {
        delete window.DEBUG_ARROWS;
        localStorage.removeItem('DEBUG_ARROWS');
        localStorage.removeItem('__arrow_debug');

        const defaultPair = createArrowPair('arrow-debug-default');
        window.setupRightArrowHandler(defaultPair.cursor, defaultPair.area, null, () => {});
        const disabledCount = calls.length;

        window.DEBUG_ARROWS = true;
        const globalPair = createArrowPair('arrow-debug-global');
        window.setupRightArrowHandler(globalPair.cursor, globalPair.area, null, () => {});
        const globalEnabledCount = calls.length - disabledCount;

        window.DEBUG_ARROWS = false;
        localStorage.setItem('DEBUG_ARROWS', '1');
        const storagePair = createArrowPair('arrow-debug-storage');
        window.setupRightArrowHandler(storagePair.cursor, storagePair.area, null, () => {});
        const storageEnabledCount = calls.length - disabledCount - globalEnabledCount;

        return {
          disabledCount,
          globalEnabledCount,
          storageEnabledCount,
          messages: calls.map((args) => args[0])
        };
      } finally {
        console.log = originalLog;
        delete window.DEBUG_ARROWS;
        localStorage.removeItem('DEBUG_ARROWS');
        localStorage.removeItem('__arrow_debug');
        created.forEach((node) => node.remove());
      }
    });

    expect(result.disabledCount).toBe(0);
    expect(result.globalEnabledCount).toBeGreaterThan(0);
    expect(result.storageEnabledCount).toBeGreaterThan(0);
    expect(result.messages).toContain('🔵 setupRightArrowHandler: isMobile =');
  });

  test('account diagnostics are quiet by default and gated by DEBUG_ACCOUNT', async ({ page }) => {
    await page.goto('/tumski.html');

    const result = await page.evaluate(async () => {
      if (!window.UserAccountManager) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = './user_account.js';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      const manager = Object.create(window.UserAccountManager.prototype);
      const logs = [];
      const warns = [];
      const originalLog = console.log;
      const originalWarn = console.warn;

      console.log = (...args) => {
        logs.push(args);
      };
      console.warn = (...args) => {
        warns.push(args);
      };

      try {
        delete window.DEBUG_ACCOUNT;
        localStorage.removeItem('DEBUG_ACCOUNT');
        localStorage.removeItem('__account_debug');
        manager._alog('hidden-log');
        manager._awarn('hidden-warn');
        const disabled = { logs: logs.length, warns: warns.length };

        window.DEBUG_ACCOUNT = true;
        manager._alog('global-log');
        manager._awarn('global-warn');
        const globalEnabled = { logs: logs.length - disabled.logs, warns: warns.length - disabled.warns };

        window.DEBUG_ACCOUNT = false;
        localStorage.setItem('DEBUG_ACCOUNT', '1');
        manager._alog('storage-log');
        manager._awarn('storage-warn');
        const storageEnabled = {
          logs: logs.length - disabled.logs - globalEnabled.logs,
          warns: warns.length - disabled.warns - globalEnabled.warns
        };

        localStorage.removeItem('DEBUG_ACCOUNT');
        localStorage.setItem('__account_debug', '1');
        manager._alog('legacy-log');
        manager._awarn('legacy-warn');
        const legacyEnabled = {
          logs: logs.length - disabled.logs - globalEnabled.logs - storageEnabled.logs,
          warns: warns.length - disabled.warns - globalEnabled.warns - storageEnabled.warns
        };

        return {
          disabled,
          globalEnabled,
          storageEnabled,
          legacyEnabled,
          logs,
          warns
        };
      } finally {
        console.log = originalLog;
        console.warn = originalWarn;
        delete window.DEBUG_ACCOUNT;
        localStorage.removeItem('DEBUG_ACCOUNT');
        localStorage.removeItem('__account_debug');
        if (window.__questAutoSaveInterval) {
          clearInterval(window.__questAutoSaveInterval);
          window.__questAutoSaveInterval = null;
        }
      }
    });

    expect(result.disabled).toEqual({ logs: 0, warns: 0 });
    expect(result.globalEnabled).toEqual({ logs: 1, warns: 1 });
    expect(result.storageEnabled).toEqual({ logs: 1, warns: 1 });
    expect(result.legacyEnabled).toEqual({ logs: 1, warns: 1 });
    expect(result.logs).toEqual([
      ['[account]', 'global-log'],
      ['[account]', 'storage-log'],
      ['[account]', 'legacy-log']
    ]);
    expect(result.warns).toEqual([
      ['[account]', 'global-warn'],
      ['[account]', 'storage-warn'],
      ['[account]', 'legacy-warn']
    ]);
  });

  test('user database diagnostics are quiet by default and gated by DEBUG_ACCOUNT', async ({ page }) => {
    await page.goto('/tumski.html');

    const result = await page.evaluate(async () => {
      if (!window.userDatabase) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = './user_database.js';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      const calls = [];
      const originalLog = console.log;

      console.log = (...args) => {
        calls.push(args);
      };

      try {
        delete window.DEBUG_ACCOUNT;
        localStorage.removeItem('DEBUG_ACCOUNT');
        localStorage.removeItem('__account_debug');
        window.userDatabase._dlog('hidden-log');
        const disabledCount = calls.length;

        window.DEBUG_ACCOUNT = true;
        window.userDatabase._dlog('global-log');
        const globalEnabledCount = calls.length - disabledCount;

        window.DEBUG_ACCOUNT = false;
        localStorage.setItem('DEBUG_ACCOUNT', '1');
        window.userDatabase._dlog('storage-log');
        const storageEnabledCount = calls.length - disabledCount - globalEnabledCount;

        localStorage.removeItem('DEBUG_ACCOUNT');
        localStorage.setItem('__account_debug', '1');
        window.userDatabase._dlog('legacy-log');
        const legacyEnabledCount = calls.length - disabledCount - globalEnabledCount - storageEnabledCount;

        return {
          disabledCount,
          globalEnabledCount,
          storageEnabledCount,
          legacyEnabledCount,
          calls
        };
      } finally {
        console.log = originalLog;
        delete window.DEBUG_ACCOUNT;
        localStorage.removeItem('DEBUG_ACCOUNT');
        localStorage.removeItem('__account_debug');
      }
    });

    expect(result.disabledCount).toBe(0);
    expect(result.globalEnabledCount).toBe(1);
    expect(result.storageEnabledCount).toBe(1);
    expect(result.legacyEnabledCount).toBe(1);
    expect(result.calls).toEqual([
      ['[userDatabase]', 'global-log'],
      ['[userDatabase]', 'storage-log'],
      ['[userDatabase]', 'legacy-log']
    ]);
  });

  test('i18n writes text by default and allows only vetted rich HTML keys', async ({ page }) => {
    await page.goto('/tumski.html');
    await page.waitForFunction(() => window.i18n?.setTranslatedContent);

    const result = await page.evaluate(() => {
      window.i18n.translations = {
        music: {
          audio_unlock_text: 'Enable <em>audio</em>'
        },
        smoke: {
          plain: 'Plain <strong>HTML</strong>'
        },
        tumski: {
          book02: {
            zone1: {
              text: 'Line 1<br><script>bad()</script><br />Line 2'
            }
          }
        }
      };

      const plainElement = document.createElement('div');
      plainElement.setAttribute('data-i18n', 'smoke.plain');
      document.body.appendChild(plainElement);

      const audioElement = document.createElement('div');
      audioElement.className = 'audio-unlock-text';
      audioElement.setAttribute('data-i18n', 'music.audio_unlock_text');
      document.body.appendChild(audioElement);

      document.getElementById('audioUnlockButton')?.remove();
      const legacyAudioButton = document.createElement('div');
      legacyAudioButton.id = 'audioUnlockButton';
      const legacyAudioText = document.createElement('div');
      legacyAudioText.className = 'audio-unlock-text';
      legacyAudioButton.appendChild(legacyAudioText);
      document.body.appendChild(legacyAudioButton);

      const richElement = document.createElement('div');
      window.i18n.updatePageContent();
      window.i18n.setTranslatedContent(richElement, 'tumski.book02.zone1.text');

      return {
        audioInnerHTML: audioElement.innerHTML,
        audioText: audioElement.textContent,
        legacyAudioInnerHTML: legacyAudioText.innerHTML,
        legacyAudioText: legacyAudioText.textContent,
        plainInnerHTML: plainElement.innerHTML,
        plainText: plainElement.textContent,
        richAllowsKnownKey: window.i18n.isRichTranslationKey('tumski.book02.zone1.text'),
        richBlocksUnknownKey: window.i18n.isRichTranslationKey('smoke.plain'),
        richInnerHTML: richElement.innerHTML,
        richScriptCount: richElement.querySelectorAll('script').length,
        richText: richElement.textContent
      };
    });

    expect(result).toEqual({
      audioInnerHTML: 'Enable &lt;em&gt;audio&lt;/em&gt;',
      audioText: 'Enable <em>audio</em>',
      legacyAudioInnerHTML: 'Enable &lt;em&gt;audio&lt;/em&gt;',
      legacyAudioText: 'Enable <em>audio</em>',
      plainInnerHTML: 'Plain &lt;strong&gt;HTML&lt;/strong&gt;',
      plainText: 'Plain <strong>HTML</strong>',
      richAllowsKnownKey: true,
      richBlocksUnknownKey: false,
      richInnerHTML: 'Line 1<br>&lt;script&gt;bad()&lt;/script&gt;<br>Line 2',
      richScriptCount: 0,
      richText: 'Line 1<script>bad()</script>Line 2'
    });
  });

  test('gnome descriptions keep br formatting while escaping other HTML', async ({ page }) => {
    await page.goto('/tumski.html');

    const result = await page.evaluate(async () => {
      const gnomeMod = await import('./gnome_marker_handler.js');
      const marker = document.createElement('button');
      marker.id = 'smoke-gnome-marker';
      document.body.appendChild(marker);

      gnomeMod.setupGnomeGeoMarker({
        markerId: marker.id,
        gnomeId: 'blue_goat',
        imageSrc: 'media/krasnolud/koza.jpg',
        title: 'Smoke gnome',
        description: 'Line 1<br><script>bad()</script>'
      });

      marker.click();

      const description = document.querySelector('.gnome-description');
      return {
        innerHTML: description?.innerHTML,
        scriptCount: description?.querySelectorAll('script').length,
        text: description?.textContent
      };
    });

    expect(result).toEqual({
      innerHTML: 'Line 1<br>&lt;script&gt;bad()&lt;/script&gt;',
      scriptCount: 0,
      text: 'Line 1<script>bad()</script>'
    });
  });

  test('PageShellHelpers creates standard scene, cursor and marker fragments', async ({ page }) => {
    await page.goto('/tumski.html');

    const result = await page.evaluate(async () => {
      const { PageShellHelpers } = await import('./page_shell_helpers.js');
      const shell = PageShellHelpers.createSceneShell({ mapPoint: 40 });
      const renderedPage = PageShellHelpers.renderConfiguredPage({
        markerTarget: shell.scene,
        markerOptions: {
          before: shell.nextImageContainer
        },
        markers: [{
          id: 'black_klotska_quest',
          titleKey: 'quest.task9',
          textId: 'black-klotska-text',
          coordinates: {
            xDesktop: 1220,
            yDesktop: 650,
            xMobile: 1350,
            yMobile: 700
          },
          paperaSrc: 'media/papera1.png',
          audioId: 'bookSoundBlackKlotska',
          questNumber: 9,
          questImage: 'media/tumski/dwor_08.jpg'
        }],
        routeCursors: [
          {
            type: 'prosto',
            page: 'dwor02.html',
            coordinates: {
              xDesktop: 1000,
              yDesktop: 1200,
              xMobile: 1300,
              yMobile: 1200
            },
            areaCoordinates: {
              xDesktop: 900,
              yDesktop: 1100,
              xMobile: 1200,
              yMobile: 1100
            }
          }
        ],
        routeTarget: shell.image
      });
      const marker = renderedPage.markers[0];
      const routeElements = renderedPage.routeElements;

      const host = document.createElement('section');
      host.appendChild(shell.scene);
      document.body.appendChild(host);

      return {
        audioSrc: marker.audio.getAttribute('src'),
        cursorClass: routeElements[0].className,
        cursorTarget: routeElements[0].getAttribute('data-next-page'),
        cursorX: routeElements[0].getAttribute('data-x-desktop'),
        imageContainerClass: shell.imageContainer.className,
        imageCount: host.querySelectorAll('.image').length,
        mapPoint: shell.imageContainer.getAttribute('data-map-point'),
        markerId: marker.marker.id,
        markerQuestImage: marker.marker.getAttribute('data-quest-image'),
        markerQuestNumber: marker.marker.getAttribute('data-quest-number'),
        markerXMobile: marker.marker.getAttribute('data-x-mobile'),
        nextImageContainers: host.querySelectorAll('.next-image-container').length,
        routeAreaClass: routeElements[1].className,
        routeAreaY: routeElements[1].getAttribute('data-y-desktop'),
        routeElementCount: routeElements.length,
        renderedMarkerCount: renderedPage.markers.length,
        sceneClass: shell.scene.className,
        textKey: marker.text.getAttribute('data-i18n')
      };
    });

    expect(result).toEqual({
      audioSrc: 'media/opening-a-book.wav',
      cursorClass: 'custom-cursor-prosto',
      cursorTarget: 'dwor02.html',
      cursorX: '1000',
      imageContainerClass: 'image-container',
      imageCount: 1,
      mapPoint: '40',
      markerId: 'black_klotska_quest',
      markerQuestImage: 'media/tumski/dwor_08.jpg',
      markerQuestNumber: '9',
      markerXMobile: '1350',
      nextImageContainers: 1,
      routeAreaClass: 'custom-cursor-prostoarea',
      routeAreaY: '1100',
      routeElementCount: 2,
      renderedMarkerCount: 1,
      sceneClass: 'scene',
      textKey: 'quest.task9'
    });
  });

  test('dwor01 keeps stable page shell contract after helper marker and cursor migration', async ({ page }) => {
    await page.goto('/dwor01.html');

    const contract = await page.evaluate(() => ({
      backAreaClass: document.querySelector('.custom-cursor-backarea')?.className,
      backTarget: document.querySelector('.custom-cursor-back')?.getAttribute('data-prev-page'),
      blackKlotskaTextKey: document.getElementById('black_klotska_quest')?.parentElement?.querySelector('.tumski-text')?.getAttribute('data-i18n'),
      blackKlotskaAudioSrc: document.getElementById('bookSoundBlackKlotska')?.getAttribute('src'),
      blackKlotskaQuestImage: document.getElementById('black_klotska_quest')?.getAttribute('data-quest-image'),
      blackKlotskaQuestNumber: document.getElementById('black_klotska_quest')?.getAttribute('data-quest-number'),
      imageContainerMapPoint: document.querySelector('.image-container')?.getAttribute('data-map-point'),
      imageCount: document.querySelectorAll('.scene .image-scroll-wrapper > .image').length,
      kleckGateAudioSrc: document.getElementById('bookSoundKleckGate')?.getAttribute('src'),
      kleckGateTextKey: document.getElementById('kleck-gate-text')?.getAttribute('data-i18n'),
      markerCount: document.querySelectorAll('.map-mark-area').length,
      markerIds: Array.from(document.querySelectorAll('.map-mark-area .map-mark')).map((marker) => marker.id),
      nextImageContainers: document.querySelectorAll('.scene + .next-image-container, .scene .next-image-container').length,
      prostoAreaClass: document.querySelector('.custom-cursor-prostoarea')?.className,
      prostoTarget: document.querySelector('.custom-cursor-prosto')?.getAttribute('data-next-page'),
      sceneCount: document.querySelectorAll('.scene').length
    }));

    expect(contract).toEqual({
      backAreaClass: 'custom-cursor-backarea',
      backTarget: 'pk02.html',
      blackKlotskaTextKey: 'quest.task9',
      blackKlotskaAudioSrc: 'media/opening-a-book.wav',
      blackKlotskaQuestImage: 'media/tumski/dwor_08.jpg',
      blackKlotskaQuestNumber: '9',
      imageContainerMapPoint: '40',
      imageCount: 1,
      kleckGateAudioSrc: 'media/opening-a-book.wav',
      kleckGateTextKey: 'kleck_gate.title',
      markerCount: 2,
      markerIds: ['black_klotska_quest', 'kleck_gate'],
      nextImageContainers: 1,
      prostoAreaClass: 'custom-cursor-prostoarea',
      prostoTarget: 'dwor02.html',
      sceneCount: 1
    });
  });

  test('dwor02 keeps stable page shell contract after page module migration', async ({ page }) => {
    await page.goto('/dwor02.html');

    const contract = await page.evaluate(() => ({
      backAreaClass: document.querySelector('.custom-cursor-backarea')?.className,
      backTarget: document.querySelector('.custom-cursor-back')?.getAttribute('data-prev-page'),
      imageContainerMapPoint: document.querySelector('.image-container')?.getAttribute('data-map-point'),
      imageCount: document.querySelectorAll('.scene .image-scroll-wrapper > .image').length,
      kleckGateAudioSrc: document.getElementById('bookSoundKleckGate')?.getAttribute('src'),
      kleckGateTextKey: document.getElementById('kleck-gate-text')?.getAttribute('data-i18n'),
      markerCount: document.querySelectorAll('.map-mark-area').length,
      markerIds: Array.from(document.querySelectorAll('.map-mark-area .map-mark')).map((marker) => marker.id),
      nextImageContainers: document.querySelectorAll('.scene + .next-image-container, .scene .next-image-container').length,
      pageModuleLoaded: Boolean(document.querySelector('script[type="module"][src="dwor02_page.js"]')),
      prostoAreaClass: document.querySelector('.custom-cursor-prostoarea')?.className,
      prostoTarget: document.querySelector('.custom-cursor-prosto')?.getAttribute('data-next-page'),
      sceneCount: document.querySelectorAll('.scene').length
    }));

    expect(contract).toEqual({
      backAreaClass: 'custom-cursor-backarea',
      backTarget: 'dwor01.html',
      imageContainerMapPoint: '40',
      imageCount: 1,
      kleckGateAudioSrc: 'media/opening-a-book.wav',
      kleckGateTextKey: 'kleck_gate.title',
      markerCount: 1,
      markerIds: ['kleck_gate'],
      nextImageContainers: 1,
      pageModuleLoaded: true,
      prostoAreaClass: 'custom-cursor-prostoarea',
      prostoTarget: 'dwor03.html',
      sceneCount: 1
    });
  });

  test('SPA config exposes page registry, selectors and audio policy', async ({ page }) => {
    await page.goto('/');

    const config = await page.evaluate(() => ({
      activeIframeSelector: window.SpaConfig.SELECTORS.activeIframe,
      defaultTrack: window.SpaConfig.getAudioTrackForPage('tumski02.html'),
      hangSource: window.SpaConfig.getAudioSourceForTrack('hang'),
      firstPage: window.SpaConfig.PAGE_ORDER[0],
      minskTrack: window.SpaConfig.getAudioTrackForPage('minsk01.html#patsa_vatsa'),
      questSource: window.SpaConfig.getAudioSourceForTrack('quest'),
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
      hangSource: 'media/zwyki/hang.mp3',
      minskTrack: 'minsk',
      nextFromStart: 'tumski02.html',
      ogrodTrack: 'birds',
      previousFromSecond: 'tumski.html',
      questSource: 'media/zwyki/quest.mp3',
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

  test('SPA loading state helper preserves overlay class contract', async ({ page }) => {
    await page.goto('/');

    const loadingState = await page.evaluate(() => {
      const overlay = document.getElementById('loadingOverlay');
      const helper = window.SpaLoadingState;
      const initiallyHidden = overlay.classList.contains('hidden');
      const showResult = helper.show(document);
      const visibleAfterShow = helper.isVisible(document);
      const textAfterShow = overlay.textContent.trim();
      const hiddenAfterShow = overlay.classList.contains('hidden');
      const showErrorResult = helper.showError(document);
      const textAfterError = overlay.textContent.trim();
      const hideResult = helper.hide(document);

      return {
        defaultErrorMessage: helper.DEFAULT_ERROR_MESSAGE,
        defaultLoadingMessage: helper.DEFAULT_LOADING_MESSAGE,
        helperAvailable: Boolean(helper),
        hiddenAfterHide: overlay.classList.contains('hidden'),
        hiddenAfterShow,
        hideResult,
        initiallyHidden,
        overlayMatches: helper.getOverlay(document) === overlay,
        selector: helper.LOADING_OVERLAY_SELECTOR,
        showErrorResult,
        showResult,
        textAfterError,
        textAfterHide: overlay.textContent.trim(),
        textAfterShow,
        visibleAfterHide: helper.isVisible(document),
        visibleAfterShow
      };
    });

    expect(loadingState).toEqual({
      defaultErrorMessage: 'Loading failed. Please try again.',
      defaultLoadingMessage: 'Loading...',
      helperAvailable: true,
      hiddenAfterHide: true,
      hiddenAfterShow: false,
      hideResult: true,
      initiallyHidden: true,
      overlayMatches: true,
      selector: '#loadingOverlay',
      showErrorResult: true,
      showResult: true,
      textAfterError: 'Loading failed. Please try again.',
      textAfterHide: 'Loading...',
      textAfterShow: 'Loading...',
      visibleAfterHide: false,
      visibleAfterShow: true
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
