'use client';

import React, { useState, useRef, useEffect } from 'react';
import { GameMode, WalletState } from '../lib/types';
import { soundManager } from '../lib/sounds';
import { 
  Coins, 
  Sparkles, 
  Flame, 
  ShieldCheck, 
  BarChart3, 
  Volume2, 
  VolumeX, 
  Wallet, 
  PlusCircle,
  Swords,
  ChevronDown,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  LogOut,
  Zap,
  Globe
} from 'lucide-react';

interface NavbarProps {
  currentMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  wallet: WalletState;
  onOpenWalletModal: () => void;
  onClaimFaucet: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenProvablyFairModal: () => void;
  onDisconnectWallet?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMode,
  onSelectMode,
  wallet,
  onOpenWalletModal,
  onClaimFaucet,
  isMuted,
  onToggleMute,
  onOpenProvablyFairModal,
  onDisconnectWallet,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const navItems: { mode: GameMode; label: string; icon: React.ReactNode; badge?: string }[] = [
    { mode: 'CLASSIC', label: 'Classic Flip', icon: <Coins className="w-4 h-4" /> },
    { mode: 'DUEL', label: 'Fate Duel', icon: <Swords className="w-4 h-4 text-rose-400" />, badge: 'BOSS' },
    { mode: 'ORACLE', label: 'Fate Oracle', icon: <Sparkles className="w-4 h-4" />, badge: 'AI/DECIDE' },
    { mode: 'STREAK', label: 'Streak Arena', icon: <Flame className="w-4 h-4 text-orange-400 animate-pulse" />, badge: '30X' },
    { mode: 'STATS', label: 'Stats & History', icon: <BarChart3 className="w-4 h-4" /> },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopyAddress = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!wallet.address) return;
    soundManager.playClick();
    navigator.clipboard.writeText(wallet.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getProviderIcon = () => {
    if (wallet.walletType === 'freighter') return '🚀';
    if (wallet.walletType === 'albedo') return '🌌';
    return '⚡';
  };

  const getProviderName = () => {
    if (wallet.walletType === 'freighter') return 'Freighter Wallet';
    if (wallet.walletType === 'albedo') return 'Albedo Signer';
    return 'Testnet Simulator';
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* BRAND LOGO */}
        <div 
          onClick={() => {
            soundManager.playClick();
            onSelectMode('CLASSIC');
          }}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-cyan-400 p-[2px] shadow-lg shadow-amber-500/20 group-hover:shadow-amber-500/40 transition-all duration-300 group-hover:scale-105">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <span className="text-xl">🪙</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black tracking-tight text-white font-sans bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-amber-400 to-cyan-300">
                FlipFate
              </span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                SOROBAN
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono tracking-wider">
              Provably Fair • Web3 Gaming
            </p>
          </div>
        </div>

        {/* NAVIGATION MODES */}
        <nav className="hidden md:flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 shadow-inner">
          {navItems.map(item => {
            const isActive = currentMode === item.mode;
            return (
              <button
                key={item.mode}
                onClick={() => {
                  soundManager.playClick();
                  onSelectMode(item.mode);
                }}
                className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-medium text-xs transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`text-[9px] font-mono px-1 py-0.2 rounded ${
                    isActive 
                      ? 'bg-slate-950/30 text-slate-900 font-black' 
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* RIGHT CONTROLS (FAIRNESS, SOUND, FAUCET, DYNAMIC WALLET) */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Provably Fair Button */}
          <button
            onClick={() => {
              soundManager.playClick();
              onOpenProvablyFairModal();
            }}
            title="Provably Fair Cryptography"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-emerald-400 hover:border-emerald-500/40 text-xs font-mono transition-all"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Fairness</span>
          </button>

          {/* Sound Mute/Unmute */}
          <button
            onClick={() => {
              onToggleMute();
              soundManager.playClick();
            }}
            title={isMuted ? "Unmute Audio" : "Mute Audio"}
            className={`p-2 rounded-xl border text-xs transition-all ${
              isMuted
                ? 'bg-slate-900/60 border-slate-800 text-slate-500 hover:text-slate-300'
                : 'bg-slate-900 border-amber-500/30 text-amber-400 shadow-sm shadow-amber-500/10'
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Quick Faucet Refill */}
          <button
            onClick={() => {
              soundManager.playClick();
              onClaimFaucet();
            }}
            title="Claim 1,000 Demo FLIP Tokens"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-950 to-slate-900 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/40 text-xs font-medium transition-all group"
          >
            <PlusCircle className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-90 transition-transform" />
            <span className="font-mono">+1,000 FLIP</span>
          </button>

          {/* DYNAMIC WALLET PILL & INTERACTIVE DROPDOWN */}
          <div className="relative" ref={dropdownRef}>
            
            {/* MAIN WALLET BUTTON */}
            <button
              onClick={() => {
                soundManager.playClick();
                setDropdownOpen(!dropdownOpen);
              }}
              className={`flex items-center gap-2 p-1.5 pr-2.5 rounded-2xl border transition-all duration-300 group ${
                dropdownOpen
                  ? 'bg-slate-900 border-amber-400/80 shadow-[0_0_15px_rgba(245,158,11,0.25)] ring-2 ring-amber-400/30'
                  : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 shadow-md'
              }`}
            >
              {/* BALANCE BADGE WITH GLOW */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border border-amber-500/30 text-amber-300 font-mono font-black text-xs shadow-inner">
                <span className="text-xs">🪙</span>
                <span className="tracking-tight">{wallet.balance.toLocaleString()} FLIP</span>
              </div>
              
              {/* ADDRESS & PROVIDER WITH LIVE STATUS DOT */}
              <div className="flex items-center gap-1.5 text-xs text-slate-200 group-hover:text-white font-medium">
                <div className="relative flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
                </div>
                
                <span className="font-mono font-bold text-xs tracking-tight">
                  {wallet.address
                    ? `${wallet.address.slice(0, 4)}...${wallet.address.slice(-4)}`
                    : 'Connect'}
                </span>

                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 group-hover:text-amber-300 transition-transform duration-200 ${
                  dropdownOpen ? 'rotate-180 text-amber-400' : ''
                }`} />
              </div>
            </button>

            {/* DYNAMIC WALLET DROPDOWN MENU */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2.5 w-72 sm:w-80 rounded-3xl bg-slate-900/95 backdrop-blur-2xl border border-slate-800 shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-3.5">
                
                {/* HEADER: PROVIDER & NETWORK */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{getProviderIcon()}</span>
                    <div>
                      <span className="text-xs font-bold text-white block">
                        {getProviderName()}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Connected & Active
                      </span>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-md bg-cyan-950 border border-cyan-500/30 text-cyan-300 font-mono text-[10px] font-bold">
                    Testnet
                  </span>
                </div>

                {/* ADDRESS BOX WITH COPY */}
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2">
                  <div className="truncate text-xs font-mono text-slate-300 font-semibold">
                    {wallet.address}
                  </div>
                  <button
                    onClick={handleCopyAddress}
                    title="Copy Full Public Key"
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white shrink-0 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* BALANCE STATS */}
                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-slate-950 to-cyan-500/10 border border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono block">Gaming Balance</span>
                    <span className="text-sm font-black font-mono text-amber-300">
                      {wallet.balance.toLocaleString()} FLIP
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-mono block">Gas (Testnet)</span>
                    <span className="text-sm font-black font-mono text-cyan-300">
                      ~10.0 XLM
                    </span>
                  </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="space-y-1.5 pt-1">
                  
                  {/* FAUCET REFILL */}
                  <button
                    onClick={() => {
                      soundManager.playClick();
                      onClaimFaucet();
                    }}
                    className="w-full p-2 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/40 border border-cyan-500/30 text-cyan-300 font-mono text-xs font-bold flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <PlusCircle className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Claim +1,000 FLIP</span>
                    </div>
                    <span className="text-[10px] text-cyan-400">FREE</span>
                  </button>

                  {/* SWITCH WALLET MODAL */}
                  <button
                    onClick={() => {
                      soundManager.playClick();
                      setDropdownOpen(false);
                      onOpenWalletModal();
                    }}
                    className="w-full p-2 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-slate-300 font-mono text-xs font-semibold flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                      <span>Switch / Connect Wallet</span>
                    </div>
                    <span className="text-[10px] text-slate-500">&rarr;</span>
                  </button>

                  {/* STELLAR EXPERT EXPLORER */}
                  {wallet.address && (
                    <a
                      href={`https://stellar.expert/explorer/testnet/account/${wallet.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full p-2 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-slate-400 hover:text-white font-mono text-xs flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Globe className="w-3.5 h-3.5 text-slate-400" />
                        <span>View on Stellar.Expert</span>
                      </div>
                      <ExternalLink className="w-3 h-3 text-slate-500" />
                    </a>
                  )}

                </div>

              </div>
            )}

          </div>

        </div>

      </div>

      {/* MOBILE NAV BOTTOM STRIP */}
      <div className="md:hidden flex items-center justify-around bg-slate-900/90 border-t border-slate-800/80 px-2 py-1.5">
        {navItems.map(item => {
          const isActive = currentMode === item.mode;
          return (
            <button
              key={item.mode}
              onClick={() => {
                soundManager.playClick();
                onSelectMode(item.mode);
              }}
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg text-[10px] font-medium ${
                isActive ? 'text-amber-400 font-bold' : 'text-slate-400'
              }`}
            >
              {item.icon}
              <span>{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
