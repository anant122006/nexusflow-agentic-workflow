import React from 'react';
import { WorkflowResult } from '../types';
import { Clock, ShieldCheck, Zap, Layers, Target, AlertOctagon } from 'lucide-react';

interface MetricsBarProps {
  result: WorkflowResult | null;
  isRunning: boolean;
}

export const MetricsBar: React.FC<MetricsBarProps> = ({ result, isRunning }) => {
  const isBlocked = result?.status === 'BLOCKED_BY_SECURITY';

  return (
    <section aria-label="System Metrics" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
      {/* 1. Account Context & SLA */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 shadow-sm hover:border-slate-700 transition">
        <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
          <span className="font-semibold text-slate-400">Customer SLA</span>
          <Target className="w-4 h-4 text-brand-400" aria-hidden="true" />
        </div>
        <div className="text-base font-extrabold text-white truncate">
          {result ? result.context.customerTier.split(' ')[0] : isRunning ? 'Extracting...' : '—'}
        </div>
        <div className="text-[11px] text-brand-300 font-medium truncate mt-0.5">
          {result ? `${result.context.slaMinutes}m Response SLA` : 'Ready for input'}
        </div>
      </div>

      {/* 2. Decision Intelligence Confidence */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 shadow-sm hover:border-slate-700 transition">
        <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
          <span className="font-semibold text-slate-400">AI Confidence</span>
          <Zap className="w-4 h-4 text-amber-400" aria-hidden="true" />
        </div>
        <div className="text-base font-extrabold text-amber-300">
          {result ? `${result.decision.confidenceScore}%` : isRunning ? 'Evaluating...' : '—'}
        </div>
        <div className="text-[11px] text-slate-400 truncate mt-0.5">
          {result ? result.decision.ruleName.split(' ')[0] + ' Policy' : 'Strategy router'}
        </div>
      </div>

      {/* 3. Security Guardrail Score */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 shadow-sm hover:border-slate-700 transition">
        <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
          <span className="font-semibold text-slate-400">Security Sentinel</span>
          {isBlocked ? (
            <AlertOctagon className="w-4 h-4 text-red-400" aria-hidden="true" />
          ) : (
            <ShieldCheck className="w-4 h-4 text-blue-400" aria-hidden="true" />
          )}
        </div>
        <div className={`text-base font-extrabold ${isBlocked ? 'text-red-400' : 'text-blue-300'}`}>
          {result ? (isBlocked ? 'THREAT QUARANTINED' : `${result.security.guardrailScore}/100 Safe`) : isRunning ? 'Scanning...' : '—'}
        </div>
        <div className="text-[11px] text-slate-400 truncate mt-0.5">
          {isBlocked ? 'Execution blocked' : 'Prompt injection shield'}
        </div>
      </div>

      {/* 4. Action Records */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 shadow-sm hover:border-slate-700 transition">
        <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
          <span className="font-semibold text-slate-400">Dispatched Actions</span>
          <Layers className="w-4 h-4 text-purple-400" aria-hidden="true" />
        </div>
        <div className="text-base font-extrabold text-purple-300">
          {result ? `${result.actionsDispatched.length} Tools` : isRunning ? 'Dispatching...' : '—'}
        </div>
        <div className="text-[11px] text-slate-400 truncate mt-0.5">
          Jira, Slack, TinyFish, n8n
        </div>
      </div>

      {/* 5. Latency */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 shadow-sm hover:border-slate-700 transition col-span-2 sm:col-span-1">
        <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
          <span className="font-semibold text-slate-400">Execution Speed</span>
          <Clock className="w-4 h-4 text-emerald-400" aria-hidden="true" />
        </div>
        <div className="text-base font-extrabold text-emerald-300">
          {result ? `${result.executionTimeMs}ms` : isRunning ? 'Running...' : '—'}
        </div>
        <div className="text-[11px] text-slate-400 truncate mt-0.5">
          Sub-500ms DAG runtime
        </div>
      </div>
    </section>
  );
};
