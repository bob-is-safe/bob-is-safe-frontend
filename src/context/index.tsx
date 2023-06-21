/* eslint-disable @typescript-eslint/no-empty-interface */
import { createContext, type ReactNode, useEffect, useState, type Dispatch } from 'react'
import { ethers } from 'ethers'
import { MODULE_FACTORY_CONTRACT_ADDRESS, AppStatus } from '../constants'
import { useSafeAppsSDK } from '@safe-global/safe-apps-react-sdk'
import factoryAbi from '../contracts-abi/factory-abi.json'
import moduleAbi from '../contracts-abi/bob-module-abi.json'

import safeAbi from '../contracts-abi/safe-abi.json'

import Safe, { EthersAdapter, getSafeContract } from '@safe-global/protocol-kit'
import { test1inch } from '../swap'

interface Web3ContextType {
  setAppStatus: Dispatch<any>
  setIsModuleEnabled: Dispatch<any>
  setBobModuleAddress: Dispatch<any>

  appStatus: AppStatus
  provider: ethers.providers.Web3Provider
  signer: ethers.providers.JsonRpcSigner
  safeContract: ethers.Contract
  factoryContract: ethers.Contract
  isModuleEnabled: boolean
  bobModuleAddress: string
}

export const Web3Context = createContext<Web3ContextType>({
  setAppStatus: () => {},
  setIsModuleEnabled: () => {},
  setBobModuleAddress: () => {},

  appStatus: AppStatus.INITIAL,
  provider: {} as ethers.providers.Web3Provider,
  signer: {} as ethers.providers.JsonRpcSigner,
  safeContract: {} as ethers.Contract,
  factoryContract: {} as ethers.Contract,
  isModuleEnabled: false,
  bobModuleAddress: '',
})

/**
 * @todo provide the function retrieve the tx history
 */
export const Web3Provider = ({ children }: { children: ReactNode }) => {
  const { safe } = useSafeAppsSDK()
  const [appStatus, setAppStatus] = useState<any>(AppStatus.INITIAL)
  const [isModuleEnabled, setIsModuleEnabled] = useState<boolean>(false)
  const [bobModuleAddress, setBobModuleAddress] = useState<string>('')

  // TODO make a function detect provider to see if a web3 provider is there or not
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const signer = provider.getSigner()

  const factoryContract = new ethers.Contract(MODULE_FACTORY_CONTRACT_ADDRESS, factoryAbi, signer)

  const safeContract = new ethers.Contract(safe.safeAddress, safeAbi, provider)

  const getBobModules = async () => {
    console.log('Getting the factory events...')
    let module
    const bn = await provider.getBlockNumber()
    const rawLogs = await provider.getLogs({
      address: MODULE_FACTORY_CONTRACT_ADDRESS,
      topics: [
        '0x2150ada912bf189ed721c44211199e270903fc88008c2a1e1e889ef30fe67c5f',
        null,
        '0x000000000000000000000000180aa3df799e7778535c396145d4f56d4b567516',
      ],
      fromBlock: 0,
      toBlock: bn,
    })

    if (rawLogs) {
      module = `0x${rawLogs[rawLogs.length - 1].topics[1].slice(26)}`
    } else {
      module = ''
    }

    return module
  }

  // TOFIX events not emitted
  useEffect(() => {
    test1inch()
    if (bobModuleAddress) {
      const bobModule = new ethers.Contract(bobModuleAddress, moduleAbi, provider)
      console.log('inside inside module useffect', bobModule)
      const moduleContractFilters = bobModule.filters.DepositSuccess()
      bobModule.on(moduleContractFilters, () => {
        console.log('event is tiggered')
        setAppStatus(AppStatus.TX_SUCCESS)
      })
    }
  }, [bobModuleAddress, isModuleEnabled])

  useEffect(() => {
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
        signerOrProvider: new ethers.providers.Web3Provider(window.ethereum),
      })
      const safeSDK = await Safe.create({
        ethAdapter,
        safeAddress: safe.safeAddress,
      })
      const bobModuleAddress = await getBobModules()
      if (bobModuleAddress) {
        const isEnabled = await safeSDK.isModuleEnabled(bobModuleAddress)
        setBobModuleAddress(bobModuleAddress)
        if (isEnabled) {
          setIsModuleEnabled(isEnabled)
        }
      } else {
        setIsModuleEnabled(false)
      }
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <Web3Context.Provider
      value={{
        setAppStatus,
        setIsModuleEnabled,
        setBobModuleAddress,
        appStatus,
        provider,
        signer,
        safeContract,
        isModuleEnabled,
        factoryContract,
        bobModuleAddress,
      }}
    >
      {children}
    </Web3Context.Provider>
  )
}

export const Web3Consumer = Web3Context.Consumer
