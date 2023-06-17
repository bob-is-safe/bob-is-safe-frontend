import { type AccountConfig, deriveSpendingKeyZkBob, ProverMode, ZkBobClient } from 'zkbob-client-js'
import { zkBobConfig } from './config'
import { ethers } from 'ethers'
import { hexToBuf } from 'zkbob-client-js/lib/utils'

export enum ZkBobPoolAlias {
  BOB_SEPOLIA = 'BOB-sepolia',
  BOB_GOERLI = 'BOB-goerli',
  BOB_OP_GOERLI = 'BOB-op-goerli',
}

export const getZkBobClient = async (activePoolAlias: ZkBobPoolAlias): Promise<ZkBobClient> => {
  /* let clientConfig: ClientConfig
  try {
    clientConfig = JSON.parse(process.env.ZKBOB_CONFIG_JSON as string)
  } catch (e) {
    console.error(e)
    throw new Error('Invalid ZKBOB_CONFIG_JSON env variable')
  } */
  // creating a zkBob client without account to be worked on <ACTIVE_POOL_ALIAS> pool
  return await ZkBobClient.create(zkBobConfig, activePoolAlias)
}

export const zkBobLogin = async (client: ZkBobClient, signedMessage: string, activePoolAlias: ZkBobPoolAlias) => {
  const mnemonic = ethers.utils.entropyToMnemonic(hexToBuf(signedMessage))

  const accountConfig: AccountConfig = {
    // spending key is a byte array which derived from mnemonic
    sk: deriveSpendingKeyZkBob(mnemonic),
    // pool alias which should be activated
    pool: activePoolAlias,
    // the account should have no activity (incoming notes including) before that index
    // you can use -1 value only for newly created account or undefined (or 0) for full state sync
    birthindex: -1,
    // using local prover
    proverMode: ProverMode.Local,
  }
  await client.login(accountConfig)
}

export const genShieldedAddress = async (client: ZkBobClient): Promise<string> => {
  return await client.generateAddress()
}
