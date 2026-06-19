import { describe, it, expect, beforeEach } from "vitest";
import {
  createSettlement,
  getSettlement,
  submitDelivery,
  submitReview,
  approveAndRelease,
  resetDemo,
  listSettlements,
} from "./sui";
import { deterministicReview } from "./reviewer";
import { DEMO_CRITERIA, FAILED_MANIFEST, CORRECTED_MANIFEST } from "./demoData";

describe("settlement lifecycle", () => {
  beforeEach(() => {
    resetDemo();
  });

  it("creates a funded settlement", () => {
    const s = createSettlement({
      client: "0xclient",
      agent: { address: "0xagent", name: "Agent" },
      amount: 2,
      asset: "SUI",
      title: "Test",
      description: "Test desc",
      acceptanceCriteria: DEMO_CRITERIA,
      acceptanceCriteriaHash: "0xhash",
      status: "funded",
      paymentStatus: "locked",
    });

    expect(s.status).toBe("funded");
    expect(s.paymentStatus).toBe("locked");
    expect(s.amount).toBe(2);
    expect(listSettlements().length).toBeGreaterThan(0);
  });

  it("demo settlement lifecycle: failed delivery keeps payment locked", () => {
    const s = resetDemo();
    const afterDelivery = submitDelivery(s.id, FAILED_MANIFEST);
    expect(afterDelivery.status).toBe("submitted");

    const review = deterministicReview(DEMO_CRITERIA, FAILED_MANIFEST);
    const afterReview = submitReview(s.id, review);
    expect(afterReview.status).toBe("needs_revision");
    expect(afterReview.paymentStatus).toBe("locked");
  });

  it("demo settlement lifecycle: corrected delivery releases payment", () => {
    const s = resetDemo();
    submitDelivery(s.id, FAILED_MANIFEST);
    submitReview(s.id, deterministicReview(DEMO_CRITERIA, FAILED_MANIFEST));

    const afterCorrected = submitDelivery(s.id, CORRECTED_MANIFEST);
    expect(afterCorrected.status).toBe("submitted");

    const review = deterministicReview(DEMO_CRITERIA, CORRECTED_MANIFEST);
    const afterReview = submitReview(s.id, review);
    expect(afterReview.status).toBe("reviewed");
    expect(afterReview.paymentStatus).toBe("ready");

    const afterRelease = approveAndRelease(s.id);
    expect(afterRelease.status).toBe("released");
    expect(afterRelease.paymentStatus).toBe("released");
    expect(getSettlement(s.id)?.status).toBe("released");
  });
});
