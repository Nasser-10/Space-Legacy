import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Rocket, Moon, Compass, Sparkles, Shield, ArrowRight,
  BookOpen, Layers, Award, Radio, Box, Eye, CheckCircle2,
  Volume2, VolumeX
} from 'lucide-react';
import { SpaceLegacyAPI } from '../services/api';
import EquipmentCard from '../components/equipment/EquipmentCard';
import ChatHistorian from '../components/ai/ChatHistorian';
import ModelViewerWrapper from '../components/3d/ModelViewerWrapper';
import PlanetaryRadar from '../components/map/PlanetaryRadar';
import CompareModal from '../components/equipment/CompareModal';
import { SoundSystem } from '../utils/soundEffects';
import { SpeechNarrator } from '../utils/speech';
import { useLanguage } from '../context/LanguageContext';

export default function HomePage() {
  const { t, lang } = useLanguage();
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [compareOpen, setCompareOpen] = useState(false);
  const [isNarrating, setIsNarrating] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await SpaceLegacyAPI.getEquipment();
        setEquipmentList(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();

    return () => {
      SpeechNarrator.stop();
    };
  }, []);

  const toggleAudioTour = () => {
    if (isNarrating) {
      SpeechNarrator.stop();
      setIsNarrating(false);
    } else {
      const tourText =
        lang === 'ar'
          ? 'مرحباً بكم في إرث الفضاء، المتحف الافتراضي لمعدات ناسا على القمر والمريخ. منذ عام 1969 وحتى اليوم، تركت البشرية مسابر ومركبات هبوط وروفرات استكشافية. هذه المعدات لم تُترك إهمالاً، بل إن قوانين فيزياء الصواريخ ومحدودية الوقود حتمت إبقاءها في الفضاء، لتتحول اليوم إلى أول صروح تاريخية في علم الآثار الفضائية.'
          : 'Welcome to Space Legacy, the virtual museum for NASA equipment on the Moon and Mars. Since 1969, humanity has placed robotic pioneers across extraterrestrial surfaces. These machines were not abandoned as junk; the physics of orbital mechanics and the rocket equation necessitated leaving them in-situ, creating humanity\'s first open-air archaeological monuments in the solar system.';

      setIsNarrating(true);
      SpeechNarrator.speak(tourText, lang, () => {
        setIsNarrating(false);
      });
    }
  };

  return (
    <div className="space-y-28 pb-28">
      {/* Hero Section */}
      <section className="relative pt-12 sm:pt-20 pb-16 px-4 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text / Mission Statement */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/40 text-xs text-cyan-400 shadow-lg shadow-cyan-500/10 animate-pulse font-mono">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>{t('heroBadge')}</span>
            </div>

            <h1 className="font-display font-black text-4xl sm:text-6xl lg:text-7xl text-white tracking-tight leading-[1.08]">
              {t('heroTitle1')} <br />
              <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-orange-400 bg-clip-text text-transparent">
                {t('heroTitle2')}
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
              {t('heroSubtitle')}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/moon"
                onClick={() => SoundSystem.playClick()}
                className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-cyan-400 text-sm font-bold text-white shadow-xl shadow-cyan-500/10 transition-all hover:scale-105 active:scale-95"
              >
                <Moon className="w-4 h-4 text-cyan-300" />
                <span>{t('exploreMoon')}</span>
              </Link>

              <Link
                to="/mars"
                onClick={() => SoundSystem.playClick()}
                className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-sm font-bold text-white shadow-xl shadow-orange-600/30 transition-all hover:scale-105 active:scale-95"
              >
                <div className="w-3.5 h-3.5 rounded-full bg-white border border-orange-200" />
                <span>{t('exploreMars')}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              {/* Audio Tour Button */}
              <button
                onClick={toggleAudioTour}
                className={`flex items-center gap-2 px-5 py-3.5 rounded-2xl text-xs font-bold transition-all shadow-lg ${
                  isNarrating
                    ? 'bg-rose-500 hover:bg-rose-600 text-white animate-pulse'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-cyan-300 border border-slate-700 hover:border-cyan-400 hover:scale-105'
                }`}
              >
                {isNarrating ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
                <span>{isNarrating ? t('stopAudioTour') : t('listenAudioTour')}</span>
              </button>
            </div>

            {/* Quick Badges */}
            <div className="pt-4 flex flex-wrap items-center gap-4 text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{lang === 'ar' ? 'معايرة واقعية للألوان ACES' : 'Photorealistic ACES Tone Mapping'}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>{lang === 'ar' ? 'دعم الواقع المعزز AR على الهواتف' : 'AR Supported on Mobile'}</span>
              </span>
            </div>
          </div>

          {/* Right: Live Interactive Hero 3D Showcase (Apollo 11 LM) */}
          <div className="lg:col-span-5 relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/30 to-orange-500/30 rounded-3xl blur-xl opacity-70 animate-pulse pointer-events-none" />
            <div className="relative glass-panel rounded-3xl p-3.5 border border-slate-700/80 shadow-2xl">
              <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                  <span className="text-xs font-mono font-bold text-cyan-400 uppercase">
                    Apollo 11 Eagle Descent Stage (3D)
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">Tranquility Base</span>
              </div>

              <div className="h-[380px] w-full rounded-2xl overflow-hidden">
                <ModelViewerWrapper
                  modelUrl="/models/apollo_11_lm.glb"
                  posterUrl="https://images-assets.nasa.gov/image/as11-40-5927/as11-40-5927~orig.jpg"
                  altText="Apollo 11 Lunar Module Descent Stage"
                  hotspots={[
                    {
                      slot: 'hotspot-dps',
                      position: '0 -0.4 0',
                      normal: '0 -1 0',
                      title: 'Descent Propulsion System',
                      description: 'Throttleable rocket engine that gently lowered Neil Armstrong & Buzz Aldrin to the surface.'
                    }
                  ]}
                  fallbackImages={["https://images-assets.nasa.gov/image/as11-40-5927/as11-40-5927~orig.jpg"]}
                />
              </div>

              <div className="px-3 py-2 flex items-center justify-between text-xs text-slate-400 mt-1">
                <span className="text-[11px] font-mono text-cyan-300">{lang === 'ar' ? 'دور النموذج بالأصبع أو الماوس ☝' : 'Interact with 3D model above ☝'}</span>
                <Link
                  to="/equipment/apollo_11_lm"
                  className="text-xs font-semibold text-cyan-400 hover:underline flex items-center gap-1"
                >
                  <span>{lang === 'ar' ? 'العرض الكامل' : 'Full Exhibit'}</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto text-left">
          <div className="glass-panel p-5 rounded-2xl border border-slate-800/90 hover:border-cyan-500/50 transition-all hover:-translate-y-1">
            <div className="text-3xl font-black font-display text-cyan-400">{t('stat1Val')}</div>
            <div className="text-xs text-slate-400 mt-1 font-mono">{t('stat1Lbl')}</div>
          </div>
          <div className="glass-panel p-5 rounded-2xl border border-slate-800/90 hover:border-orange-500/50 transition-all hover:-translate-y-1">
            <div className="text-3xl font-black font-display text-orange-400">{t('stat2Val')}</div>
            <div className="text-xs text-slate-400 mt-1 font-mono">{t('stat2Lbl')}</div>
          </div>
          <div className="glass-panel p-5 rounded-2xl border border-slate-800/90 hover:border-emerald-500/50 transition-all hover:-translate-y-1">
            <div className="text-3xl font-black font-display text-emerald-400">{t('stat3Val')}</div>
            <div className="text-xs text-slate-400 mt-1 font-mono">{t('stat3Lbl')}</div>
          </div>
          <div className="glass-panel p-5 rounded-2xl border border-slate-800/90 hover:border-purple-500/50 transition-all hover:-translate-y-1">
            <div className="text-3xl font-black font-display text-purple-400">{t('stat4Val')}</div>
            <div className="text-xs text-slate-400 mt-1 font-mono">{t('stat4Lbl')}</div>
          </div>
        </div>
      </section>

      {/* Planetary Landing Radar Section */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8">
        <PlanetaryRadar />
      </section>

      {/* The Core Storytelling Narrative: "Why Are They Left Behind?" */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-slate-800 relative overflow-hidden bg-gradient-to-br from-slate-900/90 via-slate-950 to-slate-900 shadow-2xl">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-3 font-mono">
              <BookOpen className="w-4 h-4" />
              <span>Space Archaeology & Physics</span>
            </div>
            <h2 className="font-display font-bold text-2xl sm:text-4xl text-white">
              {t('whyTitle')}
            </h2>
            <p className="mt-4 text-sm text-slate-300 leading-relaxed">
              {t('whySubtitle')}
            </p>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5 text-xs leading-relaxed text-slate-300">
              <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800/80 hover:border-cyan-500/40 transition-colors">
                <div className="flex items-center gap-2 text-cyan-400 font-bold mb-2 font-display text-sm">
                  <span>{t('physicsTitle')}</span>
                </div>
                {t('physicsDesc')}
              </div>

              <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800/80 hover:border-orange-500/40 transition-colors">
                <div className="flex items-center gap-2 text-orange-400 font-bold mb-2 font-display text-sm">
                  <span>{t('heritageTitle')}</span>
                </div>
                {t('heritageDesc')}
              </div>
            </div>

            {/* Compare Trigger inside narrative */}
            <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">{lang === 'ar' ? 'هل تود معرفة الفروق الهندسية بين هذه المركبات؟' : 'Curious how these explorers compare in weight and power?'}</span>
              <button
                onClick={() => {
                  SoundSystem.playClick();
                  setCompareOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition-all"
              >
                <Layers className="w-4 h-4" />
                <span>{t('compare')}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Hardware Catalog */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-white">
              {lang === 'ar' ? 'مستكشفون فضائيون خالدون' : 'Featured Silent Explorers'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {lang === 'ar' ? 'اختر أي مركبة لفتح العرض التفاعلي الكامل ثلاثي الأبعاد' : 'Select an extraterrestrial explorer to open the full 3D interactive exhibit'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/moon"
              onClick={() => SoundSystem.playClick()}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 group"
            >
              <span>{lang === 'ar' ? 'عرض كل معدات القمر' : 'View All Lunar Equipment'}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-400">Loading catalog...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {equipmentList.slice(0, 3).map((eq) => (
              <EquipmentCard key={eq.equipment_id} equipment={eq} />
            ))}
          </div>
        )}
      </section>

      {/* Embedded AI Space Historian Showcase */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider font-mono">
              <Sparkles className="w-4 h-4" />
              <span>{t('aiTitle')}</span>
            </div>
            <h2 className="font-display font-bold text-2xl sm:text-4xl text-white leading-tight">
              {lang === 'ar' ? 'حاور مؤرخ الفضاء الذكي' : 'Ask the AI Space Historian'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {lang === 'ar'
                ? 'بخلاف نماذج الذكاء الاصطناعي العامة التي قد تهلوس بمعلومات خاطئة، يعتمد مؤرخ الفضاء لدينا على استرجاع دقيق من وثائق ومخطوطات ناسا الرسمية حصراً.'
                : 'Unlike generic chatbots that hallucinate space facts, our Space Historian answers student questions strictly grounded in NASA technical reports, NSSDCA databases, and historical mission logs.'}
            </p>
            <div className="space-y-2.5 text-xs text-slate-400 pt-2 font-mono">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span>{lang === 'ar' ? 'تفسيرات مخصصة: للأطفال، المستكشف، أو العالم' : 'Multi-tier explanations: Kids, Explorers, or Scientists'}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span>{lang === 'ar' ? 'توثيق فوري بالروابط لتقارير وسجلات ناسا' : 'Transparent NASA archival source citations with direct web links'}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span>{lang === 'ar' ? 'حواجز أمان صارمة ترفض الإجابة عن خارج الفضاء' : 'Anti-hallucination guardrails: Admits ignorance when records are absent'}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <ChatHistorian equipmentId="all" equipmentName="the Moon and Mars explorers" />
          </div>
        </div>
      </section>

      {/* Hardware Comparison Modal */}
      <CompareModal isOpen={compareOpen} onClose={() => setCompareOpen(false)} />
    </div>
  );
}
