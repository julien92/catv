import { Transaction } from "../../model/transaction";
import {
  computeWalletType,
  isFinancialAssetsTransfer,
  isSmartContract,
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
  const transferTx = transactions.filter((t) => isFinancialAssetsTransfer(t));
  const directTx = transactions.filter((x) => !transferTx.includes(x));
  const uniqueSenderAdress = directTx.map((t) => t.sender.address);
  const uniqueTargetAdress = directTx.map((t) => t.target.address);

  var aliasByWallet = transactions.reduce(function (map, t) {
    map[t.sender.address] = t.sender.alias;
    map[t.target.address] = t.target.alias;
    return map;
  }, {});

  const nodes = removeDuplicate(
    uniqueSenderAdress
      .concat(uniqueTargetAdress)
      .concat(transferTx.map((t) => t.parameter.value.to))
      .concat(transferTx.map((t) => t.parameter.value.from))
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

  const directLinks = directTx.map((t) => {
    return { source: t.sender.address, target: t.target.address };
  });

  const linksTransfer = transferTx.map((t) => {
    return { source: t.parameter.value.from, target: t.parameter.value.to };
  });

  const links = directLinks.concat(linksTransfer);

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
