type WalletTokenBalance = {
  symbol?: string;
  token?: string;
  amount?: number | string;
};

type WalletBalancesResponse = {
  usdc?: WalletTokenBalance;
  tokens?: WalletTokenBalance[];
};

type CrossmintWalletLike = {
  balances?: (tokens?: string[]) => Promise<unknown>;
};

function parseAmount(value: number | string | undefined): number {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function isUsdcToken(token: WalletTokenBalance): boolean {
  const rawSymbol = token.symbol ?? token.token ?? '';
  return rawSymbol.toLowerCase().includes('usdc');
}

export function extractUsdcBalanceFromWalletResponse(response: unknown): number {
  if (!response || typeof response !== 'object') {
    return 0;
  }

  const maybeResponse = response as WalletBalancesResponse;
  if (maybeResponse.usdc) {
    return parseAmount(maybeResponse.usdc.amount);
  }

  const tokens = Array.isArray(maybeResponse.tokens) ? maybeResponse.tokens : [];
  const usdcToken = tokens.find(isUsdcToken);

  return parseAmount(usdcToken?.amount);
}

export async function fetchWalletUsdcBalance(wallet: CrossmintWalletLike | null | undefined): Promise<number> {
  if (!wallet?.balances) {
    return 0;
  }

  const response = await wallet.balances(['usdc']);
  return extractUsdcBalanceFromWalletResponse(response);
}
