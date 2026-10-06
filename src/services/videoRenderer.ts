import { ProductionProject } from '../types/producer';

export interface RenderProgress {
  progress: number; // 0 to 100
  currentShotIndex: number;
  statusText: string;
}

export interface RenderOptions {
  mode?: 'preview' | 'full'; // preview: ~2.5s per shot (~10s total), full: exact timeline duration
}

export async function renderProjectToVideo(
  project: ProductionProject,
  onProgress?: (p: RenderProgress) => void,
  options?: RenderOptions
): Promise<Blob> {
  return new Promise(async (resolve, reject) => {
    try {
      const mode = options?.mode || 'preview';
      const canvas = document.createElement('canvas');
      canvas.width = 1280;
      canvas.height = 720;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Canvas 2D context not supported on this browser');
      }

      // Preload shot images with a 2500ms timeout guard
      const images: (HTMLImageElement | null)[] = [];
      for (let i = 0; i < project.shots.length; i++) {
        const shot = project.shots[i];
        if (shot.imagePreviewUrl) {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = shot.imagePreviewUrl;
          await new Promise((res) => {
            const timeout = window.setTimeout(() => res(false), 2500);
            img.onload = () => {
              window.clearTimeout(timeout);
              res(true);
            };
            img.onerror = () => {
              window.clearTimeout(timeout);
              res(false);
            };
          });
          images.push(img);
        } else {
          images.push(null);
        }
      }

      // Audio setup using AudioContext & MediaStreamDestination
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtxClass();
      const dest = audioCtx.createMediaStreamDestination();

      // Master output gain
      const masterGain = audioCtx.createGain();
      masterGain.gain.setValueAtTime(0.25, audioCtx.currentTime);
      masterGain.connect(dest);

      // Lowpass cinematic filter
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(project.style.includes('cyber') ? 1200 : 650, audioCtx.currentTime);
      filter.connect(masterGain);

      // Setup Canvas stream
      const fps = 18; // 18 FPS optimal balance for browser Canvas captureStream
      const frameIntervalMs = Math.floor(1000 / fps);
      const canvasStream = canvas.captureStream(fps);

      // Combine video track and audio track
      const combinedStream = new MediaStream([
        ...canvasStream.getVideoTracks(),
        ...dest.stream.getAudioTracks(),
      ]);

      let mimeType = 'video/webm;codecs=vp9,opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm';
      }

      const recorder = new MediaRecorder(combinedStream, {
        mimeType,
        videoBitsPerSecond: 4000000,
      });

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        audioCtx.close();
        const finalBlob = new Blob(chunks, { type: mimeType });
        resolve(finalBlob);
      };

      recorder.start(1000);

      const totalShots = project.shots.length;

      // Determine duration per shot
      // preview mode: 2.5s per shot (crisp 10s reel); full mode: actual durationSec
      const shotDurations = project.shots.map((s) => (mode === 'preview' ? 2.5 : Math.max(3, s.durationSec)));
      const totalFrames = shotDurations.reduce((acc, d) => acc + Math.round(d * fps), 0);

      let globalFrame = 0;

      for (let sIdx = 0; sIdx < totalShots; sIdx++) {
        const shot = project.shots[sIdx];
        const shotDurationSec = shotDurations[sIdx];
        const shotDurationFrames = Math.round(shotDurationSec * fps);
        const img = images[sIdx];
        const overlay = project.connectors?.canva?.overlays?.[sIdx];

        // Synthesize shot musical chords
        const now = audioCtx.currentTime;
        const chordBase = project.style.includes('3d')
          ? [130.81, 164.81, 196.00] // C major
          : project.style.includes('cyber')
          ? [55.00, 110.00, 138.59] // A minor
          : [65.41 + sIdx * 5, 98.00 + sIdx * 7, 130.81 + sIdx * 10]; // evolving cinematic C minor

        const oscillators: OscillatorNode[] = [];
        chordBase.forEach((freq) => {
          const osc = audioCtx.createOscillator();
          osc.type = project.style.includes('cyber') ? 'sawtooth' : 'triangle';
          osc.frequency.setValueAtTime(freq, now);
          osc.connect(filter);
          osc.start(now);
          osc.stop(now + shotDurationSec + 0.3);
          oscillators.push(osc);
        });

        for (let f = 0; f < shotDurationFrames; f++) {
          const shotProgress = f / shotDurationFrames;
          globalFrame++;

          // 1. Base Canvas Background
          ctx.fillStyle = project.autonomousDecisions?.colorPalette?.primary || '#0B192C';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // 2. Draw Image with Cinematic Camera Motion
          if (img) {
            ctx.save();
            let scale = 1.0;
            let transX = 0;
            let transY = 0;

            if (shot.cameraMotion?.includes('Push') || shot.cameraMotion?.includes('In')) {
              scale = 1.0 + shotProgress * 0.12;
            } else if (shot.cameraMotion?.includes('Track') || shot.cameraMotion?.includes('Right')) {
              scale = 1.04;
              transX = -shotProgress * 35;
            } else if (shot.cameraMotion?.includes('Crane') || shot.cameraMotion?.includes('Down')) {
              scale = 1.05;
              transY = -shotProgress * 25;
            } else {
              scale = 1.02 + shotProgress * 0.05;
            }

            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.scale(scale, scale);
            ctx.translate(-canvas.width / 2 + transX, -canvas.height / 2 + transY);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            ctx.restore();
          } else {
            // Generative gradient placeholder if no image
            ctx.save();
            const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            grad.addColorStop(0, project.autonomousDecisions?.colorPalette?.primary || '#0F172A');
            grad.addColorStop(1, project.autonomousDecisions?.colorPalette?.secondary || '#1E293B');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 28px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(shot.title, canvas.width / 2, canvas.height / 2 - 20);
            ctx.restore();
          }

          // 3. Cinematic Color Grade Tint Overlay
          ctx.save();
          ctx.globalCompositeOperation = 'overlay';
          ctx.fillStyle = project.autonomousDecisions?.colorPalette?.accent || '#FF6500';
          ctx.globalAlpha = 0.12;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.restore();

          // 4. Letterbox Vignette
          ctx.save();
          const vignette = ctx.createLinearGradient(0, 0, 0, canvas.height);
          vignette.addColorStop(0, 'rgba(0,0,0,0.65)');
          vignette.addColorStop(0.12, 'rgba(0,0,0,0)');
          vignette.addColorStop(0.88, 'rgba(0,0,0,0)');
          vignette.addColorStop(1, 'rgba(0,0,0,0.75)');
          ctx.fillStyle = vignette;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.restore();

          // 5. Director HUD Overlay
          ctx.save();
          ctx.font = '13px monospace';
          ctx.fillStyle = '#F59E0B';
          ctx.fillText(`vicky.AI · Shot ${shot.shotNumber}/${totalShots} · ${shot.lensMm}`, 35, 42);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.font = '11px sans-serif';
          ctx.fillText(shot.cameraMotion, 35, 60);
          ctx.restore();

          // 6. Canva Animated Graphic Title
          if (overlay && f > 10 && f < shotDurationFrames - 10) {
            ctx.save();
            ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
            ctx.fillRect(35, canvas.height - 115, 460, 42);
            ctx.fillStyle = '#F8FAFC';
            ctx.font = 'bold 15px sans-serif';
            ctx.fillText(overlay.text, 50, canvas.height - 89);
            ctx.fillStyle = '#38BDF8';
            ctx.font = '11px monospace';
            ctx.fillText(overlay.layout, 50, canvas.height - 76);
            ctx.restore();
          }

          // 7. Dialogue Subtitles
          if (shot.voiceover) {
            ctx.save();
            ctx.font = 'bold 17px sans-serif';
            ctx.textAlign = 'center';
            const subtitleText = `"${shot.voiceover}"`;
            const textWidth = ctx.measureText(subtitleText).width;

            ctx.fillStyle = 'rgba(0, 0, 0, 0.78)';
            ctx.fillRect(canvas.width / 2 - textWidth / 2 - 16, canvas.height - 58, textWidth + 32, 32);

            ctx.fillStyle = '#FFFFFF';
            ctx.fillText(subtitleText, canvas.width / 2, canvas.height - 36);
            ctx.restore();
          }

          // Paced Frame Timing for Real-Time MediaRecorder Sync
          if (f % 3 === 0 && onProgress) {
            const pct = Math.min(99, Math.round((globalFrame / totalFrames) * 100));
            onProgress({
              progress: pct,
              currentShotIndex: sIdx,
              statusText: `Encoding Shot ${shot.shotNumber} (${f + 1}/${shotDurationFrames} frames) · ${shot.title}`,
            });
          }

          // Frame interval pause so MediaRecorder records at 1x real-time speed!
          await new Promise((r) => setTimeout(r, frameIntervalMs));
        }
      }

      if (onProgress) {
        onProgress({
          progress: 100,
          currentShotIndex: totalShots - 1,
          statusText: 'Finalizing Video Encoding & Container Packaging...',
        });
      }

      // Finish recording cleanly
      setTimeout(() => {
        recorder.stop();
      }, 400);
    } catch (err) {
      reject(err);
    }
  });
}
