import React, { useState } from 'react';
import { Sparkles, Wand2, Film, Crown, CreditCard, Receipt, Clock } from 'lucide-react';
import { ProductionProject, VideoStyle, AspectRatio } from '../types/producer';
import { ProduceParams } from '../services/geminiProducer';
import { UserProfile, OWNER_EMAIL, EASYPAISA_ACCOUNT } from '../types/auth';

interface ExecutiveHeroProps {
  project: ProductionProject;
  currentUser: UserProfile;
  onProduce: (params: ProduceParams) => void;
  onOpenSubscription: () => void;
  onOpenTransactionModal: () => void;
  isProducing: boolean;
}

export const ExecutiveHero: React.FC<ExecutiveHeroProps> = ({
  project,
  currentUser,
  onProduce,
  onOpenSubscription,
  onOpenTransactionModal,
  isProducing,
}) => {
  const [quickIdea, setQuickIdea] = useState('');
  const [quickStyle, setQuickStyle] = useState<VideoStyle>(project.style);
  const [quickRatio, setQuickRatio] = useState<AspectRatio>(project.aspectRatio);
  const [isEnhancingPitch, setIsEnhancingPitch] = useState(false);

  const isOwner = currentUser.isOwner || currentUser.email.toLowerCase() === OWNER_EMAIL.toLowerCase();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickIdea.trim()) return;
    onProduce({
      idea: quickIdea.trim(),
      style: quickStyle,
      aspectRatio: quickRatio,
      pacing: 'cinematic_epic',
    });
    setQuickIdea('');
  };

  const handleAiEnhancePitch = async () => {
    if (!quickIdea.trim()) return;
    setIsEnhancingPitch(true);
    try {
      const res = await fetch('/api/vicky/enhance-pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea: quickIdea.trim(), style: quickStyle }),
      });
      const data = await res.json();
      if (data.success && data.enhancedIdea) {
        setQuickIdea(data.enhancedIdea);
      }
    } catch (err) {
      // Keep original idea on error
    } finally {
      setIsEnhancingPitch(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-5">
      {/* Dedicated Pre-Login & Payment Proof Action Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-emerald-400 font-semibold font-mono">
            Easypaisa Account: {EASYPAISA_ACCOUNT}
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-300">
            Single Video Pass: <strong>$3 USD / Rs. 850 PKR</strong> (3 min)
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-300">
            Monthly Pro: <strong>$250 USD / Rs. 70,000 PKR</strong> (210 min)
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onOpenTransactionModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold transition-colors shadow-sm"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Upload Payment Proof (PKR / USD)</span>
          </button>

          <button
            type="button"
            onClick={onOpenSubscription}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium transition-colors"
          >
            <CreditCard className="w-3.5 h-3.5 text-amber-400" />
            <span>View Plans & Pricing</span>
          </button>
        </div>
      </div>

      {/* Top Tag & Project Identity */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5 text-xs">
            <span className="font-semibold text-amber-400 font-mono tracking-wider uppercase">
              Autonomous AI Video Producer
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400 font-mono">Real-Time Director Engine</span>
            <span className="text-slate-600">·</span>
            {isOwner ? (
              <span className="text-amber-300 font-semibold flex items-center gap-1">
                <Crown className="w-3.5 h-3.5 fill-current text-amber-400" />
                Lifetime Free Owner Access ({OWNER_EMAIL})
              </span>
            ) : currentUser.verificationStatus === 'pending' ? (
              <button
                type="button"
                onClick={onOpenTransactionModal}
                className="text-amber-300 font-semibold hover:underline flex items-center gap-1"
              >
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Payment Proof Pending Admin Approval (TID: {currentUser.lastTransactionId})
              </button>
            ) : currentUser.plan === 'monthly_creator' ? (
              <span className="text-emerald-400 font-mono">
                Pro Plan ({currentUser.minutesUsed.toFixed(0)}/210 min used)
              </span>
            ) : currentUser.plan === 'single_pass' ? (
              <span className="text-sky-400 font-mono">
                1 Video Pass (Max 3 min)
              </span>
            ) : (
              <button
                type="button"
                onClick={onOpenTransactionModal}
                className="text-emerald-400 font-semibold hover:underline flex items-center gap-1"
              >
                <Receipt className="w-3.5 h-3.5" />
                Submit Payment Proof Before Login
              </button>
            )}
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white font-serif">
            {project.title}
          </h2>
          <p className="text-sm text-slate-300 max-w-3xl mt-1 leading-relaxed">
            {project.logline}
          </p>
        </div>

        {/* Clean Unboxed Project Metadata */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 font-mono">
          <span className="text-slate-200 flex items-center gap-1.5">
            <Film className="w-3.5 h-3.5 text-amber-400" />
            {project.style.replace('_', ' ').toUpperCase()}
          </span>
          <span aria-hidden="true">·</span>
          <span>{project.aspectRatio}</span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">{project.targetDurationSec}s Reel</span>
        </div>
      </div>

      {/* Autonomous Idea Pitch Bar */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative flex flex-col lg:flex-row items-stretch gap-2 bg-slate-950 p-2 rounded-lg border border-slate-800 focus-within:border-amber-400/80 transition-colors">
          <div className="flex-1 flex items-center px-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mr-2.5" />
            <input
              type="text"
              value={quickIdea}
              onChange={(e) => setQuickIdea(e.target.value)}
              placeholder="Tell Vicky your idea (e.g. 'A lone astronaut finding an emerald oasis on Mars at dusk')..."
              className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-800">
            {/* AI Enhance Pitch Button */}
            <button
              type="button"
              onClick={handleAiEnhancePitch}
              disabled={isEnhancingPitch || !quickIdea.trim()}
              className="px-2.5 py-2 text-xs font-medium text-amber-300 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-slate-700 rounded transition-colors flex items-center gap-1.5 whitespace-nowrap"
              title="Use Gemini AI to enrich your raw concept into a director's pitch"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{isEnhancingPitch ? 'Polishing...' : 'AI Enhance Pitch'}</span>
            </button>

            {/* Style Selector */}
            <select
              value={quickStyle}
              onChange={(e) => setQuickStyle(e.target.value as VideoStyle)}
              aria-label="Video style"
              className="bg-slate-900 text-xs text-slate-300 border border-slate-700/80 rounded px-2.5 py-2 focus:outline-none focus:border-amber-400"
            >
              <option value="cinematic_anamorphic">Cinematic Anamorphic</option>
              <option value="real_hyperrealistic">Real Hyper-Realistic</option>
              <option value="stylized_3d">Stylized 3D Animation</option>
              <option value="cyberpunk_noir">Cyberpunk Noir</option>
              <option value="retro_vintage">16mm Vintage Kodak</option>
            </select>

            {/* Ratio */}
            <select
              value={quickRatio}
              onChange={(e) => setQuickRatio(e.target.value as AspectRatio)}
              aria-label="Aspect ratio"
              className="bg-slate-900 text-xs text-slate-300 border border-slate-700/80 rounded px-2.5 py-2 focus:outline-none focus:border-amber-400"
            >
              <option value="16:9">16:9 Widescreen</option>
              <option value="2.39:1">2.39:1 Cinema</option>
              <option value="9:16">9:16 Reels/TikTok</option>
            </select>

            <button
              type="submit"
              disabled={isProducing || !quickIdea.trim()}
              className="px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-40 rounded transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-sm"
            >
              {isProducing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Vicky Directing...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Vicky, Produce</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Style Inspirations */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
          <span className="text-slate-500">Preset Director Moods:</span>
          <button
            type="button"
            onClick={() => {
              setQuickIdea('A 3D animated Pixar style story of a little steampunk robot exploring a grandfather clock tower');
              setQuickStyle('stylized_3d');
              setQuickRatio('16:9');
            }}
            className="hover:text-amber-400 transition-colors"
          >
            3D Steampunk Robot ·
          </button>
          <button
            type="button"
            onClick={() => {
              setQuickIdea('A neon-lit cyberpunk courier sprinting across rain-slicked skybridge under hologram billboards');
              setQuickStyle('cyberpunk_noir');
              setQuickRatio('16:9');
            }}
            className="hover:text-amber-400 transition-colors"
          >
            Cyberpunk Megacity ·
          </button>
          <button
            type="button"
            onClick={() => {
              setQuickIdea('Cinematic anamorphic 35mm road movie of a traveler along foggy Nordic fjords at golden hour');
              setQuickStyle('cinematic_anamorphic');
              setQuickRatio('2.39:1');
            }}
            className="hover:text-amber-400 transition-colors"
          >
            Nordic Fjord Highway
          </button>
        </div>
      </form>
    </div>
  );
};
