import { Wormhole, signSendWait, wormhole } from "@wormhole-foundation/sdk";

import evm from "@wormhole-foundation/sdk/evm";
import solana from "@wormhole-foundation/sdk/solana";
import { inspect } from "util";
import { getSigner } from "./helpers/index.js";

type NetworkType = "Mainnet" | "Testnet";
type ChainName = "Solana" | "Ethereum" | "Terra" | "Bsc" | "Polygon" | "Avalanche" | "Oasis" | "Algorand" | "Aurora" | "Fantom" | "Karura" | "Acala" | "Klaytn" | "Celo" | "Near" | "Moonbeam" | "Neon" | "Terra2" | "Injective" | "Osmosis" | "Sui" | "Aptos" | "Arbitrum" | "Optimism" | "Gnosis" | "Pythnet" | "Xpla" | "Btc" | "Base" | "Sei" | "Rootstock" | "Scroll" | "Mantle" | "Blast" | "Xlayer" | "Linea" | "Berachain" | "Seievm" | "Snaxchain" | "Wormchain" | "Cosmoshub" | "Evmos" | "Kujira" | "Neutron" | "Celestia" | "Stargaze" | "Seda" | "Dymension" | "Provenance" | "Sepolia" | "ArbitrumSepolia" | "BaseSepolia" | "OptimismSepolia" | "Holesky" | "PolygonSepolia";

async function createWrap(networkType: NetworkType, origChainName: ChainName, tokenAddress: string, destChainName: ChainName, recoverTxId: undefined | string): Promise<any> {
    try {
        const wh = await wormhole(networkType, [evm, solana]);

        // Original Token to Attest

        // grab context and signer
        const origChain = wh.getChain(origChainName);
        // const token = await origChain.getNativeWrappedTokenId();
        const token = Wormhole.tokenId(origChain.chain, tokenAddress);
        const { signer: origSigner } = await getSigner(origChain);

        // Check if its attested and if not
        // submit the attestation to the token bridge on the
        // destination chain
        // const chain = "Sepolia";
        const destChain = wh.getChain(destChainName);
        const { signer } = await getSigner(destChain);
        // grab a ref to the token bridge
        const tb = await destChain.getTokenBridge();
        try {
        // try to get the wrapped version, an error here likely means
        // its not been attested
            const wrapped = await tb.getWrappedAsset(token);
            console.log("Already wrapped", wrapped);
          return { destChainName, address: wrapped };
        } catch (e) {}

        // Note: if the VAA is not produced before the attempt to retrieve it times out
        // you should set this value to the txid logged in the previous run
        let txid = recoverTxId;
        // txid = "0x55127b9c8af46aaeea9ef28d8bf91e1aff920422fc1c9831285eb0f39ddca2fe";

        if (!txid) {
            // create attestation from origin chain, the same VAA
            // can be used across all chains
            const tb = await origChain.getTokenBridge();
            const attestTxns = tb.createAttestation(
                token.address,
                Wormhole.parseAddress(origSigner.chain(), origSigner.address()),
            );
            const txids = await signSendWait(origChain, attestTxns, origSigner);
            console.log("txids: ", inspect(txids, { depth: null }));
            txid = txids[0]!.txid;
            console.log("Created attestation (save this): ", txid);
        }

        // Get the wormhole message id from the transaction logs
        const msgs = await origChain.parseTransaction(txid);
        console.log(msgs);

        // Get the Signed VAA from the API
        const timeout = 1800_000; // 1800 seconds
        const vaa = await wh.getVaa(msgs[0]!, "TokenBridge:AttestMeta", timeout);
        if (!vaa) throw new Error("VAA not found after retries exhausted, try extending the timeout");

        console.log(vaa.payload.token.address);

        // no wrapped asset, needs to be attested
        console.log("Attesting asset");
        await signSendWait(
            destChain,
            tb.submitAttestation(vaa, Wormhole.parseAddress(signer.chain(), signer.address())),
            signer,
        );

        async function waitForIt() {
            do {
                // check again
                try {
                    const wrapped = await tb.getWrappedAsset(token);
                    return { destChainName, address: wrapped };
                } catch (e) {
                    console.error(e);
                }
                console.log("Waiting before checking again...");
                await new Promise((r) => setTimeout(r, 2000));
            } while (true);
        }

        console.log("Wrapped: ", await waitForIt());
    } catch (e) {
        console.error(e);
    }
}

createWrap(<NetworkType>process.argv[2], <ChainName>process.argv[3], process.argv[4], <ChainName>process.argv[5], process.argv[6]);