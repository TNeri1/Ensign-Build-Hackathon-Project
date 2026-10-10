# TASKS: backlog for the local model

Small, independent tasks. Each one is a new file (or files) against an interface that already exists, plus a test.
Read `AGENTS.md` first. **Rules for every task:** keep files under ~300 lines; create new files rather than editing big
ones; run the acceptance command AND `npm test` AND `npm run typecheck` before you stop; do not touch files not listed.
Tasks are independent: do them in any order, one per commit.

**UI rules (Material 3):** build screens only from the components in `web/src/components/m3/` (live gallery at
`http://localhost:5173/dev/components`) and the `--md-sys-*` tokens; put page styles in a co-located `.css` file with
page-prefixed class names; never use raw hex colors or external URLs (`web/src/theme/offline.test.ts` enforces it).
Start each page with `<PageHeader title=... />` inside `<div className="app-page">` (or `app-page app-page--wide`).

Task numbering: T1-T7 are features. All planned categories are built (see below).

---

## Categories (done)

Built: phone, wallet, keys, bag, clothing, id_card (sensitive), payment_card (sensitive), laptop, water_bottle, headphones,
and **other** (catch-all: public `item_type` says what it is; the photo reader picks it when nothing specific fits).

**To add another category `<id>`** (e.g. umbrella, glasses, toy):
1. Create `shared/src/categories/defs/<id>.ts` modelled on `headphones.ts`: `export default defineCategory({...})` with `id`
   (= file name), `label`, `sensitive`, `retentionDays`, `fields` (each `public` or private; `select` needs `options`) and
   `challengeTemplates` (only on private fields).
2. Create `shared/src/categories/defs/<id>.test.ts` from the template below.
3. Optional: give it an icon in `web/src/lib/categoryIcon.ts` (one line; icon names in `web/src/components/m3/icons.ts`).
Nothing else: the server, intake form, search filters, claim questions and the photo reader's prompt pick it up automatically.

**Test template** (`shared/src/categories/defs/<id>.test.ts`):

```ts
import { describe, it, expect } from 'vitest';
import { buildRegistry, buildChallenges, resolveAttributes } from '../registry';
import def from './<id>';

describe('<id> category', () => {
  it('registers with the expected flags', () => {
    const reg = buildRegistry([def]);
    expect(reg.get('<id>')).toMatchObject({ sensitive: <true|false>, retentionDays: <N> });
  });
  it('rejects a submission missing a required field', () => {
    const required = def.fields.filter((f) => f.required);
    expect(resolveAttributes(def, {}).errors).toHaveLength(required.length);
  });
  it('builds a challenge for each private field that has a template', () => {
    const priv = Object.fromEntries(def.fields.filter((f) => !f.public).map((f) => [f.name, 'x']));
    expect(buildChallenges(def, priv).map((c) => c.field)).toEqual(def.challengeTemplates.map((t) => t.field));
  });
  it('never asks about public fields', () => {
    const publicNames = new Set(def.fields.filter((f) => f.public).map((f) => f.name));
    expect(def.challengeTemplates.every((t) => !publicNames.has(t.field))).toBe(true);
  });
});
```

**Acceptance:** `npm test -w @vlf/shared -- <id>` shows `4 passed`; then `npm test` and `npm run typecheck` are green.

---

## Feature tasks (T1-T7)

### T1. Outbox: copy claim link

- **Goal:** each Outbox message that contains a claim link gets a "Copy link" button, so the demo can paste it into another device.
- **Files to create:**
  - `web/src/lib/links.ts`: `export function extractLinks(body: string): string[]` returning every `http(s)://...` URL in order (no duplicates).
  - `web/src/lib/links.test.ts`: no links, one, several, duplicates, trailing punctuation (`...link.` -> without the dot).
  - `web/src/components/CopyButton.tsx`: `export function CopyButton({ text, label = 'Copy link' }: { text: string; label?: string })` rendering the m3 `Button` (variant "text", icon "content_copy"); on click `navigator.clipboard.writeText(text)` then `useSnackbar().show('Link copied')` (catch errors -> `show('Could not copy', { kind: 'error' })`).
- **Small edit (exact location):** `web/src/pages/Outbox.tsx`, inside each message card, directly after the element that renders the message body: render `{extractLinks(m.body).filter((u) => u.includes('/claim/')).map((u) => <CopyButton key={u} text={u} />)}` and import both.
- **Acceptance:** `npm test -w @vlf/web -- links` passes; `npm run build -w @vlf/web` succeeds.

### T2. Bin QR label sheet (print all bins)

