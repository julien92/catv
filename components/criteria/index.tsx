import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import TextField from "@mui/material/TextField";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
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

export default function Criteria({ value, onChange, disabled = false }: Props) {
  const handleAddressChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange({ ...value, address: event.target.value });
  };

  const handleChainChange = (event: SelectChangeEvent<string>) => {
    onChange({ ...value, chain: event.target.value as Chain });
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

  return (
    <div className={styles.criteria}>
      <TextField
        error={validateWalletInput(value.address)}
        placeholder="Wallet address"
        fullWidth
        value={value.address}
        onChange={handleAddressChange}
        className={styles.addressInput}
        helperText={
          validateWalletInput(value.address)
            ? "Please enter a valid address"
            : ""
        }
        variant="standard"
        disabled={disabled}
      />

      <FormControl className={styles.depthSelect} size="small">
        <InputLabel>Chain</InputLabel>
        <Select
          value={value.chain}
          label="Chain"
          onChange={handleChainChange}
          disabled={disabled}
        >
          <MenuItem value="tezos">Tezos</MenuItem>
          <MenuItem value="eth">Ethereum</MenuItem>
          <MenuItem value="bnb">BNB</MenuItem>
          <MenuItem value="matic">Polygon</MenuItem>
        </Select>
      </FormControl>

      <FormControl className={styles.depthSelect} size="small">
        <InputLabel>Depth</InputLabel>
        <Select
          value={value.depth}
          label="Depth"
          onChange={handleDepthChange}
          disabled={disabled}
        >
          <MenuItem value={1}>1</MenuItem>
          <MenuItem value={2}>2</MenuItem>
          <MenuItem value={3}>3</MenuItem>
          <MenuItem value={4}>4</MenuItem>
        </Select>
      </FormControl>
      <FormControl className={styles.limitSelect} size="small">
        <InputLabel>Limit</InputLabel>
        <Select
          value={value.limit}
          label="Limit"
          onChange={handleTxLimitChange}
          disabled={disabled}
        >
          <MenuItem value={20}>20</MenuItem>
          <MenuItem value={50}>50</MenuItem>
          <MenuItem value={100}>100</MenuItem>
          <MenuItem value={1000}>1000</MenuItem>
        </Select>
      </FormControl>
      <FormControl className={styles.dateSelect}>
        <DateTimePicker
          label="From"
          value={value.from}
          onChange={handleDateFromChange}
          renderInput={(params) => <TextField {...params} size="small" />}
          disabled={disabled}
          maxDateTime={maxDateTime}
        />
      </FormControl>
      <FormControl className={styles.dateSelect}>
        <DateTimePicker
          label="To"
          value={value.to}
          onChange={handleDateToChange}
          renderInput={(params) => <TextField {...params} size="small" />}
          disabled={disabled}
          minDateTime={minDateTime}
        />
      </FormControl>
    </div>
  );
}
