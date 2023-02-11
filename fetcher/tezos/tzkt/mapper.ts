import { Transaction } from "../../../model/transaction";
import { Wallet } from "../../../model/wallet";
import { getWalletType } from "../util/tezosUtil";
import { TzktTransaction } from "./model/TzktTransaction";
import { isFinancialAssetsTransfer } from "./tzktUtil";

export const mapTzktTransaction = (transaction: TzktTransaction) => {
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

  computeWalletInformation(mappedTx.sender);
  computeWalletInformation(mappedTx.target);

  return mappedTx;
};

const computeWalletInformation = (wallet: Wallet) => {
  computeWalletUrl(wallet);
  wallet.type = getWalletType(wallet);
};

const computeWalletUrl = (wallet: Wallet) => {
  wallet.avatarUrl = `https://services.tzkt.io/v1/avatars/${wallet.address}`;
  wallet.displayUrl = `https://tzkt.io/${wallet.address}`;
};
