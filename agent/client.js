import { wrapFetchWithPayment } from "@x402/fetch";
import { x402Client, x402HTTPClient } from "@x402/core/client";
import { ExactHederaScheme } from "@x402/hedera/exact/client";
import { createClientHederaSigner, PrivateKey } from "@x402/hedera";
import { checkPolicyLocally } from "./policy";
import * as dotenv from "dotenv";
dotenv.config();
async function main() {
    const hederaSigner = createClientHederaSigner(process.env.HEDERA_ACCOUNT_ID || "0.0.12345", PrivateKey.fromStringECDSA(process.env.HEDERA_PRIVATE_KEY || "302e020100300506032b6570042204200000000000000000000000000000000000000000000000000000000000000000"), { network: "hedera:testnet" });
    const client = new x402Client().register("hedera:*", new ExactHederaScheme(hederaSigner));
    const fetchWithPayment = wrapFetchWithPayment(fetch, client);
    const httpClient = new x402HTTPClient(client);
    const vendor = process.env.VENDOR_ACCOUNT_ID || "0.0.99999";
    const decision = await checkPolicyLocally({ vendor, amountUsd: 0.01 });
    if (decision === "reject") {
        console.log("❌ Blocked locally by policy — not even attempting payment.");
        return;
    }
    const response = await fetchWithPayment("http://localhost:4021/infer", { method: "GET" });
    const data = await response.json();
    const settlement = httpClient.getPaymentSettleResponse((name) => response.headers.get(name));
    console.log("Result:", data);
    if (settlement)
        console.log("Settled on-chain:", settlement.transaction);
}
main().catch(console.error);
