
> ## Documentation Index
> Fetch the complete documentation index at: https://docs.crossmint.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Create Wallet

> Create a wallet using Crossmint's APIs

export const WalletCreationDemo = () => {
  const API_BASE_URL = "https://staging.crossmint.com/api/2025-06-09";
  const DEMO_API_KEY = "sk_staging_AFSK46BHGqQn2JUkM4mndAuBL48STrcxwLQYEhwTZqoSa9TRrg8C5oBT8VsnqqYvJAzinMXJeuZhELtFYYG4dnHgu9M741F2TyyFEy5Bgt3i3XaJEDFUggFoLhe1KmrNdJAJLM1B4kHRpf8Efs3RrSMMUgkwD5MsJibEHQ2My3MQD295wBmxUjFWQz7KC31MoLYcNQ4GuREbEXHsPcXV3Y2G";
  const [chainType, setChainType] = useState("solana");
  const [email, setEmail] = useState("");
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fundingStatus, setFundingStatus] = useState(null);
  const [isExistingWallet, setIsExistingWallet] = useState(false);
  const [copied, setCopied] = useState(false);
  const [balance, setBalance] = useState(null);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [transactionHash, setTransactionHash] = useState(null);
  const chainOptions = [{
    value: "solana",
    label: "Solana (Devnet)",
    chainType: "solana",
    fundingChain: "solana",
    explorerUrl: "https://explorer.solana.com/tx/{txHash}?cluster=devnet"
  }, {
    value: "ethereum-sepolia",
    label: "Ethereum Sepolia",
    chainType: "evm",
    fundingChain: "ethereum-sepolia",
    explorerUrl: "https://sepolia.etherscan.io/tx/{txHash}"
  }, {
    value: "polygon-amoy",
    label: "Polygon Amoy",
    chainType: "evm",
    fundingChain: "polygon-amoy",
    explorerUrl: "https://amoy.polygonscan.com/tx/{txHash}"
  }, {
    value: "base-sepolia",
    label: "Base Sepolia",
    chainType: "evm",
    fundingChain: "base-sepolia",
    explorerUrl: "https://sepolia.basescan.org/tx/{txHash}"
  }, {
    value: "arbitrum-sepolia",
    label: "Arbitrum Sepolia",
    chainType: "evm",
    fundingChain: "arbitrum-sepolia",
    explorerUrl: "https://sepolia.arbiscan.io/tx/{txHash}"
  }, {
    value: "optimism-sepolia",
    label: "Optimism Sepolia",
    chainType: "evm",
    fundingChain: "optimism-sepolia",
    explorerUrl: "https://sepolia-optimism.etherscan.io/tx/{txHash}"
  }];
  const getChainConfig = () => {
    const selectedChain = chainOptions.find(opt => opt.value === chainType);
    return {
      chainType: selectedChain?.chainType || "solana",
      chain: chainType,
      fundingChain: selectedChain?.fundingChain || chainType,
      explorerUrl: selectedChain?.explorerUrl || ""
    };
  };
  const getTransactionUrl = txHash => {
    if (!txHash) {
      return null;
    }
    const {explorerUrl} = getChainConfig();
    return explorerUrl.replace("{txHash}", txHash);
  };
  const createWallet = async () => {
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const {chainType: apiChainType, chain} = getChainConfig();
      const requestBody = {
        chainType: apiChainType,
        config: {
          adminSigner: {
            type: "email",
            email: email
          }
        },
        owner: `email:${email}`
      };
      if (apiChainType === "evm") {
        requestBody.chain = chain;
      }
      const response = await fetch(`${API_BASE_URL}/wallets`, {
        method: "POST",
        headers: {
          "X-API-KEY": DEMO_API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      });
      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.message && (errorData.message.includes("already holds wallet") || errorData.message.includes("linkedUser already holds") || errorData.message.includes("doesn't match the provided config"))) {
          try {
            const {chainType: apiChainType, chain} = getChainConfig();
            const locator = apiChainType === "evm" ? `email:${email}:${chain}` : `email:${email}:${chainType}`;
            const getResponse = await fetch(`${API_BASE_URL}/wallets/${encodeURIComponent(locator)}`, {
              method: "GET",
              headers: {
                "X-API-KEY": DEMO_API_KEY
              }
            });
            if (getResponse.ok) {
              const existingWallet = await getResponse.json();
              setWallet(existingWallet);
              setIsExistingWallet(true);
              setError(null);
              return;
            }
          } catch (fetchError) {
            console.error("Error fetching existing wallet:", fetchError);
          }
          throw new Error("A wallet already exists for this email address. Please try a different email for this demo.");
        }
        throw new Error(errorData.message || "Failed to create wallet");
      }
      const walletData = await response.json();
      setWallet(walletData);
    } catch (err) {
      setError(err.message || "Failed to create wallet. Please try again.");
      console.error("Wallet creation error:", err);
    } finally {
      setLoading(false);
    }
  };
  const handleSignOut = () => {
    setWallet(null);
    setEmail("");
    setFundingStatus(null);
    setError(null);
    setIsExistingWallet(false);
    setBalance(null);
    setCopied(false);
    setTransactionHash(null);
  };
  const handleChainChange = newChain => {
    if (wallet) {
      setError("Please sign out before changing the chain");
      return;
    }
    setChainType(newChain);
    setError(null);
  };
  const handleAddFunds = async () => {
    if (!wallet?.address || !email) {
      return;
    }
    setLoading(true);
    setFundingStatus("requesting");
    setError(null);
    try {
      const {chainType: apiChainType, fundingChain} = getChainConfig();
      const walletLocator = apiChainType === "evm" ? `email:${email}:evm-smart-wallet` : `email:${email}:solana-smart-wallet`;
      const response = await fetch(`https://staging.crossmint.com/api/v1-alpha2/wallets/${walletLocator}/balances`, {
        method: "POST",
        headers: {
          "X-API-KEY": DEMO_API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          amount: 10,
          token: "usdxm",
          chain: fundingChain
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add funds");
      }
      const responseData = await response.json();
      console.log("Funding response:", responseData);
      setFundingStatus("success");
      const txHash = responseData.txId || responseData.transactionId || responseData.hash || responseData.txHash;
      if (txHash) {
        setTransactionHash(txHash);
      }
      if (apiChainType === "solana" && wallet?.address) {
        setTimeout(() => fetchTokenBalance(wallet.address), 1000);
      } else {
        setBalance(prevBalance => (prevBalance || 0) + 10);
      }
    } catch (err) {
      setFundingStatus("error");
      setError("Failed to add funds. Please try again later.");
      console.error("Funding error:", err);
    } finally {
      setLoading(false);
    }
  };
  const truncateAddress = address => {
    if (!address) {
      return "";
    }
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };
  const copyAddress = async () => {
    if (!wallet?.address) {
      return;
    }
    try {
      await navigator.clipboard.writeText(wallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy address:", err);
    }
  };
  const fetchTokenBalance = async walletAddress => {
    setLoadingBalance(true);
    try {
      const {chainType: apiChainType} = getChainConfig();
      if (apiChainType !== "solana") {
        setBalance(0);
        setLoadingBalance(false);
        return;
      }
      const USDXM_MINT = "z23BZbAiFRb6u5CBH64XjZPUud6dP6y2ZuKoYSM4LCY";
      const response = await fetch("https://api.devnet.solana.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "getTokenAccountsByOwner",
          params: [walletAddress, {
            mint: USDXM_MINT
          }, {
            encoding: "jsonParsed"
          }]
        })
      });
      if (!response.ok) {
        throw new Error("Failed to fetch token balance");
      }
      const data = await response.json();
      if (data.result && data.result.value && data.result.value.length > 0) {
        const tokenAccount = data.result.value[0];
        const balance = tokenAccount.account.data.parsed.info.tokenAmount.uiAmount;
        setBalance(balance);
      } else {
        setBalance(0);
      }
    } catch (err) {
      console.error("Error fetching token balance:", err);
      setBalance(0);
    } finally {
      setLoadingBalance(false);
    }
  };
  useEffect(() => {
    if (wallet?.address) {
      fetchTokenBalance(wallet.address);
    }
  }, [wallet?.address]);
  return <div className="not-prose my-8 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 shadow-lg">
            <div className="mb-6 flex items-center justify-between gap-2">
                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Create a Wallet</h3>
            </div>

            {}
            <div className="mb-6">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Select Chain</label>
                <select value={chainType} onChange={e => handleChainChange(e.target.value)} disabled={wallet != null} className="w-full px-4 py-2 text-sm border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
                    {chainOptions.map(option => <option key={option.value} value={option.value}>
                            {option.label}
                        </option>)}
                </select>
                {wallet && <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Sign out to change the chain</p>}
            </div>

            <div className="space-y-6">
                {}
                <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${wallet ? "bg-green-500 dark:bg-green-600" : "bg-zinc-200 dark:bg-zinc-700"}`}>
                        {wallet ? <svg className="w-5 h-5 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                <path d="M5 13l4 4L19 7"></path>
                            </svg> : <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">1</span>}
                    </div>
                    <div className="flex-1">
                        <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-2">Create an account</p>
                        {!wallet ? <div className="flex gap-2">
                                <input type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} onKeyPress={e => e.key === "Enter" && createWallet()} disabled={loading} className="flex-1 px-4 py-2 text-sm border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50" />
                                <button onClick={createWallet} disabled={loading || !email} className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                    {loading ? "Creating..." : "Create Wallet"}
                                </button>
                            </div> : <div className="space-y-2">
                                {isExistingWallet && <div className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                        <p className="text-xs text-blue-700 dark:text-blue-300">
                                            ✓ Found your existing wallet
                                        </p>
                                    </div>}
                                <div className="flex items-center justify-between px-4 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-800">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                                            <svg className="w-4 h-4 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                                            </svg>
                                        </div>
                                        <span className="text-sm font-mono text-zinc-700 dark:text-zinc-300">
                                            {truncateAddress(wallet.address)}
                                        </span>
                                        <button onClick={copyAddress} className="p-1 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors" title="Copy address">
                                            {copied ? <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path d="M5 13l4 4L19 7"></path>
                                                </svg> : <svg className="w-4 h-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                                                </svg>}
                                        </button>
                                    </div>
                                    <button onClick={handleSignOut} className="px-4 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-md transition-colors">
                                        Sign out
                                    </button>
                                </div>

                                {}
                                {wallet && <div className="mt-3 px-4 py-3 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                                                    <span className="text-xs font-bold text-white">U</span>
                                                </div>
                                                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                                    USDXM Balance
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {loadingBalance ? <span className="text-sm text-zinc-500 dark:text-zinc-400">
                                                        Loading...
                                                    </span> : <span className="text-sm font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                                                        {balance !== null ? balance.toLocaleString() : "0"} USDXM
                                                    </span>}
                                                {getChainConfig().chainType === "solana" && <button onClick={() => fetchTokenBalance(wallet.address)} disabled={loadingBalance} className="p-1 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors disabled:opacity-50" title="Refresh balance">
                                                        <svg className="w-4 h-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                                                        </svg>
                                                    </button>}
                                            </div>
                                        </div>
                                    </div>}
                            </div>}
                    </div>
                </div>

                {}
                <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${wallet ? fundingStatus === "success" ? "bg-green-500 dark:bg-green-600" : "bg-zinc-200 dark:bg-zinc-700" : "bg-zinc-100 dark:bg-zinc-800"}`}>
                        {fundingStatus === "success" ? <svg className="w-5 h-5 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                <path d="M5 13l4 4L19 7"></path>
                            </svg> : <span className={`text-sm font-medium ${wallet ? "text-zinc-600 dark:text-zinc-300" : "text-zinc-400 dark:text-zinc-600"}`}>
                                2
                            </span>}
                    </div>
                    <div className="flex-1">
                        <p className={`text-sm mb-3 ${wallet ? "text-zinc-700 dark:text-zinc-300" : "text-zinc-400 dark:text-zinc-600"}`}>
                            Get USDXM testnet tokens for your wallet.
                        </p>
                        {wallet && <div className="space-y-2">
                                <button onClick={handleAddFunds} disabled={loading || fundingStatus === "success"} className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                    {loading && fundingStatus === "requesting" ? "Adding USDXM..." : fundingStatus === "success" ? "Funds added ✓" : "Add 10 USDXM"}
                                </button>
                                {fundingStatus === "success" && <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg space-y-2">
                                        <p className="text-xs text-green-600 dark:text-green-400">
                                            ✓ Successfully added 10 USDXM to your wallet.
                                            {getChainConfig().chainType === "solana" && " Click the refresh button next to your balance to see the updated amount."}
                                        </p>
                                        {transactionHash && <a href={getTransactionUrl(transactionHash)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium underline">
                                                View transaction on block explorer
                                                <svg className="w-3 h-3" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                                                </svg>
                                            </a>}
                                    </div>}
                            </div>}
                    </div>
                </div>
            </div>

            {}
            {error && <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>}

            {}
            <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
                <details className="group">
                    <summary className="cursor-pointer text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">
                        View API Details
                    </summary>
                    <div className="mt-3 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg text-xs">
                        <p className="font-mono text-zinc-700 dark:text-zinc-300 mb-2">POST {API_BASE_URL}/wallets</p>
                        <pre className="text-zinc-600 dark:text-zinc-400 overflow-x-auto">
                            {JSON.stringify((() => {
    const {chainType: apiChainType, chain} = getChainConfig();
    const body = {
      chainType: apiChainType,
      config: {
        adminSigner: {
          type: "email",
          email: "user@example.com"
        }
      },
      owner: "email:user@example.com"
    };
    if (apiChainType === "evm") {
      body.chain = chain;
    }
    return body;
  })(), null, 2)}
                        </pre>
                    </div>
                </details>
            </div>
        </div>;
};

