import { isSmartContract } from "../util/tezosUtil";
import { TzktTransaction } from "./model/TzktTransaction";

export function isFinancialAssetsTransfer(transaction: TzktTransaction) {
  return (
    isSmartContract(transaction.target.address) &&
    transaction.parameter?.entrypoint === "transfer" &&
    transaction.amount > 0
  );
}
