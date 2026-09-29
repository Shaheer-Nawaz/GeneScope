import { AlertTriangle } from 'lucide-react';

export default function Disclaimer({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-xs text-amber-300/80">
        <AlertTriangle size={13} className="mt-0.5 shrink-0 text-amber-400" />
        <span>
          Educational simulation only. Not a medical predictor. Results are based on simplified models.
        </span>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-sm text-amber-200/80">
      <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-400" />
      <div>
        <p className="font-semibold text-amber-300 mb-1">Educational Disclaimer</p>
        <p>
          This application is an educational computational genetics simulator. Its predictions are based on
          simplified models and should <strong>not</strong> be interpreted as medical, clinical, or
          real-world genetic predictions. It does not diagnose disease, predict individual health outcomes,
          or replace professional genetic counseling.
        </p>
      </div>
    </div>
  );
}
