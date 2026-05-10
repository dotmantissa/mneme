import { ethers } from 'ethers';
import { getSigner } from '@/lib/0g/client';
import { prisma } from '@/lib/db';

/**
 * Signs a memory's content hash using the 0G wallet.
 * Stores the signature and submits an on-chain attestation transaction.
 * Returns the signature and txHash.
 */
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

  const payload = JSON.stringify({
    id: memory.id,
    agentId: memory.agentId,
    contentHash: ethers.keccak256(ethers.toUtf8Bytes(memory.content)),
    createdAt: memory.createdAt.toISOString(),
  });

  const signature = await signer.signMessage(payload);

  let txHash: string | null = null;
  try {
    const tx = await signer.sendTransaction({
      to: await signer.getAddress(),
      value: BigInt(0),
      data: ethers.hexlify(ethers.toUtf8Bytes(`mneme:attest:${memoryId}`)),
    });
    await tx.wait(1);
    txHash = tx.hash;
  } catch (txErr) {
    console.warn('[attestMemory] On-chain tx failed, storing signature only:', txErr);
  }

  await prisma.memory.update({
    where: { id: memoryId },
    data: { signature, txHash },
  });

  return { signature, txHash };
}

/**
 * Verifies a stored signature against the memory's content.
 * Returns the recovered signer address.
 */
export async function verifyMemory(memoryId: string): Promise<{
  valid: boolean;
  recoveredAddress: string;
  expectedAddress: string;
}> {
  const memory = await prisma.memory.findUnique({
    where: { id: memoryId },
    select: { id: true, content: true, agentId: true, createdAt: true, signature: true },
  });
  if (!memory) throw new Error(`Memory not found: ${memoryId}`);
  if (!memory.signature) throw new Error('Memory has no signature');

  const payload = JSON.stringify({
    id: memory.id,
    agentId: memory.agentId,
    contentHash: ethers.keccak256(ethers.toUtf8Bytes(memory.content)),
    createdAt: memory.createdAt.toISOString(),
  });

  const recoveredAddress = ethers.verifyMessage(payload, memory.signature);
  const signer = getSigner();
  const expectedAddress = await signer.getAddress();

  return {
    valid: recoveredAddress.toLowerCase() === expectedAddress.toLowerCase(),
    recoveredAddress,
    expectedAddress,
  };
}
