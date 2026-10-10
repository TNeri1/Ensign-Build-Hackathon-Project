CREATE TABLE venues (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  venue_id TEXT NOT NULL REFERENCES venues(id),
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('staff', 'admin')),
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE sessions (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  expires_at TEXT NOT NULL
);

CREATE TABLE storage_bins (
  id TEXT PRIMARY KEY,
  venue_id TEXT NOT NULL REFERENCES venues(id),
  code TEXT NOT NULL,
  label TEXT NOT NULL,
  UNIQUE (venue_id, code)
);

CREATE TABLE items (
  id TEXT PRIMARY KEY,
  venue_id TEXT NOT NULL REFERENCES venues(id),
  category TEXT NOT NULL,
  color TEXT NOT NULL,
  found_area TEXT NOT NULL,
  found_at TEXT NOT NULL,
  state TEXT NOT NULL CHECK (state IN ('found','stored','claim_pending','verified','released','disposed')),
  bin_id TEXT REFERENCES storage_bins(id),
  photo_path TEXT,
  sensitive INTEGER NOT NULL DEFAULT 0,
  created_by TEXT REFERENCES users(id),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX idx_items_state ON items(state);
CREATE INDEX idx_items_category ON items(category);

CREATE TABLE item_attributes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_id TEXT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  is_public INTEGER NOT NULL DEFAULT 0,
  UNIQUE (item_id, key)
);

CREATE TABLE lost_reports (
  id TEXT PRIMARY KEY,
  venue_id TEXT NOT NULL REFERENCES venues(id),
  category TEXT NOT NULL,
  color TEXT NOT NULL,
  area TEXT NOT NULL,
  window_start TEXT NOT NULL,
  window_end TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  contact_email TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE claims (
  id TEXT PRIMARY KEY,
  item_id TEXT NOT NULL REFERENCES items(id),
  report_id TEXT REFERENCES lost_reports(id),
  token_hash TEXT NOT NULL UNIQUE,
  claimant_email TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('open','submitted','approved','denied','released')),
  challenges_json TEXT NOT NULL,
  answers_json TEXT,
  decision_reason TEXT,
  decided_by TEXT REFERENCES users(id),
  pickup_token_hash TEXT UNIQUE,
  created_at TEXT NOT NULL,
  submitted_at TEXT,
  decided_at TEXT
);
CREATE INDEX idx_claims_item ON claims(item_id);

CREATE TABLE claim_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_id TEXT NOT NULL,
  at TEXT NOT NULL
);
CREATE INDEX idx_claim_attempts_item ON claim_attempts(item_id, at);

CREATE TABLE custody_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_id TEXT NOT NULL REFERENCES items(id),
  actor_user_id TEXT REFERENCES users(id),
  actor_label TEXT NOT NULL,
  at TEXT NOT NULL,
  from_state TEXT,
  to_state TEXT NOT NULL,
  note TEXT NOT NULL DEFAULT ''
);
CREATE INDEX idx_custody_item ON custody_events(item_id, id);

CREATE TABLE notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  channel TEXT NOT NULL CHECK (channel IN ('email','sms')),
  to_addr TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TEXT NOT NULL
);
