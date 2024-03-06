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

// Create a contract for a flashloan called FlashSwap
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
    uint private deadline = block.timestamp + 1 days; // Ensures the transaction reverts if it takes longer than 1 day to execute.
    uint private constant MAX_INT =
        115792089237316195423570985008687907853269984665640564039457584007913129639935; // Max integer value in Solidity that can be handled

    // Funding smart contracts (Increase token balance) to pay for gas fees or loans
    function fundFlashSwapContract(
        address _owner,
        address _token,
        uint _amount
    ) public {
        IERC20(_token).transferFrom(_owner, address(this), _amount); // Address points to the address of this smart contract
    }

    // Check contract balance
    function getTokenBalance(address _address) public view returns (uint) {
        // Will return the balance for all tokens in this contract
        return IERC20(_address).balanceOf(address(this));
    }

    // Getting a loan to conduct a flashloan arbitration (Can NOT be used in inherited contract)
    function startArbitrage(
        address _tokenBorrow,
        uint _amount
    ) external returns (bytes memory) {
        // Approve the transaction on behalf of, where the address we provide is the address of the ROUTER that will perform the swap.
        IERC20(BSCUSD).safeTransfer(address(PANCAKE_ROUTER), MAX_INT);
        IERC20(WBNB).safeTransfer(address(PANCAKE_ROUTER), MAX_INT);
        IERC20(XRP).safeTransfer(address(PANCAKE_ROUTER), MAX_INT);
        IERC20(ADA).safeTransfer(address(PANCAKE_ROUTER), MAX_INT);
        IERC20(AVAX).safeTransfer(address(PANCAKE_ROUTER), MAX_INT);
        IERC20(LINK).safeTransfer(address(PANCAKE_ROUTER), MAX_INT);
        IERC20(MATIC).safeTransfer(address(PANCAKE_ROUTER), MAX_INT);
        IERC20(LTC).safeTransfer(address(PANCAKE_ROUTER), MAX_INT);
        IERC20(UNI).safeTransfer(address(PANCAKE_ROUTER), MAX_INT);

        // Get pair address from getPair function, need pair address to call swap function
        address pair = IUniswapV2Factory(PANCAKE_FACTORY).getPair(
            _tokenBorrow,
            WBNB
        );

        // Check if combination not found
        require(pair != address(0), "Pool doesn't exist for that token pair");

        // Find out which of token0 (Base) or token1 (Quote) has the amount (From the loan)
        address token0 = IUniswapV2Pair(pair).token0();
        address token1 = IUniswapV2Pair(pair).token1();

        // Check between token0 & token1 that have the same address as the token we borrowed.
        uint amount0Out = _tokenBorrow == token0 ? _amount : 0;
        uint amount1Out = _tokenBorrow == token1 ? _amount : 0;

        // Passing the data as bytes by encoding it, so that the swap function can tell that it is for a flashloan
        bytes memory data = abi.encode(_tokenBorrow, _amount);

        // Execute swap to get the loan
        IUniswapV2Pair(pair).swap(amount0Out, amount1Out, address(this), data);
    }

    // Function to initiate arbitrage
    function pancakeCall(
        address _sender,
        uint _amount0,
        uint _amount1,
        bytes calldata _data
    ) external {}
}
