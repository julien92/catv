import {ChainScan} from "../../chainscan/ChainScan";

export class EtherScan extends ChainScan {

  constructor(
      apiUrl = "https://api.etherscan.io/api",
      apiKey = "V5VMR4K591VVWZW723XWVRKT6P2BGCS9HN",
      urls= { avatar: "https://effigy.im/a", explorer: "https://etherscan.io" },
      symbol = 'ETH'
  ) {
    super(apiUrl, apiKey, urls, symbol);
  }

}