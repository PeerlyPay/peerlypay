# Files

## File: contracts/.stellar/contract-ids/escrow.json
````json
{"ids":{"Test SDF Network ; September 2015":"CBMEZ3FEJISOCYOTRXJAPUZEPH4IL43P6VQ4FQOZSIQEFL5HJH3WDYHQ"}}
````

## File: contracts/contracts/escrow/src/core/validators/dispute.rs
````rust
use soroban_sdk::Address;

use crate::{
    error::ContractError,
    storage::types::{Escrow, Roles},
};

#[inline]
pub fn validate_dispute_resolution_conditions(
    escrow: &Escrow,
    dispute_resolver: &Address,
    current_balance: i128,
    total: i128,
) -> Result<(), ContractError> {
    if dispute_resolver != &escrow.roles.dispute_resolver {
        return Err(ContractError::OnlyDisputeResolverCanExecuteThisFunction);
    }

    if !escrow.flags.disputed {
        return Err(ContractError::EscrowNotInDispute);
    }

    if current_balance < total {
        return Err(ContractError::InsufficientFundsForResolution);
    }

    if total != current_balance {
        return Err(ContractError::DistributionsMustEqualEscrowBalance);
    }

    if total <= 0 {
        return Err(ContractError::TotalAmountCannotBeZero);
    }

    Ok(())
}

#[inline]
pub fn validate_dispute_flag_change_conditions(
    escrow: &Escrow,
    signer: &Address,
) -> Result<(), ContractError> {
    if escrow.flags.disputed {
        return Err(ContractError::EscrowAlreadyInDispute);
    }

    let Roles {
        approver,
        service_provider,
        platform_address,
        release_signer,
        dispute_resolver,
        receiver,
    } = &escrow.roles;

    let is_authorized = signer == approver
        || signer == service_provider
        || signer == platform_address
        || signer == release_signer
        || signer == dispute_resolver
        || signer == receiver;

    if !is_authorized {
        return Err(ContractError::UnauthorizedToChangeDisputeFlag);
    }

    if signer == dispute_resolver {
        return Err(ContractError::DisputeResolverCannotDisputeTheEscrow);
    }

    Ok(())
}
````

## File: contracts/contracts/escrow/src/core/validators/escrow.rs
````rust
use soroban_sdk::{Address, Env};

use crate::{
    error::ContractError,
    storage::types::{DataKey, Escrow},
};

#[inline]
pub fn validate_release_conditions(
    escrow: &Escrow,
    release_signer: &Address,
) -> Result<(), ContractError> {
    if escrow.flags.released {
        return Err(ContractError::EscrowAlreadyReleased);
    }

    if escrow.flags.resolved {
        return Err(ContractError::EscrowAlreadyResolved);
    }

    if release_signer != &escrow.roles.release_signer {
        return Err(ContractError::OnlyReleaseSignerCanReleaseEarnings);
    }

    if escrow.milestones.is_empty() {
        return Err(ContractError::NoMilestoneDefined);
    }

    if !escrow.milestones.iter().all(|milestone| milestone.approved) {
        return Err(ContractError::EscrowNotCompleted);
    }

    if escrow.flags.disputed {
        return Err(ContractError::EscrowOpenedForDisputeResolution);
    }

    Ok(())
}

#[inline]
pub fn validate_escrow_conditions(
    existing_escrow: Option<&Escrow>,
    new_escrow: &Escrow,
    platform_address: Option<&Address>,
    contract_balance: Option<i128>,
    is_init: bool,
) -> Result<(), ContractError> {
    let max_bps_percentage: u32 = 99 * 100;
    if new_escrow.platform_fee > max_bps_percentage {
        return Err(ContractError::PlatformFeeTooHigh);
    }

    const TRUSTLESS_WORK_FEE_BPS: u32 = 30;
    if (new_escrow.platform_fee as u32) + TRUSTLESS_WORK_FEE_BPS > 10_000 {
        return Err(ContractError::PlatformFeeTooHigh);
    }

    if new_escrow.amount < 0 {
        return Err(ContractError::AmountCannotBeZero);
    }

    if new_escrow.milestones.is_empty() {
        return Err(ContractError::NoMilestoneDefined);
    }
    if new_escrow.milestones.len() > 50 {
        return Err(ContractError::TooManyMilestones);
    }

    if is_init {
        if new_escrow.flags.released
            || new_escrow.flags.disputed
            || new_escrow.flags.resolved
            || new_escrow.milestones.iter().any(|m| m.approved)
        {
            return Err(ContractError::FlagsMustBeFalse);
        }
    } else {
        let existing = existing_escrow.ok_or(ContractError::EscrowNotFound)?;

        let caller = platform_address.ok_or(ContractError::OnlyPlatformAddressExecuteThisFunction)?;
        if caller != &existing.roles.platform_address {
            return Err(ContractError::OnlyPlatformAddressExecuteThisFunction);
        }

        if existing.roles.platform_address != new_escrow.roles.platform_address {
            return Err(ContractError::PlatformAddressCannotBeChanged);
        }

        if existing.flags.disputed {
            return Err(ContractError::EscrowOpenedForDisputeResolution);
        }

        if new_escrow.flags.released
            || new_escrow.flags.disputed
            || new_escrow.flags.resolved
        {
            return Err(ContractError::FlagsMustBeFalse);
        }

        let has_funds = contract_balance.unwrap_or(0) > 0;
        if has_funds {
            if existing.engagement_id != new_escrow.engagement_id
                || existing.title != new_escrow.title
                || existing.description != new_escrow.description
                || existing.roles != new_escrow.roles
                || existing.amount != new_escrow.amount
                || existing.platform_fee != new_escrow.platform_fee
                || existing.flags != new_escrow.flags
                || existing.trustline != new_escrow.trustline
                || existing.receiver_memo != new_escrow.receiver_memo
            {
                return Err(ContractError::EscrowPropertiesMismatch);
            }

            let old_len = existing.milestones.len();
            let new_len = new_escrow.milestones.len();
            if new_len < old_len {
                return Err(ContractError::EscrowPropertiesMismatch);
            }
            for i in 0..old_len {
                if existing.milestones.get(i).unwrap() != new_escrow.milestones.get(i).unwrap() {
                    return Err(ContractError::EscrowPropertiesMismatch);
                }
            }

            for i in old_len..new_len {
                if new_escrow.milestones.get(i).unwrap().approved {
                    return Err(ContractError::FlagsMustBeFalse);
                }
            }
        } else {
            if existing.milestones.iter().any(|m| m.approved) {
                return Err(ContractError::MilestoneApprovedCantChangeEscrowProperties);
            }

            if new_escrow.milestones.iter().any(|m| m.approved) {
                return Err(ContractError::FlagsMustBeFalse);
            }
        }
    }

    Ok(())
}

#[inline]
pub fn validate_escrow_property_change_conditions(
    existing_escrow: &Escrow,
    new_escrow: &Escrow,
    platform_address: &Address,
    contract_balance: i128,
) -> Result<(), ContractError> {
    validate_escrow_conditions(
        Some(existing_escrow),
        new_escrow,
        Some(platform_address),
        Some(contract_balance),
        false,
    )
}

#[inline]
pub fn validate_initialize_escrow_conditions(
    e: &Env,
    escrow_properties: Escrow,
) -> Result<(), ContractError> {
    if e.storage().instance().has(&DataKey::Escrow) {
        return Err(ContractError::EscrowAlreadyInitialized);
    }
    validate_escrow_conditions(None, &escrow_properties, None, None, true)
}

#[inline]
pub fn validate_fund_escrow_conditions(
    amount: i128,
    balance: i128,
    stored_escrow: &Escrow,
    expected_escrow: &Escrow,
) -> Result<(), ContractError> {
    if amount <= 0 {
        return Err(ContractError::AmountCannotBeZero);
    }

    if !stored_escrow.eq(&expected_escrow) {
        return Err(ContractError::EscrowPropertiesMismatch);
    }

    if balance < amount {
        return Err(ContractError::InsufficientFundsForEscrowFunding);
    }

    Ok(())
}
````

## File: contracts/contracts/escrow/src/core/validators/milestone.rs
````rust
use soroban_sdk::Address;

use crate::{
    error::ContractError,
    storage::types::{Escrow, Milestone},
};

#[inline]
pub fn validate_milestone_status_change_conditions(
    escrow: &Escrow,
    service_provider: &Address,
) -> Result<(), ContractError> {
    if service_provider != &escrow.roles.service_provider {
        return Err(ContractError::OnlyServiceProviderChangeMilstoneStatus);
    }

    if escrow.milestones.is_empty() {
        return Err(ContractError::NoMilestoneDefined);
    }

    Ok(())
}

#[inline]
pub fn validate_milestone_flag_change_conditions(
    escrow: &Escrow,
    milestone: &Milestone,
    approver: &Address,
) -> Result<(), ContractError> {
    if approver != &escrow.roles.approver {
        return Err(ContractError::OnlyApproverChangeMilstoneFlag);
    }

    if milestone.approved {
        return Err(ContractError::MilestoneHasAlreadyBeenApproved);
    }

    if milestone.status.is_empty() {
        return Err(ContractError::EmptyMilestoneStatus);
    }

    if escrow.milestones.is_empty() {
        return Err(ContractError::NoMilestoneDefined);
    }

    Ok(())
}
````

## File: contracts/contracts/escrow/src/core/dispute.rs
````rust
use soroban_sdk::token::Client as TokenClient;
use soroban_sdk::{Address, Env, Map};

use crate::core::escrow::EscrowManager;
use crate::error::ContractError;
use crate::modules::{
    fee::{FeeCalculator, FeeCalculatorTrait},
    math::{BasicArithmetic, BasicMath},
};
use crate::storage::types::{DataKey, Escrow};

use super::validators::dispute::{
    validate_dispute_flag_change_conditions, validate_dispute_resolution_conditions,
};

pub struct DisputeManager;

impl DisputeManager {
    pub fn resolve_dispute(
        e: &Env,
        dispute_resolver: Address,
        trustless_work_address: Address,
        distributions: Map<Address, i128>,
    ) -> Result<Escrow, ContractError> {
        dispute_resolver.require_auth();
        let mut escrow = EscrowManager::get_escrow(e)?;
        let contract_address = e.current_contract_address();

        let token_client = TokenClient::new(&e, &escrow.trustline.address);
        let current_balance = token_client.balance(&contract_address);

        let mut total: i128 = 0;
        for (_addr, amount) in distributions.iter() {
            if amount <= 0 {
                return Err(ContractError::AmountsToBeTransferredShouldBePositive);
            }
            total = BasicMath::safe_add(total, amount)?;
        }

        validate_dispute_resolution_conditions(
            &escrow,
            &dispute_resolver,
            current_balance,
            total,
        )?;

        let fee_result = FeeCalculator::calculate_standard_fees(total, escrow.platform_fee)?;
        let total_fees =
            BasicMath::safe_add(fee_result.trustless_work_fee, fee_result.platform_fee)?;

        if fee_result.trustless_work_fee > 0 {
            token_client.transfer(
                &contract_address,
                &trustless_work_address,
                &fee_result.trustless_work_fee,
            );
        }
        if fee_result.platform_fee > 0 {
            token_client.transfer(
                &contract_address,
                &escrow.roles.platform_address,
                &fee_result.platform_fee,
            );
        }

        for (addr, amount) in distributions.iter() {
            if amount <= 0 {
                continue;
            }
            let fee_share = (amount * (total_fees as i128)) / total;
            let net_amount = amount - fee_share;
            if net_amount > 0 {
                token_client.transfer(&contract_address, &addr, &net_amount);
            }
        }

        escrow.flags.resolved = true;
        escrow.flags.disputed = false;
        e.storage().instance().set(&DataKey::Escrow, &escrow);

        Ok(escrow)
    }

    pub fn dispute_escrow(e: &Env, signer: Address) -> Result<Escrow, ContractError> {
        signer.require_auth();
        let mut escrow = EscrowManager::get_escrow(e)?;
        validate_dispute_flag_change_conditions(&escrow, &signer)?;

        escrow.flags.disputed = true;
        e.storage().instance().set(&DataKey::Escrow, &escrow);

        Ok(escrow)
    }
}
````

## File: contracts/contracts/escrow/src/core/escrow.rs
````rust
use soroban_sdk::token::Client as TokenClient;
use soroban_sdk::{Address, Env, Symbol, Vec};

use crate::core::validators::escrow::{
    validate_escrow_property_change_conditions, validate_fund_escrow_conditions,
    validate_initialize_escrow_conditions, validate_release_conditions,
};
use crate::error::ContractError;
use crate::modules::fee::{FeeCalculator, FeeCalculatorTrait};
use crate::storage::types::{AddressBalance, DataKey, Escrow};

pub struct EscrowManager;

impl EscrowManager {
    #[inline]
    pub fn get_receiver(escrow: &Escrow) -> Address {
        escrow.roles.receiver.clone()
    }

    pub fn initialize_escrow(e: &Env, escrow_properties: Escrow) -> Result<Escrow, ContractError> {
        validate_initialize_escrow_conditions(e, escrow_properties.clone())?;
        e.storage()
            .instance()
            .set(&DataKey::Escrow, &escrow_properties);
        Ok(escrow_properties)
    }

    pub fn fund_escrow(
        e: &Env,
        signer: &Address,
        expected_escrow: &Escrow,
        amount: i128,
    ) -> Result<(), ContractError> {
        let stored_escrow: Escrow = Self::get_escrow(e)?;
        
        signer.require_auth();
        let token_client = TokenClient::new(e, &stored_escrow.trustline.address);
        let balance = token_client.balance(signer);
        validate_fund_escrow_conditions(amount, balance, &stored_escrow, expected_escrow)?;

        token_client.transfer(signer, &e.current_contract_address(), &amount);
        Ok(())
    }

    pub fn release_funds(
        e: &Env,
        release_signer: &Address,
        trustless_work_address: &Address,
    ) -> Result<(), ContractError> {
        release_signer.require_auth();

        let mut escrow = Self::get_escrow(e)?;
        validate_release_conditions(&escrow, release_signer)?;

        escrow.flags.released = true;
        e.storage().instance().set(&DataKey::Escrow, &escrow);

        let contract_address = e.current_contract_address();
        let token_client = TokenClient::new(e, &escrow.trustline.address);

        if token_client.balance(&contract_address) < escrow.amount {
            return Err(ContractError::EscrowBalanceNotEnoughToSendEarnings);
        }

        let fee_result =
            FeeCalculator::calculate_standard_fees(escrow.amount as i128, escrow.platform_fee)?;

        token_client.transfer(
            &contract_address,
            trustless_work_address,
            &fee_result.trustless_work_fee,
        );
        token_client.transfer(
            &contract_address,
            &escrow.roles.platform_address,
            &fee_result.platform_fee,
        );

        let receiver = Self::get_receiver(&escrow);
        token_client.transfer(&contract_address, &receiver, &fee_result.receiver_amount);

        Ok(())
    }
    pub fn change_escrow_properties(
        e: &Env,
        platform_address: &Address,
        escrow_properties: Escrow,
    ) -> Result<Escrow, ContractError> {
        platform_address.require_auth();
        let existing_escrow = Self::get_escrow(e)?;
        let token_client = TokenClient::new(e, &existing_escrow.trustline.address);
        let contract_balance = token_client.balance(&e.current_contract_address());

        validate_escrow_property_change_conditions(
            &existing_escrow,
            &escrow_properties,
            platform_address,
            contract_balance,
        )?;

        e.storage()
            .instance()
            .set(&DataKey::Escrow, &escrow_properties);
        Ok(escrow_properties)
    }

