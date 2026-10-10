# Venue Lost & Found: instructions for coding agents

A lost-and-found system for venues. Staff log found items, the public searches a redacted listing and
files lost reports, claims are verified with challenge questions built from private item details, and
admins see inventory, chain of custody and analytics. No external services: email/SMS go to a dev **Outbox** page.

## Rules (read first)

1. **Run `npm test` before finishing any task.** It must be green. Also run `npm run typecheck`.
2. **Files stay under ~300 lines.** Split by feature before you hit the limit.
3. **Prefer creating a new file over editing a big one.** Routes, categories and seed pieces are auto-discovered
   (see "Extension points"), so most features need no edits to existing files.
4. **Every module with logic gets a test** next to it (`*.test.ts` in `shared/`, `server/src/**` or `server/test/`).
5. **Never write large repetitive data inline.** Build records in code (see `server/src/seed/`).
6. Don't add dependencies without a strong reason. No external services, payments, AI features or real email/SMS.
7. Item state changes go through `transitionItem()` ONLY (`server/src/services/custody.ts`). Never `UPDATE items SET state`.
8. Public (unauthenticated) routes must never expose private attributes or photos. See "Privacy".
9. UI is Material 3 and fully offline: use `web/src/components/m3/*` and `--md-sys-*` tokens only. See "Design system".

## Commands

```bash
npm install
npm run dev        # API on :3001 and web on :5173 (Vite proxies /api)
npm run seed       # reset the DB and load the demo dataset (safe while dev is running)
npm test           # all workspaces
npm run typecheck  # all workspaces
npm test -w @vlf/server -- matching    # run tests matching a name
npm run build -w @vlf/web              # production build check
```

Seeded logins: `staff@venue.test` and `admin@venue.test`, password `demo1234`.
Env (all optional): `PORT`, `DB_PATH` (default `data/vlf.db`), `PHOTO_DIR` (default `data/photos`), `PUBLIC_URL`, `MATCH_THRESHOLD` (default 70),
`VISION_URL` / `VISION_MODEL` / `VISION_TIMEOUT_MS` (local vision model for photo intake, see README; `VISION_URL=off` disables).

## Architecture

TypeScript everywhere, npm workspaces, ESM. No build step for `shared` (consumed as TS source).

```
shared/src/                 pure code used by server AND web (no I/O)
  states.ts                 item state machine: the ONLY place transitions are defined
  colors.ts                 COLORS list
  schemas/*.ts              Zod schemas for API payloads (auth, item, report, claim)
  categories/schema.ts      category definition schema + defineCategory()
  categories/registry.ts    buildRegistry, resolveAttributes, buildChallenges, checkAnswer
  categories/defs/*.ts      ONE FILE PER CATEGORY (phone, wallet, keys, bag, ..., other). Auto-loaded.
server/src/
  main.ts / app.ts          bootstrap; buildApp({db, config}) builds Fastify + ctx
  context.ts                AppContext = { db, config, categories }  (available as app.ctx)
  db/                       connection, migrate.ts, migrations/NNN_*.sql (plain SQL, applied in order)
  repos/                    thin SQL helpers per table (items, claims, reports, venues)
  services/                 business logic: custody, intake, publicItems, retention, analytics,
                            photos, categoryLoader, claims/{create,submit,review,pickup}, matching/{score,run}
  routes/*.routes.ts        AUTO-REGISTERED under /api. Default-export a FastifyPluginAsync.
  auth/                     password (scrypt), sessions (cookie), guard (requireStaff / requireAdmin)
  notify/outbox.ts          sendNotification() writes to the notifications table
  seed/                     programmatic seed (run.ts entry, seedAll.ts orchestrates)
server/test/                API-level tests; helpers.ts (testApp, testDb) and fixtures.ts (makeVenue/Item/Bin/User, loginCookie)
web/src/                    Vite + React + react-router. api/ (fetch wrapper, useGet), auth/, lib/ (categoryIcon, colorSwatch, format),
                            theme/ (Material 3 tokens + vendored Roboto), components/m3/ (design system), components/<area>/, pages/{public,staff,admin,dev}
data/photos/                uploaded photos (gitignored)
```

