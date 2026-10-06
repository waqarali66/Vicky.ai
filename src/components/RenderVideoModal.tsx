import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Film,
  Download,
  Check,
  AlertCircle,
  Play,
  Video,
  RotateCcw,
  Clock,
  Trash2,
  History,
} from 'lucide-react';
import { ProductionProject } from '../types/producer';
import { renderProjectToVideo, RenderProgress } from '../services/videoRenderer';

export interface RenderHistoryItem {
  id: string;
  projectId: string;
  projectTitle: string;
  mode: 'preview' | 'full';
  status: 'rendering' | 'completed' | 'failed';
  elapsedSeconds: number;
  fileSizeKb?: number;
  shotsCount: number;
  aspectRatio: string;
  createdAt: string;
  blobUrl?: string;
  fileName: string;
  errorText?: string;
}

const RENDER_HISTORY_STORAGE_KEY = 'vicky_ai_render_history';

// Session-level map of Blob URLs so closing/reopening the modal preserves downloadable blobs
const sessionBlobUrls: Record<string, string> = {};

function loadSavedRenderHistory(): RenderHistoryItem[] {
  try {
    const raw = localStorage.getItem(RENDER_HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed: RenderHistoryItem[] = JSON.parse(raw);
    return parsed.map((item) => ({
      ...item,
      blobUrl: sessionBlobUrls[item.id] || undefined,
      status: item.status === 'rendering' ? 'failed' : item.status,
    }));
  } catch {
    return [];
  }
}

function saveRenderHistory(items: RenderHistoryItem[]) {
  try {
    // Store metadata without ephemeral blobUrl strings in localStorage
    const serializable = items.slice(0, 20).map(({ blobUrl, ...rest }) => rest);
    localStorage.setItem(RENDER_HISTORY_STORAGE_KEY, JSON.stringify(serializable));
  } catch {}
}

interface RenderVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProductionProject;
  onVideoBlobGenerated?: (blobUrl: string) => void;
}

