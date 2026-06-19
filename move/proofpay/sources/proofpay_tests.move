#[test_only]
module proofpay::proofpay_tests;

use proofpay::proofpay;
use sui::clock::{Self, Clock};
use sui::coin::{Self, Coin};
use sui::sui::SUI;
use sui::test_scenario::{Self as ts, Scenario};

const CLIENT: address = @0xA;
const AGENT: address = @0xB;
const REVIEWER: address = @0xC;
const RANDOM: address = @0xD;

const STATUS_FUNDED: u64 = 1;
const STATUS_NEEDS_REVISION: u64 = 3;
const STATUS_RELEASED: u64 = 5;
const PAYMENT_LOCKED: u64 = 1;

fun setup_clock(scenario: &mut Scenario) {
    ts::next_tx(scenario, CLIENT);
    let clock = clock::create_for_testing(ts::ctx(scenario));
    clock::share_for_testing(clock);
}

fun title_hash(): vector<u8> { b"title_hash" }
fun description_hash(): vector<u8> { b"description_hash" }
fun acceptance_criteria_hash(): vector<u8> { b"acceptance_criteria_hash" }
fun deliverable_blob_id(): vector<u8> { b"deliverable_blob_id" }
fun deliverable_manifest_hash(): vector<u8> { b"deliverable_manifest_hash" }
fun reviewer_attestation(): vector<u8> { b"reviewer_attestation" }
fun review_report_blob_id(): vector<u8> { b"review_report_blob_id" }

#[test]
fun test_create_settlement_locks_sui() {
    let mut scenario = ts::begin(CLIENT);
    setup_clock(&mut scenario);

    ts::next_tx(&mut scenario, CLIENT);
    let clock = ts::take_shared<Clock>(&scenario);
    let payment = coin::mint_for_testing<SUI>(1000, ts::ctx(&mut scenario));
    proofpay::create_settlement(
        AGENT,
        title_hash(),
        description_hash(),
        acceptance_criteria_hash(),
        payment,
        &clock,
        ts::ctx(&mut scenario),
    );
    ts::return_shared(clock);

    ts::next_tx(&mut scenario, CLIENT);
    let settlement = ts::take_shared<proofpay::AgentWorkSettlement>(&scenario);
    assert!(proofpay::settlement_status(&settlement) == STATUS_FUNDED, 0);
    assert!(proofpay::settlement_escrow_amount(&settlement) == 1000, 1);
    ts::return_shared(settlement);

    ts::end(scenario);
}

#[test]
fun test_failed_review_keeps_payment_locked() {
    let mut scenario = ts::begin(CLIENT);
    setup_clock(&mut scenario);

    ts::next_tx(&mut scenario, CLIENT);
    let clock = ts::take_shared<Clock>(&scenario);
    let payment = coin::mint_for_testing<SUI>(1000, ts::ctx(&mut scenario));
    proofpay::create_settlement(
        AGENT,
        title_hash(),
        description_hash(),
        acceptance_criteria_hash(),
        payment,
        &clock,
        ts::ctx(&mut scenario),
    );
    ts::return_shared(clock);

    ts::next_tx(&mut scenario, AGENT);
    let mut settlement = ts::take_shared<proofpay::AgentWorkSettlement>(&scenario);
    let clock = ts::take_shared<Clock>(&scenario);
    proofpay::submit_delivery_initial(
        &mut settlement,
        deliverable_blob_id(),
        deliverable_manifest_hash(),
        &clock,
        ts::ctx(&mut scenario),
    );
    ts::return_shared(clock);
    ts::return_shared(settlement);

    ts::next_tx(&mut scenario, REVIEWER);
    let mut settlement = ts::take_shared<proofpay::AgentWorkSettlement>(&scenario);
    let mut passport = ts::take_shared<proofpay::TraceBriefPassport>(&scenario);
    let clock = ts::take_shared<Clock>(&scenario);
    proofpay::submit_review(
        &mut settlement,
        &mut passport,
        reviewer_attestation(),
        60,
        review_report_blob_id(),
        &clock,
    );
    ts::return_shared(clock);
    ts::return_shared(passport);
    ts::return_shared(settlement);

    ts::next_tx(&mut scenario, REVIEWER);
    let settlement = ts::take_shared<proofpay::AgentWorkSettlement>(&scenario);
    let passport = ts::take_shared<proofpay::TraceBriefPassport>(&scenario);
    assert!(proofpay::settlement_status(&settlement) == STATUS_NEEDS_REVISION, 0);
    assert!(proofpay::passport_payment_status(&passport) == PAYMENT_LOCKED, 1);
    ts::return_shared(passport);
    ts::return_shared(settlement);

    ts::end(scenario);
}

