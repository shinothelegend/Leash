# Leash — Autonomous Hardware-Verified Spending Firewall

**Leash** is a next-generation autonomous AI spending firewall built on the Hedera network, utilizing the x402 protocol, Chainlink Data Feeds, and the Ledger Device Management Kit (DMK). 

This project was built entirely autonomously as a demonstration for ETHGlobal ETHOnline 2026.

## Live Demo & Proof of Work
- **Contract Address (Hedera Testnet):** `0xD5BBD98D03Fa1B1DdD2D944E251cbE02F5eedcdC` 
  - [View on HashScan](https://hashscan.io/testnet/contract/0xD5BBD98D03Fa1B1DdD2D944E251cbE02F5eedcdC)
- **Real x402 Settlement TX Hash:** `0.0.7162784@1789114603.955176995`

## Architecture & Current Limitations

Leash is composed of four main pillars, with the following demo-specific constraints:

1. **Smart Contracts (Solidity & Hardhat)**
   - `PolicyVault.sol`: A smart contract that holds funds and enforces spending policies.
   - **Limitation (Chainlink Price Feed):** Chainlink does not publish an on-chain HBAR/USD Data Feed on Hedera **testnet** (only Data Streams, plus Data Feeds on Hedera mainnet). Since Leash is deployed on Hedera testnet, PolicyVault reads a `MockV3Aggregator` seeded with a realistic HBAR/USD price. The USD-pegged cap logic is identical to production — only the price source is mocked. 

2. **Autonomous Agent (Agent Kit & Langchain)**
   - Agent logic built with `@hashgraph/hedera-agent-kit`.
   - **Limitation (Agent Loop):** The Agent Kit toolkit is initialized but the autonomous agent loop is minimal for this demo.

3. **Reputation Oracle (The Graph)**
   - **Limitation (Subgraph Deployment):** The subgraph `schema.graphql` and `mapping.ts` are fully written but could not be deployed to Subgraph Studio due to missing deployment keys in the environment. The UI `/reputation` page uses an **on-chain fallback calculation** reading directly from the `PolicyVault` contract to calculate real reputation scores instead of querying a deployed subgraph.

4. **Web Dashboard & Hardware Escalation (Next.js & Ledger DMK)**
   - A modern React dashboard built with Next.js, displaying live pending escalations and policies directly from the Hedera testnet contract via `wagmi`.
   - **Limitation (Ledger Hardware Signing):** The `@ledgerhq/device-management-kit` integration is fully scaffolded in `web/src/lib/ledger.ts`, but since we lack a physical Ledger device for the demo, the "Approve & Release" flow in the UI simply writes to the smart contract via your connected browser wallet.

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   Copy `.env.example` to `.env` and fill in your details:
   - Hedera Testnet Account ID and Private Key (from [Hedera Portal](https://portal.hedera.com))
   - Chainlink HBAR/USD Feed address (Testnet)
   - OpenAI API Key

3. **Run Dashboard**
   ```bash
   cd web
   npm run dev
   ```

4. **Run Agent**
   ```bash
   npm run agent
   ```
