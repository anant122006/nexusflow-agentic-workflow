import React, { useState } from 'react';
import { SCENARIO_ITEMS } from '../mockData/scenarios';
import { Play, Sparkles, Sliders, ShieldAlert } from 'lucide-react';

interface IncidentInputProps {
  onRunWorkflow: (title: string, input: string) => void;
  isRunning: boolean;
}

export const IncidentInput: React.FC<IncidentInputProps> = ({ onRunWorkflow, isRunning }) => {
  const [selectedScenario, setSelectedScenario] = useState<string>(SCENARIO_ITEMS[0].id);
  const [title, setTitle] = useState<string>(SCENARIO_ITEMS[0].title);
  const [input, setInput] = useState<string>(SCENARIO_ITEMS[0].description);

  const handleSelect = (sId: string) => {
    setSelectedScenario(sId);
    const item = SCENARIO_ITEMS.find(s => s.id === sId);
    if (item) {
      setTitle(item.title);
      setInput(item.description);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !input.trim()) return;
    onRunWorkflow(title, input);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-6 shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-brand-400" aria-hidden="true" />
            <span>Incoming Enterprise Incident / Context Trigger</span>
          </h2>
          <p className="text-xs text-slate-400">
            Select an enterprise benchmark scenario or input a custom incident payload.
          </p>
        </div>

        {/* 1-Click Scenario Chips */}
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Pre-loaded scenarios">
          {SCENARIO_ITEMS.map(s => {
            const isMalicious = s.id === 'SCENARIO-04';
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => handleSelect(s.id)}
                className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition flex items-center gap-1 ${
                  selectedScenario === s.id
                    ? isMalicious
                      ? 'bg-red-500/10 border-red-500 text-red-300'
                      : 'bg-brand-500/10 border-brand-500 text-brand-300'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
                aria-pressed={selectedScenario === s.id}
              >
                {isMalicious && <ShieldAlert className="w-3.5 h-3.5 text-red-400" />}
                <span>{s.category.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="incident-title" className="block text-xs font-semibold text-slate-300 mb-1">
            Incident Headline / Alert Summary
          </label>
          <input
            id="incident-title"
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-brand-500 focus:outline-none"
            placeholder="e.g. Critical API latency on checkout cluster"
            required
          />
        </div>

        <div>
          <label htmlFor="incident-desc" className="block text-xs font-semibold text-slate-300 mb-1">
            Raw User Payload & Metadata Context
          </label>
          <textarea
            id="incident-desc"
            rows={2}
            value={input}
            onChange={e => setInput(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-brand-500 focus:outline-none font-mono text-xs"
            placeholder="Enter incident context, logs, user complaints, or error codes..."
            required
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Sparkles className="w-4 h-4 text-brand-400" aria-hidden="true" />
            <span>Autonomous Pipeline: Sentinel Shield $\rightarrow$ Context Extraction $\rightarrow$ Decision Router $\rightarrow$ Tool Dispatch</span>
          </div>

          <button
            type="submit"
            disabled={isRunning}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold transition shadow-lg shadow-brand-600/20 focus:ring-2 focus:ring-brand-400"
          >
            {isRunning ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Orchestrating Workflow...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" aria-hidden="true" />
                <span>Execute Agentic Workflow</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
