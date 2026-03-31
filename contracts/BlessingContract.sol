// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";

interface ISpiritNFT {
    function ownerOf(uint256 tokenId) external view returns (address);
}

/**
 * @title BlessingContract
 * @notice Accepts ETH offerings tied to SpiritNFT tokens and stores a blessing trail.
 */
contract BlessingContract is Ownable {
    using Address for address payable;

    struct Blessing {
        address from;
        uint256 spiritId;
        string blessingType;
        uint256 amount;
        uint256 timestamp;
    }

    event BlessingReceived(uint256 indexed spiritId, address indexed from, string blessingType, uint256 amount);

    error InvalidSpirit();
    error BlessingAmountTooLow();
    error InvalidBlessingType();

    ISpiritNFT public immutable spiritNFT;
    uint256 public minBlessingAmount;

    mapping(uint256 => Blessing[]) private _blessingsBySpirit;

    constructor(address spiritNFTAddress, uint256 minAmount) Ownable(msg.sender) {
        if (spiritNFTAddress == address(0)) {
            revert InvalidSpirit();
        }
        spiritNFT = ISpiritNFT(spiritNFTAddress);
        minBlessingAmount = minAmount;
    }

    function bless(uint256 spiritId, string memory blessingType) external payable {
        _ensureValidSpirit(spiritId);
        _validateBlessingType(blessingType);

        if (msg.value < minBlessingAmount) {
            revert BlessingAmountTooLow();
        }

        Blessing memory record = Blessing({
            from: msg.sender,
            spiritId: spiritId,
            blessingType: blessingType,
            amount: msg.value,
            timestamp: block.timestamp
        });
        _blessingsBySpirit[spiritId].push(record);

        emit BlessingReceived(spiritId, msg.sender, blessingType, msg.value);
    }

    function getBlessingCount(uint256 spiritId) external view returns (uint256) {
        return _blessingsBySpirit[spiritId].length;
    }

    function getRecentBlessings(uint256 spiritId, uint256 count) external view returns (Blessing[] memory) {
        Blessing[] storage history = _blessingsBySpirit[spiritId];
        uint256 total = history.length;
        if (count > total) {
            count = total;
        }

        Blessing[] memory result = new Blessing[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = history[total - count + i];
        }
        return result;
    }

    function withdraw() external onlyOwner {
        address payable recipient = payable(owner());
        recipient.sendValue(address(this).balance);
    }

    function setMinBlessingAmount(uint256 amount) external onlyOwner {
        minBlessingAmount = amount;
    }

    function _ensureValidSpirit(uint256 spiritId) private view {
        try spiritNFT.ownerOf(spiritId) returns (address) {}
        catch {
            revert InvalidSpirit();
        }
    }

    function _validateBlessingType(string memory blessingType) private pure {
        bytes32 blessingHash = keccak256(bytes(blessingType));
        if (
            blessingHash != keccak256("candle") &&
            blessingHash != keccak256("flower") &&
            blessingHash != keccak256("prayer") &&
            blessingHash != keccak256("charm")
        ) {
            revert InvalidBlessingType();
        }
    }
}
