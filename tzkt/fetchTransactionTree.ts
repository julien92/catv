import axios from "axios";
import { Transaction } from "../model/transaction";
import { Wallet } from "../model/wallet";
import {
  isFinancialAssetsTransfer,
  isSmartContract,
  isUserWallet,
} from "../util/tezosUtil";

const DEFAULT_DEPTH = 1;
const DEFAULT_LIMIT = 20;

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
  type: "sender" | "target",
  limit: number
) {
  let results = [];

  for (let wallet of wallets) {
    if (isUserWallet(wallet)) {
      const { data } = await axios.get<Transaction[]>(
        `https://api.tzkt.io/v1/operations/transactions/?${type}=${
          wallet.address
        }&timestamp.ge=${start.toISOString()}&timestamp.le=${end.toISOString()}&limit=${limit}`
      );
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
  wallets: Wallet[],
  transactions: Transaction[],
  start: Date,
  end: Date,
  direction: Direction.IN | Direction.OUT,
  limit: number
): Promise<Wallet[]> {
  const tx = await fetchTransactions(
    wallets,
    transactions,
    start,
    end,
    direction === Direction.IN ? "target" : "sender",
    limit
  );

  const smartContractTransferTx = tx.filter((t) => {
    isFinancialAssetsTransfer(t);
  });

  const directTx = tx.filter((x) => !smartContractTransferTx.includes(x));

  let walletDiscovered: Wallet[] = directTx.map((t) =>
    direction === Direction.IN ? t.sender : t.target
  );

  if (smartContractTransferTx) {
    walletDiscovered = walletDiscovered.concat(
      smartContractTransferTx.map((t) =>
        direction === Direction.IN
          ? t.parameter.entrypoint.from
          : t.parameter.entrypoint.to
      )
    );
  }
  const walletAddresses = walletDiscovered.map(
    (transaction) => transaction.address
  );
  return walletDiscovered.filter(
    ({ address }, index) => !walletAddresses.includes(address, index + 1)
  );
}

async function fetchChildTransactions(
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
    wallets,
    transactions,
    start,
    end,
    direction,
    limit
  );

  const children = await fetchChildTransactions(
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

export default async function fetchTransactionTree(
  wallets: Wallet[],
  start: Date,
  end: Date,
  depth = DEFAULT_DEPTH,
  limit = DEFAULT_LIMIT
): Promise<Transaction[]> {
  const transactions = [];

  await fetchChildTransactions(
    wallets,
    transactions,
    start,
    end,
    Direction.OUT,
    depth - 1,
    limit
  );

  await fetchChildTransactions(
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
