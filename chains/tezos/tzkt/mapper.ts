import { Transaction } from "../../../model/transaction";
import { Wallet } from "../../../model/wallet";
import { getWalletType } from "../util/tezosUtil";
import { TokenTransaction } from "./model/TokenTransaction";
import { TzktTransaction } from "./model/TzktTransaction";

export const mapXtzTransaction = (
  transaction: TzktTransaction
): Transaction => {
  return {
    ...transaction,
    operationId: transaction.hash,
    amount: convertAmount(transaction.amount, 6),
    symbol: "XTZ",
    sender: buildWallet(transaction.sender),
    target: buildWallet(transaction.target),
    displayUrl: `https://tzkt.io/${transaction.hash}`,
  };
};

export const mapTokensTransaction = (
  transaction: TokenTransaction
): Transaction => {
  if (transaction.to === undefined || transaction.from === undefined) {
    debugger;
  }
  return {
    ...transaction,
    operationId: `${transaction.transactionId}`,
    amount: convertTokenAmount(transaction),
    target: buildWallet(transaction.to),
    sender: buildWallet(transaction.from),
    symbol:
      transaction.token.metadata?.symbol || transaction.token.metadata?.name,
    displayUrl: `https://tzkt.io/transactions/${transaction.transactionId}`,
  };
};

const buildWallet = (wallet: Wallet) => {
  return {
    ...wallet,
    type: getWalletType(wallet),
    avatarUrl: `https://services.tzkt.io/v1/avatars/${wallet.address}`,
    displayUrl: `https://tzkt.io/${wallet.address}`,
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
