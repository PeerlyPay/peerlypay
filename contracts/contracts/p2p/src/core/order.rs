use soroban_sdk::token::Client as TokenClient;
use soroban_sdk::{Address, Env};

use crate::core::admin::AdminManager;
use crate::core::validators::admin::ensure_not_paused;
use crate::core::validators::order::{
    ensure_creator, ensure_fiat_timeout_expired, ensure_filler, ensure_not_creator,
    ensure_not_expired, ensure_status, validate_create_order,
};
use crate::error::ContractError;
use crate::storage::types::{DataKey, FiatCurrency, Order, OrderStatus, PaymentMethod};

pub struct OrderManager;

impl OrderManager {
    pub fn create_order(
        e: &Env,
        caller: Address,
        fiat_currency: FiatCurrency,
        payment_method: PaymentMethod,
        from_crypto: bool,
        amount: i128,
        exchange_rate: i128,
        duration_secs: u64,
    ) -> Result<Order, ContractError> {
        caller.require_auth();
        let config = AdminManager::get_config(e)?;
        ensure_not_paused(&config)?;
        validate_create_order(amount, exchange_rate, duration_secs, &config)?;

        let now = e.ledger().timestamp();
        let next_order_id = Self::next_order_id(e)?;
        let deadline = now + duration_secs;
        let mut order = Order {
            order_id: next_order_id,
            creator: caller.clone(),
            filler: None,
            token: config.token.clone(),
            amount,
            exchange_rate,
            from_crypto,
            fiat_currency,
            payment_method,
            status: OrderStatus::Created,
            created_at: now,
            deadline,
            fiat_transfer_deadline: None,
        };

        if from_crypto {
            let token_client = TokenClient::new(e, &config.token);
            token_client.transfer(&caller, &e.current_contract_address(), &amount);
        }

        order.status = OrderStatus::AwaitingFiller;
        Self::store_order(e, &order);
        e.storage()
            .instance()
            .set(&DataKey::OrderCount, &(next_order_id + 1));

        Ok(order)
    }

    pub fn cancel_order(e: &Env, caller: Address, order_id: u64) -> Result<Order, ContractError> {
        caller.require_auth();
        let config = AdminManager::get_config(e)?;
        ensure_not_paused(&config)?;

        let mut order = Self::get_order(e, order_id)?;
        ensure_status(&order, OrderStatus::AwaitingFiller)?;
        ensure_creator(&order, &caller)?;

        order.status = OrderStatus::Cancelled;

        if order.from_crypto {
            let token_client = TokenClient::new(e, &config.token);
            token_client.transfer(&e.current_contract_address(), &order.creator, &order.amount);
        }

        Self::store_order(e, &order);
        Ok(order)
    }

    pub fn take_order(e: &Env, caller: Address, order_id: u64) -> Result<Order, ContractError> {
        caller.require_auth();
        let config = AdminManager::get_config(e)?;
        ensure_not_paused(&config)?;

        let mut order = Self::get_order(e, order_id)?;
        ensure_status(&order, OrderStatus::AwaitingFiller)?;
        ensure_not_creator(&order, &caller)?;
        ensure_not_expired(&order, e.ledger().timestamp())?;

        if !order.from_crypto {
            let token_client = TokenClient::new(e, &config.token);
            token_client.transfer(&caller, &e.current_contract_address(), &order.amount);
        }

        order.filler = Some(caller);
        order.status = OrderStatus::AwaitingPayment;
        order.fiat_transfer_deadline =
            Some(e.ledger().timestamp() + config.filler_payment_timeout_secs);

        Self::store_order(e, &order);
        Ok(order)
    }

    pub fn submit_fiat_payment(
        e: &Env,
        caller: Address,
        order_id: u64,
    ) -> Result<Order, ContractError> {
        caller.require_auth();
        let config = AdminManager::get_config(e)?;
        ensure_not_paused(&config)?;

        let mut order = Self::get_order(e, order_id)?;
        ensure_status(&order, OrderStatus::AwaitingPayment)?;

        if order.from_crypto {
            ensure_filler(&order, &caller)?;
        } else {
            ensure_creator(&order, &caller)?;
        }

        order.status = OrderStatus::AwaitingConfirmation;
        Self::store_order(e, &order);

        Ok(order)
    }

    pub fn execute_fiat_transfer_timeout(
        e: &Env,
        caller: Address,
        order_id: u64,
    ) -> Result<Order, ContractError> {
        caller.require_auth();
        let config = AdminManager::get_config(e)?;
        ensure_not_paused(&config)?;

        let mut order = Self::get_order(e, order_id)?;
        ensure_status(&order, OrderStatus::AwaitingPayment)?;
        ensure_fiat_timeout_expired(&order, e.ledger().timestamp())?;

        if order.from_crypto {
            ensure_creator(&order, &caller)?;
        } else {
            ensure_filler(&order, &caller)?;
        }

        order.status = OrderStatus::AwaitingFiller;
        order.filler = None;
        order.fiat_transfer_deadline = None;
        Self::store_order(e, &order);

        Ok(order)
    }

    pub fn confirm_fiat_payment(
        e: &Env,
        caller: Address,
        order_id: u64,
    ) -> Result<Order, ContractError> {
        caller.require_auth();
        let config = AdminManager::get_config(e)?;
        ensure_not_paused(&config)?;

        let mut order = Self::get_order(e, order_id)?;
        ensure_status(&order, OrderStatus::AwaitingConfirmation)?;

        let recipient = if order.from_crypto {
            ensure_creator(&order, &caller)?;
            order.filler.clone().ok_or(ContractError::MissingFiller)?
        } else {
            ensure_filler(&order, &caller)?;
            order.creator.clone()
        };

        let token_client = TokenClient::new(e, &config.token);
        token_client.transfer(&e.current_contract_address(), &recipient, &order.amount);

        order.status = OrderStatus::Completed;
        Self::store_order(e, &order);

        Ok(order)
    }

    pub fn get_order(e: &Env, order_id: u64) -> Result<Order, ContractError> {
        e.storage()
            .instance()
            .get(&DataKey::Order(order_id))
            .ok_or(ContractError::OrderNotFound)
    }

    fn next_order_id(e: &Env) -> Result<u64, ContractError> {
        let current = AdminManager::get_order_count(e)?;
        Ok(current)
    }

    fn store_order(e: &Env, order: &Order) {
        e.storage()
            .instance()
            .set(&DataKey::Order(order.order_id), order);
    }
}
