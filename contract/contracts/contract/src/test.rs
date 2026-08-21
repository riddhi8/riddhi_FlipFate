#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Env, String};

#[test]
fn test_add_and_get_tasks() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let user = Address::generate(&env);
    let id0 = client.add_task(&user, &String::from_str(&env, "Buy milk"));
    let id1 = client.add_task(&user, &String::from_str(&env, "Walk dog"));

    assert_eq!(id0, 0);
    assert_eq!(id1, 1);

    let tasks = client.get_tasks(&user);
    assert_eq!(tasks.len(), 2);
    assert_eq!(
        tasks.get(0).unwrap().content,
        String::from_str(&env, "Buy milk")
    );
    assert!(!tasks.get(0).unwrap().done);
    assert_eq!(
        tasks.get(1).unwrap().content,
        String::from_str(&env, "Walk dog")
    );
}

#[test]
fn test_toggle_task() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let user = Address::generate(&env);
    client.add_task(&user, &String::from_str(&env, "Ship it"));

    client.toggle_task(&user, &0);
    let tasks = client.get_tasks(&user);
    assert!(tasks.get(0).unwrap().done);

    // Toggle back off
    client.toggle_task(&user, &0);
    let tasks = client.get_tasks(&user);
    assert!(!tasks.get(0).unwrap().done);
}

#[test]
fn test_delete_task() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let user = Address::generate(&env);
    client.add_task(&user, &String::from_str(&env, "First"));
    client.add_task(&user, &String::from_str(&env, "Second"));

    client.delete_task(&user, &0);
    let tasks = client.get_tasks(&user);
    assert_eq!(tasks.len(), 1);
    assert_eq!(
        tasks.get(0).unwrap().content,
        String::from_str(&env, "Second")
    );
}

#[test]
fn test_users_are_isolated() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let alice = Address::generate(&env);
    let bob = Address::generate(&env);

    client.add_task(&alice, &String::from_str(&env, "Alice task"));
    client.add_task(&bob, &String::from_str(&env, "Bob task"));
    client.add_task(&bob, &String::from_str(&env, "Bob task 2"));

    assert_eq!(client.get_tasks(&alice).len(), 1);
    assert_eq!(client.get_tasks(&bob).len(), 2);
    // IDs are per-user
    let id = client.add_task(&alice, &String::from_str(&env, "Alice task 2"));
    assert_eq!(id, 1);
}

#[test]
fn test_empty_user_returns_empty_vec() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let user = Address::generate(&env);
    assert_eq!(client.get_tasks(&user).len(), 0);
}
