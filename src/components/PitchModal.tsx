import React, { useState, useRef } from 'react';
import {
  X,
  Sparkles,
  Wand2,
  Film,
  Clapperboard,
  ScanFace,
  Activity,
  Upload,
  Camera,
  Check,
} from 'lucide-react';
import { VideoStyle, AspectRatio, BodyPostureType } from '../types/producer';
import { ProduceParams } from '../services/geminiProducer';

interface PitchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (params: ProduceParams) => void;
  isProducing: boolean;
}

const INSPIRATION_IDEAS = [
  {
    title: 'Lone Samurai in Neon Rain',
    style: 'cyberpunk_noir' as VideoStyle,
    aspectRatio: '2.39:1' as AspectRatio,
    idea: 'A cybernetic ronin walks through rain-slicked alleys in Neo-Kyoto under pink neon signs, seeking his lost katana before dawn.',
  },
  {
    title: 'The Whimsical Stargazer',
    style: 'stylized_3d' as VideoStyle,
    aspectRatio: '16:9' as AspectRatio,
    idea: 'A 3D animated young fox scientist in a cozy mossy observatory building a brass telescope that captures shooting star dust.',
  },
  {
    title: 'Alpine Storm Crossing',
    style: 'cinematic_anamorphic' as VideoStyle,
    aspectRatio: '2.39:1' as AspectRatio,
    idea: 'A rugged mountaineer traverses a perilous knife-edge ridge above the clouds at sunset, facing icy winds and transcendent golden peaks.',
  },
  {
    title: 'Urban Coffee Craft',
    style: 'real_hyperrealistic' as VideoStyle,
    aspectRatio: '9:16' as AspectRatio,
    idea: 'Hypnotic macro close-up documentary of a master barista pouring artisan swan latte art, slow motion steam rising in warm morning sunlight.',
  },
];

