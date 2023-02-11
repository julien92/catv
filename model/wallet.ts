export interface Wallet {
  address: string;
  alias: string;
  type: WalletType;
  avatarUrl: string;
  displayUrl: string;
}

export enum WalletType {
  User,
  Exchange,
  SmartContract,
}
