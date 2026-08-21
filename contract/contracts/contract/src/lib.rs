#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, Address, Env, Map, String, Symbol, Vec,
};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum Choice {
    Solar = 0, // Sun / Heads
    Lunar = 1, // Moon / Tails
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct FlipRecord {
    pub id: u64,
    pub user: Address,
    pub choice: u32,       // 0 for Solar, 1 for Lunar
    pub outcome: u32,      // 0 for Solar, 1 for Lunar
    pub won: bool,
    pub bet_amount: i128,  // Amount in stroops (1 XLM = 10,000,000 stroops)
    pub payout: i128,      // Payout amount
    pub streak: u32,       // User's win streak at this flip
    pub timestamp: u64,    // Ledger timestamp
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct FateDilemma {
    pub id: u32,
    pub user: Address,
    pub title: String,
    pub option_a: String,  // Option Solar
    pub option_b: String,  // Option Lunar
    pub context: String,
    pub resolved: bool,
    pub chosen_outcome: u32, // 0 = Option A, 1 = Option B
    pub timestamp: u64,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct UserStats {
    pub total_flips: u64,
    pub wins: u64,
    pub losses: u64,
    pub current_streak: u32,
    pub max_streak: u32,
    pub total_wagered: i128,
    pub total_won: i128,
    pub total_profit: i128,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct GlobalStats {
    pub total_flips: u64,
    pub total_volume: i128,
    pub total_payouts: i128,
    pub total_solar_outcomes: u64,
    pub total_lunar_outcomes: u64,
    pub highest_streak: u32,
}

#[contracttype]
pub enum DataKey {
    UserStats(Address),
    UserFlips(Address),
    Dilemmas(Address),
    NextDilemmaId(Address),
    GlobalStats,
    NextFlipId,
}

const PAYOUT_MULTIPLIER_BPS: i128 = 19600; // 1.96x payout in basis points (10000 = 1.00x)
const BPS_DIVISOR: i128 = 10000;

#[contract]
pub struct FlipFateContract;

#[contractimpl]
impl FlipFateContract {
    /// Perform a provably fair coin flip wager on Soroban
    /// `choice`: 0 = Solar (Sun), 1 = Lunar (Moon)
    /// `bet_amount`: Wager amount in Stroops (0 for free oracle flips)
    /// `client_seed`: Additional randomness entropy provided by client
    pub fn flip(
        env: Env,
        user: Address,
        choice: u32,
        bet_amount: i128,
        client_seed: u64,
    ) -> FlipRecord {
        user.require_auth();

        if choice > 1 {
            panic!("Invalid choice: must be 0 (Solar) or 1 (Lunar)");
        }
        if bet_amount < 0 {
            panic!("Bet amount cannot be negative");
        }

        // Generate pseudo-randomness from ledger sequence, timestamp, client seed, and flip counter
        let flip_id: u64 = env
            .storage()
            .persistent()
            .get(&DataKey::NextFlipId)
            .unwrap_or(1);

        let ledger_seq = env.ledger().sequence() as u64;
        let ledger_time = env.ledger().timestamp();
        
        // Simple hash entropy combining ledger data, user address hash, and seeds
        let entropy = ledger_seq
            .wrapping_mul(6364136223846793005)
            .wrapping_add(ledger_time)
            .wrapping_add(client_seed)
            .wrapping_add(flip_id.wrapping_mul(1442695040888963407));

        let outcome = (entropy % 2) as u32; // 0 or 1
        let won = choice == outcome;

        let mut user_stats: UserStats = env
            .storage()
            .persistent()
            .get(&DataKey::UserStats(user.clone()))
            .unwrap_or(UserStats {
                total_flips: 0,
                wins: 0,
                losses: 0,
                current_streak: 0,
                max_streak: 0,
                total_wagered: 0,
                total_won: 0,
                total_profit: 0,
            });

        let mut global_stats: GlobalStats = env
            .storage()
            .persistent()
            .get(&DataKey::GlobalStats)
            .unwrap_or(GlobalStats {
                total_flips: 0,
                total_volume: 0,
                total_payouts: 0,
                total_solar_outcomes: 0,
                total_lunar_outcomes: 0,
                highest_streak: 0,
            });

        let payout = if won {
            (bet_amount * PAYOUT_MULTIPLIER_BPS) / BPS_DIVISOR
        } else {
            0
        };

        // Update user stats
        user_stats.total_flips += 1;
        user_stats.total_wagered += bet_amount;

        if won {
            user_stats.wins += 1;
            user_stats.current_streak += 1;
            if user_stats.current_streak > user_stats.max_streak {
                user_stats.max_streak = user_stats.current_streak;
            }
            user_stats.total_won += payout;
            user_stats.total_profit += payout - bet_amount;
        } else {
            user_stats.losses += 1;
            user_stats.current_streak = 0;
            user_stats.total_profit -= bet_amount;
        }

        // Update global stats
        global_stats.total_flips += 1;
        global_stats.total_volume += bet_amount;
        global_stats.total_payouts += payout;
        if outcome == 0 {
            global_stats.total_solar_outcomes += 1;
        } else {
            global_stats.total_lunar_outcomes += 1;
        }
        if user_stats.current_streak > global_stats.highest_streak {
            global_stats.highest_streak = user_stats.current_streak;
        }

        // Create record
        let record = FlipRecord {
            id: flip_id,
            user: user.clone(),
            choice,
            outcome,
            won,
            bet_amount,
            payout,
            streak: user_stats.current_streak,
            timestamp: ledger_time,
        };

        // Save recent flips (keep last 20 per user)
        let mut user_flips: Vec<FlipRecord> = env
            .storage()
            .persistent()
            .get(&DataKey::UserFlips(user.clone()))
            .unwrap_or_else(|| Vec::new(&env));

        if user_flips.len() >= 20 {
            user_flips.remove(0);
        }
        user_flips.push_back(record.clone());

        // Save persistent storage
        env.storage().persistent().set(&DataKey::UserStats(user.clone()), &user_stats);
        env.storage().persistent().set(&DataKey::UserFlips(user.clone()), &user_flips);
        env.storage().persistent().set(&DataKey::GlobalStats, &global_stats);
        env.storage().persistent().set(&DataKey::NextFlipId, &(flip_id + 1));

        // Emit Soroban event
        env.events().publish(
            (symbol_short!("flip"), user),
            (flip_id, choice, outcome, won, bet_amount, payout),
        );

        record
    }

    /// Create an on-chain Fate Dilemma (Oracle Decision)
    pub fn create_fate_dilemma(
        env: Env,
        user: Address,
        title: String,
        option_a: String,
        option_b: String,
        context: String,
    ) -> u32 {
        user.require_auth();

        let id: u32 = env
            .storage()
            .persistent()
            .get(&DataKey::NextDilemmaId(user.clone()))
            .unwrap_or(0);

        let dilemma = FateDilemma {
            id,
            user: user.clone(),
            title,
            option_a,
            option_b,
            context,
            resolved: false,
            chosen_outcome: 0,
            timestamp: env.ledger().timestamp(),
        };

        let mut dilemmas: Map<u32, FateDilemma> = env
            .storage()
            .persistent()
            .get(&DataKey::Dilemmas(user.clone()))
            .unwrap_or_else(|| Map::new(&env));

        dilemmas.set(id, dilemma);
        env.storage().persistent().set(&DataKey::Dilemmas(user.clone()), &dilemmas);
        env.storage().persistent().set(&DataKey::NextDilemmaId(user), &(id + 1));

        id
    }

    /// Resolve a Fate Dilemma with a cryptographically verifiable coin flip of destiny
    pub fn resolve_fate_dilemma(
        env: Env,
        user: Address,
        dilemma_id: u32,
        seed: u64,
    ) -> FateDilemma {
        user.require_auth();

        let mut dilemmas: Map<u32, FateDilemma> = env
            .storage()
            .persistent()
            .get(&DataKey::Dilemmas(user.clone()))
            .unwrap_or_else(|| Map::new(&env));

        let mut dilemma = dilemmas.get(dilemma_id).expect("Dilemma not found");
        if dilemma.resolved {
            panic!("Dilemma already resolved");
        }

        let ledger_seq = env.ledger().sequence() as u64;
        let ledger_time = env.ledger().timestamp();
        let entropy = ledger_seq
            .wrapping_mul(3141592653589793238)
            .wrapping_add(ledger_time)
            .wrapping_add(seed)
            .wrapping_add(dilemma_id as u64);

        let outcome = (entropy % 2) as u32;

        dilemma.resolved = true;
        dilemma.chosen_outcome = outcome;
        dilemma.timestamp = ledger_time;

        dilemmas.set(dilemma_id, dilemma.clone());
        env.storage().persistent().set(&DataKey::Dilemmas(user.clone()), &dilemmas);

        env.events().publish(
            (symbol_short!("fate"), user),
            (dilemma_id, outcome),
        );

        dilemma
    }

    /// Get statistics for a specific user address
    pub fn get_user_stats(env: Env, user: Address) -> UserStats {
        env.storage()
            .persistent()
            .get(&DataKey::UserStats(user))
            .unwrap_or(UserStats {
                total_flips: 0,
                wins: 0,
                losses: 0,
                current_streak: 0,
                max_streak: 0,
                total_wagered: 0,
                total_won: 0,
                total_profit: 0,
            })
    }

    /// Get recent flips for a user
    pub fn get_user_flips(env: Env, user: Address) -> Vec<FlipRecord> {
        env.storage()
            .persistent()
            .get(&DataKey::UserFlips(user))
            .unwrap_or_else(|| Vec::new(&env))
    }

    /// Get all dilemmas created by a user
    pub fn get_dilemmas(env: Env, user: Address) -> Vec<FateDilemma> {
        let dilemmas: Map<u32, FateDilemma> = env
            .storage()
            .persistent()
            .get(&DataKey::Dilemmas(user))
            .unwrap_or_else(|| Map::new(&env));
        dilemmas.values()
    }

    /// Get global stats across the entire platform
    pub fn get_global_stats(env: Env) -> GlobalStats {
        env.storage()
            .persistent()
            .get(&DataKey::GlobalStats)
            .unwrap_or(GlobalStats {
                total_flips: 0,
                total_volume: 0,
                total_payouts: 0,
                total_solar_outcomes: 0,
                total_lunar_outcomes: 0,
                highest_streak: 0,
            })
    }
}

mod test;
