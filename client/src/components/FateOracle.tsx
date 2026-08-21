'use client';

import React, { useState } from 'react';
import { FateDilemma, CoinChoice } from '../lib/types';
import { Coin3D } from './Coin3D';
import { soundManager } from '../lib/sounds';
import confetti from 'canvas-confetti';
import { Sparkles, HelpCircle, CheckCircle2, History, Compass, Send } from 'lucide-react';

interface FateOracleProps {
  dilemmas: FateDilemma[];
  onResolveDilemma: (title: string, optionSolar: string, optionLunar: string, category: string) => Promise<FateDilemma>;
}

export const FateOracle: React.FC<FateOracleProps> = ({
  dilemmas,
  onResolveDilemma,
}) => {
  const [title, setTitle] = useState('');
  const [optionSolar, setOptionSolar] = useState('Yes, take the leap!');
  const [optionLunar, setOptionLunar] = useState('No, play it safe.');
  const [category, setCategory] = useState('CRYPTO');
  const [isConsulting, setIsConsulting] = useState(false);
  const [latestResolution, setLatestResolution] = useState<FateDilemma | null>(null);

  const presets = [
    {
      title: "Should I buy the Stellar (XLM) dip?",
      optA: "Buy & HODL (Solar)",
      optB: "Wait for breakout (Lunar)",
      cat: "CRYPTO",
    },
    {
      title: "Should we deploy the smart contract to Mainnet today?",
      optA: "Launch immediately! (Solar)",
      optB: "Run one more audit test (Lunar)",
      cat: "TECH",
    },
    {
      title: "Should I accept the new Web3 developer offer?",
      optA: "Accept the offer! (Solar)",
      optB: "Stay & build current project (Lunar)",
      cat: "CAREER",
    },
    {
      title: "Pizza party or Sushi night for the hackathon team?",
      optA: "Artisan Pizza 🍕 (Solar)",
      optB: "Fresh Sushi 🍣 (Lunar)",
      cat: "LIFE",
    },
  ];

  const applyPreset = (preset: typeof presets[0]) => {
    soundManager.playClick();
    setTitle(preset.title);
    setOptionSolar(preset.optA);
    setOptionLunar(preset.optB);
    setCategory(preset.cat);
  };

  const handleConsultFate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !optionSolar.trim() || !optionLunar.trim() || isConsulting) return;

    setIsConsulting(true);
    soundManager.playFlip();

    const startTime = Date.now();
    const resolution = await onResolveDilemma(title, optionSolar, optionLunar, category);

    const elapsed = Date.now() - startTime;
    const remainingTime = Math.max(0, 2000 - elapsed);

    setTimeout(() => {
      setIsConsulting(false);
      setLatestResolution(resolution);
      soundManager.playCoinLand();

      setTimeout(() => {
        soundManager.playWin();
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#38bdf8', '#818cf8', '#f59e0b'],
        });
      }, 300);
    }, remainingTime);
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center">
      
      {/* HEADER SECTION */}
      <div className="text-center max-w-2xl mb-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 text-xs font-mono mb-3">
          <Compass className="w-3.5 h-3.5 text-purple-400" />
          <span>The Oracle of Destiny • Cryptographic Dilemma Solver</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Let Fate Guide Your Decisions
        </h2>
        <p className="text-sm text-slate-400 mt-2 font-mono">
          Facing a fork in the road? Submit your dilemma to the Soroban oracle. The decentralized coin of destiny will decree your true path.
        </p>
      </div>

      {/* 3D COIN DISPLAY */}
      <div className="relative my-2">
        <Coin3D
          isFlipping={isConsulting}
          outcome={latestResolution ? latestResolution.chosenOutcome || null : null}
          selectedChoice="SOLAR"
          size={190}
        />
      </div>

      {/* RESOLUTION ANNOUNCEMENT CARD */}
      {latestResolution && !isConsulting && (
        <div className="w-full max-w-2xl mb-8 p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-purple-950/40 to-slate-900 border-2 border-purple-500/50 shadow-2xl text-center animate-in fade-in zoom-in-95">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 font-mono text-xs font-bold mb-3 border border-purple-500/30">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>FATE HAS SPOKEN</span>
          </div>

          <h3 className="text-lg text-slate-200 font-semibold mb-2">
            &ldquo;{latestResolution.title}&rdquo;
          </h3>

          <div className="py-4 px-6 rounded-2xl bg-slate-950/80 border border-purple-500/30 inline-block my-2">
            <span className="text-xs font-mono uppercase tracking-widest text-slate-400 block mb-1">
              Decreed Outcome: {latestResolution.chosenOutcome}
            </span>
            <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-amber-300 via-yellow-200 to-cyan-300">
              {latestResolution.chosenOptionText}
            </span>
          </div>

          <p className="text-xs text-slate-400 font-mono mt-2">
            Resolution permanently etched with cryptographic timestamp • {new Date(latestResolution.timestamp).toLocaleTimeString()}
          </p>
        </div>
      )}

      {/* MAIN ORACLE INPUT & PRESETS */}
      <div className="w-full max-w-2xl bg-slate-900/90 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
        
        {/* PRESET INSPIRATIONS */}
        <div>
          <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block mb-2.5">
            Quick Invocations / Dilemma Presets:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {presets.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(p)}
                className="text-left p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-purple-500/40 hover:bg-purple-950/20 text-slate-300 hover:text-white transition-all text-xs font-mono group"
              >
                <div className="flex items-center justify-between text-[10px] text-purple-400 font-bold mb-1">
                  <span>[{p.cat}]</span>
                  <span className="group-hover:translate-x-0.5 transition-transform">Use &rarr;</span>
                </div>
                <div className="truncate font-semibold">{p.title}</div>
              </button>
            ))}
          </div>
        </div>

        {/* DILEMMA FORM */}
        <form onSubmit={handleConsultFate} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Your Dilemma / Question
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Should I accept the Web3 job offer?"
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 px-4 text-white text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 font-medium transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* OPTION SOLAR (A) */}
            <div>
              <label className="block text-xs font-mono font-semibold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span>☀️ Solar Option (Heads)</span>
              </label>
              <input
                type="text"
                required
                value={optionSolar}
                onChange={(e) => setOptionSolar(e.target.value)}
                placeholder="Option A / Yes"
                className="w-full bg-slate-950 border border-amber-500/30 rounded-2xl py-2.5 px-3 text-slate-200 text-xs font-mono focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* OPTION LUNAR (B) */}
            <div>
              <label className="block text-xs font-mono font-semibold text-cyan-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span>🌙 Lunar Option (Tails)</span>
              </label>
              <input
                type="text"
                required
                value={optionLunar}
                onChange={(e) => setOptionLunar(e.target.value)}
                placeholder="Option B / No"
                className="w-full bg-slate-950 border border-cyan-500/30 rounded-2xl py-2.5 px-3 text-slate-200 text-xs font-mono focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={isConsulting || !title.trim()}
            className={`w-full py-4 px-6 rounded-2xl font-black text-sm font-mono tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-3 shadow-xl ${
              isConsulting
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed animate-pulse'
                : 'bg-gradient-to-r from-purple-600 via-indigo-500 to-cyan-500 text-white hover:brightness-110 shadow-purple-500/25 active:scale-[0.98]'
            }`}
          >
            {isConsulting ? (
              <>
                <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Consulting The Celestial Stars...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Cast The Coin of Destiny</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* CHRONICLE OF PAST DECISIONS */}
      {dilemmas.length > 0 && (
        <div className="w-full max-w-3xl mt-12">
          <div className="flex items-center gap-2 mb-4">
            <History className="w-4 h-4 text-purple-400" />
            <h3 className="text-base font-bold text-white font-mono uppercase tracking-wider">
              Chronicle of Fate ({dilemmas.length} Decisions Logged)
            </h3>
          </div>

          <div className="space-y-3">
            {dilemmas.map((d) => (
              <div
                key={d.id}
                className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-700 transition-all"
              >
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-1">
                    <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30 text-[10px]">
                      {d.category}
                    </span>
                    <span>{new Date(d.timestamp).toLocaleDateString()}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-200">
                    {d.title}
                  </h4>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 ${
                    d.chosenOutcome === 'SOLAR'
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                      : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
                  }`}>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{d.chosenOptionText}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
