import { describe, it, expect } from "vitest";
import { deterministicReview } from "./reviewer";
import { DEMO_CRITERIA, FAILED_DELIVERY_CONTENT, CORRECTED_DELIVERY_CONTENT } from "./demoData";
import { DeliveryManifest } from "./types";

function manifestFromContent(content: string, summary: string): DeliveryManifest {
  return {
    fileName: "test.md",
    blobId: "0xtest",
    manifestHash: "0xtesthash",
    contentType: "text/markdown",
    summary,
    content,
    createdAt: new Date().toISOString(),
  };
}

describe("deterministicReview", () => {
  it("fails delivery missing comparison table", () => {
    const manifest = manifestFromContent(FAILED_DELIVERY_CONTENT, "Missing comparison table");
    const review = deterministicReview(DEMO_CRITERIA, manifest);

    expect(review.result).toBe("needs_revision");
    expect(review.paymentRecommendation).toBe("do_not_release");
    expect(review.score).toBeLessThan(80);

    const tableCheck = review.checks.find((c) => c.criterion.toLowerCase().includes("comparison table"));
    expect(tableCheck?.status).toBe("fail");
  });

  it("passes corrected delivery with comparison table", () => {
    const manifest = manifestFromContent(CORRECTED_DELIVERY_CONTENT, "Includes comparison table");
    const review = deterministicReview(DEMO_CRITERIA, manifest);

    expect(review.result).toBe("pass");
    expect(review.paymentRecommendation).toBe("release_payment");
    expect(review.score).toBeGreaterThanOrEqual(80);

    const tableCheck = review.checks.find((c) => c.criterion.toLowerCase().includes("comparison table"));
    expect(tableCheck?.status).toBe("pass");
  });

  it("always produces a score between 0 and 100", () => {
    const review = deterministicReview(DEMO_CRITERIA, manifestFromContent("", "empty"));
    expect(review.score).toBeGreaterThanOrEqual(0);
    expect(review.score).toBeLessThanOrEqual(100);
  });
});
