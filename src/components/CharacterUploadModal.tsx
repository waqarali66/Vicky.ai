import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  User,
  ShieldCheck,
  Activity,
  Sliders,
  Sparkles,
  Camera,
  Check,
  Maximize2,
  ScanFace,
  Layers,
  Eye,
} from 'lucide-react';
import { CharacterProfile, BodyPostureType } from '../types/producer';
import { PoseFaceVisualizer } from './PoseFaceVisualizer';

interface CharacterUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCharacter: (character: CharacterProfile) => void;
  existingCharacter?: CharacterProfile | null;
}

const PRESET_CHARACTERS = [
  {
    name: 'Kael Vance (Cinematic Real)',
    role: 'Lead Explorer',
    imageUrl: '/src/assets/images/shot_cinematic_real_1790926385863.jpg',
    posture: 'Slow Walking' as BodyPostureType,
    desc: 'Weathered 35yo Nordic explorer in charcoal trench coat, piercing hazel eyes.',
  },
  {
    name: 'Leo Sparks (3D Pixar Style)',
    role: 'Boy Inventor',
    imageUrl: '/src/assets/images/shot_stylized_3d_1790926401701.jpg',
    posture: 'Observant Leaning' as BodyPostureType,
    desc: 'Expressive 12yo boy with brass goggles, leather apron, vibrant green eyes.',
  },
  {
    name: 'Nyx Kestrel (Cyberpunk)',
    role: 'Cyber Courier',
    imageUrl: '/src/assets/images/shot_cyberpunk_neon_1790926417160.jpg',
    posture: 'Dynamic Sprint' as BodyPostureType,
    desc: 'Athletic 26yo runner with cybernetic ocular implant and tactical duster.',
  },
];

