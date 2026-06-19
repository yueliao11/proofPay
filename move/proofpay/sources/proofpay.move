#[allow(lint(public_entry))]
module proofpay::proofpay;

use sui::balance::{Self, Balance};
use sui::clock::{Self, Clock};
use sui::coin::{Self, Coin};
use sui::event;
use sui::sui::SUI;

// Settlement status constants
const STATUS_FUNDED: u64 = 1;
const STATUS_SUBMITTED: u64 = 2;
const STATUS_NEEDS_REVISION: u64 = 3;
const STATUS_REVIEWED: u64 = 4;
const STATUS_RELEASED: u64 = 5;

// Passport payment status constants
const PAYMENT_LOCKED: u64 = 1;
const PAYMENT_READY: u64 = 2;
const PAYMENT_RELEASED: u64 = 3;

// Error constants
const EAmountMustBeGreaterThanZero: u64 = 0;
const EOnlyAgentCanSubmitDelivery: u64 = 1;
const EInvalidStatusForDelivery: u64 = 2;
const EInvalidStatusForReview: u64 = 3;
const EScoreOutOfRange: u64 = 4;
const EOnlyClientCanRelease: u64 = 5;
const EInvalidStatusForRelease: u64 = 6;
const EPaymentNotReady: u64 = 7;
const EScoreTooLowForRelease: u64 = 8;
const EPassportMismatch: u64 = 9;
const EPassportAlreadyExists: u64 = 10;

/// Shared settlement object that holds escrowed SUI and tracks the lifecycle
/// of an AI-agent work agreement.
public struct AgentWorkSettlement has key {
    id: UID,
    client: address,
    agent: address,
    escrow: Balance<SUI>,
    title_hash: vector<u8>,
    description_hash: vector<u8>,
    acceptance_criteria_hash: vector<u8>,
    status: u64,
    passport_id: Option<ID>,
    created_at_ms: u64,
    updated_at_ms: u64,
}

/// Shared passport object that captures delivery and review attestations
/// for a settlement.
public struct TraceBriefPassport has key {
    id: UID,
    settlement_id: ID,
    agent: address,
    escrow_amount: u64,
    payment_status: u64,
    deliverable_blob_id: vector<u8>,
    deliverable_manifest_hash: vector<u8>,
    acceptance_criteria_hash: vector<u8>,
    reviewer_attestation: vector<u8>,
    review_score: u64,
    review_report_blob_id: vector<u8>,
    created_at_ms: u64,
    updated_at_ms: u64,
}

// Events

public struct SettlementCreated has copy, drop {
    settlement_id: ID,
    client: address,
    agent: address,
    amount: u64,
    acceptance_criteria_hash: vector<u8>,
}

public struct DeliverySubmitted has copy, drop {
    settlement_id: ID,
    passport_id: ID,
    agent: address,
    deliverable_blob_id: vector<u8>,
    deliverable_manifest_hash: vector<u8>,
}

public struct ReviewSubmitted has copy, drop {
    settlement_id: ID,
    passport_id: ID,
    review_score: u64,
    payment_recommendation: u64,
    review_report_blob_id: vector<u8>,
}

public struct PaymentReleased has copy, drop {
    settlement_id: ID,
    passport_id: ID,
    client: address,
    agent: address,
    amount: u64,
}

/// Create a new work settlement, locking the client's SUI payment in escrow.
public entry fun create_settlement(
    agent: address,
    title_hash: vector<u8>,
    description_hash: vector<u8>,
    acceptance_criteria_hash: vector<u8>,
    payment: Coin<SUI>,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    let amount = coin::value(&payment);
    assert!(amount > 0, EAmountMustBeGreaterThanZero);

    let settlement = AgentWorkSettlement {
        id: object::new(ctx),
        client: tx_context::sender(ctx),
        agent,
        escrow: coin::into_balance(payment),
        title_hash,
        description_hash,
        acceptance_criteria_hash,
        status: STATUS_FUNDED,
        passport_id: option::none(),
        created_at_ms: clock::timestamp_ms(clock),
        updated_at_ms: clock::timestamp_ms(clock),
    };

    let settlement_id = object::id(&settlement);
    event::emit(SettlementCreated {
        settlement_id,
        client: settlement.client,
        agent: settlement.agent,
        amount,
        acceptance_criteria_hash,
    });

    transfer::share_object(settlement);
}

