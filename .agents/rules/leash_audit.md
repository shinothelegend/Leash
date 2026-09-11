---
name: Leash Audit Rule
description: Enforces strict criteria for marking a task as "Working" vs "Stubbed" or "Missing" during the Leash build process.
---

# Leash Build Audit Standards

When evaluating the Definition of Done for any phase in the Leash project, you must enforce a strict, evidence-based bar:

- **✅ WORKING**: Only if you can explicitly verify it in the current session.
  - *Contracts*: Must have a real deployed address and return a real transaction hash.
  - *Web UI*: Must be interactive and wired to actual state (Wagmi, Subgraph, etc), verified via browser subagent interaction.
  - *Subgraph*: Must be deployed and responding to live GraphQL queries.
- **⚠️ STUBBED/FALLBACK**: The code exists (e.g. `ledger.ts` DMK logic) or a mock was used (e.g. `MockV3Aggregator`), but it is not wired end-to-end or lacks real credentials/interaction.
- **❌ MISSING**: The code/feature does not exist, was never run, or failed to compile/deploy entirely.

**CRITICAL**: Do NOT rely on static code analysis to claim a feature is "WORKING". Do not hallucinate transaction hashes or assume a UI works just because the React component compiles. You must seek undeniable runtime proof (command output, on-chain tx hashes, browser recordings).
