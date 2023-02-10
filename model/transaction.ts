import { Wallet } from "./wallet";

export interface Transaction {
  id: string;
  target: Wallet;
  sender: Wallet;
  amount: number;
  timestamp: string;
  hash: string;
  parameter: Parameter;
}

interface Parameter {
  entrypoint: string;
  value: ParameterValue;
}

interface ParameterValue {
  from: string;
  to: string;
  value: number;
}
