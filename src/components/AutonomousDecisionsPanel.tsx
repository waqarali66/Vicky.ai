import React from 'react';
import {
  Palette,
  User,
  Compass,
  Music,
  Sparkles,
  CheckCircle2,
  ScanFace,
  Activity,
  Plus,
  Edit2,
} from 'lucide-react';
import { ProductionProject, CharacterProfile } from '../types/producer';

interface AutonomousDecisionsPanelProps {
  project: ProductionProject;
  onOpenCharacterUpload?: (character?: CharacterProfile) => void;
}

export const AutonomousDecisionsPanel: React.FC<AutonomousDecisionsPanelProps> = ({
  project,
  onOpenCharacterUpload,
}) => {
  const { autonomousDecisions } = project;
  const { colorPalette, characterBible, locations, soundDesign, directorRationale } = autonomousDecisions;

  return (
    <div className="space-y-6">
      {/* Executive Directorial Rationale Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center shrink-0 text-amber-400">
            <Sparkles className="w-4 h-4 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-semibold text-slate-100">
                vicky.AI Directorial Synthesis & Rationale
              </h3>
              <span className="text-[11px] text-amber-400 font-mono">Autonomous Decision Engine</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {directorRationale}
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Autonomous Decisions: Color, Character, Locations, Sound */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Color Combination & Grading Science */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-amber-400" />
              <h4 className="text-sm font-semibold text-slate-100">Autonomous Color Harmony</h4>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">{colorPalette.gradingName}</span>
          </div>

          {/* Color Swatches */}
          <div className="grid grid-cols-4 gap-2">
            <div>
              <div
                className="h-12 rounded border border-white/10 shadow-inner mb-1.5"
                style={{ backgroundColor: colorPalette.primary }}
              />
              <span className="text-[10px] text-slate-400 block">Primary Canvas</span>
              <span className="text-xs font-mono text-slate-200">{colorPalette.primary}</span>
            </div>
            <div>
              <div
                className="h-12 rounded border border-white/10 shadow-inner mb-1.5"
                style={{ backgroundColor: colorPalette.secondary }}
              />
              <span className="text-[10px] text-slate-400 block">Midtone Tone</span>
              <span className="text-xs font-mono text-slate-200">{colorPalette.secondary}</span>
            </div>
            <div>
              <div
                className="h-12 rounded border border-white/10 shadow-inner mb-1.5"
                style={{ backgroundColor: colorPalette.accent }}
              />
              <span className="text-[10px] text-slate-400 block">Key Accent</span>
              <span className="text-xs font-mono text-slate-200">{colorPalette.accent}</span>
            </div>
            <div>
              <div
                className="h-12 rounded border border-white/10 shadow-inner mb-1.5"
                style={{ backgroundColor: colorPalette.shadows }}
              />
              <span className="text-[10px] text-slate-400 block">Shadow Lift</span>
              <span className="text-xs font-mono text-slate-200">{colorPalette.shadows}</span>
            </div>
          </div>

          {/* Color Science Specs */}
          <div className="bg-slate-950/60 p-3 rounded border border-slate-800/80 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Contrast Curve:</span>
              <span className="text-slate-200 font-medium">{colorPalette.contrastCurve}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Saturation Balance:</span>
              <span className="text-slate-200 font-medium">{colorPalette.saturationLevel}</span>
            </div>
            <div className="pt-2 border-t border-slate-800 text-slate-400 text-[11px] leading-relaxed">
              <strong className="text-slate-300">Vicky's Rationale: </strong>
              {colorPalette.rationale}
            </div>
          </div>
        </div>

        {/* 2. Consistent Character Bible with Face Preservation & Body Posture */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-400" />
              <h4 className="text-sm font-semibold text-slate-100">Character Bible (Face & Posture Lock)</h4>
            </div>

            {onOpenCharacterUpload && (
              <button
                type="button"
                onClick={() => onOpenCharacterUpload()}
                className="px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-medium transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Upload Character</span>
              </button>
            )}
          </div>

          <div className="space-y-3">
            {characterBible.map((char, idx) => (
              <div key={idx} className="bg-slate-950/60 p-3.5 rounded border border-slate-800/80 space-y-2.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    {char.imageUrl ? (
                      <img
                        src={char.imageUrl}
                        alt={char.name}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-lg object-cover border border-emerald-500/40 shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 shrink-0">
                        <User className="w-6 h-6" />
                      </div>
                    )}
                    <div>
                      <span className="text-xs font-semibold text-emerald-400 block">{char.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono block">{char.role}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    {char.facePreserveEnabled && (
                      <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800/60 flex items-center gap-1">
                        <ScanFace className="w-3 h-3" />
                        <span>Face ID ({( (char.facePreserveStrength ?? 0.92) * 100).toFixed(0)}%)</span>
                      </span>
                    )}
                    {char.bodyPosture && (
                      <span className="text-[10px] font-mono text-sky-300 bg-sky-950 px-1.5 py-0.5 rounded border border-sky-800/60 flex items-center gap-1">
                        <Activity className="w-3 h-3" />
                        <span>{char.bodyPosture}</span>
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {char.visualDescription}
                </p>

                <div className="text-[11px] space-y-1 text-slate-400">
                  <div>
                    <strong className="text-slate-300">Wardrobe: </strong> {char.wardrobe}
                  </div>
                  <div>
                    <strong className="text-slate-300">Voice Profile: </strong> {char.voiceProfile}
                  </div>
                </div>

                {/* Generative Seed Tag */}
                <div className="mt-2 p-1.5 rounded bg-emerald-950/30 border border-emerald-900/50 flex items-center justify-between text-[10px]">
                  <span className="font-mono text-emerald-300 truncate">{char.consistencySeedPrompt}</span>
                  {onOpenCharacterUpload && (
                    <button
                      type="button"
                      onClick={() => onOpenCharacterUpload(char)}
                      className="text-emerald-400 hover:underline font-mono shrink-0 ml-2"
                    >
                      Configure
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Autonomous Location Scouting */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-sky-400" />
              <h4 className="text-sm font-semibold text-slate-100">Autonomous Location Scout</h4>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              {locations.length} Scouted Set{locations.length > 1 ? 's' : ''}
            </span>
          </div>

          <div className="space-y-3">
            {locations.map((loc, idx) => (
              <div key={idx} className="bg-slate-950/60 p-3.5 rounded border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-sky-400">{loc.name}</span>
                  <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">
                    {loc.environmentType}
                  </span>
                </div>
                <div className="text-xs space-y-1 text-slate-400">
                  <div>
                    <strong className="text-slate-300">Lighting: </strong> {loc.lighting}
                  </div>
                  <div>
                    <strong className="text-slate-300">Atmosphere: </strong> {loc.atmosphere}
                  </div>
                  <div>
                    <strong className="text-slate-300">Camera Placement: </strong> {loc.cameraPlacement}
                  </div>
                </div>
                <div className="p-1.5 rounded bg-sky-950/30 border border-sky-900/50 text-[10px] text-sky-300 font-mono truncate">
                  {loc.visualRefPrompt}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Sound Design & Audio Direction */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Music className="w-4 h-4 text-purple-400" />
              <h4 className="text-sm font-semibold text-slate-100">Sound Design & Music Direction</h4>
            </div>
            <span className="text-[11px] text-slate-400 font-mono tabular-nums">{soundDesign.bpm} BPM</span>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded border border-slate-800/80 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Score Genre:</span>
              <span className="text-slate-200 font-medium">{soundDesign.musicGenre}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Mood Signature:</span>
              <span className="text-slate-200 font-medium">{soundDesign.mood}</span>
            </div>
            <div className="pt-2 border-t border-slate-800">
              <span className="text-slate-400 block mb-1">Key Orchestration:</span>
              <div className="flex flex-wrap gap-1.5">
                {soundDesign.instruments.map((inst, i) => (
                  <span
                    key={i}
                    className="text-[11px] text-purple-300 bg-purple-950/50 border border-purple-900/40 px-2 py-0.5 rounded"
                  >
                    {inst}
                  </span>
                ))}
              </div>
            </div>
            <div className="pt-2 border-t border-slate-800 text-slate-400 text-[11px]">
              <strong className="text-slate-300">Mixer Guidance: </strong>
              {soundDesign.audioMixNotes}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