export const PitchModal: React.FC<PitchModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isProducing,
}) => {
  const [idea, setIdea] = useState<string>('');
  const [style, setStyle] = useState<VideoStyle>('cinematic_anamorphic');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [pacing, setPacing] = useState<string>('cinematic_epic');
  const [characterNotes, setCharacterNotes] = useState<string>('');

  // Character Upload & Face Preserve Controls in Pitch
  const [charImageUrl, setCharImageUrl] = useState<string>('');
  const [charName, setCharName] = useState<string>('');
  const [facePreserve, setFacePreserve] = useState<boolean>(true);
  const [faceStrength, setFaceStrength] = useState<number>(0.92);
  const [bodyPosture, setBodyPosture] = useState<BodyPostureType>('Heroic Standing');
  const [showCharUpload, setShowCharUpload] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCharImageUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea.trim()) return;

    let enrichedCharNotes = characterNotes.trim();
    if (charName || charImageUrl) {
      const charTag = `[Character: ${charName || 'Lead Actor'}] [Face_Preserve: ${
        facePreserve ? `${(faceStrength * 100).toFixed(0)}% strict lock` : 'flexible'
      }] [Body_Posture: ${bodyPosture}]`;
      enrichedCharNotes = enrichedCharNotes ? `${enrichedCharNotes} · ${charTag}` : charTag;
    }

    onSubmit({
      idea: idea.trim(),
      style,
      aspectRatio,
      pacing,
      characterNotes: enrichedCharNotes,
      characterImage: charImageUrl || undefined,
      characterName: charName || undefined,
      facePreserve,
      faceStrength,
      bodyPosture,
    });
  };

  const handleApplyInspiration = (item: typeof INSPIRATION_IDEAS[0]) => {
    setIdea(item.idea);
    setStyle(item.style);
    setAspectRatio(item.aspectRatio);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950/80 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Pitch Idea to vicky.AI</h3>
              <p className="text-xs text-slate-400">
                Autonomous video directing with face preservation, body posture, and multi-tool connectors
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          {/* Quick Inspirations */}
          <div>
            <span className="text-xs font-medium text-slate-400 mb-2 block">Quick Director Presets:</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {INSPIRATION_IDEAS.map((insp, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => handleApplyInspiration(insp)}
                  className="p-2 rounded bg-slate-950/70 border border-slate-800 hover:border-amber-400/60 text-left text-xs transition-colors group"
                >
                  <span className="font-medium text-slate-200 block truncate group-hover:text-amber-400">
                    {insp.title}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono block">
                    {insp.style.replace('_', ' ')}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* User Idea Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">
              What is your video vision or storyline?
            </label>
            <textarea
              required
              rows={3}
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="e.g. A lone drifter walking down a wet coastal highway at dusk, discovering a modern minimalist cliffside villa in the mist..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-lg p-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-400/40"
            />
          </div>

          {/* Style Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                Directorial Visual Style
              </label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value as VideoStyle)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
              >
                <option value="cinematic_anamorphic">Cinematic Anamorphic (Hollywood 35mm)</option>
                <option value="real_hyperrealistic">Real Hyper-Realistic (8K Master)</option>
                <option value="stylized_3d">Stylized 3D Animation (Pixar / Unreal 5)</option>
                <option value="cyberpunk_noir">Cyberpunk Noir (Neon & Rain)</option>
                <option value="retro_vintage">16mm Vintage Film (Kodak Ektachrome)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                Aspect Ratio Format
              </label>
              <select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
              >
                <option value="16:9">16:9 Widescreen (YouTube / TV / Web)</option>
                <option value="2.39:1">2.39:1 Anamorphic Cinema Scope</option>
                <option value="9:16">9:16 Vertical (TikTok / Reels / Shorts)</option>
                <option value="1:1">1:1 Square (Instagram Feed)</option>
              </select>
            </div>
          </div>

          {/* Character Upload Accordion (Face Preserve & Posture) */}
          <div className="border border-slate-800 rounded-lg bg-slate-950/60 overflow-hidden">
            <button
              type="button"
              onClick={() => setShowCharUpload(!showCharUpload)}
              className="w-full px-4 py-3 text-left flex items-center justify-between text-xs font-medium text-slate-200 hover:bg-slate-900/60 transition-colors"
            >
              <div className="flex items-center gap-2">
                <ScanFace className="w-4 h-4 text-emerald-400" />
                <span>Upload Character Reference (Face Preserve & Body Posture)</span>
                {charImageUrl && (
                  <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800">
                    Photo Attached
                  </span>
                )}
              </div>
              <span className="text-slate-400 text-xs">{showCharUpload ? '−' : '+'}</span>
            </button>

            {showCharUpload && (
              <div className="p-4 pt-2 border-t border-slate-800/80 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Photo picker */}
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1">Actor Portrait:</span>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="h-28 rounded border border-dashed border-slate-700 hover:border-emerald-400/80 bg-slate-900 flex items-center justify-center cursor-pointer overflow-hidden p-2 text-center"
                    >
                      {charImageUrl ? (
                        <img
                          src={charImageUrl}
                          alt="Character preview"
                          className="h-full w-full object-cover rounded"
                        />
                      ) : (
                        <div className="space-y-1 text-slate-400 text-xs">
                          <Upload className="w-5 h-5 mx-auto text-emerald-400" />
                          <span>Click to Upload Face Photo</span>
                        </div>
                      )}
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {/* Character Name & Posture */}
                  <div className="space-y-2 text-xs">
                    <div>
                      <label className="text-slate-300 block mb-0.5">Character Name</label>
                      <input
                        type="text"
                        value={charName}
                        onChange={(e) => setCharName(e.target.value)}
                        placeholder="e.g. Leo Sparks / Kael Vance"
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-400"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 block mb-0.5">Body Posture Preset</label>
                      <select
                        value={bodyPosture}
                        onChange={(e) => setBodyPosture(e.target.value as BodyPostureType)}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-400"
                      >
                        <option value="Heroic Standing">Heroic Standing (Commanding)</option>
                        <option value="Dynamic Sprint">Dynamic Sprint (Kinetic)</option>
                        <option value="Cinematic Seated">Cinematic Seated (Introspective)</option>
                        <option value="Low Combat Stance">Low Combat Stance (Grounded)</option>
                        <option value="Slow Walking">Slow Walking (Contemplative)</option>
                        <option value="Observant Leaning">Observant Leaning</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Face Preserve Switch */}
                <div className="flex items-center justify-between p-2.5 rounded bg-slate-900/80 border border-slate-800 text-xs">
                  <div className="flex items-center gap-2">
                    <ScanFace className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-slate-200">Face Preservation Lock:</span>
                    <span className="text-emerald-400 font-mono">
                      {(faceStrength * 100).toFixed(0)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.6}
                    max={1.0}
                    step={0.05}
                    value={faceStrength}
                    onChange={(e) => setFaceStrength(parseFloat(e.target.value))}
                    className="w-28 h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-emerald-400"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Optional Character or Directorial Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400 block">
              Directorial & Voiceover Preferences (Optional)
            </label>
            <input
              type="text"
              value={characterNotes}
              onChange={(e) => setCharacterNotes(e.target.value)}
              placeholder="e.g. Deep baritone voiceover, melancholic but uplifting resolution"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProducing || !idea.trim()}
              className="px-5 py-2 text-xs font-medium text-slate-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-amber-400/20"
            >
              {isProducing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>vicky.AI is Producing...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Vicky, Produce Video</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
