# 🪙 FlipFate — Decentralized Web3 Coin Flip & Fate Oracle

<div align="center">

![FlipFate Banner](https://img.shields.io/badge/Platform-Stellar%20Soroban-blueviolet?style=for-the-badge&logo=stellar)
![Next.js 16](https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js)
![React 19](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react)
![Rust Smart Contract](https://img.shields.io/badge/Rust-Soroban%20SDK-orange?style=for-the-badge&logo=rust)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS%204-38B2AC?style=for-the-badge&logo=tailwind-css)
![Provably Fair](https://img.shields.io/badge/Provably%20Fair-SHA--256-emerald?style=for-the-badge&logo=securityscorecard)

**FlipFate** is a decentralized Web3 gaming and decision-making platform powered by Stellar Soroban smart contracts. It combines provably fair coin flip wagers, an on-chain cosmic fate dilemma oracle, high-stakes streak arenas, physics-based 3D coin animations, and a real-time Web Audio synthesizer.

[Getting Started](#-getting-started-localhost) • [Features](#-features) • [Smart Contract](#-smart-contract-soroban) • [Provably Fair Engine](#-provably-fair-algorithm) • [Architecture](#-architecture)

</div>

---

## 🌟 Features

### 1. 🪙 Classic Coin Flip
- **Cosmic Alignments**: Choose between **Solar (☀️ Heads)** and **Lunar (🌙 Tails)**.
- **Fair Payouts**: 1.96x multiplier with instant balance settlements.
- **Quick-Bet Presets**: 10, 25, 50, 100, 250, 500 FLIP chips with `1/2`, `2X`, and `MAX` modifiers.
- **Dynamic 3D Physics Animation**: Smooth perspective-based 3D coin flips with metallic specular reflections and gold/cyan particle glows.

### 2. 🔮 The Fate Oracle (Dilemma Decision Engine)
- **Life & Crypto Dilemmas**: Submit questions like *"Should I buy the Stellar dip?"*, *"Launch to mainnet today?"*, or *"Accept the new job offer?"*.
- **Cryptographic Destiny**: Casts the coin of fate to resolve dilemmas into permanent on-chain verdict logs.
- **Chronicle of Fate**: An immutable history of all past decreed decisions with timestamps and category tags.

### 3. 🔥 Streak Arena (High-Roller Multipliers)
- **Streak Challenge**: Chain consecutive winning flips to climb exponential payout tiers:
  - **Step 1**: `1.95x`
  - **Step 2**: `3.85x`
  - **Step 3**: `7.60x`
  - **Step 4**: `15.00x`
  - **Step 5 (Grand Jackpot)**: `30.00x 👑`
- **Cash Out or Double Down**: Secure your pot at any step or risk it for the 30x jackpot.

### 4. ⚔️ Fate Duel (PvP High Stakes)
- Challenge rival players in real-time or simulate PvP duels with dynamic pots and winner-take-all mechanics.

### 5. 🛡️ Provably Fair Cryptographic Engine
- Every flip outcome is cryptographically deterministic and verifiable using:
  $$\text{Outcome} = \text{SHA-256}(\text{Server Seed} + \text{Client Seed} + \text{Nonce})$$
- Live verification modal to verify past flips with zero trust required.

### 6. 👛 Stellar & Freighter Wallet Integration
- Native Freighter browser wallet connection.
- Testnet faucet claimer (100 FLIP airdrop) and local wallet balance fallback.

### 7. 🔊 Web Audio Synthesizer
- Procedural real-time Web Audio API sound effects for flips, metallic rings, wins, losses, and jackpot bursts with volume and mute toggles.

---

## 🚀 Getting Started (Localhost)

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation
```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 Smart Contract (Soroban)

The smart contract is written in Rust using Soroban SDK and located in [`contract/`](contract/):

```bash
cd contract
cargo build --target wasm32-unknown-unknown --release
```

---

## 📄 License
MIT License. Built for the Stellar Soroban Ecosystem.

