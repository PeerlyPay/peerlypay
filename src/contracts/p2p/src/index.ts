/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-unsafe-declaration-merging, @typescript-eslint/ban-ts-comment */
import { Buffer } from "buffer";
import { Address } from "@stellar/stellar-sdk";
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from "@stellar/stellar-sdk/contract";
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Duration,
} from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";

if (typeof window !== "undefined") {
  window.Buffer = window.Buffer || Buffer;
}

export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CA6I2J5MTYR525JMGMPRXAFNDBNWPRNB6GFWIW2S5VR6JD6QILJ53Q2V",
  },
} as const;

export const ContractError = {
  1: { message: "InvalidAmount" },
  2: { message: "InvalidExchangeRate" },
  3: { message: "InvalidDuration" },
  4: { message: "OrderNotFound" },
  5: { message: "InvalidOrderStatus" },
  6: { message: "Unauthorized" },
  7: { message: "OrderExpired" },
  8: { message: "FiatTransferHasNotExpired" },
  9: { message: "AlreadyInitialized" },
  10: { message: "ConfigNotInitialized" },
  11: { message: "Paused" },
  12: { message: "AlreadyPaused" },
  13: { message: "AlreadyUnpaused" },
  14: { message: "MissingFiller" },
  15: { message: "Overflow" },
  16: { message: "Underflow" },
  17: { message: "DivisionError" },
  18: { message: "InvalidTimeout" },
  19: { message: "InvalidAddress" },
};

export interface Order {
  amount: i128;
  created_at: u64;
  creator: string;
  deadline: u64;
  exchange_rate: i128;
  fiat_currency: FiatCurrency;
  fiat_transfer_deadline: Option<u64>;
  filler: Option<string>;
  from_crypto: boolean;
  order_id: u64;
  payment_method: PaymentMethod;
  status: OrderStatus;
  token: string;
}

export interface Config {
  admin: string;
  dispute_resolver: string;
  filler_payment_timeout_secs: u64;
  max_duration_secs: u64;
  paused: boolean;
  pauser: string;
  token: string;
}

export type DataKey =
  | { tag: "Config"; values: void }
  | { tag: "OrderCount"; values: void }
  | { tag: "Order"; values: readonly [u64] };

export type OrderStatus =
  | { tag: "Created"; values: void }
  | { tag: "AwaitingFiller"; values: void }
  | { tag: "AwaitingPayment"; values: void }
  | { tag: "AwaitingConfirmation"; values: void }
  | { tag: "Completed"; values: void }
  | { tag: "Disputed"; values: void }
  | { tag: "Refunded"; values: void }
  | { tag: "Cancelled"; values: void };

export type FiatCurrency =
  | { tag: "Usd"; values: void }
  | { tag: "Eur"; values: void }
  | { tag: "Ars"; values: void }
  | { tag: "Cop"; values: void }
  | { tag: "Gbp"; values: void }
  | { tag: "Other"; values: readonly [u32] };

export type PaymentMethod =
  | { tag: "BankTransfer"; values: void }
  | { tag: "MobileWallet"; values: void }
  | { tag: "Cash"; values: void }
  | { tag: "Other"; values: readonly [u32] };

