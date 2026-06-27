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
      const route = PageShellHelpers.createRouteCursor({
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
      });
      const marker = PageShellHelpers.createMarker({
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
      });

      route.elements.forEach((element) => shell.image.appendChild(element));
      shell.scene.appendChild(marker.root);

      const host = document.createElement('section');
      host.appendChild(shell.scene);
      document.body.appendChild(host);

      return {
        audioSrc: marker.audio.getAttribute('src'),
        cursorClass: route.cursor.className,
        cursorTarget: route.cursor.getAttribute('data-next-page'),
        cursorX: route.cursor.getAttribute('data-x-desktop'),
        imageContainerClass: shell.imageContainer.className,
        imageCount: host.querySelectorAll('.image').length,
        mapPoint: shell.imageContainer.getAttribute('data-map-point'),
        markerId: marker.marker.id,
        markerQuestImage: marker.marker.getAttribute('data-quest-image'),
        markerQuestNumber: marker.marker.getAttribute('data-quest-number'),
        markerXMobile: marker.marker.getAttribute('data-x-mobile'),
        nextImageContainers: host.querySelectorAll('.next-image-container').length,
        routeAreaClass: route.area.className,
        routeAreaY: route.area.getAttribute('data-y-desktop'),
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
      sceneClass: 'scene',
      textKey: 'quest.task9'
    });
  });

  test('dwor01 keeps stable page shell contract after helper cursor migration', async ({ page }) => {
    await page.goto('/dwor01.html');

    const contract = await page.evaluate(() => ({
      backAreaClass: document.querySelector('.custom-cursor-backarea')?.className,
      backTarget: document.querySelector('.custom-cursor-back')?.getAttribute('data-prev-page'),
      blackKlotskaAudioSrc: document.getElementById('bookSoundBlackKlotska')?.getAttribute('src'),
      blackKlotskaQuestImage: document.getElementById('black_klotska_quest')?.getAttribute('data-quest-image'),
      blackKlotskaQuestNumber: document.getElementById('black_klotska_quest')?.getAttribute('data-quest-number'),
      imageContainerMapPoint: document.querySelector('.image-container')?.getAttribute('data-map-point'),
      imageCount: document.querySelectorAll('.scene .image-scroll-wrapper > .image').length,
      kleckGateTextKey: document.getElementById('kleck-gate-text')?.getAttribute('data-i18n'),
      markerCount: document.querySelectorAll('.map-mark-area').length,
      nextImageContainers: document.querySelectorAll('.scene + .next-image-container, .scene .next-image-container').length,
      prostoAreaClass: document.querySelector('.custom-cursor-prostoarea')?.className,
      prostoTarget: document.querySelector('.custom-cursor-prosto')?.getAttribute('data-next-page'),
      sceneCount: document.querySelectorAll('.scene').length
    }));

    expect(contract).toEqual({
      backAreaClass: 'custom-cursor-backarea',
      backTarget: 'pk02.html',
      blackKlotskaAudioSrc: 'media/opening-a-book.wav',
      blackKlotskaQuestImage: 'media/tumski/dwor_08.jpg',
      blackKlotskaQuestNumber: '9',
      imageContainerMapPoint: '40',
      imageCount: 1,
      kleckGateTextKey: 'kleck_gate.title',
      markerCount: 2,
      nextImageContainers: 1,
      prostoAreaClass: 'custom-cursor-prostoarea',
      prostoTarget: 'dwor02.html',
      sceneCount: 1
    });
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
