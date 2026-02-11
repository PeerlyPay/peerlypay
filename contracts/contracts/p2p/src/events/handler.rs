use soroban_sdk::{contractevent, Address};

#[contractevent(topics = ["p2p_initialized"], data_format = "vec")]
#[derive(Clone)]
pub struct Initialized {
    pub admin: Address,
    pub dispute_resolver: Address,
    pub pauser: Address,
    pub token: Address,
}

#[contractevent(topics = ["p2p_paused"], data_format = "single-value")]
#[derive(Clone)]
pub struct PausedEvt {
    pub by: Address,
}

#[contractevent(topics = ["p2p_unpaused"], data_format = "single-value")]
#[derive(Clone)]
pub struct UnpausedEvt {
    pub by: Address,
}

#[contractevent(topics = ["p2p_order_created"], data_format = "vec")]
#[derive(Clone)]
pub struct OrderCreated {
    pub order_id: u64,
    pub creator: Address,
    pub amount: i128,
    pub from_crypto: bool,
}

#[contractevent(topics = ["p2p_order_cancelled"], data_format = "vec")]
#[derive(Clone)]
pub struct OrderCancelled {
    pub order_id: u64,
    pub cancelled_by: Address,
}

#[contractevent(topics = ["p2p_order_taken"], data_format = "vec")]
#[derive(Clone)]
pub struct OrderTaken {
    pub order_id: u64,
    pub filler: Address,
}

#[contractevent(topics = ["p2p_fiat_payment_submitted"], data_format = "vec")]
#[derive(Clone)]
pub struct FiatPaymentSubmitted {
    pub order_id: u64,
    pub submitted_by: Address,
}

#[contractevent(topics = ["p2p_fiat_transfer_timeout"], data_format = "vec")]
#[derive(Clone)]
pub struct FiatTransferTimeout {
    pub order_id: u64,
    pub executed_by: Address,
}

#[contractevent(topics = ["p2p_fiat_payment_confirmed"], data_format = "vec")]
#[derive(Clone)]
pub struct FiatPaymentConfirmed {
    pub order_id: u64,
    pub confirmed_by: Address,
}

#[contractevent(topics = ["p2p_fiat_payment_disputed"], data_format = "vec")]
#[derive(Clone)]
pub struct FiatPaymentDisputed {
    pub order_id: u64,
    pub disputed_by: Address,
}

#[contractevent(topics = ["p2p_dispute_resolved"], data_format = "vec")]
#[derive(Clone)]
pub struct DisputeResolved {
    pub order_id: u64,
    pub resolved_by: Address,
    pub fiat_transfer_confirmed: bool,
}
