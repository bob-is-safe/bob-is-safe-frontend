import { genShieldedAddress, getZkBobClient, zkBobLogin, ZkBobPoolAlias } from '../zkbob'
import { Button } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import React, { useState } from 'react'
import { useSafeAppsSDK } from '@safe-global/safe-apps-react-sdk'

const ZkBobButton = () => {
  const { sdk } = useSafeAppsSDK()
  const [zkBobAddress, setZkBobAddress] = useState<string>('')
  return (
    <div>
      <Button
        className="gradient-button-blue"
        htmlType="submit"
        onClick={async () => {
          const client = await getZkBobClient(ZkBobPoolAlias.BOB_GOERLI)
          const signedMessage: { messageHash: string } = (await sdk.txs.signMessage('random message')) as {
            messageHash: string
          }
          await zkBobLogin(client, signedMessage?.messageHash, ZkBobPoolAlias.BOB_GOERLI)
          const address = await genShieldedAddress(client)
          setZkBobAddress(address)
        }}
        icon={<UserOutlined />}
        shape={'round'}
        style={{
          background: '#101527',
          color: 'white',
          fontWeight: 'bold',
          border: 'none',
          fontSize: '16px',
          textTransform: 'uppercase',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
          width: '360px',
          height: '48px',
          marginTop: '12px',
          marginBottom: '0px !important',
        }}
      >
        Generate zkbob address
      </Button>
      <p>{zkBobAddress}</p>
    </div>
  )
}

export default ZkBobButton
