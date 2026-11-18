import React, { useRef, useEffect } from 'react';
import { Terminal, Shield, Cpu, Sparkles, Check, AlertTriangle } from 'lucide-react';

interface LogEntry {
  timestamp: string;
  agent: string;
  level: 'info' | 'warn' | 'success' | 'alert';
  message: string;
}

interface AgentExecutionLogProps {
  logs: LogEntry[];
}

export const AgentExecutionLog: React.FC<AgentExecutionLogProps> = ({ logs }) => {
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'success':
        return <span className="text-emerald-400 font-bold">[SUCCESS]</span>;
      case 'warn':
        return <span className="text-amber-400 font-bold">[WARN]</span>;
      case 'alert':
        return <span className="text-red-400 font-bold">[ALERT]</span>;
      default:
        return <span className="text-blue-400 font-bold">[INFO]</span>;
    }
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-lg flex flex-col h-[340px]">
      <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1.5" aria-hidden="true">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          </div>
          <span className="text-xs font-mono text-slate-400 ml-2 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-slate-400" />
            <span>multi-agent-orchestration-daemon // live event trace</span>
          </span>
        </div>
        <span className="text-[11px] font-mono text-slate-500">{logs.length} trace events</span>
      </div>

      <div
        className="p-4 font-mono text-xs overflow-y-auto space-y-2 flex-1 scroll-smooth"
        role="log"
        aria-live="polite"
      >
        {logs.length === 0 ? (
          <div className="text-slate-500 italic flex items-center gap-2 mt-4">
            <Sparkles className="w-4 h-4 text-brand-500/40" />
            <span>Workflow daemon idle. Select an incident above and click "Execute Agentic Workflow".</span>
          </div>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="leading-relaxed flex items-start gap-2">
              <span className="text-slate-600 select-none">
                {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
              <span className="px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-[10px] text-brand-300 font-bold">
                {log.agent}
              </span>
              {getLevelBadge(log.level)}
              <span className="text-slate-200 flex-1">{log.message}</span>
            </div>
          ))
        )}
        <div ref={logEndRef} />
      </div>
    </div>
  );
};
