// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MnemeAttestation {

    struct Attestation {
        bytes32 contentHash;
        address attester;
        uint256 timestamp;
    }

    mapping(string => Attestation) private _attestations;

    event MemoryAttested(
        string indexed memoryId,
        bytes32 indexed contentHash,
        address indexed attester,
        uint256 timestamp
    );

    /**
     * Store an attestation for a memory.
     * memoryId: the MNEME memory UUID
     * contentHash: keccak256 of the memory content string
     */
    function attest(string calldata memoryId, bytes32 contentHash) external {
        _attestations[memoryId] = Attestation({
            contentHash: contentHash,
            attester: msg.sender,
            timestamp: block.timestamp
        });
        emit MemoryAttested(memoryId, contentHash, msg.sender, block.timestamp);
    }

    /**
     * Retrieve a stored attestation by memory ID.
     */
    function getAttestation(string calldata memoryId)
        external
        view
        returns (bytes32 contentHash, address attester, uint256 timestamp)
    {
        Attestation memory a = _attestations[memoryId];
        return (a.contentHash, a.attester, a.timestamp);
    }

    /**
     * Returns true if a matching attestation exists for this memoryId and contentHash.
     */
    function verify(string calldata memoryId, bytes32 contentHash)
        external
        view
        returns (bool)
    {
        Attestation memory a = _attestations[memoryId];
        return a.attester != address(0) && a.contentHash == contentHash;
    }
}
