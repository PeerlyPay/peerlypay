use soroban_sdk::Address;

use crate::error::ContractError;
use crate::storage::types::Config;

pub fn validate_initialize_inputs(
    max_duration_secs: u64,
    filler_payment_timeout_secs: u64,
) -> Result<(), ContractError> {
    if max_duration_secs == 0 || filler_payment_timeout_secs == 0 {
        return Err(ContractError::InvalidTimeout);
    }

    Ok(())
}

pub fn ensure_pauser(config: &Config, caller: &Address) -> Result<(), ContractError> {
    if *caller != config.pauser {
        return Err(ContractError::Unauthorized);
    }

    Ok(())
}

pub fn ensure_dispute_resolver(config: &Config, caller: &Address) -> Result<(), ContractError> {
    if *caller != config.dispute_resolver {
        return Err(ContractError::Unauthorized);
    }

    Ok(())
}

pub fn ensure_not_paused(config: &Config) -> Result<(), ContractError> {
    if config.paused {
        return Err(ContractError::Paused);
    }

    Ok(())
}
