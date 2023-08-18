import { Tzkt } from "./tezos/tzkt/api";
import { Transaction } from "../model/transaction";
import { Wallet, WalletType } from "../model/wallet";
import { Etherscan } from "./eth/etherscan/api";
import { Chain, fetcher } from "./fetcher";

export interface Node {
  wallet: Wallet;
  senders: Node[];
  targets: Node[];
}

enum Direction {
  IN,
  OUT,
  BOTH,
}

const FETCHER_MAP: Record<Chain, fetcher> = {
  tezos: new Tzkt(),
  eth: new Etherscan(
    "https://api.etherscan.io/api",
    "V5VMR4K591VVWZW723XWVRKT6P2BGCS9HN",
    { avatar: "https://effigy.im/a", explorer: "https://etherscan.io" },
    "ETH"
  ),
  bnb: new Etherscan(
    "https://api.bscscan.com/api",
    "TAJ7576G5TEGSQVUGUR4ESNI7IZRGZMK4B",
    { avatar: "https://effigy.im/a", explorer: "https://bscscan.com" },
    "BNB"
  ),
};

async function fetchTransactions(
  chain: Chain,
  wallets: Wallet[],
  transactions: Transaction[],
  start: Date,
  end: Date,
  type: "sender" | "target",
  limit: number
) {
  let results = [];
  const fetcher = FETCHER_MAP[chain];

  for (let wallet of wallets) {
    if (wallet.type === WalletType.User) {
      const data = await fetcher.get({
        address: wallet.address,
        type,
        start,
        end,
        limit,
      });
      await sleep(20);

      data.forEach((tx) => {
        transactions.push(tx);
      });
      results = results.concat(data);
    }
  }

  return results;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchUniqueWallet(
  chain: Chain,
  wallets: Wallet[],
  transactions: Transaction[],
  start: Date,
  end: Date,
  direction: Direction.IN | Direction.OUT,
  limit: number
): Promise<Wallet[]> {
  const tx = await fetchTransactions(
    chain,
    wallets,
    transactions,
    start,
    end,
    direction === Direction.IN ? "target" : "sender",
    limit
  );

  let walletDiscovered: Wallet[] = tx.map((t) =>
    direction === Direction.IN ? t.sender : t.target
  );

  const walletAddresses = walletDiscovered.map(
    (transaction) => transaction.address
  );
  return walletDiscovered.filter(
    ({ address }, index) => !walletAddresses.includes(address, index + 1)
  );
}

async function fetchChildTransactions(
  chain: Chain,
  wallets: Wallet[],
  transactions: Transaction[],
  start: Date,
  end: Date,
  direction: Direction.IN | Direction.OUT,
  count,
  limit
): Promise<Node[]> {
  if (count < 0) return [];

  const uniqueWallets = await fetchUniqueWallet(
    chain,
    wallets,
    transactions,
    start,
    end,
    direction,
    limit
  );

  const children = await fetchChildTransactions(
    chain,
    uniqueWallets,
    transactions,
    start,
    end,
    direction,
    count - 1,
    limit
  );

  return uniqueWallets.map((wallet) => ({
    wallet,
    senders: direction === Direction.IN ? children : [],
    targets: direction === Direction.OUT ? children : [],
  }));
}

export default async function getTransactions(
  chain: Chain,
  wallets: Wallet[],
  start: Date,
  end: Date,
  depth,
  limit
): Promise<Transaction[]> {
  const transactions = [];

  await fetchChildTransactions(
    chain,
    wallets,
    transactions,
    start,
    end,
    Direction.OUT,
    depth - 1,
    limit
  );

  await fetchChildTransactions(
    chain,
    wallets,
    transactions,
    start,
    end,
    Direction.IN,
    depth - 1,
    limit
  );

  const uniqueTx = transactions.filter(
    (t1, i, a) => a.findIndex((t2) => t2.id === t1.id) === i
  );

  return uniqueTx;
}
