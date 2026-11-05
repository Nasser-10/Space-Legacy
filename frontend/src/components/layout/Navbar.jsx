import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Rocket, Moon, Volume2, VolumeX, Globe, Layers } from 'lucide-react';
import { SoundSystem } from '../../utils/soundEffects';
import { useLanguage } from '../../context/LanguageContext';
import CompareModal from '../equipment/CompareModal';

export default function Navbar() {
  const location = useLocation();
  const { t, lang, toggleLanguage } = useLanguage();
  const [muted, setMuted] = useState(SoundSystem.isMuted());
  const [compareOpen, setCompareOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const toggleSound = () => {
    const isNowMuted = SoundSystem.toggleMute();
    setMuted(isNowMuted);
    if (!isNowMuted) {
      SoundSystem.playClick();
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 glass-panel border-b border-slate-800/80 px-4 lg:px-8 py-3 transition-all backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand Logo */}
          <Link
            to="/"
            onClick={() => SoundSystem.playClick()}
            className="flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 group-hover:scale-105 group-hover:shadow-cyan-400/40 transition-all duration-300">
              <Rocket className="w-5 h-5 text-white group-hover:rotate-12 transition-transform duration-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-black text-lg tracking-wider text-white">{t('brand')}</span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-700/60 shadow-sm shadow-cyan-500/20 font-mono">
                  {t('badge')}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 -mt-0.5">{t('tagline')}</p>
            </div>
          </Link>

          {/* Navigation & Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            <nav className="flex items-center gap-1 sm:gap-2">
              <Link
                to="/"
                onClick={() => SoundSystem.playClick()}
                className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                  isActive('/')
                    ? 'bg-slate-800 text-white shadow-inner'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                {t('home')}
              </Link>

              <Link
                to="/moon"
                onClick={() => SoundSystem.playClick()}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                  isActive('/moon')
                    ? 'bg-slate-800 text-cyan-400 border border-cyan-500/40 shadow-sm shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Moon className="w-3.5 h-3.5 text-slate-300" />
                <span>{t('moon')}</span>
              </Link>

              <Link
                to="/mars"
                onClick={() => SoundSystem.playClick()}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                  isActive('/mars')
                    ? 'bg-orange-950/60 text-orange-400 border border-orange-500/40 shadow-sm shadow-orange-500/20'
                    : 'text-slate-400 hover:text-orange-300 hover:bg-slate-900/60'
                }`}
              >
                <div className="w-3 h-3 rounded-full bg-orange-500 border border-orange-300" />
                <span>{t('mars')}</span>
              </Link>

              {/* Compare Button */}
              <button
                onClick={() => {
                  SoundSystem.playClick();
                  setCompareOpen(true);
                }}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium text-slate-400 hover:text-cyan-400 hover:bg-slate-900/60 transition-all"
              >
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>{t('compare')}</span>
              </button>
            </nav>

            <div className="h-4 w-[1px] bg-slate-800 mx-1 hidden sm:block" />

            {/* Language Switcher Button */}
            <button
              onClick={() => {
                SoundSystem.playClick();
                toggleLanguage();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-xs font-bold text-cyan-300 hover:border-cyan-400 transition-all shadow-sm"
              title="Switch Language / تغيير اللغة"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>{lang === 'ar' ? 'English' : 'عربي'}</span>
            </button>

            {/* Sci-Fi Sound FX Toggle */}
            <button
              onClick={toggleSound}
              className={`p-2 rounded-xl border transition-all ${
                muted
                  ? 'bg-slate-900/80 text-slate-500 border-slate-800 hover:text-slate-300'
                  : 'bg-cyan-950/60 text-cyan-400 border-cyan-500/50 shadow-sm shadow-cyan-500/20 hover:scale-105'
              }`}
              title={muted ? t('soundOn') : t('soundOff')}
            >
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Hardware Compare Modal */}
      <CompareModal isOpen={compareOpen} onClose={() => setCompareOpen(false)} />
    </>
  );
}
