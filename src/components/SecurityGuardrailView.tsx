import React from 'react';
import { SecurityAnalysis } from '../types';
import { ShieldCheck, ShieldAlert, AlertOctagon, Lock, Eye } from 'lucide-react';

interface SecurityGuardrailViewProps {
  security: SecurityAnalysis | null;
}

export const SecurityGuardrailView: React.FC<SecurityGuardrailViewProps> = ({ security }) => {
  if (!security) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-500">
        <Lock className="w-8 h-8 text-slate-600 mx-auto mb-2" />
        <p className="text-sm font-semibold text-slate-300">Prompt Shield & Threat Sentinel Ready</p>
        <p className="text-xs text-slate-500 mt-1">Ingest a prompt above to view real-time zero-trust security inspection.</p>
      </div>
    );
  }

  const isSafe = security.isSafe;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md">
      {/* Header */}
      <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {isSafe ? (
            <ShieldCheck className="w-4 h-4 text-emerald-400" aria-hidden="true" />
          ) : (
            <AlertOctagon className="w-4 h-4 text-red-400" aria-hidden="true" />
          )}
          <h3 className="text-sm font-bold text-white">Zero-Trust Prompt Shield & Input Guardrail</h3>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
            isSafe ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'bg-red-500/10 text-red-300 border border-red-500/20'
          }`}>
            Guardrail Score: {security.guardrailScore} / 100
          </span>
          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
            isSafe ? 'bg-slate-800 text-slate-300' : 'bg-red-950/40 text-red-400 border border-red-800/40'
          }`}>
            Threat Level: {security.threatLevel}
          </span>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-4 space-y-4">
        {/* Threat Alert */}
        {!isSafe && (
          <div className="bg-red-950/30 border border-red-500/40 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center gap-2 text-red-300 font-bold text-xs">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <span>Adversarial Prompt Injections Quarantined ({security.threatsDetected.length})</span>
            </div>
            <ul className="list-disc list-inside text-xs text-red-200/90 space-y-1">
              {security.threatsDetected.map((threat, idx) => (
                <li key={idx}><strong>{threat}</strong>: Pattern matched against zero-trust injection catalog.</li>
              ))}
            </ul>
          </div>
        )}

        {/* Sanitization Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <h4 className="text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-blue-400" />
              <span>PII & Secret Masking Pipeline</span>
            </h4>
            <p className="text-[11px] text-slate-400">
              Scans API tokens, bearer keys, and card numbers, replacing them with immutable redaction placeholders.
            </p>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <h4 className="text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-purple-400" />
              <span>Sanitized Output Preview</span>
            </h4>
            <p className="text-[11px] font-mono text-emerald-300/90 truncate">
              {security.sanitizedInput}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
