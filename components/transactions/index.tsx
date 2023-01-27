import { Transaction } from "../../tzkt/fetchTransactionTree";

interface Props {
  transactions: Transaction[];
}
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useEffect, useState } from "react";

const columns: GridColDef[] = [
  { field: "id", headerName: "Transaction", width: 150 },
  { field: "sender", headerName: "From", width: 335 },
  { field: "target", headerName: "To", width: 335 },
  { field: "time", headerName: "Time", width: 200 },
];

interface Rows {
  id: string;
  sender: string;
  target: string;
  time: string;
}

export default function Transactions({ transactions }: Props) {
  const [rows, setRows] = useState<Rows[]>([]);
  useEffect(() => {
    console.log("try to catch change", transactions);
    if (!transactions || transactions.length == 0) return;

    if (transactions?.length > 0) {
      setRows(buildRows(transactions));
    }
  }, [transactions]);

  return (
    <>
      <div style={{ height: 400, width: 1200 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5]}
          checkboxSelection
        />
      </div>
    </>
  );
}

function buildRows(transactions: Transaction[]): Rows[] {
  console.log("build rows", transactions);
  return transactions.map((transaction) => {
    return {
      id: transaction.id,
      sender: transaction.sender.address,
      target: transaction.target.address,
      time: transaction.timestamp,
    };
  });
}