- **Goal:** print all bin labels on one page in a grid (2 columns x 4 rows per page).
- **Files to create:**
  - `web/src/lib/chunk.ts`: `export function chunk<T>(xs: T[], size: number): T[][]` (+ `chunk.test.ts`: empty, exact multiple, remainder, size <= 0 throws).
  - `web/src/pages/staff/BinLabelSheet.tsx` + `BinLabelSheet.css`: fetch `useGet<Bin[]>('/bins')` (type in `web/src/api/types.ts`); `PageHeader` "Print bin labels" with a `Button` icon "print" calling `window.print()`; pages of 8 labels via `chunk`; each label = `<QrCode value={`vlf:bin:${code}`} size={140} />` (`web/src/components/QrCode.tsx`) + bin code + label text. Print CSS (in your css file): black on white, `page-break-after: always` per page, hide the header/buttons with `@media print`.
- **Small edits (exact locations):**
  1. `web/src/App.tsx`: import the page and add `<Route path="staff/bins/labels" element={staff(<BinLabelSheet />)} />` ABOVE the `staff/bins/:code/label` route.
  2. `web/src/pages/staff/Bins.tsx`: in the `PageHeader`'s `actions`, add `<LinkButton to="/staff/bins/labels" variant="tonal" icon="print">Print all labels</LinkButton>` (import from `../../components/m3/LinkButton`).
- **Acceptance:** `npm test -w @vlf/web -- chunk` passes; `npm run build -w @vlf/web` succeeds.

### T3. Admin CSV export

- **Goal:** admins can download all items as CSV.
- **Files to create:**
  - `server/src/services/csv.ts`: `export function toCsv(rows: Record<string, unknown>[], columns: string[]): string`. RFC 4180 quoting (quote cells containing `,` `"` or newlines; double the quotes), `\r\n` line endings, header row first. **Spreadsheet-injection guard:** a string cell starting with `=`, `+`, `-` or `@` is prefixed with `'`.
  - `server/src/services/csv.test.ts`: quoting, embedded quotes/newlines, null/undefined -> empty, injection guard, empty rows -> header only.
  - `server/src/routes/export.routes.ts`: `GET /admin/export/items.csv` (`requireAdmin`). Columns: `id,category,color,state,found_area,found_at,bin,released_at`. `bin` = bin code (LEFT JOIN `storage_bins`); `released_at` = `at` of the item's `custody_events` row with `to_state='released'` (or empty). Headers `content-type: text/csv; charset=utf-8` and `content-disposition: attachment; filename="items.csv"`. No private attributes or photo paths.
  - `server/test/export.test.ts`: `testApp` + fixtures (see `server/test/analytics.test.ts`): 401 without login, 403 for staff, 200 for admin with header + one row per item, no private attribute value in the body.
- **Small edit (exact location):** `web/src/pages/admin/Dashboard.tsx`, in the `PageHeader`'s `actions` next to the Retention `LinkButton`, add `<Button variant="text" icon="outbox" onClick={() => { window.location.href = '/api/admin/export/items.csv'; }}>Export CSV</Button>` (import `Button` from `../../components/m3/Button`).
- **Acceptance:** `npm test -w @vlf/server -- csv` and `npm test -w @vlf/server -- export` pass.

### T4. Retention settings page (per-category overrides)

