import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { MetricsBar } from './components/MetricsBar';
import { IncidentInput } from './components/IncidentInput';
import { WorkflowCanvas } from './components/WorkflowCanvas';
import { AgentExecutionLog } from './components/AgentExecutionLog';
import { SecurityGuardrailView } from './components/SecurityGuardrailView';
import { HumanInTheLoopModal } from './components/HumanInTheLoopModal';
import { AccessibilityModal } from './components/AccessibilityModal';
import { WorkflowResult } from './types';
import { Zap, Shield, Terminal, Database, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

export const App: React.FC = () => {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [result, setResult] = useState<WorkflowResult | null>(null);
  const [activeTab, setActiveTab] = useState<'decision' | 'security' | 'trace' | 'context'>('decision');
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
  const heldActions = result?.actionsDispatched.filter(a => a.status === 'HELD_FOR_APPROVAL') || [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar
        onOpenA11yModal={() => setIsA11yModalOpen(true)}
        onOpenHITLModal={() => setIsHITLModalOpen(true)}
        waitingApproval={isWaitingApproval}
      />

      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-6 flex-1 w-full" id="main-content">
        <p className="text-sm text-slate-300">Incident routing workspace · Simulated external actions</p>
        {error && <p role="alert" className="p-4 text-amber-200 bg-amber-950">{error}</p>}
        <MetricsBar result={result} isRunning={isRunning} />

        {/* Input & Scenario Selector */}
        <IncidentInput onRunWorkflow={handleRunWorkflow} isRunning={isRunning} />

        {/* Dynamic DAG Canvas */}
        <div className="mb-6">
          <WorkflowCanvas nodes={result?.nodes || []} />
        </div>

        {/* Tabbed Workspace */}
        <div className="space-y-4">
          <div className="border-b border-slate-800 flex flex-wrap items-center justify-between gap-2" role="tablist">
            <div className="flex space-x-1">
              <button
                role="tab"
                aria-selected={activeTab === 'decision'}
                onClick={() => setActiveTab('decision')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition ${
                  activeTab === 'decision'
                    ? 'border-brand-500 text-brand-400 bg-brand-500/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Zap className="w-4 h-4" />
                <span>Decision & Dispatched Actions</span>
                {result?.actionsDispatched && (
                  <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px]">
                    {result.actionsDispatched.length}
                  </span>
                )}
              </button>

              <button
                role="tab"
                aria-selected={activeTab === 'security'}
                onClick={() => setActiveTab('security')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition ${
                  activeTab === 'security'
                    ? 'border-brand-500 text-brand-400 bg-brand-500/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Security & Threat Sentinel</span>
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
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition ${
                  activeTab === 'trace'
                    ? 'border-brand-500 text-brand-400 bg-brand-500/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Terminal className="w-4 h-4" />
                <span>Multi-Agent Trace Logs</span>
                <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px]">
                  {result?.logs.length || 0}
                </span>
              </button>

              <button
                role="tab"
                aria-selected={activeTab === 'context'}
                onClick={() => setActiveTab('context')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition ${
                  activeTab === 'context'
                    ? 'border-brand-500 text-brand-400 bg-brand-500/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Database className="w-4 h-4" />
                <span>Context & SLA Extraction</span>
              </button>
            </div>

            {isWaitingApproval && (
              <button
                onClick={() => setIsHITLModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold transition hover:bg-amber-500/30"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Review Held Actions ({heldActions.length})</span>
              </button>
            )}
          </div>

          {/* Tab Content */}
          <div className="pt-2">
            {activeTab === 'decision' && (
              <div className="space-y-4">
                {/* Decision Banner */}
                {result?.decision && (
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-brand-400">{result.decision.decisionId}</span>
                        <h4 className="text-sm font-bold text-white">{result.decision.ruleName}</h4>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        <strong>Condition Met:</strong> <code className="text-amber-300 font-mono text-[11px]">{result.decision.conditionMet}</code>
                      </p>
                      <p className="text-xs text-slate-300 mt-1">
                        <strong>Chosen Strategy:</strong> {result.decision.chosenAction}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono px-2.5 py-1 rounded bg-brand-500/10 text-brand-300 border border-brand-500/20 font-bold block">
                        Configured rule score: {result.decision.confidenceScore}%
                      </span>
                    </div>
                  </div>
                )}

                {/* Dispatched Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {result?.actionsDispatched.map((act, idx) => (
                    <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-brand-300 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                          {act.actionType}
                        </span>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                          act.status === 'HELD_FOR_APPROVAL'
                            ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                            : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                        }`}>
                          {act.status}
                        </span>
                      </div>
                      <h5 className="text-xs font-bold text-slate-200">{act.summary}</h5>
                      <p className="text-[11px] font-mono text-slate-400">Target: {act.targetDestination}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'security' && <SecurityGuardrailView security={result?.security || null} />}
            {activeTab === 'trace' && <AgentExecutionLog logs={result?.logs || []} />}
            {activeTab === 'context' && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                <h3 className="text-sm font-bold text-white">Synthesized Incident Context</h3>
                {result?.context ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-850">
                      <span className="text-xs text-slate-500">Customer Account Tier</span>
                      <p className="text-sm font-bold text-slate-200">{result.context.customerTier}</p>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-850">
                      <span className="text-xs text-slate-500">Target SLA Response Window</span>
                      <p className="text-sm font-bold text-brand-400">{result.context.slaMinutes} Minutes</p>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-850">
                      <span className="text-xs text-slate-500">Detected Intent</span>
                      <p className="text-xs font-semibold text-slate-200">{result.context.detectedIntent}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">No context extracted yet.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <HumanInTheLoopModal
        isOpen={isHITLModalOpen}
        onClose={() => setIsHITLModalOpen(false)}
        onApprove={handleApproveAction}
        heldActions={heldActions}
      />

      <AccessibilityModal
        isOpen={isA11yModalOpen}
        onClose={() => setIsA11yModalOpen(false)}
      />
    </div>
  );
};
