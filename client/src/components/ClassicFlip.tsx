'use client';

import React, { useState } from 'react';
import { CoinChoice, WalletState, FlipRecord } from '../lib/types';
import { Coin3D } from './Coin3D';
import { soundManager } from '../lib/sounds';
import confetti from 'canvas-confetti';
import { Sparkles, Trophy, Zap, AlertCircle } from 'lucide-react';

interface ClassicFlipProps {
  wallet: WalletState;
  onExecuteFlip: (choice: CoinChoice, amount: number) => Promise<FlipRecord | null>;
  currentStreak: number;
}

export const ClassicFlip: React.FC<ClassicFlipProps> = ({
  wallet,
  onExecuteFlip,
  currentStreak,
}) => {
  const [selectedChoice, setSelectedChoice] = useState<CoinChoice>('SOLAR');
  const [betAmount, setBetAmount] = useState<number>(50);
  const [isFlipping, setIsFlipping] = useState<boolean>(false);
  const [lastResult, setLastResult] = useState<FlipRecord | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const multiplier = 1.96;
  const potentialPayout = Math.floor(betAmount * multiplier);
  const netProfit = potentialPayout - betAmount;

  const quickChips = [10, 25, 50, 100, 250, 500];

  const handleChipClick = (amount: number) => {
    soundManager.playClick();
    setBetAmount(amount);
    setErrorMessage(null);
  };

  const handleMultiplyBet = (factor: number) => {
    soundManager.playClick();
    const newBet = Math.max(1, Math.min(wallet.balance, Math.floor(betAmount * factor)));
    setBetAmount(newBet);
    setErrorMessage(null);
  };

  const handleMaxBet = () => {
    soundManager.playClick();
    setBetAmount(wallet.balance);
    setErrorMessage(null);
  };

  const handleFlip = async () => {
    if (isFlipping) return;

    if (betAmount <= 0) {
      setErrorMessage('Bet amount must be greater than 0');
      return;
    }
    if (betAmount > wallet.balance) {
      setErrorMessage('Insufficient balance! Claim free FLIP tokens from the faucet.');
      return;
    }

    setErrorMessage(null);
    setIsFlipping(true);
    soundManager.playFlip();

    // Visual spinning delay before settling
    const startTime = Date.now();
    const result = await onExecuteFlip(selectedChoice, betAmount);

    const elapsed = Date.now() - startTime;
    const remainingTime = Math.max(0, 1800 - elapsed);

    setTimeout(() => {
      setIsFlipping(false);
      if (result) {
        setLastResult(result);
        soundManager.playCoinLand();

        if (result.won) {
          setTimeout(() => {
            soundManager.playWin();
            // Trigger confetti
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#fbbf24', '#f59e0b', '#06b6d4', '#10b981', '#ffffff'],
            });
          }, 300);
        } else {
          setTimeout(() => {
            soundManager.playLoss();
          }, 300);
        }
      }
    }, remainingTime);
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
      
      {/* HEADER BADGE & STREAK BANNER */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-mono">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Provably Fair RNG • 1.96x Multiplier</span>
        </div>

        {currentStreak > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/40 text-orange-300 text-xs font-mono font-bold animate-pulse">
            <Zap className="w-3.5 h-3.5 text-orange-400" />
            <span>🔥 Streak: {currentStreak} Win{currentStreak > 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* 3D COIN DISPLAY AREA */}
      <div className="relative my-2">
        <Coin3D
          isFlipping={isFlipping}
          outcome={lastResult ? lastResult.outcome : null}
          selectedChoice={selectedChoice}
          size={210}
        />
      </div>

      {/* RESULT ANNOUNCEMENT BANNER */}
      {lastResult && !isFlipping && (
        <div 
          className={`w-full max-w-lg mb-6 p-4 rounded-2xl border text-center transition-all duration-500 animate-in fade-in zoom-in-95 ${
            lastResult.won
              ? 'bg-gradient-to-r from-emerald-950/80 via-slate-900 to-emerald-950/80 border-emerald-500/50 text-emerald-300 shadow-lg shadow-emerald-500/10'
              : 'bg-gradient-to-r from-rose-950/80 via-slate-900 to-rose-950/80 border-rose-500/50 text-rose-300 shadow-lg shadow-rose-500/10'
          }`}
        >
          <div className="flex items-center justify-center gap-2 text-base font-black tracking-wide font-mono uppercase">
            {lastResult.won ? (
              <>
                <Trophy className="w-5 h-5 text-amber-400" />
                <span>VICTORY! YOU WON +{lastResult.payout.toLocaleString()} FLIP</span>
              </>
            ) : (
              <>
                <span>FATE DECREED: {lastResult.outcome}</span>
              </>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            {lastResult.won
              ? `You correctly chose ${lastResult.choice}. Net profit: +${(lastResult.payout - lastResult.betAmount).toLocaleString()} FLIP`
              : `Coin landed on ${lastResult.outcome}. Better luck on the next flip!`}
          </p>
        </div>
      )}

      {/* ERROR MESSAGE BANNER */}
      {errorMessage && (
        <div className="w-full max-w-lg mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* CONTROLS CONTAINER */}
      <div className="w-full max-w-xl bg-slate-900/90 backdrop-blur-xl p-6 rounded-3xl border border-slate-800/90 shadow-2xl space-y-6">
        
        {/* STEP 1: CHOOSE SOLAR OR LUNAR */}
        <div>
          <label className="block text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
            1. Select Your Cosmic Alignment
          </label>
          <div className="grid grid-cols-2 gap-3">
            {/* SOLAR BUTTON */}
            <button
              type="button"
              disabled={isFlipping}
              onClick={() => {
                soundManager.playClick();
                setSelectedChoice('SOLAR');
              }}
              className={`relative p-4 rounded-2xl border transition-all duration-300 flex flex-col items-center gap-2 group ${
                selectedChoice === 'SOLAR'
                  ? 'bg-gradient-to-b from-amber-500/20 to-yellow-600/10 border-amber-400/80 shadow-[0_0_20px_rgba(245,158,11,0.25)] ring-2 ring-amber-400/30'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center text-slate-950 font-black text-xl shadow-md group-hover:scale-105 transition-transform">
                ☀️
              </div>
              <div className="text-center">
                <span className="font-bold text-sm text-white block">SOLAR (Heads)</span>
                <span className="text-[11px] text-amber-400/90 font-mono font-semibold">1.96x Payout</span>
              </div>
              {selectedChoice === 'SOLAR' && (
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
              )}
            </button>

            {/* LUNAR BUTTON */}
            <button
              type="button"
              disabled={isFlipping}
              onClick={() => {
                soundManager.playClick();
                setSelectedChoice('LUNAR');
              }}
              className={`relative p-4 rounded-2xl border transition-all duration-300 flex flex-col items-center gap-2 group ${
                selectedChoice === 'LUNAR'
                  ? 'bg-gradient-to-b from-cyan-500/20 to-indigo-600/10 border-cyan-400/80 shadow-[0_0_20px_rgba(6,182,212,0.25)] ring-2 ring-cyan-400/30'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-400 flex items-center justify-center text-slate-950 font-black text-xl shadow-md group-hover:scale-105 transition-transform">
                🌙
              </div>
              <div className="text-center">
                <span className="font-bold text-sm text-white block">LUNAR (Tails)</span>
                <span className="text-[11px] text-cyan-400/90 font-mono font-semibold">1.96x Payout</span>
              </div>
              {selectedChoice === 'LUNAR' && (
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
              )}
            </button>
          </div>
        </div>

        {/* STEP 2: WAGER AMOUNT & PRESETS */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <label className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">
              2. Wager Amount (FLIP)
            </label>
            <span className="text-xs text-slate-400 font-mono">
              Balance: <span className="text-amber-400 font-bold">{wallet.balance.toLocaleString()} FLIP</span>
            </span>
          </div>

          <div className="relative flex items-center mb-3">
            <input
              type="number"
              min="1"
              max={wallet.balance}
              disabled={isFlipping}
              value={betAmount || ''}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 0;
                setBetAmount(val);
                setErrorMessage(null);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 px-4 pl-10 text-white font-mono text-lg font-bold focus:outline-none focus:border-amber-400/70 focus:ring-1 focus:ring-amber-400/50 transition-all"
              placeholder="50"
            />
            <span className="absolute left-3.5 text-slate-400 font-mono">🪙</span>
            
            <div className="absolute right-2 flex items-center gap-1">
              <button
                type="button"
                disabled={isFlipping}
                onClick={() => handleMultiplyBet(0.5)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs font-semibold transition-colors"
              >
                1/2
              </button>
              <button
                type="button"
                disabled={isFlipping}
                onClick={() => handleMultiplyBet(2)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs font-semibold transition-colors"
              >
                2X
              </button>
              <button
                type="button"
                disabled={isFlipping}
                onClick={handleMaxBet}
                className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-mono text-xs font-bold transition-colors"
              >
                MAX
              </button>
            </div>
          </div>

          {/* Quick Chip Buttons */}
          <div className="grid grid-cols-6 gap-2">
            {quickChips.map(chip => (
              <button
                key={chip}
                type="button"
                disabled={isFlipping}
                onClick={() => handleChipClick(chip)}
                className={`py-1.5 rounded-xl border text-xs font-mono font-bold transition-all ${
                  betAmount === chip
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                }`}
              >
                +{chip}
              </button>
            ))}
          </div>
        </div>

        {/* PAYOUT METRICS */}
        <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80">
          <div>
            <span className="text-[11px] text-slate-400 font-mono block">Potential Payout</span>
            <span className="text-base font-black font-mono text-emerald-400">
              +{potentialPayout.toLocaleString()} FLIP
            </span>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-slate-400 font-mono block">Net Profit</span>
            <span className="text-base font-black font-mono text-amber-300">
              +{netProfit.toLocaleString()} FLIP
            </span>
          </div>
        </div>

        {/* FLIP ACTION BUTTON */}
        <button
          type="button"
          disabled={isFlipping || wallet.balance === 0}
          onClick={handleFlip}
          className={`w-full py-4 px-6 rounded-2xl font-black text-base font-mono tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-3 shadow-xl ${
            isFlipping
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed animate-pulse'
              : selectedChoice === 'SOLAR'
              ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-slate-950 hover:brightness-110 shadow-amber-500/25 active:scale-[0.98]'
              : 'bg-gradient-to-r from-cyan-500 via-teal-400 to-indigo-600 text-slate-950 hover:brightness-110 shadow-cyan-500/25 active:scale-[0.98]'
          }`}
        >
          {isFlipping ? (
            <>
              <div className="w-5 h-5 border-3 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
              <span>Casting Coin of Destiny...</span>
            </>
          ) : (
            <>
              <span>🪙 Flip For Fate ({betAmount} FLIP)</span>
            </>
          )}
        </button>

      </div>

    </div>
  );
};
