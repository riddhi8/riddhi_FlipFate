'use client';

import React, { useState } from 'react';
import { CoinChoice } from '../lib/types';

interface Coin3DProps {
  isFlipping: boolean;
  outcome: CoinChoice | null;
  selectedChoice: CoinChoice;
  size?: number;
}

export const Coin3D: React.FC<Coin3DProps> = ({
  isFlipping,
  outcome,
  selectedChoice,
  size = 220,
}) => {
  const [tilt, setTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isFlipping) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5; // -0.5 to 0.5
    setTilt({ x: y * -25, y: x * 25 }); // degrees
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  // Determine final base rotation based on outcome
  const getBaseRotation = () => {
    if (!outcome) {
      return selectedChoice === 'SOLAR' ? 0 : 180;
    }
    return outcome === 'SOLAR' ? 1440 : 1620;
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative flex flex-col items-center justify-center py-6 select-none cursor-pointer group"
    >
      {/* Dynamic Ambient Background Glow */}
      <div 
        className={`absolute rounded-full filter blur-3xl opacity-50 transition-all duration-700 pointer-events-none ${
          isFlipping 
            ? 'w-80 h-80 bg-gradient-to-r from-amber-500 via-purple-600 to-cyan-400 animate-pulse scale-110' 
            : outcome === 'SOLAR' || (!outcome && selectedChoice === 'SOLAR')
            ? 'w-72 h-72 bg-amber-500/40 group-hover:scale-110'
            : 'w-72 h-72 bg-cyan-500/40 group-hover:scale-110'
        }`}
      />

      {/* 3D Coin Container with Perspective */}
      <div 
        className="relative perspective-[1200px]"
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        <div 
          style={{
            transform: isFlipping 
              ? undefined 
              : `rotateX(${tilt.x}deg) rotateY(${getBaseRotation() + tilt.y}deg)`,
          }}
          className={`w-full h-full relative preserve-3d transition-transform ${
            isFlipping ? 'animate-coin-spin' : 'duration-300 ease-out'
          }`}
        >
          {/* FRONT FACE: SOLAR (SUN / GOLD) */}
          <div 
            className="absolute inset-0 rounded-full backface-hidden shadow-[0_0_40px_rgba(245,158,11,0.6)] border-4 border-amber-300 flex items-center justify-center p-3 overflow-hidden bg-gradient-to-br from-amber-200 via-amber-500 to-yellow-600 group-hover:brightness-105"
          >
            {/* Metallic Ring & Engravings */}
            <div className="absolute inset-1 rounded-full border-2 border-dashed border-amber-200/60 pointer-events-none" />
            <div className="absolute inset-3 rounded-full border border-amber-900/30 pointer-events-none" />
            
            {/* Sun Icon & Radiant Rays */}
            <div className="flex flex-col items-center justify-center text-center z-10">
              <div className="relative">
                <svg
                  className="w-24 h-24 text-amber-950 drop-shadow-[0_2px_4px_rgba(255,255,255,0.4)]"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <circle cx="12" cy="12" r="5" className="fill-amber-950" />
                  <path
                    d="M12 1v3m0 16v3M4.22 4.22l2.12 2.12m11.32 11.32l2.12 2.12M1 12h3m16 0h3M4.22 19.78l2.12-2.12m11.32-11.32l2.12-2.12"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
                {/* Center rune */}
                <span className="absolute inset-0 flex items-center justify-center text-amber-300 text-lg font-black tracking-widest font-mono">
                  ☀️
                </span>
              </div>

              <span className="mt-1 font-black text-xs tracking-widest text-amber-950 uppercase drop-shadow-[0_1px_1px_rgba(255,255,255,0.6)] font-mono">
                SOLAR • FATE
              </span>
              <span className="text-[9px] font-bold text-amber-900/80 font-mono">
                [ HEADS ]
              </span>
            </div>

            {/* Specular Light Reflection Sweep */}
            <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/35 to-transparent rotate-45 pointer-events-none" />
          </div>

          {/* BACK FACE: LUNAR (MOON / CYBER CYAN SILVER) */}
          <div 
            className="absolute inset-0 rounded-full backface-hidden shadow-[0_0_40px_rgba(6,182,212,0.6)] border-4 border-cyan-300 flex items-center justify-center p-3 overflow-hidden bg-gradient-to-br from-slate-200 via-cyan-600 to-indigo-950 rotate-y-180 group-hover:brightness-105"
          >
            {/* Metallic Ring & Engravings */}
            <div className="absolute inset-1 rounded-full border-2 border-dashed border-cyan-200/60 pointer-events-none" />
            <div className="absolute inset-3 rounded-full border border-cyan-950/40 pointer-events-none" />
            
            {/* Moon Icon & Cosmic Stars */}
            <div className="flex flex-col items-center justify-center text-center z-10">
              <div className="relative">
                <svg
                  className="w-24 h-24 text-slate-950 drop-shadow-[0_2px_4px_rgba(255,255,255,0.4)]"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z" />
                </svg>
                {/* Center rune */}
                <span className="absolute inset-0 flex items-center justify-center text-cyan-200 text-lg font-black tracking-widest font-mono">
                  🌙
                </span>
              </div>

              <span className="mt-1 font-black text-xs tracking-widest text-slate-950 uppercase drop-shadow-[0_1px_1px_rgba(255,255,255,0.6)] font-mono">
                LUNAR • DESTINY
              </span>
              <span className="text-[9px] font-bold text-slate-900/80 font-mono">
                [ TAILS ]
              </span>
            </div>

            {/* Specular Light Reflection Sweep */}
            <div className="absolute -inset-full bg-gradient-to-r from-transparent via-cyan-100/40 to-transparent rotate-45 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Dynamic Floor Shadow with Scale on Spin and Mouse Offset */}
      <div 
        style={{
          transform: isFlipping
            ? 'scale(0.75)'
            : `translate(${tilt.y * 0.5}px, ${tilt.x * 0.5}px) scale(1)`,
        }}
        className={`mt-6 rounded-full bg-black/70 filter blur-md transition-all duration-300 ${
          isFlipping 
            ? 'w-32 h-3 opacity-30' 
            : 'w-48 h-4 opacity-75'
        }`}
      />
    </div>
  );
};
