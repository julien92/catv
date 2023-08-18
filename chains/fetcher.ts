import { Transaction } from "../model/transaction";

export interface fetcher {
  get(criteria: Criteria): Promise<Transaction[]>;
}

export interface Criteria {
  address: string;
  type: "sender" | "target";
  start: Date;
  end: Date;
  limit: number;
}

export type Chain = "tezos" | "eth";
