---
name: error-fix-loop
description: Ensure every file created or edited is immediately verified by running its respective command (compile, test, lint, etc.) and handle any resulting errors up to 5 times. Use Fallback Matrix if necessary. Keep BUILD_LOG.md updated.
---

## 1.1 The Error-Fix Loop

After you write or edit any file that is meant to compile/run/test (contract, script,
server route, subgraph mapping, frontend component), you MUST immediately:

1. **Run the relevant command** for that file (compile, build, unit test, lint, or a dry
   run — whichever applies). Never leave a file "written but unverified."
2. **If it succeeds:** append one line to `BUILD_LOG.md` (`✅ <phase> — <file> — <what ran>`)
   and move to the next step.
3. **If it fails:**
   a. Read the **entire** error output, not just the first line or the summary.
   b. Classify the failure against the **Known Pitfalls table** first — most
      failures in this stack are pre-diagnosed there (wrong package name, wrong network
      config, deprecated API, missing env var).
   c. If it matches a known pitfall, apply the documented fix directly.
   d. If it doesn't match a known pitfall, diagnose from first principles: is this a
      dependency/version mismatch, an import path error, a wrong chain ID / RPC URL, an
      ABI/interface mismatch, a missing or malformed env var, a type error, or a logic
      error? Fix the most specific layer first.
   e. Re-run the same command. Repeat this loop **up to 5 attempts** for the same error.
   f. **If still failing after 5 attempts:** do NOT get stuck in a longer loop and do NOT
      silently delete the feature. Instead, apply the matching row from the **Fallback
      Matrix**, clearly mark the code with a comment
      `// FALLBACK USED: <reason> — see BUILD_LOG.md`, and continue to the next step so
      the rest of the build isn't blocked.
4. **Always** append a line to `BUILD_LOG.md` for every fix or fallback:
   `⚠️ <phase> — <file> — error: <one-line summary> — fix/fallback: <what you did> — attempts: <n>`
5. **Never** end a phase with code that doesn't compile. If Section 7's Definition of Done
   for a phase can't be met even after fallbacks, mark it `⛔ BLOCKED` in `BUILD_LOG.md`
   with the reason, and move to the next phase anyway.
