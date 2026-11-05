import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Compass, Calendar, Layers, ShieldCheck, Award, BookOpen, Clock,
  Sparkles, ExternalLink, ArrowLeft, CheckCircle2, AlertCircle, FileText,
  Volume2, VolumeX, Radio
} from 'lucide-react';
import { SpaceLegacyAPI } from '../services/api';
import ModelViewerWrapper from '../components/3d/ModelViewerWrapper';
import MissionTimeline from '../components/timeline/MissionTimeline';
import ChatHistorian from '../components/ai/ChatHistorian';
import QuizModal from '../components/quiz/QuizModal';
import { SoundSystem } from '../utils/soundEffects';
import { SpeechNarrator } from '../utils/speech';
import { useLanguage } from '../context/LanguageContext';

export default function EquipmentDetailPage() {
  const { id } = useParams();
  const { t, lang } = useLanguage();
  const [equipment, setEquipment] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [quizOpen, setQuizOpen] = useState(false);
  const [isNarrating, setIsNarrating] = useState(false);

  useEffect(() => {
    async function loadExhibit() {
      setLoading(true);
      try {
        const [eqData, tlData] = await Promise.all([
          SpaceLegacyAPI.getEquipmentDetail(id),
          SpaceLegacyAPI.getTimeline(id),
        ]);
        setEquipment(eqData);
        setTimeline(tlData);
      } catch (err) {
        console.error('Failed to load equipment detail:', err);
      } finally {
        setLoading(false);
      }
    }
    loadExhibit();

    return () => {
      SpeechNarrator.stop();
    };
  }, [id]);

  const toggleNarration = () => {
    if (isNarrating) {
      SpeechNarrator.stop();
      setIsNarrating(false);
    } else {
      if (!equipment) return;
      const narrationText =
        lang === 'ar'
          ? `${equipment.common_name}. ${equipment.why_left_behind}. والأهمية العلمية: ${equipment.scientific_legacy}`
          : `${equipment.common_name}. ${equipment.why_left_behind}. Scientific legacy: ${equipment.scientific_legacy}`;

      setIsNarrating(true);
      SpeechNarrator.speak(narrationText, lang, () => {
        setIsNarrating(false);
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-slate-400">
        <Sparkles className="w-8 h-8 text-cyan-400 animate-spin mr-3" />
        <span>Loading NASA virtual museum exhibit...</span>
      </div>
    );
  }

  if (!equipment) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
        <AlertCircle className="w-12 h-12 text-rose-400 mb-3" />
        <h2 className="text-xl font-bold text-white font-display">Explorer Not Found</h2>
        <p className="text-xs text-slate-400 mt-1 max-w-sm">
          We couldn't locate mission records for equipment ID '{id}'.
        </p>
        <Link to="/" className="mt-6 px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-cyan-400">
          Back to Portal
        </Link>
      </div>
    );
  }

  const isMars = equipment.celestial_body === 'mars';

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      {/* Navigation Breadcrumb & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          to={isMars ? '/mars' : '/moon'}
          onClick={() => SoundSystem.playClick()}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-cyan-400 transition-colors font-mono"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('backToCatalog')}</span>
        </Link>

        <div className="flex items-center gap-3">
          {/* Voice Narration Button */}
          <button
            onClick={toggleNarration}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
              isNarrating
                ? 'bg-rose-500 hover:bg-rose-600 text-white animate-pulse'
                : 'bg-slate-900/90 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 hover:scale-105'
            }`}
          >
            {isNarrating ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
            <span>{isNarrating ? t('stopAudioTour') : t('listenStory')}</span>
          </button>

          {/* Trigger Quiz Button */}
          <button
            onClick={() => {
              SoundSystem.playClick();
              setQuizOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition-all hover:scale-105 active:scale-95"
          >
            <Award className="w-4 h-4" />
            <span>{t('takeQuiz')}</span>
          </button>
        </div>
      </div>

      {/* Main Exhibit Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: 3D Model Inspection & Coordinates */}
        <div className="lg:col-span-6 space-y-6">
          <ModelViewerWrapper
            modelUrl={equipment.model_glb_url}
            posterUrl={equipment.fallback_image_urls?.[0]}
            altText={equipment.common_name}
            hotspots={equipment.hotspots || []}
            fallbackImages={equipment.fallback_image_urls || []}
          />

          {/* Quick Telemetry Specs Card */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
            <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>{lang === 'ar' ? 'الإحداثيات الجغرافية على السطح' : 'Extraterrestrial Surface Coordinates'}</span>
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase">{t('landingSite')}</span>
                <strong className="text-white text-xs truncate block mt-0.5">
                  {equipment.landing_site_name || 'Classified Site'}
                </strong>
              </div>
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase">{t('coordinates')}</span>
                <strong className="text-cyan-400 text-xs truncate block mt-0.5">
                  {equipment.latitude}° N, {equipment.longitude}° E
                </strong>
              </div>
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase">{t('massDim')}</span>
                <strong className="text-slate-200 text-xs truncate block mt-0.5">
                  {equipment.mass_kg || 'Standard Spec'}
                </strong>
              </div>
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase">{t('operationalStatus')}</span>
                <strong className="text-emerald-400 text-xs truncate block mt-0.5">
                  {equipment.operational_status || 'Mission Complete'}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Tabbed Exhibit Dossier */}
        <div className="lg:col-span-6 space-y-6">
          {/* Header Info */}
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
              <span>{equipment.mission_name || equipment.mission_id?.toUpperCase()}</span>
              <span>•</span>
              <span className="capitalize">{equipment.celestial_body} Explorer</span>
            </div>
            <h1 className="font-display font-black text-2xl sm:text-4xl text-white">
              {equipment.common_name}
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-mono">{equipment.official_name}</p>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1 border-b border-slate-800 pb-2 overflow-x-auto no-scrollbar text-xs">
            <button
              onClick={() => {
                SoundSystem.playClick();
                setActiveTab('overview');
              }}
              className={`px-3.5 py-1.5 rounded-xl font-medium transition-all ${
                activeTab === 'overview'
                  ? 'bg-slate-800 text-cyan-400 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t('storyAndScience')}
            </button>
            <button
              onClick={() => {
                SoundSystem.playClick();
                setActiveTab('timeline');
              }}
              className={`px-3.5 py-1.5 rounded-xl font-medium transition-all ${
                activeTab === 'timeline'
                  ? 'bg-slate-800 text-cyan-400 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t('timeline')} ({timeline.length})
            </button>
            <button
              onClick={() => {
                SoundSystem.playClick();
                setActiveTab('historian');
              }}
              className={`px-3.5 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'historian'
                  ? 'bg-cyan-950/80 text-cyan-400 border border-cyan-500/50 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>{t('askAI')}</span>
            </button>
            <button
              onClick={() => {
                SoundSystem.playClick();
                setActiveTab('sources');
              }}
              className={`px-3.5 py-1.5 rounded-xl font-medium transition-all ${
                activeTab === 'sources'
                  ? 'bg-slate-800 text-cyan-400 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t('nasaSources')}
            </button>
          </div>

          {/* Tab 1: Story & Science Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in">
              {/* Why Left Behind Callout */}
              <div className="glass-panel p-5 rounded-2xl border border-amber-500/40 bg-amber-950/15 space-y-2 shadow-lg">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>{t('whyLeftCallout')}</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {equipment.why_left_behind}
                </p>
              </div>

              {/* Scientific Legacy */}
              <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2 shadow-md">
                <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
                  <Award className="w-4 h-4" />
                  <span>{t('scientificImportance')}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {equipment.scientific_legacy}
                </p>
              </div>

              {/* Physical Parameters */}
              <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3 shadow-md">
                <h4 className="font-display font-bold text-xs text-white">{t('engineeringParams')}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300 font-mono">
                  <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Dimensions</span>
                    <span className="text-xs">{equipment.dimensions || 'Standard configuration'}</span>
                  </div>
                  <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Launch Date</span>
                    <span className="text-xs">{equipment.launch_date || 'Classified'}</span>
                  </div>
                  <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Touchdown Date</span>
                    <span className="text-xs">{equipment.landing_date || 'Precursor mission'}</span>
                  </div>
                  <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">End of Mission</span>
                    <span className="text-xs">{equipment.mission_end_date || 'Permanent in-situ monument'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Chronological Timeline */}
          {activeTab === 'timeline' && (
            <div className="animate-in fade-in">
              <MissionTimeline events={timeline} />
            </div>
          )}

          {/* Tab 3: AI Space Historian */}
          {activeTab === 'historian' && (
            <div className="animate-in fade-in">
              <ChatHistorian
                equipmentId={equipment.equipment_id}
                equipmentName={equipment.common_name}
              />
            </div>
          )}

          {/* Tab 4: NASA Sources */}
          {activeTab === 'sources' && (
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 animate-in fade-in shadow-xl">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
                <FileText className="w-4 h-4" />
                <span>{t('nasaSources')}</span>
              </div>
              <p className="text-xs text-slate-400">
                {lang === 'ar'
                  ? 'تم التحقق من كافة التواريخ، الأبعاد، الإحداثيات والنتائج العلمية عبر قواعد بيانات ومكتبات ناسا الرسمية:'
                  : 'Every date, dimension, instrument payload, and mission outcome is referenced against official NASA archives:'}
              </p>

              <div className="space-y-3 pt-2">
                {equipment.sources && equipment.sources.length > 0 ? (
                  equipment.sources.map((s, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between gap-4 hover:border-slate-700 transition-colors"
                    >
                      <div>
                        <h5 className="font-semibold text-xs text-white">{s.title}</h5>
                        <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                          {s.author_or_org} ({s.publication_year || 'Archival'})
                        </p>
                      </div>
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-cyan-400 hover:border-cyan-400 transition-colors shrink-0"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-500 font-mono">
                    Direct citations cataloged in National Space Science Data Center (NSSDCA).
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quiz Modal */}
      <QuizModal
        equipmentId={equipment.equipment_id}
        equipmentName={equipment.common_name}
        isOpen={quizOpen}
        onClose={() => setQuizOpen(false)}
      />
    </div>
  );
}
