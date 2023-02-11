import { Transaction } from "../../model/transaction";
import { Wallet, WalletType } from "../../model/wallet";

export interface NodeGraph {
  id: string;
  alias: string;
  walletType: WalletType;
  val: number;
  isRootAddress: boolean;
  avatarUrl: string;
  dispalyUrl: string;
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
): Graph => {
  const wallets = [];

  transactions.forEach((t) => {
    wallets.push(t.sender);
    wallets.push(t.target);
  });

  const nodes = removeDuplicateWallet(wallets).map((wallet) => {
    return {
      id: wallet.address,
      alias: wallet.alias,
      walletType: wallet.type,
      val: 1,
      isRootAddress: wallet.address === rootAddress,
      avatarUrl: wallet.avatarUrl,
      dispalyUrl: wallet.displayUrl,
    };
  });

  const links = transactions.map((t) => {
    return { source: t.sender.address, target: t.target.address };
  });

  return {
    nodes,
    links,
  };
};

const removeDuplicateWallet = (wallets: Wallet[]) => {
  const addresses = wallets.map((transaction) => transaction.address);
  return wallets.filter(
    ({ address }, index) => !addresses.includes(address, index + 1)
  );
};
