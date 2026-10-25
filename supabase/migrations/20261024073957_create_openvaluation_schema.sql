/*
# Create OpenValuation persistence schema (single-tenant, no auth)

1. New Tables
- `models`: Stores a financial model (company profile + embedded JSONB payloads for historicals, assumptions, comparables). Keeping related data in JSONB columns on one row makes saving/loading a model a single round-trip and avoids a complex normalized schema for what is effectively a document.
  - id (uuid, pk)
  - name (text)
  - profile (jsonb): CompanyProfile
  - periods (jsonb): PeriodFinancials[]
  - assumptions (jsonb): Assumptions
  - comparables (jsonb): ComparableCompany[]
  - created_at, updated_at (timestamptz)
- `imports`: Audit log of data-import runs (CSV/XLSX), storing the filename, format, row count, and status.
  - id (uuid, pk)
  - model_id (uuid, fk -> models, cascade delete)
  - filename (text)
  - format (text: csv|xlsx|manual)
  - row_count (int)
  - status (text)
  - created_at (timestamptz)

2. Security
- Enable RLS on both tables.
- Grant CRUD to anon + authenticated so the anon-key frontend can read/write (single-tenant app, no sign-in).
- Open policies (USING true / WITH CHECK true) because the data is intentionally shared/public in this no-auth tool. Documented here explicitly.

3. Notes
- No user_id columns — the user did not request accounts.
- models.periods/assumptions/comparables are JSONB so the full model state persists atomically.
*/

CREATE TABLE IF NOT EXISTS models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  profile jsonb NOT NULL DEFAULT '{}'::jsonb,
  periods jsonb NOT NULL DEFAULT '[]'::jsonb,
  assumptions jsonb NOT NULL DEFAULT '{}'::jsonb,
  comparables jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE models ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON models TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_models" ON models;
CREATE POLICY "anon_select_models" ON models FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_models" ON models;
CREATE POLICY "anon_insert_models" ON models FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_models" ON models;
CREATE POLICY "anon_update_models" ON models FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_models" ON models;
CREATE POLICY "anon_delete_models" ON models FOR DELETE
TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS imports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id uuid REFERENCES models(id) ON DELETE CASCADE,
  filename text NOT NULL,
  format text NOT NULL CHECK (format IN ('csv','xlsx','manual')),
  row_count int NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'success',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE imports ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON imports TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_imports" ON imports;
CREATE POLICY "anon_select_imports" ON imports FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_imports" ON imports;
CREATE POLICY "anon_insert_imports" ON imports FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_imports" ON imports;
CREATE POLICY "anon_update_imports" ON imports FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_imports" ON imports;
CREATE POLICY "anon_delete_imports" ON imports FOR DELETE
TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_models_name ON models (name);
CREATE INDEX IF NOT EXISTS idx_imports_model_id ON imports (model_id);
