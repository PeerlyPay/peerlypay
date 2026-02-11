use soroban_sdk::Address;

use crate::error::ContractError;
use crate::storage::types::{Config, Order, OrderStatus};

pub fn validate_create_order(
    amount: i128,
    exchange_rate: i128,
    duration_secs: u64,
    config: &Config,
) -> Result<(), ContractError> {
    if amount <= 0 {
        return Err(ContractError::InvalidAmount);
    }

    if exchange_rate <= 0 {
        return Err(ContractError::InvalidExchangeRate);
    }

    if duration_secs > config.max_duration_secs {
        return Err(ContractError::InvalidDuration);
    }

    Ok(())
}

pub fn ensure_status(order: &Order, expected: OrderStatus) -> Result<(), ContractError> {
    if order.status != expected {
        return Err(ContractError::InvalidOrderStatus);
    }

    Ok(())
}

pub fn ensure_creator(order: &Order, caller: &Address) -> Result<(), ContractError> {
    if *caller != order.creator {
        return Err(ContractError::Unauthorized);
    }

    Ok(())
}

pub fn ensure_not_creator(order: &Order, caller: &Address) -> Result<(), ContractError> {
    if *caller == order.creator {
        return Err(ContractError::Unauthorized);
    }

    Ok(())
}

pub fn ensure_not_expired(order: &Order, now: u64) -> Result<(), ContractError> {
    if order.deadline <= now {
        return Err(ContractError::OrderExpired);
    }

    Ok(())
}

pub fn ensure_fiat_timeout_expired(order: &Order, now: u64) -> Result<(), ContractError> {
    let deadline = order
        .fiat_transfer_deadline
        .ok_or(ContractError::InvalidOrderStatus)?;

    if deadline >= now {
        return Err(ContractError::FiatTransferHasNotExpired);
    }

    Ok(())
}

pub fn ensure_filler(order: &Order, caller: &Address) -> Result<(), ContractError> {
    match &order.filler {
        Some(filler) if *filler == *caller => Ok(()),
        Some(_) => Err(ContractError::Unauthorized),
        None => Err(ContractError::MissingFiller),
    }
}
