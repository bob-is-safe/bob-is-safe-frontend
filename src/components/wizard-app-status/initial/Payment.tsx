import { Form } from 'antd'
import { useContext, useState } from 'react'
import { PaymentForm } from './PaymentForm'
import { ethers } from 'ethers'
import { AppStatus, BOB_TOKEN_CONTRACT_ADDRESS, TOKEN_OPTIONS } from '../../constants'
import { useSafeAppsSDK } from '@safe-global/safe-apps-react-sdk'
import moduleAbi from '../../../contracts-abi/module-abi.json'

import { removeZkbobNetworkPrefix } from '../../utils'
import { Web3Context } from '../../../context'

const Payment = () => {
  const [form] = Form.useForm()
  const { sdk, safe } = useSafeAppsSDK()
  const { setAppStatus } = useContext(Web3Context)

  const [zkBobAddress, setZkBobAddress] = useState<string>('')
  const [tokenIndex, setTokenIndex] = useState<number>(0)
  const [amount, setAmount] = useState<string>('')

  const submitTx = async () => {
    try {
      const module = localStorage.getItem('moduleAddress')
      if (module) {
        const token = TOKEN_OPTIONS[tokenIndex]
        const { safeTxHash } = await sdk.txs.send({
          txs: [
            {
              to: module,
              value: '0',
              data: new ethers.utils.Interface(moduleAbi).encodeFunctionData('paymentInPrivateMode', [
                safe.safeAddress,
                ethers.utils.parseUnits(amount, token.decimals),
                removeZkbobNetworkPrefix(zkBobAddress),
                token.address === BOB_TOKEN_CONTRACT_ADDRESS ? [] : [token.address, ...token.swapAddresses],
                token.address === BOB_TOKEN_CONTRACT_ADDRESS ? [] : token.swapFees,
                0
              ])
            }
          ]
        })
        setAppStatus(AppStatus.TX_PENDING)
      }
    } catch (e) {
      console.error(e)
    }
  }

    return <div>
      <br />
      <br />
      <PaymentForm form={form} setZkBobAddress={setZkBobAddress} setTokenIndex={setTokenIndex}
        setAmount={setAmount}
        submitTx={submitTx} TOKEN_OPTIONS={TOKEN_OPTIONS} />
    </div>
 
}

export default Payment
