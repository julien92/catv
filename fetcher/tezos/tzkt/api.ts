import axios from "axios";
import { Criteria, fetcher } from "../../fetcher";
import { TokenTransfer } from "./model/token";
import { Transaction } from "../../../model/transaction";
import { TzktTransaction } from "./model/TzktTransaction";
import { mapTokensTransaction, mapXtzTransaction } from "./mapper";
import { TokenTransaction } from "./model/TokenTransaction";

const API_URL = "https://api.tzkt.io/v1";
export class Tzkt implements fetcher {
  async get(criteria: Criteria): Promise<Transaction[]> {
    const tx1 = this.getXtzTransactions(criteria);
    const tx2 = this.getTokensTransactions(criteria);

    return (await Promise.all([tx1, tx2])).flat();
  }

  async getXtzTransactions(criteria: Criteria): Promise<Transaction[]> {
    const { data } = await axios.get<TzktTransaction[]>(
      `${API_URL}/operations/transactions/?${criteria.type}=${
        criteria.address
      }&timestamp.ge=${criteria.start.toISOString()}&amount.gt=0&timestamp.le=${criteria.end.toISOString()}&limit=${
        criteria.limit
      }`
    );

    return data
      .filter((t) => t.sender && t.target)
      .map((t) => mapXtzTransaction(t));
  }

  async getTokensTransactions(criteria: Criteria): Promise<Transaction[]> {
    const accountParameter = criteria.type === "sender" ? "from" : "to";

    const { data } = await axios.get<TokenTransaction[]>(
      `${API_URL}/tokens/transfers?${accountParameter}=${
        criteria.address
      }&timestamp.ge=${criteria.start.toISOString()}&amount.gt=0&timestamp.le=${criteria.end.toISOString()}&limit=${
        criteria.limit
      }`
    );

    return data
      .filter((t) => t.to && t.from)
      .map((t) => mapTokensTransaction(t));
  }

  async getFinancialAssetsSymbol(
    transaction: Transaction
  ): Promise<TokenTransfer> {
    const { data } = await axios.get<TokenTransfer[]>(
      `${API_URL}/tokens/transfers?transactionId.eq=${transaction.id}`
    );

    return data[0];
  }
}
