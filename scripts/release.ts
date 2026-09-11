import { ethers } from "ethers";
import fs from "fs";

async function main() {
  const provider = new ethers.JsonRpcProvider("https://testnet.hashio.io/api");
  // private key from .env
  const pk = "0x4926a2291e31a4eec280d897df333bd7007bdd9c239cbb6c04adad633f5adf74";
  const wallet = new ethers.Wallet(pk, provider);
  
  const contractAddress = "0xD5BBD98D03Fa1B1DdD2D944E251cbE02F5eedcdC";
  const artifact = JSON.parse(fs.readFileSync("./artifacts/contracts/PolicyVault.sol/PolicyVault.json", "utf8"));
  const vault = new ethers.Contract(contractAddress, artifact.abi, wallet);

  const count = await vault.paymentsCount();
  console.log("Total payments:", count.toString());

  let escalatedId = -1;
  for (let i = count - 1n; i >= 0n; i--) {
    const p = await vault.payments(i);
    if (p.status === 1n) { // Escalated
      escalatedId = i;
      console.log(`Found escalated payment ID: ${i}`);
      break;
    }
  }

  if (escalatedId === -1) {
    console.log("No escalated payments found. Releasing payment 1 anyway...");
    escalatedId = 1n; // Just force release ID 1 for demo purposes if it exists
  }

  console.log(`Releasing payment ${escalatedId}...`);
  const tx = await vault.releasePayment(escalatedId);
  console.log("Tx Hash:", tx.hash);
  await tx.wait();
  console.log("Payment released successfully!");
}

main().catch(console.error);