## Prerequisites

* **API Key**: Ensure you have an API key with the scopes: `wallets.create`.

## Try it Live

Experience wallet creation in action with this interactive demo. Create a Solana testnet wallet using just your email address:

<WalletCreationDemo />

## Create a Wallet

<Tabs>
  <Tab title="React">
    ```typescript  theme={null}
    import { useWallet } from '@crossmint/client-sdk-react-ui';

    const { getOrCreateWallet } = useWallet();

    const wallet = await getOrCreateWallet({
        chain: "base-sepolia",
        signer: {
            type: "email",
            email: "user@example.com"
        },
    });
    ```

    ### Parameters

    <ResponseField name="chain" type="string" required>
      The chain to use the wallet on.

      See all [supported chains](/introduction/supported-chains) for more details. On [staging](/introduction/platform/staging-vs-production) only testnet chains are supported.

      Note: For EVM-compatible chains, wallets are created for all
      chains as part of the shared address space derived from the same private key. However, to
      interact with a specific chain using the SDK, you must instantiate a wallet object per chain.
      This allows the SDK to correctly route interactions to the appropriate network configuration.
    </ResponseField>

    <ResponseField name="signer" type="Signer" required>
      The [signer](/wallets/signers-and-custody) to use the wallet with.
    </ResponseField>

    <ResponseField name="alias" type="string">
      An optional identifier for the wallet, used to organize multiple wallets on the same chain.

      Aliases are:

      * Unique per wallet type and chain.
      * Must use only lowercase letters, numbers, underscores, or hyphens (`a-z`, `0-9`, `_`, `-`).
      * No spaces or empty strings allowed.

      Examples:
      `trading`, `long-term-holdings`, `treasury`
    </ResponseField>

    <ResponseField name="options" type="WalletOptions">
      The options to use the wallet with.

      <Expandable title="experimental_callbacks">
        A set of callbacks to be called when the wallet is created or a transaction is initiated.

        <Expandable title="properties">
          <ResponseField name="onWalletCreationStart" type="function">
            A function to be called when the wallet is about to be created.
          </ResponseField>

          <ResponseField name="onTransactionStart" type="function">
            A function to be called when a transaction is initiated.
          </ResponseField>
        </Expandable>
      </Expandable>
    </ResponseField>

    ### Returns

    <ResponseField name="wallet" type="Wallet">
      The created wallet.
    </ResponseField>
  </Tab>

  <Tab title="Node.js">
    ```typescript  theme={null}
    import { CrossmintWallets, createCrossmint } from "@crossmint/wallets-sdk";

    const crossmint = createCrossmint({
        apiKey: "<your-server-api-key>",
    });

    const crossmintWallets = CrossmintWallets.from(crossmint);

    const wallet = await crossmintWallets.createWallet({
        chain: "base-sepolia",
        signer: {
            type: "email",
            email: "user@example.com"
        },
    });
    ```

    ### Parameters

    <ResponseField name="chain" type="string" required>
      The chain to use the wallet on.

      See all [supported chains](/introduction/supported-chains) for more details. On [staging](/introduction/platform/staging-vs-production) only testnet chains are supported.

      Note: For EVM-compatible chains, wallets are created for all
      chains as part of the shared address space derived from the same private key. However, to
      interact with a specific chain using the SDK, you must instantiate a wallet object per chain.
      This allows the SDK to correctly route interactions to the appropriate network configuration.
    </ResponseField>

    <ResponseField name="signer" type="Signer" required>
      The [signer](/wallets/signers-and-custody) to use the wallet with.
    </ResponseField>

    <ResponseField name="alias" type="string">
      An optional identifier for the wallet, used to organize multiple wallets on the same chain.

      Aliases are:

      * Unique per wallet type and chain.
      * Must use only lowercase letters, numbers, underscores, or hyphens (`a-z`, `0-9`, `_`, `-`).
      * No spaces or empty strings allowed.

      Examples:
      `trading`, `long-term-holdings`, `treasury`
    </ResponseField>

    <ResponseField name="owner" type="string">
      Use `owner` to tie a wallet to a specific user identity. It must be a string in the form `type:value`:

      * `email:email@example.com`
      * `userId:userId1` - Only used when bringing your own auth
      * `phoneNumber:phoneNumber1`
      * `twitter:handle1`
      * `x:handle1`

      **Using Crossmint Auth**
      If you are using also [Crossmint Auth](/authentication/introduction), you may set owner to any of the `email`, `phoneNumber`, `twitter` or `x`. Once created, Crossmint Auth will automatically resolve to that wallet on login.

      For example, if you set "owner": "x:acme", then whenever the user logs in via X through Crossmint Auth, Crossmint will automatically return the created wallet for that handle.

      **Bring your own auth**
      If you use your own authentication system, you can only set owner to userId:userId. Crossmint will extract that ID automatically from the `sub` claim of the JWT when the user signs in.
    </ResponseField>

    <ResponseField name="options" type="WalletOptions">
      The options to use the wallet with.

      <Expandable title="experimental_callbacks">
        A set of callbacks to be called when the wallet is created or a transaction is initiated.

        <Expandable title="properties">
          <ResponseField name="onWalletCreationStart" type="function">
            A function to be called when the wallet is about to be created.
          </ResponseField>

          <ResponseField name="onTransactionStart" type="function">
            A function to be called when a transaction is initiated.
          </ResponseField>
        </Expandable>
      </Expandable>
    </ResponseField>

    ### Returns

    <ResponseField name="wallet" type="Wallet">
      The created wallet.
    </ResponseField>
  </Tab>

  <Tab title="React Native">
    ```typescript  theme={null}
    import { useWallet } from '@crossmint/client-sdk-react-native-ui';

    const { getOrCreateWallet } = useWallet();

    const wallet = await getOrCreateWallet({
        chain: "base-sepolia",
        signer: {
            type: "email",
            email: "user@example.com"
        },
    });
    ```

    ### Parameters

    <ResponseField name="chain" type="string" required>
      The chain to use the wallet on.

      See all [supported chains](/introduction/supported-chains) for more details. On [staging](/introduction/platform/staging-vs-production) only testnet chains are supported.

      Note: For EVM-compatible chains, wallets are created for all
      chains as part of the shared address space derived from the same private key. However, to
      interact with a specific chain using the SDK, you must instantiate a wallet object per chain.
      This allows the SDK to correctly route interactions to the appropriate network configuration.
    </ResponseField>

    <ResponseField name="signer" type="Signer" required>
      The [signer](/wallets/signers-and-custody) to use the wallet with.
    </ResponseField>

    <ResponseField name="alias" type="string">
      An optional identifier for the wallet, used to organize multiple wallets on the same chain.

      Aliases are:

      * Unique per wallet type and chain.
      * Must use only lowercase letters, numbers, underscores, or hyphens (`a-z`, `0-9`, `_`, `-`).
      * No spaces or empty strings allowed.

      Examples:
      `trading`, `long-term-holdings`, `treasury`
    </ResponseField>

    <ResponseField name="options" type="WalletOptions">
      The options to use the wallet with.

      <Expandable title="experimental_callbacks">
        A set of callbacks to be called when the wallet is created or a transaction is initiated.

        <Expandable title="properties">
          <ResponseField name="onWalletCreationStart" type="function">
            A function to be called when the wallet is about to be created.
          </ResponseField>

          <ResponseField name="onTransactionStart" type="function">
            A function to be called when a transaction is initiated.
          </ResponseField>
        </Expandable>
      </Expandable>
    </ResponseField>

    ### Returns

    <ResponseField name="wallet" type="Wallet">
      The created wallet.
    </ResponseField>
  </Tab>

  <Tab title="Swift">
    ```swift  theme={null}
    import CrossmintClient
    import Wallet

    let sdk = CrossmintSDK.shared

    let wallet = try await sdk.crossmintWallets.getOrCreateWallet(
        chain: .baseSepolia,
        signer: .email(email: "user@example.com")
    )
    ```

    ### Parameters

    <ResponseField name="chain" type="string" required>
      The chain to use the wallet on.

      See all [supported chains](/introduction/supported-chains) for more details. On [staging](/introduction/platform/staging-vs-production) only testnet chains are supported.

      Note: For EVM-compatible chains, wallets are created for all
      chains as part of the shared address space derived from the same private key. However, to
      interact with a specific chain using the SDK, you must instantiate a wallet object per chain.
      This allows the SDK to correctly route interactions to the appropriate network configuration.
    </ResponseField>

    <ResponseField name="signer" type="Signer" required>
      The [signer](/wallets/signers-and-custody) to use the wallet with.
    </ResponseField>

    <ResponseField name="alias" type="string">
      An optional identifier for the wallet, used to organize multiple wallets on the same chain.

      Aliases are:

      * Unique per wallet type and chain.
      * Must use only lowercase letters, numbers, underscores, or hyphens (`a-z`, `0-9`, `_`, `-`).
      * No spaces or empty strings allowed.

      Examples:
      `trading`, `long-term-holdings`, `treasury`
    </ResponseField>

    ### Returns

    <ResponseField name="wallet" type="Wallet">
      The created wallet.
    </ResponseField>
  </Tab>

  <Tab title="REST">
    <CodeGroup>
      ```bash cURL theme={null}
      curl --request POST \
          --url https://staging.crossmint.com/api/2025-06-09/wallets \
          --header 'Content-Type: application/json' \
          --header 'X-API-KEY: <x-api-key>' \
          --data '{
              "chainType": "evm",
              "config": {
                  "adminSigner": {
                      "type": "email",
                      "email": "user@example.com"
                  }
              },
              "owner": "email:user@example.com"
          }'
      ```

      ```js Node.js theme={null}
      const url = 'https://staging.crossmint.com/api/2025-06-09/wallets';

      const payload = {
          chainType: "evm",
          config: {
              adminSigner: {
                  type: "email",
                  email: "user@example.com"
              }
          },
          owner: "email:user@example.com"
      };

      const options = {
          method: 'POST',
          headers: {
              'X-API-KEY': '<x-api-key>',
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
      };

      try {
          const response = await fetch(url, options);
          const data = await response.json();
          console.log(data);
      } catch (error) {
          console.error(error);
      }
      ```

      ```python Python theme={null}
      import requests

      url = "https://staging.crossmint.com/api/2025-06-09/wallets"

      payload = {
          "chainType": "evm",
          "config": {
              "adminSigner": {
                  "type": "email",
                  "email": "user@example.com"
              }
          },
          "owner": "email:user@example.com"
      }
      headers = {
          "X-API-KEY": "<x-api-key>",
          "Content-Type": "application/json"
      }

      response = requests.post(url, json=payload, headers=headers)

      print(response.json())
      ```
    </CodeGroup>

    See the [API reference](/api-reference/wallets/create-wallet) for more details.
  </Tab>
</Tabs>
