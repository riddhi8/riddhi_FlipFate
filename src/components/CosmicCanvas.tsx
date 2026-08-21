'use client';

import React, { useEffect, useRef } from 'react';

export const CosmicCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Mouse coordinates for interactive glow
    let mouse = { x: width / 2, y: height / 2, active: false };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Star objects
    const stars: {
      x: number;
      y: number;
      radius: number;
      color: string;
      vx: number;
      vy: number;
      alpha: number;
      dAlpha: number;
    }[] = [];

    const starCount = Math.min(120, Math.floor(width / 12));
    const colors = ['#f59e0b', '#fbbf24', '#38bdf8', '#818cf8', '#e2e8f0', '#c084fc'];

    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.8 + 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        alpha: Math.random() * 0.8 + 0.2,
        dAlpha: (Math.random() * 0.02 + 0.005) * (Math.random() > 0.5 ? 1 : -1),
      });
    }

    // Shooting stars
    interface ShootingStar {
      x: number;
      y: number;
      length: number;
      speed: number;
      angle: number;
      alpha: number;
    }
    const shootingStars: ShootingStar[] = [];

    const createShootingStar = () => {
      if (Math.random() < 0.03 && shootingStars.length < 3) {
        shootingStars.push({
          x: Math.random() * width * 0.8,
          y: Math.random() * height * 0.4,
          length: Math.random() * 80 + 50,
          speed: Math.random() * 10 + 12,
          angle: Math.PI / 4 + (Math.random() - 0.5) * 0.2,
          alpha: 1,
        });
      }
    };

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render Mouse Ambient Glow
      if (mouse.active) {
        const gradient = ctx.createRadialGradient(
          mouse.x,
          mouse.y,
          0,
          mouse.x,
          mouse.y,
          220
        );
        gradient.addColorStop(0, 'rgba(245, 158, 11, 0.07)');
        gradient.addColorStop(0.5, 'rgba(56, 189, 248, 0.03)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
      }

      // Render & Update Stars
      stars.forEach((star, index) => {
        star.x += star.vx;
        star.y += star.vy;
        star.alpha += star.dAlpha;

        if (star.alpha <= 0.1 || star.alpha >= 0.9) {
          star.dAlpha = -star.dAlpha;
        }

        if (star.x < 0) star.x = width;
        if (star.x > width) star.x = 0;
        if (star.y < 0) star.y = height;
        if (star.y > height) star.y = 0;

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.globalAlpha = star.alpha;
        ctx.shadowBlur = 8;
        ctx.shadowColor = star.color;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw interactive connection lines between nearby stars
        for (let j = index + 1; j < stars.length; j++) {
          const s2 = stars[j];
          const dist = Math.hypot(star.x - s2.x, star.y - s2.y);
          if (dist < 90) {
            ctx.beginPath();
            ctx.moveTo(star.x, star.y);
            ctx.lineTo(s2.x, s2.y);
            ctx.strokeStyle = star.color;
            ctx.globalAlpha = (1 - dist / 90) * 0.15 * star.alpha;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      });

      // Update & Render Shooting Stars
      createShootingStar();
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const ss = shootingStars[i];
        const endX = ss.x + Math.cos(ss.angle) * ss.length;
        const endY = ss.y + Math.sin(ss.angle) * ss.length;

        const ssGradient = ctx.createLinearGradient(ss.x, ss.y, endX, endY);
        ssGradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
        ssGradient.addColorStop(1, `rgba(251, 191, 36, ${ss.alpha})`);

        ctx.beginPath();
        ctx.moveTo(ss.x, ss.y);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = ssGradient;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ss.x += Math.cos(ss.angle) * ss.speed;
        ss.y += Math.sin(ss.angle) * ss.speed;
        ss.alpha -= 0.02;

        if (ss.alpha <= 0 || ss.x > width || ss.y > height) {
          shootingStars.splice(i, 1);
        }
      }

      ctx.globalAlpha = 1;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.85 }}
    />
  );
};
