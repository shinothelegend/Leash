import { Client, PrivateKey } from "@hiero-ledger/sdk";
import { AgentMode } from "@hashgraph/hedera-agent-kit";
import { allCorePlugins } from "@hashgraph/hedera-agent-kit/plugins";
import { HederaLangchainToolkit } from "@hashgraph/hedera-agent-kit-langchain";
import * as dotenv from "dotenv";
dotenv.config();

const client = Client.forTestnet().setOperator(
  process.env.HEDERA_ACCOUNT_ID || "0.0.12345",
  PrivateKey.fromStringECDSA(process.env.HEDERA_PRIVATE_KEY || "302e020100300506032b6570042204200000000000000000000000000000000000000000000000000000000000000000")
);

const toolkit = new HederaLangchainToolkit({
  client,
  configuration: { plugins: allCorePlugins, context: { mode: AgentMode.AUTONOMOUS } },
});

export { toolkit, client };