/// Internal helper to create the first TraceBriefPassport for a settlement.
fun create_passport_internal(
    settlement: &mut AgentWorkSettlement,
    deliverable_blob_id: vector<u8>,
    deliverable_manifest_hash: vector<u8>,
    clock: &Clock,
    ctx: &mut TxContext,
): ID {
    let passport = TraceBriefPassport {
        id: object::new(ctx),
        settlement_id: object::id(settlement),
        agent: settlement.agent,
        escrow_amount: balance::value(&settlement.escrow),
        payment_status: PAYMENT_LOCKED,
        deliverable_blob_id,
        deliverable_manifest_hash,
        acceptance_criteria_hash: settlement.acceptance_criteria_hash,
        reviewer_attestation: vector[],
        review_score: 0,
        review_report_blob_id: vector[],
        created_at_ms: clock::timestamp_ms(clock),
        updated_at_ms: clock::timestamp_ms(clock),
    };

    let passport_id = object::id(&passport);
    option::fill(&mut settlement.passport_id, passport_id);
    transfer::share_object(passport);
    passport_id
}

/// Internal helper to update an existing passport with a new delivery attempt.
fun update_passport_internal(
    settlement: &AgentWorkSettlement,
    passport: &mut TraceBriefPassport,
    deliverable_blob_id: vector<u8>,
    deliverable_manifest_hash: vector<u8>,
    clock: &Clock,
) {
    assert!(passport.settlement_id == object::id(settlement), EPassportMismatch);

    passport.deliverable_blob_id = deliverable_blob_id;
    passport.deliverable_manifest_hash = deliverable_manifest_hash;
    passport.acceptance_criteria_hash = settlement.acceptance_criteria_hash;
    passport.payment_status = PAYMENT_LOCKED;
    passport.updated_at_ms = clock::timestamp_ms(clock);
}

/// First-time delivery submission: creates the TraceBriefPassport.
public entry fun submit_delivery_initial(
    settlement: &mut AgentWorkSettlement,
    deliverable_blob_id: vector<u8>,
    deliverable_manifest_hash: vector<u8>,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    assert!(tx_context::sender(ctx) == settlement.agent, EOnlyAgentCanSubmitDelivery);
    assert!(
        settlement.status == STATUS_FUNDED || settlement.status == STATUS_NEEDS_REVISION,
        EInvalidStatusForDelivery,
    );
    assert!(option::is_none(&settlement.passport_id), EPassportAlreadyExists);

    let passport_id = create_passport_internal(
        settlement,
        deliverable_blob_id,
        deliverable_manifest_hash,
        clock,
        ctx,
    );

    settlement.status = STATUS_SUBMITTED;
    settlement.updated_at_ms = clock::timestamp_ms(clock);

    event::emit(DeliverySubmitted {
        settlement_id: object::id(settlement),
        passport_id,
        agent: settlement.agent,
        deliverable_blob_id,
        deliverable_manifest_hash,
    });
}

/// Subsequent delivery submission: updates the existing TraceBriefPassport.
public entry fun submit_delivery(
    settlement: &mut AgentWorkSettlement,
    deliverable_blob_id: vector<u8>,
    deliverable_manifest_hash: vector<u8>,
    passport: &mut TraceBriefPassport,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    assert!(tx_context::sender(ctx) == settlement.agent, EOnlyAgentCanSubmitDelivery);
    assert!(
        settlement.status == STATUS_FUNDED || settlement.status == STATUS_NEEDS_REVISION,
        EInvalidStatusForDelivery,
    );

    update_passport_internal(
        settlement,
        passport,
        deliverable_blob_id,
        deliverable_manifest_hash,
        clock,
    );

    settlement.status = STATUS_SUBMITTED;
    settlement.updated_at_ms = clock::timestamp_ms(clock);

    event::emit(DeliverySubmitted {
        settlement_id: object::id(settlement),
        passport_id: object::id(passport),
        agent: settlement.agent,
        deliverable_blob_id,
        deliverable_manifest_hash,
    });
}

