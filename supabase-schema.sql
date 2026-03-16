-- ============================================================
-- Industrial Accident Dashboard — Supabase Schema
-- ============================================================
-- Run this entire script in:
--   Supabase Dashboard → SQL Editor → New query → Run
-- ============================================================

-- ─── Tables ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS accidents (
  id               BIGINT      PRIMARY KEY,
  year             INTEGER     NOT NULL DEFAULT 0,
  month            INTEGER     NOT NULL DEFAULT 0,
  quarter          INTEGER     NOT NULL DEFAULT 0,
  half_year        TEXT        NOT NULL DEFAULT '',
  accident_date    TEXT,
  treatment_start  TEXT,
  treatment_end    TEXT,
  department       TEXT        NOT NULL DEFAULT '',
  team_name        TEXT        NOT NULL DEFAULT '',
  store_name       TEXT        NOT NULL DEFAULT '',
  accident_type    TEXT        NOT NULL DEFAULT '',
  accident_form    TEXT        NOT NULL DEFAULT '',
  age              INTEGER,
  age_group        TEXT        NOT NULL DEFAULT '',
  gender           TEXT        NOT NULL DEFAULT '',
  tenure_years     REAL,
  employment_type  TEXT        NOT NULL DEFAULT '',
  work_loss_days   INTEGER,
  body_part        TEXT,
  causative_object TEXT,
  diagnosis        TEXT,
  branch_office    TEXT,
  employee_id      TEXT,
  uploaded_at      TEXT        NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS stores (
  store_name   TEXT    PRIMARY KEY,
  team         TEXT    NOT NULL DEFAULT '',
  type         TEXT    NOT NULL DEFAULT '',
  open_date    TEXT,
  address      TEXT,
  lat          REAL,
  lng          REAL,
  area_pyeong  REAL,
  uploaded_at  TEXT    NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS upload_history (
  id             BIGSERIAL   PRIMARY KEY,
  filename       TEXT        NOT NULL,
  upload_type    TEXT        NOT NULL,
  rows_inserted  INTEGER     NOT NULL DEFAULT 0,
  uploaded_at    TEXT        NOT NULL,
  status         TEXT        NOT NULL,
  error_message  TEXT
);

-- ─── Indexes ─────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_acc_year  ON accidents(year);
CREATE INDEX IF NOT EXISTS idx_acc_dept  ON accidents(department);
CREATE INDEX IF NOT EXISTS idx_acc_team  ON accidents(team_name);
CREATE INDEX IF NOT EXISTS idx_acc_type  ON accidents(accident_type);
CREATE INDEX IF NOT EXISTS idx_acc_store ON accidents(store_name);

-- ─── Row Level Security ──────────────────────────────────────
-- The app uses the SERVICE ROLE key which bypasses RLS.
-- Disable RLS on these tables so the anon key also cannot
-- accidentally read sensitive data through the REST API.

ALTER TABLE accidents      DISABLE ROW LEVEL SECURITY;
ALTER TABLE stores         DISABLE ROW LEVEL SECURITY;
ALTER TABLE upload_history DISABLE ROW LEVEL SECURITY;

-- ─── Done ────────────────────────────────────────────────────
-- After running this script:
--   1. Copy your Project URL and Service Role Key from
--      Project Settings → API
--   2. Add them to .env.local (see .env.local.example)
--   3. Deploy to Vercel and set the same env vars there
