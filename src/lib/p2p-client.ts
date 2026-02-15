import { Client, networks } from '@/contracts/p2p/src';
import { getStellarPublicConfig } from '@/lib/stellar-config';

let cachedClient: Client | null = null;

export function getP2pClient(): Client {
  if (cachedClient) {
    return cachedClient;
  }

  const config = getStellarPublicConfig();

  cachedClient = new Client({
    ...networks.testnet,
    contractId: config.p2pContractId,
    networkPassphrase: config.networkPassphrase,
    rpcUrl: config.rpcUrl,
  });

  return cachedClient;
}