#[test]
fun test_passing_review_and_release_transfers_sui() {
    let mut scenario = ts::begin(CLIENT);
    setup_clock(&mut scenario);

    ts::next_tx(&mut scenario, CLIENT);
    let clock = ts::take_shared<Clock>(&scenario);
    let payment = coin::mint_for_testing<SUI>(1000, ts::ctx(&mut scenario));
    proofpay::create_settlement(
        AGENT,
        title_hash(),
        description_hash(),
        acceptance_criteria_hash(),
        payment,
        &clock,
        ts::ctx(&mut scenario),
    );
    ts::return_shared(clock);

    ts::next_tx(&mut scenario, AGENT);
    let mut settlement = ts::take_shared<proofpay::AgentWorkSettlement>(&scenario);
    let clock = ts::take_shared<Clock>(&scenario);
    proofpay::submit_delivery_initial(
        &mut settlement,
        deliverable_blob_id(),
        deliverable_manifest_hash(),
        &clock,
        ts::ctx(&mut scenario),
    );
    ts::return_shared(clock);
    ts::return_shared(settlement);

    ts::next_tx(&mut scenario, REVIEWER);
    let mut settlement = ts::take_shared<proofpay::AgentWorkSettlement>(&scenario);
    let mut passport = ts::take_shared<proofpay::TraceBriefPassport>(&scenario);
    let clock = ts::take_shared<Clock>(&scenario);
    proofpay::submit_review(
        &mut settlement,
        &mut passport,
        reviewer_attestation(),
        90,
        review_report_blob_id(),
        &clock,
    );
    ts::return_shared(clock);
    ts::return_shared(passport);
    ts::return_shared(settlement);

    ts::next_tx(&mut scenario, CLIENT);
    let mut settlement = ts::take_shared<proofpay::AgentWorkSettlement>(&scenario);
    let mut passport = ts::take_shared<proofpay::TraceBriefPassport>(&scenario);
    proofpay::approve_and_release(
        &mut settlement,
        &mut passport,
        ts::ctx(&mut scenario),
    );
    ts::return_shared(passport);
    ts::return_shared(settlement);

    ts::next_tx(&mut scenario, CLIENT);
    let settlement = ts::take_shared<proofpay::AgentWorkSettlement>(&scenario);
    assert!(proofpay::settlement_status(&settlement) == STATUS_RELEASED, 0);
    assert!(proofpay::settlement_escrow_amount(&settlement) == 0, 1);
    ts::return_shared(settlement);

    ts::next_tx(&mut scenario, AGENT);
    let agent_coin = ts::take_from_sender<Coin<SUI>>(&scenario);
    assert!(coin::value(&agent_coin) == 1000, 2);
    ts::return_to_sender(&scenario, agent_coin);

    ts::end(scenario);
}

#[test, expected_failure(abort_code = 1)]
fun test_non_agent_cannot_submit_delivery() {
    let mut scenario = ts::begin(CLIENT);
    setup_clock(&mut scenario);

    ts::next_tx(&mut scenario, CLIENT);
    let clock = ts::take_shared<Clock>(&scenario);
    let payment = coin::mint_for_testing<SUI>(1000, ts::ctx(&mut scenario));
    proofpay::create_settlement(
        AGENT,
        title_hash(),
        description_hash(),
        acceptance_criteria_hash(),
        payment,
        &clock,
        ts::ctx(&mut scenario),
    );
    ts::return_shared(clock);

    ts::next_tx(&mut scenario, RANDOM);
    let mut settlement = ts::take_shared<proofpay::AgentWorkSettlement>(&scenario);
    let clock = ts::take_shared<Clock>(&scenario);
    proofpay::submit_delivery_initial(
        &mut settlement,
        deliverable_blob_id(),
        deliverable_manifest_hash(),
        &clock,
        ts::ctx(&mut scenario),
    );
    ts::return_shared(clock);
    ts::return_shared(settlement);

    ts::end(scenario);
}

#[test, expected_failure(abort_code = 5)]
fun test_non_client_cannot_release() {
    let mut scenario = ts::begin(CLIENT);
    setup_clock(&mut scenario);

    ts::next_tx(&mut scenario, CLIENT);
    let clock = ts::take_shared<Clock>(&scenario);
    let payment = coin::mint_for_testing<SUI>(1000, ts::ctx(&mut scenario));
    proofpay::create_settlement(
        AGENT,
        title_hash(),
        description_hash(),
        acceptance_criteria_hash(),
        payment,
        &clock,
        ts::ctx(&mut scenario),
    );
    ts::return_shared(clock);

    ts::next_tx(&mut scenario, AGENT);
    let mut settlement = ts::take_shared<proofpay::AgentWorkSettlement>(&scenario);
    let clock = ts::take_shared<Clock>(&scenario);
    proofpay::submit_delivery_initial(
        &mut settlement,
        deliverable_blob_id(),
        deliverable_manifest_hash(),
        &clock,
        ts::ctx(&mut scenario),
    );
    ts::return_shared(clock);
    ts::return_shared(settlement);

    ts::next_tx(&mut scenario, REVIEWER);
    let mut settlement = ts::take_shared<proofpay::AgentWorkSettlement>(&scenario);
    let mut passport = ts::take_shared<proofpay::TraceBriefPassport>(&scenario);
    let clock = ts::take_shared<Clock>(&scenario);
    proofpay::submit_review(
        &mut settlement,
        &mut passport,
        reviewer_attestation(),
        90,
        review_report_blob_id(),
        &clock,
    );
    ts::return_shared(clock);
    ts::return_shared(passport);
    ts::return_shared(settlement);

    ts::next_tx(&mut scenario, RANDOM);
    let mut settlement = ts::take_shared<proofpay::AgentWorkSettlement>(&scenario);
    let mut passport = ts::take_shared<proofpay::TraceBriefPassport>(&scenario);
    proofpay::approve_and_release(
        &mut settlement,
        &mut passport,
        ts::ctx(&mut scenario),
    );
    ts::return_shared(passport);
    ts::return_shared(settlement);

    ts::end(scenario);
}
