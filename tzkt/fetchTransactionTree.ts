import axios from "axios";

const FIELDS = ["target", "amount", "timestamp"].join(",");

interface Transaction {
  target: { address: string; alias?: string };
  amount: number;
  timestamp: string;
}

interface Node {
  address: string;
  alias?: string;
  //   senders: Node[];
  targets: Node[];
}

async function fetchTransactions(address: string, from: Date, to: Date) {
  const { data } = await axios.get<Transaction[]>(
    `https://api.tzkt.io/v1/operations/transactions/?select=${FIELDS}&sender=${address}&timestamp.gt=${from.toISOString()}&timestamp.le=${to.toISOString()}&limit=10`
  );

  return data;
}

export default async function fetchTransactionTree(
  address: string,
  from: Date,
  to: Date,
  count = 4
): Promise<Node> {
  if (!count)
    return {
      address,
      targets: [],
    };

  const transactions = await fetchTransactions(address, from, to);
  const addresses = transactions.map((t) => t.target.address);
  const uniqueAddresses = addresses.filter(
    (address, index) => addresses.indexOf(address) === index
  );

  return {
    address,
    targets: await Promise.all(
      uniqueAddresses.map((address) =>
        fetchTransactionTree(address, from, to, count - 1)
      )
    ),
  };
}
