export type CoinChoice = 'SOLAR' | 'LUNAR';

export type GameMode = 'CLASSIC' | 'DUEL' | 'ORACLE' | 'STREAK' | 'PROVABLY_FAIR' | 'STATS';

export interface FlipRecord {
  id: string;
  timestamp: number;
  choice: CoinChoice;
  outcome: CoinChoice;
  won: boolean;
  betAmount: number;
  payout: number;
  streak: number;
  serverSeedHash: string;
  serverSeed?: string;
  clientSeed: string;
  nonce: number;
  mode: 'CLASSIC' | 'STREAK' | 'ORACLE';
  dilemmaTitle?: string;
}

export interface FateDilemma {
  id: string;
  timestamp: number;
  title: string;
  optionSolar: string;
  optionLunar: string;
  category: string;
  resolved: boolean;
  chosenOutcome?: CoinChoice;
  chosenOptionText?: string;
}

export interface UserStats {
  totalFlips: number;
  wins: number;
  losses: number;
  winRate: number;
  currentStreak: number;
  maxStreak: number;
  totalWagered: number;
  totalWon: number;
  netProfit: number;
  solarCount: number;
  lunarCount: number;
}

export interface WalletState {
  connected: boolean;
  address: string | null;
  balance: number;
  network: 'testnet' | 'futurenet' | 'mainnet';
  walletType: 'freighter' | 'albedo' | 'simulator';
}

export interface StreakState {
  active: boolean;
  initialBet: number;
  currentPot: number;
  currentStep: number;
  steps: {
    multiplier: number;
    payout: number;
  }[];
}
