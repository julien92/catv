import {ChainScan} from "../../chainscan/ChainScan";

export class PolygonScan extends ChainScan {

  constructor(
      apiUrl =   'https://api.polygonscan.com/api',
      apiKey =  '9YTXM2NDJACGSU2VYB1ZJRX52YMHXRKI2K',
      urls = { avatar: 'https://effigy.im/a', explorer:  'https://polygonscan.com/' },
      symbol = 'MATIC'
  ) {
    super(apiUrl, apiKey, urls, symbol);
  }

}