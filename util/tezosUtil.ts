const exchangeAliases = [
  "binance",
  "coinbase",
  "kucoin",
  "gate.io",
  "kraken",
  "huobi",
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
