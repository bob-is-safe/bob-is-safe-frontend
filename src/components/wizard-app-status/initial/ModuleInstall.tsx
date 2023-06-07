import { Button, Typography } from 'antd'
import { useCallback, useContext, useState } from 'react'
import { ethers } from 'ethers'
import { AppStatus,  MODULE_FACTORY_CONTRACT_ADDRESS } from '../../../constants'
import { useSafeAppsSDK } from '@safe-global/safe-apps-react-sdk'
import safeAbi from '../../../contracts-abi/safe-abi.json'
import factoryAbi from '../../../contracts-abi/factory-abi.json'

import { Web3Context } from '../../../context'
import { calculateProxyAddress, createInitData, generateSaltNonce } from '../../../utils'
import { MASTER_COPY_ADDRESS } from '../../../constants'
const { Text } = Typography

const ModuleInstall = () => {
  const { sdk, safe } = useSafeAppsSDK()
  const { setAppStatus,setBobModuleAddress } = useContext(Web3Context)

  // all this logic should change once we have factory
  const enableZKModule = async () => {
    setAppStatus(AppStatus.TX_PENDING)
    const initData = createInitData(safe.safeAddress)
    const saltNonce = generateSaltNonce(5)
    const calculatedModuleAddress = calculateProxyAddress(
      MODULE_FACTORY_CONTRACT_ADDRESS,
      MASTER_COPY_ADDRESS,
      initData,
      saltNonce
    )
    try {
      const { safeTxHash } = await sdk.txs.send({
        txs: [
          {
            to: MODULE_FACTORY_CONTRACT_ADDRESS,
            value: '0',
            data: new ethers.utils.Interface(factoryAbi).encodeFunctionData('deployModule', [MASTER_COPY_ADDRESS, initData, saltNonce.toString()])
          },
          {
            to: safe.safeAddress,
            value: '0',
            data: new ethers.utils.Interface(safeAbi).encodeFunctionData('enableModule', [calculatedModuleAddress])
          }
        ]
      })
      setBobModuleAddress(calculatedModuleAddress)
      console.log({ safeTxHash })
    } catch (e) {
      console.error(e)
      setAppStatus(AppStatus.INITIAL)
    }
  }


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
      // onClick={_deployModule}
      onClick={async () => { await enableZKModule() }}
    >
      <Text style={{ fontSize: '16px', color: 'white' }}>Enable module</Text>
    </Button>
  </div>
}

export default ModuleInstall
