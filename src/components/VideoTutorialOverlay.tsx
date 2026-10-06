import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Sparkles,
  Film,
  Layers,
  Share2,
  CheckCircle2,
  HelpCircle,
  RotateCcw,
} from 'lucide-react';
import { audioDirector } from '../services/audioSynthesizer';

export const TUTORIAL_AUTOPLAY_STORAGE_KEY = 'vicky_ai_tutorial_autoplay';
export const TUTORIAL_SEEN_STORAGE_KEY = 'vicky_ai_tutorial_seen';

interface TutorialStep {
  id: number;
  title: string;
  subtitle: string;
  durationSec: number;
  narration: string;
  keyTakeaways: string[];
  editorBridgeNote: string;
  accentColor: string;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 1,
    title: '1. Pitch Your Concept to vicky.AI',
    subtitle: 'Autonomous Pre-Production & Creative Direction',
    durationSec: 8,
    narration:
      'Step 1: Type or speak a simple idea into the Pitch Bar. vicky.AI autonomously generates your script, color harmony, character bible, and sound design.',
    keyTakeaways: [
      'Enter a 1-sentence idea or click "AI Enhance Pitch" to enrich your concept',
      'vicky.AI autonomously selects camera lenses, lighting, and BPM score',
      'Upload reference photos to lock character face identity and body posture',
    ],
    editorBridgeNote:
      'Idea-to-Timeline Bridge: Converts unstructured creative thoughts into timecoded shot lists ready for NLE import.',
    accentColor: '#F59E0B',
  },
  {
    id: 2,
    title: '2. Direct & Preview in the Live Video Monitor',
    subtitle: '30 FPS Real-Time Stream & Video Blob Compilation',
    durationSec: 8,
    narration:
      'Step 2: Preview your film in the real-time Director Monitor. Scrub through shots, toggle LUT color grades, and click Compile Video Blob to encode a playable WebM video.',
    keyTakeaways: [
      'Real-time 30 FPS canvas stream simulates camera push-ins, drone arcs, and LUTs',
      'Click any shot on the multi-track timeline to refine dialogue or camera motion',
      'Click "Compile Video Blob" or "Render Video" for an instant playable video file',
    ],
    editorBridgeNote:
      'Live Monitor Bridge: Pre-visualizes exact camera movement and framing before committing to final NLE cuts.',
    accentColor: '#38BDF8',
  },
  {
    id: 3,
    title: '3. Bridge Directly to Your Video Editor',
    subtitle: 'CapCut EDL, Canva Graphics, DaVinci CDL & Higgsfield',
    durationSec: 8,
    narration:
      'Step 3: Open the Connectors Hub to bridge your project directly into CapCut, Canva, DaVinci Resolve, Higgsfield, and ElevenLabs with one click.',
    keyTakeaways: [
      'CapCut Bridge: Download CMX3600 (.edl) timelines and beat-synced JSON drafts',
      'Canva Bridge: Auto-generate lower-third title overlays and brand hex kits',
      'DaVinci Resolve & Higgsfield: Export ASC CDL (.cdl) color XML and motion prompts',
    ],
    editorBridgeNote:
      'Zero-Friction NLE Hand-off: Import the generated .EDL and .CDL files straight into CapCut Pro or DaVinci Resolve.',
    accentColor: '#10B981',
  },
  {
    id: 4,
    title: '4. AI Studio Lab & Easypaisa Plan Activation',
    subtitle: 'Veo 3, Lyria Music & Instant Payment Proof Verification',
    durationSec: 8,
    narration:
      'Step 4: Use the AI Studio Lab for Veo 3 video generation, Lyria music, and location scouting. Upload your Easypaisa receipt in PKR or USD to unlock production.',
    keyTakeaways: [
      'Generate videos with Veo 3 (16:9 / 9:16) and soundtracks with Lyria AI',
      'Upload Easypaisa (03066053314) receipts via the "Payment Proof" button',
      'Track live verification progress and click "Refresh Status" for activation',
    ],
    editorBridgeNote:
      'Full Production Package: Click "Export" in the top bar to download all scripts, EDLs, and rendered video blobs.',
    accentColor: '#A855F7',
  },
];

