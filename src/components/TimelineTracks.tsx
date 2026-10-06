import React from 'react';
import { Film, Type, Mic, Volume2, Palette, Clock, Plus, Sliders } from 'lucide-react';
import { ProductionProject, ShotItem } from '../types/producer';

interface TimelineTracksProps {
  project: ProductionProject;
  activeShotIndex: number;
  onSelectShot: (index: number) => void;
  onAddShot: () => void;
  onInspectShot: (shot: ShotItem) => void;
}

export const TimelineTracks: React.FC<TimelineTracksProps> = ({
  project,
  activeShotIndex,
  onSelectShot,
  onAddShot,
  onInspectShot,
}) => {
  const shots = project.shots;
  const totalDuration = shots.reduce((acc, s) => acc + s.durationSec, 0);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
      {/* Header with Timeline Metadata */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-950/80 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-slate-100">Multi-Track Production Timeline</h3>
          <span className="text-slate-600">·</span>
          <span className="text-xs text-slate-400 font-mono tabular-nums">
            {shots.length} Shots · {totalDuration}s Total Run Time
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-xs text-amber-400">24 FPS Master</span>
        </div>

        <button
          onClick={onAddShot}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Shot</span>
        </button>
      </div>

      {/* Tracks Container */}
      <div className="p-4 space-y-3 overflow-x-auto">
        {/* Track 1: Video Master (V1) */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
            <Film className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold text-slate-300">V1: VIDEO SHOTS (HIGGSFIELD / RUNWAY / MIDJOURNEY)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
            {shots.map((shot, idx) => {
              const isSelected = idx === activeShotIndex;
              return (
                <div
                  key={shot.id}
                  onClick={() => onSelectShot(idx)}
                  className={`group relative p-2.5 rounded border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800 border-amber-400 ring-1 ring-amber-400/50 shadow-md'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded bg-slate-800 text-[10px] font-mono flex items-center justify-center text-amber-400 font-semibold">
                        {shot.shotNumber}
                      </span>
                      <span className="text-xs font-medium text-slate-200 truncate max-w-[130px]">
                        {shot.title}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 shrink-0">
                      {shot.durationSec}s
                    </span>
                  </div>

                  {shot.imagePreviewUrl && (
                    <div className="relative h-20 w-full mb-2 rounded overflow-hidden bg-black">
                      <img
                        src={shot.imagePreviewUrl}
                        alt={shot.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute bottom-1 left-1 bg-black/80 px-1.5 py-0.5 rounded text-[9px] text-slate-300 font-mono">
                        {shot.lensMm}
                      </div>
                      <div className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-[9px] text-amber-300 font-mono">
                        {shot.cameraMotion}
                      </div>
                    </div>
                  )}

                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-2">
                    {shot.visualPrompt}
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[10px] text-slate-400">
                    <span className="truncate max-w-[100px]">{shot.shotType}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onInspectShot(shot);
                      }}
                      className="text-amber-400 hover:underline"
                    >
                      Configure
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Track 2: Canva Graphics & Overlays (V2) */}
        <div className="space-y-1 pt-2 border-t border-slate-800/60">
          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
            <Type className="w-3.5 h-3.5 text-sky-400" />
            <span className="font-semibold text-slate-300">V2: CANVA OVERLAYS & LOWER THIRDS</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
            {shots.map((shot, idx) => {
              const overlay = project.connectors.canva.overlays[idx] || {
                text: shot.title,
                layout: 'Dynamic Title Card',
              };
              return (
                <div
                  key={`canva_${shot.id}`}
                  className="p-2 rounded bg-sky-950/20 border border-sky-900/40 text-[11px] flex items-center justify-between gap-2"
                >
                  <div className="truncate">
                    <span className="text-sky-300 font-medium block truncate">{overlay.text}</span>
                    <span className="text-slate-400 text-[10px] block truncate">{overlay.layout}</span>
                  </div>
                  <span className="text-[10px] font-mono text-sky-400 shrink-0">Canva</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Track 3: Voiceover (A1) */}
        <div className="space-y-1 pt-2 border-t border-slate-800/60">
          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
            <Mic className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold text-slate-300">A1: ELEVENLABS DIALOGUE & VOICEOVER</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
            {shots.map((shot) => (
              <div
                key={`vo_${shot.id}`}
                className="p-2 rounded bg-emerald-950/20 border border-emerald-900/40 text-[11px]"
              >
                <div className="flex items-center justify-between text-[10px] text-emerald-400 mb-0.5">
                  <span>{shot.character || 'Narrator'}</span>
                  <span className="font-mono">Sync VO</span>
                </div>
                <p className="text-slate-300 text-[11px] italic line-clamp-2">
                  "{shot.voiceover || 'Ambient breathing and silence'}"
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Track 4: SFX & Atmosphere (A2) */}
        <div className="space-y-1 pt-2 border-t border-slate-800/60">
          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
            <Volume2 className="w-3.5 h-3.5 text-purple-400" />
            <span className="font-semibold text-slate-300">A2: FOLEY & SOUND EFFECTS (CAPCUT SOUND BANK)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
            {shots.map((shot) => (
              <div
                key={`sfx_${shot.id}`}
                className="p-2 rounded bg-purple-950/20 border border-purple-900/40 text-[11px]"
              >
                <div className="flex flex-wrap gap-1">
                  {shot.sfx.map((s, i) => (
                    <span
                      key={i}
                      className="text-[10px] text-purple-300 bg-purple-900/40 px-1.5 py-0.5 rounded"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Track 5: DaVinci Resolve Color Grade (L1) */}
        <div className="p-2.5 rounded bg-amber-950/20 border border-amber-900/40 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Palette className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-mono font-semibold text-slate-300">L1: DAVINCI COLOR LUT</span>
            <span className="text-slate-500">·</span>
            <span className="text-amber-300 font-medium">{project.autonomousDecisions.colorPalette.gradingName}</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span>Curve: {project.autonomousDecisions.colorPalette.contrastCurve}</span>
            <span className="text-slate-600">·</span>
            <span>Saturation: {project.autonomousDecisions.colorPalette.saturationLevel}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
