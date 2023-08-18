import axios from "axios";
import { Criteria, fetcher } from "../../fetcher";
import { Transaction } from "../../../model/transaction";
import { ApiResponse } from "./model/EtherscanTransaction";
import { mapEthTransaction } from "./mapper";

export class Etherscan implements fetcher {
  private apiUrl: string;
  private apiKey: string;
  private urls: {
    avatar: string;
    explorer: string;
  };

  constructor(
    apiUrl: string,
    apiKey: string,
    urls: { avatar: string; explorer: string }
  ) {
    this.apiUrl = apiUrl;
    this.apiKey = apiKey;
    this.urls = urls;
  }

  async get(criteria: Criteria): Promise<Transaction[]> {
    const tx1 = this.getEthTransactions(criteria);

    return await tx1;
  }

  async getEthTransactions(criteria: Criteria): Promise<Transaction[]> {
    const { data } = await axios.get<ApiResponse>(
      `${this.apiUrl}/?module=account&apikey=${this.apiKey}&action=txlist&address=${criteria.address}`
    );

    return data.result.map((t) => mapEthTransaction(this.urls, t));
  }
}
