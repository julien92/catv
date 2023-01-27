import { Node, Transaction } from "../../tzkt/fetchTransactionTree";

export interface NodeGraph {
  id: string;
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

  const nodes = removeDuplicate(
    uniqueSenderAdress.concat(uniqueTargetAdress)
  ).map((address) => {
    return { id: address, val: 1 };
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
