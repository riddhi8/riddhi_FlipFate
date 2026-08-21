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

### 4. ⚖️ Provably Fair Cryptography
- **Pre-commitment Hashing**: SHA-256 server seed hash is committed and displayed *before* placing any bet.
- **Client Seed Freedom**: Players can customize their client seed at any time.
- **Built-in Verification Calculator**: Paste past server seeds, client seeds, and nonces to mathematically verify outcomes on the spot.

### 5. 🔊 Pure Web Audio API Sound Synthesizer
- **Zero Asset Latency**: 100% synthesized sound effects generated in real-time in code (no external MP3/WAV files needed).
- **Sound Effects**: Spinning coin whooshes, harmonic coin landings, celestial win arpeggios, streak level-up fanfares, and tactile UI clicks.
- **One-Click Mute**: Instant audio toggle in the top navigation bar.

### 6. 💼 Multi-Wallet & Faucet Integration
- **Supported Wallets**: Freighter Browser Extension, Albedo Signer, and Built-in Instant Simulator.
- **Testnet Faucet**: Instant `+500`, `+1,000`, or `+5,000` FLIP demo token refills.

### 7. 📊 Destiny Analytics & High-Rollers Leaderboard
- **Performance Metrics**: Win rate percentage, total volume wagered, total payouts, net profit/loss.
- **Solar vs Lunar Ratio**: Live distribution progress bar tracking coin face frequency.
- **Global Leaderboard**: Highlights top streak holders and jackpot winners.

---

## 🚀 Getting Started (Localhost)

### Prerequisites
- [Node.js](https://nodejs.org/) v18.0.0 or higher
- [npm](https://www.npmjs.com/) v9.0.0 or higher

### 1. Installation

Clone the repository and install dependencies:

```bash
# Navigate to the client directory
cd client

# Install dependencies
npm install
```

### 2. Run on Localhost

Start the Next.js development server:

```bash
npm run dev
```

Open your browser and navigate to:
```
http://localhost:3000
```

### 3. Production Build

To verify and create a production build:

```bash
npm run build
npm run start
```

---

## 📜 Smart Contract (Soroban / Rust)

The Soroban smart contract is located under `contract/contracts/contract/src/lib.rs`.

### Contract Functions:

```rust
// 1. Perform a provably fair coin flip wager
pub fn flip(
    env: Env, 
    user: Address, 
    choice: u32, 
    bet_amount: i128, 
    client_seed: u64
) -> FlipRecord;

// 2. Create an on-chain Fate Dilemma
pub fn create_fate_dilemma(
    env: Env,
    user: Address,
    title: String,
    option_a: String,
    option_b: String,
    context: String,
) -> u32;

// 3. Resolve a Fate Dilemma with a cryptographic coin flip
pub fn resolve_fate_dilemma(
    env: Env,
    user: Address,
    dilemma_id: u32,
    seed: u64,
) -> FateDilemma;

// 4. Retrieve user statistics
pub fn get_user_stats(env: Env, user: Address) -> UserStats;

// 5. Retrieve global platform statistics
pub fn get_global_stats(env: Env) -> GlobalStats;
```

### Testing the Smart Contract

To run the unit tests in Rust:

```bash
cd contract/contracts/contract
cargo test
```

---

## 🔐 Provably Fair Algorithm

FlipFate calculates all outcomes deterministically using SHA-256 HMAC-style hashing:

$$\text{Combined String} = \text{ServerSeed} + \text{":"} + \text{ClientSeed} + \text{":"} + \text{Nonce}$$
$$\text{Hash} = \text{SHA-256}(\text{Combined String})$$
$$\text{Outcome} = \begin{cases} \text{SOLAR (0)}, & \text{if } \text{hex\_to\_int}(\text{Hash}[0..8]) \pmod 2 = 0 \\ \text{LUNAR (1)}, & \text{if } \text{hex\_to\_int}(\text{Hash}[0..8]) \pmod 2 = 1 \end{cases}$$

Before every flip, the client is shown $\text{SHA-256}(\text{ServerSeed})$. Once the flip completes, the unhashed $\text{ServerSeed}$ is revealed, proving the game did not manipulate the outcome.

---

## 🏗️ Project Structure

```text
FlipFate/
├── client/                     # Next.js 16 + React 19 Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── globals.css     # 3D transforms, animations, theme tokens
│   │   │   ├── layout.tsx      # Root HTML metadata and dark mode layout
│   │   │   └── page.tsx        # Master FlipFate dApp orchestrator
│   │   ├── components/
│   │   │   ├── ClassicFlip.tsx # Classic wager coin flip module
│   │   │   ├── Coin3D.tsx      # 3D realistic spinning coin component
│   │   │   ├── FateOracle.tsx  # Oracle decision dilemma creator & chronicle
│   │   │   ├── Navbar.tsx      # Sticky header, mode tabs, audio, wallet
│   │   │   ├── ProvablyFairModal.tsx # Seed inspector & verifier tool
│   │   │   ├── RecentFlipsTicker.tsx # Live activity feed ticker
│   │   │   ├── StatsDrawer.tsx # Performance analytics & leaderboard
│   │   │   ├── StreakArena.tsx # 30x multi-tier streak survival game
│   │   │   └── WalletModal.tsx # Freighter / Albedo / Testnet wallet
│   │   └── lib/
│   │       ├── provablyFair.ts # SHA-256 cryptographic verification engine
│   │       ├── sounds.ts       # Web Audio API sound synthesizer
│   │       └── types.ts        # TypeScript interfaces and data models
│   ├── package.json
│   └── tsconfig.json
│
├── contract/                   # Soroban Smart Contract (Rust)
│   ├── contracts/
│   │   └── contract/
│   │       ├── src/
│   │       │   ├── lib.rs      # FlipFate Soroban Contract implementation
│   │       │   └── test.rs     # Comprehensive smart contract tests
│   │       └── Cargo.toml
│   └── Cargo.toml
│
└── README.md                   # Project documentation
```

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS 4, Glassmorphism, 3D CSS Perspective Transforms
- **Audio Engine**: Web Audio API (Programmatic synthesis)
- **Cryptography**: Web Crypto API (SubtleCrypto SHA-256)
- **Visual FX**: Canvas Confetti, Glowing SVG Vectors
- **Icons**: Lucide React
- **Smart Contract**: Stellar Soroban SDK (Rust)

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