    pub fn get_multiple_escrow_balances(
        e: &Env,
        addresses: Vec<Address>,
    ) -> Result<Vec<AddressBalance>, ContractError> {
        const MAX_ESCROWS: u32 = 20;
        if addresses.len() > MAX_ESCROWS {
            return Err(ContractError::TooManyEscrowsRequested);
        }

        let mut balances: Vec<AddressBalance> = Vec::new(e);
        let self_addr = e.current_contract_address();
        for address in addresses.iter() {
            let escrow = if address == self_addr {
                Self::get_escrow(e)?
            } else {
                Self::get_escrow_by_contract_id(e, &address)?
            };
            let token_client = TokenClient::new(e, &escrow.trustline.address);
            let balance = token_client.balance(&address);
            balances.push_back(AddressBalance {
                address: address.clone(),
                balance,
                trustline_decimals: token_client.decimals(),
            });
        }
        Ok(balances)
    }

    pub fn get_escrow_by_contract_id(
        e: &Env,
        contract_id: &Address,
    ) -> Result<Escrow, ContractError> {
        Ok(e.invoke_contract::<Escrow>(contract_id, &Symbol::new(e, "get_escrow"), Vec::new(e)))
    }

    pub fn get_escrow(e: &Env) -> Result<Escrow, ContractError> {
        Ok(e.storage()
            .instance()
            .get(&DataKey::Escrow)
            .ok_or(ContractError::EscrowNotFound)?)
    }
}
````

## File: contracts/contracts/escrow/src/core/milestone.rs
````rust
use crate::error::ContractError;
use crate::storage::types::DataKey;
use crate::{core::escrow::EscrowManager, storage::types::Escrow};
use soroban_sdk::{Address, Env, String};

use super::validators::milestone::{
    validate_milestone_flag_change_conditions, validate_milestone_status_change_conditions,
};

pub struct MilestoneManager;

impl MilestoneManager {
    pub fn change_milestone_status(
        e: &Env,
        milestone_index: i128,
        new_status: String,
        new_evidence: Option<String>,
        service_provider: Address,
    ) -> Result<Escrow, ContractError> {
        service_provider.require_auth();
        let mut existing_escrow = EscrowManager::get_escrow(e)?;

        validate_milestone_status_change_conditions(&existing_escrow, &service_provider)?;

        let mut milestone_to_update = existing_escrow
            .milestones
            .get(milestone_index as u32)
            .ok_or(ContractError::InvalidMileStoneIndex)?;

        if let Some(evidence) = new_evidence {
            milestone_to_update.evidence = evidence;
        }

        milestone_to_update.status = new_status;

        existing_escrow
            .milestones
            .set(milestone_index as u32, milestone_to_update);
        e.storage()
            .instance()
            .set(&DataKey::Escrow, &existing_escrow);

        Ok(existing_escrow)
    }

    pub fn change_milestone_approved_flag(
        e: &Env,
        milestone_index: i128,
        approver: Address,
    ) -> Result<Escrow, ContractError> {
        approver.require_auth();
        let mut existing_escrow = EscrowManager::get_escrow(e)?;

        let mut milestone_to_update = existing_escrow
            .milestones
            .get(milestone_index as u32)
            .ok_or(ContractError::InvalidMileStoneIndex)?;

        validate_milestone_flag_change_conditions(
            &existing_escrow,
            &milestone_to_update,
            &approver,
        )?;
        milestone_to_update.approved = true;

        existing_escrow
            .milestones
            .set(milestone_index as u32, milestone_to_update);
        e.storage()
            .instance()
            .set(&DataKey::Escrow, &existing_escrow);

        Ok(existing_escrow)
    }
}
````

## File: contracts/contracts/escrow/src/events/handler.rs
````rust
use crate::storage::types::Escrow;
use soroban_sdk::{contractevent, String};

#[contractevent(topics = ["tw_init"], data_format = "vec")]
#[derive(Clone)]
pub struct InitEsc {
    pub escrow: Escrow,
}

#[contractevent(topics = ["tw_fund"], data_format = "vec")]
#[derive(Clone)]
pub struct FundEsc {
    pub signer: soroban_sdk::Address,
    pub amount: i128,
}

#[contractevent(topics = ["tw_release"], data_format = "single-value")]
#[derive(Clone)]
pub struct DisEsc {
    pub release_signer: soroban_sdk::Address,
}

#[contractevent(topics = ["tw_update"], data_format = "vec")]
#[derive(Clone)]
pub struct ChgEsc {
    pub platform: soroban_sdk::Address,
    pub engagement_id: String,
    pub new_escrow_properties: Escrow,
}

// Milestones
#[contractevent(topics = ["tw_ms_change"], data_format = "vec")]
#[derive(Clone)]
pub struct MilestoneStatusChanged {
    pub escrow: Escrow,
}

#[contractevent(topics = ["tw_ms_approve"], data_format = "vec")]
#[derive(Clone)]
pub struct MilestoneApproved {
    pub escrow: Escrow,
}

// Disputes
#[contractevent(topics = ["tw_disp_resolve"], data_format = "vec")]
#[derive(Clone)]
pub struct DisputeResolved {
    pub escrow: Escrow,
}

#[contractevent(topics = ["tw_dispute"], data_format = "vec")]
#[derive(Clone)]
pub struct EscrowDisputed {
    pub escrow: Escrow,
}

// Admin / TTL
#[contractevent(topics = ["tw_ttl_extend"], data_format = "vec")]
#[derive(Clone)]
pub struct ExtTtlEvt {
    pub platform: soroban_sdk::Address,
    pub ledgers_to_extend: u32,
}
````

## File: contracts/contracts/escrow/src/modules/fee/calculator.rs
````rust
use crate::{
    error::ContractError,
    modules::{
        math::{BasicArithmetic, BasicMath},
        math::{SafeArithmetic, SafeMath},
    },
};

const TRUSTLESS_WORK_FEE_BPS: u32 = 30;
const BASIS_POINTS_DENOMINATOR: i128 = 10000;

#[derive(Debug, Clone)]
pub struct StandardFeeResult {
    pub trustless_work_fee: i128,
    pub platform_fee: i128,
    pub receiver_amount: i128,
}

pub trait FeeCalculatorTrait {
    fn calculate_standard_fees(
        total_amount: i128,
        platform_fee_bps: u32,
    ) -> Result<StandardFeeResult, ContractError>;
}

#[derive(Clone)]
pub struct FeeCalculator;

impl FeeCalculatorTrait for FeeCalculator {
    fn calculate_standard_fees(
        total_amount: i128,
        platform_fee_bps: u32,
    ) -> Result<StandardFeeResult, ContractError> {
        let trustless_work_fee = SafeMath::safe_mul_div(
            total_amount,
            TRUSTLESS_WORK_FEE_BPS,
            BASIS_POINTS_DENOMINATOR,
        )?;
        let platform_fee =
            SafeMath::safe_mul_div(total_amount, platform_fee_bps, BASIS_POINTS_DENOMINATOR)?;

        let after_tw = BasicMath::safe_sub(total_amount, trustless_work_fee)?;
        let receiver_amount = BasicMath::safe_sub(after_tw, platform_fee)?;

        Ok(StandardFeeResult {
            trustless_work_fee,
            platform_fee,
            receiver_amount,
        })
    }
}
````

## File: contracts/contracts/escrow/src/modules/math/basic.rs
````rust
use crate::error::ContractError;

pub struct BasicMath;

pub trait BasicArithmetic {
    fn safe_add(a: i128, b: i128) -> Result<i128, ContractError>;
    fn safe_sub(a: i128, b: i128) -> Result<i128, ContractError>;
}

impl BasicArithmetic for BasicMath {
    fn safe_add(a: i128, b: i128) -> Result<i128, ContractError> {
        a.checked_add(b).ok_or(ContractError::Overflow)
    }

    fn safe_sub(a: i128, b: i128) -> Result<i128, ContractError> {
        a.checked_sub(b).ok_or(ContractError::Underflow)
    }
}
````

## File: contracts/contracts/escrow/src/modules/math/safe.rs
````rust
use crate::error::ContractError;

pub struct SafeMath;

pub trait SafeArithmetic {
    fn safe_mul_div(amount: i128, multiplier: u32, divisor: i128) -> Result<i128, ContractError>;
}

impl SafeArithmetic for SafeMath {
    fn safe_mul_div(amount: i128, multiplier: u32, divisor: i128) -> Result<i128, ContractError> {
        amount
            .checked_mul(multiplier.into())
            .ok_or(ContractError::Overflow)?
            .checked_div(divisor)
            .ok_or(ContractError::DivisionError)
    }
}
````

## File: contracts/contracts/escrow/src/storage/types.rs
````rust
use soroban_sdk::{contracttype, Address, String, Vec};

#[contracttype]
#[derive(Clone, PartialEq, Eq)]
pub struct Escrow {
    pub engagement_id: String,
    pub title: String,
    pub roles: Roles,
    pub description: String,
    pub amount: i128,
    pub platform_fee: u32,
    pub milestones: Vec<Milestone>,
    pub flags: Flags,
    pub trustline: Trustline,
    pub receiver_memo: i128,
}

#[contracttype]
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Milestone {
    pub description: String,
    pub status: String,
    pub evidence: String,
    pub approved: bool,
}

#[contracttype]
#[derive(Clone, PartialEq, Eq)]
pub struct Roles {
    pub approver: Address,
    pub service_provider: Address,
    pub platform_address: Address,
    pub release_signer: Address,
    pub dispute_resolver: Address,
    pub receiver: Address,
}

#[contracttype]
#[derive(Clone, PartialEq, Eq)]
pub struct Flags {
    pub disputed: bool,
    pub released: bool,
    pub resolved: bool,
}

#[contracttype]
#[derive(Clone, PartialEq, Eq)]
pub struct Trustline {
    pub address: Address,
}

#[contracttype]
#[derive(Clone)]
pub struct AddressBalance {
    pub address: Address,
    pub balance: i128,
    pub trustline_decimals: u32,
}

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Escrow,
    Admin,
}
````

## File: contracts/contracts/escrow/src/contract.rs
````rust
use soroban_sdk::{contract, contractimpl, Address, BytesN, Env, Map, String, Symbol, Val, Vec};

use crate::core::{DisputeManager, EscrowManager, MilestoneManager};
use crate::error::ContractError;
use crate::events::handler::{
    ChgEsc, DisEsc, DisputeResolved, EscrowDisputed, ExtTtlEvt, FundEsc, InitEsc,
    MilestoneApproved, MilestoneStatusChanged,
};
use crate::storage::types::{AddressBalance, Escrow};

#[contract]
pub struct EscrowContract;

#[contractimpl]
impl EscrowContract {
    pub fn __constructor() {}

    pub fn tw_new_single_release_escrow(
        env: Env,
        deployer: Address,
        wasm_hash: BytesN<32>,
        salt: BytesN<32>,
        init_fn: Symbol,
        init_args: Vec<Val>,
        constructor_args: Vec<Val>,
    ) -> (Address, Val) {
        if deployer != env.current_contract_address() {
            deployer.require_auth();
        }

        let deployed_address = env
            .deployer()
            .with_address(deployer, salt)
            .deploy_v2(wasm_hash, constructor_args);

        let res: Val = env.invoke_contract(&deployed_address, &init_fn, init_args);
        (deployed_address, res)
    }

    ////////////////////////
    // Escrow /////
    ////////////////////////

    pub fn initialize_escrow(e: &Env, escrow_properties: Escrow) -> Result<Escrow, ContractError> {
        let initialized_escrow = EscrowManager::initialize_escrow(e, escrow_properties)?;
        InitEsc {
            escrow: initialized_escrow.clone(),
        }
        .publish(e);
        Ok(initialized_escrow)
    }

    pub fn fund_escrow(
        e: &Env,
        signer: Address,
        expected_escrow: Escrow,
        amount: i128,
    ) -> Result<(), ContractError> {
        EscrowManager::fund_escrow(e, &signer, &expected_escrow, amount)?;
        FundEsc { signer, amount }.publish(e);
        Ok(())
    }

    pub fn release_funds(
        e: &Env,
        release_signer: Address,
        trustless_work_address: Address,
    ) -> Result<(), ContractError> {
        EscrowManager::release_funds(e, &release_signer, &trustless_work_address)?;
        DisEsc { release_signer }.publish(e);
        Ok(())
    }

    pub fn update_escrow(
        e: &Env,
        plataform_address: Address,
        escrow_properties: Escrow,
    ) -> Result<Escrow, ContractError> {
        let updated_escrow = EscrowManager::change_escrow_properties(
            e,
            &plataform_address,
            escrow_properties.clone(),
        )?;
        ChgEsc {
            platform: plataform_address,
            engagement_id: escrow_properties.engagement_id.clone(),
            new_escrow_properties: updated_escrow.clone(),
        }
        .publish(e);
        Ok(updated_escrow)
    }

    pub fn get_escrow(e: &Env) -> Result<Escrow, ContractError> {
        EscrowManager::get_escrow(e)
    }

    pub fn get_escrow_by_contract_id(
        e: &Env,
        contract_id: Address,
    ) -> Result<Escrow, ContractError> {
        EscrowManager::get_escrow_by_contract_id(e, &contract_id)
    }

    pub fn get_multiple_escrow_balances(
        e: &Env,
        addresses: Vec<Address>,
    ) -> Result<Vec<AddressBalance>, ContractError> {
        EscrowManager::get_multiple_escrow_balances(e, addresses)
    }

    ////////////////////////
    // Admin / TTL /////
    ////////////////////////

    pub fn extend_contract_ttl(
        e: &Env,
        platform_address: Address,
        ledgers_to_extend: u32,
    ) -> Result<(), ContractError> {
        platform_address.require_auth();

        let escrow = EscrowManager::get_escrow(e)?;
        if platform_address != escrow.roles.platform_address {
            return Err(ContractError::OnlyPlatformAddressExecuteThisFunction);
        }

        let min_ledgers = 1u32;
        e.storage()
            .instance()
            .extend_ttl(min_ledgers, ledgers_to_extend);

        ExtTtlEvt {
            platform: platform_address,
            ledgers_to_extend,
        }
        .publish(e);

        Ok(())
    }

