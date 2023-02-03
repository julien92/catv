import {
  FormControl,
  Input,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import { ChangeEvent } from "react";

import styles from "./styles.module.css";

export interface CriteriaValue {
  address: string;
  depth: number;
  limit: number;
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

  return (
    <>
      <div className={styles.criteria}>
        <div className={styles.wallet}>
          <Input
            placeholder="Wallet address"
            fullWidth
            value={value.address}
            onChange={handleAddressChange}
          />
        </div>
        <div className={styles.select}>
          <FormControl>
            <InputLabel>Depth</InputLabel>
            <Select
              value={value.depth}
              label="Depth"
              onChange={handleDepthChange}
            >
              <MenuItem value={1}>1</MenuItem>
              <MenuItem value={2}>2</MenuItem>
              <MenuItem value={3}>3</MenuItem>
              <MenuItem value={4}>4</MenuItem>
            </Select>
          </FormControl>
        </div>
        <div className={styles.select}>
          <FormControl>
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
        </div>
      </div>
    </>
  );
}