export const CharacterUploadModal: React.FC<CharacterUploadModalProps> = ({
  isOpen,
  onClose,
  onSaveCharacter,
  existingCharacter,
}) => {
  const [name, setName] = useState<string>(existingCharacter?.name || '');
  const [role, setRole] = useState<string>(existingCharacter?.role || 'Protagonist');
  const [visualDescription, setVisualDescription] = useState<string>(
    existingCharacter?.visualDescription || ''
  );
  const [wardrobe, setWardrobe] = useState<string>(existingCharacter?.wardrobe || '');
  const [emotionalArc, setEmotionalArc] = useState<string>(
    existingCharacter?.emotionalArc || 'Resolves internal conflict through decisive action.'
  );
  const [voiceProfile, setVoiceProfile] = useState<string>(
    existingCharacter?.voiceProfile || 'Grounded, evocative, natural cadence'
  );

  // Face Preservation States
  const [imageUrl, setImageUrl] = useState<string>(
    existingCharacter?.imageUrl || '/src/assets/images/shot_cinematic_real_1790926385863.jpg'
  );
  const [facePreserveEnabled, setFacePreserveEnabled] = useState<boolean>(
    existingCharacter?.facePreserveEnabled ?? true
  );
  const [facePreserveStrength, setFacePreserveStrength] = useState<number>(
    existingCharacter?.facePreserveStrength ?? 0.92
  );

  // Body Posture States
  const [bodyPosture, setBodyPosture] = useState<BodyPostureType>(
    existingCharacter?.bodyPosture || 'Heroic Standing'
  );
  const [poseWeight, setPoseWeight] = useState<number>(existingCharacter?.poseWeight ?? 0.85);
  const [poseReferenceUrl, setPoseReferenceUrl] = useState<string>(
    existingCharacter?.poseReferenceUrl || ''
  );
  const [previewMode, setPreviewMode] = useState<'photo' | 'hud'>('photo');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const poseInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePoseFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPoseReferenceUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectPreset = (preset: typeof PRESET_CHARACTERS[0]) => {
    setName(preset.name);
    setRole(preset.role);
    setImageUrl(preset.imageUrl);
    setBodyPosture(preset.posture);
    setVisualDescription(preset.desc);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const charSeed = `vicky_char_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    const faceAnchor = facePreserveEnabled
      ? `[face_id_lock: ${name.replace(/\s+/g, '_')}] [ip_adapter: ${facePreserveStrength.toFixed(2)}] [openpose: ${bodyPosture.replace(/\s+/g, '_').toLowerCase()}_${poseWeight.toFixed(2)}]`
      : '';

    const newChar: CharacterProfile = {
      name: name.trim(),
      role: role.trim(),
      visualDescription: visualDescription.trim() || 'Consistent character reference with preserved facial identity.',
      wardrobe: wardrobe.trim() || 'Character-specific tailored wardrobe',
      emotionalArc,
      voiceProfile,
      consistencySeedPrompt: `${charSeed}, ${faceAnchor}`.trim(),
      imageUrl,
      facePreserveEnabled,
      facePreserveStrength,
      bodyPosture,
      poseWeight,
      poseReferenceUrl,
      faceAnchorTags: faceAnchor,
    };

    onSaveCharacter(newChar);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ScanFace className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">
                Character Image Upload & Consistency Engine
              </h3>
              <p className="text-xs text-slate-400">
                Face Preservation (IP-Adapter / LoRA) and Body Posture Guidance (ControlNet OpenPose)
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
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
          {/* Quick Presets */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Quick Reference Presets:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {PRESET_CHARACTERS.map((pre, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => handleSelectPreset(pre)}
                  className="p-2.5 rounded bg-slate-950 border border-slate-800 hover:border-emerald-400/60 text-left transition-colors flex items-center gap-2.5 group"
                >
                  <img
                    src={pre.imageUrl}
                    alt={pre.name}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded object-cover border border-white/10"
                  />
                  <div className="truncate">
                    <span className="text-xs font-medium text-slate-200 block truncate group-hover:text-emerald-400">
                      {pre.name}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono block">
                      {pre.posture}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Two-Column: Image Upload & Face Preserve Controls */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left: Portrait Upload & Face Preview (5 cols) */}
            <div className="md:col-span-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 block">
                  Reference Portrait
                </span>
                <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded border border-slate-800 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setPreviewMode('photo')}
                    className={`px-2 py-0.5 rounded transition-colors ${
                      previewMode === 'photo' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode('hud')}
                    className={`px-2 py-0.5 rounded transition-colors ${
                      previewMode === 'hud' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    HUD Mesh
                  </button>
                </div>
              </div>

              {previewMode === 'hud' && imageUrl ? (
                <PoseFaceVisualizer
                  imageUrl={imageUrl}
                  facePreserveEnabled={facePreserveEnabled}
                  bodyPosture={bodyPosture}
                  strength={facePreserveStrength}
                />
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="group relative h-56 rounded-lg border-2 border-dashed border-slate-700 hover:border-emerald-400/80 bg-slate-950 flex flex-col items-center justify-center p-3 cursor-pointer overflow-hidden transition-colors"
                >
                  {imageUrl ? (
                    <>
                      <img
                        src={imageUrl}
                        alt="Character Reference"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover rounded"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity p-2 text-center">
                        <Camera className="w-5 h-5 mb-1 text-emerald-400" />
                        <span className="text-xs font-medium">Click to Change Image</span>
                        <span className="text-[10px] text-slate-400">PNG, JPG, WebP supported</span>
                      </div>

                      {/* Face Lock HUD overlay */}
                      {facePreserveEnabled && (
                        <div className="absolute top-2 left-2 bg-emerald-950/80 border border-emerald-500/50 backdrop-blur-md px-2 py-0.5 rounded text-[10px] text-emerald-300 font-mono flex items-center gap-1.5 shadow-md">
                          <ScanFace className="w-3 h-3 text-emerald-400" />
                          <span>Face ID Locked ({Math.round(facePreserveStrength * 100)}%)</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center space-y-1.5 text-slate-400">
                      <Upload className="w-8 h-8 text-slate-500 mx-auto" />
                      <span className="text-xs font-medium text-slate-300 block">
                        Upload Character Photo
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        Clear frontal portrait or full body
                      </span>
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
              )}

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Direct File Upload</span>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-emerald-400 hover:underline"
                >
                  Browse Device Photos
                </button>
              </div>
            </div>

            {/* Right: Face Preservation & Body Posture Controls (7 cols) */}
            <div className="md:col-span-7 space-y-4">
              {/* Character Identity */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300 block">Character Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Commander Sarah Vance"
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300 block">Story Role</label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Lead Pilot / Protagonist"
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              {/* SECTION A: Face Preservation Settings */}
              <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ScanFace className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-semibold text-slate-200">
                      Face Preservation (Identity Lock)
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={facePreserveEnabled}
                      onChange={(e) => setFacePreserveEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Locks facial facial landmarks, skin tone, eye geometry, and contours across all video shots using IP-Adapter / FaceID consistency tags.
                </p>

                {facePreserveEnabled && (
                  <div className="space-y-1.5 pt-1 border-t border-slate-800/80">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Preservation Retention:</span>
                      <span className="text-emerald-400 font-mono font-semibold">
                        {(facePreserveStrength * 100).toFixed(0)}% (
                        {facePreserveStrength > 0.9 ? 'Strict Lock' : 'Flexible'}
                        )
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0.5}
                      max={1.0}
                      step={0.01}
                      value={facePreserveStrength}
                      onChange={(e) => setFacePreserveStrength(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                    />
                  </div>
                )}
              </div>

              {/* SECTION B: Body Posture & Pose Reference */}
              <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-sky-400" />
                    <span className="text-xs font-semibold text-slate-200">
                      Body Posture Guidance (OpenPose)
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-sky-400 bg-sky-950/60 px-1.5 py-0.5 rounded border border-sky-800/50">
                    ControlNet Active
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400 block">Target Pose Style</label>
                    <select
                      value={bodyPosture}
                      onChange={(e) => setBodyPosture(e.target.value as BodyPostureType)}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-400"
                    >
                      <option value="Heroic Standing">Heroic Standing (Commanding)</option>
                      <option value="Dynamic Sprint">Dynamic Sprint (Action)</option>
                      <option value="Cinematic Seated">Cinematic Seated (Introspective)</option>
                      <option value="Low Combat Stance">Low Combat Stance (Grounded)</option>
                      <option value="Slow Walking">Slow Walking (Contemplative)</option>
                      <option value="Observant Leaning">Observant Leaning (Relaxed)</option>
                      <option value="Custom Posed">Custom Pose Reference</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400 block">
                      Pose Adherence Weight ({(poseWeight * 100).toFixed(0)}%)
                    </label>
                    <input
                      type="range"
                      min={0.4}
                      max={1.0}
                      step={0.05}
                      value={poseWeight}
                      onChange={(e) => setPoseWeight(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400 mt-2"
                    />
                  </div>
                </div>

                {/* Optional Custom Pose reference upload */}
                {bodyPosture === 'Custom Posed' && (
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Optional Posture Reference Photo:</span>
                    <button
                      type="button"
                      onClick={() => poseInputRef.current?.click()}
                      className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-sky-300 hover:bg-slate-800 text-[11px]"
                    >
                      {poseReferenceUrl ? 'Replace Pose File' : 'Upload Pose Sketch'}
                    </button>
                    <input
                      type="file"
                      ref={poseInputRef}
                      accept="image/*"
                      onChange={handlePoseFileChange}
                      className="hidden"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Wardrobe & Description Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300 block">
                Wardrobe & Costume Details
              </label>
              <input
                type="text"
                value={wardrobe}
                onChange={(e) => setWardrobe(e.target.value)}
                placeholder="e.g. Charcoal waxed canvas trenchcoat, brass buckles, leather boots"
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-400"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300 block">
                Visual Traits & Distinguishing Marks
              </label>
              <input
                type="text"
                value={visualDescription}
                onChange={(e) => setVisualDescription(e.target.value)}
                placeholder="e.g. Piercing hazel eyes, weathered jawline, messy dark hair"
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          {/* Generated Consistency Tag Preview */}
          <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-mono block">
              Auto-Generated Consistency Tags (Injected into Higgsfield & Runway Prompts):
            </span>
            <code className="text-xs font-mono text-emerald-400 block truncate">
              vicky_char_{name ? name.toLowerCase().replace(/[^a-z0-9]/g, '_') : 'name'}
              {facePreserveEnabled ? ` [face_id_lock: ${facePreserveStrength.toFixed(2)}]` : ''}
              {` [openpose: ${bodyPosture.replace(/\s+/g, '_').toLowerCase()}:${poseWeight.toFixed(2)}]`}
            </code>
          </div>

          {/* Footer Action Buttons */}
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
              disabled={!name.trim()}
              className="px-5 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 rounded transition-colors flex items-center gap-1.5 shadow-md shadow-emerald-400/20"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save & Apply Face/Posture Lock</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
