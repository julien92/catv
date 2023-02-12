import { Wallet } from "../../../../model/wallet";

export interface TokenTransaction {
  id: string;
  from: Wallet;
  to: Wallet;
  amount: number;
  timestamp: string;
  hash: string;
  token: Token;
  transactionId: number;
}

interface Token {
  contract: Wallet;
  id: string;
  metadata?: Metadata;
  standard: string;
}

interface Metadata {
  decimals: string;
  name: string;
  symbol: string;
  thumbnailUri: string;
}
