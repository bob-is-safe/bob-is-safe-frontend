import bs58 from 'bs58'
import { Buffer } from 'buffer'
import { ethers } from 'ethers'
import moduleAbi from './contracts-abi/bob-module-abi.json'
import { BOB_DEPOSIT_PROTOCOL, BOB_TOKEN_CONTRACT_ADDRESS, UNISWAP_ROUTER } from './constants'

// making the address in raw bytes: https://github.com/zkBob/zeropool-support-js/blob/2d8a8e227bc25a93d3a83e77aa260f7917bafc2f/src/networks/evm/client.ts#L261
export const formatZkBobAddressBytes = (zkBobAddress: string): string => {
  return `0x${Buffer.from(bs58.decode(zkBobAddress.substring(zkBobAddress.indexOf(':') + 1))).toString('hex')}`
}

export const createRandomTag = () => {
  // const tag = `0x${Buffer.from(bs58.decode('')).toString('hex')}`
  return ethers.constants.HashZero // JUST FOR NOW!!
}

// pre compute from gnosis module factory
// TODO understand what is inside byteCode
export const calculateProxyAddress = (
  factoryAddress: string,
  masterCopy: string,
  initData: string,
  saltNonce: string,
) => {
  const masterCopyAddress = masterCopy.toLowerCase().replace(/^0x/, '')
  const byteCode = '0x3d602d80600a3d3981f3363d3d373d3d3d363d73' + masterCopyAddress + '5af43d82803e903d91602b57fd5bf3' // what is it?

  const salt = ethers.utils.solidityKeccak256(
    ['bytes32', 'uint256'],
    [ethers.utils.solidityKeccak256(['bytes'], [initData]), saltNonce],
  )

  return ethers.utils.getCreate2Address(factoryAddress, salt, ethers.utils.keccak256(byteCode))
}

export const createInitData = (safeAddress: string) => {
  // Encode the addresses as bytes
  const bytesInitData = ethers.utils.defaultAbiCoder.encode(
    ['address', 'address', 'address', 'address', 'address'],
    [safeAddress, safeAddress, BOB_TOKEN_CONTRACT_ADDRESS, BOB_DEPOSIT_PROTOCOL, UNISWAP_ROUTER],
  )
  const initData = new ethers.utils.Interface(moduleAbi).encodeFunctionData('lazyInit', [bytesInitData])
  return initData
}

export const generateSaltNonce = (length: number) => {
  const charset = '0123456789ABCDEF'
  let saltNonce = ''

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length)
    saltNonce += charset[randomIndex]
  }

  return `0x${saltNonce}`
}
