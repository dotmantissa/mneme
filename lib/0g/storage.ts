import { getIndexer, getSigner, getProvider } from './client';
import { MemData } from '@0glabs/0g-ts-sdk';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { randomUUID } from 'node:crypto';

export interface UploadResult {
  rootHash: string;
}

/**
 * Uploads a text string as a blob to 0G Storage.
 * Returns the root hash of the uploaded segment tree.
 */
export async function uploadMemoryBlob(content: string): Promise<UploadResult> {
  const signer = getSigner();
  const indexer = getIndexer();

  const buffer = Buffer.from(content, 'utf-8');
  const zgFile = new MemData(buffer);

  const [merkleTree, treeErr] = await zgFile.merkleTree();
  if (treeErr !== null || merkleTree === null) {
    throw new Error(`Failed to build Merkle tree: ${treeErr}`);
  }

  const rootHash = merkleTree.rootHash();
  if (!rootHash) throw new Error('Merkle root hash is null');

  const [tx, uploadErr] = await indexer.upload(
    zgFile,
    getProvider()._getConnection().url,
    (signer as unknown as Parameters<typeof indexer.upload>[2]),
  );
  if (uploadErr !== null) {
    throw new Error(`0G upload failed: ${uploadErr}`);
  }

  return { rootHash: tx.rootHash || rootHash };
}

/**
 * Downloads a blob from 0G Storage by root hash.
 * Returns the content as a UTF-8 string.
 */
export async function downloadMemoryBlob(rootHash: string): Promise<string> {
  const indexer = getIndexer();
  const tempFile = path.join(os.tmpdir(), `mneme-${randomUUID()}.blob`);

  try {
    const err = await indexer.download(rootHash, tempFile, true);
    if (err !== null) {
      throw new Error(`0G download failed: ${err}`);
    }

    const buffer = await fs.readFile(tempFile);
    return buffer.toString('utf-8');
  } finally {
    await fs.rm(tempFile, { force: true });
  }
}
