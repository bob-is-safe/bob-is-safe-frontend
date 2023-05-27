import { Button, Typography } from 'antd'
import { useCallback, useContext, useState } from 'react'
import { ethers } from 'ethers'
import { AppStatus, BOB_DEPOSIT_PROTOCOL, BOB_TOKEN_CONTRACT_ADDRESS,  UNISWAP_ROUTER } from '../../constants'
import { useSafeAppsSDK } from '@safe-global/safe-apps-react-sdk'
import safeAbi from '../../../contracts-abi/safe-abi.json'

import { Web3Context } from '../../../context'
const { Text } = Typography

const ModuleInstall = () => {
  const { sdk, safe } = useSafeAppsSDK()
  const { provider, factoryContract, setAppStatus } = useContext(Web3Context)


  const enableZKModule = useCallback(async (moduleAddress: string) => {
    try {
      const { safeTxHash } = await sdk.txs.send({
        txs: [
          {
            to: safe.safeAddress,
            value: '0',
            data: new ethers.utils.Interface(safeAbi).encodeFunctionData('enableModule', [moduleAddress])
          }
        ]
      })
      console.log({ safeTxHash })
    } catch (e) {
      console.error(e)
      setAppStatus('initial')
    }
  }, [safe.safeAddress, sdk.txs])

  const _deployModule = useCallback(async () => {
    setAppStatus(AppStatus.TX_PENDING)

    await provider.send('eth_requestAccounts', []) // <- this promps user to connect metamask

    const factoryContractFilters = factoryContract.filters.ModuleProxyCreation()
    factoryContract.on(factoryContractFilters, (address, y) => {
      localStorage.setItem('moduleAddress', address)
      enableZKModule(address)
    })

    const deployModule = await factoryContract.createModule(
      safe.safeAddress,
      safe.safeAddress,
      safe.safeAddress,
      BOB_TOKEN_CONTRACT_ADDRESS,
      BOB_DEPOSIT_PROTOCOL,
      UNISWAP_ROUTER
    )
    console.log('DEPLOYED MODULE', deployModule)
  }, [])

  return <div style={{
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: '15px',
    border: '1px solid rgba(0, 0, 0, 0.06)',
    padding: '32px'
  }}>
    <p className="testo-bellissimo">
      You need to enable the module in order to use it. This is a one time action.
    </p>
    <Button
      className="gradient-button"
      style={{
        background: 'linear-gradient(to right, #ffbb33, #f7a10c)',
        color: 'white',
        fontWeight: 'bold',
        border: 'none',
        fontSize: '16px',
        textTransform: 'uppercase',
        borderRadius: '8px',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
        width: '360px',
        height: '48px',
        marginTop: '12px',
        marginBottom: '0px !important'
      }}
      onClick={_deployModule}
    >
      <Text style={{ fontSize: '16px', color: 'white' }}>Enable module</Text>
    </Button>
  </div>
}

export default ModuleInstall
