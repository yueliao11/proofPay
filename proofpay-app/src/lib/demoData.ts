import { AgentWorkSettlement, Criterion, DeliveryManifest, ReviewResult, AgentReputation, Agent } from "./types";

export const DEMO_AGENT: Agent = {
  address: "0xresearchbot01a7f3c9d2e8b1a4f6e0d5c7b9a2e4f8d1c3b5a7e9f2d4c6b8a1e3f5d7c9b1a4",
  name: "ResearchBot-01",
};

export const DEMO_CLIENT = "0xclienta1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b";

export const DEMO_CRITERIA: Criterion[] = [
  { id: "c1", text: "Include at least 5 competitor projects.", critical: true },
  { id: "c2", text: "Include a comparison table.", critical: true },
  { id: "c3", text: "Include a 1-page executive summary.", critical: false },
  { id: "c4", text: "Include a recommendation section.", critical: true },
  { id: "c5", text: "Include a short walkthrough or demo link.", critical: false },
];

export const FAILED_DELIVERY_CONTENT = `# Sui Overflow Competitor Analysis

## Executive Summary
This report analyzes the competitive landscape of the Sui Overflow 2026 hackathon, identifying top projects, trends, and strategic recommendations for builders.

## Competitor Projects (6)
1. **NexusPay** — Cross-chain payment intents for AI agents.
2. **SuiFlow** — On-chain work order escrow protocol.
3. **WalrusWrite** — Decentralized research publishing layer.
4. **AgentLedger** — Agent reputation and attestation registry.
5. **DeepBook Prime** — Institutional liquidity routing.
6. **TraceVault** — Verifiable compute proofs on Sui.

## Recommendations
- Focus on verifiable outputs rather than generic infrastructure.
- Use Walrus for data availability proofs.
- Leverage PTB for composable settlement actions.

*Note: A structured comparison table is not included in this version.*
`;

export const CORRECTED_DELIVERY_CONTENT = `# Sui Overflow Competitor Analysis

## Executive Summary
This report analyzes the competitive landscape of the Sui Overflow 2026 hackathon, identifying top projects, trends, and strategic recommendations for builders.

## Competitor Projects (6)
1. **NexusPay** — Cross-chain payment intents for AI agents.
2. **SuiFlow** — On-chain work order escrow protocol.
3. **WalrusWrite** — Decentralized research publishing layer.
4. **AgentLedger** — Agent reputation and attestation registry.
5. **DeepBook Prime** — Institutional liquidity routing.
6. **TraceVault** — Verifiable compute proofs on Sui.

## Comparison Table
| Project | Track | Core Tech | Differentiator |
|---|---|---|---|
| NexusPay | DeFi & Payments | PTB intents | AI agent payments |
| SuiFlow | DeFi & Payments | Escrow objects | Work order primitive |
| WalrusWrite | Special - Walrus | Blob storage | Research publishing |
| AgentLedger | The Agentic Web | Attestations | Reputation registry |
| DeepBook Prime | DeFi & Payments | DeepBook | Liquidity routing |
| TraceVault | Special - Walrus | Proofs | Verifiable compute |

## Recommendations
- Focus on verifiable outputs rather than generic infrastructure.
- Use Walrus for data availability proofs.
- Leverage PTB for composable settlement actions.

## Walkthrough
Demo walkthrough: https://demo.proofpay.io/competitor-analysis
`;

export const FAILED_MANIFEST: DeliveryManifest = {
  fileName: "failed-delivery.md",
  blobId: "0xwalrusfailedbloba1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0",
  manifestHash: "0xfa1ledd3l1v3rym4n1f3sth45h00000000000000000000000000000000000000",
  contentType: "text/markdown",
  summary: "Missing comparison table",
  content: FAILED_DELIVERY_CONTENT,
  createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
};

export const CORRECTED_MANIFEST: DeliveryManifest = {
  fileName: "corrected-delivery.md",
  blobId: "0xwalruscorrectblobb1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1",
  manifestHash: "0xc0rr3ct3dd3l1v3rym4n1f3sth45h0000000000000000000000000000000000",
  contentType: "text/markdown",
  summary: "Includes comparison table and recommendations",
  content: CORRECTED_DELIVERY_CONTENT,
  createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
};

export const FAILED_REVIEW: ReviewResult = {
  settlementId: "demo",
  agent: DEMO_AGENT.name,
  reviewer: "AI Reviewer v0.1",
  score: 60,
  result: "needs_revision",
  paymentRecommendation: "do_not_release",
  checks: [
    { criterion: "at least 5 competitor projects", status: "pass", reason: "The delivery includes 6 competitor projects." },
    { criterion: "comparison table", status: "fail", reason: "The delivery discusses competitors but does not include a structured comparison table." },
    { criterion: "1-page executive summary", status: "pass", reason: "An executive summary is included." },
    { criterion: "recommendation section", status: "pass", reason: "The report includes recommendations for builders." },
    { criterion: "walkthrough or demo link", status: "fail", reason: "No walkthrough or demo link is provided." },
  ],
  attestation: {
    method: "sha256",
    payloadHash: "0xfa1ledr3v13w4tt35t4t10np4yl04dh45h000000000000000000000000000",
    signature: "demo-ai-reviewer-signature-failed",
  },
  reviewReportBlobId: "0xwalrusfailedreviewb1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0",
};

export const PASSING_REVIEW: ReviewResult = {
  settlementId: "demo",
  agent: DEMO_AGENT.name,
  reviewer: "AI Reviewer v0.1",
  score: 92,
  result: "pass",
  paymentRecommendation: "release_payment",
  checks: [
    { criterion: "at least 5 competitor projects", status: "pass", reason: "The delivery includes 6 competitor projects." },
    { criterion: "comparison table", status: "pass", reason: "A structured markdown comparison table is included." },
    { criterion: "1-page executive summary", status: "pass", reason: "An executive summary is included." },
    { criterion: "recommendation section", status: "pass", reason: "The report includes recommendations for builders." },
    { criterion: "walkthrough or demo link", status: "pass", reason: "A demo walkthrough link is provided." },
  ],
  attestation: {
    method: "sha256",
    payloadHash: "0xpass1ngr3v13w4tt35t4t10np4yl04dh45h000000000000000000000000000",
    signature: "demo-ai-reviewer-signature-passed",
  },
  reviewReportBlobId: "0xwalruspassingreviewb1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0",
};

export function makeDemoSettlement(): AgentWorkSettlement {
  return {
    id: "demo",
    client: DEMO_CLIENT,
    agent: DEMO_AGENT,
    amount: 2,
    asset: "SUI",
    title: "Sui Overflow Competitor Analysis",
    description:
      "ResearchBot-01 must produce a competitor analysis of Sui Overflow projects, including top trends, winning patterns, and recommendations for builders.",
    acceptanceCriteria: DEMO_CRITERIA,
    acceptanceCriteriaHash: "0x4cc3pt4nc3cr1t3r14h45h00000000000000000000000000000000000000000",
    status: "funded",
    paymentStatus: "locked",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  };
}

export const DEMO_REPUTATION: AgentReputation = {
  agent: DEMO_AGENT,
  completedSettlements: 0,
  latestWorkQualityScore: 0,
  paymentReleased: false,
  passportVerified: false,
};

export function buildPassingReputation(score: number): AgentReputation {
  return {
    agent: DEMO_AGENT,
    completedSettlements: 1,
    latestWorkQualityScore: score,
    paymentReleased: true,
    passportVerified: true,
  };
}
