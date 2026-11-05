import React, { useState, useEffect, useRef } from 'react';
import {
  RotateCw, ZoomIn, Info, AlertTriangle, Image as ImageIcon,
  Maximize2, Minimize2, Sun, Moon, Compass, Crosshair, Sparkles, Volume2, Smartphone
} from 'lucide-react';
import { SoundSystem } from '../../utils/soundEffects';
import { useLanguage } from '../../context/LanguageContext';

export default function ModelViewerWrapper({
  modelUrl,
  posterUrl,
  altText,
  hotspots = [],
  fallbackImages = [],
}) {
  const { t, lang } = useLanguage();
  const viewerRef = useRef(null);
  const containerRef = useRef(null);

  const [activeHotspot, setActiveHotspot] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  // 3D Controls State
  const [autoRotate, setAutoRotate] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lightingMode, setLightingMode] = useState('solar'); // 'solar', 'twilight', 'hologram'
  const [activePreset, setActivePreset] = useState('default');

  useEffect(() => {
    setLoadError(false);
  }, [modelUrl]);

  // Camera presets
  const applyCameraPreset = (name, orbit) => {
    SoundSystem.playScan();
    setActivePreset(name);
    if (viewerRef.current) {
      viewerRef.current.cameraOrbit = orbit;
      viewerRef.current.jumpCameraToGoal();
    }
  };

  // Toggle Auto Rotation
  const toggleAutoRotate = () => {
    SoundSystem.playClick();
    setAutoRotate(!autoRotate);
  };

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    SoundSystem.playClick();
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Cycle Lighting Modes
  const cycleLighting = () => {
    SoundSystem.playClick();
    const modes = ['solar', 'twilight', 'hologram'];
    const next = modes[(modes.indexOf(lightingMode) + 1) % modes.length];
    setLightingMode(next);
  };

  // Handle Hotspot Click
  const handleHotspotClick = (h) => {
    SoundSystem.playScan();
    setActiveHotspot(h);
  };

  const getLightingProps = () => {
    switch (lightingMode) {
      case 'twilight':
        return { exposure: '0.85', shadowIntensity: '1.4', shadowSoftness: '0.9' };
      case 'hologram':
        return { exposure: '1.4', shadowIntensity: '0.5', shadowSoftness: '0.2' };
      default:
        return { exposure: '1.25', shadowIntensity: '2.0', shadowSoftness: '0.5' };
    }
  };

  if (loadError || !modelUrl) {
    return (
      <div className="relative w-full h-[520px] bg-slate-950/80 rounded-2xl border border-slate-800 flex flex-col items-center justify-center p-6 text-center overflow-hidden shadow-2xl">
        {fallbackImages && fallbackImages.length > 0 ? (
          <div className="w-full h-full relative flex flex-col">
            <img
              src={fallbackImages[activePhotoIdx]}
              alt={altText}
              className="w-full h-full object-cover rounded-xl"
            />
            <div className="absolute top-4 left-4 bg-slate-900/90 border border-slate-700 px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 text-slate-300">
              <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
              <span>NASA Archival Photo Gallery ({activePhotoIdx + 1}/{fallbackImages.length})</span>
            </div>
            {fallbackImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-700">
                {fallbackImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      SoundSystem.playClick();
                      setActivePhotoIdx(idx);
                    }}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      idx === activePhotoIdx ? 'bg-cyan-400 w-5' : 'bg-slate-600'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-2" />
            <p className="text-sm text-slate-300 font-medium">3D Asset Unavailable</p>
            <p className="text-xs text-slate-500 mt-1">Rendering archival photography</p>
          </div>
        )}
      </div>
    );
  }

  const lightingProps = getLightingProps();

  return (
    <div
      ref={containerRef}
      className={`relative w-full rounded-2xl border border-slate-800/90 overflow-hidden shadow-2xl transition-all duration-300 ${
        isFullscreen ? 'h-screen fixed inset-0 z-50 rounded-none bg-black' : 'h-[520px] bg-slate-950/90'
      } ${lightingMode === 'hologram' ? 'ring-1 ring-cyan-500/50' : ''}`}
    >
      {/* Sci-Fi Hologram Overlay Grid lines */}
      {lightingMode === 'hologram' && (
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:24px_24px] opacity-20 z-10" />
      )}

      {/* Top Left: Model viewer status panel */}
      <div className="absolute top-3 left-3 z-20 flex flex-col gap-1 pointer-events-none">
        <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-900/85 backdrop-blur-md border border-slate-800 text-[10px] text-cyan-400 font-mono">
          <Crosshair className="w-3 h-3 text-cyan-400 animate-spin" />
          <span>{lang === 'ar' ? 'عارض نموذج ثلاثي الأبعاد' : '3D MODEL VIEWER'}</span>
        </div>
        <div className="px-3 py-1.5 rounded-lg bg-slate-950/80 backdrop-blur-md border border-slate-800/80 text-[10px] text-slate-400 font-mono space-y-0.5">
          <div>ASSET: <span className="text-slate-200">3D MODEL</span></div>
          <div>MODE: <span className="text-cyan-400 uppercase">{lightingMode}</span></div>
          <div>AR: <span className="text-emerald-400">SUPPORTED DEVICE REQUIRED</span></div>
        </div>
      </div>

      {/* Top Right: Viewport Action Icons */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
        {/* Toggle Lighting Mode */}
        <button
          onClick={cycleLighting}
          className="p-2 rounded-xl bg-slate-900/85 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-cyan-400 transition-colors shadow-lg"
          title={`Lighting Mode: ${lightingMode}`}
        >
          {lightingMode === 'solar' ? (
            <Sun className="w-3.5 h-3.5 text-amber-400" />
          ) : lightingMode === 'twilight' ? (
            <Moon className="w-3.5 h-3.5 text-sky-400" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          )}
        </button>

        {/* Toggle Auto Rotation */}
        <button
          onClick={toggleAutoRotate}
          className={`p-2 rounded-xl border transition-colors shadow-lg ${
            autoRotate
              ? 'bg-cyan-950/80 text-cyan-400 border-cyan-500/50'
              : 'bg-slate-900/85 text-slate-400 border-slate-800 hover:text-white'
          }`}
          title="Toggle Auto Rotation"
        >
          <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
        </button>

        {/* Fullscreen Button */}
        <button
          onClick={toggleFullscreen}
          className="p-2 rounded-xl bg-slate-900/85 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors shadow-lg"
          title="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* 3D Web Component with AR Enabled */}
      <model-viewer
        ref={viewerRef}
        src={modelUrl}
        poster={posterUrl || fallbackImages?.[0]}
        alt={altText}
        auto-rotate={autoRotate ? true : null}
        auto-rotate-delay="500"
        rotation-per-second="18deg"
        camera-controls
        touch-action="pan-y"
        ar
        ar-modes="webxr scene-viewer quick-look"
        ar-scale="auto"
        shadow-intensity={lightingProps.shadowIntensity}
        shadow-softness={lightingProps.shadowSoftness}
        exposure={lightingProps.exposure}
        tone-mapping="aces"
        environment-image="neutral"
        loading="lazy"
        onError={() => setLoadError(true)}
        style={{ width: '100%', height: '100%', backgroundColor: '#030712' }}
      >
        {/* Custom AR Button */}
        <button
          slot="ar-button"
          className="absolute top-14 right-3 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl border border-cyan-400/50 shadow-xl flex items-center gap-1.5 transition-all hover:scale-105"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>{t('viewAR')}</span>
        </button>

        {/* Hotspots with Concentric Radar Wave Animation */}
        {hotspots.map((h, idx) => (
          <button
            key={idx}
            slot={h.slot}
            data-position={h.position}
            data-normal={h.normal}
            onClick={() => handleHotspotClick(h)}
            className="group relative flex items-center justify-center cursor-pointer focus:outline-none"
            aria-label={h.title}
          >
            {/* Outer expanding pulsing ripple */}
            <span className="absolute w-7 h-7 rounded-full bg-cyan-400/40 animate-ping pointer-events-none" />
            {/* Intermediate ring */}
            <span className="absolute w-5 h-5 rounded-full border-2 border-cyan-400 bg-cyan-950/70 pointer-events-none group-hover:scale-125 transition-transform" />
            {/* Inner glowing dot */}
            <span className="relative w-2.5 h-2.5 rounded-full bg-white shadow-lg shadow-cyan-400" />
            {/* Tooltip on hover */}
            <span className="absolute left-6 whitespace-nowrap bg-slate-900/95 text-cyan-300 border border-slate-700 text-[10px] font-mono px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl">
              {h.title}
            </span>
          </button>
        ))}
      </model-viewer>

      {/* Bottom Bar: Quick Camera Angles Bar */}
      <div className="absolute bottom-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-auto">
        <div className="flex items-center gap-1 bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-800 text-[11px] shadow-xl">
          <span className="text-[10px] font-mono text-slate-500 uppercase px-2">{lang === 'ar' ? 'الزاوية:' : 'Angle:'}</span>
          <button
            onClick={() => applyCameraPreset('default', '45deg 65deg 2.4m')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              activePreset === 'default'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {lang === 'ar' ? 'عام' : 'Isometric'}
          </button>
          <button
            onClick={() => applyCameraPreset('orbital', '0deg 15deg 2.2m')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              activePreset === 'orbital'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {lang === 'ar' ? 'علوي' : 'Zenith'}
          </button>
          <button
            onClick={() => applyCameraPreset('side', '90deg 75deg 2.4m')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              activePreset === 'side'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {lang === 'ar' ? 'جانبي' : 'Profile'}
          </button>
          <button
            onClick={() => applyCameraPreset('surface', '-45deg 85deg 1.6m')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              activePreset === 'surface'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {lang === 'ar' ? 'السطح' : 'Lander Eye'}
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[10px] text-slate-400 font-mono">
          <span>ORBIT / تدوير</span>
          <span>•</span>
          <span>PAN / تحريك</span>
          <span>•</span>
          <span>ZOOM / تكبير</span>
        </div>
      </div>

      {/* Active Hotspot Inspector Card */}
      {activeHotspot && (
        <div className="absolute top-16 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 bg-slate-900/95 border border-cyan-500/80 p-4 rounded-2xl shadow-2xl backdrop-blur-xl z-30 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <h4 className="text-xs font-bold text-cyan-400 tracking-wide font-display uppercase">
                {activeHotspot.title}
              </h4>
            </div>
            <button
              onClick={() => {
                SoundSystem.playClick();
                setActiveHotspot(null);
              }}
              className="text-slate-400 hover:text-white text-xs px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700"
            >
              ✕
            </button>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed">{activeHotspot.description}</p>
        </div>
      )}
    </div>
  );
}
