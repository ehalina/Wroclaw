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
| Audio promise rejection handlers | `language_menu.js`, `index.html` | Replace `.catch(console.log)` with quiet debug-aware handler or no-op where intentional. | Stage 7.12 |
| One-line runtime init diagnostics | `spa_minimap_manager.js`, `firebase_config.js` | Gate or remove low-value success logs; preserve visible `console.error`. | Stage 7.13 |
| Legacy audio module | `background_music111.js` | Confirm runtime references. If unreferenced, remove as cleanup; if retained, gate diagnostics behind explicit audio debug flag. | Stage 7.14 |
| Standalone/debug pages | `katedra_panorama.html`, `audio_visibility_test.html` | Treat separately from core tour shell; either gate standalone diagnostics or document debug-page exception. | Stage 7.15 |

## Notes

- Do not treat test files, scripts, or tools as production console noise.
- Do not remove `console.error` in runtime failure paths.
- Keep each follow-up stage small enough to validate with `make smoke` or a narrower oracle plus `make audit`.
- Stage 7.11 closed only SPA route/hash diagnostics; audio promise rejections remain separate to avoid mixing navigation diagnostics with media policy.

## Validation

- Stage 7.10 is documentation/planning only.
- Validation target: `make audit`.
