import React, { useState } from "react";
import { Download, Loader2, Video, X, AlertCircle } from "lucide-react";
import { generateRunwayClip } from "../services/runwayVideo";

interface Props { isOpen: boolean; onClose: () => void; defaultPrompt?: string; aspectRatio?: string; }

export const RunwayVideoModal: React.FC<Props> = ({ isOpen, onClose, defaultPrompt = "", aspectRatio = "16:9" }) => {
  const [prompt, setPrompt] = useState(defaultPrompt.slice(0, 1000));
  const [ratio, setRatio] = useState(aspectRatio === "9:16" ? "9:16" : "16:9");
  const [duration, setDuration] = useState<5 | 10>(5);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  if (!isOpen) return null;

  const start = async () => {
    if (!prompt.trim() || busy) return;
    setBusy(true); setError(""); setVideoUrl(""); setStatus("Submitting prompt to Runway…");
    try {
      const result = await generateRunwayClip({
        prompt: prompt.trim(), aspectRatio: ratio, duration,
        onStatus: (next) => setStatus(`Runway status: ${next.toLowerCase()}`),
      });
      setVideoUrl(result.videoUrl);
      setStatus("Your AI video clip is ready.");
    } catch (e: any) {
      setError(e?.message || "Could not generate video.");
      setStatus("");
    } finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl border border-slate-700 bg-slate-950 text-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-400/15 p-2 text-amber-300"><Video className="h-5 w-5" /></div>
            <div><h2 className="font-semibold">Runway AI Video Generator</h2><p className="text-xs text-slate-400">Generate a real AI video clip from your prompt</p></div>
          </div>
          <button onClick={onClose} className="rounded p-2 text-slate-400 hover:bg-slate-800 hover:text-white" aria-label="Close"><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-4 p-5">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-200">Scene prompt</span>
            <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={5} maxLength={1000}
              placeholder="A lonely man walks through a mysterious forest at night. A red feather falls in front of him. Cinematic fantasy, moonlight, slow camera movement."
              className="w-full resize-y rounded-lg border border-slate-700 bg-slate-900 p-3 text-sm text-white outline-none focus:border-amber-400" />
            <span className="block text-right text-xs text-slate-500">{prompt.length}/1000</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1.5 text-sm"><span className="block text-slate-300">Aspect ratio</span>
              <select value={ratio} onChange={(e) => setRatio(e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2.5">
                <option value="16:9">Landscape (16:9)</option><option value="9:16">Vertical (9:16)</option>
              </select>
            </label>
            <label className="space-y-1.5 text-sm"><span className="block text-slate-300">Clip length</span>
              <select value={duration} onChange={(e) => setDuration(Number(e.target.value) as 5 | 10)} className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2.5">
                <option value={5}>5 seconds</option><option value={10}>10 seconds</option>
              </select>
            </label>
          </div>
          {busy && <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200"><Loader2 className="h-4 w-4 animate-spin" />{status || "Generating video…"}</div>}
          {error && <div className="flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{error}</span></div>}
          {videoUrl && <div className="space-y-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
            <p className="text-sm text-emerald-300">{status}</p>
            <video src={videoUrl} controls playsInline className="max-h-[55vh] w-full rounded-lg bg-black" />
            <a href={videoUrl} target="_blank" rel="noreferrer" download="vicky-runway-clip.mp4" className="inline-flex items-center gap-2 rounded-lg bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950"><Download className="h-4 w-4" />Open / download clip</a>
            <p className="text-xs text-slate-500">Runway output links may expire. Download your clip when it is ready.</p>
          </div>}
          <div className="flex flex-wrap justify-end gap-2 border-t border-slate-800 pt-4">
            <button onClick={onClose} className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800">Close</button>
            <button onClick={start} disabled={busy || !prompt.trim()} className="inline-flex items-center gap-2 rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"><Video className="h-4 w-4" />{busy ? "Generating…" : "Generate AI Video"}</button>
          </div>
        </div>
      </div>
    </div>
  );
};
