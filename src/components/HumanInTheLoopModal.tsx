import React from 'react';
import { X, AlertTriangle, ShieldCheck, Check, Ban, Server } from 'lucide-react';
import { ActionPayload } from '../types';

interface HumanInTheLoopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: (token: string) => void;
  heldActions: ActionPayload[];
}

export const HumanInTheLoopModal: React.FC<HumanInTheLoopModalProps> = ({
  isOpen,
  onClose,
  onApprove,
  heldActions
}) => {
  const [token, setToken] = React.useState('');
  React.useEffect(() => { if (!isOpen) setToken(''); }, [isOpen]);
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="hitl-title"
    >
      <div className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" aria-hidden="true" />
            <h2 id="hitl-title" className="text-lg font-bold text-white">
              Human-in-the-Loop (HITL) Authorization Checkpoint
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning Banner */}
        <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-200 text-xs">
          <p className="font-semibold mb-1">High-Risk Operation Intercepted by Policy Sentinel:</p>
          <p className="text-amber-300/80">
            Per company safety compliance policy, destructive or financial actions require human administrator confirmation prior to execution.
          </p>
        </div>

        {/* Held Actions List */}
        <div className="space-y-3">
          {heldActions.map((act, idx) => (
            <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-amber-300 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                  {act.actionType}
                </span>
                <span className="text-xs font-mono text-slate-400">{act.targetDestination}</span>
              </div>
              <h4 className="text-xs font-semibold text-slate-200">{act.summary}</h4>
              <div className="bg-slate-900 p-2.5 rounded-lg text-[11px] font-mono text-slate-300">
                <pre>{JSON.stringify(act.details, null, 2)}</pre>
              </div>
            </div>
          ))}
        </div>

        <label className="block text-slate-200">Reviewer token<input type="password" className="block w-full bg-slate-950 p-2" value={token} onChange={e => setToken(e.target.value)} /></label>
        <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
          >
            Cancel / Hold
          </button>
          <button
            onClick={() => {
              onApprove(token);
              onClose();
            }}
            className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-600/20"
          >
            <Check className="w-4 h-4" />
            <span>Approve simulated action</span>
          </button>
        </div>
      </div>
    </div>
  );
};