### Item lifecycle

`found → stored → claim_pending → verified → released`, plus `disposed` (from found/stored).
`claim_pending → stored` (denied) and `verified → stored` (pickup expired) are allowed. Each change writes a
`custody_events` row (who, when, from, to, note) in the same transaction.

### Request flow for the main journey

1. Staff `POST /api/items` (multipart: `data` JSON + optional `photo`) → `services/intake.ts` → `runMatchingForItem`.
2. Public `POST /api/public/lost-reports` → `runMatchingForReport`. A score ≥ threshold creates a claim (hashed token) and an Outbox email with `/claim/<token>`.
   Or a visitor taps **This is mine** on a search result: `POST /api/public/items/:id/claims` (`services/claims/start.ts`) opens a claim
   on a stored item, emails the link and returns the token, so the questions show at once (claim creation is capped per item per hour).
3. Claimant `POST /api/public/claims/:token/answers` → item `claim_pending` (rate-limited per item).
4. Staff `GET /api/claims/:id` (answers beside the private record, each with an advisory match / close / differs verdict from
   `shared/src/categories/answerMatch.ts`: typo-tolerant, plural-aware, ignores filler words, numbers exact) → `POST /api/claims/:id/decision`.
5. Approved claim page shows a QR of `vlf:pickup:<claimToken>`. Staff `POST /api/pickup/lookup` then `/pickup/release` (`idChecked: true` required) → `released`. Single use.
6. Photo intake (optional): Intake downscales the photo and calls `POST /api/vision/describe` (staff). `services/vision/` sends it to a
   LOCAL OpenAI-compatible vision model (`client.ts`), with a prompt generated from the category plugins (`prompt.ts`), and validates
   the reply against the registry (`sanitize.ts`: known category, allowed color, real select options). The web merges it into
   empty fields only (`web/src/lib/applySuggestion.ts`). Nothing is stored; with no model running the UI hides the feature.
7. Retention job (hourly + manual) flags overdue items; admin batch-disposes via `POST /api/retention/dispose`.

## Extension points (add a file, edit nothing)

### New category: create `shared/src/categories/defs/<id>.ts`

```ts
import { defineCategory } from '../schema';

export default defineCategory({
  id: 'umbrella',             // lowercase letters/digits/underscore; must match the file name
  label: 'Umbrella',
  sensitive: false,           // true for IDs / payment cards: photos staff-only + blurred
  retentionDays: 60,
  fields: [
    // public: true  → shown in the public listing.  public: false → private, used for claim questions.
    { name: 'style', label: 'Style', type: 'select', options: ['Compact', 'Full-size', 'Golf', 'Other'], public: true, required: true },
    { name: 'pattern', label: 'Pattern / print', type: 'text', public: false, required: false },
    { name: 'handle', label: 'Handle', type: 'text', public: false, required: false },
  ],
  challengeTemplates: [
    // field MUST be a private field. match: 'contains' (token coverage) or 'exact'.
    { field: 'pattern', question: 'Describe the pattern or print on the umbrella.', match: 'contains' },
    { field: 'handle', question: 'What does the handle look like?', match: 'contains' },
  ],
});
```

It is picked up automatically by `server/src/services/categoryLoader.ts`, the intake form, public filters and claim
questions. `defineCategory` validates at import, so a bad file fails loudly. Add a test beside it
(`shared/src/categories/defs/<id>.test.ts`): import the default export, run it through `buildRegistry([def])`,
`resolveAttributes`, and `buildChallenges`. See `shared/src/categories/registry.test.ts` for the pattern.

### New API area: create `server/src/routes/<name>.routes.ts`

```ts
import type { FastifyPluginAsync } from 'fastify';
import { requireStaff } from '../auth/guard';

const routes: FastifyPluginAsync = async (app) => {
  const ctx = app.ctx;                       // { db, config, categories }
  app.get('/thing', async (req) => {         // served at /api/thing
    const user = requireStaff(ctx, req);     // throws 401; use requireAdmin for admin-only
    return ctx.db.prepare('SELECT ... WHERE venue_id = ?').all(user.venueId);
  });
};
export default routes;
```

