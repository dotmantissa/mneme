import { Indexer } from '@0glabs/0g-ts-sdk';
import { ethers } from 'ethers';

let _provider: ethers.JsonRpcProvider | null = null;
let _signer: ethers.Wallet | null = null;
let _indexer: Indexer | null = null;

function providerOptions() {
  // Avoid batched RPC calls that some free RPC tiers reject.
  return { batchMaxCount: 1 } as const;
}

export function getProvider(): ethers.JsonRpcProvider {
  if (!_provider) {
    const rpcUrl = process.env.ZG_RPC_URL;
    if (!rpcUrl) throw new Error('ZG_RPC_URL is not set');
    _provider = new ethers.JsonRpcProvider(rpcUrl, undefined, providerOptions());
  }
  return _provider;
}

export function getSigner(): ethers.Wallet {
  if (!_signer) {
    const privateKey = process.env.ZG_PRIVATE_KEY;
    if (!privateKey) throw new Error('ZG_PRIVATE_KEY is not set');
    _signer = new ethers.Wallet(privateKey, getProvider());
  }
  return _signer;
}

export function getIndexer(): Indexer {
  if (!_indexer) {
    const indexerUrl = process.env.ZG_INDEXER_URL;
    if (!indexerUrl) throw new Error('ZG_INDEXER_URL is not set');
    _indexer = new Indexer(indexerUrl);
  }
  return _indexer;
}

export function getRpcUrls(): string[] {
  const configured = process.env.ZG_RPC_URL?.trim();
  const envFallbacks = (process.env.ZG_RPC_FALLBACK_URLS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const defaultFallbacks = [
    'https://evmrpc-testnet.0g.ai',
    'https://0g-galileo-testnet.drpc.org',
  ];

  const urls = configured
    ? [configured, ...envFallbacks, ...defaultFallbacks]
    : [...envFallbacks, ...defaultFallbacks];

  return Array.from(new Set(urls));
}

export function createProvider(rpcUrl: string): ethers.JsonRpcProvider {
  return new ethers.JsonRpcProvider(rpcUrl, undefined, providerOptions());
}

export function createSigner(rpcUrl: string): ethers.Wallet {
  const privateKey = process.env.ZG_PRIVATE_KEY;
  if (!privateKey) throw new Error('ZG_PRIVATE_KEY is not set');
  return new ethers.Wallet(privateKey, createProvider(rpcUrl));
}
