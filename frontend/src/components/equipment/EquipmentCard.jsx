import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Calendar, ArrowRight, Box, Sparkles } from 'lucide-react';
import { SoundSystem } from '../../utils/soundEffects';

export default function EquipmentCard({ equipment }) {
  const isMars = equipment.celestial_body === 'mars';

  return (
    <div className="group relative rounded-2xl p-[1px] bg-gradient-to-b from-slate-700/60 via-slate-800/40 to-transparent hover:from-cyan-500/80 hover:via-indigo-500/50 hover:to-cyan-500/30 transition-all duration-500 shadow-xl hover:shadow-cyan-500/10 hover:-translate-y-1.5">
      <div className="h-full w-full bg-slate-950/90 backdrop-blur-md rounded-2xl overflow-hidden flex flex-col justify-between">
        {/* Thumbnail Header */}
        <div className="relative h-48 w-full bg-slate-950 overflow-hidden">
          {equipment.thumbnail_url ? (
            <img
              src={equipment.thumbnail_url}
              alt={equipment.common_name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-600 bg-slate-900/40">
              <Box className="w-12 h-12" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

          {/* Planet Badge */}
          <div className="absolute top-3 left-3">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border backdrop-blur-md font-mono ${
                isMars
                  ? 'bg-orange-950/80 text-orange-400 border-orange-500/60 shadow-lg shadow-orange-500/20'
                  : 'bg-cyan-950/80 text-cyan-300 border-cyan-500/60 shadow-lg shadow-cyan-500/20'
              }`}
            >
              {isMars ? 'Mars Explorer' : 'Lunar Explorer'}
            </span>
          </div>

          {/* 3D Model Badge */}
          {equipment.has_3d_model && (
            <div className="absolute top-3 right-3 bg-slate-950/85 border border-cyan-500/40 px-2 py-0.5 rounded-md text-[10px] text-cyan-300 flex items-center gap-1 font-mono backdrop-blur-md shadow-sm">
              <Box className="w-3 h-3 text-cyan-400" />
              <span>Interactive 3D</span>
            </div>
          )}
        </div>

        {/* Body Content */}
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            <div className="text-[11px] text-cyan-400/90 mb-1 font-mono">{equipment.mission_id?.toUpperCase()}</div>
            <h3 className="font-display font-bold text-lg text-white group-hover:text-cyan-300 transition-colors">
              {equipment.common_name}
            </h3>
            <p className="text-xs text-slate-400 mt-1 line-clamp-1">{equipment.official_name}</p>

            <div className="mt-4 space-y-2 text-xs text-slate-300 font-mono">
              <div className="flex items-center gap-2">
                <Compass className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="truncate">{equipment.landing_site_name || 'Extraterrestrial Surface'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Touchdown: {equipment.landing_date || 'Classified'}</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1.5 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              In-Situ Monument
            </span>
            <Link
              to={`/equipment/${equipment.equipment_id}`}
              onClick={() => SoundSystem.playClick()}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 group-hover:text-cyan-300 group-hover:translate-x-1 transition-all"
            >
              <span>Explore 3D</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