Validate input with a Zod schema (put shared ones in `shared/src/schemas/`, export from `shared/src/index.ts`).
Throw `badRequest/notFound/forbidden/AppError` from `server/src/errors.ts`; the error handler maps them to JSON.
Schema change: add `server/src/db/migrations/NNN_name.sql` (never edit an applied migration).

### New web page: create `web/src/pages/<area>/<Name>.tsx`, then add ONE `<Route>` line in `web/src/App.tsx`
(and a nav link in `components/Layout.tsx` if needed). Use `useGet<T>('/path')` and `api.post(...)` from `web/src/api/`.

## Design system (Material 3, offline)

- **Tokens:** `web/src/theme/tokens.css` (color roles, light + dark, GENERATED from seed `#3F6FD8`, do not hand-edit), `typography.css`
  (`--md-sys-typescale-*`, `.md-typescale-*`), `system.css` (shape, elevation, motion, state layers, focus ring), `base.css`
  (reset + layout helpers `.md-stack`, `.md-row`, `.md-grid`, `.md-container`). Never use raw hex colors in components.
- **Components:** one per file in `web/src/components/m3/` with a co-located CSS file; import from the specific file
  (`import { Button } from '../../components/m3/Button'`). Live gallery of every component and state: **`/dev/components`**.
  Main ones: Button/LinkButton/IconButton/Fab, Card, List+ListItem, StatusChip, Alert, EmptyState, LinearProgress, Dialog,
  Snackbar (`useSnackbar().show(...)`), Menu, PageHeader, TextField (outlined, floating label), Select, Chips
  (FilterChip, ChoiceChips with color swatches, AssistChip), Checkbox, SegmentedButton, TopAppBar, NavigationBar/Rail.
- **Icons:** `<Icon name="..." />` from `components/m3/Icon.tsx`; paths are vendored in `components/m3/icons.ts`
  (Material Symbols, Apache 2.0). To add one, copy the single `d` path of the official 24px SVG into that map.
- **Fonts:** Roboto woff2 files are vendored in `web/src/theme/fonts/`. Nothing loads from the internet:
  `web/src/theme/offline.test.ts` fails on any external URL in web source.
- **Page contract:** root element `<div className="app-page">` (840px reading width) or `app-page app-page--wide` (1280px);
  start with `<PageHeader title=... />` (it also sets `document.title`). A page FAB is `<Fab className="app-fab" ... />`
  (add `md-only-compact` if the navigation rail already offers the action). Navigation destinations per role live in
  `web/src/components/nav.ts` (bottom bar < 600px, rail >= 600px, max 5 primary destinations).
- **Theme:** follows the OS; the moon/sun button in the top bar sets an explicit light/dark choice (`data-theme` on `<html>`).

## Privacy (do not break)

- Public routes live under `/api/public/*` and go through `services/publicItems.ts` (`toPublicItem` allow-lists fields).
- `server/test/publicLeak.test.ts` fails if any public response contains a private attribute value, photo name or photo URL.
  **When you add an unauthenticated GET route, add its URL to `PUBLIC_URLS` in that test.**
- Photos are only served by `GET /api/items/:id/photo` (staff session). Sensitive items send `no-store` and are blurred in staff UI.
- Claim and pickup tokens are stored hashed (`hashToken`). Claim questions never include expected answers.
- Matching (`services/matching/score.ts`) is a pure, deterministic function; keep it free of I/O. Tune weights in `defaultMatchConfig`.

## Testing patterns

- Pure logic: plain Vitest next to the file.
- API: `const { app, db } = await testApp()` (in-memory SQLite + real migrations), create data with `fixtures.ts`,
  log in with `loginCookie(app, email)`, call `app.inject({...})`. Multipart: see `server/test/intake.test.ts`.
- `server/test/demoFlow.test.ts` replays DEMO.md against the seed. If you change seed/demo data, keep it green.
- Seed constants for the scripted demo live in `server/src/seed/demo.ts`.
