import axios from "axios";

const DEPTH = 1;
const LIMIT = 20;
const exchangeAliases = ["Binance withdrawal"];
export interface Transaction {
  id: string;
  target: Wallet;
  sender: Wallet;
  amount: number;
  timestamp: string;
  hash: string;
}

export interface Wallet {
  address: string;
  alias: string;
}

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

async function fetchTransactions(
  wallets: Wallet[],
  transactions: Transaction[],
  start: Date,
  end: Date,
  type: "sender" | "target"
) {
  let results = [];

  for (let wallet of wallets) {
    if (isUserWallet(wallet)) {
      const { data } = await axios.get<Transaction[]>(
        `https://api.tzkt.io/v1/operations/transactions/?${type}=${
          wallet.address
        }&timestamp.gt=${start.toISOString()}&timestamp.le=${end.toISOString()}&limit=${LIMIT}`
      );
      await sleep(50);

      data.forEach((tx) => {
        transactions.push(tx);
      });
      results = results.concat(data);
    }
  }

  return results;
}

function isUserWallet(wallet: Wallet) {
  const address = wallet.address;
  const isUserWallet = !(
    wallet.address.startsWith("KT1") || exchangeAliases.includes(wallet.alias)
  );
  return isUserWallet;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchUniqueWallet(
  wallets: Wallet[],
  transactions: Transaction[],
  start: Date,
  end: Date,
  direction: Direction.IN | Direction.OUT
): Promise<Wallet[]> {
  const tx = await fetchTransactions(
    wallets,
    transactions,
    start,
    end,
    direction === Direction.IN ? "target" : "sender"
  );

  const recipients: Wallet[] = tx.map((t) =>
    direction === Direction.IN ? t.sender : t.target
  );

  const walletAddresses = recipients.map((transaction) => transaction.address);
  return recipients.filter(
    ({ address }, index) => !walletAddresses.includes(address, index + 1)
  );
}

async function fetchChildTransactions(
  wallets: Wallet[],
  transactions: Transaction[],
  start: Date,
  end: Date,
  direction: Direction.IN | Direction.OUT,
  count = DEPTH
): Promise<Node[]> {
  if (count < 0) return [];

  const uniqueWallets = await fetchUniqueWallet(
    wallets,
    transactions,
    start,
    end,
    direction
  );

  const children = await fetchChildTransactions(
    uniqueWallets,
    transactions,
    start,
    end,
    direction,
    count - 1
  );

  return uniqueWallets.map((wallet) => ({
    wallet,
    senders: direction === Direction.IN ? children : [],
    targets: direction === Direction.OUT ? children : [],
  }));
}

export default async function fetchTransactionTree(
  wallets: Wallet[],
  start: Date,
  end: Date,
  depth = DEPTH
): Promise<Transaction[]> {
  const transactions = [];
  const targets = await fetchChildTransactions(
    wallets,
    transactions,
    start,
    end,
    Direction.OUT,
    depth - 1
  );

  const senders = await fetchChildTransactions(
    wallets,
    transactions,
    start,
    end,
    Direction.IN,
    depth - 1
  );

  const uniqueTx = transactions.filter(
    (t1, i, a) => a.findIndex((t2) => t2.id === t1.id) === i
  );

  console.log("transactions here", uniqueTx);
  return uniqueTx;
}
