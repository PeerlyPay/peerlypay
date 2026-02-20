use soroban_sdk::token::Client as TokenClient;
use soroban_sdk::{Address, Env};

use crate::core::admin::AdminManager;
use crate::core::validators::admin::ensure_not_paused;
use crate::core::validators::order::{
    ensure_active_fill_amount, ensure_creator, ensure_fiat_timeout_expired, ensure_filler,
    ensure_not_creator, ensure_not_expired, ensure_status, validate_create_order,
    validate_fill_amount,
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
            remaining_amount: amount,
            filled_amount: 0,
            active_fill_amount: None,
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
            token_client.transfer(
                &e.current_contract_address(),
                &order.creator,
                &order.remaining_amount,
            );
        }

        Self::store_order(e, &order);
        Ok(order)
    }

    pub fn take_order(e: &Env, caller: Address, order_id: u64) -> Result<Order, ContractError> {
        let order = Self::get_order(e, order_id)?;
        Self::take_order_with_amount(e, caller, order_id, order.remaining_amount)
    }

    pub fn take_order_with_amount(
        e: &Env,
        caller: Address,
        order_id: u64,
        fill_amount: i128,
    ) -> Result<Order, ContractError> {
        caller.require_auth();
        let config = AdminManager::get_config(e)?;
        ensure_not_paused(&config)?;

        let mut order = Self::get_order(e, order_id)?;
        ensure_status(&order, OrderStatus::AwaitingFiller)?;
        ensure_not_creator(&order, &caller)?;
        ensure_not_expired(&order, e.ledger().timestamp())?;
        validate_fill_amount(&order, fill_amount)?;

        if !order.from_crypto {
            let token_client = TokenClient::new(e, &config.token);
            token_client.transfer(&caller, &e.current_contract_address(), &fill_amount);
        }

        order.filler = Some(caller);
        order.active_fill_amount = Some(fill_amount);
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
    ) -> Result<(Order, i128), ContractError> {
        caller.require_auth();
        let config = AdminManager::get_config(e)?;
        ensure_not_paused(&config)?;

        let mut order = Self::get_order(e, order_id)?;
        ensure_status(&order, OrderStatus::AwaitingPayment)?;
        ensure_fiat_timeout_expired(&order, e.ledger().timestamp())?;
        let active_fill_amount = ensure_active_fill_amount(&order)?;

        if order.from_crypto {
            ensure_creator(&order, &caller)?;
        } else {
            ensure_filler(&order, &caller)?;

            let filler = order.filler.clone().ok_or(ContractError::MissingFiller)?;
            let token_client = TokenClient::new(e, &config.token);
            token_client.transfer(&e.current_contract_address(), &filler, &active_fill_amount);
        }

        order.status = OrderStatus::AwaitingFiller;
        order.filler = None;
        order.active_fill_amount = None;
        order.fiat_transfer_deadline = None;
        Self::store_order(e, &order);

        let refunded_amount = if order.from_crypto {
            0
        } else {
            active_fill_amount
        };

        Ok((order, refunded_amount))
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
        let active_fill_amount = ensure_active_fill_amount(&order)?;

        let recipient = if order.from_crypto {
            ensure_creator(&order, &caller)?;
            order.filler.clone().ok_or(ContractError::MissingFiller)?
        } else {
            ensure_filler(&order, &caller)?;
            order.creator.clone()
        };

        let token_client = TokenClient::new(e, &config.token);
        token_client.transfer(
            &e.current_contract_address(),
            &recipient,
            &active_fill_amount,
        );

        order.filled_amount = order
            .filled_amount
            .checked_add(active_fill_amount)
            .ok_or(ContractError::Overflow)?;
        order.remaining_amount = order
            .remaining_amount
            .checked_sub(active_fill_amount)
            .ok_or(ContractError::Underflow)?;

        order.filler = None;
        order.active_fill_amount = None;
        order.fiat_transfer_deadline = None;

        order.status = if order.remaining_amount == 0 {
            OrderStatus::Completed
        } else {
            OrderStatus::AwaitingFiller
        };
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
