import { ethers } from "ethers";
import * as fs from "fs";
import * as dotenv from "dotenv";
dotenv.config();

const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.HEDERA_RPC_URL || "https://testnet.hashio.io/api");
  const wallet = new ethers.Wallet(process.env.HEDERA_PRIVATE_KEY!, provider);

  const addresses = JSON.parse(fs.readFileSync("deployed-addresses.json", "utf-8"));
  const vaultAddress = addresses.vault;
  const vaultArtifact = JSON.parse(fs.readFileSync("./artifacts/contracts/PolicyVault.sol/PolicyVault.json", "utf-8"));
  const vault = new ethers.Contract(vaultAddress, vaultArtifact.abi, wallet);

  console.log(`Connecting to PolicyVault at ${vaultAddress}...`);

  // Fund Vault with 10 HBAR if needed
  let balance = await provider.getBalance(vaultAddress);
  console.log(`Current Vault Balance: ${ethers.formatEther(balance)} HBAR`);
  if (balance < ethers.parseEther("10.0")) {
    console.log("Funding Vault with 10 HBAR...");
    const fundTx = await wallet.sendTransaction({ to: vaultAddress, value: ethers.parseEther("10.0") });
    await fundTx.wait();
    console.log(`Funded Vault Tx: ${fundTx.hash}`);
    await sleep(3000); // wait for state sync
  }

  const vendor = "0x00000000000000000000000000000000009fb03c";
  console.log(`Allowlisting vendor ${vendor}...`);
  const allowTx = await vault.setVendorAllowed(vendor, true);
  await allowTx.wait();
  await sleep(2000);

  // Request 5 HBAR ($0.75 USD > $0.50 per-tx cap -> Escalates!)
  const amountWei = ethers.parseEther("5.0");
  console.log("Requesting payment of 5 HBAR ($0.75 USD, exceeds $0.50 cap)...");
  
  const reqTx = await vault.requestPayment(vendor, amountWei, "GPT-4o Inference Batch");
  await reqTx.wait();
  console.log(`Escalation Tx Hash: ${reqTx.hash}`);
  await sleep(3000);

  const paymentsCount = await vault.paymentsCount();
  const paymentId = Number(paymentsCount) - 1;
  const p = await vault.payments(paymentId);
  console.log(`Payment #${paymentId} Status: ${p[3]} (2 = Escalated, 4 = Released)`);

  if (Number(p[3]) !== 2) {
    throw new Error(`Expected payment #${paymentId} status to be Escalated (2), got ${p[3]}`);
  }

  // Release Escalated Payment on-chain
  console.log(`Releasing Payment #${paymentId} on-chain...`);
  const releaseTx = await vault.releasePayment(paymentId);
  await releaseTx.wait();
  console.log(`Release Tx Hash: ${releaseTx.hash}`);
  await sleep(2000);

  const pUpdated = await vault.payments(paymentId);
  console.log(`Payment #${paymentId} Final Status: ${pUpdated[3]} (4 = Released)`);
  console.log("🎉 SUCCESS! On-chain Escalation & Release verified live on Hedera Testnet!");
}

main().catch((e) => {
  console.error("Test error:", e);
  process.exit(1);
});
