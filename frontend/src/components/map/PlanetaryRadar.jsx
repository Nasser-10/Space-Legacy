import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Compass, Crosshair, ArrowRight, Box, Radio, Moon } from 'lucide-react';
import { SoundSystem } from '../../utils/soundEffects';
import { useLanguage } from '../../context/LanguageContext';

export default function PlanetaryRadar() {
  const { t, lang } = useLanguage();
  const [selectedPlanet, setSelectedPlanet] = useState('moon'); // 'moon' or 'mars'
  const [activeSite, setActiveSite] = useState(null);

  const landingSites = [
    {
      id: 'apollo_11_lm',
      planet: 'moon',
      name: lang === 'ar' ? 'أبولو 11 (نسر الهبوط)' : 'Apollo 11 Lunar Module (Eagle)',
      site: 'Mare Tranquillitatis',
      lat: 0.67408,
      lng: 23.47297,
      x: 62, // % on radar map
      y: 48,
      date: '1969-07-20',
      status: lang === 'ar' ? 'أول هبوط بشري تاريخي' : 'First Human Lunar Landing',
    },
    {
      id: 'surveyor_3',
      planet: 'moon',
      name: lang === 'ar' ? 'سيرفيور 3' : 'Surveyor 3',
      site: 'Oceanus Procellarum',
      lat: -3.015,
      lng: -23.418,
      x: 35,
      y: 54,
      date: '1967-04-20',
      status: lang === 'ar' ? 'عاينه رواد أبولو 12' : 'Sampled by Apollo 12',
    },
    {
      id: 'viking_1',
      planet: 'mars',
      name: lang === 'ar' ? 'فايكنج 1' : 'Viking 1 Lander',
      site: 'Chryse Planitia',
      lat: 22.697,
      lng: 312.05,
      x: 42,
      y: 38,
      date: '1976-07-20',
      status: lang === 'ar' ? 'أول محطة استكشاف طويلة المدى' : 'First Long-Duration Mars Station',
    },
    {
      id: 'sojourner',
      planet: 'mars',
      name: lang === 'ar' ? 'روفر سوجورنر' : 'Sojourner Microrover',
      site: 'Ares Vallis',
      lat: 19.33,
      lng: 326.5,
      x: 58,
      y: 44,
      date: '1997-07-04',
      status: lang === 'ar' ? 'أول عجلات على المريخ' : 'First Wheeled Rover on Mars',
    },
    {
      id: 'opportunity',
      planet: 'mars',
      name: lang === 'ar' ? 'روفر أوبورتيونيتي' : 'Opportunity Rover',
      site: 'Meridiani Planum',
      lat: -1.948,
      lng: 354.474,
      x: 75,
      y: 52,
      date: '2004-01-25',
      status: lang === 'ar' ? 'اكتشف دلائل المياه القديمة' : 'Proved Ancient Liquid Water',
    },
  ];

  const currentSites = landingSites.filter((s) => s.planet === selectedPlanet);

  const handleBeaconClick = (site) => {
    SoundSystem.playScan();
    setActiveSite(site);
  };

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1 font-mono">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>{t('radarTitle')}</span>
          </div>
          <p className="text-xs text-slate-400">{t('radarSubtitle')}</p>
        </div>

        {/* Planet Toggle */}
        <div className="flex items-center bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs">
          <button
            onClick={() => {
              SoundSystem.playClick();
              setSelectedPlanet('moon');
              setActiveSite(null);
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold transition-all ${
              selectedPlanet === 'moon'
                ? 'bg-slate-800 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Moon className="w-3.5 h-3.5 text-slate-300" />
            <span>{lang === 'ar' ? 'القمر' : 'The Moon'}</span>
          </button>
          <button
            onClick={() => {
              SoundSystem.playClick();
              setSelectedPlanet('mars');
              setActiveSite(null);
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold transition-all ${
              selectedPlanet === 'mars'
                ? 'bg-orange-950/80 text-orange-400 border border-orange-500/50 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span>{lang === 'ar' ? 'المريخ' : 'Mars'}</span>
          </button>
        </div>
      </div>

      {/* Radar Visual Display */}
      <div className="relative w-full h-[360px] sm:h-[420px] rounded-2xl bg-slate-950/90 border border-slate-800 overflow-hidden flex items-center justify-center">
        {/* Background Radar concentric circles */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
          <div className="w-[120px] h-[120px] rounded-full border border-cyan-500/40" />
          <div className="w-[240px] h-[240px] rounded-full border border-cyan-500/30" />
          <div className="w-[360px] h-[360px] rounded-full border border-cyan-500/20" />
          <div className="w-[480px] h-[480px] rounded-full border border-cyan-500/10" />
          {/* Radar Crosshairs */}
          <div className="absolute w-full h-[1px] bg-cyan-500/20" />
          <div className="absolute h-full w-[1px] bg-cyan-500/20" />
        </div>

        {/* Rotating radar scanner sweep line */}
        <div
          className="absolute w-[240px] sm:w-[320px] h-[240px] sm:h-[320px] rounded-full pointer-events-none opacity-20"
          style={{
            background: 'conic-gradient(from 0deg, transparent 0deg, rgba(6, 182, 212, 0.4) 60deg, transparent 65deg)',
            animation: 'spin 8s linear infinite',
          }}
        />

        {/* Planet Sphere Ambient Glow in background */}
        <div
          className={`w-64 h-64 sm:w-80 sm:h-80 rounded-full blur-2xl pointer-events-none transition-all duration-700 ${
            selectedPlanet === 'moon' ? 'bg-cyan-500/10' : 'bg-orange-500/10'
          }`}
        />

        {/* Beacons on Radar */}
        {currentSites.map((site) => (
          <button
            key={site.id}
            onClick={() => handleBeaconClick(site)}
            style={{ left: `${site.x}%`, top: `${site.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer focus:outline-none z-20"
          >
            {/* Radar wave ping */}
            <span
              className={`absolute w-8 h-8 rounded-full animate-ping pointer-events-none ${
                selectedPlanet === 'moon' ? 'bg-cyan-400/30' : 'bg-orange-400/30'
              }`}
            />
            {/* Beacon dot */}
            <div
              className={`w-4 h-4 rounded-full border-2 border-white shadow-lg transition-transform group-hover:scale-150 flex items-center justify-center ${
                selectedPlanet === 'moon' ? 'bg-cyan-500' : 'bg-orange-500'
              }`}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
            </div>

            {/* Floating Tag */}
            <div className="absolute left-6 top-1/2 -translate-y-1/2 whitespace-nowrap bg-slate-900/90 text-white border border-slate-700/80 px-2.5 py-1 rounded-lg text-[10px] font-mono opacity-80 group-hover:opacity-100 transition-opacity shadow-md pointer-events-none">
              <span className="text-cyan-400 font-bold block">{site.name}</span>
              <span className="text-slate-400 text-[9px]">{site.lat}° N, {site.lng}° E</span>
            </div>
          </button>
        ))}

        {/* Selected Beacon Inspector Modal Overlay */}
        {activeSite && (
          <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 bg-slate-900/95 border border-cyan-500/80 p-4 rounded-2xl shadow-2xl backdrop-blur-xl z-30 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <h4 className="font-display font-bold text-xs text-white uppercase">{activeSite.name}</h4>
              </div>
              <button
                onClick={() => setActiveSite(null)}
                className="text-slate-400 hover:text-white text-xs px-2 py-0.5 rounded bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1.5 text-xs text-slate-300 font-mono mb-3">
              <div>{t('landingSite')}: <strong className="text-cyan-300">{activeSite.site}</strong></div>
              <div>{t('coordinates')}: <span className="text-slate-400">{activeSite.lat}° N, {activeSite.lng}° E</span></div>
              <div>Touchdown: <span className="text-slate-400">{activeSite.date}</span></div>
              <div className="text-[11px] text-emerald-400">{activeSite.status}</div>
            </div>

            <Link
              to={`/equipment/${activeSite.id}`}
              onClick={() => SoundSystem.playClick()}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors shadow-md"
            >
              <Box className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'فتح العرض ثلاثي الأبعاد' : 'Open 3D Exhibit'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
