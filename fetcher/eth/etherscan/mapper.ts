import {TzktTransaction} from "../../tezos/tzkt/model/TzktTransaction";
import {Transaction} from "../../../model/transaction";
import {Wallet, WalletType} from "../../../model/wallet";
import {getWalletType} from "../../tezos/util/tezosUtil";
import {TokenTransaction} from "../../tezos/tzkt/model/TokenTransaction";
import {EtherscanTransaction} from "./model/EtherscanTransaction";

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
    displayUrl: `https://tzkt.io/${transaction.hash}`,
  };
};


const buildWallet = (address: string) => {
  return {
    alias: undefined,
    address: address,
    type: WalletType.User,
    avatarUrl: `https://mapetiteassiette.com/wp-content/uploads/2019/05/shutterstock_553887610-e1557046359887-800x601.jpg`,
    displayUrl: `https://mapetiteassiette.com/wp-content/uploads/2019/05/shutterstock_553887610-e1557046359887-800x601.jpg`,
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