'use client';

import React, { useState, useEffect } from 'react';
import { FlipRecord } from '../lib/types';
import { TrendingUp, Radio } from 'lucide-react';

interface RecentFlipsTickerProps {
  flips: FlipRecord[];
  onSelectFlip?: (flip: FlipRecord) => void;
}

export const RecentFlipsTicker: React.FC<RecentFlipsTickerProps> = ({
  flips: initialFlips,
  onSelectFlip,
}) => {
  const [liveItems, setLiveItems] = useState<{
    id: string;
    player: string;
    outcome: 'SOLAR' | 'LUNAR';
    won: boolean;
    amount: number;
    payout: number;
  }[]>([
    { id: 'sim-1', player: 'GD8K...99AA', outcome: 'SOLAR', won: true, amount: 100, payout: 196 },
    { id: 'sim-2', player: 'GB3M...44KL', outcome: 'LUNAR', won: true, amount: 250, payout: 490 },
    { id: 'sim-3', player: 'GA1P...77TX', outcome: 'SOLAR', won: false, amount: 50, payout: 0 },
    { id: 'sim-4', player: 'GC5L...22VP', outcome: 'LUNAR', won: true, amount: 500, payout: 980 },
    { id: 'sim-5', player: 'GD9Q...33ZZ', outcome: 'SOLAR', won: true, amount: 50, payout: 98 },
  ]);

  // Push new dynamic live flips continuously
  useEffect(() => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const randomAddr = () => {
      const p1 = chars[Math.floor(Math.random() * chars.length)] + chars[Math.floor(Math.random() * chars.length)];
      const p2 = chars[Math.floor(Math.random() * chars.length)] + chars[Math.floor(Math.random() * chars.length)];
      return `G${p1}...${p2}`;
    };

    const amounts = [10, 25, 50, 100, 200, 500, 1000];

    const interval = setInterval(() => {
      const outcome: 'SOLAR' | 'LUNAR' = Math.random() > 0.5 ? 'SOLAR' : 'LUNAR';
      const won = Math.random() > 0.46; // ~54% win rate for liveliness
      const amount = amounts[Math.floor(Math.random() * amounts.length)];
      const payout = won ? Math.floor(amount * 1.96) : 0;

      const newItem = {
        id: `live-${Date.now()}-${Math.random()}`,
        player: randomAddr(),
        outcome,
        won,
        amount,
        payout,
      };

      setLiveItems(prev => [newItem, ...prev.slice(0, 19)]);
    }, 3800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-slate-950/95 border-y border-slate-800/80 py-2 overflow-x-auto no-scrollbar backdrop-blur-md sticky top-16 z-30 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-3 whitespace-nowrap">
        
        {/* TICKER LABEL WITH PULSING RADIO BADGE */}
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-300 shrink-0 pr-3 border-r border-slate-800">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-amber-400">LIVE FEED:</span>
        </div>

        {/* DYNAMIC SCROLLING FLIP CHIPS */}
        <div className="flex items-center gap-2.5 animate-in fade-in duration-300">
          {liveItems.map((item) => (
            <div
              key={item.id}
              className={`flex items-center gap-2 px-3 py-1 rounded-xl text-xs font-mono border transition-all duration-300 hover:scale-105 select-none ${
                item.won
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 shadow-sm shadow-emerald-500/10'
                  : 'bg-rose-950/30 border-rose-500/30 text-rose-300'
              }`}
            >
              <span className="text-[10px] text-slate-400 font-bold">{item.player}</span>
              <span className="text-xs">
                {item.outcome === 'SOLAR' ? '☀️' : '🌙'}
              </span>
              
              <span className="font-black">
                {item.won ? `+${item.payout.toLocaleString()}` : `-${item.amount.toLocaleString()}`} FLIP
              </span>

              <span className={`text-[9px] font-bold px-1 py-0.2 rounded ${
                item.won ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
              }`}>
                {item.won ? 'WIN' : 'LOST'}
              </span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
