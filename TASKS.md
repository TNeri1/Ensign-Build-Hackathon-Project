# TASKS: backlog for the local model

Small, independent tasks. Each one is a new file (or files) against an interface that already exists, plus a test.
Read `AGENTS.md` first. **Rules for every task:** keep files under ~300 lines; create new files rather than editing big
ones; run the acceptance command AND `npm test` AND `npm run typecheck` before you stop; do not touch files not listed.
Tasks are independent: do them in any order, one per commit.

**UI rules (Material 3):** build screens only from the components in `web/src/components/m3/` (live gallery at
`http://localhost:5173/dev/components`) and the `--md-sys-*` tokens; put page styles in a co-located `.css` file with
page-prefixed class names; never use raw hex colors or external URLs (`web/src/theme/offline.test.ts` enforces it).
Start each page with `<PageHeader title=... />` inside `<div className="app-page">` (or `app-page app-page--wide`).

Task numbering: C1-C8 are categories, T1-T7 are features.

---

## Category tasks (C1-C8)

All eight follow the same recipe. The specs below are already validated against the schema (they load and produce challenges), so copy them exactly.

**Recipe (for category `<id>`):**
1. Create `shared/src/categories/defs/<id>.ts` modelled on `phone.ts` (same folder): `export default defineCategory({...})` with
   `id`, `label`, `sensitive`, `retentionDays`, `fields` (from the field table) and `challengeTemplates` (from the challenge table).
   Field `type` is omitted when it is `text`. A `select` field needs `options`. File name must equal `id`.
2. Create `shared/src/categories/defs/<id>.test.ts` (copy the template below, change the import and expectations).
3. Nothing else: the server loads every file in `defs/`, and the web form/filters/claim questions pick it up from the API.

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

**Acceptance (every category task):** `npm test -w @vlf/shared -- <id>` shows `4 passed`; then `npm test -w @vlf/server -- categories`
passes (it loads every category file); then `npm test` and `npm run typecheck` are green.

### C1. Category `keys`

- **Goal:** add the `keys` category ("Keys").
- **Files to create:** `shared/src/categories/defs/keys.ts`, `shared/src/categories/defs/keys.test.ts`
- **Interface:** `defineCategory` from `shared/src/categories/schema.ts`. `id: 'keys'`, `label: 'Keys'`, `sensitive: false`, `retentionDays: 60`.
- **Acceptance:** `npm test -w @vlf/shared -- keys` → `4 passed`.

| name | label | type | visibility | required |
|---|---|---|---|---|
| `key_type` | Key type | select (House, Car, Office, Other) | public | yes |
| `brand` | Brand (car fob / lock) | text | public | no |
| `keychain` | Keychain or fob description | text | private | yes |
| `key_count` | Number of keys | number | private | no |

Challenge templates:

| field | question | match |
|---|---|---|
| `keychain` | Describe the keychain or fob attached. | contains |
| `key_count` | How many keys are on the ring? | exact |

### C2. Category `bag`

- **Goal:** add the `bag` category ("Bag").
- **Files to create:** `shared/src/categories/defs/bag.ts`, `shared/src/categories/defs/bag.test.ts`
- **Interface:** `defineCategory` from `shared/src/categories/schema.ts`. `id: 'bag'`, `label: 'Bag'`, `sensitive: false`, `retentionDays: 90`.
- **Acceptance:** `npm test -w @vlf/shared -- bag` → `4 passed`.

| name | label | type | visibility | required |
|---|---|---|---|---|
| `bag_type` | Bag type | select (Backpack, Handbag, Tote, Duffel, Other) | public | yes |
| `brand` | Brand | text | public | no |
| `contents` | Contents (two items) | text | private | yes |
| `marking` | Tag, patch or marking | text | private | no |
| `tag_name` | Name on luggage tag | text | private | no |

Challenge templates:

| field | question | match |
|---|---|---|
| `contents` | Name two items inside the bag. | contains |
| `marking` | Describe any tag, patch or marking on the bag. | contains |
| `tag_name` | What name is on the luggage tag? | contains |

### C3. Category `clothing`

- **Goal:** add the `clothing` category ("Clothing").
- **Files to create:** `shared/src/categories/defs/clothing.ts`, `shared/src/categories/defs/clothing.test.ts`
- **Interface:** `defineCategory` from `shared/src/categories/schema.ts`. `id: 'clothing'`, `label: 'Clothing'`, `sensitive: false`, `retentionDays: 60`.
- **Acceptance:** `npm test -w @vlf/shared -- clothing` → `4 passed`.

| name | label | type | visibility | required |
|---|---|---|---|---|
| `garment` | Garment | select (Jacket, Sweater, Shirt, Pants, Hat, Scarf, Shoes, Other) | public | yes |
| `size` | Size | text | public | no |
| `brand` | Brand label | text | private | yes |
| `pocket_contents` | What is in the pockets | text | private | no |
| `marking` | Name tag, stain or damage | text | private | no |

Challenge templates:

| field | question | match |
|---|---|---|
| `brand` | What brand label is on it? | contains |
| `pocket_contents` | What was in the pocket? | contains |
| `marking` | Describe any name tag, stain or damage. | contains |

### C4. Category `id_card`

- **Goal:** add the `id_card` category ("ID card").
- **Files to create:** `shared/src/categories/defs/id_card.ts`, `shared/src/categories/defs/id_card.test.ts`
- **Interface:** `defineCategory` from `shared/src/categories/schema.ts`. `id: 'id_card'`, `label: 'ID card'`, `sensitive: true`, `retentionDays: 30`.
- **Acceptance:** `npm test -w @vlf/shared -- id_card` → `4 passed`.  Sensitive: photos are staff-only and blurred automatically; do not add anything extra.

