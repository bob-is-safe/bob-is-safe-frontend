import {FusionSDK, NetworkEnum} from '@1inch/fusion-sdk'

export const test1inch = async () => {
    const sdk = new FusionSDK({
        url: 'https://fusion.1inch.io',
        network: NetworkEnum.ETHEREUM
    })

    const orders = await sdk.getActiveOrders({page: 1, limit: 2})
    console.log(orders)
}
