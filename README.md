<div align="center">

<h1>Leash</h1>

**An Autonomous Hardware-Verified Spending Firewall.**
A next-generation firewall built on the **Hedera network**, utilizing the **[x402](https://x402.org)** protocol, **Chainlink Data Feeds**, and the **Ledger** Device Management Kit (DMK). Built for **ETHGlobal ETHOnline 2026**.

[![x402](https://img.shields.io/badge/x402-v2-7C5CFF?style=flat-square)](https://x402.org)
[![Hedera](https://img.shields.io/badge/Hedera-testnet-3DDCFF?style=flat-square)](https://hashscan.io/testnet)
[![License](https://img.shields.io/badge/license-MIT-50F0C8?style=flat-square)](LICENSE)

</div>

<div align="center">

**[Dashboard Placeholder]** · **[Contract](https://hashscan.io/testnet/contract/0xD5BBD98D03Fa1B1DdD2D944E251cbE02F5eedcdC)**

**▶ [Watch the trailer](videos/leash-launch/renders/video.mp4)** — 60 seconds

</div>

---

## For judges — verify in three commands

```bash
npm install && npm run build && npm test
```

Then the live proof, all on Hedera testnet and all openly readable:

| What | Where |
|---|---|
| The `PolicyVault` Smart Contract | [`0xD5BBD98D03Fa1B1DdD2D944E251cbE02F5eedcdC`](https://hashscan.io/testnet/contract/0xD5BBD98D03Fa1B1DdD2D944E251cbE02F5eedcdC) |
| A real x402 Settlement | [`0.0.7162784@1789114603.955176995`](https://hashscan.io/testnet/transaction/0.0.7162784-1789114603-955176995) |

### What is proven, and what isn't

| | |
|---|---|
| ✅ **Hedera Smart Contracts** | `PolicyVault.sol` holds funds and enforces spending policies on testnet. |
| ✅ **x402 Settlement** | A real x402 settlement transaction hash is provided. |
| ✅ **Web Dashboard** | A modern Next.js React dashboard using `wagmi` to read live pending escalations and policies directly from the contract. |
| ✅ **Agent Logic Initialization** | Built with `@hashgraph/hedera-agent-kit`. |
| 🚧 **Chainlink Price Feed** | Chainlink doesn't publish HBAR/USD on Hedera testnet. We use a `MockV3Aggregator` with identical pegging logic to production. |
| 🚧 **Reputation Oracle (The Graph)** | Subgraph written but not deployed due to missing keys. UI uses an on-chain fallback calculation reading directly from the contract. |
| 🚧 **Ledger Hardware Signing** | `@ledgerhq/device-management-kit` is fully scaffolded, but due to lack of a physical device, the "Approve & Release" flow writes to the contract via a browser wallet. |
| 🚧 **Autonomous Agent Loop** | Toolkit is initialized but the autonomous loop is minimal for the demo. |

---

## The trailer

**[videos/leash-launch/renders/video.mp4](videos/leash-launch/renders/video.mp4)** — A brief overview of Leash in action.

---

## Setup Instructions

**1. Install Dependencies**
```bash
npm install
```

**2. Configure Environment**
Copy `.env.example` to `.env` and fill in your details:
- Hedera Testnet Account ID and Private Key (from [Hedera Portal](https://portal.hedera.com))
- Chainlink HBAR/USD Feed address (Testnet)
- OpenAI API Key

**3. Run Dashboard**
```bash
cd web
npm run dev
```

**4. Run Agent**
```bash
npm run agent
```
