import React from 'react';
import { WorkflowNode } from '../types';
import { CheckCircle2, AlertTriangle, XCircle, ShieldCheck, Database, Wrench, Globe, Network, ArrowRight } from 'lucide-react';

interface WorkflowCanvasProps {
  nodes: WorkflowNode[];
  onNodeClick?: (node: WorkflowNode) => void;
}

export const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({ nodes, onNodeClick }) => {
  if (!nodes || nodes.length === 0) {
    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-8 text-center text-slate-500 shadow-lg">
        <Database className="w-8 h-8 text-slate-700 mx-auto mb-2" />
        <p className="text-sm font-bold text-slate-300">Agentic DAG Pipeline Idle</p>
        <p className="text-xs text-slate-500 mt-0.5">Click &quot;Run AI Automation&quot; above to watch the agents execute in real time.</p>
      </div>
    );
  }

  const getNodeIcon = (id: string) => {
    if (id.includes('guardrail')) return ShieldCheck;
    if (id.includes('tinyfish')) return Globe;
    if (id.includes('n8n')) return Network;
    if (id.includes('context') || id.includes('decision')) return Database;
    return Wrench;
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
            <span>Visual Agentic Pipeline Execution (DAG)</span>
            <span className="text-[11px] font-mono font-normal px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
              {nodes.length} Nodes Auto-Scheduled
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Topologically sorted via Kahn&apos;s BFS (O(V+E)) for concurrent safe execution.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
            <span>Success</span>
          </span>
          <span className="flex items-center gap-1.5 text-amber-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shadow-sm shadow-amber-400/50" />
            <span>Held at HITL Gate</span>
          </span>
        </div>
      </div>

      {/* Pipeline Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {nodes.map((node, index) => {
          const Icon = getNodeIcon(node.id);
          const isWaiting = node.status === 'waiting_approval';
          const isDone = node.status === 'completed';
          const isFailed = node.status === 'failed';

          return (
            <div
              key={node.id}
              onClick={() => onNodeClick && onNodeClick(node)}
              className={`p-4 rounded-xl border transition-all cursor-pointer shadow-sm relative flex flex-col justify-between ${
                isWaiting
                  ? 'bg-amber-950/30 border-amber-500/60 hover:border-amber-400 shadow-amber-500/10'
                  : isDone
                  ? 'bg-slate-950/70 border-slate-800/90 hover:border-brand-500/50'
                  : isFailed
                  ? 'bg-red-950/30 border-red-500/60'
                  : 'bg-slate-950/40 border-slate-850 opacity-60'
              }`}
            >
              <div>
                {/* Step # & Agent Badge */}
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-400 font-mono">
                    Step {index + 1} · {node.agentRole}
                  </span>

                  {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  {isWaiting && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30 animate-pulse">
                      <AlertTriangle className="w-3 h-3 text-amber-400" />
                      <span>Review Required</span>
                    </span>
                  )}
                  {isFailed && <XCircle className="w-4 h-4 text-red-400" />}
                </div>

                {/* Node Title */}
                <div className="flex items-start gap-2.5 mb-2">
                  <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                    isWaiting ? 'bg-amber-500/10 text-amber-300' : isDone ? 'bg-brand-500/10 text-brand-400' : 'bg-red-500/10 text-red-400'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-100 leading-snug">{node.label}</h4>
                  </div>
                </div>
              </div>

              {/* Output Summary */}
              {node.outputSummary && (
                <div className="bg-slate-900/90 rounded-lg p-2.5 text-[11px] text-slate-300 border border-slate-800/70 mt-2 font-mono leading-relaxed">
                  {node.outputSummary}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
