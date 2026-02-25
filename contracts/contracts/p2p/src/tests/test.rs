#![cfg(test)]

extern crate std;

use crate::contract::P2PContract;
use crate::contract::P2PContractClient;
use crate::storage::types::{FiatCurrency, OrderStatus, PaymentMethod};

use soroban_sdk::testutils::{Address as _, Ledger};
use soroban_sdk::{token, Address, Env};
use token::Client as TokenClient;
use token::StellarAssetClient as TokenAdminClient;

fn create_token<'a>(e: &Env, admin: &Address) -> (TokenClient<'a>, TokenAdminClient<'a>) {
    let sac = e.register_stellar_asset_contract_v2(admin.clone());
    (
        TokenClient::new(e, &sac.address()),
        TokenAdminClient::new(e, &sac.address()),
    )
}

fn set_timestamp(e: &Env, timestamp: u64) {
    e.ledger().with_mut(|ledger| {
        ledger.timestamp = timestamp;
    });
}

struct Setup<'a> {
    env: Env,
    client: P2PContractClient<'a>,
    pauser: Address,
    dispute_resolver: Address,
    creator: Address,
    filler: Address,
    token: TokenClient<'a>,
}

fn setup<'a>() -> Setup<'a> {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let pauser = Address::generate(&env);
    let dispute_resolver = Address::generate(&env);
    let creator = Address::generate(&env);
    let filler = Address::generate(&env);

    let (token, token_admin) = create_token(&env, &admin);

    token_admin.mint(&creator, &1_000_000_000);
    token_admin.mint(&filler, &1_000_000_000);

    let client = P2PContractClient::new(&env, &env.register(P2PContract {}, ()));
    client.initialize(
        &admin,
        &dispute_resolver,
        &pauser,
        &token.address,
        &2_592_000,
        &1_800,
    );

    Setup {
        env,
        client,
        pauser,
        dispute_resolver,
        creator,
        filler,
        token,
    }
}

#[test]
fn test_create_order_from_crypto_holds_funds() {
    let s = setup();

    set_timestamp(&s.env, 100);
    let order_id = s.client.create_order(
        &s.creator,
        &FiatCurrency::Usd,
        &PaymentMethod::BankTransfer,
        &true,
        &100,
        &1200,
        &600,
    );

    let order = s.client.get_order(&order_id);
    assert_eq!(order.status, OrderStatus::AwaitingFiller);
    assert_eq!(order.creator, s.creator);
    assert_eq!(order.amount, 100);
    assert_eq!(order.remaining_amount, 100);
    assert_eq!(order.filled_amount, 0);
    assert_eq!(order.active_fill_amount, None);

    let contract_balance = s.token.balance(&s.client.address);
    assert_eq!(contract_balance, 100);
}

#[test]
fn test_cancel_order_refunds_creator_for_from_crypto() {
    let s = setup();

    let creator_balance_before = s.token.balance(&s.creator);
    let order_id = s.client.create_order(
        &s.creator,
        &FiatCurrency::Usd,
        &PaymentMethod::BankTransfer,
        &true,
        &500,
        &1200,
        &600,
    );

    s.client.cancel_order(&s.creator, &order_id);
    let order = s.client.get_order(&order_id);
    assert_eq!(order.status, OrderStatus::Cancelled);

    let creator_balance_after = s.token.balance(&s.creator);
    assert_eq!(creator_balance_after, creator_balance_before);
    assert_eq!(s.token.balance(&s.client.address), 0);
}

#[test]
fn test_take_order_from_fiat_requires_filler_deposit() {
    let s = setup();

    let filler_balance_before = s.token.balance(&s.filler);
    let order_id = s.client.create_order(
        &s.creator,
        &FiatCurrency::Eur,
        &PaymentMethod::MobileWallet,
        &false,
        &700,
        &1250,
        &600,
    );

    s.client.take_order(&s.filler, &order_id);
    let order = s.client.get_order(&order_id);

    assert_eq!(order.status, OrderStatus::AwaitingPayment);
    assert_eq!(order.filler, Some(s.filler.clone()));
    assert_eq!(order.active_fill_amount, Some(700));

    let filler_balance_after = s.token.balance(&s.filler);
    assert_eq!(filler_balance_before - filler_balance_after, 700);
    assert_eq!(s.token.balance(&s.client.address), 700);
}

