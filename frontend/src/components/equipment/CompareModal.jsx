import React, { useState } from 'react';
import { X, Layers, ArrowRight, Zap, Scale, Clock, Compass, Box } from 'lucide-react';
import { SoundSystem } from '../../utils/soundEffects';
import { useLanguage } from '../../context/LanguageContext';

export default function CompareModal({ isOpen, onClose }) {
  const { t, lang } = useLanguage();

  const explorers = [
    {
      id: 'apollo_11_lm',
      name: lang === 'ar' ? 'نسر أبولو 11 (مرحلة الهبوط)' : 'Apollo 11 LM Descent Stage',
      planet: lang === 'ar' ? 'القمر' : 'Moon',
      mass: '2,034 kg',
      massVal: 2034,
      duration: lang === 'ar' ? '21 ساعة و 36 دقيقة' : '21h 36m (Active crewed ops)',
      durationDays: 1,
      power: lang === 'ar' ? 'بطاريات فضة وزنك ووقود كيميائي' : 'Silver-Zinc chemical batteries',
      mobility: lang === 'ar' ? 'منصة هبوط وإطلاق ثابتة' : 'Stationary Launch Pad',
      milestone: lang === 'ar' ? 'أول هبوط بشري على القمر ونصب عاكس الليزر' : 'First crewed landing & Laser retroreflector',
      image: 'https://images-assets.nasa.gov/image/as11-40-5927/as11-40-5927~orig.jpg',
    },
    {
      id: 'viking_1',
      name: lang === 'ar' ? 'محطة فايكنج 1' : 'Viking 1 Lander',
      planet: lang === 'ar' ? 'المريخ' : 'Mars',
      mass: '572 kg',
      massVal: 572,
      duration: lang === 'ar' ? '6 سنوات و 116 يوماً (2,245 سولا)' : '6 yrs, 116 days (2,245 sols)',
      durationDays: 2245,
      power: lang === 'ar' ? 'مولدان نوويان RTG (بلوتونيوم 238)' : 'Dual SNAP-19 RTGs (Plutonium-238)',
      mobility: lang === 'ar' ? 'مختبر ثابت بثلاثة أرجل وذراع تجريف' : 'Stationary 3-leg platform with scoop',
      milestone: lang === 'ar' ? 'أول مسح بيولوجي شامل وصور بانورامية ملونة' : 'First in-situ biological analysis & weather logs',
      image: 'https://images-assets.nasa.gov/image/PIA00563/PIA00563~orig.jpg',
    },
    {
      id: 'sojourner',
      name: lang === 'ar' ? 'روفر سوجورنر' : 'Sojourner Microrover',
      planet: lang === 'ar' ? 'المريخ' : 'Mars',
      mass: '11.5 kg',
      massVal: 11.5,
      duration: lang === 'ar' ? '83 يوماً (صمم لـ 7 أيام فقط)' : '83 sols (12x nominal design)',
      durationDays: 83,
      power: lang === 'ar' ? 'خلايا شمسية GaAs (16 واط)' : 'GaAs Solar Array (16W peak)',
      mobility: lang === 'ar' ? 'تعليق روكر-بوجي ذكي بـ 6 عجلات' : '6-wheel Rocker-Bogie mobility',
      milestone: lang === 'ar' ? 'أول حركة ذاتية لروفر وكشف عناصر صخور المريخ' : 'First mobile rover & rock elemental APXS analysis',
      image: 'https://images-assets.nasa.gov/image/PIA01122/PIA01122~orig.jpg',
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-5xl max-h-[90vh] glass-panel bg-slate-900/95 border border-slate-700/80 rounded-3xl flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-white">{t('compareTitle')}</h3>
              <p className="text-xs text-slate-400">{t('compareSubtitle')}</p>
            </div>
          </div>
          <button
            onClick={() => {
              SoundSystem.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Table Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {explorers.map((exp) => (
              <div
                key={exp.id}
                className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4 hover:border-cyan-500/50 transition-all hover:-translate-y-1"
              >
                <div>
                  <div className="relative h-36 rounded-xl overflow-hidden mb-3 border border-slate-800">
                    <img src={exp.image} alt={exp.name} className="w-full h-full object-cover" />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-slate-950/80 border border-slate-700 text-[10px] font-mono text-cyan-300">
                      {exp.planet}
                    </div>
                  </div>

                  <h4 className="font-display font-bold text-sm text-white mb-1">{exp.name}</h4>

                  {/* Mass Comparison Bar */}
                  <div className="space-y-1 pt-2">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Scale className="w-3 h-3 text-cyan-400" />
                        <span>{lang === 'ar' ? 'الكتلة' : 'Landed Mass'}</span>
                      </span>
                      <strong className="text-white">{exp.mass}</strong>
                    </div>
                    <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-sky-400 rounded-full"
                        style={{ width: `${Math.min(100, Math.max(5, (exp.massVal / 2034) * 100))}%` }}
                      />
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="pt-3 space-y-1 text-xs">
                    <div className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span>{lang === 'ar' ? 'مدة العمل على السطح' : 'Surface Lifetime'}</span>
                    </div>
                    <div className="font-semibold text-white">{exp.duration}</div>
                  </div>

                  {/* Power System */}
                  <div className="pt-3 space-y-1 text-xs">
                    <div className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                      <Zap className="w-3 h-3 text-purple-400" />
                      <span>{lang === 'ar' ? 'نظام الطاقة' : 'Power Source'}</span>
                    </div>
                    <div className="text-slate-300">{exp.power}</div>
                  </div>

                  {/* Mobility */}
                  <div className="pt-3 space-y-1 text-xs">
                    <div className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                      <Compass className="w-3 h-3 text-emerald-400" />
                      <span>{lang === 'ar' ? 'الحركة والتنقل' : 'Mobility Architecture'}</span>
                    </div>
                    <div className="text-slate-300">{exp.mobility}</div>
                  </div>

                  {/* Milestone */}
                  <div className="pt-3 space-y-1 text-xs">
                    <div className="text-[11px] text-slate-400 font-mono">
                      <span>{lang === 'ar' ? 'الإنجاز الأبرز' : 'Key Historic Milestone'}</span>
                    </div>
                    <p className="text-cyan-300 text-[11px] leading-relaxed">{exp.milestone}</p>
                  </div>
                </div>

                <a
                  href={`/equipment/${exp.id}`}
                  onClick={() => SoundSystem.playClick()}
                  className="mt-4 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-xs font-bold text-white transition-all shadow-md"
                >
                  <Box className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'فحص في بيئة 3D' : 'Inspect in 3D'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex justify-end">
          <button
            onClick={() => {
              SoundSystem.playClick();
              onClose();
            }}
            className="px-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white"
          >
            {lang === 'ar' ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
