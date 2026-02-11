use soroban_sdk::{Address, Env};

use crate::core::validators::admin::{ensure_pauser, validate_initialize_inputs};
use crate::error::ContractError;
use crate::storage::types::{Config, DataKey};

pub struct AdminManager;

impl AdminManager {
    pub fn initialize(
        e: &Env,
        admin: Address,
        dispute_resolver: Address,
        pauser: Address,
        token: Address,
        max_duration_secs: u64,
        filler_payment_timeout_secs: u64,
    ) -> Result<Config, ContractError> {
        if e.storage().instance().has(&DataKey::Config) {
            return Err(ContractError::AlreadyInitialized);
        }

        validate_initialize_inputs(max_duration_secs, filler_payment_timeout_secs)?;

        let config = Config {
            admin,
            dispute_resolver,
            pauser,
            token,
            max_duration_secs,
            filler_payment_timeout_secs,
            paused: false,
        };

        e.storage().instance().set(&DataKey::Config, &config);
        e.storage().instance().set(&DataKey::OrderCount, &0u64);

        Ok(config)
    }

    pub fn pause(e: &Env, caller: Address) -> Result<(), ContractError> {
        caller.require_auth();
        let mut config = Self::get_config(e)?;

        ensure_pauser(&config, &caller)?;
        if config.paused {
            return Err(ContractError::AlreadyPaused);
        }

        config.paused = true;
        e.storage().instance().set(&DataKey::Config, &config);

        Ok(())
    }

    pub fn unpause(e: &Env, caller: Address) -> Result<(), ContractError> {
        caller.require_auth();
        let mut config = Self::get_config(e)?;

        ensure_pauser(&config, &caller)?;
        if !config.paused {
            return Err(ContractError::AlreadyUnpaused);
        }

        config.paused = false;
        e.storage().instance().set(&DataKey::Config, &config);

        Ok(())
    }

    pub fn get_config(e: &Env) -> Result<Config, ContractError> {
        e.storage()
            .instance()
            .get(&DataKey::Config)
            .ok_or(ContractError::ConfigNotInitialized)
    }

    pub fn get_order_count(e: &Env) -> Result<u64, ContractError> {
        if !e.storage().instance().has(&DataKey::Config) {
            return Err(ContractError::ConfigNotInitialized);
        }

        Ok(e.storage()
            .instance()
            .get(&DataKey::OrderCount)
            .unwrap_or(0u64))
    }
}
