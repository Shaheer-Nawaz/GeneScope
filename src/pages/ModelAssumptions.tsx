import { BookOpen, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const models = [
  {
    name: 'Complete Dominance',
    biologicalConcept:
      'One allele (dominant) completely masks the expression of the other allele (recessive) in heterozygous individuals.',
    simplification:
      'This app models complete dominance as a binary rule: if at least one dominant allele is present, the dominant phenotype is shown. No partial effects, no environmental modifiers.',
    example:
      'Pea Seed Shape: RR and Rr both produce round seeds. Only rr produces wrinkled seeds.',
    biological: [
      'Dominant alleles may code for functional proteins that produce the phenotype even in single copy.',
      'Recessive alleles often code for nonfunctional or absent proteins.',
    ],
    limitations: [
      'Real dominance relationships can be more complex.',
      'Dominance can be incomplete (see below).',
      'Some alleles show dosage sensitivity.',
      'Environmental factors are ignored.',
    ],
  },
  {
    name: 'Incomplete Dominance',
    biologicalConcept:
      'Neither allele is fully dominant. Heterozygous individuals show an intermediate phenotype between the two homozygous phenotypes.',
    simplification:
      'This app models incomplete dominance as a three-phenotype system: homozygous allele 1 → phenotype 1, heterozygous → intermediate phenotype, homozygous allele 2 → phenotype 2.',
    example:
      'Pea Flower Color: CRCR → red, CRCW → pink (intermediate), CWCW → white.',
    biological: [
      'The intermediate phenotype arises because each allele contributes a partial amount of pigment or protein.',
      'Single-copy expression is insufficient to produce the full phenotype of either homozygote.',
    ],
    limitations: [
      'Real incomplete dominance involves complex protein dosage effects.',
      'This simplified model uses a fixed intermediate phenotype rather than a continuous gradient.',
      'Multiple genes affecting the same trait are not modelled.',
    ],
  },
  {
    name: 'Codominance',
    biologicalConcept:
      'Both alleles are fully expressed simultaneously in heterozygous individuals. The phenotype shows characteristics of both alleles rather than a blend.',
    simplification:
      'In Version 1, this app demonstrates codominance using only the homozygous genotypes (e+e+ and ee) to show distinct phenotypes. Full heterozygote codominance modelling is planned for a future version.',
    example:
      'Fruit Fly Body Color: e+e+ → gray body, ee → ebony body.',
    biological: [
      'In true codominance, both allele products are present simultaneously (classic example: ABO blood types with A and B antigens).',
      'Unlike incomplete dominance, there is no blending — both traits appear distinctly.',
    ],
    limitations: [
      'The heterozygous codominant phenotype (e+e — gray-ebony mosaic) is not yet included in this version.',
      'Real codominance often requires molecular-level analysis to distinguish from incomplete dominance.',
      'This is a simplified two-phenotype demonstration.',
    ],
  },
];

const futureModels = [
  'Multiple Alleles (e.g. ABO blood type with IA, IB, i)',
  'Sex-Linked / X-Linked Inheritance',
  'Polygenic Traits (traits controlled by multiple genes)',
  'Epistasis (gene interactions where one gene masks another)',
  'Quantitative Trait Loci (QTL) modelling',
  'Environmental Gene Expression',
];

export default function ModelAssumptions() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-teal-500/15 flex items-center justify-center border border-teal-500/25 shrink-0 mt-0.5">
          <BookOpen size={18} className="text-teal-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Model Assumptions & Limitations</h1>
          <p className="text-sm text-slate-400 mt-1">
            Every simulation in this application is based on simplified educational models.
            This page documents each model, its biological basis, what was simplified, and what that means.
          </p>
        </div>
      </div>

      <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
        <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-200/80 leading-relaxed">
          All models on this page are intentional educational simplifications.
          They are designed to make the underlying computational concepts clear,
          not to represent the full complexity of real biological genetics.
        </p>
      </div>

      {/* Models */}
      <div className="space-y-6">
        {models.map((m) => (
          <div key={m.name} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-800/40">
              <h2 className="font-bold text-slate-100 text-lg">{m.name}</h2>
            </div>
            <div className="p-6 space-y-5">
              <Row label="Biological Concept" text={m.biologicalConcept} />
              <Row label="Simplification Used in This Software" text={m.simplification} highlight />
              <Row label="Example in This App" text={m.example} mono />

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle size={12} /> Biological Basis
                  </p>
                  <ul className="space-y-1.5">
                    {m.biological.map((b) => (
                      <li key={b} className="text-xs text-slate-400 flex items-start gap-2 leading-relaxed">
                        <span className="w-1 h-1 rounded-full bg-teal-400 mt-1.5 shrink-0" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <XCircle size={12} /> Limitations of This Model
                  </p>
                  <ul className="space-y-1.5">
                    {m.limitations.map((l) => (
                      <li key={l} className="text-xs text-slate-400 flex items-start gap-2 leading-relaxed">
                        <span className="w-1 h-1 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                        {l}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Universal assumptions */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-slate-100">Universal Assumptions (All Models)</h2>
        <ul className="space-y-2">
          {[
            'All organisms in this application are assumed to be diploid (two copies of each gene).',
            'Genes are assumed to assort independently (Mendel\'s Law of Independent Assortment).',
            'Gamete formation is assumed to follow Mendel\'s Law of Segregation with equal probability.',
            'Environmental effects on phenotype expression are not modelled.',
            'Only one gene at a time is considered per simulation (monohybrid cross model).',
            'No mutation, genetic drift, selection, or migration is applied to the Punnett square calculation.',
            'All probabilities are theoretical and assume an idealized, infinite population.',
          ].map((a) => (
            <li key={a} className="text-xs text-slate-400 flex items-start gap-2 leading-relaxed">
              <span className="w-1 h-1 rounded-full bg-slate-500 mt-1.5 shrink-0" />
              {a}
            </li>
          ))}
        </ul>
      </div>

      {/* Future models */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-slate-100">Planned Future Models</h2>
        <p className="text-xs text-slate-400">
          The data-driven architecture of this application supports these models without changing the
          core genetics engine — they simply require new database records and rule definitions.
        </p>
        <ul className="grid sm:grid-cols-2 gap-2">
          {futureModels.map((f) => (
            <li key={f} className="flex items-start gap-2 text-xs text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-1 shrink-0" />
              {f}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Row({ label, text, highlight = false, mono = false }: { label: string; text: string; highlight?: boolean; mono?: boolean }) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-sm leading-relaxed ${highlight ? 'text-slate-200' : 'text-slate-400'} ${mono ? 'font-mono bg-slate-800 rounded px-2 py-1 text-xs' : ''}`}>
        {text}
      </p>
    </div>
  );
}
