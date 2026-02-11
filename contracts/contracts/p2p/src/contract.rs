use soroban_sdk::{contract, contractimpl, Address, Env};

use crate::core::{AdminManager, DisputeManager, OrderManager};
use crate::error::ContractError;
use crate::events::handler::{
    DisputeResolved, FiatPaymentConfirmed, FiatPaymentDisputed, FiatPaymentSubmitted,
    FiatTransferTimeout, Initialized, OrderCancelled, OrderCreated, OrderTaken, PausedEvt,
    UnpausedEvt,
};
use crate::storage::types::{Config, FiatCurrency, Order, PaymentMethod};

#[contract]
pub struct P2PContract;

#[contractimpl]
impl P2PContract {
    pub fn __constructor() {}

    pub fn initialize(
        e: Env,
        admin: Address,
        dispute_resolver: Address,
        pauser: Address,
        token: Address,
        max_duration_secs: u64,
        filler_payment_timeout_secs: u64,
    ) -> Result<(), ContractError> {
        admin.require_auth();
        let config = AdminManager::initialize(
            &e,
            admin,
            dispute_resolver,
            pauser,
            token,
            max_duration_secs,
            filler_payment_timeout_secs,
        )?;

        Initialized {
            admin: config.admin,
            dispute_resolver: config.dispute_resolver,
            pauser: config.pauser,
            token: config.token,
        }
        .publish(&e);

        Ok(())
    }

    pub fn pause(e: Env, caller: Address) -> Result<(), ContractError> {
        AdminManager::pause(&e, caller.clone())?;
        PausedEvt { by: caller }.publish(&e);
        Ok(())
    }

    pub fn unpause(e: Env, caller: Address) -> Result<(), ContractError> {
        AdminManager::unpause(&e, caller.clone())?;
        UnpausedEvt { by: caller }.publish(&e);
        Ok(())
    }

    pub fn create_order(
        e: Env,
        caller: Address,
        fiat_currency: FiatCurrency,
        payment_method: PaymentMethod,
        from_crypto: bool,
        amount: i128,
        exchange_rate: i128,
        duration_secs: u64,
    ) -> Result<u64, ContractError> {
        let order = OrderManager::create_order(
            &e,
            caller,
            fiat_currency,
            payment_method,
            from_crypto,
            amount,
            exchange_rate,
            duration_secs,
        )?;

        OrderCreated {
            order_id: order.order_id,
            creator: order.creator,
            amount: order.amount,
            from_crypto: order.from_crypto,
        }
        .publish(&e);

        Ok(order.order_id)
    }

    pub fn cancel_order(e: Env, caller: Address, order_id: u64) -> Result<(), ContractError> {
        let order = OrderManager::cancel_order(&e, caller.clone(), order_id)?;
        OrderCancelled {
            order_id,
            cancelled_by: caller,
        }
        .publish(&e);

        let _ = order;
        Ok(())
    }

    pub fn take_order(e: Env, caller: Address, order_id: u64) -> Result<(), ContractError> {
        let _order = OrderManager::take_order(&e, caller.clone(), order_id)?;
        OrderTaken {
            order_id,
            filler: caller,
        }
        .publish(&e);
        Ok(())
    }

    pub fn submit_fiat_payment(
        e: Env,
        caller: Address,
        order_id: u64,
    ) -> Result<(), ContractError> {
        let _order = OrderManager::submit_fiat_payment(&e, caller.clone(), order_id)?;
        FiatPaymentSubmitted {
            order_id,
            submitted_by: caller,
        }
        .publish(&e);
        Ok(())
    }

    pub fn execute_fiat_transfer_timeout(
        e: Env,
        caller: Address,
        order_id: u64,
    ) -> Result<(), ContractError> {
        let _order = OrderManager::execute_fiat_transfer_timeout(&e, caller.clone(), order_id)?;
        FiatTransferTimeout {
            order_id,
            executed_by: caller,
        }
        .publish(&e);
        Ok(())
    }

    pub fn confirm_fiat_payment(
        e: Env,
        caller: Address,
        order_id: u64,
    ) -> Result<(), ContractError> {
        let _order = OrderManager::confirm_fiat_payment(&e, caller.clone(), order_id)?;
        FiatPaymentConfirmed {
            order_id,
            confirmed_by: caller,
        }
        .publish(&e);
        Ok(())
    }

    pub fn dispute_fiat_payment(
        e: Env,
        caller: Address,
        order_id: u64,
    ) -> Result<(), ContractError> {
        let _order = DisputeManager::dispute_fiat_payment(&e, caller.clone(), order_id)?;
        FiatPaymentDisputed {
            order_id,
            disputed_by: caller,
        }
        .publish(&e);
        Ok(())
    }

    pub fn resolve_dispute(
        e: Env,
        caller: Address,
        order_id: u64,
        fiat_transfer_confirmed: bool,
    ) -> Result<(), ContractError> {
        let _order =
            DisputeManager::resolve_dispute(&e, caller.clone(), order_id, fiat_transfer_confirmed)?;
        DisputeResolved {
            order_id,
            resolved_by: caller,
            fiat_transfer_confirmed,
        }
        .publish(&e);
        Ok(())
    }

    pub fn get_order(e: Env, order_id: u64) -> Result<Order, ContractError> {
        OrderManager::get_order(&e, order_id)
    }

    pub fn get_order_count(e: Env) -> Result<u64, ContractError> {
        AdminManager::get_order_count(&e)
    }

    pub fn get_config(e: Env) -> Result<Config, ContractError> {
        AdminManager::get_config(&e)
    }
}
