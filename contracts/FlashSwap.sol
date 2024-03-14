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

// Create a contract for a flashloan called FlashSwapCross (Cross swap between two exchanges UniSwap and SushiSwap)
contract FlashSwapCross {
    // SafeERC20 contracts are required for matters that require approval on our behalf
    using SafeERC20 for IERC20;

    // Factory and routing address DEX (UniSwap and SushiSwap)
    // https://docs.uniswap.org/contracts/v2/reference/smart-contracts/v2-deployments
    address private constant UNISWAP_FACTORY_V2 =
        0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f;
    address private constant UNISWAP_ROUTER_V2 =
        0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;

    // https://dev.sushi.com/docs/Developers/Deployment%20Addresses
    address private constant SUSHISWAP_FACTORY_V2 =
        0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac;
    address private constant SUSHISWAP_ROUTER_V2 =
        0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F;

    // List token address
    address private constant BNB = 0xB8c77482e45F1F44dE1745F52C74426C631bDD52;
    address private constant UNI = 0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984;
    address private constant MKR = 0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2;

    // Set trade variables for SWAP operation
    uint private deadline = block.timestamp + 1 days; // Ensures the transaction reverts if it takes longer than 1 day to execute.
    uint private constant MAX_INT =
        115792089237316195423570985008687907853269984665640564039457584007913129639935; // Max integer value in Solidity that can be handled

    // Funding smart contracts (Increase token balance) to pay for gas fees or loans
    function fundFlashSwapContract(
        address _myAddress,
        address _token,
        uint _amount
    ) public {
        IERC20(_token).transferFrom(_myAddress, address(this), _amount); // Address points to the address of this smart contract
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
        uint _amountIn,
        address factory,
        address router
    ) private returns (uint) {
        // This function will place trades
        address pair = IUniswapV2Factory(factory).getPair(_fromToken, _toToken);
        require(pair != address(0), "Pool doesn't exist for that token pair");

        // Calculate the amount of tokens we will have after the swap
        address[] memory path = new address[](2); // Only allows two addresses
        path[0] = _fromToken;
        path[1] = _toToken;

        uint amountRequired = IUniswapV2Router01(router).getAmountsOut(
            _amountIn,
            path
        )[1];
        console.log("\namountRequired:", amountRequired);

        // Perform token swaps for triangular arbitrage
        // A > B || B > C || C > A
        uint amountReceived = IUniswapV2Router01(router)
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
        address _dummyToken, // This token is used to get the address of the token that has been borrowed (MKR)
        uint _amount
    ) external returns (bytes memory) {
        // Approve the transaction on behalf of, where the address we provide is the address of the ROUTER that will perform the swap.
        // https://ethereum.stackexchange.com/questions/140117/whats-the-benefit-of-using-safeerc20
        IERC20(_tokenBorrow).safeApprove(address(UNISWAP_ROUTER_V2), MAX_INT); // Approved loan for MKR to initiate swap (Triangular Arbitrage)
        IERC20(_tokenBorrow).safeApprove(address(SUSHISWAP_ROUTER_V2), MAX_INT); // Smart contracts can create TRX based on router addresses

        // Get pair address from getPair function, need pair address to call swap function
        address pair = IUniswapV2Factory(UNISWAP_FACTORY_V2).getPair(
            _tokenBorrow,
            _dummyToken
        );
        // address pair = IUniswapV2Factory(SUSHISWAP_FACTORY_V2).getPair(
        //     _tokenBorrow,
        //     _dummyToken
        // );

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
        console.log("Amount0:", amount0Out);

        uint amount1Out = _tokenBorrow == token1 ? _amount : 0;
        console.log("Amount1:", amount1Out);

        // Passing the data as bytes by encoding it, so that the pancakeCall function can know that it is for flashloans
        bytes memory data = abi.encode(_tokenBorrow, _amount, myAddress);

        // Execute swap to get the loan
        // address(this) refers to the address of the instance of the contract where the call is being made.
        IUniswapV2Pair(pair).swap(amount0Out, amount1Out, address(this), data); // This line will trigger uniswapV2Call
        // https://ethereum.stackexchange.com/questions/40018/what-is-addressthis-in-solidity
    }

    // Function to initiate arbitrage, conduct an arbitrary logic with the funds we already receive
    // Make sure this function can only be called from this contract
    // https://docs.uniswap.org/contracts/v2/guides/smart-contract-integration/using-flash-swaps
    function uniswapV2Call(
        address _sender,
        uint _amount0,
        uint _amount1,
        bytes calldata _data
    ) external {
        // “msg.sender” represents the address of the account that called the function present within the smart contract.
        address token0 = IUniswapV2Pair(msg.sender).token0();
        address token1 = IUniswapV2Pair(msg.sender).token1();
        address pair = IUniswapV2Factory(UNISWAP_FACTORY_V2).getPair(
            token0,
            token1
        );
        // address pair = IUniswapV2Factory(SUSHISWAP_FACTORY_V2).getPair(token0, token1);

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
        console.log("Loan Amount:", loanAmount);

        // Start Swap

        // Check if our swap triangular arbitrage is profitable
        // bool isProfit = checkProfitability(amountRepay, acquiredCoinT3);

        // The require keyword is the same as the if condition, the difference is that this keyword will force the program to exit if the requirement is not met.
        // require(isProfit, "Not Profitable!!!");

        // Step 2: Get profit from arbitrage, if not profitable then cancel the transaction
        // Take the profit we earned to myAddress, before completing the TRX by returning the loan
        // if (isProfit) {
        //     IERC20 otherToken = IERC20(MKR); // Profit in MKR
        //     otherToken.transfer(myAddress, acquiredCoinT3 - amountRepay);
        // }

        // Step 3: Return borrowed funds + pay gas fees
        // We need to pay for the gas before we deploy the code to the blockchain network.
        IERC20(tokenBorrow).transfer(pair, amountRepay);

        // If we don't have enough to pay then the code can never be deployed (BEP20: transfer amount exceeds balance).
        console.log("My Address:", myAddress);

        // Deploy contract to fork mainnet
        // https://hardhat.org/hardhat-runner/docs/guides/deploying

        // To confirm whether our deployment was successful, we can check it directly into the blockchain explorer
        // https://sepolia.etherscan.io/address/0x28d40a1c05ace3ae7ce42e289a14cb8268ace2e4

        // And also check if the balance in the wallet is reduced due to TRX fees (gas fees)
    }
}
