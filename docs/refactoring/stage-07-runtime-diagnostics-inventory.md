# Stage 7.10 - Runtime diagnostics inventory

Дата: 2026-06-27

## Цель

Закрыть общий backlog item "remaining runtime diagnostics inventory": классифицировать оставшиеся active `console.log` / `console.warn` после Stage 7.9 и разнести их на безопасные follow-up этапы.

## Scan

Команда:

```bash
rg -n "^[^/]*(console\.log|console\.warn)" --glob "*.js" --glob "*.html" --glob "!tests/**" --glob "!scripts/**" --glob "!tools/**" --glob "!docs/**" --glob "!www/**" --glob "!node_modules/**" .
```

## Классификация

| Cluster | Files | Decision | Next stage |
|---|---|---|---|
| Already gated helper internals | `arrow_handlers.js`, `map_debug.js`, `user_account.js`, `user_database.js` | No action; these are logger implementations or fallback method lookup. | none |
| SPA shell diagnostics | `index.html` active SPA route/hash `console.log` | Done in Stage 7.11 via `spaDebugLog`; audio rejection handling split out below. | none |
| Audio promise rejection handlers | `language_menu.js`, `index.html` | Done in Stage 7.12 via `DEBUG_AUDIO` gated handlers; default expected promise rejections stay quiet. | none |
| One-line runtime init diagnostics | `spa_minimap_manager.js`, `firebase_config.js` | Done in Stage 7.13 via `DEBUG_MINIMAP` / `DEBUG_FIREBASE`; visible `console.error` paths preserved. | none |
| Legacy audio module | `background_music111.js` | Done in Stage 7.14; no active runtime references found, module deleted instead of gated. | none |
| Standalone/debug pages | `katedra_panorama.html`, `audio_visibility_test.html` | Done in Stage 7.15: panorama diagnostics gated via `DEBUG_PANORAMA`; `audio_visibility_test.html` documented as an intentional manual debug-page console mirror. | none |

## Notes

- Do not treat test files, scripts, or tools as production console noise.
- Do not remove `console.error` in runtime failure paths.
- Keep each follow-up stage small enough to validate with `make smoke` or a narrower oracle plus `make audit`.
- Stage 7.11 closed only SPA route/hash diagnostics; audio promise rejections remain separate to avoid mixing navigation diagnostics with media policy.
- Stage 7.12 closed active audio `.catch(console.log)` handlers in core shell/menu files; legacy audio module remains separate Stage 7.14.
- Stage 7.13 closed low-value minimap/Firebase init diagnostics; remaining CR-11 work is legacy audio module and standalone/debug page policy.
- Stage 7.14 removed the unreferenced legacy audio module; remaining CR-11 work is standalone/debug page policy.
- Stage 7.15 closed the final standalone/debug page diagnostics policy item; remaining visible runtime console output is limited to intentional `console.error` failure paths and the manual debug-page mirror.

## Validation

- Stage 7.10 is documentation/planning only.
- Validation target: `make audit`.
