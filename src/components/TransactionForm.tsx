import Safe, { EthersAdapter } from '@safe-global/protocol-kit'
import { useSafeAppsSDK } from '@safe-global/safe-apps-react-sdk'
import { Button, Form, Input, Select, Card, Alert, Space, Spin, Result ,Typography } from 'antd'
import { ethers } from 'ethers'
import React, { useCallback, useEffect, useState } from 'react'
import safeAbi from '../contracts-abi/safe-abi.json'
import factoryAbi from '../contracts-abi/factory-abi.json'
import moduleAbi from '../contracts-abi/module-abi.json'
import { BOB_TOKEN_CONTRACT_ADDRESS, BOB_IS_SAFE_MODULE_ADDRESS, TOKEN_OPTIONS, MODULE_FACTORY_CONTRACT_ADDRESS } from './constants'
import { layout, tailLayout } from './styles'
//TODO listen for events:
// enabled: listen on safe contract enabledModule(addr module) (abi safe) DONE!
// emit ModuleProxyCreation(proxy, masterCopy); (deploy module from factory) from factory contract
// emit depositSuccess(avatar, _amount);  (safe address, amount) from Module contract

const { Option } = Select
const { Text, Link } = Typography

const TransactionForm: React.FC = () => {
  const [form] = Form.useForm()
  const { sdk, safe } = useSafeAppsSDK()

  const [status, setStatus] = useState<'initial' | 'txPending' | 'txSuccess'>('initial')
  const [zkBobAddress, setZkBobAddress] = useState<string>('')
  const [tokenIndex, setTokenIndex] = useState<number>(0)
  const [amount, setAmount] = useState<string>('')
  const [isModuleEnabled, setIsModuleEnabled] = useState<boolean | null>()
  const [moduleContract, setModuleContract] = useState<any>()

  useEffect(() => {
    if (!isModuleEnabled) {
      _setIsModuleEnabled()
    }

    // const provider = new ethers.providers.Web3Provider(window.ethereum);
    // const moduleContract = new ethers.Contract(BOB_IS_SAFE_MODULE_ADDRESS, safeAbi, provider)
    // setModuleContract(moduleContract)
  }, [isModuleEnabled])

  useEffect(() => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const safeContract = new ethers.Contract(safe.safeAddress, safeAbi, provider)
    // const factoryContract = new ethers.Contract(MODULE_FACTORY_CONTRACT_ADDRESS, factoryAbi, provider)

    const safeContractFilters = safeContract.filters.EnabledModule()
    safeContract.on(safeContractFilters, () => {
      setIsModuleEnabled(true)
      setStatus("initial")
    })
    if (isModuleEnabled) {
      const moduleContract = new ethers.Contract(BOB_IS_SAFE_MODULE_ADDRESS, moduleAbi, provider)
      if (moduleContract) {
        const moduleContractFilters = moduleContract.filters.DepositSuccess()
        safeContract.on(moduleContractFilters, () => {
          console.log("deposit successful")
          setStatus("txSuccess")
        })
      }

    }
    // const factoryContractFilters = factoryContract.filters.ModuleProxyCreation()
    // factoryContract.on(factoryContractFilters, () => {
    //   setIsModuleEnabled(true)
    //   setStatus("initial")
    // })
  }, [])

  const enableZKModuleTx = useCallback(async () => {
    try {
      setStatus("txPending")
      const { safeTxHash } = await sdk.txs.send({
        txs: [
          // TODO: call the factory to deploy the module and then enable the module by passing a predicted address
          /*{
            to: bobIsSafeFactoryAddress,
            value: '0',
            data: new ethers.utils.Interface(factoryAbi).encodeFunctionData("deployModule", [bobIsSafeModuleAddress]),
          },*/
          {
            to: safe.safeAddress,
            value: '0',
            data: new ethers.utils.Interface(safeAbi).encodeFunctionData('enableModule', [BOB_IS_SAFE_MODULE_ADDRESS]),
          },
        ],
      })
      console.log({ safeTxHash })

      const safeTx = await sdk.txs.getBySafeTxHash(safeTxHash)
      // sdk.eth.
      // if (safeTx) {
      //   setIsModuleEnabled(true)
      // }
      // console.log({ safeTx })
    } catch (e) {
      console.error(e)
    }
  }, [safe, sdk])

  const submitTx = async () => {
    try {
      const token = TOKEN_OPTIONS[tokenIndex]
      const { safeTxHash } = await sdk.txs.send({
        txs: [
          /*{
            to: BOB_CONTRACT_ADDRESS,
            value: '0',
            data: new ethers.utils.Interface(bobTokenAbi).encodeFunctionData('approve', [
              '0xE4C77B7787cC116A5E1549c5BB36DE07732100Bb',
              ethers.utils.parseUnits('100', 18),
            ]),
          },*/
          {
            to: BOB_IS_SAFE_MODULE_ADDRESS,
            value: '0',
            data: new ethers.utils.Interface(moduleAbi).encodeFunctionData('paymentInPrivateMode', [
              safe.safeAddress,
              ethers.utils.parseUnits(amount, token.decimals),
              zkBobAddress,
              token.address === BOB_TOKEN_CONTRACT_ADDRESS ? [] : [token.address, BOB_TOKEN_CONTRACT_ADDRESS],
              token.address === BOB_TOKEN_CONTRACT_ADDRESS ? 0 : token.poolPercentage,
              0,
              0,
            ]),
          },
        ],
        /*params: {
          safeTxGas: 1000000,
        },*/
      })
      console.log({ safeTxHash })
      const safeTx = await sdk.txs.getBySafeTxHash(safeTxHash)
      console.log({ safeTx })
      setStatus('txPending')
    } catch (e) {
      console.error(e)
    }
  }

  const _setIsModuleEnabled = useCallback(async () => {
    try {
      const ethAdapter = new EthersAdapter({
        ethers,
        signerOrProvider: new ethers.providers.Web3Provider(window.ethereum),
      })
      const safeSDK = await Safe.create({
        ethAdapter,
        safeAddress: safe.safeAddress,
      })

      const isEnabled = await safeSDK.isModuleEnabled(BOB_IS_SAFE_MODULE_ADDRESS)
      setIsModuleEnabled(isEnabled)
    } catch (e) {
      console.error(e)
    }
  }, [safe, sdk])

  return status === 'txPending' ? (
    <Card title="Wait for the tx to be confirmed" style={{ width: 700 }} extra={<a href="https://google.com">More</a>}>
      <Spin size="default">
        <Alert
          message="Transaction is pending"
          description="Please wait until the transaction is confirmed."
          type="info"
        />
      </Spin>
    </Card>
  ) : status === 'initial' ? (
    <Card
      title="Send a Direct Deposit using Safe and ZkBob"
      extra={<a href="https://google.com">More</a>}
      style={{ width: 700 }}
    >
      {isModuleEnabled && status === 'initial' ? (
        <Form
          {...layout}
          form={form}
          name="control-hooks"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          style={{
            maxWidth: 600,
            border: 10,
          }}
          labelAlign="right"
        >
          <Form.Item name="ZkBob Address" label="zKBob Address" rules={[{ required: true }]}>
            <Input onChange={(e: any) => setZkBobAddress(e.target.value)} />
          </Form.Item>
          <Form.Item name="Token Address" label="Token Address" rules={[{ required: true }]}>
            <Select
              placeholder="Select a option and change input text above"
              onChange={(tokenIndex: number) => {
                setTokenIndex(tokenIndex)
              }}
              allowClear
            >
              {TOKEN_OPTIONS.map((token, index) => (
                <Option value={index} key={index}>
                  {/* <img src={`/coin-logo/bob-logo.png`} alt={token.symbol} /> */}
                  <Space direction='horizontal'>
                    <img src={token.icon} alt={token.symbol}
                      width={20} height={20} />

                    <Text>{token.symbol}</Text>
                  </Space>

                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="Amount" label="Amount" rules={[{ required: true }]}>
            <Input onChange={(e: any) => setAmount(e.target.value)} />
          </Form.Item>

          {/* <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.gender !== currentValues.gender}>
            {({ getFieldValue }) =>
              getFieldValue('gender') === 'other' ? (
                <Form.Item name="customizeGender" label="Customize Gender" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              ) : null
            }
          </Form.Item> */}
          <Form.Item {...tailLayout}>
            <Button type="primary" htmlType="submit" onClick={submitTx}>
              Send Direct Deposit
            </Button>
          </Form.Item>
        </Form>
      ) : isModuleEnabled != null ? (
        <Button color="secondary" onClick={enableZKModuleTx}>
          Click to enable ZK module
        </Button>
      ) :
        <Spin size="default">
          <Alert
            message="Loading"
            description="Loading the Safe App"
            type="info"
          />
        </Spin>
      }
      {/* </Card> */}
    </Card>
  ) : (
    <Result
      status="success"
      title="Successfully Deposited Bob"
      subTitle="Transaction ID: 123assasa"
      extra={[
        <Button type="primary" key="console">
          Check Tx in Etherscan
        </Button>,
        <Button
          key="restart"
          onClick={() => {
            setStatus('initial')
          }}
        >
          Start Again
        </Button>,
      ]}
    />
  )
}

export default TransactionForm
