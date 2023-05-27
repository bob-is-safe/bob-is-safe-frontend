/* eslint-disable @typescript-eslint/no-empty-interface */
import { createContext, type ReactNode, useEffect, useRef, useState, useCallback, type Dispatch } from 'react'
import { ethers } from 'ethers'
import { BOB_DEPOSIT_PROTOCOL, BOB_TOKEN_CONTRACT_ADDRESS, GOERLI, MODULE_FACTORY_CONTRACT_ADDRESS, UNISWAP_ROUTER } from './constants'
import { useSafeAppsSDK } from '@safe-global/safe-apps-react-sdk'
import factoryAbi from '../contracts-abi/factory-abi.json'
import moduleAbi from '../contracts-abi/module-abi.json'

import safeAbi from '../contracts-abi/safe-abi.json'

import { AppStatus } from '../components/constants'
import React from 'react'
import Safe, { EthersAdapter, getSafeContract } from '@safe-global/protocol-kit'

interface Web3ContextType {
  setAppStatus: Dispatch<any>
  setIsModuleEnabled: Dispatch<any>

  appStatus: AppStatus
  provider: ethers.providers.Web3Provider
  signer: ethers.providers.JsonRpcSigner
  safeContract: ethers.Contract
  factoryContract: ethers.Contract
  isModuleEnabled: boolean
}

export const Web3Context = createContext<Web3ContextType>({
  setAppStatus: () => { },
  setIsModuleEnabled: () => { },

  appStatus: AppStatus.INITIAL,
  provider: {} as ethers.providers.Web3Provider,
  signer: {} as ethers.providers.JsonRpcSigner,
  safeContract: {} as ethers.Contract,
  factoryContract: {} as ethers.Contract,
  isModuleEnabled: false
})

/**
 * @todo create the ethersjs Provider
 * @todo provide the function  to instantiate module
 * @todo read logs to retrieve the custom module. if found, save it in cache. need to use ethersJS (see https://medium.com/@kaishinaw/ethereum-logs-hands-on-with-ethers-js-a28dde44cbb6)
 * @todo provide the function to send a transaction
 * @todo provide the function retrieve the tx history
 */
export const Web3Provider = ({ children }: { children: ReactNode }) => {
  const { sdk, safe, connected } = useSafeAppsSDK()
  const [appStatus, setAppStatus] = useState<any>(AppStatus.INITIAL)
  const [isModuleEnabled, setIsModuleEnabled] = useState<boolean>(false)

  // TODO make a function detect provider to see if a web3 provider is there or not
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const signer = provider.getSigner()

  const factoryContract = new ethers.Contract(MODULE_FACTORY_CONTRACT_ADDRESS, factoryAbi, signer)
  const safeContract = new ethers.Contract(safe.safeAddress, safeAbi, provider)

  useEffect(() => {
    console.log('using context useffect...')
    const moduleAddress = localStorage.getItem('moduleAddress')
    if (moduleAddress) {
      const moduleContract = new ethers.Contract(moduleAddress, moduleAbi, provider)
      const moduleContractFilters = moduleContract.filters.DepositSuccess()
      moduleContract.on(moduleContractFilters, () => {
        setAppStatus(AppStatus.TX_SUCCESS)
      })
    }

    const safeContractFilters = safeContract.filters.EnabledModule()
    safeContract.on(safeContractFilters, () => {
      setIsModuleEnabled(true)
      setAppStatus(AppStatus.INITIAL)
    })

    if (!isModuleEnabled) {
      _setIsModuleEnabled()
    }

    // TODO remove event
  })

  const _setIsModuleEnabled = async () => {
    try {
      const ethAdapter = new EthersAdapter({
        ethers,
        signerOrProvider: new ethers.providers.Web3Provider(window.ethereum)
      })
      const safeSDK = await Safe.create({
        ethAdapter,
        safeAddress: safe.safeAddress
      })
      const module = localStorage.getItem('moduleAddress') // TODO this should be in the logs
      if (module) {
        const isEnabled = await safeSDK.isModuleEnabled(module)
        setIsModuleEnabled(isEnabled)
      } else {
        setIsModuleEnabled(false)
      }
    } catch (e) {
      console.error(e)
    }
  }

  return (<Web3Context.Provider value={{
    setAppStatus,
    setIsModuleEnabled,
    appStatus,
    provider,
    signer,
    safeContract,
    isModuleEnabled,
    factoryContract
  }}>
    {children}
  </Web3Context.Provider>)
}

export const Web3Consumer = Web3Context.Consumer
