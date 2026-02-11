use crate::error::ContractError;
use crate::storage::types::{Order, OrderStatus};

pub fn ensure_disputable(order: &Order) -> Result<(), ContractError> {
    if order.status != OrderStatus::AwaitingConfirmation {
        return Err(ContractError::InvalidOrderStatus);
    }

    Ok(())
}

pub fn ensure_disputed(order: &Order) -> Result<(), ContractError> {
    if order.status != OrderStatus::Disputed {
        return Err(ContractError::InvalidOrderStatus);
    }

    Ok(())
}
