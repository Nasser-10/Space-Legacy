import React from 'react';
import { Heart, Globe, ExternalLink, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="glass-panel border-t border-slate-800/80 mt-20 py-10 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-400">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-display font-bold text-sm text-slate-200">SPACE LEGACY</span>
            <span className="text-[10px] text-cyan-400">NASA Space Apps Challenge 2026</span>
          </div>
          <p className="max-w-md text-slate-400 leading-relaxed">
            Built by team <strong className="text-white">Musicstarsz</strong> (Mohamed, Farida, Mariam, Heba) for the
            challenge: <em>"Abandoned but not Forgotten: Storytelling about NASA's Discarded Equipment on the Moon and Mars."</em>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="flex items-center gap-2 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Strictly Grounded in Official NASA Archival Records</span>
          </div>
          <a
            href="https://images.nasa.gov"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors"
          >
            <span>NASA Image & 3D Library</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
