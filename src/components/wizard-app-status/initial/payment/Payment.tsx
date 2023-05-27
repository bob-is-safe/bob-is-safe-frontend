import { Form } from 'antd'
import { useContext, useState } from 'react'
import { PaymentForm } from './PaymentForm'
import { ethers } from 'ethers'
import { AppStatus, BOB_TOKEN_CONTRACT_ADDRESS, TOKEN_OPTIONS } from '../../../constants'
import { useSafeAppsSDK } from '@safe-global/safe-apps-react-sdk'
import moduleAbi from '../../../../contracts-abi/bob-module-abi.json'

import { formatZkBobAddressBytes, removeZkbobNetworkPrefix } from '../../../utils'
import { Web3Context } from '../../../../context'

const Payment = () => {
  const [form] = Form.useForm()
  const { sdk, safe } = useSafeAppsSDK()
  const { setAppStatus } = useContext(Web3Context)

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
      const module = localStorage.getItem('moduleAddress')
      if (module) {
        const token = TOKEN_OPTIONS[tokenIndex]
        const { safeTxHash } = await sdk.txs.send({
          txs: [
            {
              to: module,
              value: '0',
              // TODO change to use singlePrivatePayment function
              data: new ethers.utils.Interface(moduleAbi).encodeFunctionData('singlePrivatePayment', [
                safe.safeAddress,  //address _fallbackUser,
                ethers.utils.parseUnits(amount, token.decimals), //uint256 _amount,
                formatZkBobAddressBytes(zkBobAddress), // bytes memory _rawZkAddress, --> TODO make this in bytes
                token.address === BOB_TOKEN_CONTRACT_ADDRESS ? [] : [token.address, ...token.swapAddresses],  //address[] memory tokens,
                token.address === BOB_TOKEN_CONTRACT_ADDRESS ? [] : token.swapFees, //uint24[] memory fees,
                0 //uint256 amountOutMin
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
