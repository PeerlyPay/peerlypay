use soroban_sdk::{contracttype, Address};

#[contracttype]
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum FiatCurrency {
    Usd,
    Eur,
    Ars,
    Cop,
    Gbp,
    Other(u32),
}

#[contracttype]
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum PaymentMethod {
    BankTransfer,
    MobileWallet,
    Cash,
    Other(u32),
}

#[contracttype]
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum OrderStatus {
    Created,
    AwaitingFiller,
    AwaitingPayment,
    AwaitingConfirmation,
    Completed,
    Disputed,
    Refunded,
    Cancelled,
}

#[contracttype]
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Config {
    pub admin: Address,
    pub dispute_resolver: Address,
    pub pauser: Address,
    pub token: Address,
    pub max_duration_secs: u64,
    pub filler_payment_timeout_secs: u64,
    pub paused: bool,
}

#[contracttype]
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Order {
    pub order_id: u64,
    pub creator: Address,
    pub filler: Option<Address>,
    pub token: Address,
    pub amount: i128,
    pub exchange_rate: i128,
    pub from_crypto: bool,
    pub fiat_currency: FiatCurrency,
    pub payment_method: PaymentMethod,
    pub status: OrderStatus,
    pub created_at: u64,
    pub deadline: u64,
    pub fiat_transfer_deadline: Option<u64>,
}

#[contracttype]
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum DataKey {
    Config,
    OrderCount,
    Order(u64),
}
