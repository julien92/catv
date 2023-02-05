import { Wallet } from "./wallet";

export interface Transaction {
  id: string;
  target: Wallet;
  sender: Wallet;
  amount: number;
  timestamp: string;
  hash: string;
}
