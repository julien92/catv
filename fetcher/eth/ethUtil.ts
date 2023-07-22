import {Wallet, WalletType} from "../../model/wallet";

export function getWalletType(wallet: Wallet) {
  let walletType = WalletType.User;
  if (isSmartContract(wallet.address)) {
    walletType = WalletType.SmartContract;
  } else if (isExchangeWallet(wallet)) {
    walletType = WalletType.Exchange;
  }

  return walletType;
}

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
  return address && false;
}

export function isExchangeWallet(wallet: { address: string; alias: string }) {
  return (
      wallet.alias &&
      exchangeAliases.find((exchangeAlias) =>
          wallet.alias.toLowerCase().includes(exchangeAlias)
      )
  );
}
