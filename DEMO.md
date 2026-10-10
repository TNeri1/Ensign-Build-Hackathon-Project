# DEMO: 3-minute script

Story: a visitor lost a black iPhone at Gate 3 and filed a report. Staff later find it, the system notifies her, she proves
it is hers, staff hand it over, and every step is on the record. Everything below uses the seed data; the whole flow is
replayed by `server/test/demoFlow.test.ts`, so if that test is green this script works.

## Before you go on stage

```bash
npm install
npm run seed          # resets the DB to the demo dataset (safe to re-run any time, even while the app is running)
npm run dev           # API :3001, web :5173
```

| Who | Where | Login |
|---|---|---|
| **Staff** (laptop, `http://localhost:5173`) | tab 1 | `staff@venue.test` / `demo1234` |
| **Admin** (second browser profile or private window) | tab 2 | `admin@venue.test` / `demo1234` |
| **Claimant** (phone or a third window) | tab 3 | no login: just the claim link |
| **Outbox** | tab 4: `/outbox` (auto-refreshes every 3 s) | none |

- Using a real phone for the claimant? Start the app with `PUBLIC_URL=http://<laptop-LAN-IP>:5173 npm run dev` so the link in the
  Outbox opens on the phone, and join the same wifi (or the laptop's hotspot; venue wifi is not needed).
- **Camera scan needs a secure context** (`localhost` or https). So: the claimant's QR is shown on the phone and scanned by
  the **laptop's webcam** on `localhost`. If the camera is flaky, the Pickup page has a paste-the-code box (see Fallbacks).
- Pre-flight (30 s): the Outbox is empty, **Staff → Lost reports** lists 3 reports, and the staff inventory shows 25 items.
- Have a pen ready: the photo step takes a picture of anything (phone camera) or skip it.

## The script

### 0:00 – 0:25 | The problem and the existing report
- **Say:** "Venues lose hundreds of items a season. Owners can't describe them safely in public, and staff can't prove ownership."
- **Show (public site, tab 3 or any window):** `Search` → filter *Phone*. Point out: only category, color, area and date. No photos, no model,
  nothing an impostor could copy. "Private details never leave staff screens."
- **Show (tab 1, Staff → Lost reports):** the report from `lena.ortiz@example.com`: **phone · black · Gate 3**, "Black iPhone with a clear case".
  "Lena filed this earlier. The Outbox is empty: nothing has matched yet."

### 0:25 – 1:05 | Staff live intake (target < 20 s)
On the **phone** (or a narrow browser window), tab 1 → tap **Log item** (the floating button bottom-right on a phone; the button at the top of the left rail on a laptop). Enter exactly:

| Field | Value |
|---|---|
| Photo | take any photo (optional) |
| Category | tap the **Phone** chip |
| Item name | `iPhone` (optional; it becomes the item's heading everywhere) |
| Color | tap the **Black** chip |
| Found where (area / zone) | `Gate 3` |
| Found at | leave as now |
| Brand | `Apple` |
| Model | `iPhone 14` |
| Case (color/style) | `clear case with a green sticker` |
| Lock screen / wallpaper | `golden retriever on a beach` |
| Visible damage | `cracked top-left corner` |
| Storage bin | **A1: Front desk shelf** (remembered after first use) |

Tap **Save item** (an "Item saved" snackbar appears). **Say:** "Chips and defaults: about fifteen seconds. Each detail is marked *public* or *private* (lock icon); private ones become the claim questions."

### 1:05 – 1:20 | The notification
- **Show (tab 4, Outbox):** a new message appears: *"We may have found your phone"* to `lena.ortiz@example.com`, with a claim link.
- **Say:** "A deterministic score (category, color, area, time window) crossed the threshold, no AI. No email provider is needed; this Outbox is the demo
  stand-in, so the venue wifi can't break it." Open the link on the claimant device.

### 1:20 – 1:55 | The claimant proves ownership
Tab 3 (claim page). Four questions generated from the **private** details, each with a **Your answer** field. Answer naturally, not word for word:

| Question | Answer to type |
|---|---|
| What model is the phone? | `iPhone 14` |
| Describe the phone case. | `Clear case, green sticker on the back` |
| What is shown on the lock screen wallpaper? | `My golden retriever on a beach` |
| Describe any scratches or cracks on the phone. | `Top left corner is cracked` |

Tap **Submit answers** → "Staff are reviewing". **Say:** "The questions never include the answers, and attempts are rate-limited per item."

### 1:55 – 2:20 | Staff verify and approve
- Tab 1 → **Claims** → open the claim. **Show** the comparison: "4 of 4 answers match", and for each question *Claimant said* vs. *On record (private)* with a green **Match** chip.
- Type nothing (reason optional) and tap **Approve**. **Say:** "Staff decide, not the software. A denial requires a written reason and the item goes back on the shelf."

### 2:20 – 2:50 | One-time pickup QR and release
- Tab 3 (reload the claim link): **Approved! Your pickup code** with a QR code.
- Tab 1 → **Pickup**. Hold the phone's QR up to the laptop camera. The item card appears with the claimant's email.
- Tick **I checked the claimant's photo ID** → **Release item**. **Say:** "The code works exactly once. Scan it again and it's refused."

### 2:50 – 3:00 | The record and the dashboard
- Tab 1 → **Inventory** → open the item → **Chain of custody**: `found → stored → claim_pending → verified → released`, each with who and when.
- Tab 2 (admin): admins land on the **Dashboard** after login: **26 items logged · 15% returned to owners · median time to return · 4/4 claims approved**;
  charts for inventory by state, bin, and where items are found.
- **Close:** "Sensitive items (wallets, IDs, cards) get staff-only blurred photos and a retention clock. Two items on the Retention page are already past due, ready for
  one-click, logged disposal. New item types are one file each."

**Bonus (5 s, if time):** tap the moon icon in the top bar to switch to dark theme. The whole app is Material 3 and works offline (no fonts, icons or scripts load from the internet).

**Photo intake (only if a local vision model is running, see README):** on **Log item**, tap **Upload photo** or the camera card.
After a few seconds the category, color and details fill in by themselves ("Filled from photo: ..."). Check them and save.
Without a model the form works by hand as scripted above.

**Alternative claim path (if asked "what if they never filed a report?"):** on the public **Search** page any shelved item has a
**This is mine** button. Enter an email and the same verification questions open immediately; the claim then goes through the
same staff review.

## Fallbacks

| Problem | Fix |
|---|---|
| Camera won't start / permission denied | On **Pickup**, paste the code into *Can't scan? Enter the code* and tap **Look up**. The code is `vlf:pickup:` + the token at the end of the claim URL. |
| Outbox link doesn't open on the phone | Restart with `PUBLIC_URL=http://<laptop-LAN-IP>:5173`, or just open the link in a laptop window. |
| No notification after intake | Check the item's category, color and area match the report exactly (`phone`, `black`, `Gate 3`). Seed again and retry. |
| "Too many claim attempts" | The per-item limit is 5 submissions/hour. Run `npm run seed` to reset. |
| Need to run it again | `npm run seed`: resets everything in a second, no restart needed. |
| Want to show a denial | Answer with `Pixel 7`, `cat`, then **Deny** with a reason: the item returns to `stored` and the claimant sees why. |
