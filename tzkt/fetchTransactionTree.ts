import axios from "axios";

const DEPTH = 4;
const LIMIT = 10;

interface TransactionIn {
  sender: { address: string; alias?: string };
  amount: number;
  timestamp: string;
}

interface TransactionOut {
  target: { address: string; alias?: string };
  amount: number;
  timestamp: string;
}

interface Node {
  address: string;
  alias?: string;
  senders: Node[];
  targets: Node[];
}

enum Direction {
  UP,
  DOWN,
  BOTH,
}

async function fetchTransactionsFrom(
  addresses: string[],
  from: Date,
  to: Date
) {
  const FIELDS = ["target", "amount", "timestamp"].join(",");
  const { data } = await axios.get<TransactionOut[]>(
    `https://api.tzkt.io/v1/operations/transactions/?select=${FIELDS}&sender.in=${addresses.join(
      ","
    )}&timestamp.gt=${from.toISOString()}&timestamp.le=${to.toISOString()}&limit=${LIMIT}`
  );

  return data;
}

async function fetchTransactionsTo(addresses: string[], from: Date, to: Date) {
  const FIELDS = ["sender", "amount", "timestamp"].join(",");

  const { data } = await axios.get<TransactionIn[]>(
    `https://api.tzkt.io/v1/operations/transactions/?select=${FIELDS}&target.in=${addresses.join(
      ","
    )}&timestamp.gt=${from.toISOString()}&timestamp.le=${to.toISOString()}&limit=${LIMIT}`
  );

  return data;
}

export default async function fetchTransactionTree(
  addresses: string[],
  from: Date,
  to: Date,
  direction = Direction.BOTH,
  count = DEPTH
): Promise<Node[]> {
  if (!count || addresses.length === 0)
    return addresses.map((address) => ({
      address,
      senders: [],
      targets: [],
    }));

  const transactionsFrom = await fetchTransactionsFrom(addresses, from, to);
  const targetAddresses = transactionsFrom.map((t) => t.target.address);
  const uniqueTargetAddresses = targetAddresses.filter(
    (address, index) => targetAddresses.indexOf(address) === index
  );
  const targets =
    direction !== Direction.UP
      ? await fetchTransactionTree(
          uniqueTargetAddresses,
          from,
          to,
          Direction.DOWN,
          count - 1
        )
      : [];

  const transactionsTo = await fetchTransactionsTo(addresses, from, to);
  const senderAddresses = transactionsTo.map((t) => t.sender.address);
  const uniqueSenderAddresses = senderAddresses.filter(
    (address, index) => senderAddresses.indexOf(address) === index
  );
  const senders =
    direction !== Direction.DOWN
      ? await fetchTransactionTree(
          uniqueSenderAddresses,
          from,
          to,
          Direction.UP,
          count - 1
        )
      : [];

  return addresses.map((address) => ({
    address,
    senders,
    targets,
  }));
}
