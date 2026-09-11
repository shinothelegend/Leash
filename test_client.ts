import { x402Client } from "@x402/core/client";
import { ExactHederaScheme } from "@x402/hedera/exact/client";
import { createClientHederaSigner, PrivateKey } from "@x402/hedera";
import * as dotenv from "dotenv";
dotenv.config();

const hederaSigner = createClientHederaSigner(
  process.env.HEDERA_ACCOUNT_ID || "0.0.12345",
  PrivateKey.fromStringECDSA(process.env.HEDERA_PRIVATE_KEY!),
  { network: "hedera:testnet" }
);
const client = new x402Client().register("hedera:*", new ExactHederaScheme(hederaSigner));

const required = {"x402Version":2,"error":"Payment required","resource":{"url":"http://localhost:4021/infer","description":"","mimeType":""},"accepts":[{"scheme":"exact","network":"hedera:testnet","amount":"10000","asset":"0.0.429274","payTo":"0.0.999999","maxTimeoutSeconds":300,"extra":{"feePayer":"0.0.7162784"}}]};

import { x402HTTPClient } from "@x402/core/client";

client.createPaymentPayload(required).then(async payload => {
  const httpClient = new x402HTTPClient(client);
  const signature = httpClient.encodePaymentSignatureHeader(payload);
  
  const res = await fetch("http://localhost:4021/infer", {
    headers: signature
  });
  console.log("STATUS:", res.status);
  console.log("HEADERS:", Object.fromEntries(res.headers.entries()));
  console.log("BODY:", await res.text());
}).catch(console.error);
