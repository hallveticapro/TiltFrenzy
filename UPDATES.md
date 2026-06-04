# Updates

## 2026-06-04 - Implement local audit recommendations

### Summary

Implemented the audit items that could be completed locally in the repository. The changes keep Tilted client-only, preserve privacy defaults, improve deployment metadata defaults, automate service-worker cache naming, add a live production audit script, and document the remaining deployment-layer work that requires Cloudflare/reverse-proxy/domain access.

### Files Created

- `scripts/check-production.mjs`
- `scripts/stamp-service-worker.mjs`

### Files Updated

- `README.md`
- `AGENTS.md`
- `UPDATES.md`
- `package.json`
- `vite.config.ts`
- `deploy/40-runtime-metadata.sh`
- `public/_headers`
- `public/sw.js`
- `vercel.json`
- `scripts/verify-static.mjs`
- `src/components/DeckEditor.tsx`
- `src/services/roundHistory.ts`
- `src/services/roundHistory.test.ts`
- `src/styles/global.css`

### Commands Run

| Command | Result | Notes |
| ------- | ------ | ----- |
| `git status --short --branch` | Pass | Started clean on `main...origin/main`. |
| `npm ci` | Pass | Installed dependencies; 0 vulnerabilities reported. |
| `npm run typecheck` | Pass | Passed after rerun. The first parallel attempt raced with `npm ci` replacing `node_modules`. |
| `npm test -- --run` | Pass | 16 test files and 54 tests passed. |
| `npm test -- --run src/services/roundHistory.test.ts` | Pass | Targeted privacy-history regression test passed. |
| `npm run build` | Pass | Vite build passed and stamped `dist/sw.js` with cache `204bed1859c1`. |
| `npm run verify:static` | Pass | Verified headers, metadata, stamped service worker, and unresolved placeholders. |
| `npm audit --omit=dev --audit-level=moderate` | Pass | 0 vulnerabilities. |
| `npm audit` | Pass | 0 vulnerabilities. |
| `docker compose config` | Pass | Compose config resolved successfully. |
| `docker build -t tilted-audit-verify .` | Pass | Fresh image built with stamped service worker. |
| `docker compose build` | Pass | Compose image build completed. |
| `npm run verify:container` | Pass | Passed after fixing runtime metadata replacement order. |
| `npm run audit:production` | Expected fail | Live deployment still has GitHub-default metadata and `/sw.js` cache `max-age=14400`; HSTS preload warning remains. These require deployment/proxy changes or a redeploy outside the local repo. |

### Changes Made

- Implemented privacy-first saved history: team/player identifiers are stripped before writing round history to LocalStorage, and older stored history is sanitized on load.
- Added regression coverage proving saved history does not retain team/player identifiers while explicit in-memory CSV export can still include names when requested by code.
- Changed default build-time and Docker runtime social metadata from GitHub URLs to `https://tilted.mrhallsclass.com`.
- Fixed Docker runtime metadata replacement order so custom `TILTED_SHARE_IMAGE_URL` is honored even when it shares the public URL prefix.
- Added `scripts/stamp-service-worker.mjs` and wired it into `npm run build` so the service-worker cache name is generated from the built app shell.
- Updated static-host/Vercel `/sw.js` cache headers to `no-cache, must-revalidate`.
- Added `scripts/check-production.mjs` and `npm run audit:production` for repeatable live checks of headers, metadata, `/healthz`, and `/sw.js` caching.
- Added deck-editor copy warning that share links contain the full deck content.
- Set game-card prompt letter spacing to `0` for better classroom/projector readability.
- Updated README and AGENTS documentation for privacy behavior, service-worker stamping, production metadata defaults, and live deployment checks.

### Audit Items Implemented

- `MED-002`: Team/player names no longer persist in saved round history.
- `MED-003`: Repository defaults now point social metadata at the production Tilted URL and hosted cover image.
- `LOW-001`: Game prompts no longer inherit negative global heading letter spacing.
- `LOW-002`: Service-worker cache revisioning is now generated during build from shell asset content.
- `LOW-003`: Deck sharing now displays a warning that shared URLs include full deck content.
- `FUNC-001`: Privacy-first team history behavior implemented.
- `FUNC-002`: Production deployment audit command added.

### Audit Items Deferred

- `MED-001`: Live production `/sw.js` is still cached with `Cache-Control: max-age=14400`. Reason: fixing the observed live header requires Cloudflare, CDN, reverse-proxy, or server deployment access. Recommended manual next step: update the proxy/CDN rule for `/sw.js` to no-cache or must-revalidate, redeploy if needed, then run `npm run audit:production`.
- `MED-004`: Production HSTS includes `includeSubDomains; preload`. Reason: confirming or changing this requires domain/reverse-proxy ownership decisions outside the repository. Recommended manual next step: confirm every relevant `mrhallsclass.com` subdomain is permanently HTTPS-ready, or remove `preload`/`includeSubDomains` at the TLS-terminating layer.
- Real-device motion, installed-PWA update behavior, and projector/smartboard readability remain deferred because they require manual classroom-device testing.

### Follow-Up Needed

- Redeploy Tilted so production picks up the new default social metadata and runtime replacement fix.
- Update the production proxy/CDN cache rule for `/sw.js`.
- Confirm the domain-wide HSTS preload decision.
- Run `npm run audit:production` after deployment/proxy changes.
- Add browser-level smoke tests in a later pass if desired.

