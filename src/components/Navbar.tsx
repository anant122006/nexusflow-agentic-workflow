import React from 'react';
import { Workflow, ShieldCheck, Zap, CheckCircle2, Eye, AlertTriangle } from 'lucide-react';

interface NavbarProps {
  onOpenA11yModal: () => void;
  onOpenHITLModal?: () => void;
  waitingApproval: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenA11yModal, onOpenHITLModal, waitingApproval }) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Brand & Vertical Indicator */}
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-tr from-brand-600 to-indigo-400 rounded-lg shadow-lg shadow-brand-500/20 text-white">
            <Workflow className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-extrabold tracking-tight text-white">
                Nexus<span className="text-brand-400">Flow</span>
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-brand-500/10 text-brand-300 border border-brand-500/20">
                PS01: Agentic Workflow Automation
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Context-Aware Decision Routing • Zero-Trust Prompt Shield • Human-in-the-Loop Safety
            </p>
          </div>
        </div>

        {/* Evaluation Focus Badges */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs" role="region" aria-label="Evaluation Metrics">
          <span className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-brand-300 font-medium">
            <Zap className="w-3.5 h-3.5 text-brand-400" aria-hidden="true" />
            <span>Logic: Dynamic Routing</span>
          </span>
          <span className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-blue-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Security: Zero-Trust Guardrail</span>
          </span>
          <span className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-emerald-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>External actions: simulated</span>
          </span>
          <button
            onClick={onOpenA11yModal}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-teal-300 font-medium transition focus:ring-2 focus:ring-brand-400"
            aria-label="View Accessibility Report"
          >
            <Eye className="w-3.5 h-3.5" aria-hidden="true" />
            <span>WCAG 2.1 AA</span>
          </button>
          {waitingApproval && onOpenHITLModal && (
            <button
              onClick={onOpenHITLModal}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold transition hover:bg-amber-500/30 animate-pulse"
              aria-label="Action awaiting human approval"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>HITL Approval Needed</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
