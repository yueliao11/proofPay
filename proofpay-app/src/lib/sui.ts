import {
  AgentWorkSettlement,
  SettlementStatus,
  PaymentStatus,
  DeliveryManifest,
  ReviewResult,
  TraceBriefPassport,
} from "./types";

const STORAGE_KEY = "proofpay_settlements_v1";
export const DEMO_ID = "0xdemo0000000000000000000000000000000000000000000000000000000000000000";

function load(): Record<string, AgentWorkSettlement> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function save(state: Record<string, AgentWorkSettlement>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function listSettlements(): AgentWorkSettlement[] {
  return Object.values(load()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getSettlement(id: string): AgentWorkSettlement | undefined {
  return load()[id];
}

export function saveSettlement(id: string, settlement: AgentWorkSettlement) {
  const state = load();
  state[id] = settlement;
  save(state);
}

export function createSettlement(
  settlement: Omit<AgentWorkSettlement, "id" | "createdAt" | "updatedAt">
): AgentWorkSettlement {
  const id = `0x${Math.random().toString(16).slice(2, 66).padEnd(64, "0")}`;
  const now = new Date().toISOString();
  const full: AgentWorkSettlement = {
    ...settlement,
    id,
    createdAt: now,
    updatedAt: now,
  };
  const state = load();
  state[id] = full;
  save(state);
  return full;
}

export function submitDelivery(
  id: string,
  manifest: DeliveryManifest
): AgentWorkSettlement {
  const state = load();
  const s = state[id];
  if (!s) throw new Error("Settlement not found");
  if (s.status !== "funded" && s.status !== "needs_revision") {
    throw new Error("Invalid settlement status for delivery submission");
  }
  s.deliveryManifest = manifest;
  s.status = "submitted";
  s.updatedAt = new Date().toISOString();
  save(state);
  return s;
}

export function submitReview(
  id: string,
  review: ReviewResult
): AgentWorkSettlement {
  const state = load();
  const s = state[id];
  if (!s) throw new Error("Settlement not found");
  if (s.status !== "submitted") throw new Error("Invalid settlement status for review");
  s.reviewResult = review;
  if (review.score >= 80) {
    s.status = "reviewed";
    s.paymentStatus = "ready";
  } else {
    s.status = "needs_revision";
    s.paymentStatus = "locked";
  }
  s.updatedAt = new Date().toISOString();
  save(state);
  return s;
}

export function approveAndRelease(id: string): AgentWorkSettlement {
  const state = load();
  const s = state[id];
  if (!s) throw new Error("Settlement not found");
  if (s.status !== "reviewed") throw new Error("Settlement not reviewed");
  if (!s.reviewResult || s.reviewResult.score < 80) {
    throw new Error("Review score too low to release");
  }
  s.status = "released";
  s.paymentStatus = "released";
  s.updatedAt = new Date().toISOString();
  save(state);
  return s;
}

export function resetDemo(): AgentWorkSettlement {
  const state = load();
  delete state["demo"];
  const demo: AgentWorkSettlement = {
    id: DEMO_ID,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    client: "0xclienta1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b",
    agent: {
      address: "0xresearchbot01a7f3c9d2e8b1a4f6e0d5c7b9a2e4f8d1c3b5a7e9f2d4c6b8a1e3f5d7c9b1a4",
      name: "ResearchBot-01",
    },
    amount: 2,
    asset: "SUI",
    title: "Sui Overflow Competitor Analysis",
    description:
      "ResearchBot-01 must produce a competitor analysis of Sui Overflow projects, including top trends, winning patterns, and recommendations for builders.",
    acceptanceCriteria: [
      { id: "c1", text: "Include at least 5 competitor projects.", critical: true },
      { id: "c2", text: "Include a comparison table.", critical: true },
      { id: "c3", text: "Include a 1-page executive summary.", critical: false },
      { id: "c4", text: "Include a recommendation section.", critical: true },
      { id: "c5", text: "Include a short walkthrough or demo link.", critical: false },
    ],
    acceptanceCriteriaHash: "0x4cc3pt4nc3cr1t3r14h45h00000000000000000000000000000000000000000",
    status: "funded" as SettlementStatus,
    paymentStatus: "locked" as PaymentStatus,
  };
  state[DEMO_ID] = demo;
  save(state);
  return demo;
}

export function buildPassport(
  settlement: AgentWorkSettlement
): TraceBriefPassport | undefined {
  if (!settlement) return undefined;
  return {
    id: `passport-${settlement.id}`,
    settlementId: settlement.id,
    agent: settlement.agent,
    escrowAmount: settlement.amount,
    paymentStatus: settlement.paymentStatus,
    deliverableBlobId: settlement.deliveryManifest?.blobId || "",
    deliverableManifestHash: settlement.deliveryManifest?.manifestHash || "",
    acceptanceCriteriaHash: settlement.acceptanceCriteriaHash,
    reviewerAttestation: settlement.reviewResult?.attestation,
    reviewScore: settlement.reviewResult?.score,
    reviewReportBlobId: settlement.reviewResult?.reviewReportBlobId,
    createdAt: settlement.createdAt,
    updatedAt: settlement.updatedAt,
  };
}
