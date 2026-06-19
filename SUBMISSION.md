# ProofPay — Sui Overflow 2026 Submission Package

> 本文件按 Sui Overflow 2026 项目提交表单的字段整理，可直接复制到表单中。标有 `[TODO]` 的字段需要你来补充。

---

## 1. Basic Information

### Project Name
**ProofPay**

> 可替换为带副标题的版本：`ProofPay: Settlement Layer for AI Agent Work`

---

### Short Description（建议 1-2 句话）

ProofPay is a proof-of-delivery settlement protocol for AI agent work. Clients lock payment and acceptance criteria on Sui, agents submit deliverables to Walrus, AI reviewers attest quality, and payment is released only when the TraceBrief Passport proves the work was accepted.

---

### Full Description（可使用表单提供的加粗/列表/代码等格式）

**ProofPay** is the settlement layer for AI agent work.

AI agents can now produce research, code, reports, and designs — but they still lack a native way to prove work quality and get paid after verification. ProofPay solves this by turning locked acceptance criteria, Walrus deliverables, and AI reviewer attestations into Sui payment release conditions.

The result is a **TraceBrief Passport**: a verifiable work receipt that records what the agent delivered, how it was reviewed, why payment was released, and how this contributes to the agent's reputation.

**Demo flow:**
- Client creates an Agent Work Settlement and locks 2 SUI with acceptance criteria.
- AI Agent submits a delivery to Walrus.
- AI Reviewer scores the delivery; payment stays locked if criteria fail.
- Agent submits a corrected delivery; reviewer approves.
- Client approves and releases payment in one Sui PTB.
- Third parties verify the TraceBrief Passport and the agent's updated reputation.

**Why Sui & Walrus:**
- Native Sui objects for settlements and passports.
- Move enforces state transitions and access controls.
- PTBs make `approve_and_release` a single atomic action.
- Walrus stores agent outputs and review attestations as verifiable blobs.

**One-line pitch:** Settlement layer for AI agent work.  
**Memory sentence:** Agents can work. Walrus makes their outputs provable. Sui makes their payments settle.

---

### Track

**DeFi & Payments**

> 已确认选择该赛道。如果 Sui Overflow 2026 表单中没有这个精确选项，请选择最接近的支付/DeFi 相关赛道。

---

### Deployment Network

**Package ID:** `0x7130eef3e9d9d2a578ffb8631c44f8b5df5567c17540ad332b5afda7d425c50a`

**Network:** Sui Testnet

**Publish Tx Digest:** `A5tgAxVcVXQycAJyvxQ4CQGXFCnY8wdGgZ2y2wRctpRP`

**Deployer:** `0xa7110cb126d5553ff02616f9100cb385db200b2368766903b707b4275baa09c7`

---

### Public Projects Page

☑ This project will appear on the public projects page — 建议勾选，增加曝光。

---

## 2. Team

- bright jack
- poc / @bright

> 请在表单中搜索以上用户名并添加。如果 Sui Overflow 用户名格式不同（例如只需要 `@bright`），请按平台要求调整。

---

## 3. Links

### Project Repo*
https://github.com/yueliao11/proofPay

---

### Website

**https://proofpay.pages.dev/**

> 已通过 Cloudflare Pages 部署。备用首次部署地址：https://19067424.proofpay.pages.dev/
>
> 本地运行备用：
> ```bash
> cd proofpay-app
> npm install
> npm run dev
> ```

---

### Demo Video*
`[TODO]` 需要将 pitch 视频上传到 YouTube 后填写公开链接。

可用视频文件（位于本地 `pitch/`）：
- **推荐：** `pitch/proofpay-pitch-hybrid.mp4` — 107 秒，PPT + 真实 Demo 录屏 + 配音
- 备选：`pitch/proofpay-pitch-edge-tts.mp4` — 111 秒，纯 PPT 配音版
- 备选：`pitch/proofpay-pitch-narrated.mp4` — 71 秒，Demo 配音版

上传后填写：
```
https://youtube.com/watch?v=...
```

> 你已选择「我已上传到 YouTube」，请把公开链接填入此处。目前保留为 TODO，提交前必须补充。

---

### Additional Links（可选）

可添加：
- Pitch Deck: `pitch/pitch-deck.html`（repo 内，浏览器直接打开）
- Pitch Script: `pitch/pitch-video-script.md`

---

## 4. Media

建议上传以下图片，帮助评审理解项目（已整理到 `submission/media/`）：

1. `01-landing.png` — Landing page，展示项目定位
2. `02-create.png` — 创建 Settlement，锁定付款与验收标准
3. `03-demo-created.png` — Settlement 创建成功
4. `04-demo-failed-delivery.png` — 第一次交付失败
5. `05-demo-failed-review.png` — AI Reviewer 拒绝，付款锁定
6. `06-demo-corrected-delivery.png` — 修正后重新交付
7. `07-demo-passing-review.png` — AI Reviewer 通过
8. `08-demo-released.png` — 客户放款成功
9. `09-demo-passport.png` — TraceBrief Passport 详情
10. `10-verify-page.png` — 第三方验证页面
11. `architecture.png` — 架构图（如可用 README 中的 ASCII 图重绘）

---

## 5. 提交前检查清单

- [x] 确认赛道：DeFi & Payments
- [x] 确认团队成员用户名：bright jack、@bright
- [ ] 填写 Demo Video YouTube 链接
- [x] Website：https://proofpay.pages.dev/
- [ ] 上传 Media 图片到提交表单
- [x] Repo 链接：`https://github.com/yueliao11/proofPay`

---

## 6. 快速参考数据

| 字段 | 值 |
|---|---|
| 项目名 | ProofPay |
| 一句话定位 | Settlement layer for AI agent work |
| 赛道 | DeFi & Payments |
| 部署网络 | Sui Testnet |
| Package ID | `0x7130eef3e9d9d2a578ffb8631c44f8b5df5567c17540ad332b5afda7d425c50a` |
| Publish Tx | `A5tgAxVcVXQycAJyvxQ4CQGXFCnY8wdGgZ2y2wRctpRP` |
| Repo | https://github.com/yueliao11/proofPay |
| 合约目录 | `move/proofpay/` |
| 前端目录 | `proofpay-app/` |
| 线上 Demo | https://proofpay.pages.dev/ |
| Pitch 目录 | `pitch/` |
