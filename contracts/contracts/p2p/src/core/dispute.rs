use soroban_sdk::token::Client as TokenClient;
use soroban_sdk::{Address, Env};

use crate::core::admin::AdminManager;
use crate::core::order::OrderManager;
use crate::core::validators::admin::{ensure_dispute_resolver, ensure_not_paused};
use crate::core::validators::dispute::{ensure_disputable, ensure_disputed};
use crate::core::validators::order::{ensure_active_fill_amount, ensure_creator, ensure_filler};
use crate::error::ContractError;
use crate::storage::types::{DataKey, Order, OrderStatus};

pub struct DisputeManager;

impl DisputeManager {
    pub fn dispute_fiat_payment(
        e: &Env,
        caller: Address,
        order_id: u64,
    ) -> Result<Order, ContractError> {
        caller.require_auth();
        let config = AdminManager::get_config(e)?;
        ensure_not_paused(&config)?;

        let mut order = OrderManager::get_order(e, order_id)?;
        ensure_disputable(&order)?;

        if order.from_crypto {
            ensure_filler(&order, &caller)?;
        } else {
            ensure_creator(&order, &caller)?;
        }

        order.status = OrderStatus::Disputed;
        e.storage()
            .instance()
            .set(&DataKey::Order(order.order_id), &order);

        Ok(order)
    }

    pub fn resolve_dispute(
        e: &Env,
        caller: Address,
        order_id: u64,
        fiat_transfer_confirmed: bool,
    ) -> Result<Order, ContractError> {
        caller.require_auth();
        let config = AdminManager::get_config(e)?;
        ensure_dispute_resolver(&config, &caller)?;
        ensure_not_paused(&config)?;

        let mut order = OrderManager::get_order(e, order_id)?;
        ensure_disputed(&order)?;
        let active_fill_amount = ensure_active_fill_amount(&order)?;

        let token_client = TokenClient::new(e, &config.token);
        let recipient = if fiat_transfer_confirmed {
            order.filled_amount = order
                .filled_amount
                .checked_add(active_fill_amount)
                .ok_or(ContractError::Overflow)?;
            order.remaining_amount = order
                .remaining_amount
                .checked_sub(active_fill_amount)
                .ok_or(ContractError::Underflow)?;

            order.status = if order.remaining_amount == 0 {
                OrderStatus::Completed
            } else {
                OrderStatus::AwaitingFiller
            };
            if order.from_crypto {
                order.filler.clone().ok_or(ContractError::MissingFiller)?
            } else {
                order.creator.clone()
            }
        } else {
            order.status = OrderStatus::AwaitingFiller;
            if order.from_crypto {
                order.creator.clone()
            } else {
                order.filler.clone().ok_or(ContractError::MissingFiller)?
            }
        };

        token_client.transfer(
            &e.current_contract_address(),
            &recipient,
            &active_fill_amount,
        );
        order.filler = None;
        order.active_fill_amount = None;
        order.fiat_transfer_deadline = None;
        e.storage()
            .instance()
            .set(&DataKey::Order(order.order_id), &order);

        Ok(order)
    }
}