    ////////////////////////
    // Milestones /////
    ////////////////////////

    pub fn change_milestone_status(
        e: Env,
        milestone_index: i128,
        new_status: String,
        new_evidence: Option<String>,
        service_provider: Address,
    ) -> Result<(), ContractError> {
        let escrow = MilestoneManager::change_milestone_status(
            &e,
            milestone_index,
            new_status,
            new_evidence,
            service_provider,
        )?;
        MilestoneStatusChanged { escrow }.publish(&e);
        Ok(())
    }

    pub fn approve_milestone(
        e: Env,
        milestone_index: i128,
        approver: Address,
    ) -> Result<(), ContractError> {
        let escrow =
            MilestoneManager::change_milestone_approved_flag(&e, milestone_index, approver)?;
        MilestoneApproved { escrow }.publish(&e);
        Ok(())
    }

    ////////////////////////
    // Disputes /////
    ////////////////////////

    pub fn resolve_dispute(
        e: Env,
        dispute_resolver: Address,
        trustless_work_address: Address,
        distributions: Map<Address, i128>,
    ) -> Result<(), ContractError> {
        let escrow = DisputeManager::resolve_dispute(
            &e,
            dispute_resolver,
            trustless_work_address,
            distributions,
        )?;
        DisputeResolved { escrow }.publish(&e);
        Ok(())
    }

    pub fn dispute_escrow(e: Env, signer: Address) -> Result<(), ContractError> {
        let escrow = DisputeManager::dispute_escrow(&e, signer)?;
        EscrowDisputed { escrow }.publish(&e);
        Ok(())
    }
}
````

## File: contracts/contracts/escrow/src/error.rs
````rust
use core::fmt;
use soroban_sdk::contracterror;

#[derive(Debug, Copy, Clone, PartialEq)]
#[contracterror]
pub enum ContractError {
    AmountCannotBeZero = 1,
    EscrowAlreadyInitialized = 2,
    EscrowNotFound = 3,
    OnlyReleaseSignerCanReleaseEarnings = 4,
    EscrowNotCompleted = 5,
    EscrowBalanceNotEnoughToSendEarnings = 6,
    OnlyPlatformAddressExecuteThisFunction = 7,
    OnlyServiceProviderChangeMilstoneStatus = 8,
    NoMilestoneDefined = 9,
    InvalidMileStoneIndex = 10,
    OnlyApproverChangeMilstoneFlag = 11,
    OnlyDisputeResolverCanExecuteThisFunction = 12,
    EscrowAlreadyInDispute = 13,
    EscrowNotInDispute = 14,
    InsufficientFundsForResolution = 15,
    EscrowOpenedForDisputeResolution = 16,
    Overflow = 17,
    Underflow = 18,
    DivisionError = 19,
    InsufficientApproverFundsForCommissions = 20,
    InsufficientServiceProviderFundsForCommissions = 21,
    MilestoneApprovedCantChangeEscrowProperties = 22,
    EscrowHasFunds = 23,
    EscrowAlreadyResolved = 24,
    TooManyEscrowsRequested = 25,
    UnauthorizedToChangeDisputeFlag = 26,
    TooManyMilestones = 27,
    ReceiverAndApproverFundsNotEqual = 28,
    AmountsToBeTransferredShouldBePositive = 38,
    DistributionsMustEqualEscrowBalance = 39,
    MilestoneHasAlreadyBeenApproved = 29,
    EmptyMilestoneStatus = 30,
    PlatformFeeTooHigh = 31,
    FlagsMustBeFalse = 32,
    EscrowPropertiesMismatch = 33,
    ApproverOrReceiverFundsLessThanZero = 34,
    EscrowAlreadyReleased = 35,
    IncompatibleEscrowWasmHash = 36,
    PlatformAddressCannotBeChanged = 37,
    DisputeResolverCannotDisputeTheEscrow = 40,
    TotalAmountCannotBeZero = 41,
    InsufficientFundsForEscrowFunding = 42,
}

impl fmt::Display for ContractError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            ContractError::AmountCannotBeZero => {
                write!(f, "Amount cannot be equal to or less than zero")
            }
            ContractError::EscrowAlreadyInitialized => write!(f, "Escrow already initialized"),
            ContractError::EscrowNotFound => write!(f, "Escrow not found"),
            ContractError::OnlyReleaseSignerCanReleaseEarnings => {
                write!(f, "Only the release signer can release the escrow earnings")
            }
            ContractError::EscrowNotCompleted => {
                write!(f, "The escrow must be completed to release earnings")
            }
            ContractError::EscrowBalanceNotEnoughToSendEarnings => write!(
                f,
                "The escrow balance must be equal to the amount of earnings defined for the escrow"
            ),
            ContractError::OnlyPlatformAddressExecuteThisFunction => write!(
                f,
                "Only the platform address should be able to execute this function"
            ),
            ContractError::OnlyServiceProviderChangeMilstoneStatus => {
                write!(f, "Only the service provider can change milestone status")
            }
            ContractError::NoMilestoneDefined => write!(f, "Escrow initialized without milestone"),
            ContractError::InvalidMileStoneIndex => write!(f, "Invalid milestone index"),
            ContractError::OnlyApproverChangeMilstoneFlag => {
                write!(f, "Only the approver can change milestone flag")
            }
            ContractError::OnlyDisputeResolverCanExecuteThisFunction => {
                write!(f, "Only the dispute resolver can execute this function")
            }
            ContractError::EscrowAlreadyInDispute => write!(f, "Escrow already in dispute"),
            ContractError::EscrowNotInDispute => write!(f, "Escrow not in dispute"),
            ContractError::InsufficientFundsForResolution => {
                write!(f, "Insufficient funds for resolution")
            }
            ContractError::EscrowOpenedForDisputeResolution => {
                write!(f, "Escrow has been opened for dispute resolution")
            }
            ContractError::InsufficientApproverFundsForCommissions => {
                write!(f, "Insufficient approver funds for commissions")
            }
            ContractError::InsufficientServiceProviderFundsForCommissions => {
                write!(f, "Insufficient Service Provider funds for commissions")
            }
            ContractError::MilestoneApprovedCantChangeEscrowProperties => {
                write!(
                    f,
                    "You can't change the escrow properties after the milestone is approved"
                )
            }
            ContractError::EscrowHasFunds => write!(f, "Escrow has funds"),
            ContractError::Overflow => write!(f, "This operation can cause an Overflow"),
            ContractError::Underflow => write!(f, "This operation can cause an Underflow"),
            ContractError::DivisionError => write!(f, "This operation can cause Division error"),
            ContractError::EscrowAlreadyResolved => write!(f, "This escrow is already resolved"),
            ContractError::TooManyEscrowsRequested => {
                write!(f, "You have requested too many escrows")
            }
            ContractError::UnauthorizedToChangeDisputeFlag => {
                write!(f, "You are not authorized to change the dispute flag")
            }
            ContractError::TooManyMilestones => {
                write!(f, "Cannot define more than 50 milestones in an escrow")
            }
            ContractError::ReceiverAndApproverFundsNotEqual => {
                write!(
                    f,
                    "The approver's and receiver's funds must equal the current escrow balance."
                )
            }
            ContractError::AmountsToBeTransferredShouldBePositive => {
                write!(
                    f,
                    "None of the amounts to be transferred should be less or equal than 0."
                )
            }
            ContractError::DistributionsMustEqualEscrowBalance => {
                write!(f, "The sum of distributions must equal the current escrow balance when resolving an escrow dispute.")
            }
            ContractError::MilestoneHasAlreadyBeenApproved => {
                write!(
                    f,
                    "You cannot approve a milestone that has already been approved previously"
                )
            }
            ContractError::EmptyMilestoneStatus => {
                write!(f, "The milestone status cannot be empty")
            }
            ContractError::PlatformFeeTooHigh => {
                write!(f, "The platform fee cannot exceed 99%")
            }
            ContractError::FlagsMustBeFalse => {
                write!(f, "All flags (approved, disputed, released) must be false in order to execute this function.")
            }
            ContractError::EscrowPropertiesMismatch => {
                write!(
                    f,
                    "The provided escrow properties do not match the stored escrow."
                )
            }
            ContractError::ApproverOrReceiverFundsLessThanZero => {
                write!(
                    f,
                    "The funds of the approver or receiver must not be less or equal than 0."
                )
            }
            ContractError::EscrowAlreadyReleased => {
                write!(f, "The escrow funds have been released.")
            }
            ContractError::IncompatibleEscrowWasmHash => {
                write!(
                    f,
                    "The provided contract address is not an instance of this escrow contract."
                )
            }
            ContractError::PlatformAddressCannotBeChanged => {
                write!(f, "The platform address of the escrow cannot be changed.")
            }
            ContractError::DisputeResolverCannotDisputeTheEscrow => {
                write!(f, "The dispute resolver cannot dispute the escrow.")
            }
            ContractError::TotalAmountCannotBeZero => {
                write!(f, "The total amount to be distributed cannot be equal to zero.")
            }
            ContractError::InsufficientFundsForEscrowFunding => {
                write!(f, "The signer has insufficient funds to fund the escrow.")
            }
        }
    }
}
````

## File: contracts/contracts/escrow/src/lib.rs
````rust
#![no_std]

mod contract;
mod core {
    pub mod dispute;
    pub mod escrow;
    pub mod milestone;
    pub use dispute::*;
    pub use escrow::*;
    pub use milestone::*;
    pub mod validators {
        pub mod dispute;
        pub mod escrow;
        pub mod milestone;
    }
}
mod error;
mod events {
    pub mod handler;
}
mod modules {
    pub mod math {
        pub mod basic;
        pub mod safe;

        pub use basic::*;
        pub use safe::*;
    }

    pub mod fee {
        pub mod calculator;

        pub use calculator::*;
    }
}

/// This module is currently Work In Progress.
mod storage {
    pub mod types;
}
mod tests {
    #[cfg(test)]
    mod test;
}

pub use crate::contract::EscrowContract;
````

## File: contracts/contracts/escrow/Cargo.toml
````toml
[package]
name = "escrow"
version = "0.0.0"
edition = "2021"
publish = false

[lib]
crate-type = ["cdylib"]

[dependencies]
soroban-sdk = { workspace = true }
soroban-token-sdk = { workspace = true }

[dev-dependencies]
soroban-sdk = { workspace = true, features = ["testutils"] }
soroban-token-sdk = { workspace = true }
````

## File: contracts/Cargo.toml
````toml
[workspace]
resolver = "2"
members = [
"contracts/*",
]

[workspace.dependencies]
soroban-sdk = "23.1.1"
soroban-token-sdk = { version = "23.1.1" }

[profile.release]
opt-level = "z"
overflow-checks = true
debug = 0
strip = "symbols"
debug-assertions = false
panic = "abort"
codegen-units = 1
lto = true

# For more información sobre este perfil ve https://soroban.stellar.org/docs/basic-tutorials/logging#cargotoml-profile
[profile.release-with-logs]
inherits = "release"
debug-assertions = true
````

## File: contracts/CONTRIBUTORS_GUIDELINE.md
````markdown
# Contributing Guide

## 1. Fork the Repository

- Make sure you have a GitHub account.
- Visit the repository's page and click the **Fork** button in the top-right corner.

---

## 2. Clone the Fork

- Clone your forked repository to your local machine:

```bash
git clone https://github.com/YOUR_USERNAME/REPOSITORY_NAME.git
```

---

## 3. Execute the tests

- You need to execute the following command to start running the tests:

```bash
cargo test
```

- If you have successfully completed the tests you are ready to start contributing. 🚀 

---

## 3. Create a New Branch