- **Goal:** admins can override a category's `retentionDays` without editing code.
- **Files to create:**
  - `server/src/db/migrations/003_retention_overrides.sql`: `CREATE TABLE retention_overrides (category TEXT PRIMARY KEY, days INTEGER NOT NULL CHECK (days > 0));`
  - `server/src/services/retentionSettings.ts`: `getOverrides(db)`, `setOverride(db, category, days)`, `clearOverride(db, category)`, `effectiveRetentionDays(ctx: AppContext, category: string): number | undefined` (override if present, else the category's `retentionDays`).
  - `server/src/routes/retention-settings.routes.ts`: `GET /retention/settings` (staff) -> `[{ category, label, defaultDays, overrideDays | null, effectiveDays }]`; `PUT /retention/settings/:category` body `{ days: number | null }` (admin only; `null` clears; unknown category -> 400; `days` <= 0 or > 3650 -> 400).
  - `server/test/retentionSettings.test.ts`.
  - `web/src/pages/admin/RetentionSettings.tsx` (+ `.css`): `PageHeader` "Retention settings" (back="/admin/retention"); an outlined `Card` per category with the default, a `TextField type="number"` for the override, and `Button`s Save / Reset; results via `useSnackbar`.
- **Small edits (exact locations):**
  1. `server/src/services/retention.ts`, function `findOverdue`: replace `const days = ctx.categories.get(r.category)?.retentionDays;` with `const days = effectiveRetentionDays(ctx, r.category);` and add the import.
  2. `web/src/App.tsx`: import the page and add `<Route path="admin/retention/settings" element={<RequireRole role="admin"><RetentionSettings /></RequireRole>} />` ABOVE the `admin/retention` route.
  3. `web/src/pages/admin/Retention.tsx`: in the `PageHeader`'s `actions`, add `<LinkButton to="/admin/retention/settings" variant="text" icon="schedule">Settings</LinkButton>`.
- **Interface it must satisfy:** with an override of 5 days on `phone`, a phone found 6 days ago is returned by `findOverdue`; after `clearOverride` it is not.
- **Acceptance:** `npm test -w @vlf/server -- retention` passes (existing `retention.test.ts` AND your new test).

### T5. Found-location heatmap view

- **Goal:** show when and where items are found as a grid (areas x hour of day), darker = more items.
- **Files to create:**
  - `server/src/services/heatmap.ts`: `export function computeHeatmap(db: Db, venueId: string): { areas: string[]; hours: number[]; cells: number[][]; max: number }`. `areas` = up to 12 areas by total count desc (ties alphabetical); `hours` = `[0..23]`; `cells[a][h]` = items whose `found_at` falls in UTC hour `h` of area `a`; `max` = largest cell (0 if none).
  - `server/src/services/heatmap.test.ts`: uses `testDb()` from `server/test/helpers.ts` and `makeVenue/makeItem` from `server/test/fixtures.ts`.
  - `server/src/routes/heatmap.routes.ts`: `GET /admin/heatmap` (`requireAdmin`).
  - `web/src/components/admin/Heatmap.tsx` (+ `.css`): CSS grid; cell background `color-mix(in srgb, var(--md-sys-color-primary) calc(count/max*100%), var(--md-sys-color-surface-container-highest))` (compute the percentage in TSX); `title` = `"<area> <hour>:00 - <count>"`; area labels in `md-typescale-label-medium`.
  - `web/src/pages/admin/HeatmapPage.tsx`: `PageHeader` "Heatmap" (back="/admin") + the heatmap inside an outlined `Card`; wrap in `app-page app-page--wide`.
- **Small edits (exact locations):** `web/src/App.tsx` add route `admin/heatmap` (admin-guarded, same pattern as `admin/retention`); `web/src/pages/admin/Dashboard.tsx` add `<LinkButton to="/admin/heatmap" variant="text" icon="bar_chart">Heatmap</LinkButton>` to the `PageHeader` actions.
- **Acceptance:** `npm test -w @vlf/server -- heatmap` passes (empty venue, ordering, counts per hour, cap of 12 areas). `npm run build -w @vlf/web` succeeds.

### T6. Verified-claim expiry job

- **Goal:** if an approved claim is not picked up within N days, return the item to `stored` and mark the claim expired.
- **Files to create:**
  - `server/src/services/claimExpiry.ts`: `export function expireStaleClaims(ctx: AppContext, now = new Date(), maxAgeDays = 7): number`. For each claim with `status='approved'` and `decided_at` older than `maxAgeDays`: in one transaction set the claim `status='denied'`, `decision_reason='Pickup window expired'`, and call `transitionItem(ctx.db, itemId, 'stored', { userId: null, label: 'system' }, 'Pickup window expired')` (`verified -> stored` already exists). Return the count.
  - `server/src/services/claimExpiry.test.ts`: `testApp()` + fixtures; create an item, a claim row via SQL (see `server/src/services/claims/create.ts` for columns), move the item `stored -> claim_pending -> verified` with `transitionItem`, then assert expiry only affects claims older than the cutoff and writes a custody event.
- **Small edit (exact location):** `server/src/main.ts`, after `startRetentionTimer(app.ctx);` add `setInterval(() => expireStaleClaims(app.ctx), 3_600_000).unref();` and import it.
- **Acceptance:** `npm test -w @vlf/server -- claimExpiry` passes.

### T7. Inventory text search

- **Goal:** staff can type to filter the inventory by area, category or bin, on top of the existing state chips.
- **Files to create:**
  - `web/src/lib/filterItems.ts`: `export function matchesQuery(item: ItemListRow, query: string): boolean` (case-insensitive substring over `category`, `color`, `foundArea`, `binCode`; empty query matches all). `ItemListRow` is in `web/src/api/types.ts`.
  - `web/src/lib/filterItems.test.ts`.
- **Small edit (exact location):** `web/src/pages/staff/ItemList.tsx`: add `const [query, setQuery] = useState('')`; render `<TextField label="Search inventory" value={query} onChange={setQuery} leadingIcon="search" />` (from `../../components/m3/TextField`) directly above the state filter chips; change the `shown` computation to also apply `.filter((i) => matchesQuery(i, query))`.
- **Acceptance:** `npm test -w @vlf/web -- filterItems` passes; `npm run build -w @vlf/web` succeeds.
