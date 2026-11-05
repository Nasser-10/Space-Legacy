import React from 'react';
import { Rocket, Flag, Radio, Award, CheckCircle2 } from 'lucide-react';

export default function MissionTimeline({ events = [] }) {
  if (!events || events.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-slate-500">
        No chronological milestone events cataloged for this explorer.
      </div>
    );
  }

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'launch':
        return <Rocket className="w-4 h-4 text-cyan-400" />;
      case 'landing':
        return <Flag className="w-4 h-4 text-amber-400" />;
      case 'surface_ops':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'mission_end':
        return <Radio className="w-4 h-4 text-rose-400" />;
      default:
        return <Award className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
      {events.map((ev, idx) => (
        <div key={idx} className="relative group">
          {/* Node Icon */}
          <div className="absolute -left-6 sm:-left-8 top-1 w-6 h-6 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center shadow-md group-hover:scale-110 group-hover:border-cyan-400 transition-all">
            {getCategoryIcon(ev.category)}
          </div>

          {/* Event Content */}
          <div className="glass-panel p-4 rounded-xl border border-slate-800/80 group-hover:border-slate-700 transition-colors">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
              <h4 className="font-display font-bold text-sm text-white group-hover:text-cyan-400 transition-colors">
                {ev.title}
              </h4>
              <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-slate-800 text-cyan-300">
                {ev.date}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mt-1">{ev.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