- Create a new branch according to the guidelines in the following document: [Git Guidelines](https://github.com/Tico4Chain-Coders/Trustless-Work/blob/main/GIT_GUIDELINE.md).
- Make sure to base the branch name on the type of change you're making (e.g., `feat/name-related-issue`, `fix/name-related-issue`).

```bash
git checkout -b your-branch-name
```

---

## 4. Make Atomic Commits

- Create atomic commits following the guidelines outlined here: [Git Guidelines](https://github.com/Tico4Chain-Coders/Trustless-Work/blob/main/GIT_GUIDELINE.md).
- Each commit should represent a small, focused change. Avoid including multiple unrelated changes in a single commit.

```bash
git add .
git commit -m "type: description"
```

---

## 5. Push Your Changes

- Push the changes to your forked repository:

```bash
git push origin your-branch-name
```

---

## 6. Generate a Pull Request (PR)

- Create a Pull Request (PR) to the **develop** branch of the original repository.
- Follow the PR template below to submit your PR.
- **Important:** If you don’t use the provided PR template properly, your PR will be ignored.
````

## File: contracts/GIT_GUIDELINE.md
````markdown
# Commit Guidelines | TRUSTLESS WORK

This guideline aims to establish a clear set of conventions for commit messages in this project. Following these conventions helps maintain a clear and consistent commit history.

## Commit and Branches Structure

The message should follow the format:

**NOTE:** ALL THE COMMITS AND BRANCHES SHOULD BE IN LOWERCASE

#### Types of Branches

- **feat**: New features
- **fix**: Bug fixes
- **remove**: Files
- **docs**: Documentation updates
- **style**: Style changes
- **refactor**: Refactoring code
- **perf**: Performance improvements
- **test**: Test-related changes
- **build**: Build system changes
- **ci**: CI changes
- **change**: Littles changes
- **chore**: Other changes

#### Example Branch Names

- `feat/user-registration`
- `fix/product-price-validation`
- `docs/readme-update`
- `style/button-styling`

### Types of Commits

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Changes that do not affect the meaning of the code (formatting, etc.)
- `refactor`: Code changes that neither fix a bug nor add a feature
- `perf`: Changes that improve performance
- `test`: Adding missing tests or correcting existing tests
- `build`: Changes that affect the build system or external dependencies
- `ci`: Changes to CI configuration files and scripts
- `chore`: Maintenance changes that do not fall into any of the other categories

### Message

The message should be clear and descriptive, including the "what" and "why" of the change. It should be concise (less than 72 characters).

### Example Commit Messages

- `feat: add user registration support`
- `fix: fix price validation error`
- `docs: update installation section`

## Thanks for follow the guidelines
````

## File: contracts/README.md
````markdown
<p align="center"> <img src="https://github.com/user-attachments/assets/5b182044-dceb-41f5-acf0-da22dea7c98a" alt="CLR-S (2)"> </p>

# Trustless Work | [API Documentation](https://docs.trustlesswork.com/trustless-work)
It enables trustless payments via smart contracts, securing funds in escrow until milestones are approved by clients. Stablecoins like USDC are used to ensure stability and ease of use.

# Maintainers | [Telegram](https://t.me/+kmr8tGegxLU0NTA5)

<table align="center">
  <tr>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/6b97e15f-9954-47d0-81b5-49f83bed5e4b" alt="Owner 1" width="150" />
      <br /><br />
      <strong>Tech Rebel | Product Manager</strong>
      <br /><br />
      <a href="https://github.com/techrebelgit" target="_blank">techrebelgit</a>
      <br />
      <a href="https://t.me/Tech_Rebel" target="_blank">Telegram</a>
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/e245e8af-6f6f-4a0a-a37f-df132e9b4986" alt="Owner 2" width="150" />
      <br /><br />
      <strong>Joel Vargas | Frontend Developer</strong>
      <br /><br />
      <a href="https://github.com/JoelVR17" target="_blank">JoelVR17</a>
      <br />
      <a href="https://t.me/joelvr20" target="_blank">Telegram</a>
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/53d65ea1-007e-40aa-b9b5-e7a10d7bea84" alt="Owner 3" width="150" />
      <br /><br />
      <strong>Armando Murillo | Full Stack Developer</strong>
      <br /><br />
      <a href="https://github.com/armandocodecr" target="_blank">armandocodecr</a>
      <br />
      <a href="https://t.me/armandocode" target="_blank">Telegram</a>
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/851273f6-2f91-413d-bd2d-d8dc1f3c2d28" alt="Owner 4" width="150" />
      <br /><br />
      <strong>Caleb Loría | Smart Contract Developer</strong>
      <br /><br />
      <a href="https://github.com/zkCaleb-dev" target="_blank">zkCaleb-dev</a>
      <br />
      <a href="https://t.me/zkCaleb_dev" target="_blank">Telegram</a>
    </td>
  </tr>
</table>

## Contents

- [Installing Rust](#installing-rust)
- [Install the Stellar CLI](#install-stellar-cli)
- [Configuring the CLI for Testnet](#configuring-the-cli-for-testnet)
- [Configure an idenity](#configure-an-identity)
- [Deploy project on Testenet](#deploy-project-on-testnet)

## Installing Rust

### Linux, macOS, or Unix-like Systems

If you're using macOS, Linux, or any other Unix-like system, the simplest method to install Rust is by using `rustup`. Install it with the following command:

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### Windows

On Windows, download and run `rustup-init.exe`. You can proceed with the default setup by pressing `Enter`.

You can also follow the official Rust guide [here](https://www.rust-lang.org/tools/install).

### Install the wasm32 target.

After installing Rust, add the `wasm32-unknown-unknown` target:

```bash
rustup target add wasm32-unknown-unknown
```



## Install Stellar CLI

There are a few ways to install the [latest released version](https://github.com/stellar/stellar-cli/releases) of Stellar CLI.

The toolset installed with Rust allows you to use the `cargo` command in the terminal to install the Stellar CLI.

### Install with cargo from source:

```sh
cargo install --locked stellar-cli --features opt
```

### Install with cargo-binstall:

```sh
cargo install --locked cargo-binstall
cargo binstall -y stellar-cli
```

### Install with Homebrew (macOS, Linux):

```sh
brew install stellar-cli
```



## Configuring the CLI for Testnet

Stellar has a test network called Testnet that you can use to deploy  and test your smart contracts. It's a live network, but it's not the  same as the Stellar public network. It's a separate network that is used for development and testing, so you can't use it for production apps.  But it's a great place to test your contracts before you deploy them to  the public network.

To configure your CLI to interact with Testnet, run the following command:

### macOS/Linux

```sh
stellar network add \
  --global testnet \
  --rpc-url https://soroban-testnet.stellar.org:443 \
  --network-passphrase "Test SDF Network ; September 2015"
```

### Windows (PowerShell)

```sh
stellar network add `
  --global testnet `
  --rpc-url https://soroban-testnet.stellar.org:443 `
  --network-passphrase "Test SDF Network ; September 2015"
```

Note the `--global` flag. This creates a file in your home folder's `~/.config/soroban/network/testnet.toml` with the settings you specified. This means that you can use the `--network testnet` flag in any Stellar CLI command to use this network from any directory or filepath on your system.

If you want project-specific network configurations, you can omit the `--global` flag, and the networks will be added to your working directory's `.soroban/network` folder instead.

###  Configure an Identity

When you deploy a smart contract to a network, you need to specify an identity that will be used to sign the transactions.

Let's configure an identity called `alice`. You can use any name you want, but it might be nice to have some named identities that you can use for testing, such as [`alice`, `bob`, and `carol`](https://en.wikipedia.org/wiki/Alice_and_Bob). 

```sh
stellar keys generate --global alice --network testnet
```

You can see the public key of `alice` with:

```sh
stellar keys address alice
```

You can use this [link](https://stellar.expert/explorer/testnet) to verify the identity you create for the testnet.



## Deploy Project on Testnet



### Build contract

Once you have fully set up the contract in your local environment, installed all the necessary tools, and properly configured your user for the testnet, you will be ready to perform the initial deployment to the Testnet and run tests directly on the contract.

The first step is to compile the contract and generate the `.wasm` file, which can be done using the following command:

```bash
stellar contract build
```

### Install contract

Before deploying the contract, you must first install it. This means uploading a version of your code to the Stellar network, which you can later use for deployment.

When you execute the following command with the parameters specific to your local environment, it will return a hash. You will need to save this hash, as it will be required in the next step.

### macOS/Linux

```bash
stellar contract install \
   --network <network> \
   --source <source_account> \
   --wasm <path_to_wasm_file>
```

### Windows (PowerShell)

```bash
stellar contract install `
   --network <network> `
   --source <source_account> `
   --wasm <path_to_wasm_file>
```

Where:

- `<network>` is the name of the network you are working on (e.g., testnet).
- `<source_account>` is the account from which the installation will be made (you need to provide your own account).
- `<path_to_wasm_file>` is the path to the `.wasm` file generated when compiling the contract."

Response:

```
d36cd70c3b9c999e172ecc4648e616d9a49fd5dbbae8c28bef0b90bbb32fc762
```



### Deploy contract

Finally, to deploy the contract, you will need to use the output from the previous command as the input parameter for this command.

Once you execute this command, you will receive another hash, which will be the contract ID. With this ID, you can query platforms such as https://stellar.expert/explorer/testnet and continuously monitor the interactions made with the deployed contract.

### macOS/Linux

```bash
stellar contract deploy \
   --wasm-hash <wasm_hash> \
   --source <source_account> \
   --network <network>
```

### Windows (PowerShell)

```bash
stellar contract deploy `
   --wasm-hash <wasm_hash> `
   --source <source_account> `
   --network <network>
```

Where:

- `<wasm_hash>` is the hash of the `.wasm` file generated during the contract installation.
- `<source_account>` is the account from which the deployment will be made.
- `<network>` is the network you are working on (e.g., testnet).


## **Thanks to all the contributors who have made this project possible!**

[![Contributors](https://contrib.rocks/image?repo=Trustless-Work/Trustless-Work-Smart-Escrow)](https://github.com/Trustless-Work/Trustless-Work-Smart-Escrow/graphs/contributors)
````

## File: app/create-order/CreateOrderClient.tsx
````typescript
'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import OrderTypeSelector from '@/components/OrderTypeSelector';
import CreateOrderForm from '@/components/CreateOrderForm';
import FadeIn from '@/components/FadeIn';

export default function CreateOrderClient() {
  const searchParams = useSearchParams();
  const initialType = (searchParams.get('type') as 'buy' | 'sell') || 'sell';
  const [orderType, setOrderType] = useState<'buy' | 'sell'>(initialType);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-[480px] mx-auto px-4 pt-20 pb-24">
        <FadeIn>
          <h1 className="text-h3 text-black mb-6">Create Order</h1>
          <OrderTypeSelector
            selected={orderType}
            onSelect={setOrderType}
          />
        </FadeIn>
        <FadeIn delay={0.1}>
          <CreateOrderForm orderType={orderType} />
        </FadeIn>
      </main>

      <BottomNav />
    </div>
  );
}
````

## File: app/create-order/page.tsx
````typescript
import { Suspense } from 'react';
import CreateOrderClient from './CreateOrderClient';

export default function CreateOrderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center text-gray-500">Loading...</div>}>
      <CreateOrderClient />
    </Suspense>
  );
}
````

## File: app/my-orders/page.tsx
````typescript
'use client';

import { useState, useMemo } from 'react';
import { Package } from 'lucide-react';
import { useStore } from '@/lib/store';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import OrderCard from '@/components/OrderCard';
import EmptyState from '@/components/EmptyState';
import type { Order } from '@/types';

type TabType = 'active' | 'completed' | 'disputed';

function getOrdersForTab(orders: Order[], tab: TabType): Order[] {
  if (tab === 'active') {
    return orders.filter((o) => o.status === 'open' || o.status === 'active');
  }
  if (tab === 'completed') {
    return orders.filter((o) => o.status === 'completed');
  }
  return orders.filter((o) => o.status === 'disputed' || o.status === 'cancelled');
}

export default function MyOrdersPage() {
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const orders = useStore((s) => s.orders);
  const user = useStore((s) => s.user);

  const myOrders = useMemo(
    () =>
      orders.filter(
        (o) => user.walletAddress !== null && o.createdBy === user.walletAddress
      ),
    [orders, user.walletAddress]
  );

  const activeOrders = useMemo(
    () => getOrdersForTab(myOrders, 'active'),
    [myOrders]
  );
  const completedOrders = useMemo(
    () => getOrdersForTab(myOrders, 'completed'),
    [myOrders]
  );
  const disputedOrders = useMemo(
    () => getOrdersForTab(myOrders, 'disputed'),
    [myOrders]
  );

  const filteredOrders = useMemo(() => {
    if (activeTab === 'active') return activeOrders;
    if (activeTab === 'completed') return completedOrders;
    return disputedOrders;
  }, [activeTab, activeOrders, completedOrders, disputedOrders]);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-[480px] mx-auto px-4 pt-20 pb-24">
        <h1 className="text-h3 text-black mb-6">My Orders</h1>

        {/* Your Reputation */}
        <div
          className="mb-6 rounded-xl border border-cyan-200 bg-cyan-50 p-5 cursor-pointer hover:bg-cyan-100/80 transition-colors"
          role="button"
          tabIndex={0}
          onClick={() => {}}
          onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLElement).click(); }}
        >
          <p className="text-body-sm font-semibold text-cyan-800 mb-2">Your Reputation</p>
          <p className="text-4xl font-bold text-cyan-700 font-[family-name:var(--font-space-grotesk)]">
            ⭐ {user.reputation_score ?? 0}
          </p>
          <p className="text-body-sm text-cyan-700 mt-1">
            {(user.reputation_score ?? 0)} completed trades
          </p>
        </div>

        {/* Stats section */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
            <p className="text-2xl font-bold text-magenta-600">{activeOrders.length}</p>
            <p className="text-xs font-medium text-gray-500 mt-1">Active</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{completedOrders.length}</p>
            <p className="text-xs font-medium text-gray-500 mt-1">Completed</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{disputedOrders.length}</p>
            <p className="text-xs font-medium text-gray-500 mt-1">Disputed</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('active')}
            className={`flex-1 py-3 rounded-xl font-semibold transition ${
              activeTab === 'active'
                ? 'bg-magenta-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Active
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('completed')}
            className={`flex-1 py-3 rounded-xl font-semibold transition ${
              activeTab === 'completed'
                ? 'bg-magenta-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Completed
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('disputed')}
            className={`flex-1 py-3 rounded-xl font-semibold transition ${
              activeTab === 'disputed'
                ? 'bg-magenta-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Disputed
          </button>
        </div>

        {/* Order list or EmptyState */}
        {filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Package className="w-16 h-16 text-gray-300" />}
            title={
              activeTab === 'active'
                ? 'No active orders. Create an order to get started.'
                : activeTab === 'completed'
                  ? 'No completed orders yet.'
                  : 'No disputed orders.'
            }
          />
        )}
      </main>

      <BottomNav />
    </div>
  );
}
````

## File: app/orders/[id]/OrderDetailClient.tsx
````typescript
'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { AlertTriangle, Copy, Loader2, Check, Star, RefreshCw, Wallet, Banknote, CircleCheck, PartyPopper } from 'lucide-react';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import EscrowStepper from '@/components/EscrowStepper';
import ChatBox, { type Message } from '@/components/ChatBox';
import FadeIn from '@/components/FadeIn';
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/store';
import type { OrderStatus } from '@/types';

const BANK_DETAILS = [
  { label: 'Bank', value: 'Banco Galicia' },
  { label: 'Account', value: '1234-5678-9012' },
  { label: 'CBU', value: '0123456789012345678901' },
  { label: 'Name', value: 'Juan Pérez' },
];

function addSystemMessage(messages: Message[], text: string): Message[] {
  return [
    ...messages,
    {
      id: `sys-${Date.now()}`,
      sender: 'system',
      text,
      timestamp: new Date(),
    },
  ];
}

interface OrderDetailClientProps {
  orderId: string;
}

export default function OrderDetailClient({ orderId }: OrderDetailClientProps) {
  const router = useRouter();
  const orders = useStore((s) => s.orders);
  const user = useStore((s) => s.user);
  const updateOrderStatus = useStore((s) => s.updateOrderStatus);

  const [simStep, setSimStep] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);

  const order = useMemo(
    () => orders.find((o) => o.id === orderId),
    [orders, orderId]
  );

  const isSeller =
    order &&
    ((order.type === 'sell' && user.walletAddress === order.createdBy) ||
      (order.type === 'buy' && user.walletAddress !== order.createdBy));
  const isBuyer =
    order &&
    ((order.type === 'buy' && user.walletAddress === order.createdBy) ||
      (order.type === 'sell' && user.walletAddress !== order.createdBy));

  const handleCopy = (label: string, value: string) => {
    navigator.clipboard?.writeText(value);
    toast.success(`${label} copied`);
  };

  const handleSendMessage = useCallback(
    (text: string) => {
      const newMessage: Message = {
        id: Date.now().toString(),
        sender: user.walletAddress || '',
        text,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, newMessage]);
      toast.success('Message sent');
    },
    [user.walletAddress]
  );

  useEffect(() => {
    if (order && messages.length === 0) {
      setMessages([
        {
          id: '1',
          sender: order.createdBy,
          text: 'Hello! I have the funds ready in escrow.',
          timestamp: new Date(Date.now() - 3600000),
        },
        {
          id: '2',
          sender: user.walletAddress || '',
          text: 'Great! I will send the bank transfer now.',
          timestamp: new Date(Date.now() - 1800000),
        },
      ]);
    }
  }, [order?.id, order?.createdBy, user.walletAddress]);

  // Auto-advance demo: 3s countdown per step, then advance (regardless of role for demo)
  useEffect(() => {
    if (simStep >= 4 || isUpdating) {
      setCountdown(null);
      return;
    }
    setCountdown(3);
    const id = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(id);
          if (simStep === 0) advanceToStep1();
          else if (simStep === 1) advanceToStep2();
          else if (simStep === 2) advanceToStep3();
          else if (simStep === 3) advanceToStep4();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [simStep, isUpdating]);

  const advanceToStep1 = async () => {
    setIsUpdating(true);
    await new Promise((r) => setTimeout(r, 500));
    setMessages((prev) => addSystemMessage(prev, 'Trustline activated. You can now receive USDC.'));
    setSimStep(1);
    toast.success('Trustline activated! Proceed to deposit.');
    setIsUpdating(false);
  };

  const advanceToStep2 = async () => {
    setIsUpdating(true);
    await new Promise((r) => setTimeout(r, 500));
    setMessages((prev) =>
      addSystemMessage(
        addSystemMessage(prev, 'Funds deposited in escrow'),
        'Buyer has 10 seconds to send payment.'
      )
    );
    setSimStep(2);
    toast.success('Deposit confirmed! Waiting for payment...');
    setIsUpdating(false);
  };

  const advanceToStep3 = async () => {
    setIsUpdating(true);
    await new Promise((r) => setTimeout(r, 500));
    setMessages((prev) =>
      addSystemMessage(prev, 'Buyer marked payment as sent.')
    );
    setSimStep(3);
    toast.info('Payment marked. Waiting for seller confirmation...');
    setIsUpdating(false);
  };

  const advanceToStep4 = async () => {
    setIsUpdating(true);
    await new Promise((r) => setTimeout(r, 500));
    setMessages((prev) =>
      addSystemMessage(prev, 'USDC released successfully!')
    );
    if (order) updateOrderStatus(order.id, 'completed');
    setSimStep(4);
    toast.success('Funds released! Trade completed 🎉');
    setIsUpdating(false);
  };

  if (!order) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="max-w-[480px] mx-auto px-4 pt-20 pb-24">
          <p className="text-center text-gray-600">Order not found</p>
          <Button
            variant="outline"
            className="mt-4 w-full transition-all duration-200"
            onClick={() => router.push('/orders')}
          >
            Back to Marketplace
          </Button>
        </main>
        <BottomNav />
      </div>
    );
  }

  const total = order.amount * order.rate;

  const stepConfig = () => {
    if (simStep === 0) return { label: 'Setup', sub: 'Activate Trustline', icon: Wallet };
    if (simStep === 1) return { label: 'Deposit', sub: 'Confirm escrow', icon: Banknote };
    if (simStep === 2) return { label: 'Payment', sub: 'Waiting for payment', icon: RefreshCw };
    if (simStep === 3) return { label: 'Confirm', sub: 'Confirm receipt', icon: CircleCheck };
    return { label: 'Completed', sub: 'Trade complete', icon: PartyPopper };
  };

  const stepInfo = stepConfig();
  const StatusIcon = stepInfo.icon;

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-[480px] mx-auto px-4 pt-20 pb-24 space-y-6">
        {/* Top row: Status badge + countdown */}
        <FadeIn>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border-2 border-primary-200 bg-white px-4 py-2.5 shadow-sm">
              <StatusIcon className="size-5 shrink-0 text-primary-600" />
              <div>
                <p className="text-body font-semibold text-dark-500">
                  {simStep < 4 ? 'In progress' : 'Complete'} — {stepInfo.label}
                </p>
                <p className="text-body-sm text-gray-500">{stepInfo.sub}</p>
              </div>
            </div>
            {simStep < 4 && countdown !== null && !isUpdating && (
              <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1.5 text-body-sm text-gray-500">
                Next step in: <span className="font-mono font-semibold text-gray-700">{countdown}…</span>
              </span>
            )}
          </div>
        </FadeIn>

        <FadeIn delay={0.03}>
          <div className="mb-2">
            <EscrowStepper currentStep={simStep} orderStatus={order.status} />
          </div>
        </FadeIn>
        {simStep === 2 && (
          <p className="text-body-sm text-gray-500 -mt-2">
            Payment window: <span className="font-mono font-semibold text-gray-700">10 seconds</span>
          </p>
        )}

        {simStep === 0 && (
          <FadeIn delay={0.1}>
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-body text-gray-700 mb-6">
                You need to activate USDC Trustline to receive tokens.
              </p>
              <Button
                disabled={isUpdating}
                className="w-full rounded-full bg-gradient-to-r from-primary-500 to-primary-600 py-4 text-body font-bold text-white hover:opacity-90 transition-all duration-200 disabled:opacity-70"
                onClick={advanceToStep1}
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 size-5 animate-spin" />
                    Activating...
                  </>
                ) : (
                  'Activate Trustline'
                )}
              </Button>
            </div>
          </FadeIn>
        )}

        {simStep >= 1 && simStep < 4 && (
          <>
            <FadeIn delay={0.1}>
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="grid gap-4">
                  <div className="flex justify-between items-center">
                    <span className="text-body-sm font-medium text-gray-600">Seller</span>
                    <span className="text-body font-semibold text-dark-500 font-mono">
                      {order.type === 'sell' ? `${order.createdBy.slice(0, 6)}...${order.createdBy.slice(-4)}` : '—'}
                    </span>
                  </div>
                  <div
                    className="text-body-sm text-cyan-700 bg-cyan-50 rounded-lg px-3 py-2 cursor-pointer hover:bg-cyan-100/80 transition-colors"
                    role="button"
                    tabIndex={0}
                    onClick={() => toast.info('Trade history coming soon')}
                    onKeyDown={(e) => e.key === 'Enter' && toast.info('Trade history coming soon')}
                  >
                    ⭐ {order.reputation_score ?? 0} completed trades | 100% completion rate
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-body-sm font-medium text-gray-600">Buyer</span>
                    <span className="text-body font-semibold text-dark-500 font-mono">
                      {order.type === 'buy' ? `${order.createdBy.slice(0, 6)}...${order.createdBy.slice(-4)}` : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-t border-gray-100 pt-4">
                    <span className="text-body-sm font-medium text-gray-600">Amount</span>
                    <span className="text-h4 text-primary-600 font-[family-name:var(--font-space-grotesk)]">
                      {order.amount.toLocaleString()} USDC
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-body-sm font-medium text-gray-600">Rate</span>
                    <span className="text-body font-semibold text-dark-500">
                      {order.rate.toLocaleString()} {order.currency} per USDC
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-body-sm font-medium text-gray-600">Total</span>
                    <span className="text-h4 text-primary-600 font-[family-name:var(--font-space-grotesk)]">
                      {total.toLocaleString()} {order.currency}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-body-sm font-medium text-gray-600">Payment method</span>
                    <span className="text-body font-semibold text-dark-500">{order.paymentMethod}</span>
                  </div>
                </div>
              </div>
            </FadeIn>

            {simStep >= 2 && (
              <FadeIn delay={0.12}>
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h3 className="text-h5 text-gray-800 mb-4 font-[family-name:var(--font-space-grotesk)]">Payment Details</h3>
                  <div className="space-y-3">
                    {BANK_DETAILS.map(({ label, value }) => (
                      <div
                        key={label}
                        className="flex items-center justify-between gap-3 rounded-lg bg-gray-50 px-4 py-3"
                      >
                        <div>
                          <p className="text-body-sm font-medium text-gray-600">{label}</p>
                          <p className="font-mono text-body font-semibold text-dark-500">{value}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(label, value)}
                          className="rounded-lg p-2 text-gray-500 hover:bg-gray-200 transition-colors"
                          aria-label={`Copy ${label}`}
                        >
                          <Copy className="size-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>
            )}

            <FadeIn delay={0.15}>
              <div className="w-full">
                <ChatBox
                  orderId={order.id}
                  messages={messages}
                  onSendMessage={handleSendMessage}
                />
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div className="space-y-3">
                {order.status === 'disputed' && (
                  <Button
                    disabled={isUpdating}
                    className="w-full rounded-full bg-gradient-to-r from-primary-500 to-primary-600 py-4 text-body font-bold text-white hover:opacity-90 transition-all duration-200 disabled:opacity-70"
                    onClick={async () => {
                      setIsUpdating(true);
                      await new Promise((r) => setTimeout(r, 500));
                      toast.error('Dispute opened. Support will review...');
                      setIsUpdating(false);
                    }}
                  >
                    {isUpdating ? <Loader2 className="mr-2 size-5 animate-spin" /> : <AlertTriangle className="mr-2 size-5" />}
                    Contact Support
                  </Button>
                )}
                {simStep === 1 && isSeller && (
                  <Button
                    disabled={isUpdating}
                    className="w-full rounded-full bg-gradient-to-r from-primary-500 to-primary-600 py-4 text-body font-bold text-white hover:opacity-90 transition-all duration-200 disabled:opacity-70"
                    onClick={advanceToStep2}
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="mr-2 size-5 animate-spin" />
                        Confirming...
                      </>
                    ) : (
                      'Confirm Deposit'
                    )}
                  </Button>
                )}
                {simStep === 2 && isBuyer && (
                  <Button
                    disabled={isUpdating}
                    className="w-full rounded-full bg-gradient-to-r from-primary-500 to-primary-600 py-4 text-body font-bold text-white hover:opacity-90 transition-all duration-200 disabled:opacity-70"
                    onClick={advanceToStep3}
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="mr-2 size-5 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      'Mark as Paid'
                    )}
                  </Button>
                )}
                {simStep === 2 && isSeller && (
                  <Button
                    disabled
                    variant="outline"
                    className="w-full rounded-full py-4 text-body font-semibold text-gray-400 cursor-not-allowed"
                  >
                    Waiting for buyer...
                  </Button>
                )}
                {simStep === 3 && isSeller && (
                  <Button
                    disabled={isUpdating}
                    className="w-full rounded-full bg-gradient-to-r from-primary-500 to-primary-600 py-4 text-body font-bold text-white hover:opacity-90 transition-all duration-200 disabled:opacity-70"
                    onClick={advanceToStep4}
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="mr-2 size-5 animate-spin" />
                        Releasing...
                      </>
                    ) : (
                      'Confirm Payment Received'
                    )}
                  </Button>
                )}
                {simStep === 3 && isBuyer && (
                  <Button
                    disabled
                    variant="outline"
                    className="w-full rounded-full py-4 text-body font-semibold text-gray-400 cursor-not-allowed"
                  >
                    Waiting for seller to confirm...
                  </Button>
                )}
              </div>
            </FadeIn>
          </>
        )}

        {simStep === 4 && (
          <FadeIn>
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500 text-white">
                <Check className="size-10" strokeWidth={2.5} />
              </div>
              <h2 className="text-h3 text-gray-900 mb-2 font-[family-name:var(--font-space-grotesk)]">Trade completed</h2>
              <p className="text-body text-gray-600 mb-8">
                USDC has been released. Thank you for using PeerlyPay.
              </p>
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-left mb-8">
                <p className="text-body-sm font-medium text-gray-600 mb-4">Transaction summary</p>
                <div className="grid gap-3">
                  <div className="flex justify-between items-center">
                    <span className="text-body-sm font-medium text-gray-600">Amount</span>
                    <span className="text-h4 text-primary-600 font-[family-name:var(--font-space-grotesk)]">
                      {order.amount.toLocaleString()} USDC
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-body-sm font-medium text-gray-600">Total</span>
                    <span className="text-h4 text-primary-600 font-[family-name:var(--font-space-grotesk)]">
                      {total.toLocaleString()} {order.currency}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-body-sm font-medium text-gray-600">Payment</span>
                    <span className="text-body font-semibold text-dark-500">{order.paymentMethod}</span>
                  </div>
                </div>
              </div>
              <div className="mb-8">
                <p className="text-body-sm font-semibold text-gray-700 mb-3">Rate your experience</p>
                <div className="flex justify-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 rounded transition-colors"
                      aria-label={`${star} stars`}
                    >
                      <Star
                        className={`size-8 ${
                          star <= (hoverRating || rating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <Button
                  className="w-full rounded-full bg-gradient-to-r from-primary-500 to-primary-600 py-4 text-body font-bold text-white hover:opacity-90"
                  onClick={() => router.push('/orders')}
                >
                  Back to Marketplace
                </Button>
                <Button
                  variant="outline"
                  className="w-full rounded-full py-4 text-body font-semibold border-2 border-gray-200"
                  onClick={() => toast.info('Receipt view coming soon')}
                >
                  View Receipt
                </Button>
              </div>
            </div>
          </FadeIn>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
````

## File: app/orders/[id]/page.tsx
````typescript
import OrderDetailClient from './OrderDetailClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  return <OrderDetailClient orderId={resolvedParams.id} />;
}
````

## File: app/orders/page.tsx
````typescript
'use client';

import { useState, useEffect } from 'react';
import { Package } from 'lucide-react';
import { useStore } from '@/lib/store';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import OrderCard from '@/components/OrderCard';
import OrderCardSkeleton from '@/components/OrderCardSkeleton';
import EmptyState from '@/components/EmptyState';
import FadeIn from '@/components/FadeIn';

const SKELETON_COUNT = 4;

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('sell');
  const [isLoading, setIsLoading] = useState(true);
  const orders = useStore((s) => s.orders);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // User wants to buy -> show sell orders (others selling USDC); want sell -> show buy orders
  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'buy') {
      return order.type === 'sell' && order.status === 'open';
    } else {
      return order.type === 'buy' && order.status === 'open';
    }
  });

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-[480px] mx-auto px-4 pt-20 pb-24">
        <h1 className="text-h3 text-black mb-6">Marketplace</h1>

        {/* Tab switcher */}
        <div className="flex gap-6 border-b border-gray-200 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('buy')}
            className={`text-body pb-3 -mb-px transition-colors ${
              activeTab === 'buy'
                ? 'text-primary-600 font-semibold border-b-2 border-primary-500'
                : 'text-gray-500 font-medium hover:text-primary-500'
            }`}
          >
            Buy USDC
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sell')}
            className={`text-body pb-3 -mb-px transition-colors ${
              activeTab === 'sell'
                ? 'text-primary-600 font-semibold border-b-2 border-primary-500'
                : 'text-gray-500 font-medium hover:text-primary-500'
            }`}
          >
            Sell USDC
          </button>
        </div>

        {/* Orders list, skeleton, or EmptyState */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <OrderCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {filteredOrders.map((order, index) => (
              <FadeIn key={order.id} delay={index * 0.05}>
                <OrderCard order={order} />
              </FadeIn>
            ))}
          </div>
        ) : (
          <FadeIn>
            <EmptyState
              icon={<Package className="w-16 h-16 text-gray-300" />}
              title="No orders available. Check back later or create your own order."
            />
          </FadeIn>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
````

## File: app/profile/page.tsx
````typescript
'use client';

import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { useStore } from '@/lib/store';
import { User } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useStore();
  const { isConnected, walletAddress } = user;

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-[480px] mx-auto px-4 pt-20 pb-24">
        <h1 className="text-h3 text-black mb-6">Profile</h1>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
              <User className="h-7 w-7 text-gray-500" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                {isConnected && walletAddress
                  ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
                  : 'Not connected'}
              </p>
              <p className="text-body-sm text-gray-500">
                {isConnected ? 'Wallet connected' : 'Connect your wallet in the header'}
              </p>
            </div>
          </div>
        </div>

        <p className="mt-6 text-body-sm text-gray-500">
          Profile settings and account options can be added here.
        </p>
      </main>

      <BottomNav />
    </div>
  );
}
````

## File: app/globals.css
````css
@import "tailwindcss";
@import "tw-animate-css";

@theme {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-dm-sans);
  --font-mono: var(--font-geist-mono);
  --color-sidebar-ring: var(--sidebar-ring);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar: var(--sidebar);
  --color-chart-5: var(--chart-5);
  --color-chart-4: var(--chart-4);
  --color-chart-3: var(--chart-3);
  --color-chart-2: var(--chart-2);
  --color-chart-1: var(--chart-1);
  --color-ring: var(--ring);
  --color-input: var(--input);
  --color-border: var(--border);
  --color-destructive: var(--destructive);
  --color-accent-foreground: var(--accent-foreground);
  --color-accent: var(--accent);
  --color-muted-foreground: var(--muted-foreground);
  --color-muted: var(--muted);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-secondary: var(--secondary);
  --color-primary-foreground: var(--primary-foreground);
  --color-primary: var(--primary);
  --color-popover-foreground: var(--popover-foreground);
  --color-popover: var(--popover);
  --color-card-foreground: var(--card-foreground);
  --color-card: var(--card);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --radius-2xl: calc(var(--radius) + 8px);
  --radius-3xl: calc(var(--radius) + 12px);
  --radius-4xl: calc(var(--radius) + 16px);
  
  /* Colores custom de PeerlyPay - WCAG AA Compliant */
  
  /* Principal (Magenta/Fuchsia) */
  --color-primary-50: #fdf4ff;
  --color-primary-100: #fae8ff;
  --color-primary-200: #f5d0fe;
  --color-primary-300: #f0abfc;
  --color-primary-400: #e879f9;
  --color-primary-500: #d946ef;
  --color-primary-600: #c026d3;
  --color-primary-700: #a21caf;
  --color-primary-800: #86198f;
  --color-primary-900: #701a75;
  --color-primary-950: #4a044e;
  
  /* Secundario (Cyan) */
  --color-secondary-50: #ecfeff;
  --color-secondary-100: #cffafe;
  --color-secondary-200: #a5f3fc;
  --color-secondary-300: #67e8f9;
  --color-secondary-400: #22d3ee;
  --color-secondary-500: #00ccff;
  --color-secondary-600: #0891b2;
  --color-secondary-700: #0e7490;
  --color-secondary-800: #155e75;
  --color-secondary-900: #164e63;
  --color-secondary-950: #083344;
  
  /* Acento (Lime) */
  --color-accent-50: #f7fee7;
  --color-accent-100: #ecfccb;
  --color-accent-200: #d9f99d;
  --color-accent-300: #bef264;
  --color-accent-400: #a3e635;
  --color-accent-500: #ccff33;
  --color-accent-600: #65a30d;
  --color-accent-700: #4d7c0f;
  --color-accent-800: #3f6212;
  --color-accent-900: #365314;
  --color-accent-950: #1a2e05;
  
  /* Base/Neutral */
  --color-neutral-50: #fefef9;
  --color-neutral-100: #fcfdf4;
  --color-neutral-200: #f9fbea;
  --color-neutral-300: #f6f8ec;
  --color-neutral-400: #e8edd1;
  --color-neutral-500: #d9e2b6;
  --color-neutral-600: #b8c584;
  --color-neutral-700: #97a852;
  --color-neutral-800: #5c662e;
  --color-neutral-900: #2e3317;
  --color-neutral-950: #17190b;
  
  /* Dark */
  --color-dark-50: #e6e6e6;
  --color-dark-100: #cccccc;
  --color-dark-200: #999999;
  --color-dark-300: #666666;
  --color-dark-400: #404040;
  --color-dark-500: #191919;
  --color-dark-600: #141414;
  --color-dark-700: #0f0f0f;
  --color-dark-800: #0a0a0a;
  --color-dark-900: #050505;
  --color-dark-950: #000000;
  
  /* Legacy aliases para compatibilidad */
  --color-magenta: #d946ef;
  --color-magenta-500: #d946ef;
  --color-magenta-600: #c026d3;
  --color-magenta-700: #a21caf;
  
  --color-lime: #ccff33;
  --color-lime-500: #ccff33;
  --color-lime-600: #65a30d;
  --color-lime-700: #4d7c0f;
  
  --color-cyan: #00ccff;
  --color-cyan-500: #00ccff;
  --color-cyan-600: #0891b2;
  --color-cyan-700: #0e7490;
  
  /* Typography Scale */
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 1.875rem;
  --font-size-4xl: 2.25rem;
  --font-size-5xl: 3rem;
  --font-size-6xl: 3.75rem;
  
  /* Line Heights */
  --leading-none: 1;
  --leading-tight: 1.25;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
  --leading-loose: 2;
}

:root {
  --radius: 0.625rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-primary: oklch(0.205 0 0);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: oklch(0.922 0 0);
  --sidebar-ring: oklch(0.708 0 0);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.205 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.556 0 0);
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);
  --sidebar: oklch(0.205 0 0);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.269 0 0);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.556 0 0);
}

@layer base {
  * {
    border-color: var(--border);
    outline-color: hsl(var(--ring) / 0.5);
  }
  body {
    background-color: var(--background);
    color: var(--foreground);
  }
}

@layer utilities {
  /* Typography Hierarchy - Space Grotesk for headings */
  .text-display {
    font-family: var(--font-space-grotesk);
    font-size: 3.75rem;
    line-height: 1;
    font-weight: 700;
    letter-spacing: -0.02em;
  }
  
  .text-h1 {
    font-family: var(--font-space-grotesk);
    font-size: 3rem;
    line-height: 1.1;
    font-weight: 700;
    letter-spacing: -0.02em;
  }
  
  .text-h2 {
    font-family: var(--font-space-grotesk);
    font-size: 2.25rem;
    line-height: 1.2;
    font-weight: 700;
    letter-spacing: -0.01em;
  }
  
  .text-h3 {
    font-family: var(--font-space-grotesk);
    font-size: 1.875rem;
    line-height: 1.3;
    font-weight: 600;
  }
  
  .text-h4 {
    font-family: var(--font-space-grotesk);
    font-size: 1.5rem;
    line-height: 1.4;
    font-weight: 600;
  }
  
  .text-h5 {
    font-family: var(--font-space-grotesk);
    font-size: 1.25rem;
    line-height: 1.5;
    font-weight: 600;
  }
  
  /* Body text - DM Sans */
  .text-body-lg {
    font-family: var(--font-dm-sans);
    font-size: 1.125rem;
    line-height: 1.75;
    font-weight: 400;
  }
  
  .text-body {
    font-family: var(--font-dm-sans);
    font-size: 1rem;
    line-height: 1.5;
    font-weight: 400;
  }
  
  .text-body-sm {
    font-family: var(--font-dm-sans);
    font-size: 0.875rem;
    line-height: 1.5;
    font-weight: 400;
  }
  
  .text-caption {
    font-family: var(--font-dm-sans);
    font-size: 0.75rem;
    line-height: 1.5;
    font-weight: 500;
    letter-spacing: 0.02em;
  }
  
  /* Emphasis variants */
  .text-body-medium {
    font-weight: 500;
  }
  
  .text-body-semibold {
    font-weight: 600;
  }
  
  .text-body-bold {
    font-weight: 700;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.5s ease-out forwards;
}
````

## File: app/layout.tsx
````typescript
import type { Metadata } from "next";
import { DM_Sans, Space_Grotesk } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import "./globals.css";

const dmSans = DM_Sans({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: '--font-dm-sans',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: '--font-space-grotesk',
});

export const metadata: Metadata = {
  title: "PeerlyPay",
  description: "Work Global, Cash Out Local",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${spaceGrotesk.variable} font-sans`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
````

## File: app/page.tsx
````typescript
'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import BalanceCard from '@/components/BalanceCard';
import QuickActions from '@/components/QuickActions';
import EmptyState from '@/components/EmptyState';
import BottomNav from '@/components/BottomNav';

export default function Dashboard() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-[480px] mx-auto px-4 pt-20 pb-24">
        <BalanceCard />
        <QuickActions />

        <section>
          <div className="flex justify-between items-center mb-4 mt-8">
            <h2 className="text-h3 text-black">Open Orders</h2>
            <button
              type="button"
              onClick={() => router.push('/orders')}
              className="text-magenta-500 text-sm font-semibold hover:text-magenta-600"
            >
              View All
            </button>
          </div>
          <EmptyState
            icon={
              <Image 
                src="/illustrations/empty-marketplace.png"
                alt="Empty marketplace" 
                width={200} 
                height={200}
                className="mx-auto"
              />
            }
            title="No open orders found"
            actionText="Create your first order"
            onAction={() => router.push('/create-order')}
          />
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
````

## File: components/ui/alert.tsx
````typescript
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        destructive:
          "text-destructive bg-card [&>svg]:text-current *:data-[slot=alert-description]:text-destructive/90",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight",
        className
      )}
      {...props}
    />
  )
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-muted-foreground col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed",
        className
      )}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription }
