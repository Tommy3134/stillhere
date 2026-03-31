// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {ERC721Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

/**
 * @title SpiritNFT
 * @notice Soulbound ERC-721 tokens representing user spirits, upgradeable through UUPS proxies.
 */
contract SpiritNFT is Initializable, ERC721Upgradeable, OwnableUpgradeable, UUPSUpgradeable {
    struct SpiritMetadata {
        string name;
        string spiritType;
        uint256 createdAt;
        string metadataURI;
    }

    event SpiritMinted(uint256 indexed tokenId, address indexed owner, string name, string spiritType);
    event MetadataURIUpdated(uint256 indexed tokenId, string newURI);

    error SoulboundTransferBlocked();
    error InvalidSpiritType();
    error UnauthorizedMetadataUpdate();

    uint256 private _nextTokenId;
    mapping(uint256 => SpiritMetadata) private _spirits;
    mapping(address => uint256[]) private _ownedSpirits;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(string memory name_, string memory symbol_) public initializer {
        __ERC721_init(name_, symbol_);
        __Ownable_init(_msgSender());
        __UUPSUpgradeable_init();
    }

    function mintSpirit(
        address to,
        string memory name,
        string memory spiritType,
        string memory metadataURI
    ) external onlyOwner returns (uint256 tokenId) {
        _validateSpiritType(spiritType);
        tokenId = ++_nextTokenId;
        _safeMint(to, tokenId);

        _spirits[tokenId] = SpiritMetadata({
            name: name,
            spiritType: spiritType,
            createdAt: block.timestamp,
            metadataURI: metadataURI
        });

        emit SpiritMinted(tokenId, to, name, spiritType);
    }

    function updateMetadataURI(uint256 tokenId, string memory newURI) external {
        _requireOwned(tokenId);
        address tokenOwner = ownerOf(tokenId);
        if (_msgSender() != tokenOwner && _msgSender() != owner()) {
            revert UnauthorizedMetadataUpdate();
        }
        _spirits[tokenId].metadataURI = newURI;
        emit MetadataURIUpdated(tokenId, newURI);
    }

    function getSpiritMetadata(uint256 tokenId) external view returns (SpiritMetadata memory) {
        _requireOwned(tokenId);
        return _spirits[tokenId];
    }

    function getSpiritsOf(address ownerAddress) external view returns (uint256[] memory) {
        uint256[] storage owned = _ownedSpirits[ownerAddress];
        uint256[] memory copy = new uint256[](owned.length);
        for (uint256 i = 0; i < owned.length; i++) {
            copy[i] = owned[i];
        }
        return copy;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return _spirits[tokenId].metadataURI;
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address previousOwner = _ownerOf(tokenId);
        bool isMint = previousOwner == address(0);

        if (!isMint && to != address(0) && to != previousOwner) {
            revert SoulboundTransferBlocked();
        }

        address from = super._update(to, tokenId, auth);

        if (isMint && to != address(0)) {
            _ownedSpirits[to].push(tokenId);
        }

        return from;
    }

    function _validateSpiritType(string memory spiritType) private pure {
        bytes32 spiritTypeHash = keccak256(bytes(spiritType));
        if (
            spiritTypeHash != keccak256("pet_cat") &&
            spiritTypeHash != keccak256("pet_dog") &&
            spiritTypeHash != keccak256("pet_other") &&
            spiritTypeHash != keccak256("human")
        ) {
            revert InvalidSpiritType();
        }
    }
}
