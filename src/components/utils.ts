import bs58 from 'bs58'
import { Buffer } from 'buffer'

// making the address in raw bytes: https://github.com/zkBob/zeropool-support-js/blob/2d8a8e227bc25a93d3a83e77aa260f7917bafc2f/src/networks/evm/client.ts#L261
export const formatZkBobAddressBytes = (zkBobAddress: string): string => {
  return `0x${Buffer.from(bs58.decode(zkBobAddress.substring(zkBobAddress.indexOf(':') + 1))).toString('hex')}`
}
