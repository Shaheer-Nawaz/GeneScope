import type { PunnettSquare, GenotypeProbability } from '@/types/genetics';

interface Props {
  punnett: PunnettSquare;
  genotypeProbabilities: GenotypeProbability[];
}

export default function PunnettSquareDisplay({ punnett, genotypeProbabilities }: Props) {
  const { parentAlleles1, parentAlleles2, cells } = punnett;

  const colorForGenotype = (gt: string) => {
    const gp = genotypeProbabilities.find((g) => g.genotype === gt);
    return gp?.phenotype?.color_hex ?? null;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Punnett Square</h3>

      <div className="overflow-x-auto">
        <table className="border-collapse mx-auto">
          <thead>
            <tr>
              <th className="w-14 h-14 border border-slate-700" />
              {parentAlleles2.map((a, i) => (
                <th
                  key={i}
                  className="w-24 h-14 border border-slate-700 bg-slate-800/60 text-teal-300 font-semibold text-base text-center"
                >
                  {a}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cells.map((row, ri) => (
              <tr key={ri}>
                <td className="w-14 h-20 border border-slate-700 bg-slate-800/60 text-teal-300 font-semibold text-base text-center">
                  {parentAlleles1[ri]}
                </td>
                {row.map((cell, ci) => {
                  const hex = colorForGenotype(cell.genotype);
                  return (
                    <td
                      key={ci}
                      className="w-24 h-20 border border-slate-700 text-center align-middle"
                    >
                      <div className="flex flex-col items-center justify-center gap-1.5 h-full py-2">
                        {hex && (
                          <div
                            className="w-4 h-4 rounded-full border border-white/20"
                            style={{ backgroundColor: hex }}
                          />
                        )}
                        <span className="font-semibold text-slate-100 text-sm">{cell.genotype}</span>
                        <span className="text-xs text-slate-500">
                          {cell.allele1} + {cell.allele2}
                        </span>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-slate-500 text-center">
        Rows = Parent 1 alleles · Columns = Parent 2 alleles
      </p>
    </div>
  );
}
