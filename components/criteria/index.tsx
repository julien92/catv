import { Input } from "@mui/material";
import { ChangeEvent } from "react";

import styles from "./styles.module.css";

interface Props {
  onChange: (value: string) => void;
}

export default function Criteria({ onChange }: Props) {
  const handleOnchange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <>
      <div className={styles.criteria}>
        <div className={styles.input}>
          <Input
            placeholder="Wallet address"
            fullWidth
            onChange={handleOnchange}
          />
        </div>
      </div>
    </>
  );
}