export const RenderVideoModal: React.FC<RenderVideoModalProps> = ({
  isOpen,
  onClose,
  project,
  onVideoBlobGenerated,
}) => {
  const [renderMode, setRenderMode] = useState<'preview' | 'full'>('preview');
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [liveElapsedSec, setLiveElapsedSec] = useState<number>(0);
  const [progressData, setProgressData] = useState<RenderProgress>({
    progress: 0,
    currentShotIndex: 0,
    statusText: 'Ready to render',
  });
  const [videoBlobUrl, setVideoBlobUrl] = useState<string | null>(null);
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [renderHistory, setRenderHistory] = useState<RenderHistoryItem[]>(() =>
    loadSavedRenderHistory()
  );

  const renderStartPerfRef = useRef<number>(0);
  const timerIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      const loaded = loadSavedRenderHistory();
      setRenderHistory(loaded);
      if (!videoBlobUrl && !isRendering) {
        handleStartRender(renderMode);
      }
    }
    return () => {
      if (timerIntervalRef.current) {
        window.clearInterval(timerIntervalRef.current);
      }
    };
  }, [isOpen]);

  const formatElapsed = (sec: number) => {
    if (sec < 60) {
      return `${sec.toFixed(1)}s`;
    }
    const mins = Math.floor(sec / 60);
    const rem = (sec % 60).toFixed(1);
    return `${mins}m ${rem}s`;
  };

  const handleStartRender = async (mode: 'preview' | 'full') => {
    if (isRendering) return;
    setRenderMode(mode);
    setIsRendering(true);
    setErrorMessage(null);
    setLiveElapsedSec(0);

    const renderId = `rnd_${Date.now()}`;
    const cleanTitle = project.title.replace(/\s+/g, '_');
    const fileName = `${cleanTitle}_${mode === 'preview' ? 'ShowcaseReel' : 'Master'}.webm`;

    const initialHistoryEntry: RenderHistoryItem = {
      id: renderId,
      projectId: project.id,
      projectTitle: project.title,
      mode,
      status: 'rendering',
      elapsedSeconds: 0,
      shotsCount: project.shots.length,
      aspectRatio: project.aspectRatio,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      fileName,
    };

    setRenderHistory((prev) => {
      const next = [initialHistoryEntry, ...prev];
      saveRenderHistory(next);
      return next;
    });

    renderStartPerfRef.current = performance.now();
    if (timerIntervalRef.current) window.clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = window.setInterval(() => {
      const elapsed = (performance.now() - renderStartPerfRef.current) / 1000;
      setLiveElapsedSec(elapsed);
      setRenderHistory((prev) =>
        prev.map((item) =>
          item.id === renderId ? { ...item, elapsedSeconds: elapsed } : item
        )
      );
    }, 100);

    setProgressData({
      progress: 1,
      currentShotIndex: 0,
      statusText: `Initializing ${
        mode === 'preview' ? 'Showcase Reel (~10s)' : 'Full Master (~20s)'
      } rendering pipeline...`,
    });

    try {
      const blob = await renderProjectToVideo(
        project,
        (p) => {
          setProgressData(p);
        },
        { mode }
      );

      if (timerIntervalRef.current) {
        window.clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }

      const finalElapsed = (performance.now() - renderStartPerfRef.current) / 1000;
      setLiveElapsedSec(finalElapsed);

      const url = URL.createObjectURL(blob);
      sessionBlobUrls[renderId] = url;
      setVideoBlobUrl(url);
      setActiveHistoryId(renderId);

      if (onVideoBlobGenerated) {
        onVideoBlobGenerated(url);
      }

      const fileSizeKb = Math.max(1, Math.round(blob.size / 1024));

      setRenderHistory((prev) => {
        const next = prev.map((item) =>
          item.id === renderId
            ? {
                ...item,
                status: 'completed' as const,
                elapsedSeconds: finalElapsed,
                fileSizeKb,
                blobUrl: url,
              }
            : item
        );
        saveRenderHistory(next);
        return next;
      });
    } catch (err: any) {
      if (timerIntervalRef.current) {
        window.clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      const finalElapsed = (performance.now() - renderStartPerfRef.current) / 1000;
      console.error('Rendering error:', err);
      const errMsg = err.message || 'Failed to render video sequence';
      setErrorMessage(errMsg);

      setRenderHistory((prev) => {
        const next = prev.map((item) =>
          item.id === renderId
            ? {
                ...item,
                status: 'failed' as const,
                elapsedSeconds: finalElapsed,
                errorText: errMsg,
              }
            : item
        );
        saveRenderHistory(next);
        return next;
      });
    } finally {
      setIsRendering(false);
    }
  };

  const handleDownloadActive = () => {
    if (!videoBlobUrl) return;
    const activeItem = renderHistory.find((h) => h.id === activeHistoryId);
    const a = document.createElement('a');
    a.href = videoBlobUrl;
    a.download =
      activeItem?.fileName || `${project.title.replace(/\s+/g, '_')}_vickyAI_Master.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleClearHistory = () => {
    setRenderHistory((prev) => {
      const activeOnly = prev.filter((item) => item.status === 'rendering');
      saveRenderHistory(activeOnly);
      return activeOnly;
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center">
              <Video className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">vicky.AI Video Render Studio</h3>
              <p className="text-xs text-slate-400">
                In-browser composite rendering with real-time camera motion, LUT grading, Canva titles & audio
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close render studio"
            className="p-1 rounded text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Active Render / Video Preview Section */}
          {videoBlobUrl && !isRendering ? (
            <div className="space-y-4">
              <div className="rounded-lg overflow-hidden border border-slate-800 bg-black aspect-video flex items-center justify-center">
                <video
                  src={videoBlobUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950 p-3.5 rounded-lg border border-slate-800 text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                      <Check className="w-4 h-4" />
                      Render Complete ({renderMode === 'preview' ? 'Showcase Reel ~10s' : 'Full Timeline Master'})
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className="font-mono text-amber-300 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {formatElapsed(liveElapsedSec)}
                    </span>
                  </div>
                  <span className="text-slate-400 text-[11px] block">
                    {project.shots.length} shots stitched · Camera motions, LUT grade & subtitles burned in
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleStartRender('preview')}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded transition-colors flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Render Fast Reel</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStartRender('full')}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded transition-colors flex items-center gap-1"
                  >
                    <Film className="w-3.5 h-3.5 text-amber-400" />
                    <span>Render Full Master</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadActive}
                    className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-semibold rounded transition-colors flex items-center gap-1.5 shadow-md"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download (.webm)</span>
                  </button>
                </div>
              </div>
            </div>
          ) : isRendering ? (
            <div className="py-6 px-4 bg-slate-950 border border-slate-800 rounded-lg space-y-5 text-center">
              <div className="w-12 h-12 rounded-full bg-amber-400/10 border border-amber-400/40 text-amber-400 flex items-center justify-center mx-auto animate-pulse">
                <Film className="w-6 h-6" />
              </div>

              <div className="space-y-1.5 max-w-md mx-auto">
                <div className="flex items-center justify-center gap-2 text-xs font-mono text-amber-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Elapsed Time: {formatElapsed(liveElapsedSec)}</span>
                </div>
                <h4 className="text-base font-semibold text-slate-100">
                  Synthesizing & Encoding Production Video...
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed font-mono">
                  {progressData.statusText}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="max-w-md mx-auto space-y-1.5">
                <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-amber-400 transition-all duration-150"
                    style={{ width: `${progressData.progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <span>
                    Shot {progressData.currentShotIndex + 1} of {project.shots.length}
                  </span>
                  <span className="text-amber-400 font-semibold">{progressData.progress}%</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 max-w-md mx-auto text-[11px] text-slate-400 pt-3 border-t border-slate-800/80">
                <span>Camera Motion Baked</span>
                <span>LUT Grade Blended</span>
                <span>Soundscape Encoded</span>
              </div>
            </div>
          ) : errorMessage ? (
            <div className="py-6 text-center bg-slate-950 border border-rose-900/50 rounded-lg space-y-3">
              <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
              <p className="text-xs text-rose-300">{errorMessage}</p>
              <button
                type="button"
                onClick={() => handleStartRender(renderMode)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-white rounded"
              >
                Retry Render
              </button>
            </div>
          ) : (
            <div className="py-6 text-center bg-slate-950 border border-slate-800 rounded-lg space-y-4">
              <div className="flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => handleStartRender('preview')}
                  className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-semibold rounded shadow-md"
                >
                  Quick Showcase Reel (~10s)
                </button>
                <button
                  type="button"
                  onClick={() => handleStartRender('full')}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded border border-slate-700"
                >
                  Full Timeline Master (~20s)
                </button>
              </div>
            </div>
          )}

          {/* Render History Section */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-amber-400" />
                <h4 className="text-sm font-semibold text-white">
                  Render History ({renderHistory.length})
                </h4>
              </div>

              {renderHistory.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearHistory}
                  className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear History</span>
                </button>
              )}
            </div>

            {renderHistory.length === 0 ? (
              <div className="p-6 text-center bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-500">
                No previous video renders recorded yet. Start a Showcase Reel or Full Master render above.
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {renderHistory.map((item) => {
                  const isCurrentPreview = item.blobUrl && item.blobUrl === videoBlobUrl;
                  return (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                        isCurrentPreview
                          ? 'bg-slate-950 border-amber-400/60'
                          : 'bg-slate-950/70 border-slate-800'
                      }`}
                    >
                      <div className="space-y-1 text-xs">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-slate-100">
                            {item.projectTitle}
                          </span>
                          <span className="text-slate-600">·</span>
                          <span className="text-slate-300 font-mono">
                            {item.mode === 'preview' ? 'Showcase Reel (~10s)' : 'Full Master (~20s)'}
                          </span>
                          <span className="text-slate-600">·</span>
                          {/* Clean Unboxed Status Text */}
                          <span
                            className={`font-mono font-semibold uppercase ${
                              item.status === 'completed'
                                ? 'text-emerald-400'
                                : item.status === 'rendering'
                                ? 'text-amber-400 animate-pulse'
                                : 'text-rose-400'
                            }`}
                          >
                            {item.status === 'completed'
                              ? 'COMPLETED'
                              : item.status === 'rendering'
                              ? 'RENDERING...'
                              : 'FAILED'}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-400">
                          <span className="flex items-center gap-1 text-amber-300">
                            <Clock className="w-3 h-3" />
                            Elapsed: {formatElapsed(item.elapsedSeconds)}
                          </span>
                          <span>·</span>
                          <span>{item.shotsCount} shots</span>
                          <span>·</span>
                          <span>{item.aspectRatio}</span>
                          {item.fileSizeKb && (
                            <>
                              <span>·</span>
                              <span>{item.fileSizeKb.toLocaleString()} KB</span>
                            </>
                          )}
                          <span>·</span>
                          <span>{item.createdAt}</span>
                        </div>
                      </div>

                      {/* Actions: Preview & Download Link */}
                      <div className="flex items-center gap-2 shrink-0">
                        {item.status === 'completed' && item.blobUrl ? (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setVideoBlobUrl(item.blobUrl!);
                                setActiveHistoryId(item.id);
                              }}
                              className={`px-2.5 py-1.5 rounded text-xs font-medium flex items-center gap-1 transition-colors ${
                                isCurrentPreview
                                  ? 'bg-amber-400/20 border border-amber-400/50 text-amber-300'
                                  : 'bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200'
                              }`}
                            >
                              <Play className="w-3 h-3 fill-current" />
                              <span>{isCurrentPreview ? 'Playing' : 'Preview'}</span>
                            </button>

                            <a
                              href={item.blobUrl}
                              download={item.fileName}
                              className="px-3 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold flex items-center gap-1 transition-colors"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download</span>
                            </a>
                          </>
                        ) : item.status === 'completed' && !item.blobUrl ? (
                          <button
                            type="button"
                            onClick={() => handleStartRender(item.mode)}
                            disabled={isRendering}
                            className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs flex items-center gap-1 transition-colors"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Re-Generate File</span>
                          </button>
                        ) : item.status === 'failed' ? (
                          <button
                            type="button"
                            onClick={() => handleStartRender(item.mode)}
                            disabled={isRendering}
                            className="px-3 py-1.5 rounded bg-rose-950/60 hover:bg-rose-900/60 border border-rose-800 text-rose-200 text-xs flex items-center gap-1 transition-colors"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Retry</span>
                          </button>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
