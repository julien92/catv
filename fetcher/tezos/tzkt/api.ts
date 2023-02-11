import axios from "axios";
import { Criteria, fetcher } from "../../fetcher";
import { TokenTransfer } from "./model/token";
import { Transaction } from "../../../model/transaction";
import { TzktTransaction } from "./model/TzktTransaction";
import { mapTzktTransaction } from "./mapper";

export class Tzkt implements fetcher {
  async get(criteria: Criteria): Promise<Transaction[]> {
    const { data } = await axios.get<TzktTransaction[]>(
      `https://api.tzkt.io/v1/operations/transactions/?${criteria.type}=${
        criteria.address
      }&timestamp.ge=${criteria.start.toISOString()}&timestamp.le=${criteria.end.toISOString()}&limit=${
        criteria.limit
      }`
    );

    return data.map((t) => mapTzktTransaction(t));
  }

  async getFinancialAssetsSymbol(
    transaction: Transaction
  ): Promise<TokenTransfer> {
    const { data } = await axios.get<TokenTransfer[]>(
      `https://back.tzkt.io/v1/tokens/transfers?transactionId.eq=${transaction.id}`
    );

    return data[0];
  }
}
