export interface Wallet {
  address: string;
  alias: string;
  type: WalletType;
}

export enum WalletType {
  User,
  Exchange,
  SmartContract,
}
