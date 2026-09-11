import { http, createConfig } from 'wagmi';
import { injected } from 'wagmi/connectors';

export const hederaTestnet = {
  id: 296,
  name: 'Hedera Testnet',
  network: 'hedera-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'HBAR',
    symbol: 'HBAR',
  },
  rpcUrls: {
    public: { http: ['https://testnet.hashio.io/api'] },
    default: { http: ['https://testnet.hashio.io/api'] },
  },
  blockExplorers: {
    default: { name: 'Hashscan', url: 'https://hashscan.io/testnet' },
  },
  testnet: true,
};

export const config = createConfig({
  chains: [hederaTestnet],
  connectors: [injected()],
  transports: {
    [hederaTestnet.id]: http(),
  },
});
