// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {SpiritNFT} from "../SpiritNFT.sol";

/**
 * @dev Simple upgrade that exposes a version helper for testing upgrades.
 */
contract SpiritNFTV2 is SpiritNFT {
    function version() external pure returns (string memory) {
        return "v2";
    }
}
