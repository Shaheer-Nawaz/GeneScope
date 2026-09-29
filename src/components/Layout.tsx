import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Dna,
  FlaskConical,
  GitBranch,
  BarChart3,
  Zap,
  Info,
  BookOpen,
  Menu,
  X,
} from 'lucide-react';

const navLinks = [
  { to: '/', label: 'Home', icon: Dna },
  { to: '/simulator', label: 'Simulator', icon: FlaskConical },
  { to: '/cross', label: 'Parent Cross', icon: GitBranch },
  { to: '/montecarlo', label: 'Monte Carlo', icon: BarChart3 },
  { to: '/mutation', label: 'Mutation Lab', icon: Zap },
  { to: '/about', label: 'About', icon: Info },
  { to: '/assumptions', label: 'Model Assumptions', icon: BookOpen },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center border border-teal-500/30 group-hover:bg-teal-500/30 transition-colors">
                <Dna className="w-4.5 h-4.5 text-teal-400" size={18} />
              </div>
              <span className="font-semibold text-slate-100 tracking-tight text-sm hidden sm:block">
                Genome<span className="text-teal-400">→</span>Phenotype
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map(({ to, label, icon: Icon }) => {
                const active = location.pathname === to;
                return (
                  <Link
                    key={to}
                    to={to}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                      active
                        ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <Icon size={13} />
                    {label}
                  </Link>
                );
              })}
            </nav>

            {/* Mobile hamburger */}
            <button
              className="lg:hidden p-2 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="lg:hidden border-t border-slate-800 bg-slate-900 px-4 py-3 space-y-1">
            {navLinks.map(({ to, label, icon: Icon }) => {
              const active = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    active
                      ? 'bg-teal-500/20 text-teal-300'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-2">
          <p className="text-xs text-slate-500">
            Genetic Inheritance &amp; Phenotype Simulator — Educational Computational Genetics Project
          </p>
          <p className="text-xs text-amber-500/70">
            This application uses simplified educational models. Results are not medical predictions.
          </p>
        </div>
      </footer>
    </div>
  );
}
