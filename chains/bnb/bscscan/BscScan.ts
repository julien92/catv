import {ChainScan} from "../../chainscan/ChainScan";

export class BscScan extends ChainScan {

  constructor(
      apiUrl = 'https://api.etherscan.io/v2/api',
      apiKey = 'TAJ7576G5TEGSQVUGUR4ESNI7IZRGZMK4B',
      urls = { avatar: 'https://effigy.im/a', explorer: 'https://bscscan.com' },
      symbol = 'BNB',
      chainId = 56
  ) {
    super(apiUrl, apiKey, urls, symbol, chainId);
  }

}