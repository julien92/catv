import SelectInput from "@mui/material/Select/SelectInput";
import axios from "axios";

const DEPTH = 2;
const LIMIT = 10;

interface Transaction {
  target: { address: string; alias?: string };
  sender: { address: string; alias?: string };
  amount: number;
  timestamp: string;
}

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

export interface Node {
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

async function fetchTransactions(
  addresses: string[],
  from: Date,
  to: Date,
  type: "sender" | "target"
) {
  const FIELDS = ["target", "sender", "amount", "timestamp"].join(",");
  let results = [];

  for (let address of addresses) {
    if (!address.startsWith("KT1")) {
      const { data } = await axios.get<Transaction[]>(
        `https://api.tzkt.io/v1/operations/transactions/?select=${FIELDS}&${type}=${address}&timestamp.gt=${from.toISOString()}&timestamp.le=${to.toISOString()}&limit=${LIMIT}`
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

// async function fetchTransactionsTo(addresses: string[], from: Date, to: Date) {
//   const FIELDS = ["sender", "amount", "timestamp"].join(",");

//   const promises = addresses.map((address) => {
//     return axios.get<TransactionOut[]>(
//       `https://api.tzkt.io/v1/operations/transactions/?select=${FIELDS}&target.eq=${address}&timestamp.gt=${from.toISOString()}&timestamp.le=${to.toISOString()}&limit=${LIMIT}`
//     );
//   });

//   return await Promise.all(promises);
// }

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

  const transactionsFrom = await fetchTransactions(
    addresses,
    from,
    to,
    "sender"
  );
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

  const transactionsTo = await fetchTransactions(addresses, from, to, "target");
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
