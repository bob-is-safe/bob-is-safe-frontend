import { FusionSDK, NetworkEnum, PrivateKeyProviderConnector } from '@1inch/fusion-sdk'
import { ethers } from 'ethers'
import {Web3} from 'web3'

export const test1inch = async () => {
   
    const sdk = new FusionSDK({
        url: 'https://fusion.1inch.io',
        network: NetworkEnum.ETHEREUM
    })

    const orders = await sdk.getActiveOrders({ page: 1, limit: 2 })
    console.log(orders)
    // await swap()
}

const swap = async () => {
    debugger
    const makerPrivateKey = 'my pk'
    const makerAddress = 'my addr'

    const nodeUrl = 'https://polygon-mainnet.g.alchemy.com/v2/VIr4KxtvN3rLSuGjprtv-U3fnWWxFr1C'
    const w3 = new Web3(nodeUrl)
    const blockchainProvider = new PrivateKeyProviderConnector(
        makerPrivateKey,
        w3 as any
    )

    const sdk = new FusionSDK({
        url: 'https://fusion.1inch.io',
        network: 1,
        blockchainProvider
    })

    const order = sdk.placeOrder({
        fromTokenAddress: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619', // WETH
        toTokenAddress: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', // USDC
        amount: '50000000000000000', // 0.05 ETH
        walletAddress: makerAddress
    })
    console.log("placed order:", order)
}
