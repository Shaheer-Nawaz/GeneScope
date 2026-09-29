/*
# Seed Educational Genetics Data

## Overview
Inserts the initial educational dataset for the Genetic Inheritance & Phenotype Simulator.
All data represents SIMPLIFIED EDUCATIONAL MODELS, not comprehensive real-world biology.

## Organisms Added
1. Pea Plant (Pisum sativum) — classic Mendelian model organism
2. Fruit Fly (Drosophila melanogaster) — foundational genetics model organism

## Traits Added
### Pea Plant
- Seed Shape (complete dominance: round R dominant over wrinkled r)
- Seed Color (complete dominance: yellow Y dominant over green y)
- Flower Color (incomplete dominance: red CR blends with white CW to give pink CRCW)

### Fruit Fly
- Eye Color (complete dominance: red w+ dominant over white w)
- Wing Shape (complete dominance: normal vg+ dominant over vestigial vg)
- Body Color (codominance: gray e+ and ebony e expressed equally)

## Notes
- All rules are idempotent: uses DO $$ ... END $$ blocks to avoid duplicate inserts.
- UUIDs are fixed so this migration can be re-run safely.
*/

DO $$
DECLARE
  -- Organism IDs
  pea_id   uuid := 'a1000000-0000-0000-0000-000000000001';
  fly_id   uuid := 'a1000000-0000-0000-0000-000000000002';

  -- Gene IDs — Pea Plant
  pea_seed_shape_gene_id  uuid := 'b1000000-0000-0000-0000-000000000001';
  pea_seed_color_gene_id  uuid := 'b1000000-0000-0000-0000-000000000002';
  pea_flower_color_gene_id uuid := 'b1000000-0000-0000-0000-000000000003';

  -- Gene IDs — Fruit Fly
  fly_eye_color_gene_id   uuid := 'b1000000-0000-0000-0000-000000000004';
  fly_wing_shape_gene_id  uuid := 'b1000000-0000-0000-0000-000000000005';
  fly_body_color_gene_id  uuid := 'b1000000-0000-0000-0000-000000000006';

  -- Trait IDs — Pea Plant
  pea_seed_shape_trait_id  uuid := 'c1000000-0000-0000-0000-000000000001';
  pea_seed_color_trait_id  uuid := 'c1000000-0000-0000-0000-000000000002';
  pea_flower_color_trait_id uuid := 'c1000000-0000-0000-0000-000000000003';

  -- Trait IDs — Fruit Fly
  fly_eye_color_trait_id  uuid := 'c1000000-0000-0000-0000-000000000004';
  fly_wing_shape_trait_id uuid := 'c1000000-0000-0000-0000-000000000005';
  fly_body_color_trait_id uuid := 'c1000000-0000-0000-0000-000000000006';

  -- Phenotype IDs — Pea Seed Shape
  p_round_id    uuid := 'd1000000-0000-0000-0000-000000000001';
  p_wrinkled_id uuid := 'd1000000-0000-0000-0000-000000000002';

  -- Phenotype IDs — Pea Seed Color
  p_yellow_id uuid := 'd1000000-0000-0000-0000-000000000003';
  p_green_id  uuid := 'd1000000-0000-0000-0000-000000000004';

  -- Phenotype IDs — Pea Flower Color (Incomplete Dominance)
  p_red_flower_id   uuid := 'd1000000-0000-0000-0000-000000000005';
  p_pink_flower_id  uuid := 'd1000000-0000-0000-0000-000000000006';
  p_white_flower_id uuid := 'd1000000-0000-0000-0000-000000000007';

  -- Phenotype IDs — Fruit Fly Eye Color
  p_red_eye_id   uuid := 'd1000000-0000-0000-0000-000000000008';
  p_white_eye_id uuid := 'd1000000-0000-0000-0000-000000000009';

  -- Phenotype IDs — Fruit Fly Wing Shape
  p_normal_wing_id    uuid := 'd1000000-0000-0000-0000-000000000010';
  p_vestigial_wing_id uuid := 'd1000000-0000-0000-0000-000000000011';

  -- Phenotype IDs — Fruit Fly Body Color (Codominance simplified)
  p_gray_body_id  uuid := 'd1000000-0000-0000-0000-000000000012';
  p_ebony_body_id uuid := 'd1000000-0000-0000-0000-000000000013';

