const DEFAULT_TESTNET_RPC_URL = 'https://soroban-testnet.stellar.org';
const DEFAULT_TESTNET_PASSPHRASE = 'Test SDF Network ; September 2015';

export interface StellarPublicConfig {
  p2pContractId: string;
  rpcUrl: string;
  networkPassphrase: string;
}

export function getStellarPublicConfig(): StellarPublicConfig {
  const p2pContractId = process.env.NEXT_PUBLIC_P2P_CONTRACT_ID?.trim() ?? '';

  if (!p2pContractId) {
    throw new Error('Missing NEXT_PUBLIC_P2P_CONTRACT_ID');
  }

  return {
    p2pContractId,
    rpcUrl: process.env.NEXT_PUBLIC_SOROBAN_RPC_URL?.trim() || DEFAULT_TESTNET_RPC_URL,
    networkPassphrase:
      process.env.NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE?.trim() || DEFAULT_TESTNET_PASSPHRASE,
  };
}
