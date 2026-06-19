# ProofPay: Settlement Layer for AI Agent Work

**ProofPay** is a proof-of-delivery settlement protocol for AI agent work.

AI agents can now produce research, code, reports, and designs — but they still lack a native way to prove work quality and get paid after verification. ProofPay solves this by turning locked acceptance criteria, Walrus deliverables, and AI reviewer attestations into Sui payment release conditions.

The result is a **TraceBrief Passport**: a verifiable work receipt that records what the agent delivered, how it was reviewed, why payment was released, and how this contributes to the agent’s reputation.

> **One-line pitch:** Settlement layer for AI agent work.  
> **Memory sentence:** Agents can work. Walrus makes their outputs provable. Sui makes their payments settle.

---

## What ProofPay Is

ProofPay is the settlement layer for AI agent work:

- A **Client** locks payment and acceptance criteria on Sui before work begins.
- An **AI Agent** submits deliverables to Walrus.
- An **AI Reviewer** attests whether the deliverables satisfy the locked criteria.
- Payment is released only when the **TraceBrief Passport** proves the work was accepted.

## Live Testnet Deployment

The ProofPay Move package is deployed on **Sui Testnet**:

- **Package ID:** `0x7130eef3e9d9d2a578ffb8631c44f8b5df5567c17540ad332b5afda7d425c50a`
- **Publish Tx:** `A5tgAxVcVXQycAJyvxQ4CQGXFCnY8wdGgZ2y2wRctpRP`
- **Deployer:** `0xa7110cb126d5553ff02616f9100cb385db200b2368766903b707b4275baa09c7`

The Demo Console displays the live package and lets you connect a demo wallet to walk through the full lifecycle.

## What ProofPay Is Not

| Category | What they do | What ProofPay does differently |
|---|---|---|
| Payment SDK | Secure and verifiable payments | ProofPay adds locked acceptance criteria, deliverable proof, AI review, and conditional release. |
| Escrow Primitive | Basic asset escrow | ProofPay turns escrow into a proof-of-delivery settlement workflow. |
| Evidence / Notary | Prove that data existed | ProofPay uses proof as a payment release condition. |
| Freelance Marketplace | Match clients and workers | ProofPay is not a marketplace; it is an embeddable settlement layer. |
| Agent Workflow | Delegate tasks and capabilities | ProofPay handles settlement after work is delivered and verified. |

---

## Demo Flow

The MVP demonstrates one complete settlement loop:

1. **Create Settlement** — Client locks 2 SUI and acceptance criteria for a *Sui Overflow Competitor Analysis*.
2. **Submit Failed Delivery** — ResearchBot-01 submits a report missing the comparison table.
3. **AI Reviewer Blocks Payment** — Score: 60. Comparison table: failed. Payment remains locked.
4. **Submit Corrected Delivery** — ResearchBot-01 adds the comparison table.
5. **AI Reviewer Approves** — Score: 100. Payment ready to release.
6. **Approve & Release** — Client releases 2 SUI to the agent in one Sui PTB-like action.
7. **Verify TraceBrief Passport** — Third parties verify the verifiable work receipt.
8. **Agent Reputation Updated** — ResearchBot-01 now has a verified work score.

Try it at `/demo` for a guided console, or create a real settlement at `/create`.

---

## Architecture

```
┌─────────────┐     lock payment + criteria     ┌─────────────────────────┐
│   Client    │ ───────────────────────────────▶│  AgentWorkSettlement    │
└─────────────┘                                 │        (Sui object)     │
       │                                        └─────────────────────────┘
       │                                                    │
       │         submit deliverable to Walrus               ▼
       │◀──────────────────────────────────────┐   ┌─────────────────────┐
       │                                         │◀──│  TraceBriefPassport │
       │                                         │   │     (Sui object)    │
       │                                         │   └─────────────────────┘
       │         AI Reviewer attestation         │
       │◀──────────────────────────────────────┤
       │                                         │
       │         approve & release payment       │
       │ ───────────────────────────────────────▶│
       │                                         │
       ▼                                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         Payment Released + Reputation Updated        │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Why Sui

- **AgentWorkSettlement** and **TraceBriefPassport** are native Sui objects.
- **Move** enforces settlement state transitions and access controls.
- **PTB** (Programmable Transaction Blocks) let `approve_and_release` feel like a single user action while verifying review state, releasing escrow, updating the settlement object, and emitting events atomically.
- The **object-centric model** makes future invoice, reputation, and receivable primitives natural extensions.

## Why Walrus

- Agent outputs are stored as verifiable Walrus blobs.
- AI review reports are stored as verifiable Walrus blobs.
- The **TraceBrief Passport** references blob IDs and hashes.
- Payment release depends on verifiable delivery data, not just on-chain metadata.

---

## Repository Structure

```
/Volumes/extdisk/project/sui/proofPay
├── README.md                      # This file
├── proofpay-app/                  # Next.js frontend
│   ├── src/
│   │   ├── app/                   # App Router pages
│   │   │   ├── page.tsx           # Landing page
│   │   │   ├── create/page.tsx    # Create settlement
│   │   │   ├── settlements/[id]/page.tsx   # Settlement detail
│   │   │   ├── submit/[id]/page.tsx        # Submit delivery proof
│   │   │   ├── reviewer/[id]/page.tsx      # AI reviewer panel
│   │   │   ├── verify/page.tsx             # Verify TraceBrief Passport
│   │   │   └── demo/page.tsx               # Demo console
│   │   ├── components/            # UI components
│   │   └── lib/                   # Types, demo data, reviewer, Sui helpers
│   └── package.json
├── move/proofpay/                 # Sui Move contracts
│   ├── Move.toml
│   ├── sources/proofpay.move
│   └── sources/proofpay_tests.move
├── pitch/                         # Roadshow PPT + pitch video assets
└── awesome-design-md/             # Design system reference (cloned)
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm or pnpm
- Sui CLI (`sui`) for Move contract build/test

### Frontend

```bash
cd proofpay-app
npm install
npm run dev
```

Open http://localhost:3000.

### Move Contracts

```bash
cd move/proofpay
sui move build
sui move test
```

---

## Roadmap

### V1
- USDC payments
- Full revision workflow
- Dispute workflow
- Multiple milestones

### V2
- zkLogin onboarding
- Agent reputation registry
- Passport Display metadata
- Multi-reviewer attestation

### V3
- Agent marketplace integrations
- Receivable objects
- Invoice financing
- DeepBook-based secondary liquidity for settlement claims

---

## Tracks & Narrative

- **Main track:** DeFi & Payments
- **Hot narratives:** AI Agent economy, Agent-to-Agent services, Verifiable AI outputs, Proof-of-delivery, Object-based settlement, Sui payment rails, Walrus verifiable data, AI reviewer attestation, Agent reputation

---

## License

MIT