````

## File: components/ui/button.tsx
````typescript
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
````

## File: components/ui/card.tsx
````typescript
import * as React from "react"

import { cn } from "@/lib/utils"

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
````

## File: components/ui/dropdown-menu.tsx
````typescript
"use client"

import * as React from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function DropdownMenu({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
  return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />
}

function DropdownMenuPortal({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Portal>) {
  return (
    <DropdownMenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />
  )
}

function DropdownMenuTrigger({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
  return (
    <DropdownMenuPrimitive.Trigger
      data-slot="dropdown-menu-trigger"
      {...props}
    />
  )
}

function DropdownMenuContent({
  className,
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-(--radix-dropdown-menu-content-available-height) min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md",
          className
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  )
}

function DropdownMenuGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Group>) {
  return (
    <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
  )
}

function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  inset?: boolean
  variant?: "default" | "destructive"
}) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      checked={checked}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  )
}

function DropdownMenuRadioGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>) {
  return (
    <DropdownMenuPrimitive.RadioGroup
      data-slot="dropdown-menu-radio-group"
      {...props}
    />
  )
}

function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem>) {
  return (
    <DropdownMenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <CircleIcon className="size-2 fill-current" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  )
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & {
  inset?: boolean
}) {
  return (
    <DropdownMenuPrimitive.Label
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn(
        "px-2 py-1.5 text-sm font-medium data-[inset]:pl-8",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn("bg-border -mx-1 my-1 h-px", className)}
      {...props}
    />
  )
}

function DropdownMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn(
        "text-muted-foreground ml-auto text-xs tracking-widest",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuSub({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Sub>) {
  return <DropdownMenuPrimitive.Sub data-slot="dropdown-menu-sub" {...props} />
}

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & {
  inset?: boolean
}) {
  return (
    <DropdownMenuPrimitive.SubTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto size-4" />
    </DropdownMenuPrimitive.SubTrigger>
  )
}

function DropdownMenuSubContent({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubContent>) {
  return (
    <DropdownMenuPrimitive.SubContent
      data-slot="dropdown-menu-sub-content"
      className={cn(
        "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-hidden rounded-md border p-1 shadow-lg",
        className
      )}
      {...props}
    />
  )
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
}
````

## File: components/ui/input.tsx
````typescript
import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input }
````

## File: components/ui/label.tsx
````typescript
"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"

import { cn } from "@/lib/utils"

function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Label }
````

## File: components/ui/select.tsx
````typescript
"use client"

import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Select({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />
}

function SelectGroup({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />
}

function SelectValue({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />
}

function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: "sm" | "default"
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-fit items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="size-4 opacity-50" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  className,
  children,
  position = "item-aligned",
  align = "center",
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border shadow-md",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className
        )}
        position={position}
        align={align}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            "p-1",
            position === "popper" &&
              "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1"
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn("text-muted-foreground px-2 py-1.5 text-xs", className)}
      {...props}
    />
  )
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className
      )}
      {...props}
    >
      <span
        data-slot="select-item-indicator"
        className="absolute right-2 flex size-3.5 items-center justify-center"
      >
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("bg-border pointer-events-none -mx-1 my-1 h-px", className)}
      {...props}
    />
  )
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className
      )}
      {...props}
    >
      <ChevronUpIcon className="size-4" />
    </SelectPrimitive.ScrollUpButton>
  )
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className
      )}
      {...props}
    >
      <ChevronDownIcon className="size-4" />
    </SelectPrimitive.ScrollDownButton>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
````

## File: components/ui/separator.tsx
````typescript
"use client"

import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"

import { cn } from "@/lib/utils"

function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
        className
      )}
      {...props}
    />
  )
}

export { Separator }
````

## File: components/ui/sheet.tsx
````typescript
"use client";

import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

const Sheet = SheetPrimitive.Root;
const SheetTrigger = SheetPrimitive.Trigger;
const SheetClose = SheetPrimitive.Close;
const SheetPortal = SheetPrimitive.Portal;

const SheetOverlay = React.forwardRef<
  React.ComponentRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 backdrop-blur-sm",
      className
    )}
    {...props}
    ref={ref}
  />
));
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;

interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content> {
  side?: "left" | "right" | "top" | "bottom";
}

const SheetContent = React.forwardRef<
  React.ComponentRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(({ side = "left", className, children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <SheetPrimitive.Content
      ref={ref}
      className={cn(
        "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out",
        side === "left" &&
          "inset-y-0 left-0 h-full w-3/4 max-w-sm overflow-hidden border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left",
        side === "right" &&
          "inset-y-0 right-0 h-full w-3/4 max-w-sm border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
        side === "top" &&
          "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        side === "bottom" &&
          "inset-x-0 bottom-0 border-b data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        className
      )}
      {...props}
    >
      {children}
    </SheetPrimitive.Content>
  </SheetPortal>
));
SheetContent.displayName = SheetPrimitive.Content.displayName;

const SheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className
    )}
    {...props}
  />
);
SheetHeader.displayName = "SheetHeader";

const SheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
);
SheetFooter.displayName = "SheetFooter";

const SheetTitle = React.forwardRef<
  React.ComponentRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold text-foreground", className)}
    {...props}
  />
));
SheetTitle.displayName = SheetPrimitive.Title.displayName;

const SheetDescription = React.forwardRef<
  React.ComponentRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
SheetDescription.displayName = SheetPrimitive.Description.displayName;

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
````

## File: components/ui/skeleton.tsx
````typescript
import { cn } from '@/lib/utils';

function Skeleton({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn('animate-pulse rounded-md bg-gray-200', className)}
      {...props}
    />
  );
}

export { Skeleton };
````

## File: components/ui/sonner.tsx
````typescript
"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
````

## File: components/BalanceCard.tsx
````typescript
'use client';

import { useStore } from '@/lib/store';

export default function BalanceCard() {
  const { user } = useStore();
  const { usd, usdc } = user.balance;

  const formattedUsd = usd.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const formattedUsdc = usdc.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const meshGradient = `
    radial-gradient(at 0% 0%, rgba(255, 182, 193, 0.6) 0px, transparent 50%),
    radial-gradient(at 100% 0%, rgba(173, 216, 255, 0.6) 0px, transparent 50%),
    radial-gradient(at 100% 100%, rgba(221, 160, 255, 0.6) 0px, transparent 50%),
    radial-gradient(at 0% 100%, rgba(152, 251, 200, 0.5) 0px, transparent 50%)
  `;
  const borderGradient = 'linear-gradient(135deg, rgba(255,182,193,0.8), rgba(173,216,255,0.8), rgba(221,160,255,0.8), rgba(152,251,200,0.6))';

  return (
    <div className="group relative mt-6 rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
      {/* Vibrant mesh gradient background */}
      <div
        className="absolute inset-0"
        style={{ background: meshGradient }}
        aria-hidden
      />

      {/* 2px gradient border wrapper — gradient shows in the ring around the glass */}
      <div
        className="relative z-10 rounded-3xl p-[2px]"
        style={{ background: borderGradient }}
      >
        {/* Glass overlay with content */}
        <div className="rounded-[22px] backdrop-blur-3xl bg-white/50 border border-white/30 py-10 px-6 text-center transition-all duration-300">
          <p className="text-caption uppercase tracking-wide text-gray-500">
            TOTAL BALANCE
          </p>
          <p className="mt-2 text-6xl font-bold text-gray-900 font-[family-name:var(--font-space-grotesk)]">
            {formattedUsd}
          </p>
          <p className="mt-1 text-lg text-gray-400">
            ≈ {formattedUsdc} USDC
          </p>
        </div>
      </div>
    </div>
  );
}
````

## File: components/BottomCTA.tsx
````typescript
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function BottomCTA() {
  const router = useRouter();

  return (
    <div className="flex gap-3 w-full">
      <button
        type="button"
        onClick={() => router.push('/create-order?type=buy')}
        className="flex-1 py-4 px-6 rounded-full bg-gradient-to-r from-magenta to-magenta-600 text-white font-semibold text-base hover:opacity-90 transition-all duration-200 font-[family-name:var(--font-space-grotesk)]"
      >
        + Buy USDC
      </button>
      <button
        type="button"
        onClick={() => router.push('/create-order?type=sell')}
        className="flex-1 py-4 px-6 rounded-full bg-white border border-gray-300 text-gray-600 font-semibold text-base hover:bg-gray-50 transition-all duration-200 font-[family-name:var(--font-space-grotesk)]"
      >
        ⇄ Sell USDC
      </button>
    </div>
  );
}
````

## File: components/BottomNav.tsx
````typescript
'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Home, Store, Plus, Package, User } from 'lucide-react';

