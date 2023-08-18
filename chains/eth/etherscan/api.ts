import axios from "axios";
import { Criteria, fetcher } from "../../fetcher";
import { Transaction } from "../../../model/transaction";
import { ApiResponse } from "./model/EtherscanTransaction";
import { mapEthTransaction } from "./mapper";

const API_URL = "https://api.etherscan.io/api";
const API_KEY = "V5VMR4K591VVWZW723XWVRKT6P2BGCS9HN";

export class Etherscan implements fetcher {
  async get(criteria: Criteria): Promise<Transaction[]> {
    const tx1 = this.getEthTransactions(criteria);

    return await tx1;
  }

  async getEthTransactions(criteria: Criteria): Promise<Transaction[]> {
    const { data } = await axios.get<ApiResponse>(
      `${API_URL}/?module=account&apikey=${API_KEY}&action=txlist&address=${criteria.address}`
    );

    return data.result.map((t) => mapEthTransaction(t));
  }
}
