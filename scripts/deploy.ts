import { ethers } from "ethers";
import * as fs from "fs";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.HEDERA_RPC_URL || "https://testnet.hashio.io/api");
  const deployer = new ethers.Wallet(process.env.HEDERA_PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000001", provider);

  const useRealFeed = process.env.HBAR_USD_FEED_ADDRESS && process.env.HBAR_USD_FEED_ADDRESS !== "0x0000000000000000000000000000000000dead";

  let feedAddress: string;
  if (useRealFeed) {
    feedAddress = process.env.HBAR_USD_FEED_ADDRESS!;
  } else {
    const mockArtifact = JSON.parse(fs.readFileSync("./artifacts/contracts/mocks/MockV3Aggregator.sol/MockV3Aggregator.json", "utf-8"));
    const MockFactory = new ethers.ContractFactory(mockArtifact.abi, mockArtifact.bytecode, deployer);
    const mock = await MockFactory.deploy(15_000_000);
    await mock.waitForDeployment();
    feedAddress = await mock.getAddress();
    console.log("⚠️  Using MockV3Aggregator fallback at", feedAddress, "— see BUILD_LOG.md");
  }

  const vaultArtifact = JSON.parse(fs.readFileSync("./artifacts/contracts/PolicyVault.sol/PolicyVault.json", "utf-8"));
  const VaultFactory = new ethers.ContractFactory(vaultArtifact.abi, vaultArtifact.bytecode, deployer);
  const vault = await VaultFactory.deploy(deployer.address, feedAddress, 500, 50);
  await vault.waitForDeployment();
  const vaultAddress = await vault.getAddress();

  fs.writeFileSync("deployed-addresses.json", JSON.stringify({ vault: vaultAddress, feed: feedAddress }, null, 2));
  console.log("PolicyVault deployed:", vaultAddress);
}
main().catch((e) => { console.error(e); process.exit(1); });
