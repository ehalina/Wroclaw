# Stage 5.7 - Page Block Inventory

Дата: 2026-06-27

## Цель

Зафиксировать повторяющиеся HTML-блоки перед введением shared page helper. Это inventory не меняет runtime behavior и служит входом для следующего маленького refactoring step.

## Scope

Проверены top-level `*.html` страницы проекта: 59 файлов.

Основное стабильное семейство интерактивных страниц:

- `tumski*.html`: 24 страницы;
- `dwor*.html`: 13 страниц;
- `ogrod*.html`: 10 страниц;
- `pk01.html`, `pk02.html`, `minsk01.html`, `minsk02.html`: 4 страницы.

Итого: 51 страница с обычным page shell (`data-map-point` + `tumski_init.js`).

## Повторяющиеся блоки

### Head / scripts

- `i18n.js` и `common.js`: 54 страницы.
- `language_menu.js` и `map_modal.js`: 52 страницы.
- `tumski_init.js`: 51 страница.
- `data-map-point`: 51 страница.
- `visibility_audio_manager.js`: 3 страницы (`index.html`, `tumski.html`, `audio_visibility_test.html`).
- Firebase compat SDK: 2 страницы (`index.html`, `tumski02.html`).

Типовой head для интерактивных страниц:

- `styles.css`;
- `common_tumski.css`;
- page-specific css (`tumskiNN.css`, `dworNN.css`, `ogrodNN.css`, etc.);
- Google fonts `Marck Script` и `Roboto`;
- `i18n.js`;
- `common.js`;
- `arrow_handlers.js`;
- `book_paths.js`;
- `common_buttons.js`;
- `language_menu.js`;
- `map_modal.js`;
- page/module handlers;
- `map_points.js`;
- body-end `tumski_init.js`.

### Body shell

- Scene structure повторяется вокруг `div.scene`, `div.image-container[data-map-point]`, `div.image-scroll-wrapper`, `div.image`, `div.next-image-container`.
- Cursor route pairs повторяются в 55 HTML-файлах, включая debug/standalone pages:
  - `custom-cursor` + `custom-cursor-area`;
  - `custom-cursor-prosto` + `custom-cursor-prostoarea`;
  - `custom-cursor-left` + `custom-cursor-leftarea`;
  - `custom-cursor-back` + `custom-cursor-backarea`;
  - variants like `custom-cursor-prosto-left`.
- `map-mark-area` встречается в 45 страницах.
- Marker blocks обычно повторяют:
  - `.map-mark` с desktop/mobile coordinates;
  - `.content-wrapper`;
  - `.papera-image`;
  - `.tumski-text[data-i18n]`;
  - optional `audio[src="media/opening-a-book.wav"]`;
  - optional quest data attrs.

## Исключения

- `index.html` - SPA shell, audio unlock owner, Firebase/account/admin scripts, iframe lifecycle. Не мигрировать вместе с content pages.
- `tumski.html` - первая content page, имеет inline parent-message/audio unlock compatibility handler и `visibility_audio_manager.js`.
- `tumski02.html` - content page, но дополнительно подключает Firebase/account/admin scripts.
- `katedra_01.html` и `katedra_panorama.html` - standalone/panorama pages с inline styles/scripts.
- `panorama.html`, `sunset_parallax.html`, `audio_visibility_test.html`, `debug_styles.html`, `quick_test.html` - standalone/test/debug pages, не входят в первый shared helper rollout.

## Candidate Data Shape

Для будущего shared helper минимально нужны только данные, которые сейчас реально повторяются:

- page css filename;
- optional page handler module list;
- `data-map-point`;
- route cursor descriptors:
  - kind/class pair;
  - desktop/mobile coordinates;
  - `data-next-page` или `data-prev-page`;
- marker descriptors:
  - id;
  - desktop/mobile coordinates;
  - translation key;
  - optional `bookSound` id;
  - optional quest number/image;
  - optional gnome id/image.

## Safe Rollout Order

1. Создать shared helper как additive module/global без миграции страниц.
2. Добавить Playwright smoke на helper output for one synthetic page fragment.
3. Мигрировать одну низкорисковую страницу из стабильного семейства, предпочтительно страницу без Firebase, inline script и специальных handlers.
4. После smoke сравнить DOM selectors/classes/attrs для мигрированной страницы.
5. Только после этого решать, расширять ли миграцию на семейства `dwor`, `ogrod`, `tumski`.

## Первый кандидат

`dwor01.html` подходит лучше, чем `tumski.html`/`tumski02.html`:

- входит в стабильное `data-map-point` + `tumski_init.js` семейство;
- не содержит Firebase;
- не содержит inline parent-message handler;
- имеет обычные markers, scene shell и route cursors.

Перед миграцией нужно отдельно зафиксировать exact DOM contract для:

- `.scene`;
- `.image-container[data-map-point]`;
- `.custom-cursor-*` pairs;
- `.map-mark-area`;
- `.tumski-text[data-i18n]`;
- marker audio ids.