/// Submit a review for a delivered settlement. Score <= 100.
/// score >= 80 => REVIEWED + PAYMENT_READY, otherwise NEEDS_REVISION + PAYMENT_LOCKED.
public entry fun submit_review(
    settlement: &mut AgentWorkSettlement,
    passport: &mut TraceBriefPassport,
    reviewer_attestation: vector<u8>,
    review_score: u64,
    review_report_blob_id: vector<u8>,
    clock: &Clock,
) {
    assert!(settlement.status == STATUS_SUBMITTED, EInvalidStatusForReview);
    assert!(review_score <= 100, EScoreOutOfRange);
    assert!(passport.settlement_id == object::id(settlement), EPassportMismatch);

    passport.reviewer_attestation = reviewer_attestation;
    passport.review_score = review_score;
    passport.review_report_blob_id = review_report_blob_id;
    passport.updated_at_ms = clock::timestamp_ms(clock);

    let payment_recommendation;
    if (review_score >= 80) {
        settlement.status = STATUS_REVIEWED;
        passport.payment_status = PAYMENT_READY;
        payment_recommendation = PAYMENT_READY;
    } else {
        settlement.status = STATUS_NEEDS_REVISION;
        passport.payment_status = PAYMENT_LOCKED;
        payment_recommendation = PAYMENT_LOCKED;
    };
    settlement.updated_at_ms = clock::timestamp_ms(clock);

    event::emit(ReviewSubmitted {
        settlement_id: object::id(settlement),
        passport_id: object::id(passport),
        review_score,
        payment_recommendation,
        review_report_blob_id,
    });
}

/// Client approves the reviewed settlement and releases escrowed SUI to the agent.
public entry fun approve_and_release(
    settlement: &mut AgentWorkSettlement,
    passport: &mut TraceBriefPassport,
    ctx: &mut TxContext,
) {
    assert!(tx_context::sender(ctx) == settlement.client, EOnlyClientCanRelease);
    assert!(settlement.status == STATUS_REVIEWED, EInvalidStatusForRelease);
    assert!(passport.payment_status == PAYMENT_READY, EPaymentNotReady);
    assert!(passport.review_score >= 80, EScoreTooLowForRelease);
    assert!(passport.settlement_id == object::id(settlement), EPassportMismatch);

    let amount = balance::value(&settlement.escrow);
    let payment = coin::take(&mut settlement.escrow, amount, ctx);
    transfer::public_transfer(payment, settlement.agent);

    settlement.status = STATUS_RELEASED;
    passport.payment_status = PAYMENT_RELEASED;
    let now = tx_context::epoch_timestamp_ms(ctx);
    settlement.updated_at_ms = now;
    passport.updated_at_ms = now;

    event::emit(PaymentReleased {
        settlement_id: object::id(settlement),
        passport_id: object::id(passport),
        client: settlement.client,
        agent: settlement.agent,
        amount,
    });
}

// Getters used by unit tests and external modules.

public fun settlement_status(settlement: &AgentWorkSettlement): u64 {
    settlement.status
}

public fun settlement_escrow_amount(settlement: &AgentWorkSettlement): u64 {
    balance::value(&settlement.escrow)
}

public fun settlement_passport_id(settlement: &AgentWorkSettlement): Option<ID> {
    settlement.passport_id
}

public fun passport_payment_status(passport: &TraceBriefPassport): u64 {
    passport.payment_status
}

public fun passport_review_score(passport: &TraceBriefPassport): u64 {
    passport.review_score
}

public fun passport_settlement_id(passport: &TraceBriefPassport): ID {
    passport.settlement_id
}
