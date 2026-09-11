import {
  Client,
  PrivateKey,
  TokenCreateTransaction,
  AccountId,
  AccountCreateTransaction,
  TokenAssociateTransaction
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
  const tokenId = receipt.tokenId!;
  console.log("Token ID:", tokenId.toString());
  
  // Create a new vendor account
  const vendorKey = PrivateKey.generateECDSA();
  const tx2 = await new AccountCreateTransaction()
    .setKey(vendorKey.publicKey)
    .setInitialBalance(10)
    .execute(client);
  const receipt2 = await tx2.getReceipt(client);
  const vendorId = receipt2.accountId!;
  console.log("Vendor Account ID:", vendorId.toString());
  console.log("Vendor Private Key:", vendorKey.toStringDer());

  // Associate the token with the vendor account
  const associateClient = Client.forTestnet().setOperator(vendorId, vendorKey);
  const tx3 = await new TokenAssociateTransaction()
    .setAccountId(vendorId)
    .setTokenIds([tokenId])
    .execute(associateClient);
  await tx3.getReceipt(associateClient);
  console.log("Token associated with vendor account!");
  
  process.exit(0);
}

main().catch(console.error);
