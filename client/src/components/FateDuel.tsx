'use client';

import React, { useState } from 'react';
import { CoinChoice, WalletState, FlipRecord } from '../lib/types';
import { Coin3D } from './Coin3D';
import { soundManager } from '../lib/sounds';
import confetti from 'canvas-confetti';
import { Swords, Shield, Heart, Zap, Trophy, Skull, RefreshCw, Flame } from 'lucide-react';

interface FateDuelProps {
  wallet: WalletState;
  onExecuteFlip: (choice: CoinChoice, amount: number) => Promise<FlipRecord | null>;
  onRewardBonus: (amount: number) => void;
}

export const FateDuel: React.FC<FateDuelProps> = ({
  wallet,
  onExecuteFlip,
  onRewardBonus,
}) => {
  const [playerHp, setPlayerHp] = useState(100);
  const [bossHp, setBossHp] = useState(100);
  const [selectedChoice, setSelectedChoice] = useState<CoinChoice>('SOLAR');
  const [isBattling, setIsBattling] = useState(false);
  const [battleLogs, setBattleLogs] = useState<string[]>([
    '⚔️ The Cosmic Soroban Boss has appeared! Choose your alignment to strike.',
  ]);
  const [lastOutcome, setLastOutcome] = useState<CoinChoice | null>(null);
  const [gameOver, setGameOver] = useState<'WIN' | 'LOSS' | null>(null);

  const wagerAmount = 25;

  const handleStrike = async () => {
    if (isBattling || gameOver) return;
    if (wallet.balance < wagerAmount) return;

    setIsBattling(true);
    soundManager.playFlip();

    const result = await onExecuteFlip(selectedChoice, wagerAmount);

    setTimeout(() => {
      setIsBattling(false);
      if (result) {
        setLastOutcome(result.outcome);
        soundManager.playCoinLand();

        if (result.won) {
          soundManager.playWin();
          const dmg = Math.floor(Math.random() * 15) + 25; // 25-40 dmg
          const newBossHp = Math.max(0, bossHp - dmg);
          setBossHp(newBossHp);
          
          setBattleLogs(prev => [
            `⚡ CRITICAL HIT! You aligned with ${result.outcome} and dealt ${dmg} DMG to the Boss!`,
            ...prev.slice(0, 7),
          ]);

          if (newBossHp === 0) {
            setGameOver('WIN');
            soundManager.playStreakLevelUp();
            confetti({
              particleCount: 180,
              spread: 120,
              origin: { y: 0.5 },
            });
            onRewardBonus(500);
            setBattleLogs(prev => [
              `👑 BOSS DEFEATED! You earned the +500 FLIP Slayer Bounty!`,
              ...prev.slice(0, 7),
            ]);
          }
        } else {
          soundManager.playLoss();
          const dmg = Math.floor(Math.random() * 15) + 25; // 25-40 dmg
          const newPlayerHp = Math.max(0, playerHp - dmg);
          setPlayerHp(newPlayerHp);

          setBattleLogs(prev => [
            `💥 BLOCKED! The Boss struck back on ${result.outcome} and dealt ${dmg} DMG to you!`,
            ...prev.slice(0, 7),
          ]);

          if (newPlayerHp === 0) {
            setGameOver('LOSS');
            setBattleLogs(prev => [
              `💀 YOU FELL IN BATTLE! The Cosmic Boss claimed victory.`,
              ...prev.slice(0, 7),
            ]);
          }
        }
      }
    }, 1800);
  };

  const handleRestartDuel = () => {
    soundManager.playClick();
    setPlayerHp(100);
    setBossHp(100);
    setGameOver(null);
    setBattleLogs(['⚔️ New duel initiated! Prepare your strike.']);
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center">
      
      {/* TITLE BADGE */}
      <div className="text-center max-w-2xl mb-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs font-mono mb-3">
          <Swords className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
          <span>Fate Duel Arena • Player vs Cosmic Boss</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          PVP / Boss Duel
        </h2>
        <p className="text-sm text-slate-400 mt-2 font-mono">
          Strike down the Soroban Celestial Boss in turn-based coin clashes to win the 500 FLIP Slayer Bounty!
        </p>
      </div>

      {/* HEALTH BARS DUEL CONTAINER */}
      <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        
        {/* PLAYER CARD */}
        <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-sm">
                🛡️
              </div>
              <span className="font-mono font-bold text-sm text-slate-200">You (Champion)</span>
            </div>
            <div className="flex items-center gap-1 text-rose-400 font-mono font-bold text-xs">
              <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
              <span>{playerHp}/100 HP</span>
            </div>
          </div>

          <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden p-0.5">
            <div
              style={{ width: `${playerHp}%` }}
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500 shadow-sm"
            />
          </div>
        </div>

        {/* BOSS CARD */}
        <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-300 flex items-center justify-center font-bold text-sm">
                👹
              </div>
              <span className="font-mono font-bold text-sm text-slate-200">Cosmic Soroban Boss</span>
            </div>
            <div className="flex items-center gap-1 text-rose-400 font-mono font-bold text-xs">
              <Skull className="w-3.5 h-3.5 text-rose-400" />
              <span>{bossHp}/100 HP</span>
            </div>
          </div>

          <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden p-0.5">
            <div
              style={{ width: `${bossHp}%` }}
              className="h-full bg-gradient-to-r from-rose-600 to-red-500 rounded-full transition-all duration-500 shadow-sm"
            />
          </div>
        </div>

      </div>

      {/* 3D COIN DISPLAY */}
      <div className="relative my-2">
        <Coin3D
          isFlipping={isBattling}
          outcome={lastOutcome}
          selectedChoice={selectedChoice}
          size={190}
        />
      </div>

      {/* GAME OVER NOTIFICATION */}
      {gameOver && (
        <div className={`w-full max-w-lg my-4 p-6 rounded-3xl border text-center animate-in zoom-in-95 ${
          gameOver === 'WIN'
            ? 'bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border-emerald-500 text-emerald-300'
            : 'bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950 border-rose-500 text-rose-300'
        }`}>
          <div className="text-xl font-black font-mono mb-1">
            {gameOver === 'WIN' ? '🏆 VICTORY! THE BOSS HAS FALLEN!' : '💀 DEFEAT! YOU WERE SLAIN'}
          </div>
          <p className="text-xs font-mono text-slate-300 mb-4">
            {gameOver === 'WIN' ? 'You claimed the 500 FLIP Boss Bounty reward.' : 'Regroup and challenge the boss again.'}
          </p>
          <button
            type="button"
            onClick={handleRestartDuel}
            className="px-6 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono font-black text-xs uppercase tracking-wider transition-all inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Start New Duel</span>
          </button>
        </div>
      )}

      {/* CONTROLS CARD */}
      {!gameOver && (
        <div className="w-full max-w-xl bg-slate-900/90 backdrop-blur-xl p-6 rounded-3xl border border-slate-800 shadow-2xl space-y-4">
          <label className="block text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider text-center">
            Select Strike Alignment
          </label>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              disabled={isBattling}
              onClick={() => {
                soundManager.playClick();
                setSelectedChoice('SOLAR');
              }}
              className={`p-3 rounded-2xl border text-center transition-all ${
                selectedChoice === 'SOLAR'
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300 ring-1 ring-amber-400/40'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span className="text-xl block mb-1">☀️</span>
              <span className="font-bold text-xs font-mono">SOLAR STRIKE</span>
            </button>

            <button
              type="button"
              disabled={isBattling}
              onClick={() => {
                soundManager.playClick();
                setSelectedChoice('LUNAR');
              }}
              className={`p-3 rounded-2xl border text-center transition-all ${
                selectedChoice === 'LUNAR'
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 ring-1 ring-cyan-400/40'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span className="text-xl block mb-1">🌙</span>
              <span className="font-bold text-xs font-mono">LUNAR STRIKE</span>
            </button>
          </div>

          <button
            type="button"
            disabled={isBattling}
            onClick={handleStrike}
            className={`w-full py-4 px-6 rounded-2xl font-mono font-black text-sm tracking-wider uppercase transition-all flex items-center justify-center gap-2 shadow-xl ${
              isBattling
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed animate-pulse'
                : 'bg-gradient-to-r from-rose-600 via-orange-500 to-amber-500 text-slate-950 hover:brightness-110 shadow-rose-600/25'
            }`}
          >
            {isBattling ? (
              <span>Clashing blades...</span>
            ) : (
              <>
                <Swords className="w-4 h-4" />
                <span>Execute Strike ({wagerAmount} FLIP)</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* BATTLE CHRONICLE LOGS */}
      <div className="w-full max-w-xl mt-6 p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-2">
        <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1">
          Battle Chronicle:
        </span>
        <div className="space-y-1 text-xs font-mono">
          {battleLogs.map((log, idx) => (
            <div key={idx} className={`${idx === 0 ? 'text-slate-200 font-bold' : 'text-slate-500'}`}>
              {log}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
