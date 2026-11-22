import React from 'react';
import { Workflow, ShieldCheck, Zap, CheckCircle2, Eye, AlertTriangle, Globe, Network } from 'lucide-react';

interface NavbarProps {
  onOpenA11yModal: () => void;
  onOpenHITLModal?: () => void;
  waitingApproval: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenA11yModal, onOpenHITLModal, waitingApproval }) => {
  return (
    <header className="border-b border-slate-850 bg-slate-900/90 backdrop-blur sticky top-0 z-40 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-gradient-to-tr from-brand-600 to-indigo-500 rounded-xl shadow-md shadow-brand-500/20 text-white">
            <Workflow className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-lg font-black tracking-tight text-white">
                Nexus<span className="text-brand-400">Flow</span>
              </h1>
              <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-brand-500/10 text-brand-300 border border-brand-500/20">
                PS01: Agentic Workflow Automation
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Autonomous Incident Triage · Zero-Trust Security · Human-in-the-Loop Gate
            </p>
          </div>
        </div>

        {/* Status Pills & Actions */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Integrations Active Pills */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/40 border border-cyan-800/40 text-cyan-300 text-[11px] font-medium">
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>TinyFish: Web Agent</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-950/40 border border-purple-800/40 text-purple-300 text-[11px] font-medium">
            <Network className="w-3.5 h-3.5 text-purple-400" />
            <span>n8n: Workflow Hub</span>
          </div>

          <button
            onClick={onOpenA11yModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 text-teal-300 font-semibold transition"
            aria-label="View Accessibility Report"
          >
            <Eye className="w-3.5 h-3.5" aria-hidden="true" />
            <span>WCAG 2.1 AA</span>
          </button>

          {waitingApproval && onOpenHITLModal && (
            <button
              onClick={onOpenHITLModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition shadow-lg shadow-amber-500/20 animate-pulse"
              aria-label="Action awaiting human approval"
            >
              <AlertTriangle className="w-4 h-4 text-slate-950" />
              <span>Review Approval Needed</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
