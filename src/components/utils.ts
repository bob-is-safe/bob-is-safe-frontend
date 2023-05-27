import { ZKBOB_ADDRESS_PREFIX_REGEX } from './constants'
import bs58 from "bs58"
import {Buffer} from 'buffer';


export const removeZkbobNetworkPrefix = (input: string): string => {
  return input.replace(ZKBOB_ADDRESS_PREFIX_REGEX, '')
}

// making the address in raw bytes: https://github.com/zkBob/zeropool-support-js/blob/2d8a8e227bc25a93d3a83e77aa260f7917bafc2f/src/networks/evm/client.ts#L261
export const formatZkBobAddressBytes = (zkBobAddress: string): string => {
   const zkAddrBytes = `0x${Buffer.from(bs58.decode(zkBobAddress.substring(zkBobAddress.indexOf(':') + 1))).toString('hex')}`;
  return zkAddrBytes
}


