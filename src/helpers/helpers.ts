import {
	ChainAddress,
	ChainContext,
	Network,
	Signer,
	Chain,
	TxHash,
} from '@wormhole-foundation/sdk';
import {
	DEFAULT_TASK_TIMEOUT,
	TokenTransfer,
	TransferState,
	Wormhole,
	amount,
	api,
	tasks,
} from "@wormhole-foundation/sdk";
import evm from '@wormhole-foundation/sdk/evm';
import solana from '@wormhole-foundation/sdk/solana';
import { config } from 'dotenv';
config();

export interface SignerStuff<N extends Network, C extends Chain> {
	chain: ChainContext<N, C>;
	signer: Signer<N, C>;
	address: ChainAddress<C>;
}

// Function to fetch environment variables (like your private key)
function getEnv(key: string): string {
	const val = process.env[key];
	if (!val) throw new Error(`Missing environment variable: ${key}`);
	return val;
}

// Signer setup function for different blockchain platforms
export async function getSigner<N extends Network, C extends Chain>(
	chain: ChainContext<N, C>
): Promise<{ chain: ChainContext<N, C>; signer: Signer<N, C>; address: ChainAddress<C> }> {
	let signer: Signer;
	const platform = chain.platform.utils()._platform;

	switch (platform) {
		case 'Solana':
			signer = await (await solana()).getSigner(await chain.getRpc(), getEnv('SOL_PRIVATE_KEY'));
			break;
		case 'Evm':
			signer = await (await evm()).getSigner(await chain.getRpc(), getEnv('ETH_PRIVATE_KEY'));
			break;
		default:
			throw new Error('Unsupported platform: ' + platform);
	}

	return {
		chain,
		signer: signer as Signer<N, C>,
		address: Wormhole.chainAddress(chain.chain, signer.address()),
	};
}

export async function waitLog<N extends Network = Network>(
	wh: Wormhole<N>,
	xfer: TokenTransfer<N>,
	tag: string = "WaitLog",
	timeout: number = DEFAULT_TASK_TIMEOUT,
) {
	const tracker = TokenTransfer.track(wh, TokenTransfer.getReceipt(xfer), timeout);
	let receipt;
	for await (receipt of tracker) {
		console.log(`${tag}: Current trasfer state: `, TransferState[receipt.state]);
	}
	return receipt;
}
