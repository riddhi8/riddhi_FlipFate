'use client';

import React, { useState, useEffect } from 'react';
import { checkFreighterInstalled, connectFreighterWallet, fetchHorizonBalance } from '../lib/freighter';
import { soundManager } from '../lib/sounds';
import { WalletState } from '../lib/types';
import { 
  Sparkles, 
  ExternalLink, 
  Check, 
  X, 
  RefreshCw, 
  Zap, 
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

interface FreighterWelcomePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onWalletConnected: (state: Partial<WalletState>) => void;
  onUseSimulator: () => void;
}

export const FreighterWelcomePopup: React.FC<FreighterWelcomePopupProps> = ({
  isOpen,
  onClose,
  onWalletConnected,
  onUseSimulator,
}) => {
  const [isFreighterInstalled, setIsFreighterInstalled] = useState<boolean | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const checkExt = async () => {
      const installed = await checkFreighterInstalled();
      setIsFreighterInstalled(installed);
    };
    checkExt();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConnectFreighter = async () => {
    soundManager.playClick();
    setIsConnecting(true);
    setErrorMsg(null);

    const res = await connectFreighterWallet();
    setIsConnecting(false);

    if (res.error) {
      setErrorMsg(res.error);
      return;
    }

    if (res.address) {
      soundManager.playWin();
      let balance = 1000;
      try {
        const liveBal = await fetchHorizonBalance(res.address, res.network || 'TESTNET');
        if (liveBal > 0) balance = liveBal;
      } catch {
        // default 1000
      }

      onWalletConnected({
        connected: true,
        address: res.address,
        network: res.network?.toLowerCase().includes('pub') ? 'mainnet' : 'testnet',
        walletType: 'freighter',
        balance,
      });
      onClose();
    }
  };

  const handleContinueWithSimulator = () => {
    soundManager.playClick();
    onUseSimulator();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-300">
      
      {/* GLOWING AURA */}
      <div className="absolute w-[500px] h-[500px] bg-gradient-to-r from-cyan-500/20 via-amber-500/20 to-purple-600/20 rounded-full filter blur-[100px] pointer-events-none animate-pulse" />

      {/* MODAL CARD */}
      <div className="relative w-full max-w-md rounded-3xl bg-slate-900/95 border border-cyan-500/40 p-6 sm:p-8 shadow-[0_0_50px_rgba(6,182,212,0.25)] space-y-6 overflow-hidden">
        
        {/* TOP ACCENT BAR */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-400 via-amber-400 to-purple-500" />

        {/* CLOSE BUTTON */}
        <button
          onClick={() => {
            soundManager.playClick();
            onClose();
          }}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* HERO ICON & BADGE */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 via-teal-400 to-amber-300 p-0.5 shadow-xl shadow-cyan-500/30 flex items-center justify-center animate-bounce">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-3xl">
                🚀
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 border-2 border-slate-950 flex items-center justify-center">
              <ShieldCheck className="w-3 h-3 text-slate-950 stroke-[3]" />
            </div>
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold mb-2">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>STELLAR SOROBAN DAPP</span>
            </div>
            
            <h3 className="text-2xl font-black text-white tracking-tight font-sans">
              Connect Freighter Wallet
            </h3>
            
            <p className="text-xs text-slate-400 font-mono mt-1.5 leading-relaxed">
              Connect your official Freighter browser extension to play on-chain provably fair coin flips and save your fate chronicle.
            </p>
          </div>
        </div>

        {/* STATUS BOX */}
        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Freighter Extension:</span>
            <span className={`font-bold flex items-center gap-1.5 ${
              isFreighterInstalled 
                ? 'text-emerald-400' 
                : isFreighterInstalled === false 
                ? 'text-amber-400' 
                : 'text-slate-400'
            }`}>
              {isFreighterInstalled ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Detected in Browser</span>
                </>
              ) : isFreighterInstalled === false ? (
                <span>Not Detected</span>
              ) : (
                <span>Scanning...</span>
              )}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Target Network:</span>
            <span className="text-cyan-300 font-bold">Soroban Testnet (Futurenet)</span>
          </div>
        </div>

        {/* ERROR MESSAGE IF ANY */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono">
            {errorMsg}
          </div>
        )}

        {/* ACTIONS */}
        <div className="space-y-3">
          
          {/* PRIMARY: CONNECT FREIGHTER */}
          <button
            type="button"
            disabled={isConnecting}
            onClick={handleConnectFreighter}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-400 to-indigo-600 text-slate-950 font-mono font-black text-sm tracking-wider uppercase transition-all duration-300 hover:brightness-110 shadow-xl shadow-cyan-500/30 flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            {isConnecting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                <span>Authorizing in Freighter...</span>
              </>
            ) : (
              <>
                <span>🚀 Open & Connect Freighter</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* IF NOT INSTALLED: DOWNLOAD LINK */}
          {isFreighterInstalled === false && (
            <a
              href="https://www.freighter.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 border border-cyan-500/30 text-cyan-300 font-mono text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <span>Install Freighter Extension</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

          {/* SECONDARY: TESTNET SANDBOX SIMULATOR */}
          <button
            type="button"
            onClick={handleContinueWithSimulator}
            className="w-full py-3 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 text-slate-300 hover:text-white font-mono text-xs font-semibold transition-all flex items-center justify-center gap-2"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Continue with Instant Testnet Sandbox (1,000 FLIP)</span>
          </button>

        </div>

      </div>

    </div>
  );
};
