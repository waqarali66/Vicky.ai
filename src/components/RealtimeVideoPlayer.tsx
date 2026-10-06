import React, { useEffect, useRef, useState } from 'react';
import {
  Film,
  Download,
  Sparkles,
  Upload,
  Check,
  RefreshCw,
  Video as VideoIcon,
} from 'lucide-react';
import { ProductionProject, ShotItem } from '../types/producer';
import { renderProjectToVideo, RenderProgress } from '../services/videoRenderer';

interface RealtimeVideoPlayerProps {
  project: ProductionProject;
  currentShot: ShotItem;
  activeShotIndex: number;
  currentTime: number;
  shotStartTime: number;
  shotDuration: number;
  totalDuration: number;
  isPlaying: boolean;
  isAudioEnabled: boolean;
  activeLut: 'applied' | 'flat_log' | 'high_contrast';
  onSeek: (time: number) => void;
  onPlaybackEnded: () => void;
  onVideoBlobGenerated?: (blobUrl: string) => void;
}

export const RealtimeVideoPlayer: React.FC<RealtimeVideoPlayerProps> = ({
  project,
  currentShot,
  activeShotIndex,
  currentTime,
  shotStartTime,
  shotDuration,
  totalDuration,
  isPlaying,
  isAudioEnabled,
  activeLut,
  onSeek,
  onPlaybackEnded,
  onVideoBlobGenerated,
}) => {
  const [playerMode, setPlayerMode] = useState<'stream' | 'blob'>('stream');
  const [compiledBlobUrl, setCompiledBlobUrl] = useState<string | null>(
    project.masterVideoBlobUrl || currentShot.videoBlobUrl || null
  );
  const [isCompilingBlob, setIsCompilingBlob] = useState<boolean>(false);
  const [compileProgress, setCompileProgress] = useState<RenderProgress | null>(null);
  const [imageReadyTick, setImageReadyTick] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamVideoRef = useRef<HTMLVideoElement | null>(null);
  const blobVideoRef = useRef<HTMLVideoElement | null>(null);
  const loadedImagesRef = useRef<Record<string, HTMLImageElement>>({});
  const fileUploadRef = useRef<HTMLInputElement | null>(null);

  // Keep compiledBlobUrl synced if project or shot provides a new blob URL
  useEffect(() => {
    if (currentShot.videoBlobUrl) {
      setCompiledBlobUrl(currentShot.videoBlobUrl);
      setPlayerMode('blob');
    } else if (project.masterVideoBlobUrl) {
      setCompiledBlobUrl(project.masterVideoBlobUrl);
    }
  }, [currentShot.videoBlobUrl, project.masterVideoBlobUrl]);

  // Preload all shot images for zero-flicker 30fps canvas video streaming
  useEffect(() => {
    project.shots.forEach((shot) => {
      const url = shot.imagePreviewUrl;
      if (url && !loadedImagesRef.current[url]) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          loadedImagesRef.current[url] = img;
          setImageReadyTick((prev) => prev + 1);
        };
        img.onerror = () => {
          // Retry without crossOrigin if external host blocks anonymous CORS
          const fallbackImg = new Image();
          fallbackImg.onload = () => {
            loadedImagesRef.current[url] = fallbackImg;
            setImageReadyTick((prev) => prev + 1);
          };
          fallbackImg.src = url;
        };
        img.src = url;
      }
    });
  }, [project.shots]);

  // Connect Canvas captureStream(30) to the real-time <video> element
  useEffect(() => {
    const canvas = canvasRef.current;
    const videoEl = streamVideoRef.current;
    if (!canvas || !videoEl || playerMode !== 'stream') return;

    try {
      if (typeof canvas.captureStream === 'function') {
        const mediaStream = canvas.captureStream(30);
        videoEl.srcObject = mediaStream;
        videoEl.play().catch(() => {});
      }
    } catch (e) {
      // Fallback: canvas remains directly visible underneath if captureStream is restricted
    }

    return () => {
      if (videoEl && videoEl.srcObject) {
        const stream = videoEl.srcObject as MediaStream;
        stream.getTracks().forEach((t) => t.stop());
        videoEl.srcObject = null;
      }
    };
  }, [playerMode, project.id]);

  // Sync Native <video> Blob element with DirectorMonitor play/pause/seek state
  useEffect(() => {
    const blobVid = blobVideoRef.current;
    if (!blobVid || playerMode !== 'blob' || !compiledBlobUrl) return;

    blobVid.muted = !isAudioEnabled;

    if (isPlaying && blobVid.paused) {
      blobVid.play().catch(() => {});
    } else if (!isPlaying && !blobVid.paused) {
      blobVid.pause();
    }
  }, [isPlaying, isAudioEnabled, playerMode, compiledBlobUrl]);

  // Draw real-time frame onto the Canvas backing the MediaStream <video>
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    const localShotElapsed = Math.max(0, currentTime - shotStartTime);
    const shotProgress = Math.min(1, localShotElapsed / Math.max(1, shotDuration));

    // 1. Base Background
    ctx.fillStyle = project.autonomousDecisions?.colorPalette?.primary || '#0B192C';
    ctx.fillRect(0, 0, width, height);

    // 2. Render Shot Visual with Real-Time Camera Motion Transform
    const imgUrl = currentShot.imagePreviewUrl;
    const img = imgUrl ? loadedImagesRef.current[imgUrl] : null;

    ctx.save();
    let scale = 1.02;
    let tx = 0;
    let ty = 0;
    let rot = 0;

    switch (currentShot.cameraMotion) {
      case 'Slow Push-In':
        scale = 1.0 + shotProgress * 0.14;
        break;
      case 'Dolly Track Right':
        scale = 1.06;
        tx = (0.5 - shotProgress) * 50;
        break;
      case 'Crane Jib Down':
        scale = 1.06;
        ty = (0.5 - shotProgress) * 36;
        break;
      case 'FPV Drone Arc':
      case 'Drone Orbit':
        scale = 1.05 + shotProgress * 0.08;
        rot = (shotProgress - 0.5) * 0.03;
        break;
      case 'Handheld Raw':
        scale = 1.04;
        tx = Math.sin(currentTime * 7) * 4;
        ty = Math.cos(currentTime * 9) * 3;
        break;
      default:
        scale = 1.01 + shotProgress * 0.04;
    }

    ctx.translate(width / 2 + tx, height / 2 + ty);
    ctx.rotate(rot);
    ctx.scale(scale, scale);
    ctx.translate(-width / 2, -height / 2);

    if (img && img.complete && img.naturalWidth > 0) {
      ctx.drawImage(img, 0, 0, width, height);
    } else {
      // Procedural dynamic scene synthesis if image is still loading
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, project.autonomousDecisions?.colorPalette?.primary || '#090D16');
      grad.addColorStop(0.5, project.autonomousDecisions?.colorPalette?.secondary || '#1E293B');
      grad.addColorStop(1, project.autonomousDecisions?.colorPalette?.accent || '#F59E0B');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    }
    ctx.restore();

    // 3. Real-Time Atmospheric Particles (Bokeh / Neon Rain / Dust Motes)
    ctx.save();
    const particleCount = 14;
    for (let i = 0; i < particleCount; i++) {
      const px = ((i * 197 + currentTime * (22 + (i % 5) * 8)) % width);
      const py = ((i * 131 + currentTime * (15 + (i % 3) * 10)) % height);
      const radius = 1.5 + (i % 3) * 1.2;
      ctx.fillStyle =
        project.style === 'cyberpunk_noir'
          ? 'rgba(56, 189, 248, 0.28)'
          : 'rgba(251, 191, 36, 0.22)';
      ctx.beginPath();
      ctx.arc(px, py, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 4. LUT Color Grade Pass
    ctx.save();
    if (activeLut === 'flat_log') {
      ctx.fillStyle = 'rgba(148, 163, 184, 0.18)';
      ctx.fillRect(0, 0, width, height);
    } else if (activeLut === 'high_contrast') {
      ctx.globalCompositeOperation = 'hard-light';
      ctx.fillStyle = 'rgba(15, 23, 42, 0.35)';
      ctx.fillRect(0, 0, width, height);
    } else {
      ctx.globalCompositeOperation = 'overlay';
      ctx.fillStyle = project.autonomousDecisions?.colorPalette?.accent || '#F59E0B';
      ctx.globalAlpha = 0.12;
      ctx.fillRect(0, 0, width, height);
    }
    ctx.restore();

    // 5. Cinema Letterbox Vignette
    ctx.save();
    const vig = ctx.createLinearGradient(0, 0, 0, height);
    vig.addColorStop(0, 'rgba(0,0,0,0.65)');
    vig.addColorStop(0.14, 'rgba(0,0,0,0)');
    vig.addColorStop(0.84, 'rgba(0,0,0,0)');
    vig.addColorStop(1, 'rgba(0,0,0,0.78)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();

    // 6. Canva Lower-Third Graphic Overlay
    const overlay = project.connectors?.canva?.overlays?.[activeShotIndex];
    if (overlay && shotProgress > 0.08 && shotProgress < 0.92) {
      ctx.save();
      ctx.fillStyle = 'rgba(9, 13, 22, 0.84)';
      ctx.fillRect(36, height - 118, 420, 44);
      ctx.fillStyle = '#F59E0B';
      ctx.fillRect(36, height - 118, 4, 44);
      ctx.fillStyle = '#F8FAFC';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(overlay.text, 50, height - 96);
      ctx.fillStyle = '#38BDF8';
      ctx.font = '11px monospace';
      ctx.fillText(overlay.layout, 50, height - 81);
      ctx.restore();
    }

    // 7. Burned-in Voiceover Subtitle
    if (currentShot.voiceover) {
      ctx.save();
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      const subText = `"${currentShot.voiceover}"`;
      const metrics = ctx.measureText(subText);
      const boxW = Math.min(width - 60, metrics.width + 32);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.78)';
      ctx.fillRect(width / 2 - boxW / 2, height - 54, boxW, 32);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(subText, width / 2, height - 33, width - 80);
      ctx.restore();
    }
  }, [
    currentTime,
    shotStartTime,
    shotDuration,
    currentShot,
    activeShotIndex,
    activeLut,
    project,
    imageReadyTick,
  ]);

  const handleCompileLiveBlob = async () => {
    if (isCompilingBlob) return;
    setIsCompilingBlob(true);
    setCompileProgress({
      progress: 2,
      currentShotIndex: 0,
      statusText: 'Encoding real-time video blob...',
    });

    try {
      const blob = await renderProjectToVideo(
        project,
        (prog) => setCompileProgress(prog),
        { mode: 'preview' }
      );
      const url = URL.createObjectURL(blob);
      setCompiledBlobUrl(url);
      setPlayerMode('blob');
      if (onVideoBlobGenerated) onVideoBlobGenerated(url);
    } catch (err) {
      console.error('Error compiling live blob:', err);
    } finally {
      setIsCompilingBlob(false);
      setCompileProgress(null);
    }
  };

  const handleUploadCustomVideoBlob = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const blobUrl = URL.createObjectURL(file);
    setCompiledBlobUrl(blobUrl);
    setPlayerMode('blob');
    if (onVideoBlobGenerated) onVideoBlobGenerated(blobUrl);
  };

  // CSS filter style for native <video> blob mode
  const getVideoFilterStyle = () => {
    if (activeLut === 'flat_log') {
      return { filter: 'saturate(0.55) contrast(0.78) brightness(1.08)' };
    }
    if (activeLut === 'high_contrast') {
      return { filter: 'contrast(1.32) saturate(1.18)' };
    }
    return {};
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden">
      {/* Hidden backing canvas that synthesizes 30fps frames */}
      <canvas
        ref={canvasRef}
        width={960}
        height={540}
        className={`w-full h-full object-cover ${
          playerMode === 'blob' && compiledBlobUrl ? 'hidden' : 'block'
        }`}
      />

      {/* Real-time MediaStream <video> element fed by canvas.captureStream(30) */}
      {playerMode === 'stream' && (
        <video
          ref={streamVideoRef}
          muted
          playsInline
          autoPlay
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />
      )}

      {/* Native <video> element when playing a compiled or uploaded Video Blob */}
      {playerMode === 'blob' && compiledBlobUrl && (
        <video
          ref={blobVideoRef}
          src={compiledBlobUrl}
          style={getVideoFilterStyle()}
          playsInline
          controls
          onTimeUpdate={(e) => {
            const vid = e.currentTarget;
            if (vid.duration && !isNaN(vid.duration)) {
              const mappedTime = (vid.currentTime / vid.duration) * totalDuration;
              onSeek(mappedTime);
            }
          }}
          onEnded={onPlaybackEnded}
          className="w-full h-full object-contain bg-black z-10"
        />
      )}

      {/* Top-Left Live Camera & Stream Mode Telemetry */}
      <div className="absolute top-3 left-3 z-20 flex flex-wrap items-center gap-2 pointer-events-none">
        <div className="bg-black/75 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded text-[11px] text-slate-200 flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              playerMode === 'blob'
                ? 'bg-emerald-400'
                : isPlaying
                ? 'bg-amber-400 animate-ping'
                : 'bg-sky-400'
            }`}
          />
          <span className="font-mono font-semibold text-white">
            {playerMode === 'blob' ? 'VIDEO BLOB (.WEBM)' : 'LIVE STREAM PLAYER (30 FPS)'}
          </span>
          <span className="text-slate-500">·</span>
          <span>{currentShot.cameraMotion}</span>
          <span className="text-slate-500">·</span>
          <span className="text-amber-300 font-mono">{currentShot.lensMm}</span>
        </div>
      </div>

      {/* Top-Right Video Blob Controls (Switch Mode / Compile Blob / Load Clip / Download) */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
        <input
          ref={fileUploadRef}
          type="file"
          accept="video/mp4,video/webm,video/*"
          onChange={handleUploadCustomVideoBlob}
          className="hidden"
        />

        {compiledBlobUrl && (
          <div className="flex items-center bg-black/80 backdrop-blur-md border border-white/15 rounded p-0.5 text-[11px]">
            <button
              type="button"
              onClick={() => setPlayerMode('stream')}
              className={`px-2 py-1 rounded transition-colors ${
                playerMode === 'stream'
                  ? 'bg-amber-400 text-slate-950 font-semibold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Live Stream
            </button>
            <button
              type="button"
              onClick={() => setPlayerMode('blob')}
              className={`px-2 py-1 rounded transition-colors ${
                playerMode === 'blob'
                  ? 'bg-emerald-400 text-slate-950 font-semibold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Video Blob
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={handleCompileLiveBlob}
          disabled={isCompilingBlob}
          className="px-2.5 py-1 rounded bg-black/80 hover:bg-slate-900 border border-amber-400/50 text-amber-300 text-[11px] font-medium flex items-center gap-1.5 backdrop-blur-md transition-colors"
          title="Synthesize timeline into a playable .webm video blob inside this player"
        >
          {isCompilingBlob ? (
            <>
              <RefreshCw className="w-3 h-3 animate-spin text-amber-400" />
              <span>Encoding {compileProgress?.progress || 0}%</span>
            </>
          ) : (
            <>
              <VideoIcon className="w-3 h-3 text-amber-400" />
              <span>{compiledBlobUrl ? 'Re-Compile Blob' : 'Compile Video Blob'}</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => fileUploadRef.current?.click()}
          className="px-2 py-1 rounded bg-black/80 hover:bg-slate-900 border border-white/15 text-slate-300 hover:text-white text-[11px] flex items-center gap-1 backdrop-blur-md transition-colors"
          title="Load external MP4/WebM video blob into player"
        >
          <Upload className="w-3 h-3" />
          <span className="hidden sm:inline">Load Clip</span>
        </button>

        {compiledBlobUrl && (
          <a
            href={compiledBlobUrl}
            download={`${project.title.replace(/\s+/g, '_')}_preview.webm`}
            className="px-2 py-1 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[11px] font-semibold flex items-center gap-1 transition-colors"
            title="Download compiled video blob"
          >
            <Download className="w-3 h-3" />
            <span className="hidden sm:inline">Save</span>
          </a>
        )}
      </div>

      {/* Inline Encoding Progress Overlay when compiling a Video Blob */}
      {isCompilingBlob && compileProgress && (
        <div className="absolute inset-x-6 bottom-14 z-30 bg-slate-950/90 backdrop-blur-md border border-amber-400/40 rounded-lg p-3 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-amber-300 font-mono">{compileProgress.statusText}</span>
            <span className="text-amber-400 font-mono font-bold">
              {compileProgress.progress}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-400 transition-all duration-150"
              style={{ width: `${compileProgress.progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
