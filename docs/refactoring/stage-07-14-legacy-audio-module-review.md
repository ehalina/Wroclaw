# Stage 7.14 - Legacy audio module review

Дата: 2026-06-27

## Цель

Закрыть follow-up из CR-11: проверить `background_music111.js`, подтвердить runtime references и выбрать безопасное действие: удалить legacy module или gate diagnostics.

## Evidence

Команды:

```bash
rg -n "background_music111|background_music|town_music_handler|controlMusic|switchMusic|directMusicAudio" . --glob "!www/**" --glob "!node_modules/**" --glob "!.git/**"
rg -n "background_music111\.js|background_music\.js|town_music_handler\.js" *.html *.js *.md docs/refactoring/*.md --glob "!project-context.md" --glob "!www/**"
```

Результат:

- `background_music111.js` has no active runtime HTML/script reference.
- Runtime references found by scan are either commented script tags for other legacy modules or references inside `background_music111.js` itself.
- `AUDIO_VISIBILITY_README.md` was the only source doc claiming direct integration with `background_music111.js`.

## Decision

Delete `background_music111.js` instead of adding a debug gate.

Reason:

- gating unused code would keep dead runtime surface in the repo;
- current SPA audio owner is `index.html` / `language_menu.js` / `visibility_audio_manager.js`;
- `visibility_audio_manager.js` already tracks dynamically added audio through MutationObserver and manual registration.

## Validation

- Expected validation target: `make smoke` and `make audit`.