#[test]
fn test_submit_confirm_from_crypto_releases_to_filler() {
    let s = setup();

    let filler_before = s.token.balance(&s.filler);
    let order_id = s.client.create_order(
        &s.creator,
        &FiatCurrency::Usd,
        &PaymentMethod::BankTransfer,
        &true,
        &400,
        &1000,
        &600,
    );

    s.client.take_order(&s.filler, &order_id);
    s.client.submit_fiat_payment(&s.filler, &order_id);
    s.client.confirm_fiat_payment(&s.creator, &order_id);

    let order = s.client.get_order(&order_id);
    assert_eq!(order.status, OrderStatus::Completed);
    assert_eq!(order.remaining_amount, 0);
    assert_eq!(order.filled_amount, 400);
    assert_eq!(s.token.balance(&s.filler), filler_before + 400);
    assert_eq!(s.token.balance(&s.client.address), 0);
}

#[test]
fn test_submit_confirm_from_fiat_releases_to_creator() {
    let s = setup();

    let creator_before = s.token.balance(&s.creator);
    let order_id = s.client.create_order(
        &s.creator,
        &FiatCurrency::Usd,
        &PaymentMethod::BankTransfer,
        &false,
        &450,
        &1000,
        &600,
    );

    s.client.take_order(&s.filler, &order_id);
    s.client.submit_fiat_payment(&s.creator, &order_id);
    s.client.confirm_fiat_payment(&s.filler, &order_id);

    let order = s.client.get_order(&order_id);
    assert_eq!(order.status, OrderStatus::Completed);
    assert_eq!(order.remaining_amount, 0);
    assert_eq!(order.filled_amount, 450);
    assert_eq!(s.token.balance(&s.creator), creator_before + 450);
    assert_eq!(s.token.balance(&s.client.address), 0);
}

#[test]
fn test_timeout_resets_order_to_awaiting_filler() {
    let s = setup();
    let filler_balance_before = s.token.balance(&s.filler);

    set_timestamp(&s.env, 1000);
    let order_id = s.client.create_order(
        &s.creator,
        &FiatCurrency::Usd,
        &PaymentMethod::BankTransfer,
        &false,
        &300,
        &1000,
        &5_000,
    );

    s.client.take_order(&s.filler, &order_id);
    assert_eq!(s.token.balance(&s.filler), filler_balance_before - 300);
    assert_eq!(s.token.balance(&s.client.address), 300);

    set_timestamp(&s.env, 3000);
    s.client.execute_fiat_transfer_timeout(&s.filler, &order_id);

    let order = s.client.get_order(&order_id);
    assert_eq!(order.status, OrderStatus::AwaitingFiller);
    assert_eq!(order.filler, None);
    assert_eq!(order.active_fill_amount, None);
    assert_eq!(order.fiat_transfer_deadline, None);
    assert_eq!(s.token.balance(&s.filler), filler_balance_before);
    assert_eq!(s.token.balance(&s.client.address), 0);
}

#[test]
fn test_dispute_and_resolve_confirmed_completes() {
    let s = setup();

    let filler_before = s.token.balance(&s.filler);
    let order_id = s.client.create_order(
        &s.creator,
        &FiatCurrency::Usd,
        &PaymentMethod::BankTransfer,
        &true,
        &250,
        &1000,
        &600,
    );

    s.client.take_order(&s.filler, &order_id);
    s.client.submit_fiat_payment(&s.filler, &order_id);
    s.client.dispute_fiat_payment(&s.filler, &order_id);
    s.client
        .resolve_dispute(&s.dispute_resolver, &order_id, &true);

    let order = s.client.get_order(&order_id);
    assert_eq!(order.status, OrderStatus::Completed);
    assert_eq!(order.filled_amount, 250);
    assert_eq!(order.remaining_amount, 0);
    assert_eq!(s.token.balance(&s.filler), filler_before + 250);
}

#[test]
fn test_dispute_and_resolve_not_confirmed_refunds_depositor() {
    let s = setup();

    let creator_before = s.token.balance(&s.creator);
    let order_id = s.client.create_order(
        &s.creator,
        &FiatCurrency::Usd,
        &PaymentMethod::BankTransfer,
        &true,
        &350,
        &1000,
        &600,
    );

    s.client.take_order(&s.filler, &order_id);
    s.client.submit_fiat_payment(&s.filler, &order_id);
    s.client.dispute_fiat_payment(&s.filler, &order_id);
    s.client
        .resolve_dispute(&s.dispute_resolver, &order_id, &false);

    let order = s.client.get_order(&order_id);
    assert_eq!(order.status, OrderStatus::AwaitingFiller);
    assert_eq!(order.remaining_amount, 350);
    assert_eq!(order.filled_amount, 0);
    assert_eq!(s.token.balance(&s.creator), creator_before);
}

