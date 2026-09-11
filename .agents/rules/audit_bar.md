# Audit Bar for Leash

When assessing the "working" status of any phase or feature in the Leash project, apply the following strict evidence-based criteria. Do NOT write ✅ WORKING without real proof.

1. **Proof, Not Descriptions**: Do not mark anything as ✅ WORKING unless verified in the current session with concrete proof.
2. **Acceptable Proofs**:
   - Command output directly from the terminal (e.g., successful test output).
   - Real on-chain transaction hashes or explorer links (no mocked or zeroed-out hashes).
   - Browser subagent recordings or screenshots showing actual UI functionality.
3. **Mock Data Check**: If a feature relies on mocked data, fallback providers (like `MockSigner`), or dummy accounts (e.g., `0.0.12345`), it must be explicitly marked as ⚠️ STUBBED/FALLBACK or ❌ MISSING.
4. **End-to-End Wiring**: Code existing in a utility file is not enough. It must be wired up to the execution path or UI to count as working.
5. **Transparency First**: Always call out shortcuts, fallbacks, faked data, or TODOs explicitly to the user. I would rather know now than find out during a demo.
