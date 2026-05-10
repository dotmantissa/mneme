import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import * as dotenv from 'dotenv';
dotenv.config({ path: '../.env.local' });

const config: HardhatUserConfig = {
  solidity: '0.8.20',
  networks: {
    zgTestnet: {
      url: 'https://evmrpc-testnet.0g.ai',
      chainId: 16602,
      accounts: process.env.ZG_PRIVATE_KEY ? [process.env.ZG_PRIVATE_KEY] : [],
    },
    zgMainnet: {
      url: 'https://evmrpc.0g.ai',
      chainId: 16661,
      accounts: process.env.ZG_PRIVATE_KEY ? [process.env.ZG_PRIVATE_KEY] : [],
    },
  },
};

export default config;
