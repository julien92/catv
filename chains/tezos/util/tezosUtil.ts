import {
  ValidationResult,
  validateAddress as taquitoValidateAddress,
} from "@taquito/utils";

import { Wallet, WalletType } from "../../../model/wallet";

const exchangeAliases = [
  "binance",
  "coinbase",
  "kucoin",
  "gate.io",
  "kraken",
  "huobi",
  "crypto.com",
  "bittrex",
  "exchange",
  "temple",
  "okex",
];

export function isSmartContract(address: string) {
  return address && address.startsWith("KT1");
}

export function isExchangeWallet(wallet: { address: string; alias: string }) {
  return (
    wallet.alias &&
    exchangeAliases.find((exchangeAlias) =>
      wallet.alias.toLowerCase().includes(exchangeAlias)
    )
  );
}

export function isUserWallet(wallet: { address: string; alias: string }) {
  return !(isSmartContract(wallet.address) || isExchangeWallet(wallet));
}

export function getWalletType(wallet: Wallet) {
  let walletType = WalletType.User;
  if (isSmartContract(wallet.address)) {
    walletType = WalletType.SmartContract;
  } else if (isExchangeWallet(wallet)) {
    walletType = WalletType.Exchange;
  }

  return walletType;
}

export function validateAddress(address: string) {
  return taquitoValidateAddress(address) === ValidationResult.VALID;
}
