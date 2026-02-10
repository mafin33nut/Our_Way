import { useEffect, useRef } from 'react';

type Palette = {
  a: string;
  b: string;
  c: string;
  d: string;
};

type HybridDynamicBackgroundProps = {
  className?: string;
  opacity?: number;
  speed?: number;
  palette?: Palette;
};

const DEFAULT_PALETTE: Palette = {
  a: '#2dd4bf',
  b: '#22d3ee',
  c: '#8b5cf6',
  d: '#d946ef',
};

type Blob = {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  color: string;
  phase: number;
};

type Particle = {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  alpha: number;
  phase: number;
};

export function HybridDynamicBackground({
  className = '',
  opacity = 0.72,
  speed = 1.15,
  palette = DEFAULT_PALETTE,
}: HybridDynamicBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frameId = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let running = true;
    let last = performance.now();

    const blobs: Blob[] = [];
    const particles: Particle[] = [];

    const colors = [palette.a, palette.b, palette.c, palette.d];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const createScene = () => {
      blobs.length = 0;
      particles.length = 0;

      const blobCount = width < 640 ? 5 : 8;
      const particleCount = width < 640 ? 110 : 180;

      for (let i = 0; i < blobCount; i += 1) {
        const r = Math.max(width, height) * (0.15 + Math.random() * 0.16);
        blobs.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r,
          vx: (Math.random() - 0.5) * 0.13 * speed,
          vy: (Math.random() - 0.5) * 0.13 * speed,
          color: colors[i % colors.length],
          phase: Math.random() * Math.PI * 2,
        });
      }

      for (let i = 0; i < particleCount; i += 1) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: 0.9 + Math.random() * 2.8,
          vx: (Math.random() - 0.5) * 0.18 * speed,
          vy: (Math.random() - 0.5) * 0.18 * speed,
          alpha: 0.22 + Math.random() * 0.32,
          phase: Math.random() * Math.PI * 2,
        });
      }
    };

    const drawBlob = (blob: Blob, t: number) => {
      const wobble = 1 + 0.12 * Math.sin(t * 0.0016 + blob.phase);
      const rr = blob.r * wobble;
      const g = ctx.createRadialGradient(blob.x, blob.y, 0, blob.x, blob.y, rr);
      g.addColorStop(0, `${blob.color}a0`);
      g.addColorStop(0.42, `${blob.color}42`);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(blob.x, blob.y, rr, 0, Math.PI * 2);
      ctx.fill();
    };

    const tick = (now: number) => {
      if (!running) return;
      const dt = Math.min(40, now - last);
      last = now;

      // Deep dark base.
      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, width, height);
      const base = ctx.createLinearGradient(0, 0, width, height);
      base.addColorStop(0, '#020617');
      base.addColorStop(0.55, '#0b1120');
      base.addColorStop(1, '#111827');
      ctx.fillStyle = base;
      ctx.fillRect(0, 0, width, height);

      // Soft shader-like blobs.
      ctx.globalCompositeOperation = 'lighter';
      for (const blob of blobs) {
        blob.x += blob.vx * dt;
        blob.y += blob.vy * dt;

        if (blob.x < -blob.r) blob.x = width + blob.r;
        if (blob.x > width + blob.r) blob.x = -blob.r;
        if (blob.y < -blob.r) blob.y = height + blob.r;
        if (blob.y > height + blob.r) blob.y = -blob.r;

        drawBlob(blob, now);
      }

      // Particle field.
      ctx.globalCompositeOperation = 'screen';
      for (const p of particles) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.x < -4) p.x = width + 4;
        if (p.x > width + 4) p.x = -4;
        if (p.y < -4) p.y = height + 4;
        if (p.y > height + 4) p.y = -4;

        const twinkle = 0.65 + 0.55 * Math.sin(now * 0.003 + p.phase);
        const alpha = Math.min(0.95, p.alpha * twinkle);

        ctx.fillStyle = `rgba(226,232,240,${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();

        // Soft glow ring to make particles clearly visible.
        ctx.fillStyle = `rgba(148,163,184,${alpha * 0.35})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 2.1, 0, Math.PI * 2);
        ctx.fill();
      }

      // Very subtle moving vignette.
      ctx.globalCompositeOperation = 'multiply';
      const v = ctx.createRadialGradient(
        width * (0.5 + 0.06 * Math.sin(now * 0.0002)),
        height * (0.5 + 0.06 * Math.cos(now * 0.00018)),
        Math.min(width, height) * 0.25,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.85,
      );
      v.addColorStop(0, 'rgba(0,0,0,0)');
      v.addColorStop(1, 'rgba(0,0,0,0.52)');
      ctx.fillStyle = v;
      ctx.fillRect(0, 0, width, height);

      frameId = window.requestAnimationFrame(tick);
    };

    resize();
    createScene();
    frameId = window.requestAnimationFrame(tick);

    const handleResize = () => {
      resize();
      createScene();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      running = false;
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [palette.a, palette.b, palette.c, palette.d, speed]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      style={{ opacity }}
    />
  );
}

