# Leash — Autonomous Hardware-Verified Spending Firewall

**Leash** is a next-generation autonomous AI spending firewall built on the Hedera network, utilizing x402 protocol, Chainlink Data Feeds, and Ledger Device Management Kit (DMK). 

This project was built entirely autonomously as a demonstration for ETHGlobal ETHOnline 2026.

## Architecture

Leash is composed of four main pillars:

1. **Smart Contracts (Solidity & Hardhat)**
   - `PolicyVault.sol`: A smart contract that holds funds and enforces spending policies.
   - Integrating Chainlink Price Feeds (e.g. HBAR/USD) to ensure policy checks (e.g. daily caps, per-transaction limits) are evaluated accurately in USD rather than volatile native token amounts.

### Chainlink price feed note
Chainlink does not publish an on-chain HBAR/USD Data Feed on Hedera **testnet**
(only Data Streams, plus Data Feeds on Hedera **mainnet**). Since Leash is deployed
on Hedera testnet, PolicyVault reads a `MockV3Aggregator` that implements the standard
`AggregatorV3Interface`, seeded with a realistic HBAR/USD price. The USD-pegged cap
logic is identical to production — only the price source is mocked. To run against the
real feed, deploy on Hedera mainnet and set `HBAR_USD_FEED_ADDRESS` to the mainnet
HBAR/USD proxy from data.chain.link.

2. **Autonomous Agent (Agent Kit & Langchain)**
   - Agent logic built with `@hashgraph/hedera-agent-kit`.
   - The agent operates a local server that evaluates off-chain logic and decides whether to approve, reject, or escalate a transaction.

3. **Reputation Subgraph (The Graph)**
   - An immutable event-sourcing layer tracking Vendor reputation over time.
   - It captures `PaymentApproved`, `PaymentEscalated`, `PaymentRejected`, and `PaymentReleased` events to compute a dynamic reputation score, influencing the AI agent's strictness.

4. **Web Dashboard & Hardware Escalation (Next.js & Ledger DMK)**
   - A modern React dashboard built with Next.js, displaying live pending escalations and policies.
   - Hardware-enforced transaction signing via `@ledgerhq/device-management-kit` for any escalated transactions requiring human oversight.

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

3. **Smart Contracts**
   ```bash
   npx hardhat compile
   npx hardhat run scripts/deploy.ts --network hederaTestnet
   ```

4. **Subgraph**
   Ensure you have The Graph CLI installed, then:
   ```bash
   cd subgraph
   npm run codegen
   npm run build
   ```

5. **Run Dashboard**
   ```bash
   cd web
   npm run dev
   ```

6. **Run Agent**
   ```bash
   npm run agent
   ```
