'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, Sparkles, Flame, Users, Zap } from 'lucide-react';

export const JackpotBanner: React.FC = () => {
  const [jackpot, setJackpot] = useState(284590);
  const [onlineUsers, setOnlineUsers] = useState(142);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setJackpot(prev => prev + Math.floor(Math.random() * 8) + 1);
    }, 1500);

    const userInterval = setInterval(() => {
      setOnlineUsers(prev => Math.max(80, prev + (Math.random() > 0.48 ? 1 : -1)));
    }, 4000);

    return () => {
      clearInterval(interval);
      clearInterval(userInterval);
    };
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto mb-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-amber-500/30 p-4 sm:p-6 shadow-[0_0_35px_rgba(245,158,11,0.15)] flex flex-col md:flex-row items-center justify-between gap-6 group">
        
        {/* BACKGROUND GLOW SWEEP */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full filter blur-2xl group-hover:scale-150 transition-transform duration-1000 pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-cyan-500/10 rounded-full filter blur-2xl group-hover:scale-150 transition-transform duration-1000 pointer-events-none" />

        {/* LEFT: JACKPOT COUNTER */}
        <div className="flex items-center gap-4 z-10 text-center md:text-left">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 shadow-lg shadow-amber-500/30 animate-pulse shrink-0 hidden sm:flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-amber-400">
              <Trophy className="w-7 h-7" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-mono font-bold text-amber-400 uppercase tracking-widest mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>COSMIC JACKPOT POOL</span>
              <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px]">
                LIVE
              </span>
            </div>
            
            <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-200 drop-shadow-[0_2px_10px_rgba(245,158,11,0.3)]">
              {mounted ? jackpot.toLocaleString() : '284,590'} <span className="text-xl sm:text-2xl text-amber-300 font-sans">FLIP</span>
            </div>
          </div>
        </div>

        {/* RIGHT: LIVE PLAYERS & MULTIPLIER STATUS */}
        <div className="flex flex-wrap items-center justify-center gap-3 z-10">
          
          <div className="px-3.5 py-2 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <Users className="w-4 h-4 text-emerald-400" />
            <div className="text-xs font-mono">
              <span className="text-white font-bold">{onlineUsers}</span>{' '}
              <span className="text-slate-400">Players Online</span>
            </div>
          </div>

          <div className="px-3.5 py-2 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-400" />
            <div className="text-xs font-mono">
              <span className="text-orange-400 font-bold">1.96x - 30x</span>{' '}
              <span className="text-slate-400">Multipliers</span>
            </div>
          </div>

          <div className="px-3.5 py-2 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            <div className="text-xs font-mono">
              <span className="text-cyan-300 font-bold">&lt; 1s</span>{' '}
              <span className="text-slate-400">Soroban Speed</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
