import express from "express";
import { x402ResourceServer, HTTPFacilitatorClient } from "@x402/core/server";
import { ExactHederaScheme } from "@x402/hedera/exact/server";
import * as dotenv from "dotenv";
dotenv.config();

import { paymentMiddleware } from "@x402/express";

const app = express();
const facilitatorClient = new HTTPFacilitatorClient({ url: process.env.FACILITATOR_URL! });
const server = new x402ResourceServer(facilitatorClient);
server.register("hedera:*", new ExactHederaScheme({
  defaultAssets: {
    "hedera:testnet": {
      asset: "0.0.10379345",
      decimals: 6
    }
  }
}));

app.use((req, res, next) => {
  console.log("INCOMING REQUEST:", req.method, req.url);
  console.log("HEADERS:", req.headers['payment-signature']);
  next();
});

app.use(
  paymentMiddleware(
    {
      "/infer": {
        accepts: [
          {
            network: "hedera:testnet",
            scheme: "exact",
            price: "0.01",
            payTo: process.env.VENDOR_ACCOUNT_ID || "0.0.99999",
          }
        ]
      },
    },
    server
  )
);

app.get("/infer", (_req, res) => {
  res.json({ result: "42% probability of rain tomorrow (mock inference result)" });
});

app.use((err: any, req: any, res: any, next: any) => {
  console.error("SERVER ERROR:", err);
  res.status(500).json({ error: 'Internal Server Error' });
});

async function start() {
  try {
    await server.initialize();
    app.listen(4021, () => console.log("x402-gated inference service on :4021"));
  } catch (e) {
    console.error("Failed to start server:", e);
    process.exit(1);
  }
}
start();
