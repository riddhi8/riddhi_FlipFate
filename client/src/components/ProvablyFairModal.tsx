'use client';

import React, { useState } from 'react';
import { verifyFlip, sha256 } from '../lib/provablyFair';
import { soundManager } from '../lib/sounds';
import { ShieldCheck, Copy, Check, Calculator, RefreshCw, X, Key, Lock, Hash } from 'lucide-react';

interface ProvablyFairModalProps {
  isOpen: boolean;
  onClose: () => void;
  serverSeedHash: string;
  clientSeed: string;
  nonce: number;
  onUpdateClientSeed: (newSeed: string) => void;
}

export const ProvablyFairModal: React.FC<ProvablyFairModalProps> = ({
  isOpen,
  onClose,
  serverSeedHash,
  clientSeed,
  nonce,
  onUpdateClientSeed,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [editableClientSeed, setEditableClientSeed] = useState(clientSeed);

  // Verifier tool state
  const [verifyServerSeed, setVerifyServerSeed] = useState('');
  const [verifyServerHash, setVerifyServerHash] = useState('');
  const [verifyClientSeed, setVerifyClientSeed] = useState('');
  const [verifyNonce, setVerifyNonce] = useState(1);
  const [verifyResult, setVerifyResult] = useState<{
    validHash: boolean;
    calculatedOutcome: string;
    rawHash: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, fieldName: string) => {
    soundManager.playClick();
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSaveClientSeed = () => {
    soundManager.playClick();
    onUpdateClientSeed(editableClientSeed);
  };

  const handleRunVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyServerSeed.trim()) return;

    soundManager.playClick();
    const result = await verifyFlip(
      verifyServerSeed.trim(),
      verifyServerHash.trim(),
      verifyClientSeed.trim(),
      verifyNonce
    );
    setVerifyResult(result);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
        
        {/* CLOSE BUTTON */}
        <button
          onClick={() => {
            soundManager.playClick();
            onClose();
          }}
          className="absolute top-6 right-6 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* TITLE */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white font-sans">
              Provably Fair Verification
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              SHA-256 Verifiable Randomness & Cryptographic Seeds
            </p>
          </div>
        </div>

        {/* ACTIVE GAME SEEDS */}
        <div className="space-y-4 mb-8">
          
          {/* SERVER SEED HASH */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-mono font-bold text-slate-400 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Active Server Seed Hash (SHA-256)</span>
              </label>
              <button
                type="button"
                onClick={() => handleCopy(serverSeedHash, 'serverSeedHash')}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 font-mono flex items-center gap-1"
              >
                {copiedField === 'serverSeedHash' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedField === 'serverSeedHash' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="text-xs font-mono text-slate-300 break-all bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
              {serverSeedHash}
            </div>
            <p className="text-[10px] text-slate-500 font-mono mt-1.5">
              * The server seed is hashed before each flip so it cannot be altered after you place your choice.
            </p>
          </div>

          {/* CLIENT SEED & NONCE */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 p-4 rounded-2xl bg-slate-950 border border-slate-800/80">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-mono font-bold text-slate-400 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  <span>Your Client Seed</span>
                </label>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={editableClientSeed}
                  onChange={(e) => setEditableClientSeed(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                />
                <button
                  type="button"
                  onClick={handleSaveClientSeed}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono font-bold text-xs shrink-0"
                >
                  Save
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80">
              <label className="text-xs font-mono font-bold text-slate-400 flex items-center gap-1.5 mb-1.5">
                <Hash className="w-3.5 h-3.5 text-cyan-400" />
                <span>Flip Nonce</span>
              </label>
              <div className="text-base font-black font-mono text-cyan-300 bg-slate-900/90 p-2 rounded-xl border border-slate-800 text-center">
                #{nonce}
              </div>
            </div>
          </div>

        </div>

        {/* VERIFICATION CALCULATOR */}
        <div className="p-5 rounded-2xl bg-slate-950/80 border border-emerald-500/20">
          <div className="flex items-center gap-2 mb-3">
            <Calculator className="w-4 h-4 text-emerald-400" />
            <h4 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              Verify Any Past Flip
            </h4>
          </div>

          <form onSubmit={handleRunVerification} className="space-y-3">
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">
                Unhashed Server Seed (Revealed after flip)
              </label>
              <input
                type="text"
                required
                value={verifyServerSeed}
                onChange={(e) => setVerifyServerSeed(e.target.value)}
                placeholder="Paste unhashed server seed"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">
                  Client Seed
                </label>
                <input
                  type="text"
                  required
                  value={verifyClientSeed}
                  onChange={(e) => setVerifyClientSeed(e.target.value)}
                  placeholder="Client seed string"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">
                  Nonce
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={verifyNonce}
                  onChange={(e) => setVerifyNonce(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Verify Mathematical Outcome</span>
            </button>
          </form>

          {verifyResult && (
            <div className="mt-4 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Calculated Outcome:</span>
                <span className={`font-black ${
                  verifyResult.calculatedOutcome === 'SOLAR' ? 'text-amber-400' : 'text-cyan-400'
                }`}>
                  {verifyResult.calculatedOutcome === 'SOLAR' ? '☀️ SOLAR (Heads)' : '🌙 LUNAR (Tails)'}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 break-all">
                Computed Hash: {verifyResult.rawHash}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
