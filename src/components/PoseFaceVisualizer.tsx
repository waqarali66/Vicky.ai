import React, { useState, useRef, useEffect } from 'react';
import { ScanFace, Activity, Eye, EyeOff } from 'lucide-react';
import { BodyPostureType } from '../types/producer';

interface PoseFaceVisualizerProps {
  imageUrl: string;
  facePreserveEnabled?: boolean;
  bodyPosture?: BodyPostureType;
  strength?: number;
}

export const PoseFaceVisualizer: React.FC<PoseFaceVisualizerProps> = ({
  imageUrl,
  facePreserveEnabled = true,
  bodyPosture = 'Heroic Standing',
  strength = 0.92,
}) => {
  const [showMesh, setShowMesh] = useState<boolean>(true);
  const [showSkeleton, setShowSkeleton] = useState<boolean>(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;

    img.onload = () => {
      canvas.width = 400;
      canvas.height = 400;

      // Draw base image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Dark subtle vignette for HUD contrast
      ctx.fillStyle = 'rgba(2, 6, 23, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 1. Draw Simulated Face Landmarks (68-point mesh around face center)
      if (showMesh && facePreserveEnabled) {
        ctx.strokeStyle = '#10B981'; // Emerald
        ctx.fillStyle = '#34D399';
        ctx.lineWidth = 1.2;

        const centerX = canvas.width * 0.5;
        const centerY = canvas.height * 0.38;
        const faceRadius = 45;

        // Jawline arc
        ctx.beginPath();
        for (let a = 0; a <= Math.PI; a += Math.PI / 10) {
          const x = centerX + Math.cos(a) * faceRadius;
          const y = centerY + Math.sin(a) * (faceRadius * 1.25);
          if (a === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Eye landmarks
        const leftEye = { x: centerX - 18, y: centerY - 6 };
        const rightEye = { x: centerX + 18, y: centerY - 6 };

        [leftEye, rightEye].forEach((eye) => {
          ctx.beginPath();
          ctx.arc(eye.x, eye.y, 4, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fill();
        });

        // Nose line
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - 6);
        ctx.lineTo(centerX, centerY + 14);
        ctx.lineTo(centerX - 6, centerY + 18);
        ctx.lineTo(centerX + 6, centerY + 18);
        ctx.stroke();

        // Mouth loop
        ctx.beginPath();
        ctx.ellipse(centerX, centerY + 30, 14, 5, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Mesh connection rays
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
        ctx.beginPath();
        ctx.moveTo(leftEye.x, leftEye.y);
        ctx.lineTo(centerX, centerY + 14);
        ctx.lineTo(rightEye.x, rightEye.y);
        ctx.moveTo(centerX, centerY + 30);
        ctx.lineTo(centerX, centerY + 14);
        ctx.stroke();
      }

      // 2. Draw OpenPose Skeleton Lines
      if (showSkeleton) {
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#38BDF8'; // Sky blue
        ctx.fillStyle = '#0284C7';

        const head = { x: canvas.width * 0.5, y: canvas.height * 0.48 };
        const neck = { x: canvas.width * 0.5, y: canvas.height * 0.58 };
        const leftShoulder = { x: canvas.width * 0.36, y: canvas.height * 0.62 };
        const rightShoulder = { x: canvas.width * 0.64, y: canvas.height * 0.62 };
        const pelvis = { x: canvas.width * 0.5, y: canvas.height * 0.88 };

        // Posture variation
        let leftElbow = { x: canvas.width * 0.28, y: canvas.height * 0.8 };
        let rightElbow = { x: canvas.width * 0.72, y: canvas.height * 0.8 };

        if (bodyPosture === 'Dynamic Sprint') {
          leftElbow = { x: canvas.width * 0.22, y: canvas.height * 0.55 };
          rightElbow = { x: canvas.width * 0.78, y: canvas.height * 0.88 };
        } else if (bodyPosture === 'Low Combat Stance') {
          leftElbow = { x: canvas.width * 0.32, y: canvas.height * 0.7 };
          rightElbow = { x: canvas.width * 0.68, y: canvas.height * 0.7 };
        }

        // Spine
        ctx.beginPath();
        ctx.moveTo(head.x, head.y);
        ctx.lineTo(neck.x, neck.y);
        ctx.lineTo(pelvis.x, pelvis.y);
        ctx.stroke();

        // Shoulders
        ctx.beginPath();
        ctx.moveTo(leftShoulder.x, leftShoulder.y);
        ctx.lineTo(neck.x, neck.y);
        ctx.lineTo(rightShoulder.x, rightShoulder.y);
        ctx.stroke();

        // Arms
        ctx.beginPath();
        ctx.moveTo(leftShoulder.x, leftShoulder.y);
        ctx.lineTo(leftElbow.x, leftElbow.y);
        ctx.moveTo(rightShoulder.x, rightShoulder.y);
        ctx.lineTo(rightElbow.x, rightElbow.y);
        ctx.stroke();

        // Joint dots
        [head, neck, leftShoulder, rightShoulder, leftElbow, rightElbow, pelvis].forEach((j) => {
          ctx.beginPath();
          ctx.arc(j.x, j.y, 4, 0, Math.PI * 2);
          ctx.fillStyle = '#F59E0B';
          ctx.fill();
          ctx.stroke();
        });
      }
    };
  }, [imageUrl, showMesh, showSkeleton, facePreserveEnabled, bodyPosture, strength]);

  return (
    <div className="space-y-2">
      <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-black aspect-square max-w-[280px] mx-auto shadow-inner">
        <canvas ref={canvasRef} className="w-full h-full object-cover" />

        {/* HUD Indicator */}
        <div className="absolute top-2 left-2 bg-black/75 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono text-emerald-300 border border-emerald-500/40">
          FaceID: {facePreserveEnabled ? `${Math.round(strength * 100)}% Locked` : 'Off'}
        </div>

        <div className="absolute top-2 right-2 bg-black/75 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono text-sky-300 border border-sky-500/40 truncate max-w-[130px]">
          {bodyPosture}
        </div>
      </div>

      {/* Visualizer Toggles */}
      <div className="flex items-center justify-center gap-3 text-[11px] text-slate-400">
        <button
          type="button"
          onClick={() => setShowMesh(!showMesh)}
          className={`px-2 py-1 rounded border transition-colors flex items-center gap-1 ${
            showMesh ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-500'
          }`}
        >
          <ScanFace className="w-3 h-3" />
          <span>Face Mesh</span>
        </button>

        <button
          type="button"
          onClick={() => setShowSkeleton(!showSkeleton)}
          className={`px-2 py-1 rounded border transition-colors flex items-center gap-1 ${
            showSkeleton ? 'bg-sky-950/60 border-sky-500/50 text-sky-300' : 'bg-slate-900 border-slate-800 text-slate-500'
          }`}
        >
          <Activity className="w-3 h-3" />
          <span>OpenPose Skeleton</span>
        </button>
      </div>
    </div>
  );
};
