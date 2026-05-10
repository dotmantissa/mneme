import { Indexer } from '@0glabs/0g-ts-sdk';
import { ethers } from 'ethers';

let _provider: ethers.JsonRpcProvider | null = null;
let _signer: ethers.Wallet | null = null;
let _indexer: Indexer | null = null;

export function getProvider(): ethers.JsonRpcProvider {
  if (!_provider) {
    const rpcUrl = process.env.ZG_RPC_URL;
    if (!rpcUrl) throw new Error('ZG_RPC_URL is not set');
    _provider = new ethers.JsonRpcProvider(rpcUrl);
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
