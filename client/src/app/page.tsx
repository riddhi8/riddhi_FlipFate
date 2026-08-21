'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { RecentFlipsTicker } from '../components/RecentFlipsTicker';
import { CosmicCanvas } from '../components/CosmicCanvas';
import { JackpotBanner } from '../components/JackpotBanner';
import { ClassicFlip } from '../components/ClassicFlip';
import { FateDuel } from '../components/FateDuel';
import { FateOracle } from '../components/FateOracle';
import { StreakArena } from '../components/StreakArena';
import { StatsDrawer } from '../components/StatsDrawer';
import { ProvablyFairModal } from '../components/ProvablyFairModal';
import { WalletModal } from '../components/WalletModal';
import { FreighterWelcomePopup } from '../components/FreighterWelcomePopup';
import { soundManager } from '../lib/sounds';
import { generateRandomHex, sha256, calculateOutcome } from '../lib/provablyFair';
import { GameMode, CoinChoice, FlipRecord, FateDilemma, UserStats, WalletState } from '../lib/types';
import { Shield, Sparkles, Coins, Flame, Compass } from 'lucide-react';

export default function Home() {
  // Navigation State
  const [currentMode, setCurrentMode] = useState<GameMode>('CLASSIC');
  const [isMuted, setIsMuted] = useState(false);
  const [isProvablyFairModalOpen, setIsProvablyFairModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isFreighterWelcomeOpen, setIsFreighterWelcomeOpen] = useState(false);

  // Wallet State
  const [wallet, setWallet] = useState<WalletState>({
    connected: true,
    address: 'GDFATE99STELLAR7FLIP88SOROBAN22TESTNET',
    balance: 1000,
    network: 'testnet',
    walletType: 'simulator',
  });

  // Provably Fair Cryptographic Seed State
  const [serverSeed, setServerSeed] = useState('');
  const [serverSeedHash, setServerSeedHash] = useState('');
  const [clientSeed, setClientSeed] = useState('cosmic-flip-player-777');
  const [nonce, setNonce] = useState(1);

  // Gameplay Records & Stats
  const [flips, setFlips] = useState<FlipRecord[]>([]);
  const [dilemmas, setDilemmas] = useState<FateDilemma[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalFlips: 0,
    wins: 0,
    losses: 0,
    winRate: 0,
    currentStreak: 0,
    maxStreak: 0,
    totalWagered: 0,
    totalWon: 0,
    netProfit: 0,
    solarCount: 0,
    lunarCount: 0,
  });

  // Initialize Provably Fair Seeds on load
  useEffect(() => {
    const initSeeds = async () => {
      const initialServerSeed = generateRandomHex(32);
      const hash = await sha256(initialServerSeed);
      setServerSeed(initialServerSeed);
      setServerSeedHash(hash);
    };
    initSeeds();

    // Load persisted state if exists
    try {
      const savedFlips = localStorage.getItem('flipfate_flips');
      if (savedFlips) setFlips(JSON.parse(savedFlips));

      const savedDilemmas = localStorage.getItem('flipfate_dilemmas');
      if (savedDilemmas) setDilemmas(JSON.parse(savedDilemmas));

      const savedStats = localStorage.getItem('flipfate_stats');
      if (savedStats) setStats(JSON.parse(savedStats));

      const savedBalance = localStorage.getItem('flipfate_balance');
      if (savedBalance) {
        setWallet(prev => ({ ...prev, balance: parseInt(savedBalance) || 1000 }));
      }
    } catch {
      // ignore
    }

    // Open Freighter Welcome Popup on initial visit
    const hasSeenWelcome = sessionStorage.getItem('flipfate_seen_welcome');
    if (!hasSeenWelcome) {
      const timer = setTimeout(() => {
        setIsFreighterWelcomeOpen(true);
        sessionStorage.setItem('flipfate_seen_welcome', 'true');
      }, 600);
      return () => clearTimeout(timer);
    }
  }, []);

  // Save changes to localStorage
  const persistState = (newFlips: FlipRecord[], newStats: UserStats, newBalance: number, newDilemmas?: FateDilemma[]) => {
    try {
      localStorage.setItem('flipfate_flips', JSON.stringify(newFlips));
      localStorage.setItem('flipfate_stats', JSON.stringify(newStats));
      localStorage.setItem('flipfate_balance', newBalance.toString());
      if (newDilemmas) {
        localStorage.setItem('flipfate_dilemmas', JSON.stringify(newDilemmas));
      }
    } catch {
      // ignore
    }
  };

  // Execute a Provably Fair Coin Flip
  const handleExecuteFlip = async (choice: CoinChoice, amount: number, mode: 'CLASSIC' | 'STREAK' = 'CLASSIC'): Promise<FlipRecord | null> => {
    if (wallet.balance < amount) return null;

    // 1. Calculate outcome from active seeds
    const { outcome } = await calculateOutcome(serverSeed, clientSeed, nonce);
    const won = choice === outcome;
    const multiplier = 1.96;
    const payout = won ? Math.floor(amount * multiplier) : 0;
    const newBalance = wallet.balance - amount + payout;

    // 2. Generate new record
    const record: FlipRecord = {
      id: `flip-${Date.now()}-${nonce}`,
      timestamp: Date.now(),
      choice,
      outcome,
      won,
      betAmount: amount,
      payout,
      streak: won ? stats.currentStreak + 1 : 0,
      serverSeedHash,
      serverSeed,
      clientSeed,
      nonce,
      mode,
    };

    // 3. Update User Stats
    const newFlips = [record, ...flips];
    const newWins = won ? stats.wins + 1 : stats.wins;
    const newLosses = won ? stats.losses : stats.losses + 1;
    const totalCount = newWins + newLosses;
    const newWinRate = totalCount > 0 ? Math.round((newWins / totalCount) * 100) : 0;
    const newCurrentStreak = won ? stats.currentStreak + 1 : 0;
    const newMaxStreak = Math.max(stats.maxStreak, newCurrentStreak);
    const newSolarCount = outcome === 'SOLAR' ? stats.solarCount + 1 : stats.solarCount;
    const newLunarCount = outcome === 'LUNAR' ? stats.lunarCount + 1 : stats.lunarCount;
    const newTotalWagered = stats.totalWagered + amount;
    const newTotalWon = stats.totalWon + payout;
    const newNetProfit = newTotalWon - newTotalWagered;

    const newStats: UserStats = {
      totalFlips: totalCount,
      wins: newWins,
      losses: newLosses,
      winRate: newWinRate,
      currentStreak: newCurrentStreak,
      maxStreak: newMaxStreak,
      totalWagered: newTotalWagered,
      totalWon: newTotalWon,
      netProfit: newNetProfit,
      solarCount: newSolarCount,
      lunarCount: newLunarCount,
    };

    setFlips(newFlips);
    setStats(newStats);
    setWallet(prev => ({ ...prev, balance: newBalance }));
    persistState(newFlips, newStats, newBalance);

    // 4. Rotate Server Seed for next flip
    const nextServerSeed = generateRandomHex(32);
    const nextHash = await sha256(nextServerSeed);
    setServerSeed(nextServerSeed);
    setServerSeedHash(nextHash);
    setNonce(prev => prev + 1);

    return record;
  };

  // Resolve a Fate Dilemma Oracle
  const handleResolveDilemma = async (
    title: string,
    optionSolar: string,
    optionLunar: string,
    category: string
  ): Promise<FateDilemma> => {
    const { outcome } = await calculateOutcome(serverSeed, clientSeed, nonce);
    const chosenOptionText = outcome === 'SOLAR' ? optionSolar : optionLunar;

    const newDilemma: FateDilemma = {
      id: `dilemma-${Date.now()}`,
      timestamp: Date.now(),
      title,
      optionSolar,
      optionLunar,
      category,
      resolved: true,
      chosenOutcome: outcome,
      chosenOptionText,
    };

    const updatedDilemmas = [newDilemma, ...dilemmas];
    setDilemmas(updatedDilemmas);

    // Also log as an Oracle flip in records
    const flipLog: FlipRecord = {
      id: `oracle-${Date.now()}`,
      timestamp: Date.now(),
      choice: outcome,
      outcome,
      won: true,
      betAmount: 0,
      payout: 0,
      streak: stats.currentStreak,
      serverSeedHash,
      serverSeed,
      clientSeed,
      nonce,
      mode: 'ORACLE',
      dilemmaTitle: title,
    };
    const updatedFlips = [flipLog, ...flips];
    setFlips(updatedFlips);

    persistState(updatedFlips, stats, wallet.balance, updatedDilemmas);

    // Rotate seed
    const nextServerSeed = generateRandomHex(32);
    const nextHash = await sha256(nextServerSeed);
    setServerSeed(nextServerSeed);
    setServerSeedHash(nextHash);
    setNonce(prev => prev + 1);

    return newDilemma;
  };

  // Wallet Faucet Claim
  const handleClaimFaucet = (amount: number = 1000) => {
    const newBal = wallet.balance + amount;
    setWallet(prev => ({ ...prev, balance: newBal }));
    persistState(flips, stats, newBal);
  };

  const handleResetBalance = () => {
    setWallet(prev => ({ ...prev, balance: 1000 }));
    persistState(flips, stats, 1000);
  };

  const handleToggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    soundManager.setMuted(newMuted);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#030712] relative overflow-hidden">
      
      {/* INTERACTIVE COSMIC STARFIELD & NEBULA CANVAS */}
      <CosmicCanvas />

      {/* BACKGROUND COSMIC NEBULA EFFECTS */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-amber-500/10 via-purple-600/10 to-transparent filter blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-600/10 filter blur-[100px] pointer-events-none" />

      {/* TOP NAVIGATION BAR */}
      <Navbar
        currentMode={currentMode}
        onSelectMode={setCurrentMode}
        wallet={wallet}
        onOpenWalletModal={() => setIsWalletModalOpen(true)}
        onClaimFaucet={() => handleClaimFaucet(1000)}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onOpenProvablyFairModal={() => setIsProvablyFairModalOpen(true)}
      />

      {/* LIVE ACTIVITY TICKER */}
      <RecentFlipsTicker
        flips={flips}
        onSelectFlip={() => setIsProvablyFairModalOpen(true)}
      />

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 z-10">
        
        {/* LIVE COSMIC JACKPOT BANNER */}
        <JackpotBanner />

        {/* VIEW ROUTING */}
        {currentMode === 'CLASSIC' && (
          <ClassicFlip
            wallet={wallet}
            onExecuteFlip={(choice, amt) => handleExecuteFlip(choice, amt, 'CLASSIC')}
            currentStreak={stats.currentStreak}
          />
        )}

        {currentMode === 'DUEL' && (
          <FateDuel
            wallet={wallet}
            onExecuteFlip={(choice, amt) => handleExecuteFlip(choice, amt, 'CLASSIC')}
            onRewardBonus={(bonus) => handleClaimFaucet(bonus)}
          />
        )}

        {currentMode === 'ORACLE' && (
          <FateOracle
            dilemmas={dilemmas}
            onResolveDilemma={handleResolveDilemma}
          />
        )}

        {currentMode === 'STREAK' && (
          <StreakArena
            wallet={wallet}
            onExecuteFlip={(choice, amt) => handleExecuteFlip(choice, amt, 'STREAK')}
          />
        )}

        {currentMode === 'STATS' && (
          <StatsDrawer
            stats={stats}
            flips={flips}
            onOpenProvablyFairModal={() => setIsProvablyFairModalOpen(true)}
          />
        )}

      </main>

      {/* PROVABLY FAIR MODAL */}
      <ProvablyFairModal
        isOpen={isProvablyFairModalOpen}
        onClose={() => setIsProvablyFairModalOpen(false)}
        serverSeedHash={serverSeedHash}
        clientSeed={clientSeed}
        nonce={nonce}
        onUpdateClientSeed={setClientSeed}
      />

      {/* WALLET MODAL */}
      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        wallet={wallet}
        onUpdateWallet={(partial) => {
          setWallet(prev => {
            const updated = { ...prev, ...partial };
            persistState(flips, stats, updated.balance);
            return updated;
          });
        }}
        onClaimTokens={handleClaimFaucet}
        onResetBalance={handleResetBalance}
      />

      {/* FREIGHTER WELCOME POPUP */}
      <FreighterWelcomePopup
        isOpen={isFreighterWelcomeOpen}
        onClose={() => setIsFreighterWelcomeOpen(false)}
        onWalletConnected={(partial) => {
          setWallet(prev => {
            const updated = { ...prev, ...partial };
            persistState(flips, stats, updated.balance);
            return updated;
          });
        }}
        onUseSimulator={() => {
          setWallet(prev => {
            const updated: WalletState = {
              ...prev,
              walletType: 'simulator',
              address: 'GDFATE99STELLAR7FLIP88SOROBAN22TESTNET',
            };
            persistState(flips, stats, updated.balance);
            return updated;
          });
        }}
      />

      {/* FOOTER */}
      <footer className="w-full border-t border-slate-900 bg-slate-950/60 py-8 px-4 text-center text-xs font-mono text-slate-500 z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-bold">🪙 FlipFate</span>
            <span>• Stellar Soroban Smart Contract Ecosystem</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => {
                soundManager.playClick();
                setIsProvablyFairModalOpen(true);
              }}
              className="hover:text-emerald-400 transition-colors"
            >
              Provably Fair
            </button>
            <button
              onClick={() => {
                soundManager.playClick();
                setCurrentMode('STATS');
              }}
              className="hover:text-amber-400 transition-colors"
            >
              Analytics
            </button>
            <button
              onClick={() => {
                soundManager.playClick();
                setIsWalletModalOpen(true);
              }}
              className="hover:text-cyan-400 transition-colors"
            >
              Faucet
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}
