import {
  FormControl,
  Input,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import TextField from "@mui/material/TextField";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { Moment } from "moment";
import { ChangeEvent } from "react";

import styles from "./styles.module.css";

export interface CriteriaValue {
  address: string;
  depth: number;
  limit: number;
  from: Date;
  to: Date;
}

interface Props {
  value: CriteriaValue;
  onChange: (value: CriteriaValue) => void;
}

export default function Criteria({ value, onChange }: Props) {
  const handleAddressChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange({ ...value, address: event.target.value });
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

  return (
    <div className={styles.criteria}>
      <Input
        placeholder="Wallet address"
        fullWidth
        value={value.address}
        onChange={handleAddressChange}
        className={styles.addressInput}
      />
      <FormControl className={styles.depthSelect} size="small">
        <InputLabel>Depth</InputLabel>
        <Select value={value.depth} label="Depth" onChange={handleDepthChange}>
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
        />
      </FormControl>
      <FormControl className={styles.dateSelect}>
        <DateTimePicker
          label="To"
          value={value.to}
          onChange={handleDateToChange}
          renderInput={(params) => <TextField {...params} size="small" />}
        />
      </FormControl>
    </div>
  );
}
