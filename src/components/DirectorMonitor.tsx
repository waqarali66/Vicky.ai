import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Video,
} from 'lucide-react';
import { ProductionProject, ShotItem } from '../types/producer';
import { audioDirector } from '../services/audioSynthesizer';
import { RealtimeVideoPlayer } from './RealtimeVideoPlayer';

interface DirectorMonitorProps {
  project: ProductionProject;
  activeShotIndex: number;
  onSelectShot: (index: number) => void;
  onEditShot: (shot: ShotItem) => void;
  onOpenRenderModal?: () => void;
  onVideoBlobGenerated?: (blobUrl: string) => void;
}

export const DirectorMonitor: React.FC<DirectorMonitorProps> = ({
  project,
  activeShotIndex,
  onSelectShot,
  onEditShot,
  onOpenRenderModal,
  onVideoBlobGenerated,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(true);
  const [activeLut, setActiveLut] = useState<'applied' | 'flat_log' | 'high_contrast'>('applied');
  const animationFrameRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(0);

  const shots = project.shots;
  const currentShot = shots[activeShotIndex] || shots[0];

  // Calculate cumulative shot start times
  const shotTimings = React.useMemo(() => {
    let acc = 0;
    return shots.map((s) => {
      const start = acc;
      acc += s.durationSec;
      return { start, end: acc, duration: s.durationSec };
    });
  }, [shots]);

  const totalDuration = shotTimings.length > 0 ? shotTimings[shotTimings.length - 1].end : 20;
  const activeTiming = shotTimings[activeShotIndex] || {
    start: 0,
    end: currentShot?.durationSec || 5,
    duration: currentShot?.durationSec || 5,
  };

  // Sync active shot with time
  useEffect(() => {
    const idx = shotTimings.findIndex((t) => currentTime >= t.start && currentTime < t.end);
    if (idx !== -1 && idx !== activeShotIndex) {
      onSelectShot(idx);
    }
  }, [currentTime, shotTimings, activeShotIndex, onSelectShot]);

  // Audio trigger on shot change during playback
  useEffect(() => {
    if (isPlaying && isAudioEnabled && currentShot) {
      audioDirector.playCinematicCue(project.style);
      if (currentShot.voiceover) {
        audioDirector.speakVoiceover(currentShot.voiceover);
      }
    }
  }, [activeShotIndex, isPlaying, isAudioEnabled, project.style]);

  // Playback timer
  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      audioDirector.stopAll();
      return;
    }

    lastTickRef.current = performance.now();

    const loop = (time: number) => {
      const delta = (time - lastTickRef.current) / 1000;
      lastTickRef.current = time;

      setCurrentTime((prev) => {
        const next = prev + delta;
        if (next >= totalDuration) {
          setIsPlaying(false);
          audioDirector.stopAll();
          return 0;
        }
        return next;
      });

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying, totalDuration]);

  const handleTogglePlay = () => {
    if (!isPlaying && currentTime >= totalDuration - 0.5) {
      setCurrentTime(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (newTime: number) => {
    setCurrentTime(newTime);
    const idx = shotTimings.findIndex((t) => newTime >= t.start && newTime < t.end);
    if (idx !== -1 && idx !== activeShotIndex) {
      onSelectShot(idx);
    }
  };

  const formatTimecode = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    const f = Math.floor((sec % 1) * 24);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}:${String(f).padStart(2, '0')}`;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden flex flex-col">
      {/* Monitor Header with Metadata */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-slate-950/80 border-b border-slate-800/80 text-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="font-mono tabular-nums text-amber-400 font-semibold text-sm">
            {formatTimecode(currentTime)}
          </span>
          <span className="text-slate-600">/</span>
          <span className="font-mono tabular-nums text-slate-400 text-xs">
            {formatTimecode(totalDuration)}
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-300 font-medium">
            Shot {activeShotIndex + 1} of {shots.length}
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-400">{currentShot.shotType}</span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-400 font-mono">{currentShot.lensMm}</span>
        </div>

        {/* LUT Selector & Audio switch */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded border border-slate-800 text-[11px]">
            <button
              type="button"
              onClick={() => setActiveLut('applied')}
              className={`px-2 py-0.5 rounded transition-colors ${
                activeLut === 'applied'
                  ? 'bg-amber-400 text-slate-950 font-medium'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Vicky.AI autonomous color grade"
            >
              LUT Active
            </button>
            <button
              type="button"
              onClick={() => setActiveLut('flat_log')}
              className={`px-2 py-0.5 rounded transition-colors ${
                activeLut === 'flat_log'
                  ? 'bg-slate-800 text-white font-medium'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Raw Flat Sensor Log"
            >
              Flat Log
            </button>
            <button
              type="button"
              onClick={() => setActiveLut('high_contrast')}
              className={`px-2 py-0.5 rounded transition-colors ${
                activeLut === 'high_contrast'
                  ? 'bg-slate-800 text-white font-medium'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="High Contrast Cinema Grade"
            >
              Hi-Con
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsAudioEnabled(!isAudioEnabled)}
            className={`p-1.5 rounded transition-colors ${
              isAudioEnabled
                ? 'text-amber-400 hover:text-amber-300'
                : 'text-slate-500 hover:text-slate-400'
            }`}
            title={isAudioEnabled ? 'Audio synthesis ON' : 'Audio muted'}
          >
            {isAudioEnabled ? (
              <Volume2 className="w-3.5 h-3.5" />
            ) : (
              <VolumeX className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Real-Time Video Player Viewport (Replaces Static Placeholder Thumbnails) */}
      <div className="relative bg-black flex items-center justify-center min-h-[360px] sm:min-h-[420px] overflow-hidden select-none">
        <div
          className="relative w-full max-w-full overflow-hidden flex items-center justify-center"
          style={{
            aspectRatio:
              project.aspectRatio === '2.39:1'
                ? '2.39/1'
                : project.aspectRatio === '9:16'
                ? '9/16'
                : '16/9',
            maxHeight: '440px',
          }}
        >
          <RealtimeVideoPlayer
            project={project}
            currentShot={currentShot}
            activeShotIndex={activeShotIndex}
            currentTime={currentTime}
            shotStartTime={activeTiming.start}
            shotDuration={activeTiming.duration}
            totalDuration={totalDuration}
            isPlaying={isPlaying}
            isAudioEnabled={isAudioEnabled}
            activeLut={activeLut}
            onSeek={handleSeek}
            onPlaybackEnded={() => {
              setIsPlaying(false);
              audioDirector.stopAll();
            }}
            onVideoBlobGenerated={onVideoBlobGenerated}
          />
        </div>
      </div>

      {/* Scrub Bar & Controls */}
      <div className="p-4 bg-slate-950/90 border-t border-slate-800 space-y-3">
        {/* Timeline Scrubber */}
        <div className="space-y-1">
          <div className="relative h-2 bg-slate-800 rounded-full cursor-pointer overflow-hidden group">
            {/* Shot demarcation lines */}
            {shotTimings.map((t, idx) => (
              <div
                key={idx}
                className="absolute top-0 bottom-0 border-r border-slate-700/80 z-10"
                style={{ left: `${(t.end / totalDuration) * 100}%` }}
              />
            ))}
            {/* Progress Bar */}
            <div
              className="absolute top-0 bottom-0 left-0 bg-amber-400 transition-all duration-75"
              style={{ width: `${(currentTime / totalDuration) * 100}%` }}
            />
            {/* Invisible Slider Input for Dragging */}
            <input
              type="range"
              min={0}
              max={totalDuration}
              step={0.1}
              value={currentTime}
              onChange={(e) => handleSeek(parseFloat(e.target.value))}
              aria-label="Timeline scrubber"
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
          </div>

          {/* Shot Markers Row */}
          <div className="flex justify-between text-[11px] text-slate-400 pt-0.5">
            {shots.map((shot, idx) => {
              const timing = shotTimings[idx];
              const isCurrent = idx === activeShotIndex;
              return (
                <button
                  key={shot.id}
                  type="button"
                  onClick={() => {
                    if (timing) handleSeek(timing.start);
                  }}
                  className={`text-left truncate max-w-[120px] transition-colors ${
                    isCurrent ? 'text-amber-400 font-semibold' : 'hover:text-slate-200'
                  }`}
                >
                  {shot.shotNumber}. {shot.title}
                </button>
              );
            })}
          </div>
        </div>

        {/* Playback Buttons & Shot Quick-jump */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (activeShotIndex > 0) {
                  const prevIdx = activeShotIndex - 1;
                  onSelectShot(prevIdx);
                  handleSeek(shotTimings[prevIdx].start);
                }
              }}
              disabled={activeShotIndex === 0}
              className="p-1.5 rounded text-slate-400 hover:text-white disabled:opacity-40 transition-colors"
              title="Previous Shot"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleTogglePlay}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 transition-colors shadow-sm"
              title={isPlaying ? 'Pause' : 'Play Sequence'}
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
                if (activeShotIndex < shots.length - 1) {
                  const nextIdx = activeShotIndex + 1;
                  onSelectShot(nextIdx);
                  handleSeek(shotTimings[nextIdx].start);
                }
              }}
              disabled={activeShotIndex === shots.length - 1}
              className="p-1.5 rounded text-slate-400 hover:text-white disabled:opacity-40 transition-colors"
              title="Next Shot"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => handleSeek(0)}
              className="p-1.5 rounded text-slate-400 hover:text-white transition-colors"
              title="Reset to 00:00:00"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Current Shot Action & Details */}
          <div className="flex items-center gap-2.5">
            <div className="text-xs text-slate-400 hidden sm:flex items-center gap-2">
              <span>Transition:</span>
              <span className="text-slate-200 font-medium">{currentShot.transition}</span>
            </div>

            <button
              type="button"
              onClick={() => onEditShot(currentShot)}
              className="text-xs px-2.5 py-1 text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded transition-colors"
            >
              Inspect Specs
            </button>

            {onOpenRenderModal && (
              <button
                type="button"
                onClick={onOpenRenderModal}
                className="text-xs px-3 py-1 font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Render Video</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
