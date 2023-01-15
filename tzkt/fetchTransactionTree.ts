import axios from "axios";

const DEPTH = 1;
const LIMIT = 100;

interface Transaction {
  target: { address: string; alias?: string };
  sender: { address: string; alias?: string };
  amount: number;
  timestamp: string;
}

export interface Node {
  address: string;
  alias?: string;
  senders: Node[];
  targets: Node[];
}

enum Direction {
  IN,
  OUT,
  BOTH,
}

async function fetchTransactions(
  addresses: string[],
  start: Date,
  end: Date,
  type: "sender" | "target"
) {
  const FIELDS = ["target", "sender", "amount", "timestamp"].join(",");
  let results = [];

  for (let address of addresses) {
    if (!address.startsWith("KT1")) {
      const { data } = await axios.get<Transaction[]>(
        `https://api.tzkt.io/v1/operations/transactions/?select=${FIELDS}&${type}=${address}&timestamp.gt=${start.toISOString()}&timestamp.le=${end.toISOString()}&limit=${LIMIT}`
      );
      await sleep(50);

      results = results.concat(data);
    }
  }

  return results;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchUniqueAddresses(
  addresses: string[],
  start: Date,
  end: Date,
  direction: Direction.IN | Direction.OUT
) {
  const transactions = await fetchTransactions(
    addresses,
    start,
    end,
    direction === Direction.IN ? "target" : "sender"
  );
  const txAddresses = transactions.map((t) =>
    direction === Direction.IN ? t.sender.address : t.target.address
  );
  return txAddresses.filter(
    (address, index) => txAddresses.indexOf(address) === index
  );
}

async function fetchChildTransactions(
  addresses: string[],
  start: Date,
  end: Date,
  direction: Direction.IN | Direction.OUT,
  count = DEPTH
) {
  if (count < 0) return [];

  const uniqueAddresses = await fetchUniqueAddresses(
    addresses,
    start,
    end,
    direction
  );

  const children = await fetchChildTransactions(
    uniqueAddresses,
    start,
    end,
    direction,
    count - 1
  );

  return uniqueAddresses.map((address) => ({
    address,
    senders: direction === Direction.IN ? children : [],
    targets: direction === Direction.OUT ? children : [],
  }));
}

export default async function fetchTransactionTree(
  addresses: string[],
  start: Date,
  end: Date,
  depth = DEPTH
): Promise<Node[]> {
  const targets = await fetchChildTransactions(
    addresses,
    start,
    end,
    Direction.OUT,
    depth - 1
  );

  const senders = await fetchChildTransactions(
    addresses,
    start,
    end,
    Direction.IN,
    depth - 1
  );

  return addresses.map((address) => ({
    address,
    senders,
    targets,
  }));
}