| name | label | type | visibility | required |
|---|---|---|---|---|
| `card_type` | Card type | select (Driver license, Student ID, Employee badge, Passport, Other) | public | yes |
| `holder_name` | Name on card | text | private | yes |
| `id_last4` | Last 4 characters of ID number | text | private | yes |
| `date_of_birth` | Date of birth (YYYY-MM-DD) | text | private | no |
| `issuer` | Issuer (school, employer, state) | text | private | no |

Challenge templates:

| field | question | match |
|---|---|---|
| `holder_name` | What name is on the card? | contains |
| `id_last4` | What are the last four characters of the ID number? | exact |
| `date_of_birth` | What is the date of birth on the card (YYYY-MM-DD)? | exact |
| `issuer` | Who issued the card? | contains |

### C5. Category `payment_card`

- **Goal:** add the `payment_card` category ("Payment card").
- **Files to create:** `shared/src/categories/defs/payment_card.ts`, `shared/src/categories/defs/payment_card.test.ts`
- **Interface:** `defineCategory` from `shared/src/categories/schema.ts`. `id: 'payment_card'`, `label: 'Payment card'`, `sensitive: true`, `retentionDays: 30`.
- **Acceptance:** `npm test -w @vlf/shared -- payment_card` → `4 passed`.  Sensitive: photos are staff-only and blurred automatically; do not add anything extra.

| name | label | type | visibility | required |
|---|---|---|---|---|
| `card_network` | Card network | select (Visa, Mastercard, Amex, Discover, Other) | public | yes |
| `card_kind` | Card kind | select (Credit, Debit, Gift) | public | no |
| `last4` | Last 4 digits | text | private | yes |
| `cardholder_name` | Cardholder name | text | private | yes |
| `issuing_bank` | Issuing bank | text | private | yes |

Challenge templates:

| field | question | match |
|---|---|---|
| `last4` | What are the last four digits of the card number? | exact |
| `cardholder_name` | What name is printed on the card? | contains |
| `issuing_bank` | Which bank issued the card? | contains |

### C6. Category `laptop`

- **Goal:** add the `laptop` category ("Laptop").
- **Files to create:** `shared/src/categories/defs/laptop.ts`, `shared/src/categories/defs/laptop.test.ts`
- **Interface:** `defineCategory` from `shared/src/categories/schema.ts`. `id: 'laptop'`, `label: 'Laptop'`, `sensitive: false`, `retentionDays: 90`.
- **Acceptance:** `npm test -w @vlf/shared -- laptop` → `4 passed`.

| name | label | type | visibility | required |
|---|---|---|---|---|
| `brand` | Brand | select (Apple, Dell, HP, Lenovo, Asus, Microsoft, Other) | public | yes |
| `screen_size` | Screen size (inches) | number | public | no |
| `model` | Model | text | private | yes |
| `serial_suffix` | Last 4 of serial number | text | private | no |
| `stickers` | Stickers or decals | text | private | no |

Challenge templates:

| field | question | match |
|---|---|---|
| `model` | What model is the laptop? | contains |
| `serial_suffix` | What are the last four characters of the serial number? | exact |
| `stickers` | Describe any stickers or decals on the lid. | contains |

### C7. Category `water_bottle`

- **Goal:** add the `water_bottle` category ("Water bottle").
- **Files to create:** `shared/src/categories/defs/water_bottle.ts`, `shared/src/categories/defs/water_bottle.test.ts`
- **Interface:** `defineCategory` from `shared/src/categories/schema.ts`. `id: 'water_bottle'`, `label: 'Water bottle'`, `sensitive: false`, `retentionDays: 45`.
- **Acceptance:** `npm test -w @vlf/shared -- water_bottle` → `4 passed`.

| name | label | type | visibility | required |
|---|---|---|---|---|
| `material` | Material | select (Stainless steel, Plastic, Glass, Other) | public | yes |
| `brand` | Brand | text | public | no |
| `stickers` | Stickers or decals | text | private | yes |
| `damage` | Dents or damage | text | private | no |
| `name_label` | Name written on it | text | private | no |

Challenge templates:

| field | question | match |
|---|---|---|
| `stickers` | Describe the stickers or decals on the bottle. | contains |
| `damage` | Describe any dents or damage. | contains |
| `name_label` | Is a name written on the bottle? What is it? | contains |

### C8. Category `headphones`

- **Goal:** add the `headphones` category ("Headphones").
- **Files to create:** `shared/src/categories/defs/headphones.ts`, `shared/src/categories/defs/headphones.test.ts`
- **Interface:** `defineCategory` from `shared/src/categories/schema.ts`. `id: 'headphones'`, `label: 'Headphones'`, `sensitive: false`, `retentionDays: 60`.
- **Acceptance:** `npm test -w @vlf/shared -- headphones` → `4 passed`.

| name | label | type | visibility | required |
|---|---|---|---|---|
| `style` | Style | select (Over-ear, On-ear, Earbuds, Other) | public | yes |
| `brand` | Brand | text | public | no |
| `model` | Model | text | private | yes |
| `case_description` | Case description | text | private | no |
| `engraving` | Engraving or marking | text | private | no |

Challenge templates:

| field | question | match |
|---|---|---|
| `model` | What model are the headphones? | contains |
| `case_description` | Describe the carrying case, if any. | contains |
| `engraving` | Is there an engraving or marking? What does it say? | contains |

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
