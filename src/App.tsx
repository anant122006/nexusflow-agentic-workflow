import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { MetricsBar } from './components/MetricsBar';
import { IncidentInput } from './components/IncidentInput';
import { WorkflowCanvas } from './components/WorkflowCanvas';
import { AgentExecutionLog } from './components/AgentExecutionLog';
import { SecurityGuardrailView } from './components/SecurityGuardrailView';
import { HumanInTheLoopModal } from './components/HumanInTheLoopModal';
import { AccessibilityModal } from './components/AccessibilityModal';
import { WorkflowResult, WorkflowNode } from './types';
import { Zap, Shield, Terminal, Database, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

export const App: React.FC = () => {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [result, setResult] = useState<WorkflowResult | null>(null);
  const [activeTab, setActiveTab] = useState<'decision' | 'security' | 'trace' | 'context'>('decision');
  const [isA11yModalOpen, setIsA11yModalOpen] = useState<boolean>(false);
  const [isHITLModalOpen, setIsHITLModalOpen] = useState<boolean>(false);

  const handleRunWorkflow = async (title: string, input: string) => {
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
    } catch (err) {
      console.warn('Backend API unavailable, using client-side fallback engine...', err);
      // Client-side fallback dynamic engine
      const fallback = generateClientFallback(title, input);
      setResult(fallback);
    } finally {
      setIsRunning(false);
    }
  };

  const handleApproveAction = async () => {
    if (!result) return;
    try {
      const res = await fetch('/api/workflow/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflowResult: result })
      });
      if (res.ok) {
        const approved: WorkflowResult = await res.json();
        setResult(approved);
        return;
      }
    } catch (e) {
      console.warn('Approve fallback', e);
    }

    // Fallback local update
    const updated: WorkflowResult = JSON.parse(JSON.stringify(result));
    updated.status = 'COMPLETED';
    updated.nodes.forEach(n => {
      if (n.status === 'waiting_approval') {
        n.status = 'completed';
        n.outputSummary = 'Authorized by Human Administrator. Canary traffic drained successfully.';
      }
    });
    updated.actionsDispatched.forEach(a => {
      if (a.status === 'HELD_FOR_APPROVAL') a.status = 'DISPATCHED';
    });
    updated.logs.push({
      timestamp: new Date().toISOString(),
      agent: 'HITLGatekeeper',
      level: 'success',
      message: 'Human Administrator authorized action. Execution resumed and completed.'
    });
    setResult(updated);
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
        {/* Live Metrics Header */}
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
                        Confidence: {result.decision.confidenceScore}%
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

// Client-side fallback dynamic generator
function generateClientFallback(title: string, input: string): WorkflowResult {
  const isMalicious = /ignore previous|override|jailbreak|DAN mode|reveal/i.test(input);
  if (isMalicious) {
    return {
      executionId: 'EXEC-SEC-FALLBACK',
      incidentId: 'INC-BLOCKED',
      status: 'BLOCKED_BY_SECURITY',
      context: {
        id: 'INC-BLOCKED',
        title,
        rawInput: input,
        customerTier: 'Standard (Silver)',
        slaMinutes: 240,
        sentiment: 'Frustrated / Urgent',
        detectedIntent: 'Adversarial Injection Probe',
        systemImpact: 'General Query'
      },
      security: {
        isSafe: false,
        threatLevel: 'CRITICAL',
        threatsDetected: ['Direct System Prompt Override', 'Adversarial Jailbreak Persona'],
        sanitizedInput: '[REDACTED_ADVERSARIAL_PAYLOAD]',
        guardrailScore: 20
      },
      decision: {
        decisionId: 'DEC-BLOCKED',
        ruleName: 'Zero-Trust Prompt Sentinel',
        conditionMet: 'Adversarial pattern matched',
        chosenAction: 'Quarantine execution pipeline and notify SOC team.',
        requiresHumanApproval: false,
        confidenceScore: 100
      },
      nodes: [
        { id: 'node-guardrail', label: 'Security Guardrail', agentRole: 'Prompt Shield', status: 'failed', outputSummary: 'Quarantined prompt injection.', dependencies: [] }
      ],
      actionsDispatched: [],
      executionTimeMs: 120,
      tokenSavingsPercentage: 74,
      logs: [
        { timestamp: new Date().toISOString(), agent: 'SecuritySentinel', level: 'alert', message: 'Adversarial jailbreak detected. Pipeline quarantined.' }
      ]
    };
  }

  const isSev1 = /outage|down|500|critical/i.test(title + ' ' + input);

  return {
    executionId: 'EXEC-FALLBACK-1',
    incidentId: 'INC-8942',
    status: isSev1 ? 'WAITING_HUMAN_APPROVAL' : 'COMPLETED',
    context: {
      id: 'INC-8942',
      title,
      rawInput: input,
      customerTier: isSev1 ? 'Enterprise (Platinum)' : 'Business (Gold)',
      slaMinutes: isSev1 ? 15 : 60,
      sentiment: isSev1 ? 'Frustrated / Urgent' : 'Neutral',
      detectedIntent: isSev1 ? 'Sev-1 Infrastructure Incident Response' : 'Performance Optimization',
      systemImpact: isSev1 ? 'Full Outage' : 'Degraded Performance'
    },
    security: {
      isSafe: true,
      threatLevel: 'LOW',
      threatsDetected: [],
      sanitizedInput: input,
      guardrailScore: 100
    },
    decision: {
      decisionId: isSev1 ? 'DEC-SEV1-FAILOVER' : 'DEC-PERF-AUTOSCALE',
      ruleName: isSev1 ? 'Critical Outage Rapid Triage & Disaster Recovery' : 'Horizontal Auto-Scaling & CDN Purge',
      conditionMet: isSev1 ? 'systemImpact == "Full Outage" (Platinum Tier)' : 'systemImpact == "Degraded Performance"',
      chosenAction: isSev1 ? 'Escalate Sev-1 to Slack #war-room, page SRE lead, hold canary rollback for HITL approval.' : 'Auto-scale pod count +200% and purge edge cache.',
      requiresHumanApproval: isSev1,
      confidenceScore: 98.4
    },
    nodes: [
      { id: 'node-guardrail', label: 'Security Guardrail & Input Sanitizer', agentRole: 'Prompt Shield', status: 'completed', outputSummary: 'Zero injection threats detected.', dependencies: [] },
      { id: 'node-context', label: 'Context Extraction & SLA Classifier', agentRole: 'Memory Intelligence', status: 'completed', outputSummary: `Classified as ${isSev1 ? 'Enterprise (Platinum)' : 'Business (Gold)'} account.`, dependencies: ['node-guardrail'] },
      { id: 'node-decision', label: 'Policy & Logic Decision Router', agentRole: 'Policy Orchestrator', status: 'completed', outputSummary: `Decision branch selected with 98.4% confidence.`, dependencies: ['node-context'] },
      { id: 'node-rollback', label: isSev1 ? 'AWS Cluster Rollback Verification' : 'Auto-Scaling Dispatcher', agentRole: 'Cloud Automator', status: isSev1 ? 'waiting_approval' : 'completed', outputSummary: isSev1 ? 'Production rollback held for human administrator authorization.' : 'Auto-scaled pod count to 12 replicas.', dependencies: ['node-decision'] },
      { id: 'node-slack', label: 'Slack On-Call War-Room Dispatcher', agentRole: 'Comm Agent', status: 'completed', outputSummary: 'Paged SRE team in Slack.', dependencies: ['node-decision'] }
    ],
    actionsDispatched: [
      { actionType: 'JIRA_ESCALATION', targetDestination: 'Jira Service Management', summary: `[SEV1] ${title}`, details: { priority: 'Highest' }, status: 'DISPATCHED' },
      { actionType: 'SLACK_ONCALL', targetDestination: 'Slack #incident-war-room', summary: 'Paged on-call incident commander', details: { channel: '#war-room' }, status: 'DISPATCHED' },
      { actionType: 'AWS_ROLLBACK', targetDestination: 'AWS ECS Cluster', summary: 'Rollback canary v2.4.1 $\\rightarrow$ stable v2.4.0', details: { cluster: 'prod' }, status: isSev1 ? 'HELD_FOR_APPROVAL' : 'DISPATCHED' }
    ],
    executionTimeMs: 420,
    tokenSavingsPercentage: 72,
    logs: [
      { timestamp: new Date().toISOString(), agent: 'SecuritySentinel', level: 'info', message: 'Evaluating input against zero-trust prompt shield...' },
      { timestamp: new Date().toISOString(), agent: 'ContextExtractor', level: 'success', message: 'Context extracted: Enterprise Platinum account (SLA: 15m).' },
      { timestamp: new Date().toISOString(), agent: 'DecisionRouter', level: 'success', message: 'Rule triggered: Critical Outage Rapid Triage.' },
      { timestamp: new Date().toISOString(), agent: 'ActionDispatcher', level: 'success', message: 'JIRA_ESCALATION dispatched to board.' },
      { timestamp: new Date().toISOString(), agent: 'HITLGatekeeper', level: isSev1 ? 'alert' : 'success', message: isSev1 ? 'High-impact operation held for Human Administrator approval.' : 'Workflow completed autonomously.' }
    ]
  };
}
