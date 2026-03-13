require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
require("hardhat-gas-reporter");

const { PRIVATE_KEY,
  SEPOLIA_RPC_URL,
  MAINNET_RPC_URL,
  ETHERSCAN_API_KEY,
  BSC_TESTNET_RPC_URL,
  BSC_MAINNET_RPC_URL,
  BSCSCAN_API_KEY, } = process.env;


module.exports = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },

  defaultNetwork: "hardhat",
  networks: {
    hardhat: {},
    sepolia: {
      url: SEPOLIA_RPC_URL || "",
      chainId: 11155111,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },

    mainnet: {
      url: MAINNET_RPC_URL || "",
      chainId: 1,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },

    bscTestnet: {
      url: BSC_TESTNET_RPC_URL || "",
      chainId: 97,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },

    bscMainnet: {
      url: BSC_MAINNET_RPC_URL || "",
      chainId: 56,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
  },

  gasReporter: {
    enabled: true,
    currency: "USD",
    showMethodSig: true,
    coinmarketcap: null,
  },

  etherscan: {
    apiKey: ETHERSCAN_API_KEY || "",
    // apikey: BSCSCAN_API_KEY || "",
  }
};