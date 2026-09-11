import { HTTPFacilitatorClient, x402ResourceServer } from '@x402/core/server';
import { ExactHederaScheme } from '@x402/hedera/exact/server';
import * as dotenv from 'dotenv';
dotenv.config();

const facilitatorClient = new HTTPFacilitatorClient({ url: process.env.FACILITATOR_URL! });
const server = new x402ResourceServer(facilitatorClient);
server.register('hedera:*', new ExactHederaScheme());

server.buildPaymentRequirementsFromOptions([
  { network: 'hedera:testnet', scheme: 'exact', price: '0.01', payTo: '0.0.99999' }
]).then(console.log).catch(console.error);
