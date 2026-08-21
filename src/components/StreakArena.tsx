'use client';

import React, { useState } from 'react';
import { CoinChoice, WalletState, FlipRecord } from '../lib/types';
import { Coin3D } from './Coin3D';
import { soundManager } from '../lib/sounds';
import confetti from 'canvas-confetti';
import { Flame, DollarSign, ShieldAlert, ArrowRight, Zap, Trophy } from 'lucide-react';

interface StreakArenaProps {
  wallet: WalletState;
  onExecuteFlip: (choice: CoinChoice, amount: number) => Promise<FlipRecord | null>;
}

export const StreakArena: React.FC<StreakArenaProps> = ({
  wallet,
  onExecuteFlip,
}) => {
  const ladder = [
    { step: 1, multiplier: 1.95, label: '1.95x' },
    { step: 2, multiplier: 3.85, label: '3.85x' },
    { step: 3, multiplier: 7.60, label: '7.60x' },
    { step: 4, multiplier: 15.00, label: '15.0x' },
    { step: 5, multiplier: 30.00, label: '30.0x 👑' },
  ];

  const [initialBet, setInitialBet] = useState(25);
  const [activeStep, setActiveStep] = useState(0); // 0 = not started
  const [selectedChoice, setSelectedChoice] = useState<CoinChoice>('SOLAR');
  const [isFlipping, setIsFlipping] = useState(false);
  const [lastOutcome, setLastOutcome] = useState<CoinChoice | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const currentPot = activeStep === 0
    ? Math.floor(initialBet * ladder[0].multiplier)
    : Math.floor(initialBet * ladder[activeStep - 1].multiplier);

  const nextPot = activeStep < ladder.length
    ? Math.floor(initialBet * ladder[activeStep].multiplier)
    : currentPot;

  const handleStartOrContinue = async () => {
    if (isFlipping) return;

    if (activeStep === 0 && initialBet > wallet.balance) {
      setStatusMessage('Insufficient balance for starting bet!');
      return;
    }

    setStatusMessage(null);
    setIsFlipping(true);
    soundManager.playFlip();

    // Execute flip through parent
    const betCost = activeStep === 0 ? initialBet : 0; // only deduct on start
    const result = await onExecuteFlip(selectedChoice, betCost);

    setTimeout(() => {
      setIsFlipping(false);
      if (result) {
        setLastOutcome(result.outcome);
        soundManager.playCoinLand();

        if (result.won) {
          const newStep = activeStep + 1;
          setActiveStep(newStep);

          if (newStep >= ladder.length) {
            // Reached Max 30x Jackpot!
            soundManager.playStreakLevelUp();
            confetti({
              particleCount: 150,
              spread: 100,
              origin: { y: 0.5 },
            });
            setStatusMessage(`👑 GRAND JACKPOT ACHIEVED! ${(initialBet * 30).toLocaleString()} FLIP won!`);
          } else {
            soundManager.playStreakLevelUp();
            setStatusMessage(`🔥 Step ${newStep} Cleared! Current Pot: ${Math.floor(initialBet * ladder[newStep - 1].multiplier)} FLIP`);
          }
        } else {
          // Lost streak
          soundManager.playLoss();
          setActiveStep(0);
          setStatusMessage(`❌ The streak was broken on ${result.outcome}. Pot lost!`);
        }
      }
    }, 1800);
  };

  const handleCashOut = () => {
    if (activeStep === 0 || isFlipping) return;
    soundManager.playWin();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
    setStatusMessage(`💰 Cashed out +${currentPot.toLocaleString()} FLIP successfully!`);
    setActiveStep(0);
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center">
      
      {/* HEADER */}
      <div className="text-center max-w-2xl mb-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orange-950/60 border border-orange-500/30 text-orange-300 text-xs font-mono mb-3">
          <Flame className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
          <span>High-Stakes Streak Challenge • 30X Max Jackpot</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Streak Arena
        </h2>
        <p className="text-sm text-slate-400 mt-2 font-mono">
          Chain consecutive coin flips without missing. Cash out your earnings anytime, or risk it all for exponential multi-tier jackpots!
        </p>
      </div>

      {/* MULTIPLIER LADDER STRIP */}
      <div className="w-full max-w-3xl grid grid-cols-5 gap-2 sm:gap-3 mb-8">
        {ladder.map((item, idx) => {
          const isPassed = activeStep > idx;
          const isCurrent = activeStep === idx + 1;
          const isNext = activeStep === idx;

          return (
            <div
              key={item.step}
              className={`p-3 rounded-2xl border text-center transition-all duration-300 relative overflow-hidden ${
                isCurrent
                  ? 'bg-gradient-to-b from-orange-500/30 to-amber-600/20 border-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.3)] ring-2 ring-orange-400/50 scale-105'
                  : isPassed
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-900/60 border-slate-800 text-slate-500'
              }`}
            >
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider mb-1">
                Step {item.step}
              </div>
              <div className={`text-base sm:text-lg font-black font-mono ${
                isCurrent ? 'text-orange-300' : isPassed ? 'text-emerald-400' : 'text-slate-400'
              }`}>
                {item.label}
              </div>
              <div className="text-[11px] font-mono mt-1 text-slate-300 font-semibold">
                ~{Math.floor(initialBet * item.multiplier)} FLIP
              </div>

              {isCurrent && (
                <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-orange-400 animate-ping" />
              )}
            </div>
          );
        })}
      </div>

      {/* 3D COIN DISPLAY */}
      <div className="relative my-2">
        <Coin3D
          isFlipping={isFlipping}
          outcome={lastOutcome}
          selectedChoice={selectedChoice}
          size={190}
        />
      </div>

      {/* STATUS BANNER */}
      {statusMessage && (
        <div className="w-full max-w-lg my-4 p-3 rounded-2xl bg-slate-900 border border-slate-800 text-center text-xs font-mono font-bold text-slate-200">
          {statusMessage}
        </div>
      )}

      {/* CONTROLS CARD */}
      <div className="w-full max-w-xl bg-slate-900/90 backdrop-blur-xl p-6 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
        
        {/* INITIAL BET (DISABLED IF IN STREAK) */}
        {activeStep === 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">
                Starting Stake
              </label>
              <span className="text-xs text-slate-400 font-mono">
                Balance: <span className="text-amber-400 font-bold">{wallet.balance.toLocaleString()} FLIP</span>
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[10, 25, 50, 100].map(amt => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => {
                    soundManager.playClick();
                    setInitialBet(amt);
                  }}
                  className={`py-2 rounded-xl border font-mono text-xs font-bold transition-all ${
                    initialBet === amt
                      ? 'bg-orange-500/20 border-orange-400 text-orange-300'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {amt} FLIP
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ALIGNMENT SELECTOR */}
        <div>
          <label className="block text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
            Next Flip Alignment
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              disabled={isFlipping}
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
              <span className="text-lg block mb-1">☀️</span>
              <span className="font-bold text-xs font-mono">SOLAR (Heads)</span>
            </button>

            <button
              type="button"
              disabled={isFlipping}
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
              <span className="text-lg block mb-1">🌙</span>
              <span className="font-bold text-xs font-mono">LUNAR (Tails)</span>
            </button>
          </div>
        </div>

        {/* ACTION BUTTONS (FLIP OR CASH OUT) */}
        <div className="flex flex-col sm:flex-row gap-3">
          {activeStep > 0 && (
            <button
              type="button"
              disabled={isFlipping}
              onClick={handleCashOut}
              className="w-full sm:w-1/2 py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-mono font-black text-sm tracking-wider uppercase transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
            >
              <DollarSign className="w-4 h-4" />
              <span>Cash Out ({currentPot} FLIP)</span>
            </button>
          )}

          <button
            type="button"
            disabled={isFlipping}
            onClick={handleStartOrContinue}
            className={`w-full ${activeStep > 0 ? 'sm:w-1/2' : ''} py-3.5 px-4 rounded-2xl font-mono font-black text-sm tracking-wider uppercase transition-all flex items-center justify-center gap-2 shadow-xl ${
              isFlipping
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-slate-950 hover:brightness-110 shadow-orange-500/20'
            }`}
          >
            {isFlipping ? (
              <span>Spinning...</span>
            ) : activeStep === 0 ? (
              <>
                <Flame className="w-4 h-4" />
                <span>Start Streak ({initialBet} FLIP)</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Double Down &rarr; {nextPot} FLIP</span>
              </>
            )}
          </button>
        </div>

      </div>

    </div>
  );
};
