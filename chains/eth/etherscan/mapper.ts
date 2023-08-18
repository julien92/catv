import { Transaction } from "../../../model/transaction";
import { WalletType } from "../../../model/wallet";
import { TokenTransaction } from "../../tezos/tzkt/model/TokenTransaction";
import { EtherscanTransaction } from "./model/EtherscanTransaction";

export const mapEthTransaction = (
  transaction: EtherscanTransaction
): Transaction => {
  return {
    ...transaction,
    id: transaction.hash,
    timestamp: transaction.timeStamp,
    operationId: transaction.hash,
    amount: convertAmount(+transaction.value, 18),
    symbol: "ETH",
    sender: buildWallet(transaction.from),
    target: buildWallet(transaction.to),
    displayUrl: `https://etherscan.io/tx/${transaction.hash}`,
  };
};

const buildWallet = (address: string) => {
  return {
    alias: undefined,
    address: address,
    type: WalletType.User,
    avatarUrl: `https://effigy.im/a/${address}.png`,
    displayUrl: `https://etherscan.io/address/${address}`,
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
