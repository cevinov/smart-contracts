// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

import "hardhat/console.sol";

// Import uniswap interfaces and libraries. Interact with other contracts on the blockchain, within our smart contract
import "./interfaces/IERC20.sol";
import "./interfaces/IUniswapV2Factory.sol";
import "./interfaces/IUniswapV2Pair.sol";
import "./interfaces/IUniswapV2Router01.sol";
import "./interfaces/IUniswapV2Router02.sol";
import "./libraries/UniswapV2Library.sol";
import "./libraries/SafeERC20.sol";

// Create a contract for a flash loan called FlashSwap
contract FlashSwap {
    // SafeERC20 contracts are required for matters that require approval on our behalf
    using SafeERC20 for IERC20;

    // Factory and routing address DEX (PancakeSwap)
    // https://docs.pancakeswap.finance/developers/smart-contracts/pancakeswap-exchange/v2-contracts
    address private constant PANCAKE_FACTORY =
        0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73;
    address private constant PANCAKE_ROUTER =
        0x10ED43C718714eb63d5aA57B78B54704E256024E;

    // List token address
    address private constant BSCUSD =
        0x55d398326f99059fF775485246999027B3197955;
    address private constant WBNB = 0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c;
    address private constant XRP = 0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE;
    address private constant ADA = 0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47;
    address private constant AVAX = 0x1CE0c2827e2eF14D5C4f29a091d735A204794041;
    address private constant LINK = 0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD;
    address private constant MATIC = 0xCC42724C6683B7E57334c4E856f4c9965ED682bD;
    address private constant LTC = 0x4338665CBB7B2485A8855A139b75D5e34AB0DB94;
    address private constant UNI = 0xBf5140A22578168FD562DCcF235E5D43A02ce9B1;

    // Set trade variables for SWAP operation
    uint256 private deadline = block.timestamp + 1 days; // Ensures the transaction reverts if it takes longer than 1 day to execute.
    uint256 private constant MAX_INT =
        115792089237316195423570985008687907853269984665640564039457584007913129639935; // Max integer value in Solidity that can be handled

    // Funding smart contracts (Increase token balance) to pay for gas fees or loans
    function fundFlashSwapContract(
        address _owner,
        address _token,
        uint256 _amount
    ) public {
        IERC20(_token).transferFrom(_owner, address(this), _amount); // Address points to the address of this smart contract
    }

    // Check contract balance
    function getTokenBalance(address _address) public view returns (uint256) {
        // Will return the balance for all tokens in this contract
        return IERC20(_address).balanceOf(address(this));
    }
}
