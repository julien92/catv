import { DataGrid, GridColDef } from "@mui/x-data-grid";
import axios from "axios";
import { useEffect, useState } from "react";
import { TokenTransfer } from "../../model/token";
import { Transaction } from "../../model/transaction";
import { Wallet } from "../../model/wallet";
import { isFinancialAssetsTransfer } from "../../util/tezosUtil";
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
  amount: string;
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
    const isFinancialAssetsTx = isFinancialAssetsTransfer(transaction);
    const sender = isFinancialAssetsTx
      ? transaction.parameter.value.from
      : getAliasIfExist(transaction.sender);
    const target = isFinancialAssetsTx
      ? transaction.parameter.value.to
      : getAliasIfExist(transaction.target);

    // TODO UNCOMMENT WHEN RETRIEVE TOKENS
    // const amount = isFinancialAssetsTx
    //   ? getAmountFinancialAsset(transaction)
    //   : getAmount(transaction);

    return {
      id: transaction.id,
      hash: transaction.hash,
      sender: sender,
      target: target,
      time: transaction.timestamp,
      // TODO RETRIEVE AMOUNT FROM FINANCIAL ASSET
      amount: getAmount(transaction),
    };
  });
}

const getAmountFinancialAsset = async (transaction: Transaction) => {
  const tokenTransfert = await getFinancialAssetsSymbol(transaction);
  return tokenTransfert.amount + tokenTransfert.token.metadata.symbol;
};

const getFinancialAssetsSymbol = async (
  transaction: Transaction
): Promise<TokenTransfer> => {
  const { data } = await axios.get<TokenTransfer[]>(
    `https://back.tzkt.io/v1/tokens/transfers?transactionId.eq=${transaction.id}`
  );

  return data[0];
};

const getAliasIfExist = (wallet: Wallet) => {
  return wallet.alias ? wallet.alias : wallet.address;
};

const getAmount = (transaction: Transaction): string => {
  let amount = transaction.amount;

  if (amount == 0) {
    return undefined;
  }

  return (transaction.amount / 1000000).toString();
};
