export type Token = {
  address: string
  decimals: number
  symbol: string
  icon: string
  poolFee?: number
  width?: number
  height?: number
}

export const TOKEN_OPTIONS: Token[] = [
  {
    // BOB
    address: '0x97a4ab97028466FE67F18A6cd67559BAABE391b8',
    decimals: 18,
    symbol: 'BOB',
    icon: '/coin-logo/bob-logo.png',
  },
  {
    // USDC
    address: '0x07865c6e87b9f70255377e024ace6630c1eaa37f',
    decimals: 6,
    symbol: 'USDC',
    icon: '/coin-logo/usdc-logo.png',
    poolFee: 500,
  },
  {
    address: '0xA',
    decimals: 18,
    symbol: 'GHO',
    icon: '/coin-logo/gho-logo.png',
  },
  {
    address: '0xA68AbBb4e36b18A16732CF6d42E826AAA27F52Fc',
    decimals: 18,
    symbol: 'APE',
    icon: '/coin-logo/ape-logo.png',
  },
]

export const BOB_IS_SAFE_MODULE_ADDRESS = '0x2603b593d6277cd8801d4a01e88c7f3fad842592'

export const BOB_TOKEN_CONTRACT_ADDRESS = '0x97a4ab97028466FE67F18A6cd67559BAABE391b8'

export const MODULE_FACTORY_CONTRACT_ADDRESS = '0x92f7bdff111e692e88e51140def107813b9c3a03'

export const MASTER_COPY_CONTRACT = '0xc2F4232924b0A522371378c59Cf4Cd8AEcBbb2fD'
