// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

// For debugging using console.log
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
    address private constant DAI = 0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3;
    address private constant USDC = 0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d;
    address private constant WBNB = 0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c;
    address private constant CAKE = 0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82;
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

    // Check token balance
    function getTokenBalance(address _address) public view returns (uint) {
        // Will return the balance for all tokens in this contract
        return IERC20(_address).balanceOf(address(this));
    }

    // Place a trade
    function tradeSwap(
        address _fromToken,
        address _toToken,
        uint _amountIn
    ) private returns (uint) {
        // This function will place trades
        address pair = IUniswapV2Factory(PANCAKE_FACTORY).getPair(
            _fromToken,
            _toToken
        );
        require(pair != address(0), "Pool doesn't exist for that token pair");

        // Calculate the amount of tokens we will have after the swap
        address[] memory path = new address[](2); // Only allows two addresses
        path[0] = _fromToken;
        path[1] = _toToken;

        uint amountRequired = IUniswapV2Router01(PANCAKE_ROUTER).getAmountsOut(
            _amountIn,
            path
        )[1];
        console.log("\namountRequired:", amountRequired);

        // Perform token swaps for triangular arbitrage
        // A > B || B > C || C > A
        uint amountReceived = IUniswapV2Router01(PANCAKE_ROUTER)
            .swapExactTokensForTokens(
                _amountIn,
                amountRequired,
                path,
                address(this),
                deadline
            )[1];
        console.log("amountReceived:", amountReceived);
        // Make sure the values between amountRequired and amountReceived have the same amount

        // Check if the output value we get after the swap is positive
        require(amountReceived > 0, "Cancel TRX, not profitable");
        return amountReceived;
    }

    // Check profitability after completing the swap
    function checkProfitability(
        uint _input,
        uint _output
    ) private pure returns (bool) {
        return _output > _input ? true : false;
    }

    // Getting a loan to conduct a flashloan arbitration (Can NOT be used in inherited contract)
    function startLoan(
        address _tokenBorrow,
        address _dummyToken, // This token is only used to request a flashloan
        uint _amount
    ) external returns (bytes memory) {
        // Approve the transaction on behalf of, where the address we provide is the address of the ROUTER that will perform the swap.
        // https://ethereum.stackexchange.com/questions/140117/whats-the-benefit-of-using-safeerc20
        IERC20(DAI).safeApprove(address(PANCAKE_ROUTER), MAX_INT); // Approved loan for DAI to initiate swap (Triangular Arbitrage)

        // Get pair address from getPair function, need pair address to call swap function
        address pair = IUniswapV2Factory(PANCAKE_FACTORY).getPair(
            _tokenBorrow,
            _dummyToken
        );

        // Encode this address, this address will be used to store profit after swap
        address myAddress = msg.sender;
        console.log("Account that initiated the loan:", myAddress);

        // Check if combination not found
        require(pair != address(0), "Pool doesn't exist for that token pair");

        // Find out which of token0 (Base) or token1 (Quote) has the amount (From the loan)
        address token0 = IUniswapV2Pair(pair).token0();
        address token1 = IUniswapV2Pair(pair).token1();

        // Check between token0 & token1 that have the same address as the token we borrowed.
        uint amount0Out = _tokenBorrow == token0 ? _amount : 0;
        uint amount1Out = _tokenBorrow == token1 ? _amount : 0;

        // Passing the data as bytes by encoding it, so that the pancakeCall function can know that it is for flashloans
        bytes memory data = abi.encode(_tokenBorrow, _amount, myAddress);

        // Execute swap to get the loan
        // address(this) refers to the address of the instance of the contract where the call is being made.
        IUniswapV2Pair(pair).swap(amount0Out, amount1Out, address(this), data);
        // https://ethereum.stackexchange.com/questions/40018/what-is-addressthis-in-solidity
    }

    // Function to initiate arbitrage, conduct an arbitrary logic with the funds we already receive
    // Make sure this function can only be called from this contract
    function pancakeCall(
        address _sender,
        uint _amount0,
        uint _amount1,
        bytes calldata _data
    ) external {
        // “msg.sender” represents the address of the account that called the function present within the smart contract.
        address token0 = IUniswapV2Pair(msg.sender).token0();
        address token1 = IUniswapV2Pair(msg.sender).token1();
        address pair = IUniswapV2Factory(PANCAKE_FACTORY).getPair(
            token0,
            token1
        );

        require(msg.sender == pair, "Sender matches pair address");
        require(
            _sender == address(this),
            "The sender matches this contract address"
        );

        // Decode data to make loan payments
        (address tokenBorrow, uint amount, address myAddress) = abi.decode(
            _data,
            (address, uint, address)
        );
        uint fee = (amount * 3) / 997 + 1;
        uint amountRepay = amount + fee; // Amount of tokens we have to pay includes the fee 3%

        // Step 1: Do Arbitration (Swap)
        // Check the amount of tokens we borrowed in the first place
        uint loanAmount = _amount0 > 0 ? _amount0 : _amount1;

        // The swap is successful, if the initial amount of funds decreases due to the loan amount (10 DAI)
        uint acquiredCoinT1 = tradeSwap(DAI, CAKE, loanAmount); // In this case, 10 DAI get swapped to CAKE.
        console.log(
            "CAKE balance after first swap:",
            IERC20(CAKE).balanceOf(address(this))
        );
        require(acquiredCoinT1 > 0, "First swap failed");

        // Approve CAKE token transfer
        IERC20(CAKE).safeApprove(address(PANCAKE_ROUTER), MAX_INT);

        // Swap CAKE for BNB, with the amount we have after swapping 10 DAI for CAKE
        uint acquiredCoinT2 = tradeSwap(CAKE, WBNB, acquiredCoinT1);
        console.log(
            "WBNB balance after second swap:",
            IERC20(WBNB).balanceOf(address(this))
        );
        require(acquiredCoinT2 > 0, "Second swap failed"); // Make sure we get the value after the swap

        // Approve WBNB token transfer
        IERC20(WBNB).safeApprove(address(PANCAKE_ROUTER), MAX_INT);

        // Final swap BNB for DAI
        uint acquiredCoinT3 = tradeSwap(WBNB, DAI, acquiredCoinT2);

        // Check if our swap triangular arbitrage is profitable
        bool isProfit = checkProfitability(amountRepay, acquiredCoinT3);
        require(isProfit, "Not Profitable!!!");

        // Take the profit we earned to myAddress, before completing the TRX by returning the loan
        IERC20 otherToken = IERC20(DAI); // Profit in DAI
        otherToken.transfer(myAddress, acquiredCoinT3 - amountRepay);

        // Step 2: Get profit from arbitrage, if not profitable then cancel the transaction

        // Step 3: Pay loan + fee, if the flashSwap process is canceled then only pay the gas fee
        // And for the gas fee itself we need to approve it from the wallet, we need to pay for the gas before we deploy the code to the blockchain network.
        IERC20(tokenBorrow).transfer(pair, amountRepay);
        // If we don't have enough to pay then the code can never be deployed (INSUFFICIENT_INPUT_AMOUNT).
        console.log("My Address:", myAddress);
    }
}
