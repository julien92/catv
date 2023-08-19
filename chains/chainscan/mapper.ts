import { Transaction } from "../../model/transaction";
import { WalletType } from "../../model/wallet";
import { ChainScanTransaction } from "./model/ChainScanTransaction";

export const mapTransaction = (
  urls: { avatar: string; explorer: string },
  symbol: string,
  transaction: ChainScanTransaction
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


const convertAmount = (amount: number, decimal: number) => {
  return amount / 10 ** decimal;
};
