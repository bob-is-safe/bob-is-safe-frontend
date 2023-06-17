import { genShieldedAddress, getZkBobClient, zkBobLogin, ZkBobPoolAlias } from '../zkbob'
import { Button } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import React, { useCallback, useEffect, useState } from 'react'
import { useSafeAppsSDK } from '@safe-global/safe-apps-react-sdk'
import { type ZkBobClient } from 'zkbob-client-js'
import { SIGNED_MESSAGE_EXPIRATION_TIME_MS } from '../../constants'

const ZkBobButton = () => {
  const { sdk } = useSafeAppsSDK()
  const [zkBobAddress, setZkBobAddress] = useState<string>('')
  const [zkBobClient, setZkBobClient] = useState<ZkBobClient>({} as ZkBobClient)
  const prepareZkBobClient = useCallback(async () => {
    // check if the signed message is cached
    // signed message is of format: <messageHash> - <timestamp>
    // - signedMessageCache.split('-')[0] is the messageHash
    // - signedMessageCache.split('-')[1] is the timestamp
    let signedMessageCache = localStorage.getItem('signedMessage')
    if (
      !signedMessageCache ||
      // if the signed message is older than SIGNED_MESSAGE_EXPIRATION_TIME_MS
      parseInt(signedMessageCache.split('-')[1].trim()) < Date.now() - SIGNED_MESSAGE_EXPIRATION_TIME_MS
    ) {
      const signedMessageResponse = (await sdk.txs.signMessage(
        `\x19Hi there. Sign this message to generate zkBob receiver addresses from your wallet address. This doesn't cost anything.\n\nSecurity code (you can ignore this): ${Math.random()}`,
      )) as {
        messageHash: string
      }
      signedMessageCache = signedMessageResponse.messageHash
      localStorage.setItem('signedMessage', `${signedMessageCache} - ${Date.now()}`)
    }
    const client = await getZkBobClient(ZkBobPoolAlias.BOB_GOERLI)
    await zkBobLogin(client, signedMessageCache.split('-')[0].trim(), ZkBobPoolAlias.BOB_GOERLI)
    setZkBobClient(client)
  }, [])

  useEffect(() => {
    prepareZkBobClient().catch((err) => {
      console.error(err)
    })
  }, [prepareZkBobClient])
  return (
    <div>
      <Button
        className="gradient-button-blue"
        htmlType="submit"
        onClick={async () => {
          const address = await genShieldedAddress(zkBobClient)
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
