import { ethers } from 'ethers';
import { createSigner, getRpcUrls, getSigner } from '@/lib/0g/client';
import { prisma } from '@/lib/db';
import { ATTESTATION_ABI, getContractAddress } from './contract';

async function tryAttestOnRpc(
  rpcUrl: string,
  memoryId: string,
  contentHash: string
): Promise<string> {
  const signer = createSigner(rpcUrl);
  const contract = new ethers.Contract(getContractAddress(), ATTESTATION_ABI, signer);
  const tx = await contract.attest(memoryId, contentHash);
  const receipt = await tx.wait(1);
  return receipt.hash;
}

async function tryVerifyOnRpc(
  rpcUrl: string,
  memoryId: string,
  contentHash: string
): Promise<boolean> {
  const signer = createSigner(rpcUrl);
  const contract = new ethers.Contract(getContractAddress(), ATTESTATION_ABI, signer);
  return contract.verify(memoryId, contentHash);
}

export async function attestMemory(memoryId: string): Promise<{
  signature: string;
  txHash: string | null;
}> {
  const memory = await prisma.memory.findUnique({
    where: { id: memoryId },
    select: { id: true, content: true, agentId: true, createdAt: true },
  });
  if (!memory) throw new Error(`Memory not found: ${memoryId}`);

  const signer = getSigner();

  const contentHash = ethers.keccak256(ethers.toUtf8Bytes(memory.content));

  const payload = JSON.stringify({
    id: memory.id,
    agentId: memory.agentId,
    contentHash,
    createdAt: memory.createdAt.toISOString(),
  });
  const signature = await signer.signMessage(payload);

  let txHash: string | null = null;
  const rpcUrls = getRpcUrls();

  for (const rpcUrl of rpcUrls) {
    try {
      txHash = await tryAttestOnRpc(rpcUrl, memoryId, contentHash);
      break;
    } catch (txErr) {
      console.warn(`[attestMemory] Contract call failed on ${rpcUrl}:`, txErr);
    }
  }

  await prisma.memory.update({
    where: { id: memoryId },
    data: { signature, txHash },
  });

  return { signature, txHash };
}

export async function verifyMemory(memoryId: string): Promise<{
  valid: boolean;
  recoveredAddress: string;
  expectedAddress: string;
  onChainVerified: boolean;
}> {
  const memory = await prisma.memory.findUnique({
    where: { id: memoryId },
    select: { id: true, content: true, agentId: true, createdAt: true, signature: true },
  });
  if (!memory) throw new Error(`Memory not found: ${memoryId}`);
  if (!memory.signature) throw new Error('Memory has no signature');

  const contentHash = ethers.keccak256(ethers.toUtf8Bytes(memory.content));

  const payload = JSON.stringify({
    id: memory.id,
    agentId: memory.agentId,
    contentHash,
    createdAt: memory.createdAt.toISOString(),
  });

  const signer = getSigner();
  const recoveredAddress = ethers.verifyMessage(payload, memory.signature);
  const expectedAddress = await signer.getAddress();

  let onChainVerified = false;
  for (const rpcUrl of getRpcUrls()) {
    try {
      onChainVerified = await tryVerifyOnRpc(rpcUrl, memoryId, contentHash);
      if (onChainVerified) break;
    } catch (err) {
      console.warn(`[verifyMemory] Verify call failed on ${rpcUrl}:`, err);
    }
  }

  return {
    valid: recoveredAddress.toLowerCase() === expectedAddress.toLowerCase(),
    recoveredAddress,
    expectedAddress,
    onChainVerified,
  };
}
