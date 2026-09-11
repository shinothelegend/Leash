import {
  Client,
  PrivateKey,
  TokenCreateTransaction,
  AccountId
} from "@hiero-ledger/sdk";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
  const accountId = AccountId.fromString(process.env.HEDERA_ACCOUNT_ID!);
  const privateKey = PrivateKey.fromStringECDSA(process.env.HEDERA_PRIVATE_KEY!);
  
  const client = Client.forTestnet().setOperator(accountId, privateKey);
  
  const tx = await new TokenCreateTransaction()
    .setTokenName("Mock USDC")
    .setTokenSymbol("mUSDC")
    .setTreasuryAccountId(accountId)
    .setInitialSupply(100000000)
    .setDecimals(6)
    .execute(client);
    
  const receipt = await tx.getReceipt(client);
  console.log("Token ID:", receipt.tokenId?.toString());
  
  process.exit(0);
}

main().catch(console.error);
