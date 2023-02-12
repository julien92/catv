import { Wallet } from "./wallet";

// ADD amount symbol
export interface Transaction {
  id: string;
  target: Wallet;
  sender: Wallet;
  amount: number;
  timestamp: string;
  hash?: string;
  symbol: string;
  displayUrl: string;
}
