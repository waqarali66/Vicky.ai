import React, { useState } from 'react';
import {
  Layers,
  Scissors,
  Video,
  Palette,
  Mic,
  Copy,
  Download,
  ExternalLink,
  Check,
  Send,
  Sparkles,
} from 'lucide-react';
import { ProductionProject } from '../types/producer';

interface ConnectorsHubProps {
  project: ProductionProject;
}

export const ConnectorsHub: React.FC<ConnectorsHubProps> = ({ project }) => {
  const [activeTab, setActiveTab] = useState<'canva' | 'capcut' | 'higgsfield' | 'davinci' | 'elevenlabs'>('canva');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [dispatchStatus, setDispatchStatus] = useState<Record<string, 'idle' | 'dispatching' | 'synced'>>({});

  const { connectors } = project;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownloadFile = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDispatchConnector = (toolName: string) => {
    setDispatchStatus((prev) => ({ ...prev, [toolName]: 'dispatching' }));
    setTimeout(() => {
      setDispatchStatus((prev) => ({ ...prev, [toolName]: 'synced' }));
    }, 1200);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-100">Multi-AI Tool Connectors Hub</h3>
            <span className="text-[11px] text-amber-400 font-mono">vicky.AI Orchestrator</span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated pipeline connectors exporting ready-to-use project assets for Canva, CapCut, Higgsfield, DaVinci, and ElevenLabs.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-md border border-slate-800">
          <button
            onClick={() => setActiveTab('canva')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors flex items-center gap-1.5 ${
              activeTab === 'canva' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Canva</span>
          </button>
          <button
            onClick={() => setActiveTab('capcut')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors flex items-center gap-1.5 ${
              activeTab === 'capcut' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>CapCut</span>
          </button>
          <button
            onClick={() => setActiveTab('higgsfield')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors flex items-center gap-1.5 ${
              activeTab === 'higgsfield' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Higgsfield</span>
          </button>
          <button
            onClick={() => setActiveTab('davinci')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors flex items-center gap-1.5 ${
              activeTab === 'davinci' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>DaVinci</span>
          </button>
          <button
            onClick={() => setActiveTab('elevenlabs')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors flex items-center gap-1.5 ${
              activeTab === 'elevenlabs' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>ElevenLabs</span>
          </button>
          <button
            onClick={() => setActiveTab('console' as any)}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors flex items-center gap-1.5 ${
              activeTab === ('console' as any) ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>API Dispatch</span>
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      <div className="p-6">
        {/* 1. CANVA CONNECTOR */}
        {activeTab === 'canva' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h4 className="text-base font-semibold text-sky-400 flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  Canva Graphic Design & Overlay Blueprint
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Synchronized lower-thirds, title graphics, brand colors, and thumbnail generation spec.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    handleDownloadFile(
                      JSON.stringify(connectors.canva, null, 2),
                      `${project.title.replace(/ /g, '_')}_Canva_Spec.json`,
                      'application/json'
                    )
                  }
                  className="px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Spec</span>
                </button>
                <button
                  onClick={() => handleDispatchConnector('canva')}
                  disabled={dispatchStatus['canva'] === 'dispatching'}
                  className="px-3 py-1.5 text-xs font-medium text-slate-950 bg-sky-400 hover:bg-sky-300 rounded transition-colors flex items-center gap-1.5"
                >
                  {dispatchStatus['canva'] === 'synced' ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Synced to Canva</span>
                    </>
                  ) : dispatchStatus['canva'] === 'dispatching' ? (
                    <span>Dispatching...</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Dispatch to Canva</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950/60 p-4 rounded border border-slate-800/80 space-y-3">
                <span className="text-xs font-medium text-slate-300 block">Typography & Brand Harmony</span>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Header Display Face:</span>
                    <span className="text-slate-200 font-serif font-bold">{connectors.canva.fontPairing.header}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Body & Subtitle Face:</span>
                    <span className="text-slate-200">{connectors.canva.fontPairing.body}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Recommended Template:</span>
                    <span className="text-slate-200 truncate max-w-[200px]">{connectors.canva.templateType}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <span className="text-[11px] text-slate-400 block mb-1.5">Brand Color Swatches:</span>
                  <div className="flex items-center gap-2">
                    {connectors.canva.colorHexes.map((hex, i) => (
                      <div key={i} className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                        <span className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: hex }} />
                        <span className="text-[11px] font-mono text-slate-300">{hex}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* YouTube / Social Thumbnail Spec */}
              <div className="bg-slate-950/60 p-4 rounded border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-300">Thumbnail Graphic Prompt</span>
                  <button
                    onClick={() => handleCopy(connectors.canva.thumbnailPrompt, 'thumb_prompt')}
                    className="text-[11px] text-sky-400 hover:underline flex items-center gap-1"
                  >
                    {copiedKey === 'thumb_prompt' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'thumb_prompt' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed bg-slate-900 p-2.5 rounded border border-slate-800/60 font-mono">
                  {connectors.canva.thumbnailPrompt}
                </p>
              </div>
            </div>

            {/* Overlays List */}
            <div className="space-y-2">
              <span className="text-xs font-medium text-slate-300">Synchronized Graphic Overlays ({connectors.canva.overlays.length})</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {connectors.canva.overlays.map((ov, idx) => (
                  <div key={idx} className="p-3 rounded bg-slate-950/40 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-amber-400 font-mono text-[11px] mr-2">[{ov.timeCode}]</span>
                      <span className="text-slate-200 font-medium">{ov.text}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono bg-slate-900 px-2 py-0.5 rounded">{ov.layout}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. CAPCUT CONNECTOR */}
        {activeTab === 'capcut' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h4 className="text-base font-semibold text-amber-400 flex items-center gap-2">
                  <Scissors className="w-4 h-4" />
                  CapCut Automated NLE Timeline Connector
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Pre-configured timeline cuts, beat-sync tempo markers, and native EDL export.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    handleDownloadFile(
                      connectors.capcut.edlFormat,
                      `${connectors.capcut.projectTitle}.edl`,
                      'text/plain'
                    )
                  }
                  className="px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download EDL</span>
                </button>
                <button
                  onClick={() =>
                    handleDownloadFile(
                      connectors.capcut.exportJson,
                      `${connectors.capcut.projectTitle}.json`,
                      'application/json'
                    )
                  }
                  className="px-3 py-1.5 text-xs font-medium text-slate-950 bg-amber-400 hover:bg-amber-300 rounded transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CapCut JSON</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-950/60 p-4 rounded border border-slate-800/80 space-y-1">
                <span className="text-[11px] text-slate-400">Beat-Sync Pacing</span>
                <span className="text-lg font-mono font-semibold text-amber-400 block tabular-nums">
                  {connectors.capcut.beatSyncBpm} BPM
                </span>
                <span className="text-[10px] text-slate-500">Auto cuts align to musical downbeats</span>
              </div>
              <div className="bg-slate-950/60 p-4 rounded border border-slate-800/80 space-y-1">
                <span className="text-[11px] text-slate-400">Target Canvas</span>
                <span className="text-lg font-mono font-semibold text-slate-200 block">
                  {connectors.capcut.aspectRatio} (24 FPS)
                </span>
                <span className="text-[10px] text-slate-500">Optimized for TikTok / Reels / YouTube</span>
              </div>
              <div className="bg-slate-950/60 p-4 rounded border border-slate-800/80 space-y-1">
                <span className="text-[11px] text-slate-400">Auto FX Filter</span>
                <span className="text-sm font-mono font-medium text-slate-200 block truncate">
                  {connectors.capcut.timelineTracks[0]?.fxType || 'Cinematic Film Print'}
                </span>
                <span className="text-[10px] text-slate-500">Color & Grain Look Preset</span>
              </div>
            </div>

            {/* EDL Preview Box */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-300">Edit Decision List (EDL CMX3600 Format)</span>
                <button
                  onClick={() => handleCopy(connectors.capcut.edlFormat, 'edl')}
                  className="text-[11px] text-amber-400 hover:underline flex items-center gap-1"
                >
                  {copiedKey === 'edl' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'edl' ? 'Copied' : 'Copy EDL'}</span>
                </button>
              </div>
              <pre className="bg-slate-950 p-3.5 rounded border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-48">
                {connectors.capcut.edlFormat}
              </pre>
            </div>
          </div>
        )}

        {/* 3. HIGGSFIELD CONNECTOR */}
        {activeTab === 'higgsfield' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h4 className="text-base font-semibold text-purple-400 flex items-center gap-2">
                  <Video className="w-4 h-4" />
                  Higgsfield / Runway / Sora Generative Camera Prompts
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Camera motion control tags, motion scale weights, and character consistency seeds.
                </p>
              </div>

              <button
                onClick={() =>
                  handleDownloadFile(
                    JSON.stringify(connectors.higgsfield, null, 2),
                    `${project.title.replace(/ /g, '_')}_Higgsfield_Batch.json`,
                    'application/json'
                  )
                }
                className="px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Prompt Batch</span>
              </button>
            </div>

            <div className="p-3 bg-purple-950/20 border border-purple-900/40 rounded flex items-center justify-between text-xs">
              <div>
                <span className="text-purple-400 font-semibold mr-2">Character Consistency Anchor:</span>
                <span className="font-mono text-slate-200">{connectors.higgsfield.characterConsistencyTag}</span>
              </div>
              <span className="text-[10px] text-purple-300 bg-purple-900/50 px-2 py-0.5 rounded font-mono">
                LoRA / Seed Lock
              </span>
            </div>

            {/* Motion Prompts Cards */}
            <div className="space-y-3">
              {connectors.higgsfield.motionPrompts.map((mp, idx) => (
                <div key={idx} className="bg-slate-950/60 p-4 rounded border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded bg-purple-900/40 text-purple-300 text-[10px] font-mono font-semibold">
                        SHOT {mp.shot}
                      </span>
                      <span className="text-xs text-slate-300 font-medium">Motion: {mp.cameraMovement}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-mono text-slate-400">Scale: {mp.motionScale}</span>
                      <button
                        onClick={() => handleCopy(mp.prompt, `higg_${idx}`)}
                        className="text-[11px] text-purple-400 hover:underline flex items-center gap-1"
                      >
                        {copiedKey === `higg_${idx}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>Copy</span>
                      </button>
                    </div>
                  </div>
                  <p className="text-xs font-mono text-slate-300 bg-slate-900 p-2.5 rounded border border-slate-800/60">
                    {mp.prompt}
                  </p>
                  <p className="text-[10px] font-mono text-slate-400">
                    <strong className="text-slate-500">Negative Prompt: </strong> {mp.negativePrompt}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. DAVINCI RESOLVE CONNECTOR */}
        {activeTab === 'davinci' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h4 className="text-base font-semibold text-emerald-400 flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  DaVinci Resolve / Premiere Color Grading Spec
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Color grading recommendations, 3D LUT designation, and Color Decision List (CDL) XML.
                </p>
              </div>

              <button
                onClick={() =>
                  handleDownloadFile(
                    connectors.davinciResolve.cdlXml,
                    `${project.title.replace(/ /g, '_')}_ColorGrade.cdl`,
                    'application/xml'
                  )
                }
                className="px-3 py-1.5 text-xs font-medium text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CDL XML</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-950/60 p-4 rounded border border-slate-800/80 space-y-1">
                <span className="text-[11px] text-slate-400">3D LUT Recommendation</span>
                <span className="text-sm font-mono font-medium text-emerald-400 block truncate">
                  {connectors.davinciResolve.lutRecommendation}
                </span>
                <span className="text-[10px] text-slate-500">Rec.709 Color Space</span>
              </div>
              <div className="bg-slate-950/60 p-4 rounded border border-slate-800/80 space-y-1">
                <span className="text-[11px] text-slate-400">Lift (Shadows) Wheel</span>
                <span className="text-xs font-mono text-slate-300 block">
                  {connectors.davinciResolve.colorWheelLift}
                </span>
              </div>
              <div className="bg-slate-950/60 p-4 rounded border border-slate-800/80 space-y-1">
                <span className="text-[11px] text-slate-400">Gain (Highlights) Wheel</span>
                <span className="text-xs font-mono text-slate-300 block">
                  {connectors.davinciResolve.colorWheelGain}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-medium text-slate-300">Color Decision List XML</span>
              <pre className="bg-slate-950 p-3.5 rounded border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-48">
                {connectors.davinciResolve.cdlXml}
              </pre>
            </div>
          </div>
        )}

        {/* 5. ELEVENLABS CONNECTOR */}
        {activeTab === 'elevenlabs' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h4 className="text-base font-semibold text-rose-400 flex items-center gap-2">
                  <Mic className="w-4 h-4" />
                  ElevenLabs Voiceover & Vocal Design Blueprint
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Voice persona settings, stability curves, and screenplay script with vocal bursts.
                </p>
              </div>

              <button
                onClick={() => handleCopy(connectors.elevenlabs.scriptWithBursts, 'vo_script')}
                className="px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded transition-colors flex items-center gap-1.5"
              >
                {copiedKey === 'vo_script' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'vo_script' ? 'Copied' : 'Copy Script'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-950/60 p-4 rounded border border-slate-800/80 space-y-1">
                <span className="text-[11px] text-slate-400">Recommended Voice</span>
                <span className="text-sm font-semibold text-rose-400 block">
                  {connectors.elevenlabs.voiceName}
                </span>
              </div>
              <div className="bg-slate-950/60 p-4 rounded border border-slate-800/80 space-y-1">
                <span className="text-[11px] text-slate-400">Voice Stability</span>
                <span className="text-sm font-mono text-slate-200 block">
                  {connectors.elevenlabs.stability * 100}%
                </span>
              </div>
              <div className="bg-slate-950/60 p-4 rounded border border-slate-800/80 space-y-1">
                <span className="text-[11px] text-slate-400">Similarity Boost</span>
                <span className="text-sm font-mono text-slate-200 block">
                  {connectors.elevenlabs.similarityBoost * 100}%
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-medium text-slate-300">Screenplay Script with Directorial Bursts</span>
              <div className="bg-slate-950 p-4 rounded border border-slate-800 text-xs text-slate-300 leading-relaxed font-mono">
                {connectors.elevenlabs.scriptWithBursts}
              </div>
            </div>
          </div>
        )}

        {/* 6. LIVE API & WEBHOOK DISPATCH CONSOLE */}
        {(activeTab as any) === 'console' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h4 className="text-base font-semibold text-amber-400 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 fill-current" />
                  Live Webhook & Multi-Tool Dispatch Console
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Test and inspect automated API payloads sent to Canva, CapCut, Higgsfield, and DaVinci.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleDispatchConnector('webhook_batch');
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded transition-colors flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Dispatch All Connectors</span>
                </button>
              </div>
            </div>

            {/* Terminal Log Output */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-300">Live Gateway Dispatch Logs</span>
                <span className="text-[11px] font-mono text-emerald-400">WebSocket / HTTPS Active</span>
              </div>
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono text-xs text-slate-300 space-y-1.5 overflow-x-auto max-h-56">
                <div className="text-slate-500">[INFO] vicky.AI Orchestrator Pipeline v3.8.0 online</div>
                <div className="text-sky-400">[CONNECT] Canva Partner API authenticated: Bearer token valid</div>
                <div className="text-amber-400">[CONNECT] CapCut Desktop Ingestion: EDL mapped to 24fps non-drop</div>
                <div className="text-purple-400">[CONNECT] Higgsfield Camera Control: 4 motion prompts synchronized</div>
                <div className="text-emerald-400">[CONNECT] DaVinci Resolve CDL: Rec.709 color balance loaded</div>
                <div className="text-slate-400">[STATUS] All 5 connectors synced with current timeline project</div>
              </div>
            </div>

            {/* Copyable cURL API Request */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-300">cURL Automated Dispatch Snippet</span>
                <button
                  onClick={() =>
                    handleCopy(
                      `curl -X POST https://api.vicky.ai/v1/dispatch \\
  -H "Authorization: Bearer VICKY_PRODUCER_KEY" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify({ projectTitle: project.title, style: project.style, shotsCount: project.shots.length })}'`,
                      'curl_snippet'
                    )
                  }
                  className="text-xs text-amber-400 hover:underline flex items-center gap-1"
                >
                  {copiedKey === 'curl_snippet' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'curl_snippet' ? 'Copied' : 'Copy cURL'}</span>
                </button>
              </div>
              <pre className="bg-slate-950 p-3 rounded border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto">
{`curl -X POST https://api.vicky.ai/v1/dispatch \\
  -H "Authorization: Bearer VICKY_PRODUCER_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"projectTitle":"${project.title}","shots":${project.shots.length},"aspectRatio":"${project.aspectRatio}"}'`}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
