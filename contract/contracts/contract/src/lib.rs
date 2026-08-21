#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Map, String, Vec};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Task {
    pub id: u32,
    pub content: String,
    pub done: bool,
}

#[contracttype]
pub enum DataKey {
    Tasks(Address),
    NextId(Address),
}

#[contract]
pub struct Contract;

#[contractimpl]
impl Contract {
    pub fn add_task(env: Env, user: Address, content: String) -> u32 {
        user.require_auth();
        let id: u32 = env
            .storage()
            .persistent()
            .get(&DataKey::NextId(user.clone()))
            .unwrap_or(0);
        let mut tasks: Map<u32, Task> = env
            .storage()
            .persistent()
            .get(&DataKey::Tasks(user.clone()))
            .unwrap_or_else(|| Map::new(&env));
        tasks.set(id, Task { id, content, done: false });
        env.storage().persistent().set(&DataKey::Tasks(user.clone()), &tasks);
        env.storage().persistent().set(&DataKey::NextId(user), &(id + 1));
        id
    }

    pub fn toggle_task(env: Env, user: Address, id: u32) {
        user.require_auth();
        let mut tasks: Map<u32, Task> = env
            .storage()
            .persistent()
            .get(&DataKey::Tasks(user.clone()))
            .unwrap_or_else(|| Map::new(&env));
        let mut task = tasks.get(id).expect("task not found");
        task.done = !task.done;
        tasks.set(id, task);
        env.storage().persistent().set(&DataKey::Tasks(user), &tasks);
    }

    pub fn delete_task(env: Env, user: Address, id: u32) {
        user.require_auth();
        let mut tasks: Map<u32, Task> = env
            .storage()
            .persistent()
            .get(&DataKey::Tasks(user.clone()))
            .unwrap_or_else(|| Map::new(&env));
        tasks.remove(id).expect("task not found");
        env.storage().persistent().set(&DataKey::Tasks(user), &tasks);
    }

    pub fn get_tasks(env: Env, user: Address) -> Vec<Task> {
        let tasks: Map<u32, Task> = env
            .storage()
            .persistent()
            .get(&DataKey::Tasks(user))
            .unwrap_or_else(|| Map::new(&env));
        tasks.values()
    }
}

mod test;
