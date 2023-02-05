import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { Transaction } from "../../model/transaction";
import { Wallet } from "../../model/wallet";
import styles from "./styles.module.css";

const columns: GridColDef[] = [
  { field: "hash", headerName: "Transaction", width: 150 },
  { field: "sender", headerName: "From", width: 335 },
  { field: "target", headerName: "To", width: 335 },
  { field: "time", headerName: "Time", width: 200 },
  { field: "amount", headerName: "Amount", width: 100 },
];

interface Props {
  transactions: Transaction[];
}
interface Rows {
  id: string;
  hash: string;
  sender: string;
  target: string;
  time: string;
  amount: number;
}

export default function Transactions({ transactions }: Props) {
  const [rows, setRows] = useState<Rows[]>([]);
  useEffect(() => {
    if (!transactions || transactions.length == 0) return;

    if (transactions?.length > 0) {
      setRows(buildRows(transactions));
    }
  }, [transactions]);

  return (
    <>
      <div className={styles.tab}>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5]}
          onCellDoubleClick={onDoubleClick}
        />
      </div>
    </>
  );
}

const onDoubleClick = (event) => {
  const row = event.row;
  window.open(`https://tzkt.io/${row.hash}`, "_blank");
};

function buildRows(transactions: Transaction[]): Rows[] {
  return transactions.map((transaction) => {
    return {
      id: transaction.id,
      hash: transaction.hash,
      sender: getAliasIfExist(transaction.sender),
      target: getAliasIfExist(transaction.target),
      time: transaction.timestamp,
      amount: getAmount(transaction),
    };
  });
}

const getAliasIfExist = (wallet: Wallet) => {
  return wallet.alias ? wallet.alias : wallet.address;
};

const getAmount = (transaction: Transaction): number => {
  let amount = transaction.amount;

  if (amount == 0) {
    return undefined;
  }

  return transaction.amount / 1000000;
};