#[test]
fn test_partial_fill_reduces_remaining_and_reopens_order() {
    let s = setup();

    let creator_before = s.token.balance(&s.creator);
    let order_id = s.client.create_order(
        &s.creator,
        &FiatCurrency::Usd,
        &PaymentMethod::BankTransfer,
        &false,
        &1_000,
        &1000,
        &600,
    );

    s.client.take_order_with_amount(&s.filler, &order_id, &200);
    s.client.submit_fiat_payment(&s.creator, &order_id);
    s.client.confirm_fiat_payment(&s.filler, &order_id);

    let order = s.client.get_order(&order_id);
    assert_eq!(order.status, OrderStatus::AwaitingFiller);
    assert_eq!(order.remaining_amount, 800);
    assert_eq!(order.filled_amount, 200);
    assert_eq!(order.filler, None);
    assert_eq!(order.active_fill_amount, None);
    assert_eq!(s.token.balance(&s.creator), creator_before + 200);
}

#[test]
fn test_pause_blocks_mutations() {
    let s = setup();

    s.client.pause(&s.pauser);

    let res = s.client.try_create_order(
        &s.creator,
        &FiatCurrency::Usd,
        &PaymentMethod::BankTransfer,
        &true,
        &100,
        &1000,
        &600,
    );
    assert!(res.is_err());

    s.client.unpause(&s.pauser);
    let order_id = s.client.create_order(
        &s.creator,
        &FiatCurrency::Usd,
        &PaymentMethod::BankTransfer,
        &true,
        &100,
        &1000,
        &600,
    );

    assert_eq!(order_id, 0);
}

#[test]
fn test_only_dispute_resolver_can_resolve() {
    let s = setup();

    let order_id = s.client.create_order(
        &s.creator,
        &FiatCurrency::Usd,
        &PaymentMethod::BankTransfer,
        &true,
        &300,
        &1000,
        &600,
    );
    s.client.take_order(&s.filler, &order_id);
    s.client.submit_fiat_payment(&s.filler, &order_id);
    s.client.dispute_fiat_payment(&s.filler, &order_id);

    let res = s.client.try_resolve_dispute(&s.creator, &order_id, &true);
    assert!(res.is_err());
}

#[test]
fn test_initialize_rejects_duplicate_and_invalid_timeouts() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let pauser = Address::generate(&env);
    let dispute_resolver = Address::generate(&env);
    let (token, _) = create_token(&env, &admin);

    let client = P2PContractClient::new(&env, &env.register(P2PContract {}, ()));

    client.initialize(
        &admin,
        &dispute_resolver,
        &pauser,
        &token.address,
        &100,
        &10,
    );

    let duplicate = client.try_initialize(
        &admin,
        &dispute_resolver,
        &pauser,
        &token.address,
        &100,
        &10,
    );
    assert!(duplicate.is_err());

    let second = P2PContractClient::new(&env, &env.register(P2PContract {}, ()));
    let invalid_timeout =
        second.try_initialize(&admin, &dispute_resolver, &pauser, &token.address, &100, &0);
    assert!(invalid_timeout.is_err());
}

#[test]
fn test_pause_auth_and_repeat_guards() {
    let s = setup();
    let random = Address::generate(&s.env);

    let unauthorized_pause = s.client.try_pause(&random);
    assert!(unauthorized_pause.is_err());

    s.client.pause(&s.pauser);

    let second_pause = s.client.try_pause(&s.pauser);
    assert!(second_pause.is_err());

    s.client.unpause(&s.pauser);

    let second_unpause = s.client.try_unpause(&s.pauser);
    assert!(second_unpause.is_err());
}

