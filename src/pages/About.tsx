import { Dna, Database, Cpu, FlaskConical, BookOpen, AlertTriangle } from 'lucide-react';

const sections = [
  {
    icon: Dna,
    title: 'What Is This Project?',
    content: `The Genetic Inheritance & Phenotype Simulator is an educational web application that demonstrates 
how a computer program can model simplified genetic inheritance rules and use those rules to compute 
possible genotype and phenotype outcomes.

The central concept is the genotype-to-phenotype mapping: given a genotype (like "Aa") and a set of 
stored inheritance rules, the system can determine the expected phenotype (like "Round Seeds") 
without hard-coding the biological answer in the program itself.`,
  },
  {
    icon: Cpu,
    title: 'What Is Computational Genetics?',
    content: `Computational genetics is a field that applies computer science and mathematical methods to 
understand genetic data. This includes storing genetic rules in databases, computing inheritance 
probabilities algorithmically, running statistical simulations, and modelling how genetic variation 
produces observable traits.

This application demonstrates the software engineering side of computational genetics: 
data modelling, algorithm design, probability calculation, and Monte Carlo simulation — 
all applied to a genetics problem domain.`,
  },
  {
    icon: Database,
    title: 'How the Simulator Works',
    content: `All genetic rules are stored in a relational database as structured records. When you select 
an organism, trait, and genotype, the application queries the database to find the matching 
genotype-phenotype rule — it does not use hard-coded if-statements.

The Punnett square is generated algorithmically from the parental alleles. Probabilities are 
calculated from the actual cross products. The Monte Carlo simulation randomly generates offspring 
according to those theoretical probabilities, demonstrating convergence behaviour.`,
  },
  {
    icon: FlaskConical,
    title: 'Supported Organisms and Models',
    content: `Version 1 supports two educational model organisms:
• Pea Plant (Pisum sativum) — the organism Gregor Mendel used to discover Mendelian inheritance
• Fruit Fly (Drosophila melanogaster) — a foundational genetics model organism

Inheritance models currently implemented:
• Complete Dominance — one allele fully masks the other
• Incomplete Dominance — heterozygotes show an intermediate phenotype
• Codominance — both alleles are expressed simultaneously in homozygotes

The architecture is designed so that new organisms, traits, and inheritance models can be added 
as database records without rewriting the genetics engine.`,
  },
  {
    icon: BookOpen,
    title: 'Why Simplified Models Are Used',
    content: `Real genetics is extraordinarily complex. Actual traits are influenced by multiple genes, 
environmental factors, epigenetics, gene interactions, polygenic effects, and more. 

This application uses intentionally simplified educational models because:
1. The goal is to teach computational concepts, not replace biological research
2. Simplified models make the algorithmic patterns clear and understandable
3. Complete models would require decades of research data and domain expertise
4. Every model used here is clearly labeled with its assumptions and limitations

Every result includes an explanation of the model's assumptions so users understand what was 
simplified and why.`,
  },
];

export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-slate-100">About This Project</h1>
        <p className="text-slate-400 mt-2 leading-relaxed">
          An educational computational genetics application demonstrating software architecture,
          database design, probability algorithms, and simulation through a genetics problem domain.
        </p>
      </div>

      {/* Warning */}
      <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl p-5">
        <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-2 text-sm">
          <p className="font-semibold text-amber-300">What This Application Is NOT</p>
          <ul className="space-y-1 text-amber-200/70 text-xs leading-relaxed">
            <li>• A medical genetics tool or clinical decision system</li>
            <li>• A predictor of any real individual's traits or health outcomes</li>
            <li>• A replacement for professional genetic counseling</li>
            <li>• A comprehensive representation of real biological genetics</li>
            <li>• A research-grade computational genetics platform</li>
          </ul>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-8">
        {sections.map(({ icon: Icon, title, content }) => (
          <div key={title} className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-500/15 flex items-center justify-center border border-teal-500/25">
                <Icon size={15} className="text-teal-400" />
              </div>
              <h2 className="font-semibold text-slate-100">{title}</h2>
            </div>
            <div className="text-sm text-slate-400 leading-relaxed whitespace-pre-line">{content}</div>
          </div>
        ))}
      </div>

      {/* Distinction table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800">
          <h2 className="font-semibold text-slate-100">Distinguishing Fact from Model from Implementation</h2>
        </div>
        <div className="divide-y divide-slate-800">
          {[
            {
              type: 'Biological Fact',
              color: 'teal',
              example: 'Pea plants have genes that determine seed shape.',
            },
            {
              type: 'Simplified Educational Model',
              color: 'amber',
              example: 'In this app, R is fully dominant over r with no intermediate phenotype.',
            },
            {
              type: 'Software Implementation Decision',
              color: 'sky',
              example: 'Genetic rules are stored in a database table, not in code conditionals.',
            },
          ].map((row) => (
            <div key={row.type} className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full bg-${row.color}-500/15 border border-${row.color}-500/25 text-${row.color}-300 shrink-0`}>
                {row.type}
              </span>
              <p className="text-sm text-slate-400">{row.example}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
