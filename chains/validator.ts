import { validateAddress as tezosValidateAddress } from "./tezos/util/tezosUtil";
import { validateAddress as ethValidateAddress } from "./eth/ethUtil";
import { Chain } from "./fetcher";

const VALIDATOR_BY_CHAIN: Record<Chain, (address: string) => boolean> = {
  tezos: tezosValidateAddress,
  eth: ethValidateAddress,
  bnb: ethValidateAddress,
};

const validateAddress = (chain: Chain, address: string) => {
  return VALIDATOR_BY_CHAIN[chain](address);
};

export default validateAddress;