#[test]
fn test_create_order_validation_failures() {
    let s = setup();

    let invalid_amount = s.client.try_create_order(
        &s.creator,
        &FiatCurrency::Usd,
        &PaymentMethod::BankTransfer,
        &true,
        &0,
        &1000,
        &600,
    );
    assert!(invalid_amount.is_err());

    let invalid_exchange_rate = s.client.try_create_order(
        &s.creator,
        &FiatCurrency::Usd,
        &PaymentMethod::BankTransfer,
        &true,
        &100,
        &0,
        &600,
    );
    assert!(invalid_exchange_rate.is_err());

    let invalid_duration = s.client.try_create_order(
        &s.creator,
        &FiatCurrency::Usd,
        &PaymentMethod::BankTransfer,
        &true,
        &100,
        &1000,
        &2_592_001,
    );
    assert!(invalid_duration.is_err());
}

#[test]
fn test_cancel_order_negative_paths() {
    let s = setup();

    let order_id = s.client.create_order(
        &s.creator,
        &FiatCurrency::Usd,
        &PaymentMethod::BankTransfer,
        &true,
        &100,
        &1000,
        &600,
    );

    let unauthorized_cancel = s.client.try_cancel_order(&s.filler, &order_id);
    assert!(unauthorized_cancel.is_err());

    let nonexistent_cancel = s.client.try_cancel_order(&s.creator, &9999);
    assert!(nonexistent_cancel.is_err());

    s.client.take_order(&s.filler, &order_id);
    let cancel_after_take = s.client.try_cancel_order(&s.creator, &order_id);
    assert!(cancel_after_take.is_err());
}

#[test]
fn test_take_order_negative_paths() {
    let s = setup();

    let order_id = s.client.create_order(
        &s.creator,
        &FiatCurrency::Usd,
        &PaymentMethod::BankTransfer,
        &true,
        &100,
        &1000,
        &600,
    );

    let self_take = s.client.try_take_order(&s.creator, &order_id);
    assert!(self_take.is_err());

    set_timestamp(&s.env, 100);
    let expiring_order = s.client.create_order(
        &s.creator,
        &FiatCurrency::Usd,
        &PaymentMethod::BankTransfer,
        &true,
        &100,
        &1000,
        &10,
    );
    set_timestamp(&s.env, 111);
    let expired_take = s.client.try_take_order(&s.filler, &expiring_order);
    assert!(expired_take.is_err());

    let nonexistent_take = s.client.try_take_order(&s.filler, &12345);
    assert!(nonexistent_take.is_err());
}

#[test]
fn test_submit_confirm_dispute_negative_actor_and_status_paths() {
    let s = setup();

    let from_crypto_order = s.client.create_order(
        &s.creator,
        &FiatCurrency::Usd,
        &PaymentMethod::BankTransfer,
        &true,
        &200,
        &1000,
        &600,
    );
    s.client.take_order(&s.filler, &from_crypto_order);

    let wrong_submitter = s
        .client
        .try_submit_fiat_payment(&s.creator, &from_crypto_order);
    assert!(wrong_submitter.is_err());

    s.client.submit_fiat_payment(&s.filler, &from_crypto_order);

    let wrong_confirmer = s
        .client
        .try_confirm_fiat_payment(&s.filler, &from_crypto_order);
    assert!(wrong_confirmer.is_err());

    let wrong_disputer = s
        .client
        .try_dispute_fiat_payment(&s.creator, &from_crypto_order);
    assert!(wrong_disputer.is_err());

    let non_disputed_resolution =
        s.client
            .try_resolve_dispute(&s.dispute_resolver, &from_crypto_order, &true);
    assert!(non_disputed_resolution.is_err());
}

#[test]
fn test_timeout_negative_paths() {
    let s = setup();

    set_timestamp(&s.env, 500);
    let from_crypto_order = s.client.create_order(
        &s.creator,
        &FiatCurrency::Usd,
        &PaymentMethod::BankTransfer,
        &true,
        &300,
        &1000,
        &600,
    );
    s.client.take_order(&s.filler, &from_crypto_order);

    set_timestamp(&s.env, 1000);
    let before_expiry = s
        .client
        .try_execute_fiat_transfer_timeout(&s.creator, &from_crypto_order);
    assert!(before_expiry.is_err());

    set_timestamp(&s.env, 2400);
    let wrong_actor_after_expiry = s
        .client
        .try_execute_fiat_transfer_timeout(&s.filler, &from_crypto_order);
    assert!(wrong_actor_after_expiry.is_err());

    s.client
        .execute_fiat_transfer_timeout(&s.creator, &from_crypto_order);

    let wrong_status = s
        .client
        .try_execute_fiat_transfer_timeout(&s.creator, &from_crypto_order);
    assert!(wrong_status.is_err());
}
