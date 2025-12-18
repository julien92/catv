import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { useEffect, useState, useMemo } from "react";
import { Transaction } from "../../model/transaction";
import { Wallet } from "../../model/wallet";
import { Chain } from "../../chains/fetcher";
import { Box, Chip, Tooltip, IconButton } from "@mui/material";
import styles from "./styles.module.css";

interface Props {
  transactions: Transaction[];
  chain?: Chain;
}

interface Rows {
  id: string;
  operationId: string;
  operationIdFull: string;
  sender: string;
  senderFull: string;
  target: string;
  targetFull: string;
  time: string;
  timeRelative: string;
  amount: number;
  amountFormatted: string;
  symbol: string;
  displayUrl: string;
}

const ArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

const ExternalLinkIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
  </svg>
);

export default function Transactions({ transactions, chain }: Props) {
  const [rows, setRows] = useState<Rows[]>([]);

  const columns: GridColDef[] = useMemo(() => [
    {
      field: "operationId",
      headerName: "TX Hash",
      flex: 0.8,
      minWidth: 130,
      renderCell: (params: GridRenderCellParams) => (
        <Tooltip title={params.row.operationIdFull} arrow placement="top">
          <Box className={styles.txHashCell}>
            <span className={styles.txHash}>{params.value}</span>
            <IconButton
              size="small"
              className={styles.externalLink}
              onClick={(e) => {
                e.stopPropagation();
                window.open(params.row.displayUrl, "_blank");
              }}
            >
              <ExternalLinkIcon />
            </IconButton>
          </Box>
        </Tooltip>
      ),
    },
    {
      field: "sender",
      headerName: "From",
      flex: 1.2,
      minWidth: 160,
      renderCell: (params: GridRenderCellParams) => (
        <Tooltip title={params.row.senderFull} arrow placement="top">
          <Box className={styles.addressCell}>
            <div className={styles.addressAvatar}>
              {params.row.senderFull.slice(0, 2)}
            </div>
            <span className={styles.address}>{params.value}</span>
          </Box>
        </Tooltip>
      ),
    },
    {
      field: "direction",
      headerName: "",
      width: 50,
      sortable: false,
      filterable: false,
      renderCell: () => (
        <Box className={styles.arrowCell}>
          <ArrowIcon />
        </Box>
      ),
    },
    {
      field: "target",
      headerName: "To",
      flex: 1.2,
      minWidth: 160,
      renderCell: (params: GridRenderCellParams) => (
        <Tooltip title={params.row.targetFull} arrow placement="top">
          <Box className={styles.addressCell}>
            <div className={styles.addressAvatar}>
              {params.row.targetFull.slice(0, 2)}
            </div>
            <span className={styles.address}>{params.value}</span>
          </Box>
        </Tooltip>
      ),
    },
    {
      field: "amount",
      headerName: "Amount",
      flex: 0.9,
      minWidth: 140,
      align: "right",
      headerAlign: "right",
      renderCell: (params: GridRenderCellParams) => (
        <Box className={styles.amountCell}>
          <span className={styles.amountValue}>{params.row.amountFormatted}</span>
          <Chip
            label={params.row.symbol}
            size="small"
            className={styles.symbolChip}
          />
        </Box>
      ),
    },
    {
      field: "time",
      headerName: "Time",
      flex: 0.8,
      minWidth: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Tooltip title={params.value} arrow placement="top">
          <Box className={styles.timeCell}>
            <span className={styles.timeRelative}>{params.row.timeRelative}</span>
          </Box>
        </Tooltip>
      ),
    },
  ], []);

  useEffect(() => {
    if (!transactions || transactions.length === 0) {
      setRows([]);
      return;
    }
    setRows(buildRows(transactions));
  }, [transactions]);

  if (transactions.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <div className={styles.emptyIcon}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <path d="M3 10h18M7 15h4M7 12h2" />
          </svg>
        </div>
        <p className={styles.emptyText}>No transactions found</p>
        <p className={styles.emptySubtext}>
          Enter a wallet address to explore its transaction history
        </p>
      </div>
    );
  }

  return (
    <div className={styles.tableContainer}>
      <DataGrid
        rows={rows}
        columns={columns}
        initialState={{
          pagination: { paginationModel: { pageSize: 10 } },
          sorting: { sortModel: [{ field: "time", sort: "desc" }] },
        }}
        pageSizeOptions={[10, 25, 50]}
        disableRowSelectionOnClick
        disableColumnMenu
        rowHeight={56}
        sx={{
          border: "none",
          backgroundColor: "transparent",
          fontSize: "0.75rem",
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: "rgba(255, 255, 255, 0.02)",
            borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
            minHeight: "40px !important",
            maxHeight: "40px !important",
          },
          "& .MuiDataGrid-columnHeader": {
            color: "#6B7280",
            fontSize: "0.65rem",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          },
          "& .MuiDataGrid-columnSeparator": {
            display: "none",
          },
          "& .MuiDataGrid-cell": {
            borderColor: "rgba(255, 255, 255, 0.03)",
            padding: "0 12px",
            "&:focus": {
              outline: "none",
            },
            "&:focus-within": {
              outline: "none",
            },
          },
          "& .MuiDataGrid-row": {
            transition: "background-color 0.1s ease",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.02)",
            },
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "1px solid rgba(255, 255, 255, 0.06)",
            backgroundColor: "rgba(255, 255, 255, 0.01)",
            minHeight: "40px",
          },
          "& .MuiTablePagination-root": {
            color: "#6B7280",
            fontSize: "0.7rem",
          },
          "& .MuiTablePagination-selectIcon": {
            color: "#6B7280",
          },
          "& .MuiIconButton-root": {
            color: "#6B7280",
            "&:hover": {
              backgroundColor: "rgba(0, 212, 170, 0.1)",
            },
            "&.Mui-disabled": {
              color: "rgba(255, 255, 255, 0.15)",
            },
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: "transparent",
          },
          "& .MuiDataGrid-overlay": {
            backgroundColor: "rgba(0, 0, 0, 0.8)",
          },
        }}
      />
    </div>
  );
}

function buildRows(transactions: Transaction[]): Rows[] {
  return transactions.map((transaction) => {
    return {
      id: transaction.id,
      operationId: truncateHash(transaction.operationId),
      operationIdFull: transaction.operationId,
      sender: getDisplayName(transaction.sender),
      senderFull: transaction.sender.alias || transaction.sender.address,
      target: getDisplayName(transaction.target),
      targetFull: transaction.target.alias || transaction.target.address,
      time: formatTime(transaction.timestamp),
      timeRelative: getRelativeTime(transaction.timestamp),
      amount: transaction.amount,
      amountFormatted: formatAmount(transaction.amount),
      symbol: transaction.symbol,
      displayUrl: transaction.displayUrl,
    };
  });
}

const getDisplayName = (wallet: Wallet) => {
  if (wallet.alias) {
    return wallet.alias.length > 16
      ? `${wallet.alias.slice(0, 14)}...`
      : wallet.alias;
  }
  const addr = wallet.address;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
};

const truncateHash = (hash: string) => {
  if (hash.length > 12) {
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
  }
  return hash;
};

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getRelativeTime = (timestamp: string) => {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
};

const formatAmount = (amount: number) => {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(2)}M`;
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(2)}K`;
  }
  if (amount < 0.01) {
    return amount.toFixed(6);
  }
  return amount.toFixed(2);
};
