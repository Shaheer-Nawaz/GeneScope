/*
# Genetic Inheritance & Phenotype Simulator — Core Schema

## Overview
Creates the full data-driven genetics database. All biological rules are stored
as data records so the genetics engine never needs to be rewritten when new
organisms or traits are added.

## New Tables

1. `organisms` — species that can be studied (pea plant, fruit fly, etc.)
2. `genes` — specific genes belonging to an organism
3. `traits` — observable characteristics linked to a gene and organism
4. `alleles` — possible variants of a gene (A, a, etc.)
5. `phenotypes` — observable outcomes for a trait
6. `genotype_phenotype_rules` — the mapping table: genotype → phenotype + explanation

## Security
- RLS enabled on all tables.
- All tables are publicly readable (anon + authenticated) because this is an
  educational simulator with no user-owned data.
- No INSERT/UPDATE/DELETE policies for the public: seed data is inserted by the
  migration itself; the app only reads.
*/

-- ── Organisms ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS organisms (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  common_name   text NOT NULL,
  scientific_name text NOT NULL,
  description   text NOT NULL,
  created_at    timestamptz DEFAULT now()
);

ALTER TABLE organisms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_organisms" ON organisms;
CREATE POLICY "public_select_organisms" ON organisms FOR SELECT
  TO anon, authenticated USING (true);

-- ── Genes ──────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS genes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organism_id uuid NOT NULL REFERENCES organisms(id) ON DELETE CASCADE,
  name        text NOT NULL,
  symbol      text NOT NULL,
  description text NOT NULL,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE genes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_genes" ON genes;
CREATE POLICY "public_select_genes" ON genes FOR SELECT
  TO anon, authenticated USING (true);

-- ── Traits ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS traits (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organism_id       uuid NOT NULL REFERENCES organisms(id) ON DELETE CASCADE,
  gene_id           uuid NOT NULL REFERENCES genes(id) ON DELETE CASCADE,
  name              text NOT NULL,
  description       text NOT NULL,
  inheritance_model text NOT NULL,   -- e.g. 'complete_dominance', 'incomplete_dominance', 'codominance'
  educational_notes text NOT NULL,
  created_at        timestamptz DEFAULT now()
);

ALTER TABLE traits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_traits" ON traits;
CREATE POLICY "public_select_traits" ON traits FOR SELECT
  TO anon, authenticated USING (true);

-- ── Alleles ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS alleles (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gene_id     uuid NOT NULL REFERENCES genes(id) ON DELETE CASCADE,
  symbol      text NOT NULL,
  description text NOT NULL,
  is_dominant boolean NOT NULL DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE alleles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_alleles" ON alleles;
CREATE POLICY "public_select_alleles" ON alleles FOR SELECT
  TO anon, authenticated USING (true);

-- ── Phenotypes ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS phenotypes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trait_id    uuid NOT NULL REFERENCES traits(id) ON DELETE CASCADE,
  name        text NOT NULL,
  description text NOT NULL,
  color_hex   text,                  -- optional display color for charts
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE phenotypes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_phenotypes" ON phenotypes;
CREATE POLICY "public_select_phenotypes" ON phenotypes FOR SELECT
  TO anon, authenticated USING (true);

-- ── Genotype–Phenotype Rules ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS genotype_phenotype_rules (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trait_id          uuid NOT NULL REFERENCES traits(id) ON DELETE CASCADE,
  genotype          text NOT NULL,   -- e.g. 'AA', 'Aa', 'aa'
  phenotype_id      uuid NOT NULL REFERENCES phenotypes(id) ON DELETE CASCADE,
  inheritance_model text NOT NULL,
  explanation       text NOT NULL,
  assumptions       text NOT NULL,
  created_at        timestamptz DEFAULT now(),
  UNIQUE(trait_id, genotype)
);

ALTER TABLE genotype_phenotype_rules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_genotype_phenotype_rules" ON genotype_phenotype_rules;
CREATE POLICY "public_select_genotype_phenotype_rules" ON genotype_phenotype_rules FOR SELECT
  TO anon, authenticated USING (true);

-- ── Indexes ────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_genes_organism_id    ON genes(organism_id);
CREATE INDEX IF NOT EXISTS idx_traits_organism_id   ON traits(organism_id);
CREATE INDEX IF NOT EXISTS idx_traits_gene_id       ON traits(gene_id);
CREATE INDEX IF NOT EXISTS idx_alleles_gene_id      ON alleles(gene_id);
CREATE INDEX IF NOT EXISTS idx_phenotypes_trait_id  ON phenotypes(trait_id);
CREATE INDEX IF NOT EXISTS idx_gpr_trait_id         ON genotype_phenotype_rules(trait_id);
