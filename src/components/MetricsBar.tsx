import React from 'react';
import { WorkflowResult } from '../types';
import { Clock, ShieldCheck, Zap, TrendingDown, Target, AlertOctagon } from 'lucide-react';

interface MetricsBarProps {
  result: WorkflowResult | null;
  isRunning: boolean;
}

export const MetricsBar: React.FC<MetricsBarProps> = ({ result, isRunning }) => {
  const isBlocked = result?.status === 'BLOCKED_BY_SECURITY';

  return (
    <section aria-label="System Performance and Context Metrics" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
      {/* 1. Account Context & SLA */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-sm">
        <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
          <span className="font-medium">Context & SLA</span>
          <Target className="w-4 h-4 text-brand-400" aria-hidden="true" />
        </div>
        <div className="text-lg font-bold text-slate-100 truncate">
          {result ? result.context.customerTier.split(' ')[0] : isRunning ? 'Extracting...' : '—'}
        </div>
        <div className="text-[11px] text-brand-300 font-medium truncate">
          {result ? `SLA: ${result.context.slaMinutes}m response target` : 'Awaiting incident'}
        </div>
      </div>

      {/* 2. Decision Intelligence Confidence */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-sm">
        <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
          <span className="font-medium">Rule score</span>
          <Zap className="w-4 h-4 text-amber-400" aria-hidden="true" />
        </div>
        <div className="text-xl font-bold text-amber-400">
          {result ? `${result.decision.confidenceScore}%` : isRunning ? 'Evaluating...' : '—'}
        </div>
        <div className="text-[11px] text-slate-500 truncate">
          Configured by policy
        </div>
      </div>

      {/* 3. Security Guardrail Score */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-sm">
        <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
          <span className="font-medium">Zero-Trust Guardrail</span>
          {isBlocked ? (
            <AlertOctagon className="w-4 h-4 text-red-400" aria-hidden="true" />
          ) : (
            <ShieldCheck className="w-4 h-4 text-blue-400" aria-hidden="true" />
          )}
        </div>
        <div className={`text-xl font-bold ${isBlocked ? 'text-red-400' : 'text-blue-400'}`}>
          {result ? (isBlocked ? 'THREAT BLOCKED' : `${result.security.guardrailScore}/100`) : isRunning ? 'Scanning...' : '—'}
        </div>
        <div className="text-[11px] text-slate-500 truncate">
          {isBlocked ? 'Pipeline quarantined' : 'Prompt injection defense'}
        </div>
      </div>

      {/* 4. Token & Resource Efficiency */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-sm">
        <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
          <span className="font-medium">Action records</span>
          <TrendingDown className="w-4 h-4 text-purple-400" aria-hidden="true" />
        </div>
        <div className="text-xl font-bold text-purple-300">
          {result ? result.actionsDispatched.length : isRunning ? 'Processing...' : '—'}
        </div>
        <div className="text-[11px] text-slate-500 truncate">
          Simulated dispatches
        </div>
      </div>

      {/* 5. Latency */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-sm col-span-2 sm:col-span-1">
        <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
          <span className="font-medium">Pipeline Latency</span>
          <Clock className="w-4 h-4 text-emerald-400" aria-hidden="true" />
        </div>
        <div className="text-xl font-bold text-emerald-300">
          {result ? `${result.executionTimeMs}ms` : isRunning ? 'Executing...' : '—'}
        </div>
        <div className="text-[11px] text-slate-500 truncate">
          Server processing time
        </div>
      </div>
    </section>
  );
};
