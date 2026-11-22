import React from 'react';
import { WorkflowNode } from '../types';
import { CheckCircle2, CircleDashed, AlertTriangle, XCircle, ArrowRight, ShieldCheck, Database, Wrench, MessageSquare } from 'lucide-react';

interface WorkflowCanvasProps {
  nodes: WorkflowNode[];
  onNodeClick?: (node: WorkflowNode) => void;
}

export const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({ nodes, onNodeClick }) => {
  if (!nodes || nodes.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-10 text-center text-slate-500">
        <Database className="w-10 h-10 text-slate-700 mx-auto mb-3" />
        <p className="text-sm font-semibold text-slate-300">DAG Execution Graph Idle</p>
        <p className="text-xs text-slate-500 mt-1">Execute a workflow above to visualize dynamic agentic graph orchestration.</p>
      </div>
    );
  }

  const getNodeIcon = (id: string) => {
    if (id.includes('guardrail')) return ShieldCheck;
    if (id.includes('context') || id.includes('decision')) return Database;
    if (id.includes('rollback') || id.includes('jira') || id.includes('exec')) return Wrench;
    return MessageSquare;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span>Dynamic DAG Workflow Execution Graph</span>
          </h3>
          <p className="text-xs text-slate-400">Concurrent and conditional execution paths evaluated at runtime.</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span>Completed</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <span>Awaiting Approval (HITL)</span>
          </span>
        </div>
      </div>

      {/* Nodes Graph Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {nodes.map((node, index) => {
          const Icon = getNodeIcon(node.id);
          const isWaiting = node.status === 'waiting_approval';
          const isDone = node.status === 'completed';
          const isFailed = node.status === 'failed';

          return (
            <div
              key={node.id}
              onClick={() => onNodeClick && onNodeClick(node)}
              className={`p-4 rounded-xl border transition-all cursor-pointer shadow-sm relative ${
                isWaiting
                  ? 'bg-amber-950/20 border-amber-500/50 hover:border-amber-400'
                  : isDone
                  ? 'bg-slate-950/80 border-slate-800 hover:border-brand-500/50'
                  : isFailed
                  ? 'bg-red-950/20 border-red-500/50'
                  : 'bg-slate-950/40 border-slate-850 opacity-60'
              }`}
            >
              {/* Top Row: Agent Role & Status Badge */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                  {node.agentRole}
                </span>

                {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                {isWaiting && (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                    <AlertTriangle className="w-3 h-3 text-amber-400 animate-bounce" />
                    <span>HITL Gate</span>
                  </span>
                )}
                {isFailed && <XCircle className="w-4 h-4 text-red-400" />}
              </div>

              {/* Title */}
              <div className="flex items-start gap-2.5 mb-2">
                <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                  isWaiting ? 'bg-amber-500/10 text-amber-300' : isDone ? 'bg-brand-500/10 text-brand-400' : 'bg-red-500/10 text-red-400'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-100">{node.label}</h4>
                  <p className="text-[11px] text-slate-400 font-mono">id: {node.id}</p>
                </div>
              </div>

              {/* Summary */}
              {node.outputSummary && (
                <div className="bg-slate-900 rounded-lg p-2.5 text-xs text-slate-300 border border-slate-850 mt-2 font-mono leading-relaxed">
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
