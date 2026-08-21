'use client';

import React from 'react';
import { UserStats, FlipRecord } from '../lib/types';
import { soundManager } from '../lib/sounds';
import { 
  Trophy, 
  Flame, 
  BarChart2, 
  TrendingUp, 
  Percent, 
  Coins, 
  Clock, 
  ShieldCheck, 
  Award,
  Crown
} from 'lucide-react';

interface StatsDrawerProps {
  stats: UserStats;
  flips: FlipRecord[];
  onOpenProvablyFairModal: () => void;
}

export const StatsDrawer: React.FC<StatsDrawerProps> = ({
  stats,
  flips,
  onOpenProvablyFairModal,
}) => {
  const total = stats.solarCount + stats.lunarCount;
  const solarPct = total > 0 ? Math.round((stats.solarCount / total) * 100) : 50;
  const lunarPct = 100 - solarPct;

  const mockLeaderboard = [
    { rank: 1, address: 'GD7N...4Q8M', won: 48500, streak: 8, badge: '👑 Celestial King' },
    { rank: 2, address: 'GB9K...91TX', won: 32400, streak: 6, badge: '🔥 Solar Prophet' },
    { rank: 3, address: 'GA3L...88VP', won: 21900, streak: 5, badge: '⚡ Lunar Master' },
    { rank: 4, address: 'GC4P...55KL', won: 14200, streak: 4, badge: '🌟 Fate Seeker' },
    { rank: 5, address: 'GD2M...12QA', won: 9800, streak: 3, badge: '🪙 Cosmic Roller' },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      
      {/* HEADER */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-mono mb-3">
          <BarChart2 className="w-3.5 h-3.5 text-cyan-400" />
          <span>Real-Time Performance Dashboard & Global Records</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Destiny Analytics
        </h2>
        <p className="text-sm text-slate-400 mt-2 font-mono">
          Track your on-chain gameplay metrics, win rate ratios, streak milestones, and provably fair game histories.
        </p>
      </div>

      {/* STATS HIGHLIGHT GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* TOTAL FLIPS */}
        <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
            <span>Total Flips</span>
            <Coins className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">
            {stats.totalFlips}
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-1">
            {stats.wins} Wins • {stats.losses} Losses
          </div>
        </div>

        {/* WIN RATE */}
        <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
            <span>Win Rate</span>
            <Percent className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
            {stats.winRate}%
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-1">
            Fair 50/50 baseline
          </div>
        </div>

        {/* MAX STREAK */}
        <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
            <span>Max Win Streak</span>
            <Flame className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-orange-400 font-mono">
            {stats.maxStreak} 🔥
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-1">
            Current: {stats.currentStreak} in a row
          </div>
        </div>

        {/* NET PROFIT */}
        <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
            <span>Net P/L</span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <div className={`text-2xl sm:text-3xl font-black font-mono ${
            stats.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
          }`}>
            {stats.netProfit >= 0 ? `+${stats.netProfit.toLocaleString()}` : stats.netProfit.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-1">
            Won: {stats.totalWon.toLocaleString()} FLIP
          </div>
        </div>
      </div>

      {/* RATIO BAR: SOLAR VS LUNAR DISTRIBUTION */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-xs font-mono font-bold">
          <span className="text-amber-400 flex items-center gap-1.5">
            <span>☀️ SOLAR:</span>
            <span>{stats.solarCount} ({solarPct}%)</span>
          </span>
          <span className="text-slate-400 uppercase tracking-wider">
            Outcome Distribution
          </span>
          <span className="text-cyan-400 flex items-center gap-1.5">
            <span>🌙 LUNAR:</span>
            <span>{stats.lunarCount} ({lunarPct}%)</span>
          </span>
        </div>

        <div className="h-4 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 flex">
          <div
            style={{ width: `${solarPct}%` }}
            className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-l-full transition-all duration-500 shadow-sm"
          />
          <div
            style={{ width: `${lunarPct}%` }}
            className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-r-full transition-all duration-500 shadow-sm"
          />
        </div>
      </div>

      {/* FLIP HISTORY TABLE & LEADERBOARD GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* RECENT FLIPS HISTORY */}
        <div className="lg:col-span-2 bg-slate-900/90 rounded-3xl border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Flip History ({flips.length})</span>
            </h3>

            <button
              onClick={() => {
                soundManager.playClick();
                onOpenProvablyFairModal();
              }}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-mono flex items-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verify Seeds</span>
            </button>
          </div>

          {flips.length === 0 ? (
            <div className="text-center py-12 text-slate-500 font-mono text-xs">
              No flips recorded yet. Make your first wager!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 pb-2">
                    <th className="pb-2 font-medium">Time</th>
                    <th className="pb-2 font-medium">Mode</th>
                    <th className="pb-2 font-medium">Choice</th>
                    <th className="pb-2 font-medium">Outcome</th>
                    <th className="pb-2 font-medium">Wager</th>
                    <th className="pb-2 font-medium text-right">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {flips.slice(0, 10).map((flip) => (
                    <tr key={flip.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-2.5 text-slate-400">
                        {new Date(flip.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td className="py-2.5">
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                          {flip.mode}
                        </span>
                      </td>
                      <td className="py-2.5">
                        {flip.choice === 'SOLAR' ? '☀️ Solar' : '🌙 Lunar'}
                      </td>
                      <td className="py-2.5 font-bold">
                        {flip.outcome === 'SOLAR' ? '☀️ Solar' : '🌙 Lunar'}
                      </td>
                      <td className="py-2.5 text-slate-300">
                        {flip.betAmount > 0 ? `${flip.betAmount} FLIP` : 'Free'}
                      </td>
                      <td className={`py-2.5 text-right font-black ${
                        flip.won ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {flip.won ? `+${flip.payout.toLocaleString()}` : `-${flip.betAmount.toLocaleString()}`} FLIP
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* HIGH ROLLERS LEADERBOARD */}
        <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-400" />
            <h3 className="text-base font-bold text-white font-mono">
              High-Roller Arena
            </h3>
          </div>

          <div className="space-y-2.5">
            {mockLeaderboard.map((player) => (
              <div
                key={player.rank}
                className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs font-mono ${
                    player.rank === 1 ? 'bg-amber-400 text-slate-950' :
                    player.rank === 2 ? 'bg-slate-300 text-slate-950' :
                    player.rank === 3 ? 'bg-amber-700 text-white' :
                    'bg-slate-800 text-slate-400'
                  }`}>
                    {player.rank}
                  </div>
                  <div>
                    <span className="text-xs font-mono font-bold text-slate-200 block">
                      {player.address}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {player.badge}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-black text-amber-300 block">
                    {player.won.toLocaleString()} FLIP
                  </span>
                  <span className="text-[10px] font-mono text-orange-400">
                    🔥 {player.streak} Streak
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
