import React, { useState, useRef } from 'react';
import {
  MessageSquare,
  Video,
  Music,
  Image as ImageIcon,
  Mic,
  Globe,
  MapPin,
  Send,
  Sparkles,
  Upload,
  Play,
  Square,
  ExternalLink,
  Check,
  Volume2,
  Wand2,
} from 'lucide-react';
import { ProductionProject } from '../types/producer';
import { audioDirector } from '../services/audioSynthesizer';

interface AiStudioLabProps {
  project: ProductionProject;
  activeShotIndex: number;
  onApplyImageToShot: (shotIndex: number, imageUrl: string) => void;
  onApplyIdeaPitch: (ideaText: string) => void;
}

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export const AiStudioLab: React.FC<AiStudioLabProps> = ({
  project,
  activeShotIndex,
  onApplyImageToShot,
  onApplyIdeaPitch,
}) => {
  const [activeTool, setActiveTool] = useState<
    'chat' | 'veo' | 'music' | 'image' | 'voice' | 'grounding'
  >('chat');

  // 1. Multi-Turn Chat State
  const [chatModel, setChatModel] = useState<string>('gemini-flash-latest');
  const [chatInput, setChatInput] = useState<string>('');
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      role: 'model',
      text: `Hello! I am vicky.AI, your Executive AI Film Director for "${project.title}". Ask me to refine your script, design camera setups, or plan shots.`,
    },
  ]);

  // 2. Veo 3 Video State
  const [veoPrompt, setVeoPrompt] = useState<string>(
    project.shots[activeShotIndex]?.visualPrompt || project.logline
  );
  const [veoAspectRatio, setVeoAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [veoPhotoUrl, setVeoPhotoUrl] = useState<string>('');
  const [isVeoGenerating, setIsVeoGenerating] = useState<boolean>(false);
  const [veoStatusMsg, setVeoStatusMsg] = useState<string>('');
  const [veoVideoUrl, setVeoVideoUrl] = useState<string | null>(null);

  // 3. Lyria Music State
  const [musicPrompt, setMusicPrompt] = useState<string>(
    `${project.autonomousDecisions.soundDesign.musicGenre} at ${project.autonomousDecisions.soundDesign.bpm} BPM, ${project.autonomousDecisions.soundDesign.mood}`
  );
  const [musicModelType, setMusicModelType] = useState<'clip' | 'pro'>('clip');
  const [isMusicLoading, setIsMusicLoading] = useState<boolean>(false);
  const [musicAudioUrl, setMusicAudioUrl] = useState<string | null>(null);
  const [musicLyrics, setMusicLyrics] = useState<string>('');
  const [musicNotice, setMusicNotice] = useState<string>('');

  // 4. Image Create & Edit State
  const [imgPrompt, setImgPrompt] = useState<string>(
    project.shots[activeShotIndex]?.visualPrompt || 'Cinematic film frame, 35mm anamorphic'
  );
  const [imgRefUrl, setImgRefUrl] = useState<string>('');
  const [imgAspect, setImgAspect] = useState<'16:9' | '9:16'>('16:9');
  const [isImgLoading, setIsImgLoading] = useState<boolean>(false);
  const [generatedImgUrl, setGeneratedImgUrl] = useState<string | null>(null);
  const [imgNotice, setImgNotice] = useState<string>('');

  // 5. Audio Transcribe & Live Voice State
  const [isRecordingMic, setIsRecordingMic] = useState<boolean>(false);
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [transcribedText, setTranscribedText] = useState<string>('');
  const [liveVoiceInput, setLiveVoiceInput] = useState<string>('');
  const [liveVoiceReply, setLiveVoiceReply] = useState<string>('');
  const [liveVoiceAudioUrl, setLiveVoiceAudioUrl] = useState<string | null>(null);
  const [isLiveVoiceLoading, setIsLiveVoiceLoading] = useState<boolean>(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // 6. Search & Maps Grounding State
  const [groundingMode, setGroundingMode] = useState<'search' | 'maps'>('search');
  const [groundingQuery, setGroundingQuery] = useState<string>(
    project.autonomousDecisions.locations[0]?.name || 'Cinematic desert filming locations'
  );
  const [isGroundingLoading, setIsGroundingLoading] = useState<boolean>(false);
  const [groundingResult, setGroundingResult] = useState<string>('');
  const [groundingLinks, setGroundingLinks] = useState<
    { title: string; uri: string; type: 'web' | 'maps' }[]
  >([]);

  // --- Handlers ---

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;
    const userMsg = chatInput.trim();
    setChatInput('');
    const updatedHistory: ChatMessage[] = [...chatHistory, { role: 'user', text: userMsg }];
    setChatHistory(updatedHistory);
    setIsChatLoading(true);

    try {
      const res = await fetch('/api/vicky/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: chatHistory,
          message: userMsg,
          selectedModel: chatModel,
          projectTitle: project.title,
        }),
      });
      const data = await res.json();
      setChatHistory([
        ...updatedHistory,
        { role: 'model', text: data.reply || 'Ready to direct your next scene.' },
      ]);
    } catch (err) {
      setChatHistory([
        ...updatedHistory,
        { role: 'model', text: 'Let us frame that shot with a 35mm anamorphic lens.' },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleVeoPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) setVeoPhotoUrl(ev.target.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateVeoVideo = async () => {
    setIsVeoGenerating(true);
    setVeoVideoUrl(null);
    setVeoStatusMsg('Submitting request to Veo 3 (veo-3.1-fast-generate-preview)...');

    try {
      const res = await fetch('/api/vicky/veo-start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: veoPrompt,
          imageDataUrl: veoPhotoUrl || undefined,
          aspectRatio: veoAspectRatio,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.operationName) {
        setVeoStatusMsg(
          data.error ||
            'Veo 3 requires a billing-enabled API key in Settings > Secrets. Use "Render Video" in the Director Monitor for immediate in-browser composite video.'
        );
        setIsVeoGenerating(false);
        return;
      }

      setVeoStatusMsg(`Operation started (${data.model}). Polling video generation progress...`);
      const opName = data.operationName;

      let attempts = 0;
      const poll = async () => {
        attempts++;
        const statusRes = await fetch('/api/vicky/veo-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ operationName: opName }),
        });
        const statusData = await statusRes.json();
        if (statusData.done) {
          setVeoStatusMsg('Downloading generated MP4 stream...');
          const dlRes = await fetch('/api/vicky/veo-download', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ operationName: opName }),
          });
          if (dlRes.ok) {
            const blob = await dlRes.blob();
            setVeoVideoUrl(URL.createObjectURL(blob));
            setVeoStatusMsg('Veo 3 video generation complete!');
          } else {
            setVeoStatusMsg('Video finished but stream download failed.');
          }
          setIsVeoGenerating(false);
        } else if (attempts < 40) {
          setVeoStatusMsg(`Synthesizing Veo frames (Poll #${attempts})...`);
          setTimeout(poll, 4000);
        } else {
          setVeoStatusMsg('Timed out waiting for Veo operation.');
          setIsVeoGenerating(false);
        }
      };

      setTimeout(poll, 3500);
    } catch (err: any) {
      setVeoStatusMsg(err.message || 'Veo request failed.');
      setIsVeoGenerating(false);
    }
  };

  const handleGenerateMusic = async () => {
    setIsMusicLoading(true);
    setMusicNotice('');
    setMusicAudioUrl(null);
    setMusicLyrics('');

    try {
      const res = await fetch('/api/vicky/generate-music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: musicPrompt,
          modelType: musicModelType,
        }),
      });
      const data = await res.json();
      if (data.success && data.audioDataUrl) {
        setMusicAudioUrl(data.audioDataUrl);
        if (data.lyrics) setMusicLyrics(data.lyrics);
      } else {
        setMusicNotice(
          data.notice ||
            'Playing synthesized studio score (Lyria models require a paid API key in Settings > Secrets).'
        );
        audioDirector.playCinematicCue(project.style);
      }
    } catch (err) {
      setMusicNotice('Playing synthesized Web Audio score.');
      audioDirector.playCinematicCue(project.style);
    } finally {
      setIsMusicLoading(false);
    }
  };

  const handleGenerateOrEditImage = async () => {
    setIsImgLoading(true);
    setImgNotice('');
    try {
      const res = await fetch('/api/vicky/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: imgPrompt,
          referenceImageDataUrl: imgRefUrl || undefined,
          aspectRatio: imgAspect,
        }),
      });
      const data = await res.json();
      if (data.success && data.imageUrl) {
        setGeneratedImgUrl(data.imageUrl);
      } else {
        // Generate a high-res procedural canvas concept frame so the user always gets a visual
        const canvas = document.createElement('canvas');
        canvas.width = imgAspect === '9:16' ? 720 : 1280;
        canvas.height = imgAspect === '9:16' ? 1280 : 720;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
          grad.addColorStop(0, project.autonomousDecisions.colorPalette.primary || '#0B192C');
          grad.addColorStop(0.6, project.autonomousDecisions.colorPalette.secondary || '#1E3E62');
          grad.addColorStop(1, project.autonomousDecisions.colorPalette.accent || '#FF6500');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = 'rgba(0,0,0,0.45)';
          ctx.fillRect(40, canvas.height - 160, canvas.width - 80, 110);
          ctx.fillStyle = '#F59E0B';
          ctx.font = 'bold 20px monospace';
          ctx.fillText('vicky.AI CONCEPT FRAME · ' + imgAspect, 65, canvas.height - 115);
          ctx.fillStyle = '#FFFFFF';
          ctx.font = '18px sans-serif';
          ctx.fillText(imgPrompt.slice(0, 68), 65, canvas.height - 80);
          setGeneratedImgUrl(canvas.toDataURL('image/png'));
        }
        setImgNotice(
          data.quotaNotice ||
            'Generated studio concept frame (upgrade API key in Settings > Secrets for raw diffusion).'
        );
      }
    } catch (err) {
      setImgNotice('Could not generate image.');
    } finally {
      setIsImgLoading(false);
    }
  };

  const handleStartMicRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onload = async (ev) => {
          if (ev.target?.result) {
            setIsTranscribing(true);
            try {
              const res = await fetch('/api/vicky/transcribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ audioDataUrl: ev.target.result }),
              });
              const data = await res.json();
              if (data.transcript) setTranscribedText(data.transcript);
            } catch (err) {}
            setIsTranscribing(false);
          }
        };
        reader.readAsDataURL(blob);
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecordingMic(true);
    } catch (err) {
      setTranscribedText('Microphone access was denied or unavailable in this browser.');
    }
  };

  const handleStopMicRecording = () => {
    if (mediaRecorderRef.current && isRecordingMic) {
      mediaRecorderRef.current.stop();
      setIsRecordingMic(false);
    }
  };

  const handleSendLiveVoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!liveVoiceInput.trim()) return;
    setIsLiveVoiceLoading(true);
    setLiveVoiceAudioUrl(null);
    try {
      const res = await fetch('/api/vicky/live-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: liveVoiceInput.trim(), voiceName: 'Kore' }),
      });
      const data = await res.json();
      if (data.replyText) {
        setLiveVoiceReply(data.replyText);
        if (data.audioDataUrl) {
          setLiveVoiceAudioUrl(data.audioDataUrl);
        } else {
          audioDirector.speakVoiceover(data.replyText);
        }
      }
    } catch (err) {}
    setIsLiveVoiceLoading(false);
  };

  const handleRunGrounding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groundingQuery.trim()) return;
    setIsGroundingLoading(true);
    setGroundingResult('');
    setGroundingLinks([]);

    try {
      const res = await fetch('/api/vicky/grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: groundingQuery.trim(),
          mode: groundingMode,
        }),
      });
      const data = await res.json();
      setGroundingResult(data.text || '');
      setGroundingLinks(data.links || []);
    } catch (err) {
      setGroundingResult('Could not complete grounding search.');
    } finally {
      setIsGroundingLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
      {/* Studio Header & Tool Selector */}
      <div className="p-5 bg-slate-950 border-b border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Gemini Multimodal Production Suite</span>
          </div>
          <h3 className="text-lg font-bold text-white font-serif">
            AI Studio Lab — Veo 3, Lyria Music, Live Voice & Grounding
          </h3>
        </div>

        {/* Interactive Segmented Filter Bar */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-900 p-1.5 rounded-lg border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTool('chat')}
            className={`px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-colors ${
              activeTool === 'chat'
                ? 'bg-amber-400 text-slate-950 font-semibold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Director Chat</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTool('veo')}
            className={`px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-colors ${
              activeTool === 'veo'
                ? 'bg-amber-400 text-slate-950 font-semibold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Veo 3 Video & Photo Animate</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTool('music')}
            className={`px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-colors ${
              activeTool === 'music'
                ? 'bg-amber-400 text-slate-950 font-semibold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span>Lyria Music</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTool('image')}
            className={`px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-colors ${
              activeTool === 'image'
                ? 'bg-amber-400 text-slate-950 font-semibold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Create & Edit Image</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTool('voice')}
            className={`px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-colors ${
              activeTool === 'voice'
                ? 'bg-amber-400 text-slate-950 font-semibold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Transcribe & Live Voice</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTool('grounding')}
            className={`px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-colors ${
              activeTool === 'grounding'
                ? 'bg-amber-400 text-slate-950 font-semibold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Search & Maps Scout</span>
          </button>
        </div>
      </div>

      {/* Tool Body */}
      <div className="p-6">
        {/* 1. MULTI-TURN GEMINI CHATBOT */}
        {activeTool === 'chat' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-slate-400">
                Multi-turn conversational assistant with project context memory.
              </p>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">Model:</span>
                <select
                  value={chatModel}
                  onChange={(e) => setChatModel(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-amber-300 font-mono"
                >
                  <option value="gemini-flash-latest">gemini-3.5-flash / latest (Balanced)</option>
                  <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Complex Reasoning)</option>
                  <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Fast Low-Latency)</option>
                </select>
              </div>
            </div>

            <div className="h-72 overflow-y-auto bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-3">
              {chatHistory.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xl rounded-lg px-4 py-2.5 text-xs leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-amber-400 text-slate-950 font-medium'
                        : 'bg-slate-900 border border-slate-800 text-slate-200'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div className="text-xs text-amber-400 font-mono animate-pulse">
                  vicky.AI is thinking...
                </div>
              )}
            </div>

            <form onSubmit={handleSendChat} className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask vicky.AI to rewrite Shot 2 dialogue, suggest lens choices, or plan transitions..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                disabled={isChatLoading || !chatInput.trim()}
                className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-slate-950 text-xs font-semibold rounded-lg flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>
          </div>
        )}

        {/* 2. VEO 3 VIDEO GENERATION & ANIMATE PHOTO TO VIDEO */}
        {activeTool === 'veo' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="text-xs font-medium text-slate-200 block">
                  Veo 3 Video Prompt (`veo-3.1-fast-generate-preview`)
                </label>
                <textarea
                  rows={3}
                  value={veoPrompt}
                  onChange={(e) => setVeoPrompt(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                />

                <div className="flex items-center gap-3">
                  <div className="space-y-1 flex-1">
                    <label className="text-xs text-slate-400 block">Aspect Ratio</label>
                    <select
                      value={veoAspectRatio}
                      onChange={(e) => setVeoAspectRatio(e.target.value as '16:9' | '9:16')}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200"
                    >
                      <option value="16:9">16:9 Landscape</option>
                      <option value="9:16">9:16 Portrait (Reels)</option>
                    </select>
                  </div>

                  <div className="space-y-1 flex-1">
                    <label className="text-xs text-slate-400 block">
                      Optional Photo to Animate
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleVeoPhotoUpload}
                      className="block w-full text-xs text-slate-300 file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-amber-300 bg-slate-950 border border-slate-800 rounded p-1"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateVeoVideo}
                  disabled={isVeoGenerating}
                  className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 text-xs font-semibold rounded-lg flex items-center justify-center gap-2"
                >
                  <Video className="w-4 h-4" />
                  <span>
                    {isVeoGenerating
                      ? 'Generating with Veo 3...'
                      : veoPhotoUrl
                      ? 'Animate Photo with Veo 3'
                      : 'Generate Video from Text with Veo 3'}
                  </span>
                </button>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col items-center justify-center min-h-[200px] text-center">
                {veoVideoUrl ? (
                  <video src={veoVideoUrl} controls autoPlay className="max-h-56 rounded" />
                ) : veoPhotoUrl ? (
                  <div className="space-y-2">
                    <img
                      src={veoPhotoUrl}
                      alt="Source to animate"
                      className="max-h-36 rounded mx-auto border border-slate-800"
                    />
                    <p className="text-xs text-emerald-400">
                      Photo ready to animate ({veoAspectRatio})
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 max-w-xs">
                    Enter a prompt or upload a photo to generate a `16:9` or `9:16` video with
                    `veo-3.1-fast-generate-preview`.
                  </p>
                )}
                {veoStatusMsg && (
                  <p className="text-xs text-amber-300 font-mono mt-3">{veoStatusMsg}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 3. LYRIA MUSIC GENERATION */}
        {activeTool === 'music' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-3">
                <label className="text-xs font-medium text-slate-200 block">
                  Music Prompt (`lyria-3-clip-preview` / `lyria-3-pro-preview`)
                </label>
                <input
                  type="text"
                  value={musicPrompt}
                  onChange={(e) => setMusicPrompt(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-slate-100"
                />

                <div className="flex items-center gap-3">
                  <select
                    value={musicModelType}
                    onChange={(e) => setMusicModelType(e.target.value as 'clip' | 'pro')}
                    className="bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200"
                  >
                    <option value="clip">lyria-3-clip-preview (30s Clip)</option>
                    <option value="pro">lyria-3-pro-preview (Full Track)</option>
                  </select>

                  <button
                    type="button"
                    onClick={handleGenerateMusic}
                    disabled={isMusicLoading}
                    className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-semibold rounded flex items-center gap-1.5"
                  >
                    <Music className="w-3.5 h-3.5" />
                    <span>{isMusicLoading ? 'Composing Score...' : 'Generate Soundtrack'}</span>
                  </button>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col justify-center space-y-2">
                {musicAudioUrl ? (
                  <audio src={musicAudioUrl} controls className="w-full" />
                ) : (
                  <p className="text-xs text-slate-400">
                    {musicNotice || 'Click "Generate Soundtrack" to compose music for your film.'}
                  </p>
                )}
                {musicLyrics && (
                  <p className="text-[11px] text-slate-300 font-mono whitespace-pre-wrap">
                    {musicLyrics}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 4. CREATE & EDIT IMAGES */}
        {activeTool === 'image' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <label className="text-xs font-medium text-slate-200 block">
                Image Prompt (`gemini-3.1-flash-image-preview`)
              </label>
              <textarea
                rows={3}
                value={imgPrompt}
                onChange={(e) => setImgPrompt(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-100"
              />
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    const r = new FileReader();
                    r.onload = (ev) => {
                      if (ev.target?.result) setImgRefUrl(ev.target.result as string);
                    };
                    r.readAsDataURL(f);
                  }}
                  className="text-xs text-slate-300 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:bg-slate-800 file:text-slate-200 bg-slate-950 border border-slate-800 rounded p-1 flex-1"
                />
                <button
                  type="button"
                  onClick={handleGenerateOrEditImage}
                  disabled={isImgLoading}
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-semibold rounded flex items-center gap-1.5 shrink-0"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>{isImgLoading ? 'Rendering...' : 'Create / Edit'}</span>
                </button>
              </div>
              {imgNotice && <p className="text-[11px] text-amber-300 font-mono">{imgNotice}</p>}
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col items-center justify-center min-h-[180px] space-y-3">
              {generatedImgUrl ? (
                <>
                  <img
                    src={generatedImgUrl}
                    alt="Generated Shot Frame"
                    className="max-h-44 rounded border border-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => onApplyImageToShot(activeShotIndex, generatedImgUrl)}
                    className="px-3 py-1.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-semibold rounded flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Apply to Shot #{activeShotIndex + 1}</span>
                  </button>
                </>
              ) : (
                <p className="text-xs text-slate-500">
                  Generated or edited shot image will appear here.
                </p>
              )}
            </div>
          </div>
        )}

        {/* 5. TRANSCRIBE AUDIO & LIVE VOICE CONVERSATION */}
        {activeTool === 'voice' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mic Transcription (gemini-3.5-transcribe) */}
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-3">
              <h4 className="text-xs font-semibold text-amber-400 font-mono uppercase">
                Microphone Audio Transcription (`gemini-3.5-transcribe`)
              </h4>
              <p className="text-xs text-slate-400">
                Record your spoken pitch or voiceover with your microphone and transcribe it into
                text.
              </p>

              <div className="flex items-center gap-2">
                {!isRecordingMic ? (
                  <button
                    type="button"
                    onClick={handleStartMicRecording}
                    className="px-4 py-2 bg-rose-500 hover:bg-rose-400 text-white text-xs font-semibold rounded flex items-center gap-1.5"
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>Record Microphone</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleStopMicRecording}
                    className="px-4 py-2 bg-amber-400 text-slate-950 text-xs font-semibold rounded flex items-center gap-1.5 animate-pulse"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>Stop & Transcribe</span>
                  </button>
                )}
                {isTranscribing && (
                  <span className="text-xs text-amber-300 font-mono">
                    Transcribing with gemini-3.5-transcribe...
                  </span>
                )}
              </div>

              {transcribedText && (
                <div className="p-3 bg-slate-900 border border-slate-800 rounded space-y-2">
                  <p className="text-xs text-slate-200">{transcribedText}</p>
                  <button
                    type="button"
                    onClick={() => onApplyIdeaPitch(transcribedText)}
                    className="px-3 py-1 bg-emerald-400 text-slate-950 text-xs font-semibold rounded"
                  >
                    Produce Video from Transcript
                  </button>
                </div>
              )}
            </div>

            {/* Live Voice Director (gemini-3.8-live) */}
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-3">
              <h4 className="text-xs font-semibold text-emerald-400 font-mono uppercase">
                Live Voice Conversation (`gemini-3.8-live`)
              </h4>
              <p className="text-xs text-slate-400">
                Speak with vicky.AI Live Director and receive real-time spoken audio responses.
              </p>

              <form onSubmit={handleSendLiveVoice} className="flex gap-2">
                <input
                  type="text"
                  value={liveVoiceInput}
                  onChange={(e) => setLiveVoiceInput(e.target.value)}
                  placeholder="Say something to vicky.AI Live Director..."
                  className="flex-1 bg-slate-900 border border-slate-800 rounded px-3 py-2 text-xs text-slate-100"
                />
                <button
                  type="submit"
                  disabled={isLiveVoiceLoading}
                  className="px-3.5 py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-semibold rounded flex items-center gap-1"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{isLiveVoiceLoading ? 'Speaking...' : 'Speak'}</span>
                </button>
              </form>

              {liveVoiceReply && (
                <div className="p-3 bg-slate-900 border border-slate-800 rounded space-y-2">
                  <p className="text-xs text-emerald-300 font-medium">{liveVoiceReply}</p>
                  {liveVoiceAudioUrl && (
                    <audio src={liveVoiceAudioUrl} controls autoPlay className="w-full h-8" />
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 6. GOOGLE SEARCH & GOOGLE MAPS GROUNDING */}
        {activeTool === 'grounding' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setGroundingMode('search')}
                className={`px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 ${
                  groundingMode === 'search'
                    ? 'bg-sky-400 text-slate-950 font-semibold'
                    : 'bg-slate-950 text-slate-300 border border-slate-800'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Google Search Grounding (`googleSearch`)</span>
              </button>

              <button
                type="button"
                onClick={() => setGroundingMode('maps')}
                className={`px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 ${
                  groundingMode === 'maps'
                    ? 'bg-emerald-400 text-slate-950 font-semibold'
                    : 'bg-slate-950 text-slate-300 border border-slate-800'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Google Maps Location Scout (`googleMaps`)</span>
              </button>
            </div>

            <form onSubmit={handleRunGrounding} className="flex gap-2">
              <input
                type="text"
                value={groundingQuery}
                onChange={(e) => setGroundingQuery(e.target.value)}
                placeholder={
                  groundingMode === 'maps'
                    ? 'Search real filming locations (e.g. "Futuristic architecture in Tokyo" or "Film studios in Los Angeles")...'
                    : 'Search real-world facts or cultural trends for your script...'
                }
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-xs text-slate-100"
              />
              <button
                type="submit"
                disabled={isGroundingLoading}
                className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-semibold rounded-lg"
              >
                {isGroundingLoading ? 'Scouting...' : 'Run Grounded Query'}
              </button>
            </form>

            {groundingResult && (
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-3">
                <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {groundingResult}
                </p>

                {groundingLinks.length > 0 && (
                  <div className="pt-2 border-t border-slate-800 space-y-1.5">
                    <span className="text-[11px] font-mono text-slate-400 block">
                      Grounded Sources & Map Locations:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {groundingLinks.map((lnk, i) => (
                        <a
                          key={i}
                          href={lnk.uri}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-amber-400 hover:underline flex items-center gap-1 bg-slate-900 px-2.5 py-1 rounded border border-slate-800"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>{lnk.title}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
