import { useSafeAppsSDK } from '@safe-global/safe-apps-react-sdk'
import { Typography } from 'antd'
import React, { useContext } from 'react'
import { AppStatus } from '../constants'
import TransactionPending from './wizard-app-status/TransactionPending'
import Initial from './wizard-app-status/initial/Initial'
import { Web3Context } from '../context'
import Chronology from './wizard-app-status/history/Chronology'
import TransactionSuccess from './wizard-app-status/TransactionSuccess'

const Wizard: React.FC = () => {
  const { appStatus, isModuleEnabled } = useContext(Web3Context)

  switch (appStatus) {
    case AppStatus.TX_PENDING:
      return <TransactionPending isModuleEnabled={isModuleEnabled} />
    case AppStatus.INITIAL:
      return <Initial isModuleEnabled={isModuleEnabled} />
    case AppStatus.HISTORY:
      return <Chronology />
    case AppStatus.TX_SUCCESS:
      return <TransactionSuccess />
    default:
      return <div>Something went wrong</div>
  }
}

export default Wizard
