import { type ClientConfig } from 'zkbob-client-js'

export const zkBobConfig: ClientConfig = {
  forcedMultithreading: false,
  snarkParams: {
    transferParamsUrl: 'https://r2-staging.zkbob.com/transfer_params_20022023.bin',
    transferVkUrl: 'http://localhost:3000/transfer_verification_key.json',
  },
  // defaultPool: 'BOB-sepolia',
  pools: {
    'BOB-sepolia': {
      chainId: 11155111,
      poolAddress: '0x3bd088C19960A8B5d72E4e01847791BD0DD1C9E6',
      tokenAddress: '0x2C74B18e2f84B78ac67428d0c7a9898515f0c46f',
      relayerUrls: ['https://relayer.thgkjlr.website/'],
      delegatedProverUrls: ['https://prover-staging.thgkjlr.website/'],
      coldStorageConfigPath: './assets/zkbob-sepolia-coldstorage.cfg',
    },
    'BOB-goerli': {
      chainId: 5,
      poolAddress: '0x49661694a71B3Dab9F25E86D5df2809B170c56E6',
      tokenAddress: '0x97a4ab97028466FE67F18A6cd67559BAABE391b8',
      relayerUrls: ['https://dev-relayer.thgkjlr.website/'],
      delegatedProverUrls: [],
      coldStorageConfigPath: '',
    },
    'BOB-op-goerli': {
      chainId: 420,
      poolAddress: '0x55B81b0730399974Ccad8AC858e766Cf54126596',
      tokenAddress: '0x0fA7E69b9344D6434Bd6b79c5950bb5234245a5F',
      relayerUrls: ['https://gop-relayer.thgkjlr.website'],
      delegatedProverUrls: [],
      coldStorageConfigPath: '',
    },
  },
  chains: {
    11155111: {
      rpcUrls: ['https://rpc.sepolia.org'],
    },
    5: {
      rpcUrls: ['https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'],
    },
    420: {
      rpcUrls: ['https://goerli.optimism.io'],
    },
  },
}