interface VideoTutorialOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToSection?: (section: string) => void;
}

export const VideoTutorialOverlay: React.FC<VideoTutorialOverlayProps> = ({
  isOpen,
  onClose,
  onNavigateToSection,
}) => {
  const [autoPlayFirstVisit, setAutoPlayFirstVisit] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(TUTORIAL_AUTOPLAY_STORAGE_KEY);
      return saved === null ? true : saved === 'true';
    } catch {
      return true;
    }
  });

  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [stepElapsed, setStepElapsed] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  const currentStep = TUTORIAL_STEPS[activeStepIndex] || TUTORIAL_STEPS[0];

  // Auto-start playback when modal opens if autoPlayFirstVisit is enabled
  useEffect(() => {
    if (isOpen) {
      setIsPlaying(autoPlayFirstVisit);
      setStepElapsed(0);
      try {
        localStorage.setItem(TUTORIAL_SEEN_STORAGE_KEY, 'true');
      } catch {}
    } else {
      audioDirector.stopAll();
    }
  }, [isOpen, autoPlayFirstVisit]);

  // Trigger voiceover narration when step changes while playing
  useEffect(() => {
    if (!isOpen || !isPlaying || isMuted) return;
    audioDirector.speakVoiceover(currentStep.narration);
  }, [activeStepIndex, isOpen, isPlaying, isMuted]);

  const handleToggleAutoPlay = () => {
    const nextVal = !autoPlayFirstVisit;
    setAutoPlayFirstVisit(nextVal);
    try {
      localStorage.setItem(TUTORIAL_AUTOPLAY_STORAGE_KEY, String(nextVal));
    } catch {}
  };

  // Playback timer & step progression
  useEffect(() => {
    if (!isOpen || !isPlaying) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    lastTimeRef.current = performance.now();

    const tick = (now: number) => {
      const dt = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      setStepElapsed((prev) => {
        const next = prev + dt;
        if (next >= currentStep.durationSec) {
          if (activeStepIndex < TUTORIAL_STEPS.length - 1) {
            setActiveStepIndex((idx) => idx + 1);
            return 0;
          } else {
            setIsPlaying(false);
            audioDirector.stopAll();
            return currentStep.durationSec;
          }
        }
        return next;
      });

      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isOpen, isPlaying, activeStepIndex, currentStep.durationSec]);

  // Render animated tutorial video canvas
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const progress = Math.min(1, stepElapsed / currentStep.durationSec);

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#090D16');
    grad.addColorStop(0.6, '#111827');
    grad.addColorStop(1, '#1E293B');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Animated Grid Lines
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.08)';
    ctx.lineWidth = 1;
    const offset = (stepElapsed * 24) % 40;
    for (let x = -offset; x < w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Animated Workflow Diagram Nodes (Idea -> vicky.AI Director -> NLE Video Editor)
    const nodes = [
      { label: '1. Raw Idea Pitch', sub: 'Text / Mic Voice', x: 150, y: h / 2 - 20 },
      { label: '2. vicky.AI Director', sub: 'Shots · LUT · Score', x: w / 2, y: h / 2 - 20 },
      { label: '3. Video Editor Bridge', sub: 'CapCut · DaVinci · WebM', x: w - 150, y: h / 2 - 20 },
    ];

    // Draw connecting pipelines
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.beginPath();
    ctx.moveTo(nodes[0].x + 70, nodes[0].y);
    ctx.lineTo(nodes[1].x - 80, nodes[1].y);
    ctx.moveTo(nodes[1].x + 80, nodes[1].y);
    ctx.lineTo(nodes[2].x - 80, nodes[2].y);
    ctx.stroke();

    // Animated signal pulse along the pipeline
    const pulseX = 150 + ((w - 300) * ((stepElapsed * 0.45) % 1));
    ctx.fillStyle = currentStep.accentColor;
    ctx.beginPath();
    ctx.arc(pulseX, h / 2 - 20, 6, 0, Math.PI * 2);
    ctx.fill();

    // Draw Node Cards
    nodes.forEach((nd, i) => {
      const isHighlighted =
        (activeStepIndex === 0 && i === 0) ||
        (activeStepIndex === 1 && i === 1) ||
        (activeStepIndex >= 2 && i === 2);

      ctx.fillStyle = isHighlighted ? 'rgba(15, 23, 42, 0.95)' : 'rgba(15, 23, 42, 0.75)';
      ctx.strokeStyle = isHighlighted ? currentStep.accentColor : 'rgba(148, 163, 184, 0.25)';
      ctx.lineWidth = isHighlighted ? 2.5 : 1;

      const boxW = 175;
      const boxH = 74;
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(nd.x - boxW / 2, nd.y - boxH / 2, boxW, boxH, 10);
      } else {
        ctx.rect(nd.x - boxW / 2, nd.y - boxH / 2, boxW, boxH);
      }
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = isHighlighted ? '#FFFFFF' : '#CBD5E1';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(nd.label, nd.x, nd.y - 6);

      ctx.fillStyle = isHighlighted ? currentStep.accentColor : '#64748B';
      ctx.font = '11px monospace';
      ctx.fillText(nd.sub, nd.x, nd.y + 16);
    });

    // Top Chapter Banner inside Video Frame
    ctx.fillStyle = 'rgba(9, 13, 22, 0.85)';
    ctx.fillRect(24, 20, w - 48, 52);
    ctx.fillStyle = currentStep.accentColor;
    ctx.fillRect(24, 20, 5, 52);

    ctx.textAlign = 'left';
    ctx.fillStyle = currentStep.accentColor;
    ctx.font = 'bold 11px monospace';
    ctx.fillText(
      `CHAPTER 0${currentStep.id} OF 0${TUTORIAL_STEPS.length} · ${currentStep.subtitle.toUpperCase()}`,
      42,
      40
    );
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(currentStep.title, 42, 61);

    // Bottom Narration Caption Box inside Video Frame
    ctx.fillStyle = 'rgba(0, 0, 0, 0.82)';
    ctx.fillRect(36, h - 68, w - 72, 46);
    ctx.fillStyle = '#F8FAFC';
    ctx.font = '13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(currentStep.narration, w / 2, h - 41, w - 96);

    // Chapter progress bar at very bottom of video canvas
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillRect(0, h - 5, w, 5);
    ctx.fillStyle = currentStep.accentColor;
    ctx.fillRect(0, h - 5, w * progress, 5);
  }, [isOpen, stepElapsed, activeStepIndex, currentStep]);

  if (!isOpen) return null;

  const overallProgress =
    ((activeStepIndex + Math.min(1, stepElapsed / currentStep.durationSec)) /
      TUTORIAL_STEPS.length) *
    100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header with Auto-Play Toggle for First-Time Visitors */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">
                vicky.AI Video Tutorial — Idea-to-Editor Production Guide
              </h3>
              <p className="text-xs text-slate-400">
                Learn how vicky.AI directs your concept and bridges timelines to CapCut, Canva & DaVinci Resolve
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Auto-Play Toggle for First-Time Visitors */}
            <label
              htmlFor="tutorial-autoplay-toggle"
              className="flex items-center gap-2 cursor-pointer select-none bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800"
              title="Automatically play this tutorial overlay for first-time visitors"
            >
              <input
                id="tutorial-autoplay-toggle"
                type="checkbox"
                checked={autoPlayFirstVisit}
                onChange={handleToggleAutoPlay}
                className="sr-only peer"
              />
              <div className="w-8 h-4 bg-slate-700 rounded-full peer peer-checked:bg-amber-400 relative transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-slate-950 after:w-3 after:h-3 after:rounded-full after:transition-all peer-checked:after:translate-x-4" />
              <span className="text-xs font-medium text-slate-200">
                Auto-Play for First-Time Visitors
              </span>
            </label>

            <button
              type="button"
              onClick={() => {
                audioDirector.stopAll();
                onClose();
              }}
              aria-label="Close tutorial overlay"
              className="p-1.5 rounded text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Interactive Tutorial Video Player Canvas */}
          <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-black">
            <canvas
              ref={canvasRef}
              width={860}
              height={320}
              className="w-full h-auto block"
            />

            {/* Video Transport Controls Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-slate-950 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (activeStepIndex > 0) {
                      setActiveStepIndex(activeStepIndex - 1);
                      setStepElapsed(0);
                    }
                  }}
                  disabled={activeStepIndex === 0}
                  className="p-1.5 rounded text-slate-400 hover:text-white disabled:opacity-40"
                  title="Previous Chapter"
                >
                  <SkipBack className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-8 h-8 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center justify-center transition-colors"
                  title={isPlaying ? 'Pause Tutorial' : 'Play Tutorial'}
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 fill-current translate-x-0.5" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (activeStepIndex < TUTORIAL_STEPS.length - 1) {
                      setActiveStepIndex(activeStepIndex + 1);
                      setStepElapsed(0);
                    }
                  }}
                  disabled={activeStepIndex === TUTORIAL_STEPS.length - 1}
                  className="p-1.5 rounded text-slate-400 hover:text-white disabled:opacity-40"
                  title="Next Chapter"
                >
                  <SkipForward className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveStepIndex(0);
                    setStepElapsed(0);
                    setIsPlaying(true);
                  }}
                  className="p-1.5 rounded text-slate-400 hover:text-white"
                  title="Restart Tutorial"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const nextMute = !isMuted;
                    setIsMuted(nextMute);
                    if (nextMute) audioDirector.stopAll();
                  }}
                  className="p-1.5 rounded text-amber-400 hover:text-amber-300"
                  title={isMuted ? 'Unmute Voiceover' : 'Mute Voiceover'}
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                <span>
                  Chapter {activeStepIndex + 1} / {TUTORIAL_STEPS.length}
                </span>
                <span>·</span>
                <span className="text-amber-400">
                  {Math.round(overallProgress)}% Complete
                </span>
              </div>
            </div>
          </div>

          {/* 4 Chapter Selector Tabs */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
            {TUTORIAL_STEPS.map((step, idx) => {
              const isCurrent = idx === activeStepIndex;
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => {
                    setActiveStepIndex(idx);
                    setStepElapsed(0);
                  }}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    isCurrent
                      ? 'bg-slate-950 border-amber-400 text-white'
                      : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="text-[11px] font-mono text-amber-400 mb-1">
                    STEP 0{step.id}
                  </div>
                  <div className="text-xs font-semibold line-clamp-1">{step.title}</div>
                </button>
              );
            })}
          </div>

          {/* Active Chapter Breakdown & Video Editor Bridge Details */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-slate-950 border border-slate-800 rounded-lg p-5">
            <div className="md:col-span-7 space-y-2.5">
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>{currentStep.title}</span>
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                {currentStep.keyTakeaways.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="md:col-span-5 bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col justify-between space-y-3">
              <div className="space-y-1.5">
                <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider block">
                  How It Bridges to Your Video Editor
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {currentStep.editorBridgeNote}
                </p>
              </div>

              {onNavigateToSection && (
                <button
                  type="button"
                  onClick={() => {
                    audioDirector.stopAll();
                    onNavigateToSection('connectors');
                    onClose();
                  }}
                  className="w-full py-2 px-3 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Open Connectors Hub (CapCut / DaVinci)</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-950 border-t border-slate-800">
          <span className="text-xs text-slate-400">
            Tip: Re-open this guide anytime via the <strong>Tutorial</strong> button in the Top Bar.
          </span>

          <button
            type="button"
            onClick={() => {
              audioDirector.stopAll();
              onClose();
            }}
            className="px-5 py-2 rounded bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-semibold transition-colors"
          >
            Start Directing with vicky.AI
          </button>
        </div>
      </div>
    </div>
  );
};
