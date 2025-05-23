// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title DigitalProductPassportRegistry
 * @dev Stores hashes of DPP data to ensure integrity.
 */
contract DigitalProductPassportRegistry {
    struct DPP {
        bytes32 dataHash;      // Hash of the DPP JSON data
        address owner;         // Creator/owner of the DPP
        uint256 createdAt;     // Block timestamp of creation
        uint256 updatedAt;     // Block timestamp of last update
    }

    // Maps productId (e.g., UUID) to its DPP record
    mapping(string => DPP) public dpps;

    // Events
    event DPPCreated(string productId, bytes32 dataHash, address owner);
    event DPPUpdated(string productId, bytes32 newHash, address updater);

    // Modifier to check ownership
    modifier onlyOwner(string memory productId) {
        require(dpps[productId].owner == msg.sender, "Not the DPP owner");
        _;
    }

    /**
     * @dev Create a new DPP entry
     * @param productId Unique identifier (from Node.js)
     * @param dataHash SHA-256 hash of the DPP JSON data
     */
    function createDPP(string memory productId, bytes32 dataHash) external {
        require(dpps[productId].owner == address(0), "DPP already exists");
        
        dpps[productId] = DPP({
            dataHash: dataHash,
            owner: msg.sender,
            createdAt: block.timestamp,
            updatedAt: block.timestamp
        });

        emit DPPCreated(productId, dataHash, msg.sender);
    }

    /**
     * @dev Update DPP data hash (e.g., when lifecycle events are added)
     * @param productId Existing DPP identifier
     * @param newHash New SHA-256 hash of updated DPP data
     */
    function updateDPP(string memory productId, bytes32 newHash) external onlyOwner(productId) {
        DPP storage dpp = dpps[productId];
        dpp.dataHash = newHash;
        dpp.updatedAt = block.timestamp;

        emit DPPUpdated(productId, newHash, msg.sender);
    }

    /**
     * @dev Get DPP metadata by productId
     */
    function getDPP(string memory productId) external view returns (
        bytes32 dataHash,
        address owner,
        uint256 createdAt,
        uint256 updatedAt
    ) {
        DPP memory dpp = dpps[productId];
        return (dpp.dataHash, dpp.owner, dpp.createdAt, dpp.updatedAt);
    }
}