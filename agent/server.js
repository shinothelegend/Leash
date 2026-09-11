import express from "express";
import { x402ResourceServer, HTTPFacilitatorClient } from "@x402/core/server";
import { ExactHederaScheme } from "@x402/hedera/exact/server";
import * as dotenv from "dotenv";
dotenv.config();
const app = express();
const facilitatorClient = new HTTPFacilitatorClient({ url: process.env.FACILITATOR_URL });
const server = new x402ResourceServer(facilitatorClient);
server.register("hedera:*", new ExactHederaScheme());
app.use(server.middleware({
    "/infer": {
        network: "hedera:testnet",
        price: "0.01", // in the settlement token, e.g. USDC/HBAR — tune to stay under the per-tx cap for the demo
        payTo: process.env.VENDOR_ACCOUNT_ID || "0.0.99999",
    },
}));
app.get("/infer", (_req, res) => {
    res.json({ result: "42% probability of rain tomorrow (mock inference result)" });
});
app.listen(4021, () => console.log("x402-gated inference service on :4021"));
