import { wrapFetchWithPayment } from "@x402/fetch";
import { x402Client, x402HTTPClient } from "@x402/core/client";
import { ExactHederaScheme } from "@x402/hedera/exact/client";
import { createClientHederaSigner, PrivateKey } from "@x402/hedera";
import { checkPolicyLocally } from "./policy";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
  const hederaSigner = createClientHederaSigner(
    process.env.HEDERA_ACCOUNT_ID || "0.0.12345",
    PrivateKey.fromStringECDSA(process.env.HEDERA_PRIVATE_KEY || "302e020100300506032b6570042204200000000000000000000000000000000000000000000000000000000000000000"),
    { network: "hedera:testnet" }
  );
  const client = new x402Client()
    .setSpendControls(false)
    .register("hedera:*", new ExactHederaScheme(hederaSigner, {
      defaultAssets: {
        "hedera:testnet": {
          asset: "0.0.10379345",
          decimals: 6
        }
      }
    }));
  const fetchWithPayment = wrapFetchWithPayment(fetch, client);
  const httpClient = new x402HTTPClient(client);

  const isSmall = process.argv.includes("--small");
  const amountUsd = isSmall ? 0.01 : (process.env.AMOUNT_USD ? parseFloat(process.env.AMOUNT_USD) : 1.00);

  const vendor = process.env.VENDOR_ACCOUNT_ID || "0.0.99999";
  const decision = await checkPolicyLocally({ vendor, amountUsd });
  if (decision === "reject") {
    console.log("❌ Blocked locally by policy — not even attempting payment.");
    return;
  }
  if (decision === "escalate") {
    console.log(`⚠️ Payment of $${amountUsd.toFixed(2)} exceeds policy per-tx cap. Escalated and held for Ledger approval.`);
    return;
  }

  console.log(`✅ Policy check passed for $${amountUsd.toFixed(2)}. Sending x402 payment...`);

  const response = await fetchWithPayment("http://localhost:4021/infer", { method: "GET" });
  console.log("Status:", response.status, response.statusText);
  if (response.status === 402) {
    console.log("HEADERS:", Object.fromEntries(response.headers.entries()));
  }
  try {
    const data = await response.json();
    console.log("Result:", JSON.stringify(data, null, 2));
  } catch (e) {
    console.log("Could not parse response json");
  }
  try {
    const settlement = httpClient.getPaymentSettleResponse((name) => response.headers.get(name));
    if (settlement) console.log("Settled on-chain:", settlement.transaction);
  } catch (e: any) {
    console.error("No payment settled:", e.message);
  }
}
main().catch(console.error);
