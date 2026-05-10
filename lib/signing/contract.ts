export const ATTESTATION_ABI = [
  'function attest(string calldata memoryId, bytes32 contentHash) external',
  'function getAttestation(string calldata memoryId) external view returns (bytes32 contentHash, address attester, uint256 timestamp)',
  'function verify(string calldata memoryId, bytes32 contentHash) external view returns (bool)',
] as const;

export function getContractAddress(): string {
  const addr = process.env.ATTESTATION_CONTRACT_ADDRESS;
  if (!addr) throw new Error('ATTESTATION_CONTRACT_ADDRESS is not set');
  return addr;
}
