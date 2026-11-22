import React, { useState } from 'react';
import { TinyFishReport, N8nSyncReport } from '../types';
import { Globe, Network, CheckCircle2, AlertTriangle, ExternalLink, Activity, ArrowRight, Play, ShieldAlert, Cpu } from 'lucide-react';

interface IntegrationsViewProps {
  tinyfishReport?: TinyFishReport;
  n8nSyncReport?: N8nSyncReport;
}

export const IntegrationsView: React.FC<IntegrationsViewProps> = ({
  tinyfishReport,
  n8nSyncReport
}) => {
  const [customUrl, setCustomUrl] = useState('');
  const [isTestingUrl, setIsTestingUrl] = useState(false);
  const [testResult, setTestResult] = useState<TinyFishReport | null>(null);
  const [testError, setTestError] = useState('');

  const activeTinyFish = testResult || tinyfishReport;

  const handleTestTinyFish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim()) return;
    setIsTestingUrl(true);
    setTestError('');
    try {
      const res = await fetch('/api/workflow/tinyfish/inspect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: customUrl.trim() })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setTestResult(data.report);
    } catch {
      setTestError('Failed to inspect URL with TinyFish. Ensure server is reachable.');
    } finally {
      setIsTestingUrl(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Integration Ecosystem */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                AI Web Agent + Workflow Automation
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                Official Synergy
              </span>
            </div>
            <h3 className="text-base font-extrabold text-white tracking-tight">
              TinyFish AI Web Agent × n8n Enterprise Workflow Engine
            </h3>
            <p className="text-xs text-slate-400 max-w-2xl">
              TinyFish navigates live JavaScript web applications to corroborate outage claims and bypass cookie gates, while n8n coordinates enterprise actions across Slack, Jira, PagerDuty, and CMDB.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/60 border border-cyan-800/40 text-cyan-300 text-xs font-semibold">
              <Globe className="w-4 h-4 text-cyan-400 animate-spin-slow" />
              <span>TinyFish Active</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-950/60 border border-purple-800/40 text-purple-300 text-xs font-semibold">
              <Network className="w-4 h-4 text-purple-400" />
              <span>n8n Synchronized</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: TinyFish on Left, n8n on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* TinyFish AI Web Agent Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    TinyFish AI Web Agent
                    <span className="text-[10px] font-mono font-normal px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      tinyfish.ai
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-400">Autonomous Cloud Browser Telemetry & Verification</p>
                </div>
              </div>
              {activeTinyFish && (
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                  activeTinyFish.status === 'OUTAGE_VERIFIED'
                    ? 'bg-red-500/10 text-red-300 border-red-500/30'
                    : activeTinyFish.status === 'DEGRADED_PERFORMANCE'
                    ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                    : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                }`}>
                  {activeTinyFish.status}
                </span>
              )}
            </div>

            {activeTinyFish ? (
              <div className="space-y-3 pt-2">
                {/* Target URL & Performance */}
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-mono text-[11px]">Inspected Target:</span>
                    <span className="font-mono text-cyan-300 text-[11px] truncate max-w-[260px]">
                      {activeTinyFish.targetUrl}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-900 text-center">
                    <div className="bg-slate-900/60 p-1.5 rounded">
                      <span className="text-[10px] text-slate-500 block">HTTP STATUS</span>
                      <span className={`text-xs font-mono font-bold ${
                        activeTinyFish.httpStatus >= 500 ? 'text-red-400' : 'text-emerald-400'
                      }`}>
                        {activeTinyFish.httpStatus}
                      </span>
                    </div>
                    <div className="bg-slate-900/60 p-1.5 rounded">
                      <span className="text-[10px] text-slate-500 block">TTFB LATENCY</span>
                      <span className="text-xs font-mono font-bold text-amber-300">
                        {activeTinyFish.latencyMs}ms
                      </span>
                    </div>
                    <div className="bg-slate-900/60 p-1.5 rounded">
                      <span className="text-[10px] text-slate-500 block">SESSION ID</span>
                      <span className="text-[11px] font-mono text-slate-300 truncate block">
                        {activeTinyFish.sessionId}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Live DOM Finding */}
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Corroborated DOM Evidence
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed font-sans">
                    {activeTinyFish.domFinding}
                  </p>
                </div>

                {/* Autonomous Browser Steps Waterfall */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Autonomous Browser Steps ({activeTinyFish.browserStepsExecuted.length})
                  </span>
                  <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-850 space-y-1 font-mono text-[11px] max-h-40 overflow-y-auto">
                    {activeTinyFish.browserStepsExecuted.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-950/60 border border-slate-850 border-dashed rounded-xl p-8 text-center space-y-2">
                <Globe className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400">Run a scenario or inspect a URL below to dispatch TinyFish AI Web Agent.</p>
              </div>
            )}
          </div>

          {/* Mini Interactive URL Inspector Form */}
          <form onSubmit={handleTestTinyFish} className="pt-3 border-t border-slate-800 space-y-2">
            <span className="text-[11px] font-bold text-slate-300 block">Test Any URL with TinyFish:</span>
            <div className="flex gap-2">
              <input
                type="url"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://example.com/api/health"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              />
              <button
                type="submit"
                disabled={isTestingUrl || !customUrl.trim()}
                className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1 transition"
              >
                {isTestingUrl ? (
                  <>
                    <Activity className="w-3.5 h-3.5 animate-spin" />
                    <span>Agent Running...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>Inspect</span>
                  </>
                )}
              </button>
            </div>
            {testError && <p className="text-[11px] text-red-400">{testError}</p>}
          </form>
        </div>

        {/* n8n Enterprise Workflow Synchronization Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
                  <Network className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    n8n Workflow Hub
                    <span className="text-[10px] font-mono font-normal px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      n8n.io
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-400">Enterprise Orchestration & Tool Synchronization</p>
                </div>
              </div>
              {n8nSyncReport && (
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold border bg-purple-500/10 text-purple-300 border-purple-500/30">
                  {n8nSyncReport.status}
                </span>
              )}
            </div>

            {n8nSyncReport ? (
              <div className="space-y-3 pt-2">
                {/* Workflow Metadata */}
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-mono text-[11px]">Active Workflow ID:</span>
                    <span className="font-mono text-purple-300 text-[11px]">
                      {n8nSyncReport.workflowId}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-900">
                    <span className="text-slate-400 font-mono text-[11px]">Webhook Endpoint:</span>
                    <span className="font-mono text-slate-300 text-[11px] truncate max-w-[260px]">
                      {n8nSyncReport.webhookUrl}
                    </span>
                  </div>
                </div>

                {/* Connected Enterprise Pipeline Topology */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Connected Pipeline Topology ({n8nSyncReport.connectedNodes.length} Nodes)
                  </span>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 space-y-2">
                    {n8nSyncReport.connectedNodes.map((node, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[10px] flex items-center justify-center font-bold">
                            {idx + 1}
                          </span>
                          <span className="font-medium text-slate-200">{node}</span>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          Active
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Inbound Webhook Feature Callout */}
                <div className="bg-indigo-950/30 border border-indigo-900/40 rounded-xl p-3 text-xs space-y-1">
                  <span className="font-bold text-indigo-300 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-indigo-400" />
                    Bi-Directional Sync:
                  </span>
                  <p className="text-[11px] text-slate-300">
                    n8n can also trigger NexusFlow via <code className="bg-slate-900 text-purple-300 px-1.5 py-0.5 rounded font-mono">POST /api/workflow/webhook/n8n</code> for external alert ingestion.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-slate-950/60 border border-slate-850 border-dashed rounded-xl p-8 text-center space-y-2">
                <Network className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400">Run an incident scenario to view n8n multi-system pipeline synchronization.</p>
              </div>
            )}
          </div>

          {/* Quick Info Box */}
          <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Powered by n8n community node for TinyFish</span>
            <span className="text-purple-400 font-mono">v1.0-ready</span>
          </div>
        </div>
      </div>
    </div>
  );
};