const TABS = [
  { label: 'Home', icon: Home, href: '/' },
  { label: 'Market', icon: Store, href: '/orders' },
  { label: 'Create', icon: Plus, href: '/create-order' },
  { label: 'Orders', icon: Package, href: '/my-orders' },
  { label: 'Profile', icon: User, href: '/profile' },
] as const;

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 max-w-[480px] mx-auto bg-white border-t border-gray-200 shadow-lg pb-[env(safe-area-inset-bottom)]"
      aria-label="Bottom navigation"
    >
      <div className="flex items-center justify-around h-16 px-1">
        {TABS.map((tab) => {
          const active = isActive(tab.href);
          const Icon = tab.icon;
          return (
            <button
              key={tab.href}
              type="button"
              onClick={() => router.push(tab.href)}
              className="flex flex-col items-center justify-center gap-1 min-w-0 flex-1 py-2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-current={active ? 'page' : undefined}
              aria-label={tab.label}
            >
              <Icon
                className={`w-6 h-6 shrink-0 ${
                  active ? 'text-primary-500' : ''
                }`}
              />
              <span
                className={`text-xs font-medium truncate max-w-full ${
                  active ? 'text-primary-500' : ''
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
````

## File: components/ChatBox.tsx
````typescript
'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { useStore } from '@/lib/store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: Date;
}

export interface ChatBoxProps {
  orderId: string;
  messages: Message[];
  onSendMessage: (text: string) => void;
}

function shortenAddress(address: string): string {
  if (address.length <= 14) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export default function ChatBox({
  orderId,
  messages,
  onSendMessage,
}: ChatBoxProps) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUserAddress = useStore((s) => s.user.walletAddress);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;
    onSendMessage(trimmed);
    setInputText('');
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 transition-all duration-200">
      <header className="mb-4 flex items-center gap-2">
        <MessageSquare className="size-5 text-gray-600 shrink-0" />
        <h3 className="text-h5 text-gray-800 font-[family-name:var(--font-space-grotesk)]">Chat</h3>
      </header>

      <div className="max-h-80 space-y-3 overflow-y-auto">
        {messages.map((msg) => {
          const isSystem = msg.sender === 'system';
          const isOwn = !isSystem && currentUserAddress !== null && msg.sender === currentUserAddress;
          return (
            <div
              key={msg.id}
              className={`rounded-lg px-3 py-2 animate-in fade-in duration-200 ${
                isSystem
                  ? 'mx-0 max-w-full bg-primary-50 border border-primary-100 text-left'
                  : isOwn
                    ? 'ml-auto max-w-[85%] bg-magenta/10 text-right'
                    : 'mr-auto max-w-[85%] bg-gray-50 text-left'
              }`}
            >
              <p className="mb-1 text-xs text-gray-500">
                {isSystem ? 'PeerlyPay' : shortenAddress(msg.sender)}
              </p>
              <p className="text-sm">{msg.text}</p>
              <p className="mt-1 text-xs text-gray-400">{formatTime(msg.timestamp)}</p>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="mt-4 flex gap-2">
        <Input
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Type a message..."
          className="flex-1 rounded-lg border-gray-200"
        />
        <Button
          type="button"
          onClick={handleSend}
          className="shrink-0 rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:opacity-90 transition-all duration-200"
          aria-label="Send message"
        >
          <Send className="size-4" />
        </Button>
      </div>
    </div>
  );
}
````

## File: components/CreateOrderForm.tsx
````typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Minus, Plus, Loader2 } from 'lucide-react';
import { useStore } from '@/lib/store';
import type { Currency, PaymentMethod, CreateOrderInput } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface FormData {
  amount: number;
  currency: Currency;
  rate: number;
  paymentMethod: PaymentMethod;
  duration: string;
}

const CURRENCIES: Currency[] = ['ARS', 'USD'];
const PAYMENT_METHODS: PaymentMethod[] = ['Bank Transfer', 'MercadoPago'];
const DURATIONS = ['1 day', '3 days', '7 days'];

interface CreateOrderFormProps {
  orderType: 'buy' | 'sell';
}

const initialFormData: FormData = {
  amount: 0,
  currency: 'USD',
  rate: 0,
  paymentMethod: 'Bank Transfer',
  duration: '1 day',
};

function NumberField({
  value,
  onChange,
  min = 0,
  step = 1,
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  step?: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - step))}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 transition-all duration-200"
        aria-label="Decrease"
      >
        <Minus className="size-4" />
      </button>
      <Input
        type="number"
        min={min}
        step={step}
        value={value || ''}
        onChange={(e) => {
          const v = e.target.value === '' ? min : parseFloat(e.target.value);
          onChange(isNaN(v) ? min : Math.max(min, v));
        }}
        className="flex-1 rounded-xl border border-gray-200 bg-gray-50 text-center text-body"
      />
      <button
        type="button"
        onClick={() => onChange(value + step)}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 transition-all duration-200"
        aria-label="Increase"
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}

export default function CreateOrderForm({ orderType }: CreateOrderFormProps) {
  console.log('CreateOrderForm rendered with orderType:', orderType);

  const router = useRouter();
  const { createOrder } = useStore();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);

  const update = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault?.();
    console.log('Form submitted with data:', formData);

    // Validate all fields
    const { amount, rate, currency, paymentMethod, duration } = formData;
    if (amount <= 0) {
      console.log('[CreateOrderForm] Validation failed: amount must be greater than 0', { amount });
      return;
    }
    if (rate < 0) {
      console.log('[CreateOrderForm] Validation failed: rate must be 0 or greater', { rate });
      return;
    }
    if (!currency || !paymentMethod || !duration) {
      console.log('[CreateOrderForm] Validation failed: currency, paymentMethod, and duration are required', {
        currency,
        paymentMethod,
        duration,
      });
      return;
    }

    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1000));

    const input: CreateOrderInput = {
      type: orderType,
      amount,
      rate,
      currency,
      paymentMethod,
      duration,
    };

    createOrder(input);
    toast.success('Order created successfully!');
    router.push('/');
    setIsLoading(false);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(e);
      }}
      className="flex flex-col gap-6"
    >
      {/* USDC Amount */}
      <div>
        <Label className="mb-2 block text-body font-semibold text-gray-700">
          USDC Amount
        </Label>
        <NumberField
          value={formData.amount}
          onChange={(v) => {
            console.log('[CreateOrderForm] amount onChange:', v);
            update('amount', v);
          }}
          min={0}
          step={10}
        />
      </div>

      {/* Currency + Rate */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="mb-2 block text-body font-semibold text-gray-700">
            Fiat Currency
          </Label>
          <Select
            value={formData.currency}
            onValueChange={(v) => {
              console.log('[CreateOrderForm] currency onChange:', v);
              update('currency', v as Currency);
            }}
          >
            <SelectTrigger className="w-full rounded-xl border border-gray-200 bg-gray-50">
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="mb-2 block text-body font-semibold text-gray-700">
            Exchange Rate
          </Label>
        <NumberField
          value={formData.rate}
          onChange={(v) => {
            console.log('[CreateOrderForm] rate onChange:', v);
            update('rate', v);
          }}
          min={0}
          step={0.01}
        />
        </div>
      </div>

      {/* Payment + Duration */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="mb-2 block text-body font-semibold text-gray-700">
            Payment Method
          </Label>
          <Select
            value={formData.paymentMethod}
            onValueChange={(v) => {
              console.log('[CreateOrderForm] paymentMethod onChange:', v);
              update('paymentMethod', v as PaymentMethod);
            }}
          >
            <SelectTrigger className="w-full rounded-xl border border-gray-200 bg-gray-50">
              <SelectValue placeholder="Select method" />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_METHODS.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="mb-2 block text-body font-semibold text-gray-700">
            Duration
          </Label>
          <Select
            value={formData.duration}
            onValueChange={(v) => {
              console.log('[CreateOrderForm] duration onChange:', v);
              update('duration', v);
            }}
          >
            <SelectTrigger className="w-full rounded-xl border border-gray-200 bg-gray-50">
              <SelectValue placeholder="Select duration" />
            </SelectTrigger>
            <SelectContent>
              {DURATIONS.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Warning */}
      <Alert className="bg-yellow-50 border-yellow-200 text-yellow-800 [&_svg]:text-yellow-600">
        <AlertTitle className="text-body-sm font-bold">Important</AlertTitle>
        <AlertDescription className="text-body-sm text-yellow-800/90">
          Orders are binding. Ensure your payment details are correct before
          submitting.
        </AlertDescription>
      </Alert>

      <Button
        type="button"
        onClick={handleSubmit}
        disabled={isLoading}
        className="mt-6 w-full rounded-full bg-gradient-to-r from-primary-500 to-primary-600 py-4 text-body font-bold text-white hover:opacity-90 transition-all duration-200 disabled:opacity-70"
      >
        {isLoading ? (
          <>
            <Loader2 className="size-5 animate-spin" />
            Creating...
          </>
        ) : (
          `Create ${orderType === 'sell' ? 'Sell' : 'Buy'} Order`
        )}
      </Button>
    </form>
  );
}
````

## File: components/EmptyState.tsx
````typescript
import { ReactNode } from 'react';

export interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  actionText?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon,
  title,
  actionText,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl py-12 px-6 flex flex-col items-center gap-4">
      {icon}
      <p className="text-gray-500 text-base font-medium text-center">{title}</p>
      {actionText != null && onAction != null && (
        <button
          type="button"
          onClick={onAction}
          className="text-magenta-500 text-sm font-semibold cursor-pointer hover:underline focus:outline-none focus:underline"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
````

## File: components/EscrowStepper.tsx
````typescript
'use client';

import { Check, Clock, Wallet } from 'lucide-react';
import type { OrderStatus } from '@/types';

export interface EscrowStepperProps {
  /** 0 = Setup, 1 = Deposit, 2 = Payment, 3 = Confirm, 4 = Complete */
  currentStep: number;
  orderStatus: OrderStatus;
}

const steps = [
  { number: 0, label: 'Setup', description: 'Activate USDC Trustline', Icon: Wallet },
  { number: 1, label: 'Deposit', description: 'Funds locked in escrow', Icon: Clock },
  { number: 2, label: 'Payment', description: 'Buyer sends fiat', Icon: Clock },
  { number: 3, label: 'Confirm', description: 'Seller confirms receipt', Icon: Clock },
  { number: 4, label: 'Complete', description: 'USDC released', Icon: Clock },
];

export default function EscrowStepper({ currentStep }: EscrowStepperProps) {
  return (
    <div className="relative flex w-full items-start gap-0">
      {/* Connecting line (full track) */}
      <div
        className="absolute left-0 right-0 top-6 border-t-2 border-gray-200"
        style={{ marginLeft: '20px', marginRight: '20px', width: 'calc(100% - 40px)' }}
        aria-hidden
      />

      {/* Progress line (filled up to current step) */}
      <div
        className="absolute left-0 top-6 border-t-2 border-lime-500 transition-all duration-300"
        style={{
          marginLeft: '20px',
          width:
            currentStep <= 0
              ? '0'
              : `calc((100% - 40px) * ${currentStep / 4})`,
        }}
        aria-hidden
      />

      {steps.map((step) => {
        const isCompleted = step.number < currentStep;
        const isActive = step.number === currentStep;
        const isPending = step.number > currentStep;
        const Icon = step.Icon;

        return (
          <div
            key={step.number}
            className="relative z-10 flex flex-1 flex-col items-center min-w-0"
          >
            <div
              className={`
                flex h-10 w-10 shrink-0 items-center justify-center rounded-full
                ${isCompleted ? 'bg-lime-500 text-white' : ''}
                ${isActive ? 'bg-primary-500 text-white animate-pulse' : ''}
                ${isPending ? 'bg-gray-200 text-gray-400' : ''}
              `}
            >
              {isCompleted ? (
                <Check className="size-5" />
              ) : isActive ? (
                <Icon className="size-5" />
              ) : (
                <span className="text-sm font-semibold">{step.number + 1}</span>
              )}
            </div>
            <span className="mt-1.5 text-center text-xs font-semibold truncate w-full px-0.5">
              {step.label}
            </span>
            <span className="mt-0.5 text-center text-[10px] text-gray-500 truncate w-full px-0.5 leading-tight">
              {step.description}
            </span>
          </div>
        );
      })}
    </div>
  );
}
````

## File: components/FadeIn.tsx
````typescript
import { type ReactNode } from 'react';

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export default function FadeIn({ children, delay, className = '' }: FadeInProps) {
  return (
    <div
      className={`animate-fadeIn ${className}`.trim()}
      style={delay != null ? { animationDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  );
}
````

## File: components/Header.tsx
````typescript
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { Wallet, Loader2 } from 'lucide-react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

function shortenAddress(address: string): string {
  if (address.length <= 14) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function Header() {
  const { user, connectWallet, disconnectWallet } = useStore();
  const { isConnected, walletAddress } = user;
  const [isConnecting, setIsConnecting] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b shadow-sm">
      <div className="max-w-[480px] mx-auto px-4 py-3 flex items-center justify-between gap-2">
        {/* Logo */}
        <div className="flex items-center gap-2 min-w-0">
          <Image
            src="/x_icon_black.png"
            alt="PeerlyPay"
            width={28}
            height={28}
            className="shrink-0 object-contain h-7 w-7"
          />
          <span className="font-bold text-xl font-[family-name:var(--font-space-grotesk)] truncate">
            PeerlyPay
          </span>
        </div>

        {/* Wallet */}
        <div className="flex items-center">
          {!isConnected ? (
            <Button
              disabled={isConnecting}
              onClick={async () => {
                setIsConnecting(true);
                await new Promise((r) => setTimeout(r, 500));
                connectWallet();
                toast.success('Wallet connected successfully!');
                setIsConnecting(false);
              }}
              className="bg-magenta hover:bg-magenta/90 text-white transition-all duration-200 disabled:opacity-70"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Wallet className="size-4" />
                  Connect Wallet
                </>
              )}
            </Button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="font-mono text-sm min-w-0 transition-all duration-200"
                >
                  {walletAddress ? shortenAddress(walletAddress) : '0x...'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[10rem]">
                <DropdownMenuItem
                  onClick={() => {
                    disconnectWallet();
                    toast.info('Wallet disconnected');
                  }}
                  className="cursor-pointer"
                >
                  Disconnect
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
````

## File: components/OrderCard.tsx
````typescript
'use client';

import { useRouter } from 'next/navigation';
import type { Order } from '@/types';

export interface OrderCardProps {
  order: Order;
}

function shortenAddress(address: string): string {
  if (address.length <= 14) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function getAddressInitial(address: string): string {
  const hex = address.replace(/^0x/i, '').slice(0, 1);
  return (hex || '?').toUpperCase();
}

export default function OrderCard({ order }: OrderCardProps) {
  const router = useRouter();
  const total = order.amount * order.rate;
  const actionLabel = order.type === 'sell' ? 'Buy Now' : 'Sell Now';

  const handleClick = () => {
    router.push(`/orders/${order.id}`);
  };

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      className="cursor-pointer rounded-xl border border-gray-200 bg-white p-4 text-left transition-all duration-200 hover:scale-[1.02] hover:border-primary-200 hover:shadow-lg"
    >
      {/* Row 1: Avatar + username + online */}
      <div className="flex items-center gap-3">
        <div className="relative shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-500 text-sm font-bold text-white font-[family-name:var(--font-space-grotesk)]">
            {getAddressInitial(order.createdBy)}
          </div>
          <span
            className="absolute bottom-0 right-0 h-2 w-2 rounded-full border-2 border-white bg-green-500"
            aria-hidden
          />
        </div>
        <span className="text-base font-semibold text-gray-900 truncate">
          {shortenAddress(order.createdBy)}
        </span>
      </div>

      {/* Row 2: Reputation | Payment window */}
      <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
        <span
          className="inline-flex items-center gap-1 rounded-full bg-cyan-50 px-2 py-1 text-xs font-semibold text-cyan-700 cursor-pointer hover:bg-cyan-100/80 transition-colors"
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            // Future: show trade history
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') e.stopPropagation();
          }}
        >
          ⭐ {(order.reputation_score ?? 0) === 0 ? 'New trader' : `${order.reputation_score} trades`}
        </span>
        <span aria-hidden>|</span>
        <span>Payment window: {order.duration || '30 min'}</span>
      </div>

      {/* Row 3: Exchange rate - prominent */}
      <p className="mt-2 text-3xl font-bold text-dark-500 font-[family-name:var(--font-space-grotesk)]">
        1 USDC = {order.rate.toLocaleString('en-US')} {order.currency}
      </p>

      {/* Row 4: Limits */}
      <p className="mt-1 text-sm text-gray-600">
        Limits: 10 - {total.toLocaleString('en-US')} {order.currency}
      </p>

      {/* Row 5: Payment methods + compact button */}
      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="text-sm text-gray-700 truncate min-w-0">
          {order.paymentMethod}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
          className="shrink-0 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-2.5 text-sm font-bold text-white hover:opacity-90 transition-all duration-200 font-[family-name:var(--font-space-grotesk)]"
        >
          {actionLabel}
        </button>
      </div>
    </article>
  );
}
````

## File: components/OrderCardSkeleton.tsx
````typescript
'use client';

import { Skeleton } from '@/components/ui/skeleton';

export default function OrderCardSkeleton() {
  return (
    <article className="rounded-xl border border-gray-200 bg-white p-5 text-left">
      {/* User info row: address + badge */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-16 rounded-full" />
      </div>

      {/* Amount */}
      <Skeleton className="mb-1 h-8 w-40" />

      {/* Price */}
      <Skeleton className="mb-2 h-4 w-48" />

      {/* Total */}
      <Skeleton className="h-6 w-36" />

      {/* Payment method */}
      <Skeleton className="mt-3 h-5 w-24 rounded-md" />

      {/* Time limit */}
      <Skeleton className="mt-2 h-3 w-40" />

      {/* Action button */}
      <Skeleton className="mt-4 h-10 w-full rounded-full" />
    </article>
  );
}
````

## File: components/OrderTypeSelector.tsx
````typescript
'use client';

import { Wallet, ArrowLeftRight } from 'lucide-react';

export interface OrderTypeSelectorProps {
  selected: 'buy' | 'sell';
  onSelect: (type: 'buy' | 'sell') => void;
}

const options: { type: 'buy' | 'sell'; label: string; Icon: typeof Wallet }[] = [
  { type: 'sell', label: 'Sell USDC', Icon: Wallet },
  { type: 'buy', label: 'Buy USDC', Icon: ArrowLeftRight },
];

export default function OrderTypeSelector({ selected, onSelect }: OrderTypeSelectorProps) {
  return (
    <div className="flex gap-6 border-b border-gray-200 mb-6">
      {options.map(({ type, label, Icon }) => {
        const isSelected = selected === type;
        return (
          <button
            key={type}
            type="button"
            onClick={() => onSelect(type)}
            className={`flex items-center gap-2 text-body pb-3 -mb-px transition-colors ${
              isSelected
                ? 'text-primary-600 font-semibold border-b-2 border-primary-500'
                : 'text-gray-500 font-medium hover:text-primary-500'
            }`}
          >
            <Icon className="w-5 h-5 shrink-0" />
            {label}
          </button>
        );
      })}
    </div>
  );
}
````

## File: components/QuickActions.tsx
````typescript
'use client';

import {
  Wallet,
  ArrowDownToLine,
  ArrowUpFromLine,
  HelpCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const actions = [
  { icon: Wallet, label: 'Wallet', id: 'wallet' },
  { icon: ArrowDownToLine, label: 'Deposit', id: 'deposit' },
  { icon: ArrowUpFromLine, label: 'Withdraw', id: 'withdraw' },
  { icon: HelpCircle, label: 'Support', id: 'support' },
] as const;

export default function QuickActions() {
  return (
    <div className="mt-6 grid grid-cols-4 gap-2">
      {actions.map(({ icon: Icon, label, id }) => (
        <Button
          key={id}
          variant="ghost"
          onClick={() => console.log(id)}
          className="group flex flex-col items-center gap-2 py-3 h-auto text-gray-600 border-1 border-primary-500 rounded-xl hover:bg-gray-50 hover:text-magenta-600 hover:scale-105 transition-all duration-200"
        >
          <Icon className="w-8 h-8 text-magenta-500 group-hover:text-magenta-600" />
          <span className="text-body-sm font-medium">{label}</span>
        </Button>
      ))}
    </div>
  );
}
````

## File: types/index.ts
````typescript
export type OrderType = 'buy' | 'sell';
export type OrderStatus = 'open' | 'active' | 'completed' | 'cancelled' | 'disputed';
export type PaymentMethod = 'Bank Transfer' | 'MercadoPago';
export type Currency = 'ARS' | 'USD';

export interface User {
  walletAddress: string | null;
  isConnected: boolean;
  balance: {
    usd: number;
    usdc: number;
  };
  /** Mock: completed trades count for reputation (Stellar will provide later) */
  reputation_score?: number;
}

export interface Order {
  id: string;
  type: OrderType;
  amount: number;
  rate: number;
  currency: Currency;
  paymentMethod: PaymentMethod;
  duration: string;
  status: OrderStatus;
  createdAt: Date;
  createdBy: string;
  /** Mock: order creator's completed trades (Stellar will provide later) */
  reputation_score?: number;
}

export interface CreateOrderInput {
  type: OrderType;
  amount: number;
  rate: number;
  currency: Currency;
  paymentMethod: PaymentMethod;
  duration: string;
}
````

## File: package.json
````json
{
  "name": "peerlypay",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  },
  "dependencies": {
    "@radix-ui/react-dialog": "^1.1.15",
    "@radix-ui/react-dropdown-menu": "^2.1.16",
    "@radix-ui/react-label": "^2.1.8",
    "@radix-ui/react-select": "^2.2.6",
    "@radix-ui/react-separator": "^1.1.8",
    "@radix-ui/react-slot": "^1.2.4",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "lucide-react": "^0.563.0",
    "next": "16.1.6",
    "next-themes": "^0.4.6",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "sonner": "^2.0.7",
    "tailwind-merge": "^3.4.0",
    "zustand": "^5.0.11"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.1.6",
    "tailwindcss": "^4",
    "tw-animate-css": "^1.4.0",
    "typescript": "^5"
  }
}
````

## File: README.md
````markdown
# PeerlyPay 🌍💸

## Tagline

**"Earn Global, Spend Local - Trustless ramp for the borderless economy."**

## Overview

PeerlyPay is a decentralized P2P fiat-to-crypto marketplace that lets users trade USDC for local fiat (and vice versa) without relying on centralized exchanges. Orders are matched peer-to-peer, and funds are secured in non-custodial escrow until both parties confirm the off-chain payment.

We built PeerlyPay for **remote workers, freelancers, and digital nomads** in Latin America and other emerging markets who earn in crypto but need to pay rent, bills, and daily expenses in local currency. Today, cashing out often means KYC-heavy CEXs, high fees, or risky OTC deals with strangers.

PeerlyPay solves this by providing a **trustless ramp**: connect your wallet, create or take an order, lock funds in escrow, complete the fiat transfer (bank or MercadoPago), and release USDC on confirmation. No CEX account required—just your wallet and a counterparty.

## Features

- ✅ **P2P Marketplace** for USDC ↔ Fiat trades  
- ✅ **Non-custodial Escrow** (ready for smart contract integration)  
- ✅ **On-chain Reputation System** (ready for Unibase integration)  
- ✅ **Real-time Order Management**  
- ✅ **In-app Chat** for payment coordination  
- ✅ **Mobile-first responsive design**  
- ✅ **Multiple payment methods** (Bank Transfer, MercadoPago)  

## Tech Stack

### Frontend

- **Next.js 15** (App Router)  
- **TypeScript**  
- **Tailwind CSS v4**  
- **shadcn/ui** components  
- **Zustand** (state management)  
- **Sonner** (toast notifications)  

### Blockchain (Ready for integration)

- Escrow Smart Contracts (Solidity)  
- Unibase Identity & Memory (AIP 2.0)  
- ERC-8004 On-chain Identity  

## How It Works

1. **Connect Wallet** – Link your wallet to the app.  
2. **Create Buy/Sell order** – Set amount, rate, currency, and payment method.  
3. **Browse marketplace** – Filter by Buy USDC / Sell USDC and view open orders.  
4. **Accept order** → Funds locked in escrow.  
5. **Off-chain fiat transfer** – Buyer sends payment via bank or MercadoPago.  
6. **Seller confirms** → USDC released from escrow to buyer.  
7. **Reputation updated** on-chain (Unibase-ready).  

## Project Structure

```
peerlypay/
├── app/                    # Next.js pages
│   ├── page.tsx           # Dashboard
│   ├── orders/            # Marketplace & order details
│   ├── create-order/      # Order creation
│   └── my-orders/         # User's order history
├── components/            # React components
├── lib/                   # Utilities & state management
└── types/                 # TypeScript interfaces
```

## Getting Started

### Prerequisites

- Node.js 18+  
- npm or yarn  

### Installation

```bash
git clone [repo-url]
cd peerlypay
npm install
npm run dev
```

Open **http://localhost:3000**

## Future Roadmap

- [ ] Unibase integration for portable reputation  
- [ ] AI dispute resolution agent  
- [ ] Multi-currency support (USD, EUR, BRL)  
- [ ] Mobile app (React Native)  
- [ ] Integration with DeFi protocols  

## Screenshots

*Screenshots coming soon*

## Team

- **Alexis**  
- **Steven**  
- **Stefano**  
- **Barb**  

## License

MIT  

---

*Built with ❤️ for Stellar 2026*
````