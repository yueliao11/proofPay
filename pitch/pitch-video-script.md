# ProofPay Pitch Video Script

## Narrated Version (used in `proofpay-pitch-narrated.mp4`)

Duration: ~71 seconds. Voice: macOS Samantha TTS.

```
[0:00] AI agents can do real work now. Research, code, reports, designs. But here's the problem: how do we verify the work and release payment safely?

[0:10] ProofPay is the settlement layer for AI agent work. A client locks payment and acceptance criteria on Sui before the agent starts.

[0:18] Meet ResearchBot-01. Its job: produce a Sui Overflow competitor analysis, with a budget of two SUI.

[0:25] ResearchBot submits its first delivery to Walrus. But the AI reviewer finds the comparison table missing. Score: sixty. Payment remains locked.

[0:35] The agent submits a corrected version with the comparison table. This time, the AI reviewer gives a score of ninety-two. Payment is ready to release.

[0:44] The client approves. In one Sui PTB, escrow releases, the settlement updates, and the event is emitted.

[0:51] The TraceBrief Passport is now verified. It records the settlement, the Walrus deliverable proof, the reviewer attestation, and the agent's latest work score. This becomes the agent's reputation.

[1:03] ProofPay is not a marketplace, not static storage, and not just escrow. It is proof-of-delivery settlement for AI agent work on Sui and Walrus.
```

## Extended English Version (3 minutes)

**[0:00-0:18] Hook — The missing layer**

> AI agents can now do real work — research, code, reports, and designs. But the agent economy still lacks one critical layer: how do we verify the work and release payment safely?

Visual: Landing page hero with headline "Settlement layer for AI agent work."

**[0:18-0:40] Problem — Work without settlement**

> Today, if an AI agent delivers a report, the client has to trust that the output is good before paying. If the output is bad, the money is already gone. There is no native settlement layer that checks delivery quality before releasing funds.

Visual: Three cards — Agents can work / Work must be verified / Verified work gets paid.

**[0:40-1:05] Solution — ProofPay**

> This is ProofPay, a settlement layer for AI agent work. A client creates an Agent Work Settlement on Sui and locks the payment. The acceptance criteria are hashed before the agent starts working. The agent only gets paid if the delivery meets those criteria.

Visual: Create Settlement page, form pre-filled with Sui Overflow Competitor Analysis, 2 SUI budget.

**[1:05-1:30] Delivery & Failure — Payment stays locked**

> ResearchBot-01 submits its first delivery to Walrus. Walrus makes the agent output provable and referenceable inside the TraceBrief Passport. But the AI Reviewer finds the comparison table is missing. The Agent Work Quality Score is 60. Payment remains locked.

Visual: Submit Delivery Proof page with failed delivery, then AI Reviewer Panel showing score 60, comparison table failed, payment locked.

**[1:30-1:55] Correction & Approval — Payment released**

> ResearchBot-01 submits a corrected delivery. This time, the comparison table is included. The AI Reviewer gives a score of 92 and attaches a reviewer attestation stored on Walrus.

Visual: Submit corrected delivery, AI Reviewer Panel showing score 92, all criteria passed, payment ready.

**[1:55-2:15] Settlement — One atomic action**

> Now the client approves the settlement. ProofPay uses a Sui PTB to verify review state, release escrow, update the settlement object, and emit a settlement event in one user action.

Visual: Settlement Detail page with Approve & Release button, then status changes to Released.

**[2:15-2:40] Passport — Verifiable reputation**

> The TraceBrief Passport is now verified. It shows the settlement amount, Walrus deliverable proof, acceptance criteria hash, reviewer attestation, payment status, and the agent’s latest work score. This is not static proof storage. It is a verifiable work receipt that becomes the agent’s reputation.

Visual: TraceBrief Passport Verify page with verified badge, evidence chain, agent reputation updated.

**[2:40-3:00] Closing — What ProofPay is**

> ProofPay is not a marketplace, not static proof storage, and not just escrow. It is proof-of-delivery settlement for AI agent work on Sui and Walrus. Agents can work. Walrus makes their outputs provable. Sui makes their payments settle.

Visual: Landing page closing, badges, tagline.

---

## 中文版本（3 分钟）

**[0:00-0:18] 开场 — 缺失的层**

> AI Agent 已经能做真实工作：写报告、做研究、生成代码和设计方案。但 Agent 经济还缺一个关键层：Agent 做完工作后，如何证明它达标？如何安全触发付款？

画面：Landing Page 主标题“Settlement layer for AI agent work.”

**[0:18-0:40] 问题 — 工作没有结算层**

> 今天，如果 AI Agent 交付一份报告，客户只能在付款前相信它的质量。如果输出不达标，钱已经付出去了。目前没有一个原生结算层能在放款前检查交付质量。

画面：三张价值卡。

**[0:40-1:05] 解决方案 — ProofPay**

> 这就是 ProofPay，AI Agent 工作结算层。客户在 Sui 上创建 Agent Work Settlement 并锁定付款。验收标准在 Agent 开工前就被哈希锁定。Agent 只有交付达标才能拿到钱。

画面：Create Settlement 页面，预填 Sui Overflow 竞品分析、2 SUI 预算。

**[1:05-1:30] 交付失败 — 付款保持锁定**

> ResearchBot-01 第一次把报告提交到 Walrus。Walrus 让 Agent 输出可验证、可引用，并写入 TraceBrief Passport。但 AI Reviewer 发现缺少 comparison table。Agent Work Quality Score 是 60。付款保持锁定。

画面：Submit Delivery Proof 选择失败交付，AI Reviewer Panel 显示 60 分、comparison table 失败、payment locked。

**[1:30-1:55] 修正与通过 — 准备放款**

> ResearchBot-01 提交修正版，加入了 comparison table。AI Reviewer 给出 92 分，并把审核证明存到 Walrus。

画面：提交修正交付，AI Reviewer Panel 显示 92 分、全部通过、payment ready。

**[1:55-2:15] 结算 — 一个原子动作**

> 现在客户点击 Approve & Release。ProofPay 使用 Sui PTB，在一个用户动作里完成：验证审核状态、释放托管资金、更新 Settlement 对象、发出结算事件。

画面：Settlement Detail 页面点击 Approve & Release，状态变为 Released。

**[2:15-2:40] 护照 — 可验证声誉**

> TraceBrief Passport 现在已验证。它显示结算金额、Walrus 交付证明、验收标准哈希、审核证明、付款状态，以及 Agent 最新工作分数。这不是静态存证，而是 Agent 的可验证工作收据，最终沉淀为 Agent 的声誉。

画面：TraceBrief Passport Verify 页面，verified badge、证据链、Agent reputation 更新。

**[2:40-3:00] 收尾 — ProofPay 是什么**

> ProofPay 不是自由职业平台，不是静态存证，也不只是 escrow。它是 Sui 和 Walrus 上的 AI Agent 工作交付证明结算层。Agent 能工作，Walrus 让交付可验证，Sui 让付款可结算。

画面：Landing Page 结尾、tagline、赛道 badges。

---

## Recording Notes

- Target length: narrated version ~71 seconds; extended version 3 minutes.
- Aspect ratio: 16:9, 1280x720.
- Voice: calm, technical, confident.
- Pacing: pause on each score reveal and status change.
- Key soundbites: "Payment remains locked," "Score 92," "TraceBrief Passport verified."
