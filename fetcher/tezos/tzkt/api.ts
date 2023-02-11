import axios from "axios";
import { Criteria, fetcher } from "../../fetcher";
import { TokenTransfer } from "./model/token";
import { Transaction } from "../../../model/transaction";
import { computeWalletType } from "../util/tezosUtil";
import { TzktTransaction } from "./model/TzktTransaction";
import { isFinancialAssetsTransfer } from "./tzktUtil";
import { Wallet } from "../../../model/wallet";

export class Tzkt implements fetcher {
  async get(criteria: Criteria): Promise<Transaction[]> {
    const { data } = await axios.get<TzktTransaction[]>(
      `https://api.tzkt.io/v1/operations/transactions/?${criteria.type}=${
        criteria.address
      }&timestamp.ge=${criteria.start.toISOString()}&timestamp.le=${criteria.end.toISOString()}&limit=${
        criteria.limit
      }`
    );

    return data.map((t) => this.mapTzktTransaction(t));
  }

  mapTzktTransaction(transaction: TzktTransaction): Transaction {
    let mappedTx: Transaction = transaction;

    if (isFinancialAssetsTransfer(transaction)) {
      const parameterValue = transaction.parameter.value;
      mappedTx.sender = {
        address: parameterValue.from,
        alias: transaction.sender.alias,
        type: undefined,
        avatarUrl: "",
        displayUrl: "",
      };
      mappedTx.target = {
        address: transaction.parameter.value.to,
        alias: undefined,
        type: undefined,
        avatarUrl: "",
        displayUrl: "",
      };
    }

    this.computeWalletUrl(mappedTx.sender);
    this.computeWalletUrl(mappedTx.target);

    mappedTx.target.type = computeWalletType(mappedTx.target);
    mappedTx.sender.type = computeWalletType(mappedTx.sender);

    return mappedTx;
  }

  computeWalletUrl = (wallet: Wallet) => {
    wallet.avatarUrl = `https://services.tzkt.io/v1/avatars/${wallet.address}`;
    wallet.displayUrl = `https://tzkt.io/${wallet.address}`;
  };

  async getFinancialAssetsSymbol(
    transaction: Transaction
  ): Promise<TokenTransfer> {
    const { data } = await axios.get<TokenTransfer[]>(
      `https://back.tzkt.io/v1/tokens/transfers?transactionId.eq=${transaction.id}`
    );

    return data[0];
  }
}
