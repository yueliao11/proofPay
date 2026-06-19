export type SettlementStatus =
  | "funded"
  | "submitted"
  | "needs_revision"
  | "reviewed"
  | "released";

export type PaymentStatus = "locked" | "ready" | "released";

export interface Criterion {
  id: string;
  text: string;
  critical: boolean;
}

export interface Agent {
  address: string;
  name: string;
}

export interface DeliveryManifest {
  fileName: string;
  blobId: string;
  manifestHash: string;
  contentType: string;
  summary: string;
  content: string;
  createdAt: string;
}

export interface ReviewCheck {
  criterion: string;
  status: "pass" | "fail";
  reason: string;
}

export interface ReviewAttestation {
  method: string;
  payloadHash: string;
  signature: string;
}

export interface ReviewResult {
  settlementId: string;
  agent: string;
  reviewer: string;
  score: number;
  result: "pass" | "needs_revision";
  paymentRecommendation: "release_payment" | "do_not_release";
  checks: ReviewCheck[];
  attestation: ReviewAttestation;
  reviewReportBlobId: string;
}

export interface TraceBriefPassport {
  id: string;
  settlementId: string;
  agent: Agent;
  escrowAmount: number;
  paymentStatus: PaymentStatus;
  deliverableBlobId: string;
  deliverableManifestHash: string;
  acceptanceCriteriaHash: string;
  reviewerAttestation?: ReviewAttestation;
  reviewScore?: number;
  reviewReportBlobId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AgentWorkSettlement {
  id: string;
  objectId?: string;
  client: string;
  agent: Agent;
  amount: number;
  asset: string;
  title: string;
  description: string;
  acceptanceCriteria: Criterion[];
  acceptanceCriteriaHash: string;
  status: SettlementStatus;
  paymentStatus: PaymentStatus;
  passportId?: string;
  passportObjectId?: string;
  createdAt: string;
  updatedAt: string;
  deliveryManifest?: DeliveryManifest;
  reviewResult?: ReviewResult;
}

export interface AgentReputation {
  agent: Agent;
  completedSettlements: number;
  latestWorkQualityScore: number;
  paymentReleased: boolean;
  passportVerified: boolean;
}

export type DemoRole = "client" | "agent" | "reviewer" | "judge";