BEGIN

  -- ── ORGANISMS ──────────────────────────────────────────────────────────────
  INSERT INTO organisms (id, common_name, scientific_name, description)
  VALUES
    (pea_id, 'Pea Plant', 'Pisum sativum',
     'The garden pea plant, famously used by Gregor Mendel in the 1860s to establish the foundational laws of genetic inheritance. Its distinct, easily observable traits make it ideal for educational genetics simulations.'),
    (fly_id, 'Fruit Fly', 'Drosophila melanogaster',
     'One of the most important model organisms in genetics research. Fruit flies have a short generation time, large numbers of offspring, and many well-studied traits, making them perfect for demonstrating inheritance patterns.')
  ON CONFLICT (id) DO NOTHING;

  -- ── GENES — PEA PLANT ──────────────────────────────────────────────────────
  INSERT INTO genes (id, organism_id, name, symbol, description)
  VALUES
    (pea_seed_shape_gene_id, pea_id, 'Seed Shape Gene', 'R',
     'Controls whether pea seeds develop a round or wrinkled shape. In this simplified model, the R allele is dominant over the r allele.'),
    (pea_seed_color_gene_id, pea_id, 'Seed Color Gene', 'Y',
     'Controls seed pigmentation. In this simplified model, the Y allele (yellow) is dominant over the y allele (green).'),
    (pea_flower_color_gene_id, pea_id, 'Flower Color Gene', 'C',
     'Controls flower pigmentation. In this simplified incomplete dominance model, neither CR (red) nor CW (white) is fully dominant; the heterozygote CRCW produces a pink intermediate.')
  ON CONFLICT (id) DO NOTHING;

  -- ── GENES — FRUIT FLY ──────────────────────────────────────────────────────
  INSERT INTO genes (id, organism_id, name, symbol, description)
  VALUES
    (fly_eye_color_gene_id, fly_id, 'Eye Color Gene', 'w',
     'Located on the X chromosome. In this simplified model, wild-type w+ (red) is dominant over w (white). This gene is used to demonstrate X-linked inheritance in a simplified educational context.'),
    (fly_wing_shape_gene_id, fly_id, 'Wing Shape Gene', 'vg',
     'Controls wing development. Wild-type vg+ (normal) is dominant over vg (vestigial/reduced wings) in this simplified complete dominance model.'),
    (fly_body_color_gene_id, fly_id, 'Body Color Gene', 'e',
     'Controls body pigmentation. In this simplified educational model, we demonstrate a codominance-like scenario where homozygous genotypes produce distinct phenotypes.')
  ON CONFLICT (id) DO NOTHING;

  -- ── TRAITS — PEA PLANT ─────────────────────────────────────────────────────
  INSERT INTO traits (id, organism_id, gene_id, name, description, inheritance_model, educational_notes)
  VALUES
    (pea_seed_shape_trait_id, pea_id, pea_seed_shape_gene_id,
     'Seed Shape', 'The shape of the seed coat: round or wrinkled.',
     'complete_dominance',
     'Mendel observed a 3:1 ratio of round to wrinkled seeds in F2 crosses. This is the classic example of complete dominance where one allele completely masks the other.'),
    (pea_seed_color_trait_id, pea_id, pea_seed_color_gene_id,
     'Seed Color', 'The color of the seed: yellow or green.',
     'complete_dominance',
     'Yellow seed color is dominant over green in this simplified model. Mendel used this trait alongside seed shape in his foundational experiments.'),
    (pea_flower_color_trait_id, pea_id, pea_flower_color_gene_id,
     'Flower Color (Incomplete Dominance)', 'The color of pea flowers demonstrating incomplete dominance.',
     'incomplete_dominance',
     'Unlike complete dominance, neither allele is fully dominant here. The heterozygote produces an intermediate phenotype (pink), demonstrating that alleles can blend in their expression.')
  ON CONFLICT (id) DO NOTHING;

  -- ── TRAITS — FRUIT FLY ─────────────────────────────────────────────────────
  INSERT INTO traits (id, organism_id, gene_id, name, description, inheritance_model, educational_notes)
  VALUES
    (fly_eye_color_trait_id, fly_id, fly_eye_color_gene_id,
     'Eye Color (Simplified)', 'Eye color in fruit flies: red (wild-type) or white.',
     'complete_dominance',
     'In this simplified autosomal model, red eye color is dominant over white. Note: biologically this is X-linked; the autosomal simplification is used here for educational clarity in demonstrating complete dominance.'),
    (fly_wing_shape_trait_id, fly_id, fly_wing_shape_gene_id,
     'Wing Shape', 'Wing development: normal or vestigial (reduced) wings.',
     'complete_dominance',
     'Normal wings (vg+) are dominant over vestigial wings (vg) in this simplified complete dominance model. Vestigial wings prevent flight.'),
    (fly_body_color_trait_id, fly_id, fly_body_color_gene_id,
     'Body Color (Codominance)', 'Body pigmentation demonstrating codominance between gray and ebony.',
     'codominance',
     'In codominance, both alleles are expressed simultaneously. Neither masks the other. This educational model demonstrates how two alleles can contribute equally to a phenotype.')
  ON CONFLICT (id) DO NOTHING;

  -- ── ALLELES ─────────────────────────────────────────────────────────────────
  INSERT INTO alleles (gene_id, symbol, description, is_dominant)
  VALUES
    -- Pea Seed Shape
    (pea_seed_shape_gene_id, 'R', 'Round allele (dominant) — produces round seeds', true),
    (pea_seed_shape_gene_id, 'r', 'Wrinkled allele (recessive) — produces wrinkled seeds when homozygous', false),
    -- Pea Seed Color
    (pea_seed_color_gene_id, 'Y', 'Yellow allele (dominant) — produces yellow seeds', true),
    (pea_seed_color_gene_id, 'y', 'Green allele (recessive) — produces green seeds when homozygous', false),
    -- Pea Flower Color
    (pea_flower_color_gene_id, 'CR', 'Red allele — contributes to red pigment (neither fully dominant)', false),
    (pea_flower_color_gene_id, 'CW', 'White allele — contributes to white pigment (neither fully dominant)', false),
    -- Fly Eye Color
    (fly_eye_color_gene_id, 'w+', 'Wild-type red-eye allele (dominant in this simplified model)', true),
    (fly_eye_color_gene_id, 'w', 'White-eye allele (recessive in this simplified model)', false),
    -- Fly Wing Shape
    (fly_wing_shape_gene_id, 'vg+', 'Normal wing allele (dominant)', true),
    (fly_wing_shape_gene_id, 'vg', 'Vestigial wing allele (recessive)', false),
    -- Fly Body Color
    (fly_body_color_gene_id, 'e+', 'Gray body allele (codominant with ebony)', false),
    (fly_body_color_gene_id, 'e', 'Ebony body allele (codominant with gray)', false)
  ON CONFLICT DO NOTHING;

  -- ── PHENOTYPES — PEA SEED SHAPE ────────────────────────────────────────────
  INSERT INTO phenotypes (id, trait_id, name, description, color_hex)
  VALUES
    (p_round_id, pea_seed_shape_trait_id, 'Round Seeds',
     'Seeds with a smooth, round exterior. Results from at least one dominant R allele.', '#4CAF50'),
    (p_wrinkled_id, pea_seed_shape_trait_id, 'Wrinkled Seeds',
     'Seeds with a wrinkled, irregular surface. Results only from two recessive r alleles (rr).', '#9E9E9E')
  ON CONFLICT (id) DO NOTHING;

  -- ── PHENOTYPES — PEA SEED COLOR ────────────────────────────────────────────
  INSERT INTO phenotypes (id, trait_id, name, description, color_hex)
  VALUES
    (p_yellow_id, pea_seed_color_trait_id, 'Yellow Seeds',
     'Seeds with yellow pigmentation. Results from at least one dominant Y allele.', '#FFC107'),
    (p_green_id, pea_seed_color_trait_id, 'Green Seeds',
     'Seeds with green pigmentation. Results only from two recessive y alleles (yy).', '#8BC34A')
  ON CONFLICT (id) DO NOTHING;

  -- ── PHENOTYPES — PEA FLOWER COLOR ──────────────────────────────────────────
  INSERT INTO phenotypes (id, trait_id, name, description, color_hex)
  VALUES
    (p_red_flower_id, pea_flower_color_trait_id, 'Red Flowers',
     'Fully red flowers. Results from homozygous CRCR genotype.', '#F44336'),
    (p_pink_flower_id, pea_flower_color_trait_id, 'Pink Flowers',
     'Intermediate pink flowers. Results from heterozygous CRCW genotype (incomplete dominance — blending).', '#E91E8C'),
    (p_white_flower_id, pea_flower_color_trait_id, 'White Flowers',
     'Fully white flowers. Results from homozygous CWCW genotype.', '#ECEFF1')
  ON CONFLICT (id) DO NOTHING;

  -- ── PHENOTYPES — FLY EYE COLOR ─────────────────────────────────────────────
  INSERT INTO phenotypes (id, trait_id, name, description, color_hex)
  VALUES
    (p_red_eye_id, fly_eye_color_trait_id, 'Red Eyes',
     'Wild-type red eye pigmentation. At least one w+ allele is present.', '#F44336'),
    (p_white_eye_id, fly_eye_color_trait_id, 'White Eyes',
     'Lack of eye pigmentation producing white eyes. Two recessive w alleles (ww).', '#ECEFF1')
  ON CONFLICT (id) DO NOTHING;

  -- ── PHENOTYPES — FLY WING SHAPE ────────────────────────────────────────────
  INSERT INTO phenotypes (id, trait_id, name, description, color_hex)
  VALUES
    (p_normal_wing_id, fly_wing_shape_trait_id, 'Normal Wings',
     'Full-length wings capable of flight. At least one vg+ allele.', '#2196F3'),
    (p_vestigial_wing_id, fly_wing_shape_trait_id, 'Vestigial Wings',
     'Severely reduced wings, preventing flight. Two vg alleles (vgvg).', '#607D8B')
  ON CONFLICT (id) DO NOTHING;

  -- ── PHENOTYPES — FLY BODY COLOR ────────────────────────────────────────────
  INSERT INTO phenotypes (id, trait_id, name, description, color_hex)
  VALUES
    (p_gray_body_id, fly_body_color_trait_id, 'Gray Body',
     'Wild-type gray body color. Homozygous e+e+ genotype.', '#9E9E9E'),
    (p_ebony_body_id, fly_body_color_trait_id, 'Ebony Body',
     'Dark black-brown body color. Homozygous ee genotype.', '#212121')
  ON CONFLICT (id) DO NOTHING;

  -- ── GENOTYPE → PHENOTYPE RULES — PEA SEED SHAPE ────────────────────────────
  INSERT INTO genotype_phenotype_rules (trait_id, genotype, phenotype_id, inheritance_model, explanation, assumptions)
  VALUES
    (pea_seed_shape_trait_id, 'RR', p_round_id, 'complete_dominance',
     'Homozygous dominant (RR): both alleles are the dominant R allele. The plant produces round seeds.',
     'Assumes two alleles per locus; R is completely dominant over r; no environmental effects; diploid organism.'),
    (pea_seed_shape_trait_id, 'Rr', p_round_id, 'complete_dominance',
     'Heterozygous (Rr): one dominant R allele is present. Because R is completely dominant, the plant still produces round seeds. The recessive r allele is hidden.',
     'Assumes two alleles per locus; R is completely dominant over r; no environmental effects; diploid organism.'),
    (pea_seed_shape_trait_id, 'rr', p_wrinkled_id, 'complete_dominance',
     'Homozygous recessive (rr): no dominant R allele is present. Both alleles are recessive, so the plant produces wrinkled seeds.',
     'Assumes two alleles per locus; R is completely dominant over r; no environmental effects; diploid organism.')
  ON CONFLICT (trait_id, genotype) DO NOTHING;

  -- ── GENOTYPE → PHENOTYPE RULES — PEA SEED COLOR ────────────────────────────
  INSERT INTO genotype_phenotype_rules (trait_id, genotype, phenotype_id, inheritance_model, explanation, assumptions)
  VALUES
    (pea_seed_color_trait_id, 'YY', p_yellow_id, 'complete_dominance',
     'Homozygous dominant (YY): both alleles produce yellow pigment. The seed is yellow.',
     'Assumes complete dominance; Y fully masks y; diploid; two-allele system.'),
    (pea_seed_color_trait_id, 'Yy', p_yellow_id, 'complete_dominance',
     'Heterozygous (Yy): one Y allele is sufficient to produce yellow pigment. The seed appears yellow.',
     'Assumes complete dominance; Y fully masks y; diploid; two-allele system.'),
    (pea_seed_color_trait_id, 'yy', p_green_id, 'complete_dominance',
     'Homozygous recessive (yy): no Y allele is present. The seed appears green.',
     'Assumes complete dominance; Y fully masks y; diploid; two-allele system.')
  ON CONFLICT (trait_id, genotype) DO NOTHING;

  -- ── GENOTYPE → PHENOTYPE RULES — PEA FLOWER COLOR (Incomplete Dominance) ───
  INSERT INTO genotype_phenotype_rules (trait_id, genotype, phenotype_id, inheritance_model, explanation, assumptions)
  VALUES
    (pea_flower_color_trait_id, 'CRCR', p_red_flower_id, 'incomplete_dominance',
     'Homozygous CR (CRCR): maximum red pigment is produced. The flower is fully red.',
     'Assumes incomplete dominance; neither CR nor CW is fully dominant; two alleles; no environmental effects.'),
    (pea_flower_color_trait_id, 'CRCW', p_pink_flower_id, 'incomplete_dominance',
     'Heterozygous (CRCW): one red and one white allele are present. Because neither is fully dominant, the flower expresses an intermediate pink color — a blend of both alleles.',
     'Assumes incomplete dominance; neither CR nor CW is fully dominant; two alleles; no environmental effects.'),
    (pea_flower_color_trait_id, 'CWCW', p_white_flower_id, 'incomplete_dominance',
     'Homozygous CW (CWCW): no red pigment is produced. The flower is fully white.',
     'Assumes incomplete dominance; neither CR nor CW is fully dominant; two alleles; no environmental effects.')
  ON CONFLICT (trait_id, genotype) DO NOTHING;

  -- ── GENOTYPE → PHENOTYPE RULES — FLY EYE COLOR ─────────────────────────────
  INSERT INTO genotype_phenotype_rules (trait_id, genotype, phenotype_id, inheritance_model, explanation, assumptions)
  VALUES
    (fly_eye_color_trait_id, 'w+w+', p_red_eye_id, 'complete_dominance',
     'Homozygous wild-type (w+w+): two copies of the dominant allele produce red eye pigment.',
     'Simplified autosomal model; w+ is fully dominant over w; two alleles; no sex-linkage modeled.'),
    (fly_eye_color_trait_id, 'w+w', p_red_eye_id, 'complete_dominance',
     'Heterozygous (w+w): one w+ allele is sufficient to produce red pigment. Eye color is red.',
     'Simplified autosomal model; w+ is fully dominant over w; two alleles; no sex-linkage modeled.'),
    (fly_eye_color_trait_id, 'ww', p_white_eye_id, 'complete_dominance',
     'Homozygous recessive (ww): no wild-type allele is present. No red pigment is produced, resulting in white eyes.',
     'Simplified autosomal model; w+ is fully dominant over w; two alleles; no sex-linkage modeled.')
  ON CONFLICT (trait_id, genotype) DO NOTHING;

  -- ── GENOTYPE → PHENOTYPE RULES — FLY WING SHAPE ────────────────────────────
  INSERT INTO genotype_phenotype_rules (trait_id, genotype, phenotype_id, inheritance_model, explanation, assumptions)
  VALUES
    (fly_wing_shape_trait_id, 'vg+vg+', p_normal_wing_id, 'complete_dominance',
     'Homozygous normal (vg+vg+): full wing development. The fly has normal wings and can fly.',
     'Two-allele system; vg+ fully dominant over vg; diploid; no environmental effects.'),
    (fly_wing_shape_trait_id, 'vg+vg', p_normal_wing_id, 'complete_dominance',
     'Heterozygous (vg+vg): one normal allele is sufficient for full wing development.',
     'Two-allele system; vg+ fully dominant over vg; diploid; no environmental effects.'),
    (fly_wing_shape_trait_id, 'vgvg', p_vestigial_wing_id, 'complete_dominance',
     'Homozygous vestigial (vgvg): both alleles are recessive. Wing development is severely reduced, preventing flight.',
     'Two-allele system; vg+ fully dominant over vg; diploid; no environmental effects.')
  ON CONFLICT (trait_id, genotype) DO NOTHING;

  -- ── GENOTYPE → PHENOTYPE RULES — FLY BODY COLOR (Codominance) ──────────────
  INSERT INTO genotype_phenotype_rules (trait_id, genotype, phenotype_id, inheritance_model, explanation, assumptions)
  VALUES
    (fly_body_color_trait_id, 'e+e+', p_gray_body_id, 'codominance',
     'Homozygous wild-type (e+e+): two gray alleles produce the standard wild-type gray body.',
     'Simplified codominance model; e+e+ and ee are distinct; heterozygotes are not modeled in this simplified version.'),
    (fly_body_color_trait_id, 'ee', p_ebony_body_id, 'codominance',
     'Homozygous ebony (ee): two ebony alleles produce a dark black-brown body color.',
     'Simplified codominance model; e+e+ and ee are distinct; heterozygotes are not modeled in this simplified version.')
  ON CONFLICT (trait_id, genotype) DO NOTHING;

END $$;
