# AdvanceERC20Token "Cryptoera.sol"

AdvanceERC20 is a modern **ERC-20 token smart contract** built with **Hardhat** and **OpenZeppelin**.
It includes production-ready features such as **buy/sell taxation, liquidity-pool detection, anti-sniper protection, pause control, and multi-network deployment support**.

The contract is designed for deployment on **Ethereum and BNB Smart Chain networks**.

---

## Key Features

* ERC-20 standard implementation using **OpenZeppelin**
* Fixed supply with structured **reserve allocation**
* **Buy tax (3%)** and **Sell tax (5%)**
* **Wallet-to-wallet transfers with zero tax**
* **First-buy protection** to prevent launch sniping bots
* **Pause / unpause system** for emergency control
* **Liquidity pool detection** for automated tax logic
* **Hardhat development environment**
* **Multi-network deployment support**


The project is designed to deploy on **Ethereum** and **BNB Smart Chain** networks.

---

# Features

## Standard ERC-20 Implementation

The contract is built using OpenZeppelin's audited components:

* ERC20
* Ownable
* Pausable

The token uses the modern OpenZeppelin **`_update()`**** hook** instead of overriding `_transfer()`, enabling custom logic like taxes and trading restrictions while keeping the ERC-20 standard intact.

---

# Token Supply

Total Supply

1,000,000,000 tokens

Decimals

18

All tokens are minted **once in the constructor** and distributed into predefined reserves.

---

# Reserve Allocation

The supply is split across multiple operational wallets.

| Reserve             | Purpose                      |
| ------------------- | ---------------------------- |
| LP Reserve          | Liquidity pool creation      |
| Exchange Reserve    | Centralized exchange listing |
| Treasury Reserve    | Project treasury             |
| Marketing Reserve   | Marketing & promotion        |
| Team Reserve        | Core team allocation         |
| Development Reserve | Future development           |

Each reserve is sent to a **hard-coded wallet address during deployment**.

---

# Buy / Sell Tax System

The contract includes a basic trading tax mechanism.

| Transaction Type    | Tax |
| ------------------- | --- |
| Buy (DEX → Wallet)  | 3%  |
| Sell (Wallet → DEX) | 5%  |
| Wallet → Wallet     | 0%  |

Tax logic:

* Buy detected when `from == uniswapPool`
* Sell detected when `to == uniswapPool`

Tax is transferred to a dedicated **taxWallet**.

Example formula:

taxAmount = (value * taxPercent) / 100

---

# First-Buy Protection (Anti-Sniper)

Before trading begins:

firstBuyCompleted = false

Once the owner sets the liquidity pool address (`uniswapPool`), the **first buy transaction must be executed by the owner**.

Condition:

if from == uniswapPool AND firstBuyCompleted == false
then to must equal owner()

If another wallet attempts to buy first, the transaction will revert with:

"First Buy Pending"

After the owner's first buy:

firstBuyCompleted = true

Event emitted:

FirstBuyDone

After this event, **public trading becomes available**.

---

# Pause System

The contract supports emergency pause functionality.

Owner can:

pause()
unpause()

When paused:

* token transfers are blocked

---

# Access Control

Owner privileges include:

* setting the main liquidity pool
* pausing / unpausing transfers
* administrative contract control

Owner is set automatically during deployment via **Ownable**.

---

# Contract Functions

Main external functions:

setUniswapPool(address pool)

Sets the primary liquidity pool used for tax detection.

pause()

Pauses all token transfers.

unpause()

Resumes token transfers.

increaseAllowance(address spender, uint256 amount)

Safely increases spender allowance.

decreaseAllowance(address spender, uint256 amount)

Safely decreases spender allowance.

---

# Tech Stack

Core Development Tools

* Node.js
* Hardhat
* NPM

Dependencies

OpenZeppelin Contracts
Hardhat Toolbox
Hardhat Gas Reporter
dotenv

---

# Supported Networks

The project supports deployment to multiple EVM networks.

Ethereum

Sepolia Testnet
Ethereum Mainnet

BNB Smart Chain

BSC Testnet
BSC Mainnet

Network configuration is defined in:

hardhat.config.js

---

# Project Structure

Advance-ERC20/

contracts/
AdvanceERC20.sol

scripts/
deploy.js

test/
AdvanceERC20.test.js

hardhat.config.js

package.json

---

# Installation

Clone the repository

git clone <YOUR_REPO_URL>
cd Advance-ERC20

Install dependencies

npm install

---

# Compile Contract

npx hardhat compile

---

# Run Tests

npx hardhat test

---

# Deployment

Deploy to Sepolia

npx hardhat run scripts/deploy.js --network sepolia

Deploy to BSC Testnet

npx hardhat run scripts/deploy.js --network bscTestnet

---

# Environment Variables

Create a `.env` file in the project root.

PRIVATE_KEY=your_wallet_private_key

SEPOLIA_RPC_URL=your_rpc_url

BSC_TESTNET_RPC_URL=your_rpc_url

ETHERSCAN_API_KEY=your_api_key

---

# Contract Verification

Example verification command

npx hardhat verify --network sepolia DEPLOYED_CONTRACT_ADDRESS

---

# Security Considerations

* first-buy protection prevents launch sniping bots
* pause system allows emergency shutdown
* tax routing is deterministic and transparent
* fixed supply prevents inflation

---

# License

MIT License