import React, { useState } from 'react';
import { SCENARIO_ITEMS } from '../mockData/scenarios';
import { Play, Sparkles, Sliders, ShieldAlert, Globe, AlertCircle } from 'lucide-react';

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

  const getScenarioBadge = (id: string, category: string) => {
    if (id === 'SCENARIO-01') return { label: 'Sev-1 Outage', color: 'border-red-500/40 text-red-300 bg-red-950/40' };
    if (id === 'SCENARIO-02') return { label: 'Performance Lag', color: 'border-amber-500/40 text-amber-300 bg-amber-950/40' };
    if (id === 'SCENARIO-03') return { label: 'Billing Dispute', color: 'border-emerald-500/40 text-emerald-300 bg-emerald-950/40' };
    if (id === 'SCENARIO-04') return { label: 'Prompt Injection', color: 'border-rose-500/40 text-rose-300 bg-rose-950/40' };
    return { label: 'TinyFish + n8n Web', color: 'border-cyan-500/40 text-cyan-300 bg-cyan-950/40' };
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 mb-6 shadow-xl">
      {/* 1-Click Scenario Selection Header */}
      <div className="space-y-3 mb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-400" aria-hidden="true" />
              <span>Choose a Real-World Scenario or Enter Your Own Incident</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Click any pre-loaded scenario to auto-populate the test context.
            </p>
          </div>
        </div>

        {/* Intuitive Scenario Pills */}
        <div className="flex flex-wrap gap-2" role="group" aria-label="Pre-loaded test scenarios">
          {SCENARIO_ITEMS.map(s => {
            const badge = getScenarioBadge(s.id, s.category);
            const isSelected = selectedScenario === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => handleSelect(s.id)}
                className={`text-xs px-3.5 py-2 rounded-xl border font-semibold transition-all flex items-center gap-2 ${
                  isSelected
                    ? `${badge.color} ring-2 ring-brand-500/50 shadow-md`
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-850'
                }`}
                aria-pressed={isSelected}
              >
                <span>{badge.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="incident-title" className="block text-xs font-semibold text-slate-300 mb-1.5">
            Incident Headline / Alert Summary
          </label>
          <input
            id="incident-title"
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full bg-slate-950 border border-slate-750 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none transition"
            placeholder="e.g. Critical API latency on checkout cluster"
            required
          />
        </div>

        <div>
          <label htmlFor="incident-desc" className="block text-xs font-semibold text-slate-300 mb-1.5">
            Incident Details, Error Logs & Customer Context
          </label>
          <textarea
            id="incident-desc"
            rows={3}
            value={input}
            onChange={e => setInput(e.target.value)}
            className="w-full bg-slate-950 border border-slate-750 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none font-mono leading-relaxed transition"
            placeholder="Enter incident context, logs, customer complaints, or error codes..."
            required
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Multi-Agent Chain: Sentinel Shield → Context AI → Decision Policy → TinyFish Web Agent → n8n Sync</span>
          </div>

          <button
            type="submit"
            disabled={isRunning}
            className="flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 disabled:opacity-50 text-white font-extrabold text-xs tracking-wide uppercase transition-all shadow-lg shadow-brand-600/30 active:scale-95 cursor-pointer"
          >
            {isRunning ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Running Agent Pipeline...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" aria-hidden="true" />
                <span>Run AI Automation</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
