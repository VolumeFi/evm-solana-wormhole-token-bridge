# Token Transfer EVM <=> Solana

## Prerequisites

Before you begin, ensure you have the following:

 - [Node.js and npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) installed on your machine
 - A wallet with a private key, funded with native tokens (Testnet or Mainnet) for gas fees

Create a `.env` file at the root of the project with your private keys:

```bash
ETH_PRIVATE_KEY="INSERT_PRIVATE_KEY"
SOL_PRIVATE_KEY="INSERT_PRIVATE_KEY" // must be base58 not a byte array!
```

## Installation

1. Clone the repository and navigate to the project directory:

```bash
git clone git clone https://github.com/VolumeFi/evm-solana-wormhole-token-bridge.git
cd evm-solana-wormhole-token-bridge.git
```

2. Install the project dependencies:

```bash
npm install
```

## Running Transfers

### Token Transfer

network_type: Mainnet | Testnet
chain_id: "Solana" | "Ethereum" | "Terra" | "Bsc" | "Polygon" | "Avalanche" | "Oasis" | "Algorand" | "Aurora" | "Fantom" | "Karura" | "Acala" | "Klaytn" | "Celo" | "Near" | "Moonbeam" | "Neon" | "Terra2" | "Injective" | "Osmosis" | "Sui" | "Aptos" | "Arbitrum" | "Optimism" | "Gnosis" | "Pythnet" | "Xpla" | "Btc" | "Base" | "Sei" | "Rootstock" | "Scroll" | "Mantle" | "Blast" | "Xlayer" | "Linea" | "Berachain" | "Seievm" | "Snaxchain" | "Wormchain" | "Cosmoshub" | "Evmos" | "Kujira" | "Neutron" | "Celestia" | "Stargaze" | "Seda" | "Dymension" | "Provenance" | "Sepolia" | "ArbitrumSepolia" | "BaseSepolia" | "OptimismSepolia" | "Holesky" | "PolygonSepolia"
token_address: token contract address
amount: the token amount to bridge token

```bash
npm run transfer [network_type] [send_chain_id] [receive_chain_id] [token_address] [amount]
```

