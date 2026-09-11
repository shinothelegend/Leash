import type { HardhatUserConfig } from "hardhat/config";
import hardhatEthers from "@nomicfoundation/hardhat-ethers";
import * as dotenv from "dotenv";
dotenv.config();

const config: HardhatUserConfig = {
  plugins: [hardhatEthers],
  solidity: "0.8.24",
  networks: {
    hederaTestnet: {
      type: "http",
      url: process.env.HEDERA_RPC_URL || "https://testnet.hashio.io/api",
      accounts: [process.env.HEDERA_PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000000"],
      chainId: 296,
    },
  },
};
export default config;
