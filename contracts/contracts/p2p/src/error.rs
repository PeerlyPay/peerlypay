use core::fmt;
use soroban_sdk::contracterror;

#[derive(Debug, Copy, Clone, PartialEq)]
#[contracterror]
pub enum ContractError {
    InvalidAmount = 1,
    InvalidExchangeRate = 2,
    InvalidDuration = 3,
    OrderNotFound = 4,
    InvalidOrderStatus = 5,
    Unauthorized = 6,
    OrderExpired = 7,
    FiatTransferHasNotExpired = 8,
    AlreadyInitialized = 9,
    ConfigNotInitialized = 10,
    Paused = 11,
    AlreadyPaused = 12,
    AlreadyUnpaused = 13,
    MissingFiller = 14,
    Overflow = 15,
    Underflow = 16,
    DivisionError = 17,
    InvalidTimeout = 18,
    InvalidAddress = 19,
}

impl fmt::Display for ContractError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            ContractError::InvalidAmount => write!(f, "Amount must be greater than zero"),
            ContractError::InvalidExchangeRate => {
                write!(f, "Exchange rate must be greater than zero")
            }
            ContractError::InvalidDuration => write!(f, "Invalid order duration"),
            ContractError::OrderNotFound => write!(f, "Order not found"),
            ContractError::InvalidOrderStatus => write!(f, "Invalid order status"),
            ContractError::Unauthorized => write!(f, "Unauthorized operation"),
            ContractError::OrderExpired => write!(f, "Order has expired"),
            ContractError::FiatTransferHasNotExpired => {
                write!(f, "Fiat transfer deadline has not expired")
            }
            ContractError::AlreadyInitialized => write!(f, "Contract is already initialized"),
            ContractError::ConfigNotInitialized => write!(f, "Contract is not initialized"),
            ContractError::Paused => write!(f, "Contract is paused"),
            ContractError::AlreadyPaused => write!(f, "Contract is already paused"),
            ContractError::AlreadyUnpaused => write!(f, "Contract is already unpaused"),
            ContractError::MissingFiller => write!(f, "Order filler is missing"),
            ContractError::Overflow => write!(f, "Overflow"),
            ContractError::Underflow => write!(f, "Underflow"),
            ContractError::DivisionError => write!(f, "Division error"),
            ContractError::InvalidTimeout => write!(f, "Invalid timeout configuration"),
            ContractError::InvalidAddress => write!(f, "Invalid address"),
        }
    }
}
