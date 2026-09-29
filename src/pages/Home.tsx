import { Link } from 'react-router-dom';
import { FlaskConical, GitBranch, BarChart3, Zap, ArrowRight, Dna, Database, Cpu } from 'lucide-react';
import Disclaimer from '@/components/Disclaimer';

const features = [
  {
    icon: FlaskConical,
    title: 'Genotype Predictor',
    description:
      'Select an organism and trait, enter a genotype, and instantly get the predicted phenotype with a full genetic explanation.',
    to: '/simulator',
    cta: 'Open Simulator',
    color: 'teal',
  },
  {
    icon: GitBranch,
    title: 'Parent Cross',
    description:
      'Cross two parent genotypes. Get the full Punnett square, genotype ratios, and phenotype probabilities — all calculated dynamically.',
    to: '/cross',
    cta: 'Explore Parent Cross',
    color: 'sky',
  },
  {
    icon: BarChart3,
    title: 'Monte Carlo Simulation',
    description:
      'Run thousands of simulated offspring to observe how real populations deviate from theoretical ratios — and converge as sample size grows.',
    to: '/montecarlo',
    cta: 'Run Simulation',
    color: 'violet',
  },
  {
    icon: Zap,
    title: 'Mutation Lab',
    description:
      'Apply substitution, insertion, and deletion mutations to a DNA sequence and see exactly how the sequence changes at the molecular level.',
    to: '/mutation',
    cta: 'Try Mutation Lab',
    color: 'amber',
  },
];

const pillars = [
  {
    icon: Database,
    title: 'Data-Driven Rules',
    body: 'All genetic rules are stored in a relational database. No hard-coded biology — adding a new organism or trait is a data change, not a code change.',
  },
  {
    icon: Cpu,
    title: 'Real Calculations',
    body: 'Every probability is computed from actual parental alleles and stored genotype rules. Results are never pre-loaded or faked.',
  },
  {
    icon: Dna,
    title: 'Multiple Inheritance Models',
    body: 'Supports complete dominance, incomplete dominance, and codominance. Designed to be extended with additional models.',
  },
];

export default function Home() {
  return (
    <div className="space-y-24 pb-24">
      {/* Hero */}
      <section className="relative overflow-hidden pt-16 pb-10 sm:pt-24 sm:pb-16">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-500/8 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/20 rounded-full px-4 py-1.5 text-xs text-teal-300 font-medium tracking-wide">
            <Dna size={12} />
            Educational Computational Genetics
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
            <span className="text-slate-100">GENOME</span>
            <span className="text-teal-400 mx-3">→</span>
            <span className="text-slate-100">PHENOTYPE</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Explore genetic inheritance through computational simulation. Predict phenotypes,
            cross parents, run Monte Carlo experiments, and model DNA mutations — all powered
            by real data-driven genetic rules.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to="/simulator"
              className="flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-slate-900 font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors"
            >
              Start Simulation
              <ArrowRight size={15} />
            </Link>
            <Link
              to="/cross"
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-100 font-medium px-5 py-2.5 rounded-lg text-sm border border-slate-700 transition-colors"
            >
              Explore Parent Cross
            </Link>
          </div>

          <div className="pt-4 max-w-2xl mx-auto">
            <Disclaimer />
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-100">Simulation Modules</h2>
          <p className="mt-2 text-slate-400 text-sm">Four independent computational modules, each demonstrating a different aspect of genetics.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map(({ icon: Icon, title, description, to, cta, color }) => (
            <div
              key={to}
              className="group bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4 hover:border-slate-700 transition-all"
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-${color}-500/15 border border-${color}-500/25`}>
                <Icon size={18} className={`text-${color}-400`} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-100 text-sm mb-1.5">{title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{description}</p>
              </div>
              <Link
                to={to}
                className="flex items-center gap-1.5 text-xs font-medium text-teal-400 hover:text-teal-300 transition-colors group-hover:gap-2"
              >
                {cta}
                <ArrowRight size={12} />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Architecture pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 sm:p-10">
          <h2 className="text-xl font-bold text-slate-100 mb-6">Engineering Philosophy</h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {pillars.map(({ icon: Icon, title, body }) => (
              <div key={title} className="flex flex-col gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-md bg-teal-500/15 flex items-center justify-center border border-teal-500/25">
                    <Icon size={14} className="text-teal-400" />
                  </div>
                  <h3 className="font-semibold text-slate-200 text-sm">{title}</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Organisms */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl font-bold text-slate-100 mb-6">Supported Organisms (Version 1)</h2>
        <div className="grid sm:grid-cols-2 gap-5">
          {[
            {
              name: 'Pea Plant',
              sci: 'Pisum sativum',
              traits: ['Seed Shape (Complete Dominance)', 'Seed Color (Complete Dominance)', 'Flower Color (Incomplete Dominance)'],
              desc: "Gregor Mendel's original model organism for discovering the laws of heredity.",
            },
            {
              name: 'Fruit Fly',
              sci: 'Drosophila melanogaster',
              traits: ['Eye Color (Complete Dominance)', 'Wing Shape (Complete Dominance)', 'Body Color (Codominance)'],
              desc: 'A foundational model organism in genetics research with well-characterised, easily observable traits.',
            },
          ].map((org) => (
            <div key={org.name} className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <div className="mb-3">
                <h3 className="font-semibold text-slate-100">{org.name}</h3>
                <p className="text-xs text-teal-400 italic">{org.sci}</p>
              </div>
              <p className="text-xs text-slate-400 mb-4">{org.desc}</p>
              <ul className="space-y-1.5">
                {org.traits.map((t) => (
                  <li key={t} className="flex items-center gap-2 text-xs text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
