import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { MetricsBar } from './components/MetricsBar';
import { IncidentInput } from './components/IncidentInput';
import { WorkflowCanvas } from './components/WorkflowCanvas';
import { AgentExecutionLog } from './components/AgentExecutionLog';
import { SecurityGuardrailView } from './components/SecurityGuardrailView';
import { HumanInTheLoopModal } from './components/HumanInTheLoopModal';
import { AccessibilityModal } from './components/AccessibilityModal';
import { IntegrationsView } from './components/IntegrationsView';
import { WorkflowResult } from './types';
import {
  Zap,
  Shield,
  Terminal,
  Database,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Globe,
  Network,
  Wrench,
  Clock,
  Sparkles
} from 'lucide-react';

export const App: React.FC = () => {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [result, setResult] = useState<WorkflowResult | null>(null);
  const [activeTab, setActiveTab] = useState<'decision' | 'integrations' | 'security' | 'trace' | 'context'>('decision');
  const [isA11yModalOpen, setIsA11yModalOpen] = useState<boolean>(false);
  const [isHITLModalOpen, setIsHITLModalOpen] = useState<boolean>(false);
  const [error, setError] = useState('');

  const handleRunWorkflow = async (title: string, input: string) => {
    setError('');
    setResult(null);
    setIsRunning(true);

    try {
      const res = await fetch('/api/workflow/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, input })
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: WorkflowResult = await res.json();
      setResult(data);
    } catch {
      setError('Workflow could not run. Check the API connection and retry.');
    } finally {
      setIsRunning(false);
    }
  };

  const handleApproveAction = async (token: string) => {
    if (!result) return;
    setError('');
    setIsRunning(true);
    try {
      const res = await fetch('/api/workflow/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({ executionId: result.executionId })
      });
      if (!res.ok) throw new Error('Approval failed (' + res.status + '). Check reviewer access and retry.');
      setResult(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Approval failed');
    } finally {
      setIsRunning(false);
    }
  };

  const isWaitingApproval = result?.status === 'WAITING_HUMAN_APPROVAL';
  const isBlocked = result?.status === 'BLOCKED_BY_SECURITY';
  const heldActions = result?.actionsDispatched.filter(a => a.status === 'HELD_FOR_APPROVAL') || [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased">
      <Navbar
        onOpenA11yModal={() => setIsA11yModalOpen(true)}
        onOpenHITLModal={() => setIsHITLModalOpen(true)}
        waitingApproval={isWaitingApproval}
      />

      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-6 flex-1 w-full space-y-6" id="main-content">
        {/* Error notification */}
        {error && (
          <div role="alert" className="p-4 rounded-xl text-amber-200 bg-amber-950/80 border border-amber-800 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Top Performance Metrics */}
        <MetricsBar result={result} isRunning={isRunning} />

        {/* User Input & 1-Click Scenarios */}
        <IncidentInput onRunWorkflow={handleRunWorkflow} isRunning={isRunning} />

        {/* Visual Pipeline DAG Flow */}
        <WorkflowCanvas nodes={result?.nodes || []} />

        {/* AI Triage Executive Summary (Shows when a result exists) */}
        {result && (
          <div className={`p-5 rounded-2xl border shadow-lg transition-all ${
            isBlocked
              ? 'bg-rose-950/30 border-rose-500/50'
              : isWaitingApproval
              ? 'bg-amber-950/30 border-amber-500/50'
              : 'bg-emerald-950/30 border-emerald-500/40'
          }`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                    isBlocked
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : isWaitingApproval
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  }`}>
                    {isBlocked ? 'THREAT QUARANTINED' : isWaitingApproval ? 'HITL APPROVAL PENDING' : 'COMPLETED AUTONOMOUSLY'}
                  </span>
                  <span className="text-xs font-mono text-slate-400 font-bold">{result.incidentId}</span>
                </div>
                <h3 className="text-base font-extrabold text-white">
                  {result.decision.ruleName}
                </h3>
                <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
                  <strong>Strategy:</strong> {result.decision.chosenAction}
                </p>
              </div>

              {/* Quick Action Button for Human Approval */}
              {isWaitingApproval && (
                <button
                  onClick={() => setIsHITLModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-lg shadow-amber-500/20 flex items-center gap-2 shrink-0 self-start md:self-auto cursor-pointer"
                >
                  <AlertTriangle className="w-4 h-4 text-slate-950" />
                  <span>Review & Approve ({heldActions.length})</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Detail Workspace Tabs */}
        <div className="space-y-4">
          <div className="border-b border-slate-800 flex flex-wrap items-center justify-between gap-2" role="tablist">
            <div className="flex flex-wrap gap-1">
              <button
                role="tab"
                aria-selected={activeTab === 'decision'}
                onClick={() => setActiveTab('decision')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition rounded-t-lg ${
                  activeTab === 'decision'
                    ? 'border-brand-500 text-brand-300 bg-brand-500/10'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                }`}
              >
                <Zap className="w-4 h-4 text-brand-400" />
                <span>Dispatched Actions</span>
                {result?.actionsDispatched && (
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] font-mono">
                    {result.actionsDispatched.length}
                  </span>
                )}
              </button>

              <button
                role="tab"
                aria-selected={activeTab === 'integrations'}
                onClick={() => setActiveTab('integrations')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition rounded-t-lg ${
                  activeTab === 'integrations'
                    ? 'border-cyan-500 text-cyan-300 bg-cyan-500/10'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                }`}
              >
                <Globe className="w-4 h-4 text-cyan-400" />
                <span>TinyFish & n8n Hub</span>
                {result?.tinyfishReport && (
                  <span className="px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold font-mono">
                    LIVE
                  </span>
                )}
              </button>

              <button
                role="tab"
                aria-selected={activeTab === 'security'}
                onClick={() => setActiveTab('security')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition rounded-t-lg ${
                  activeTab === 'security'
                    ? 'border-blue-500 text-blue-300 bg-blue-500/10'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                }`}
              >
                <Shield className="w-4 h-4 text-blue-400" />
                <span>Security Shield</span>
                {result?.security && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    result.security.isSafe ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                  }`}>
                    {result.security.isSafe ? 'SAFE' : 'THREAT'}
                  </span>
                )}
              </button>

              <button
                role="tab"
                aria-selected={activeTab === 'trace'}
                onClick={() => setActiveTab('trace')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition rounded-t-lg ${
                  activeTab === 'trace'
                    ? 'border-purple-500 text-purple-300 bg-purple-500/10'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                }`}
              >
                <Terminal className="w-4 h-4 text-purple-400" />
                <span>Trace Logs</span>
                <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] font-mono">
                  {result?.logs.length || 0}
                </span>
              </button>

              <button
                role="tab"
                aria-selected={activeTab === 'context'}
                onClick={() => setActiveTab('context')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition rounded-t-lg ${
                  activeTab === 'context'
                    ? 'border-indigo-500 text-indigo-300 bg-indigo-500/10'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                }`}
              >
                <Database className="w-4 h-4 text-indigo-400" />
                <span>Context & SLA</span>
              </button>
            </div>
          </div>

          {/* Tab Content Panes */}
          <div className="pt-2">
            {/* Tab 1: Decision & Actions */}
            {activeTab === 'decision' && (
              <div className="space-y-4">
                {result?.actionsDispatched && result.actionsDispatched.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {result.actionsDispatched.map((act, idx) => {
                      const isHeld = act.status === 'HELD_FOR_APPROVAL';
                      const isResolved = act.status === 'RESOLVED';
                      return (
                        <div
                          key={idx}
                          className={`p-4 rounded-xl border transition shadow-sm space-y-2.5 ${
                            isHeld
                              ? 'bg-amber-950/20 border-amber-500/40'
                              : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-800 text-brand-300 border border-slate-750">
                              {act.actionType}
                            </span>
                            <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                              isHeld
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                                : isResolved
                                ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            }`}>
                              {act.status}
                            </span>
                          </div>

                          <h5 className="text-xs font-bold text-white leading-snug">{act.summary}</h5>

                          <div className="pt-1 border-t border-slate-850 flex items-center justify-between text-[11px] font-mono text-slate-400">
                            <span className="truncate max-w-[280px]">Target: {act.targetDestination}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-8 text-center text-slate-500">
                    <Zap className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                    <p className="text-xs text-slate-400">No actions dispatched yet. Run a scenario above.</p>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: TinyFish & n8n Hub */}
            {activeTab === 'integrations' && (
              <IntegrationsView
                tinyfishReport={result?.tinyfishReport}
                n8nSyncReport={result?.n8nSyncReport}
              />
            )}

            {/* Tab 3: Security Sentinel */}
            {activeTab === 'security' && (
              <SecurityGuardrailView security={result?.security || null} />
            )}

            {/* Tab 4: Trace Logs */}
            {activeTab === 'trace' && (
              <AgentExecutionLog logs={result?.logs || []} />
            )}

            {/* Tab 5: Context & SLA */}
            {activeTab === 'context' && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-lg">
                <h3 className="text-sm font-extrabold text-white">Synthesized Incident & Customer Context</h3>
                {result?.context ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-[11px] text-slate-400 uppercase font-mono font-semibold">Customer Account Tier</span>
                      <p className="text-sm font-extrabold text-white">{result.context.customerTier}</p>
                    </div>
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-[11px] text-slate-400 uppercase font-mono font-semibold">Target SLA Window</span>
                      <p className="text-sm font-extrabold text-brand-400">{result.context.slaMinutes} Minutes</p>
                    </div>
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-[11px] text-slate-400 uppercase font-mono font-semibold">System Impact</span>
                      <p className="text-sm font-extrabold text-slate-200">{result.context.systemImpact}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No context extracted yet. Run a scenario above.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-850 py-4 text-center text-xs text-slate-500">
        NexusFlow · Problem Statement PS01: Agentic Workflow Automation · Autonomous Triage with TinyFish & n8n
      </footer>

      {/* HITL Modal */}
      <HumanInTheLoopModal
        isOpen={isHITLModalOpen}
        onClose={() => setIsHITLModalOpen(false)}
        onApprove={handleApproveAction}
        heldActions={heldActions}
      />

      {/* Accessibility Audit Modal */}
      <AccessibilityModal
        isOpen={isA11yModalOpen}
        onClose={() => setIsA11yModalOpen(false)}
      />
    </div>
  );
};
