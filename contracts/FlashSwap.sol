// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

import "hardhat/console.sol";

// Import uniswap interfaces and libraries
import "./interfaces/IERC20.sol";
import "./interfaces/IUniswapV2Factory.sol";
import "./interfaces/IUniswapV2Pair.sol";
import "./interfaces/IUniswapV2Router01.sol";
import "./interfaces/IUniswapV2Router02.sol";
import "./libraries/UniswapV2Library.sol";
import "./libraries/SafeMath.sol";

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
