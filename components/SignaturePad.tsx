'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Draw-to-sign pad — works with mouse, finger and stylus.
 * Calls onChange with a PNG blob after each stroke (or null when cleared).
 */
export default function SignaturePad({
  onChange,
}: {
  onChange: (blob: Blob | null) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [hasInk, setHasInk] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const scale = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * scale;
    canvas.height = rect.height * scale;
    const ctx = canvas.getContext('2d')!;
    ctx.scale(scale, scale);
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#2B2453';
  }, []);

  function pos(e: React.PointerEvent) {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function start(e: React.PointerEvent) {
    e.preventDefault();
    const ctx = canvasRef.current!.getContext('2d')!;
    drawing.current = true;
    canvasRef.current!.setPointerCapture(e.pointerId);
    const { x, y } = pos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    // dot for a tap
    ctx.lineTo(x + 0.1, y + 0.1);
    ctx.stroke();
    setHasInk(true);
  }

  function move(e: React.PointerEvent) {
    if (!drawing.current) return;
    e.preventDefault();
    const ctx = canvasRef.current!.getContext('2d')!;
    const { x, y } = pos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function end() {
    if (!drawing.current) return;
    drawing.current = false;
    canvasRef.current!.toBlob((blob) => onChange(blob), 'image/png');
  }

  function clear() {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    setHasInk(false);
    onChange(null);
  }

  return (
    <div>
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="h-40 w-full touch-none rounded-2xl border-2 border-dashed border-indigo/25 bg-white cursor-crosshair"
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerLeave={end}
          aria-label="Signature area — draw your signature"
        />
        {!hasInk && (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center font-display font-bold text-ink/25">
            ✍️ Sign here with your finger or mouse
          </span>
        )}
      </div>
      <div className="mt-2 flex justify-end">
        <button type="button" onClick={clear} className="text-sm font-bold text-ink/45 hover:text-pink">
          Clear & try again
        </button>
      </div>
    </div>
  );
}
