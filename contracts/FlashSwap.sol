// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

import "hardhat/console.sol";

// Import uniswap interfaces and libraries

// Create a contract for a flash loan called FlashSwap
contract FlashSwap {
    string private myName = "";
    function setName(string memory _name) public {
        myName = _name;
    }

    function getName() public view returns (string memory) {
        console.log(myName);
        return myName;
    }
}
