import axios from "axios";
import { Criteria, fetcher } from "../fetcher";
import { Transaction } from "../../model/transaction";
import { ApiResponse } from "./model/ChainScanTransaction";
import { mapTransaction } from "./mapper";

export class ChainScan implements fetcher {
  private apiUrl: string;
  private apiKey: string;
  private urls: {
    avatar: string;
    explorer: string;
  };
  private symbol: string;

  constructor(
    apiUrl: string,
    apiKey: string,
    urls: { avatar: string; explorer: string },
    symbol: string
  ) {
    this.apiUrl = apiUrl;
    this.apiKey = apiKey;
    this.urls = urls;
    this.symbol = symbol;
  }

  async get(criteria: Criteria): Promise<Transaction[]> {
    const tx1 = this.getTransactions(criteria);

    return await tx1;
  }

  async getTransactions(criteria: Criteria): Promise<Transaction[]> {
    const { data } = await axios.get<ApiResponse>(
      `${this.apiUrl}/?module=account&apikey=${this.apiKey}&action=txlist&address=${criteria.address}&page=1&offset=${criteria.limit}`
    );

    if (data.message === "NOTOK") return [];

    const result = data.result.map((t) =>
      mapTransaction(this.urls, this.symbol, t)
    );

    return result;
  }
}
