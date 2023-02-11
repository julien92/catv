export interface TokenTransfer {
  amount: string;
  token: Token;
}

interface Token {
  metadata: TokenMetadata;
}

interface TokenMetadata {
  decimals: string;
  symbol: string;
}
