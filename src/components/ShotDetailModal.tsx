import React, { useState } from 'react';
import { X, Sparkles, Film, Camera, Mic, Volume2, Save } from 'lucide-react';
import { ShotItem, ShotType, CameraMotion } from '../types/producer';

interface ShotDetailModalProps {
  shot: ShotItem | null;
  onClose: () => void;
  onSave: (updatedShot: ShotItem) => void;
  onRefineWithVicky: (shot: ShotItem, instruction: string) => Promise<void>;
}

export const ShotDetailModal: React.FC<ShotDetailModalProps> = ({
  shot,
  onClose,
  onSave,
  onRefineWithVicky,
}) => {
  if (!shot) return null;

  const [title, setTitle] = useState(shot.title);
  const [durationSec, setDurationSec] = useState(shot.durationSec);
  const [shotType, setShotType] = useState<ShotType>(shot.shotType);
  const [cameraMotion, setCameraMotion] = useState<CameraMotion>(shot.cameraMotion);
  const [lensMm, setLensMm] = useState(shot.lensMm);
  const [visualPrompt, setVisualPrompt] = useState(shot.visualPrompt);
  const [voiceover, setVoiceover] = useState(shot.voiceover || '');
  const [sfxText, setSfxText] = useState(shot.sfx.join(', '));
  const [transition, setTransition] = useState(shot.transition);

  const [refineInstruction, setRefineInstruction] = useState('');
  const [isRefining, setIsRefining] = useState(false);

  const handleSave = () => {
    onSave({
      ...shot,
      title,
      durationSec,
      shotType,
      cameraMotion,
      lensMm,
      visualPrompt,
      voiceover,
      sfx: sfxText.split(',').map((s) => s.trim()).filter(Boolean),
      transition,
    });
    onClose();
  };

  const handleRefine = async () => {
    if (!refineInstruction.trim()) return;
    setIsRefining(true);
    try {
      await onRefineWithVicky(shot, refineInstruction);
    } finally {
      setIsRefining(false);
      setRefineInstruction('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950/80 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-amber-400 text-slate-950 text-xs font-mono font-bold flex items-center justify-center">
              {shot.shotNumber}
            </span>
            <h3 className="text-base font-semibold text-white">Shot Specification & Director Controls</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Vicky Autonomous Refinement Bar */}
          <div className="p-3.5 rounded-lg bg-amber-950/20 border border-amber-900/40 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-medium text-amber-400">
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              <span>Ask Vicky to Autonomously Refine This Shot</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={refineInstruction}
                onChange={(e) => setRefineInstruction(e.target.value)}
                placeholder="e.g. Make it more intense with an extreme low-angle tracking dolly and heavy rain droplets"
                className="flex-1 bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
              />
              <button
                onClick={handleRefine}
                disabled={isRefining || !refineInstruction.trim()}
                className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 text-xs font-medium rounded transition-colors whitespace-nowrap"
              >
                {isRefining ? 'Refining...' : 'Refine'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-400">Shot Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-400">Duration (seconds)</label>
              <input
                type="number"
                min={1}
                max={60}
                value={durationSec}
                onChange={(e) => setDurationSec(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-400">Shot Framing</label>
              <select
                value={shotType}
                onChange={(e) => setShotType(e.target.value as ShotType)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
              >
                <option value="Wide Master">Wide Master</option>
                <option value="Extreme Wide">Extreme Wide</option>
                <option value="Medium">Medium</option>
                <option value="Close-Up">Close-Up</option>
                <option value="Extreme Close-Up">Extreme Close-Up</option>
                <option value="Low-Angle Tracking">Low-Angle Tracking</option>
                <option value="Drone Orbit">Drone Orbit</option>
                <option value="Dutch Tilt">Dutch Tilt</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-400">Camera Movement</label>
              <select
                value={cameraMotion}
                onChange={(e) => setCameraMotion(e.target.value as CameraMotion)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
              >
                <option value="Static">Static Lock-off</option>
                <option value="Slow Push-In">Slow Push-In</option>
                <option value="Dolly Track Right">Dolly Track Right</option>
                <option value="Crane Jib Down">Crane Jib Down</option>
                <option value="FPV Drone Arc">FPV Drone Arc</option>
                <option value="Handheld Raw">Handheld Raw</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-400">Lens Optics</label>
              <input
                type="text"
                value={lensMm}
                onChange={(e) => setLensMm(e.target.value)}
                placeholder="e.g. 35mm Anamorphic T1.9"
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-400">Generative AI Video Prompt (Higgsfield / Runway / Sora)</label>
            <textarea
              rows={3}
              value={visualPrompt}
              onChange={(e) => setVisualPrompt(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-400 leading-relaxed"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-400">Dialogue / Voiceover Line</label>
            <input
              type="text"
              value={voiceover}
              onChange={(e) => setVoiceover(e.target.value)}
              placeholder="Script line spoken during this shot"
              className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-400">Sound Effects (comma-separated)</label>
              <input
                type="text"
                value={sfxText}
                onChange={(e) => setSfxText(e.target.value)}
                placeholder="Rain hiss, distant thunder, tire screech"
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-400">Outgoing Transition</label>
              <select
                value={transition}
                onChange={(e) => setTransition(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
              >
                <option value="Cut">Hard Cut</option>
                <option value="Cross Dissolve">Cross Dissolve</option>
                <option value="Match Cut">Match Cut</option>
                <option value="Whip Pan">Whip Pan</option>
                <option value="Glitch Impact">Glitch Impact</option>
                <option value="Fade to Black">Fade to Black</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 text-xs font-medium bg-amber-400 hover:bg-amber-300 text-slate-950 rounded transition-colors flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Specifications</span>
          </button>
        </div>
      </div>
    </div>
  );
};
