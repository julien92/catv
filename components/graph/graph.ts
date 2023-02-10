import { Transaction } from "../../model/transaction";
import {
  computeWalletType,
  getTransactionSource,
  getTransactionTarget,
  isFinancialAssetsTransfer,
} from "../../util/tezosUtil";

export interface NodeGraph {
  id: string;
  alias: string;
  val: number;
}

export interface Link {
  source: string;
  target: string;
}
export interface Graph {
  nodes: NodeGraph[];
  links: Link[];
}

export const buildGraph = (
  transactions: Transaction[],
  rootAddress: string
) => {
  const uniqueSenderAdress = transactions.map((t) => getTransactionSource(t));
  const uniqueTargetAdress = transactions.map((t) => getTransactionTarget(t));

  var aliasByWallet = transactions.reduce(function (map, t) {
    map[t.sender.address] = t.sender.alias;
    map[t.target.address] = t.target.alias;
    return map;
  }, {});

  const nodes = removeDuplicate(
    uniqueSenderAdress.concat(uniqueTargetAdress)
  ).map((address) => {
    const alias = aliasByWallet[address];
    return {
      id: address,
      val: 1,
      alias,
      walletType: computeWalletType({ address, alias }),
      isRootAddress: address === rootAddress,
    };
  });

  const links = transactions.map((t) => {
    return { source: getTransactionSource(t), target: getTransactionTarget(t) };
  });

  return {
    nodes,
    links,
  };
};

function removeDuplicate(address: string[]) {
  return address.filter(
    (addr, index, a) => a.findIndex((addr2) => addr2 === addr) === index
  );
}
