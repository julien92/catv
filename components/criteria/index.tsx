import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  InputAdornment,
  Box,
  Chip,
} from "@mui/material";
import TextField from "@mui/material/TextField";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import moment, { Moment } from "moment";
import { ChangeEvent, useCallback, useMemo } from "react";

import { Chain } from "../../chains/fetcher";

import styles from "./styles.module.css";
import validateAddress from "../../chains/validator";

export interface CriteriaValue {
  address: string;
  chain: Chain;
  depth: number;
  limit: number;
  from: Date;
  to: Date;
}

interface Props {
  value: CriteriaValue;
  onChange: (value: CriteriaValue) => void;
  disabled?: boolean;
}

const chainConfig: Record<Chain, { label: string; color: string; icon: string }> = {
  tezos: { label: "Tezos", color: "#0D61FF", icon: "XTZ" },
  eth: { label: "Ethereum", color: "#627EEA", icon: "ETH" },
  bnb: { label: "BNB Chain", color: "#F3BA2F", icon: "BNB" },
  matic: { label: "Polygon", color: "#8247E5", icon: "MATIC" },
};

const menuProps = {
  PaperProps: {
    sx: {
      maxHeight: 300,
      mt: 0.5,
      "& .MuiMenuItem-root": {
        py: 1.5,
        px: 2,
        "&:hover": {
          backgroundColor: "rgba(139, 92, 246, 0.1)",
        },
        "&.Mui-selected": {
          backgroundColor: "rgba(139, 92, 246, 0.2)",
          "&:hover": {
            backgroundColor: "rgba(139, 92, 246, 0.25)",
          },
        },
      },
    },
  },
  MenuListProps: {
    sx: {
      py: 0.5,
    },
  },
  anchorOrigin: {
    vertical: "bottom" as const,
    horizontal: "left" as const,
  },
  transformOrigin: {
    vertical: "top" as const,
    horizontal: "left" as const,
  },
};

export default function Criteria({ value, onChange, disabled = false }: Props) {
  const handleAddressChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange({ ...value, address: event.target.value });
  };

  const handleChainChange = (event: SelectChangeEvent<string>) => {
    onChange({ ...value, chain: event.target.value as Chain, address: "" });
  };

  const handleDepthChange = (event: SelectChangeEvent<number>) => {
    onChange({ ...value, depth: event.target.value as number });
  };

  const handleTxLimitChange = (event: SelectChangeEvent<number>) => {
    onChange({ ...value, limit: event.target.value as number });
  };

  const handleDateFromChange = (v: Moment | null) => {
    if (!v?.isValid()) return;
    onChange({ ...value, from: v.toDate() });
  };

  const handleDateToChange = (v: Moment | null) => {
    if (!v?.isValid()) return;
    onChange({ ...value, to: v.toDate() });
  };

  const validateWalletInput = useCallback(
    (address: string) =>
      value.address.length > 0 && !validateAddress(value.chain, address),
    [value.chain, value.address]
  );

  const minDateTime = useMemo(() => moment(value.from), [value.from]);
  const maxDateTime = useMemo(() => moment(value.to), [value.to]);

  const currentChain = chainConfig[value.chain];

  return (
    <div className={styles.criteriaWrapper}>
      <div className={styles.criteria}>
        {/* Chain Selection */}
        <FormControl className={styles.chainSelect} size="small">
          <InputLabel id="chain-label">Chain</InputLabel>
          <Select
            labelId="chain-label"
            value={value.chain}
            label="Chain"
            onChange={handleChainChange}
            disabled={disabled}
            MenuProps={menuProps}
            renderValue={(selected) => (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Chip
                  label={chainConfig[selected as Chain].icon}
                  size="small"
                  sx={{
                    backgroundColor: chainConfig[selected as Chain].color,
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: "0.7rem",
                    height: 22,
                  }}
                />
                <span>{chainConfig[selected as Chain].label}</span>
              </Box>
            )}
          >
            {Object.entries(chainConfig).map(([key, config]) => {
              const isDisabled = key === "bnb" || key === "matic";
              return (
                <MenuItem key={key} value={key} disabled={isDisabled}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, opacity: isDisabled ? 0.4 : 1 }}>
                    <Chip
                      label={config.icon}
                      size="small"
                      sx={{
                        backgroundColor: config.color,
                        color: "#fff",
                        fontWeight: 600,
                        fontSize: "0.7rem",
                        height: 22,
                        minWidth: 50,
                      }}
                    />
                    <span>{config.label}</span>
                    {isDisabled && <span style={{ fontSize: "0.65rem", color: "#64748B" }}>(API payante)</span>}
                  </Box>
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>

        {/* Address Input */}
        <TextField
          error={validateWalletInput(value.address)}
          placeholder={`Enter ${currentChain.label} wallet address`}
          value={value.address}
          onChange={handleAddressChange}
          className={styles.addressInput}
          helperText={
            validateWalletInput(value.address)
              ? `Invalid ${currentChain.label} address format`
              : ""
          }
          size="small"
          disabled={disabled}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Chip
                  label={currentChain.icon}
                  size="small"
                  sx={{
                    backgroundColor: currentChain.color,
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: "0.65rem",
                    height: 20,
                  }}
                />
              </InputAdornment>
            ),
          }}
        />

        {/* Depth Selection */}
        <FormControl className={styles.depthSelect} size="small">
          <InputLabel id="depth-label">Depth</InputLabel>
          <Select
            labelId="depth-label"
            value={value.depth}
            label="Depth"
            onChange={handleDepthChange}
            disabled={disabled}
            MenuProps={menuProps}
          >
            <MenuItem value={1}>1 level</MenuItem>
            <MenuItem value={2}>2 levels</MenuItem>
            <MenuItem value={3}>3 levels</MenuItem>
            <MenuItem value={4}>4 levels</MenuItem>
          </Select>
        </FormControl>

        {/* Limit Selection */}
        <FormControl className={styles.limitSelect} size="small">
          <InputLabel id="limit-label">Limit</InputLabel>
          <Select
            labelId="limit-label"
            value={value.limit}
            label="Limit"
            onChange={handleTxLimitChange}
            disabled={disabled}
            MenuProps={menuProps}
          >
            <MenuItem value={20}>20 tx</MenuItem>
            <MenuItem value={50}>50 tx</MenuItem>
            <MenuItem value={100}>100 tx</MenuItem>
            <MenuItem value={1000}>1000 tx</MenuItem>
          </Select>
        </FormControl>

        {/* Date Range */}
        <div className={styles.dateRange}>
          <FormControl className={styles.dateSelect}>
            <DatePicker
              label="From"
              value={moment(value.from)}
              onChange={handleDateFromChange}
              slotProps={{
                textField: {
                  size: "small",
                  className: styles.datePicker,
                },
              }}
              disabled={disabled}
              maxDate={maxDateTime}
            />
          </FormControl>
          <span className={styles.dateSeparator}>to</span>
          <FormControl className={styles.dateSelect}>
            <DatePicker
              label="To"
              value={moment(value.to)}
              onChange={handleDateToChange}
              slotProps={{
                textField: {
                  size: "small",
                  className: styles.datePicker,
                },
              }}
              disabled={disabled}
              minDate={minDateTime}
            />
          </FormControl>
        </div>
      </div>
    </div>
  );
}
