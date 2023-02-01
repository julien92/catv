import { Node, Transaction } from "../../tzkt/fetchTransactionTree";

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

export const buildGraph = (transactions: Transaction[]) => {
  const uniqueSenderAdress = transactions.map((t) => t.sender.address);
  const uniqueTargetAdress = transactions.map((t) => t.target.address);

  var aliasByWallet = transactions.reduce(function (map, t) {
    map[t.sender.address] = t.sender.alias;
    map[t.target.address] = t.target.alias;
    return map;
  }, {});

  const nodes = removeDuplicate(
    uniqueSenderAdress.concat(uniqueTargetAdress)
  ).map((address) => {
    return { id: address, val: 1, alias: aliasByWallet[address] };
  });

  const links = transactions.map((t) => {
    return { source: t.sender.address, target: t.target.address };
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
