import { Button, Form } from 'antd'
import React, { useContext, useState } from 'react'
import { PaymentForm } from './PaymentForm'
import { ethers } from 'ethers'
import { AppStatus, BOB_TOKEN_CONTRACT_ADDRESS, TOKEN_OPTIONS } from '../../../../constants'
import { useSafeAppsSDK } from '@safe-global/safe-apps-react-sdk'
import moduleAbi from '../../../../contracts-abi/bob-module-abi.json'

import { createRandomTag, formatZkBobAddressBytes } from '../../../../utils'
import { Web3Context } from '../../../../context'
import { getZkBobClient, zkBobLogin, ZkBobPoolAlias } from '../../../zkbob'

const Payment = () => {
  const [form] = Form.useForm()
  const { sdk, safe } = useSafeAppsSDK()
  const { bobModuleAddress, setAppStatus } = useContext(Web3Context)

  const [zkBobAddress, setZkBobAddress] = useState<string>('')
  const [tokenIndex, setTokenIndex] = useState<number>(0)
  const [amount, setAmount] = useState<string>('')

  /**
     * function singlePrivatePayment(
     address _fallbackUser,
     uint256 _amount,
     bytes memory _rawZkAddress,
     address[] memory tokens,
     uint24[] memory fees,
     uint256 amountOutMin
     )
     */
  const submitTx = async () => {
    try {
      if (bobModuleAddress) {
        const token = TOKEN_OPTIONS[tokenIndex]
        await sdk.txs.send({
          txs: [
            {
              to: bobModuleAddress,
              value: '0',
              data: new ethers.utils.Interface(moduleAbi).encodeFunctionData('singlePrivatePayment', [
                safe.safeAddress, // address _fallbackUser,
                ethers.utils.parseUnits(amount, token.decimals), // uint256 _amount,
                formatZkBobAddressBytes(zkBobAddress), // bytes memory _rawZkAddress, --> TODO make this in bytes
                token.address === BOB_TOKEN_CONTRACT_ADDRESS ? [] : [token.address, ...token.swapAddresses], // address[] memory tokens,
                token.address === BOB_TOKEN_CONTRACT_ADDRESS ? [] : token.swapFees, // uint24[] memory fees,
                0, // uint256 amountOutMin
                createRandomTag(),
              ]),
            },
          ],
        })
        setAppStatus(AppStatus.TX_PENDING)
      }
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div>
      <br />
      <br />
      <PaymentForm
        form={form}
        setZkBobAddress={setZkBobAddress}
        setTokenIndex={setTokenIndex}
        setAmount={setAmount}
        submitTx={submitTx}
        TOKEN_OPTIONS={TOKEN_OPTIONS}
      />
      <Button
        className="gradient-button"
        htmlType="submit"
        onClick={async () => {
          const client = await getZkBobClient(ZkBobPoolAlias.BOB_GOERLI)
          const signedMessage: { messageHash: string } = (await sdk.txs.signMessage('random message')) as {
            messageHash: string
          }
          await zkBobLogin(client, signedMessage?.messageHash, ZkBobPoolAlias.BOB_GOERLI)

          console.log('Logged')
          console.log(client)
          console.log('HERE', client.networkName())
          const address = await client.generateAddress()
          setZkBobAddress(address)
        }}
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
          marginBottom: '0px !important',
        }}
      >
        Generate Address
      </Button>
    </div>
  )
}

export default Payment