export interface Client {
  /**
   * Construct and simulate a pause transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  pause: (
    { caller }: { caller: string },
    options?: MethodOptions,
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a unpause transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  unpause: (
    { caller }: { caller: string },
    options?: MethodOptions,
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a get_order transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_order: (
    { order_id }: { order_id: u64 },
    options?: MethodOptions,
  ) => Promise<AssembledTransaction<Result<Order>>>;

  /**
   * Construct and simulate a get_config transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_config: (
    options?: MethodOptions,
  ) => Promise<AssembledTransaction<Result<Config>>>;

  /**
   * Construct and simulate a initialize transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  initialize: (
    {
      admin,
      dispute_resolver,
      pauser,
      token,
      max_duration_secs,
      filler_payment_timeout_secs,
    }: {
      admin: string;
      dispute_resolver: string;
      pauser: string;
      token: string;
      max_duration_secs: u64;
      filler_payment_timeout_secs: u64;
    },
    options?: MethodOptions,
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a take_order transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  take_order: (
    { caller, order_id }: { caller: string; order_id: u64 },
    options?: MethodOptions,
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a cancel_order transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  cancel_order: (
    { caller, order_id }: { caller: string; order_id: u64 },
    options?: MethodOptions,
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a create_order transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  create_order: (
    {
      caller,
      fiat_currency,
      payment_method,
      from_crypto,
      amount,
      exchange_rate,
      duration_secs,
    }: {
      caller: string;
      fiat_currency: FiatCurrency;
      payment_method: PaymentMethod;
      from_crypto: boolean;
      amount: i128;
      exchange_rate: i128;
      duration_secs: u64;
    },
    options?: MethodOptions,
  ) => Promise<AssembledTransaction<Result<u64>>>;

  /**
   * Construct and simulate a get_order_count transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_order_count: (
    options?: MethodOptions,
  ) => Promise<AssembledTransaction<Result<u64>>>;

  /**
   * Construct and simulate a resolve_dispute transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  resolve_dispute: (
    {
      caller,
      order_id,
      fiat_transfer_confirmed,
    }: { caller: string; order_id: u64; fiat_transfer_confirmed: boolean },
    options?: MethodOptions,
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a create_order_cli transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  create_order_cli: (
    {
      caller,
      fiat_currency_code,
      payment_method_code,
      from_crypto,
      amount,
      exchange_rate,
      duration_secs,
    }: {
      caller: string;
      fiat_currency_code: u32;
      payment_method_code: u32;
      from_crypto: boolean;
      amount: i128;
      exchange_rate: i128;
      duration_secs: u64;
    },
    options?: MethodOptions,
  ) => Promise<AssembledTransaction<Result<u64>>>;

  /**
   * Construct and simulate a submit_fiat_payment transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  submit_fiat_payment: (
    { caller, order_id }: { caller: string; order_id: u64 },
    options?: MethodOptions,
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a confirm_fiat_payment transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  confirm_fiat_payment: (
    { caller, order_id }: { caller: string; order_id: u64 },
    options?: MethodOptions,
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a dispute_fiat_payment transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  dispute_fiat_payment: (
    { caller, order_id }: { caller: string; order_id: u64 },
    options?: MethodOptions,
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a execute_fiat_transfer_timeout transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  execute_fiat_transfer_timeout: (
    { caller, order_id }: { caller: string; order_id: u64 },
    options?: MethodOptions,
  ) => Promise<AssembledTransaction<Result<void>>>;
}
export class Client extends ContractClient {
  static async deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      },
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options);
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([
        "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",
        "AAAAAgAAAAAAAAAAAAAADEZpYXRDdXJyZW5jeQAAAAYAAAAAAAAAAAAAAANVc2QAAAAAAAAAAAAAAAADRXVyAAAAAAAAAAAAAAAAA0FycwAAAAAAAAAAAAAAAANDb3AAAAAAAAAAAAAAAAADR2JwAAAAAAEAAAAAAAAABU90aGVyAAAAAAAAAQAAAAQ=",
        "AAAAAgAAAAAAAAAAAAAADVBheW1lbnRNZXRob2QAAAAAAAAEAAAAAAAAAAAAAAAMQmFua1RyYW5zZmVyAAAAAAAAAAAAAAAMTW9iaWxlV2FsbGV0AAAAAAAAAAAAAAAEQ2FzaAAAAAEAAAAAAAAABU90aGVyAAAAAAAAAQAAAAQ=",
        "AAAAAAAAAAAAAAAFcGF1c2UAAAAAAAABAAAAAAAAAAZjYWxsZXIAAAAAABMAAAABAAAD6QAAA+0AAAAAAAAH0AAAAA1Db250cmFjdEVycm9yAAAA",
        "AAAAAAAAAAAAAAAHdW5wYXVzZQAAAAABAAAAAAAAAAZjYWxsZXIAAAAAABMAAAABAAAD6QAAA+0AAAAAAAAH0AAAAA1Db250cmFjdEVycm9yAAAA",
        "AAAAAAAAAAAAAAAJZ2V0X29yZGVyAAAAAAAAAQAAAAAAAAAIb3JkZXJfaWQAAAAGAAAAAQAAA+kAAAfQAAAABU9yZGVyAAAAAAAH0AAAAA1Db250cmFjdEVycm9yAAAA",
        "AAAAAAAAAAAAAAAKZ2V0X2NvbmZpZwAAAAAAAAAAAAEAAAPpAAAH0AAAAAZDb25maWcAAAAAB9AAAAANQ29udHJhY3RFcnJvcgAAAA==",
        "AAAAAAAAAAAAAAAKaW5pdGlhbGl6ZQAAAAAABgAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAABBkaXNwdXRlX3Jlc29sdmVyAAAAEwAAAAAAAAAGcGF1c2VyAAAAAAATAAAAAAAAAAV0b2tlbgAAAAAAABMAAAAAAAAAEW1heF9kdXJhdGlvbl9zZWNzAAAAAAAABgAAAAAAAAAbZmlsbGVyX3BheW1lbnRfdGltZW91dF9zZWNzAAAAAAYAAAABAAAD6QAAA+0AAAAAAAAH0AAAAA1Db250cmFjdEVycm9yAAAA",
        "AAAAAAAAAAAAAAAKdGFrZV9vcmRlcgAAAAAAAgAAAAAAAAAGY2FsbGVyAAAAAAATAAAAAAAAAAhvcmRlcl9pZAAAAAYAAAABAAAD6QAAA+0AAAAAAAAH0AAAAA1Db250cmFjdEVycm9yAAAA",
        "AAAAAAAAAAAAAAAMY2FuY2VsX29yZGVyAAAAAgAAAAAAAAAGY2FsbGVyAAAAAAATAAAAAAAAAAhvcmRlcl9pZAAAAAYAAAABAAAD6QAAA+0AAAAAAAAH0AAAAA1Db250cmFjdEVycm9yAAAA",
        "AAAAAAAAAAAAAAAMY3JlYXRlX29yZGVyAAAABwAAAAAAAAAGY2FsbGVyAAAAAAATAAAAAAAAAA1maWF0X2N1cnJlbmN5AAAAAAAH0AAAAAxGaWF0Q3VycmVuY3kAAAAAAAAADnBheW1lbnRfbWV0aG9kAAAAAAfQAAAADVBheW1lbnRNZXRob2QAAAAAAAAAAAAAC2Zyb21fY3J5cHRvAAAAAAEAAAAAAAAABmFtb3VudAAAAAAACwAAAAAAAAANZXhjaGFuZ2VfcmF0ZQAAAAAAAAsAAAAAAAAADWR1cmF0aW9uX3NlY3MAAAAAAAAGAAAAAQAAA+kAAAAGAAAH0AAAAA1Db250cmFjdEVycm9yAAAA",
        "AAAAAAAAAAAAAAANX19jb25zdHJ1Y3RvcgAAAAAAAAAAAAAA",
        "AAAAAAAAAAAAAAAPZ2V0X29yZGVyX2NvdW50AAAAAAAAAAABAAAD6QAAAAYAAAfQAAAADUNvbnRyYWN0RXJyb3IAAAA=",
        "AAAAAAAAAAAAAAAPcmVzb2x2ZV9kaXNwdXRlAAAAAAMAAAAAAAAABmNhbGxlcgAAAAAAEwAAAAAAAAAIb3JkZXJfaWQAAAAGAAAAAAAAABdmaWF0X3RyYW5zZmVyX2NvbmZpcm1lZAAAAAABAAAAAQAAA+kAAAPtAAAAAAAAB9AAAAANQ29udHJhY3RFcnJvcgAAAA==",
        "AAAAAAAAAAAAAAAQY3JlYXRlX29yZGVyX2NsaQAAAAcAAAAAAAAABmNhbGxlcgAAAAAAEwAAAAAAAAASZmlhdF9jdXJyZW5jeV9jb2RlAAAAAAAEAAAAAAAAABNwYXltZW50X21ldGhvZF9jb2RlAAAAAAQAAAAAAAAAC2Zyb21fY3J5cHRvAAAAAAEAAAAAAAAABmFtb3VudAAAAAAACwAAAAAAAAANZXhjaGFuZ2VfcmF0ZQAAAAAAAAsAAAAAAAAADWR1cmF0aW9uX3NlY3MAAAAAAAAGAAAAAQAAA+kAAAAGAAAH0AAAAA1Db250cmFjdEVycm9yAAAA",
        "AAAAAAAAAAAAAAATc3VibWl0X2ZpYXRfcGF5bWVudAAAAAACAAAAAAAAAAZjYWxsZXIAAAAAABMAAAAAAAAACG9yZGVyX2lkAAAABgAAAAEAAAPpAAAD7QAAAAAAAAfQAAAADUNvbnRyYWN0RXJyb3IAAAA=",
        "AAAAAAAAAAAAAAAUY29uZmlybV9maWF0X3BheW1lbnQAAAACAAAAAAAAAAZjYWxsZXIAAAAAABMAAAAAAAAACG9yZGVyX2lkAAAABgAAAAEAAAPpAAAD7QAAAAAAAAfQAAAADUNvbnRyYWN0RXJyb3IAAAA=",
        "AAAAAAAAAAAAAAAUZGlzcHV0ZV9maWF0X3BheW1lbnQAAAACAAAAAAAAAAZjYWxsZXIAAAAAABMAAAAAAAAACG9yZGVyX2lkAAAABgAAAAEAAAPpAAAD7QAAAAAAAAfQAAAADUNvbnRyYWN0RXJyb3IAAAA=",
        "AAAAAAAAAAAAAAAdZXhlY3V0ZV9maWF0X3RyYW5zZmVyX3RpbWVvdXQAAAAAAAACAAAAAAAAAAZjYWxsZXIAAAAAABMAAAAAAAAACG9yZGVyX2lkAAAABgAAAAEAAAPpAAAD7QAAAAAAAAfQAAAADUNvbnRyYWN0RXJyb3IAAAA=",
      ]),
      options,
    );
  }
  public readonly fromJSON = {
    pause: this.txFromJSON<Result<void>>,
    unpause: this.txFromJSON<Result<void>>,
    get_order: this.txFromJSON<Result<Order>>,
    get_config: this.txFromJSON<Result<Config>>,
    initialize: this.txFromJSON<Result<void>>,
    take_order: this.txFromJSON<Result<void>>,
    cancel_order: this.txFromJSON<Result<void>>,
    create_order: this.txFromJSON<Result<u64>>,
    get_order_count: this.txFromJSON<Result<u64>>,
    resolve_dispute: this.txFromJSON<Result<void>>,
    create_order_cli: this.txFromJSON<Result<u64>>,
    submit_fiat_payment: this.txFromJSON<Result<void>>,
    confirm_fiat_payment: this.txFromJSON<Result<void>>,
    dispute_fiat_payment: this.txFromJSON<Result<void>>,
    execute_fiat_transfer_timeout: this.txFromJSON<Result<void>>,
  };
}
