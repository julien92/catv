import {ChainScan} from "../../chainscan/ChainScan";

export class PolygonScan extends ChainScan {

  constructor(
      apiUrl = 'https://api.etherscan.io/v2/api',
      apiKey = '9YTXM2NDJACGSU2VYB1ZJRX52YMHXRKI2K',
      urls = { avatar: 'https://effigy.im/a', explorer: 'https://polygonscan.com/' },
      symbol = 'MATIC',
      chainId = 137
  ) {
    super(apiUrl, apiKey, urls, symbol, chainId);
  }

}