import { Transaction } from "../../../model/transaction";
import { WalletType } from "../../../model/wallet";
import { TokenTransaction } from "../../tezos/tzkt/model/TokenTransaction";
import { EtherscanTransaction } from "./model/EtherscanTransaction";

export const mapEthTransaction = (
  urls: { avatar: string; explorer: string },
  symbol: string,
  transaction: EtherscanTransaction
): Transaction => {
  return {
    ...transaction,
    id: transaction.hash,
    timestamp: transaction.timeStamp,
    operationId: transaction.hash,
    amount: convertAmount(+transaction.value, 18),
    symbol: symbol,
    sender: buildWallet(urls, transaction.from),
    target: buildWallet(urls, transaction.to),
    displayUrl: `${urls.explorer}/tx/${transaction.hash}`,
  };
};

const buildWallet = (
  urls: { avatar: string; explorer: string },
  address: string
) => {
  return {
    alias: undefined,
    address: address,
    type: WalletType.User,
    avatarUrl: `${urls.avatar}/${address}.png`,
    displayUrl: `${urls.explorer}/address/${address}`,
  };
};

const convertTokenAmount = (tokenTransaction: TokenTransaction) => {
  return convertAmount(
    +tokenTransaction.amount,
    +tokenTransaction.token.metadata?.decimals || 0
  );
};

const convertAmount = (amount: number, decimal: number) => {
  return amount / 10 ** decimal;
};
