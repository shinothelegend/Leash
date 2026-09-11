export async function checkPolicyLocally(req: { vendor: string; amountUsd: number }): Promise<"approve" | "escalate" | "reject"> {
  const PER_TX_CAP_USD = 0.5;
  const allowlist = new Set([process.env.VENDOR_ACCOUNT_ID || "0.0.99999"]);
  if (!allowlist.has(req.vendor)) return "escalate";
  if (req.amountUsd > PER_TX_CAP_USD) return "escalate";
  return "approve";
}
