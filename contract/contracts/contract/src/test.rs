#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Env, String};

#[test]
fn test_flip_fate_basic_flow() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(FlipFateContract, ());
    let client = FlipFateContractClient::new(&env, &contract_id);

    let user = Address::generate(&env);

    // Initial stats should be empty
    let initial_stats = client.get_user_stats(&user);
    assert_eq!(initial_stats.total_flips, 0);
    assert_eq!(initial_stats.wins, 0);
    assert_eq!(initial_stats.losses, 0);

    // Execute first flip with 100 stroops wager on Solar (0)
    let record1 = client.flip(&user, &0, &100, &12345);
    assert_eq!(record1.bet_amount, 100);
    assert_eq!(record1.user, user);

    let stats_after1 = client.get_user_stats(&user);
    assert_eq!(stats_after1.total_flips, 1);
    assert_eq!(stats_after1.total_wagered, 100);

    if record1.won {
        assert_eq!(stats_after1.wins, 1);
        assert_eq!(stats_after1.current_streak, 1);
        assert_eq!(record1.payout, 196); // 1.96x
        assert_eq!(stats_after1.total_won, 196);
    } else {
        assert_eq!(stats_after1.losses, 1);
        assert_eq!(stats_after1.current_streak, 0);
        assert_eq!(record1.payout, 0);
    }

    // Check user flips history
    let flips = client.get_user_flips(&user);
    assert_eq!(flips.len(), 1);
    assert_eq!(flips.get(0).unwrap().id, record1.id);
}

#[test]
fn test_multiple_flips_and_global_stats() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(FlipFateContract, ());
    let client = FlipFateContractClient::new(&env, &contract_id);

    let alice = Address::generate(&env);
    let bob = Address::generate(&env);

    // Alice flips 3 times
    client.flip(&alice, &0, &500, &111);
    client.flip(&alice, &1, &500, &222);
    client.flip(&alice, &0, &1000, &333);

    // Bob flips 2 times
    client.flip(&bob, &1, &200, &444);
    client.flip(&bob, &0, &300, &555);

    let alice_stats = client.get_user_stats(&alice);
    let bob_stats = client.get_user_stats(&bob);

    assert_eq!(alice_stats.total_flips, 3);
    assert_eq!(alice_stats.total_wagered, 2000);

    assert_eq!(bob_stats.total_flips, 2);
    assert_eq!(bob_stats.total_wagered, 500);

    let global_stats = client.get_global_stats();
    assert_eq!(global_stats.total_flips, 5);
    assert_eq!(global_stats.total_volume, 2500);
}

#[test]
fn test_fate_dilemmas_creation_and_resolution() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(FlipFateContract, ());
    let client = FlipFateContractClient::new(&env, &contract_id);

    let user = Address::generate(&env);

    let title = String::from_str(&env, "Launch FlipFate Mainnet?");
    let opt_a = String::from_str(&env, "Deploy Today");
    let opt_b = String::from_str(&env, "Audit More");
    let context = String::from_str(&env, "Soroban Smart Contract is ready");

    let dilemma_id = client.create_fate_dilemma(&user, &title, &opt_a, &opt_b, &context);
    assert_eq!(dilemma_id, 0);

    let dilemmas = client.get_dilemmas(&user);
    assert_eq!(dilemmas.len(), 1);
    assert_eq!(dilemmas.get(0).unwrap().title, title);
    assert!(!dilemmas.get(0).unwrap().resolved);

    // Resolve the dilemma
    let resolved = client.resolve_fate_dilemma(&user, &0, &9999);
    assert!(resolved.resolved);
    assert!(resolved.chosen_outcome == 0 || resolved.chosen_outcome == 1);

    // Verify storage reflects resolved
    let dilemmas_after = client.get_dilemmas(&user);
    assert!(dilemmas_after.get(0).unwrap().resolved);
}