## 2026-06-04 - Initial repository audit and agent documentation

### Summary

Completed a documentation-only audit pass for Tilted using `TASKS.md` as the source of truth. Added future-agent guidance, a dated audit report, and this update log. No application code was changed.

### Files Created

- `AGENTS.md`
- `AUDIT-2026-06-04.md`
- `UPDATES.md`

### Files Updated

- `TASKS.md` was already present as an untracked root audit brief and remains at the root.
- Historical audit files were already under `references/`; no moves were needed.

### Commands Run

| Command | Result | Notes |
| ------- | ------ | ----- |
| `date +%F` | Pass | Returned `2026-06-04`. |
| `git status --short --branch` | Pass | `main...origin/main`; only `TASKS.md` untracked before new docs. |
| `git branch --show-current` | Pass | `main`. |
| `git remote -v` | Pass | `origin` fetch/push points to GitHub. |
| `rg --files` | Pass | Used to map repository files. |
| `npm ci` | Pass | Installed packages; 0 vulnerabilities reported. |
| `npm run typecheck` | Pass | TypeScript project build check passed. |
| `npm test -- --run` | Pass | 16 test files and 53 tests passed. |
| `npm run build` | Pass | Production build passed. |
| `npm run verify:static` | Pass | Static bundle verification passed. |
| `npm audit --omit=dev --audit-level=moderate` | Pass | 0 vulnerabilities. |
| `npm audit` | Pass | 0 vulnerabilities. |
| `npm outdated` | Pass | No outdated top-level packages reported. |
| `npm ls --depth=0` | Pass | Confirmed top-level dependency versions. |
| `docker --version` | Pass | Docker 29.4.2 available. |
| `docker compose version` | Pass | Compose v5.1.3 available. |
| `docker compose config` | Pass | Compose config resolved successfully. |
| `docker build -t tilted-audit-verify .` | Pass | Fresh Docker image built. |
| `docker compose build` | Pass | Compose image build completed. |
| `npm run verify:container` | Pass | Hardened container smoke test passed. |
| `gh --version` | Pass | GitHub CLI available. |
| `gh auth status` | Pass | Authenticated; token value not recorded. |
| `gh workflow list` | Pass | Verify app, Publish container, and Dependabot Updates active. |
| `gh run list --limit 5` | Pass | Latest `main` Verify and Publish runs succeeded. |
| `gh repo view --json nameWithOwner,isPrivate,defaultBranchRef,url` | Pass | Public repo, default branch `main`. |
| `gh api repos/hallveticapro/Tilted/branches/main/protection` | Pass | Branch protection requires `verify`; force pushes/deletions blocked. |
| `curl --head https://tilted.mrhallsclass.com` | Pass with notes | HTTP 200 and security headers present; HSTS preload observed. |
| `curl https://tilted.mrhallsclass.com/healthz` | Pass | Returned `ok`. |
| `curl https://tilted.mrhallsclass.com` | Pass with notes | HTML served; social metadata uses GitHub defaults. |
| `curl --head https://tilted.mrhallsclass.com/sw.js` | Pass with finding | HTTP 200, but `Cache-Control: max-age=14400`. |
| `curl --head https://tilted.mrhallsclass.com/assets/tilted-cover.png` | Pass | Asset served with long-lived caching. |
| `rg -n "replit|\.replit|replit\.nix|starter|template|scaffold" ...` | Pass with notes | No stale Replit/scaffold files found; active starter deck UI copy is intentional. |

### Changes Made

- Added `AGENTS.md` with project overview, commands, repo map, conventions, validation notes, security/privacy guidance, accessibility notes, deployment notes, and future-agent instructions.
- Added `AUDIT-2026-06-04.md` with required audit sections, validation results, current findings, functionality opportunities, deployment review, and roadmap.
- Added `UPDATES.md` to preserve a dated log of this audit pass.
- Confirmed old audits are already organized under `references/`.

### Git Commit and Push

- Initial audit documentation commit: `57d3e8a` (`Add Tilted audit and agent documentation`).
- Push result: succeeded to `origin/main`.
- Push note: GitHub reported the repository owner bypassed the pending required `verify` status check on direct push; fresh Verify app and Publish container workflow runs started after the push.

### Findings Documented But Not Fixed

- `MED-001`: Production `sw.js` is cached for four hours.
- `MED-002`: Team/player names can persist in LocalStorage round history on shared devices.
- `MED-003`: Production social metadata points at GitHub defaults.
- `MED-004`: Production HSTS preload policy needs domain-wide confirmation.
- `LOW-001`: Game prompts inherit negative global heading letter spacing.
- `LOW-002`: Service-worker cache revisioning is manual.
- `LOW-003`: Shared deck URLs contain full deck content in the fragment.

### Functionality Ideas Documented

- `FUNC-001`: Privacy-first team history mode.
- `FUNC-002`: Production deployment status checklist.
- `FUNC-003`: Browser-level smoke tests.
- `FUNC-004`: QR-friendly deck sharing.
- `FUNC-005`: Teacher session presets.

### Follow-Up Needed

- Fix production cache behavior for `/sw.js`.
- Set production social metadata environment values.
- Decide how team/player names should behave in persisted history.
- Confirm HSTS preload scope for `mrhallsclass.com`.
- Add browser-level smoke tests and real-device motion/PWA checks.
