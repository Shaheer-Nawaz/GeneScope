import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { GenotypeProbability, PhenotypeProbability } from '@/types/genetics';

const DEFAULT_COLORS = ['#14b8a6', '#0ea5e9', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981'];

interface GenotypeProbChartProps {
  data: GenotypeProbability[];
}

export function GenotypeProbabilityChart({ data }: GenotypeProbChartProps) {
  const chartData = data.map((gp) => ({
    name: gp.genotype,
    probability: Math.round(gp.probability * 100),
    color: gp.phenotype?.color_hex ?? DEFAULT_COLORS[0],
  }));

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
          <YAxis
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            tickFormatter={(v) => `${v}%`}
            domain={[0, 100]}
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: 8 }}
            labelStyle={{ color: '#e2e8f0' }}
            formatter={(v: number) => [`${v}%`, 'Probability']}
          />
          <Bar dataKey="probability" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

interface PhenotypeProbChartProps {
  data: PhenotypeProbability[];
}

export function PhenotypeProbabilityChart({ data }: PhenotypeProbChartProps) {
  const chartData = data.map((pp) => ({
    name: pp.phenotype.name,
    probability: Math.round(pp.probability * 100),
    color: pp.phenotype.color_hex ?? DEFAULT_COLORS[0],
  }));

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
          <YAxis
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            tickFormatter={(v) => `${v}%`}
            domain={[0, 100]}
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: 8 }}
            labelStyle={{ color: '#e2e8f0' }}
            formatter={(v: number) => [`${v}%`, 'Probability']}
          />
          <Bar dataKey="probability" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
