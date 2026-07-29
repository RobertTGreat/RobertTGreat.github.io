'use client';

import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  alpha: number;
  phase: number;
}

/**
 * Full-viewport starfield. Uses window resize only (no ResizeObserver) to
 * avoid canvas attribute ↔ layout feedback loops that thrash the page.
 */
export default function StarryCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: 0, y: 0, tx: 0, ty: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId = 0;
    let stars: Star[] = [];
    let width = 0;
    let height = 0;
    let running = true;

    const generateStars = (w: number, h: number) => {
      const starCount = Math.min(Math.floor((w * h) / 4500), 250);
      const next: Star[] = [];
      for (let i = 0; i < starCount; i++) {
        next.push({
          x: Math.random() * w,
          y: Math.random() * h,
          size: Math.random() * 1.5 + 0.3,
          speed: Math.random() * 0.02 + 0.005,
          alpha: Math.random() * 0.8 + 0.2,
          phase: Math.random() * Math.PI * 2,
        });
      }
      stars = next;
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const nextW = window.innerWidth;
      const nextH = window.innerHeight;
      if (nextW === width && nextH === height) return;

      width = nextW;
      height = nextH;
      canvas.width = Math.floor(nextW * dpr);
      canvas.height = Math.floor(nextH * dpr);
      canvas.style.width = `${nextW}px`;
      canvas.style.height = `${nextH}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      generateStars(nextW, nextH);
    };

    resize();

    const onResize = () => {
      resize();
    };
    window.addEventListener('resize', onResize, { passive: true });

    const onPointerMove = (e: PointerEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      mouseRef.current.tx = (e.clientX - cx) * 0.02;
      mouseRef.current.ty = (e.clientY - cy) * 0.02;
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    const render = () => {
      if (!running) return;

      mouseRef.current.x += (mouseRef.current.tx - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.ty - mouseRef.current.y) * 0.05;

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      ctx.fillStyle = '#010101';
      ctx.fillRect(0, 0, width, height);

      for (const star of stars) {
        star.phase += star.speed;
        const currentAlpha = Math.max(
          0.1,
          star.alpha * (0.4 + Math.sin(star.phase) * 0.5),
        );

        let sx = star.x + mx * 0.5;
        let sy = star.y + my * 0.5;

        if (width > 0) {
          sx = ((sx % width) + width) % width;
        }
        if (height > 0) {
          sy = ((sy % height) + height) % height;
        }

        ctx.fillStyle = `rgba(255, 255, 255, ${currentAlpha})`;
        ctx.beginPath();
        ctx.arc(sx, sy, star.size, 0, Math.PI * 2);
        ctx.fill();
      }

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

    return () => {
      running = false;
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onPointerMove);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0"
      aria-hidden
    >
      <canvas ref={canvasRef} className="block" />
    </div>
  );
}
