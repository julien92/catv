import {ChainScan} from "../../chainscan/ChainScan";

export class BscScan extends ChainScan {

  constructor(
      apiUrl =   'https://api.bscscan.com/api',
      apiKey =  'TAJ7576G5TEGSQVUGUR4ESNI7IZRGZMK4B',
      urls = { avatar: 'https://effigy.im/a', explorer:  'https://bscscan.com' },
      symbol = 'BNB'
  ) {
    super(apiUrl, apiKey, urls, symbol);
  }

}