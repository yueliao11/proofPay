"use client";

import { useEffect, useRef } from "react";

export function Confetti({ active, duration = 2000 }: { active: boolean; duration?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const particles: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
      size: number;
      rotation: number;
      rotationSpeed: number;
    }[] = [];

    const colors = ["#4DA3FF", "#22C55E", "#F59E0B", "#EF4444", "#8B5CF6", "#5AC8FA"];
    for (let i = 0; i < 120; i++) {
      particles.push({
        x: rect.width / 2,
        y: rect.height / 2,
        vx: (Math.random() - 0.5) * 18,
        vy: (Math.random() - 1.2) * 18,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 6 + 3,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.4,
      });
    }

    let raf = 0;
    const start = performance.now();

    const draw = (now: number) => {
      const elapsed = now - start;
      ctx.clearRect(0, 0, rect.width, rect.height);
      const progress = Math.min(elapsed / duration, 1);
      const gravity = 0.5;

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += gravity;
        p.rotation += p.rotationSpeed;
        p.vx *= 0.96;
        p.vy *= 0.96;

        const alpha = 1 - progress;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });

      if (progress < 1) {
        raf = requestAnimationFrame(draw);
      }
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [active, duration]);

  if (!active) return null;
  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[100]"
      style={{ width: "100%", height: "100%" }}
    />
  );
}
