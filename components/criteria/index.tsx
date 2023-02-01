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
        <div className={styles.depth}>
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
      </div>
    </>
  );
}
