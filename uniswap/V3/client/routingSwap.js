// https://techgeorgii.com/uniswap-v3-sdk-swap-tutorial-part-4-get-swap-route/
// https://github.com/Uniswap/examples/tree/main/v3-sdk/routing
// https://docs.uniswap.org/sdk/v3/guides/swaps/routing

const {
  AlphaRouter,
  SwapOptionsSwapRouter02,
  SwapType,
} = require("@uniswap/smart-order-router");
const { ethers } = require("ethers");
const {
  TradeType,
  Token,
  CurrencyAmount,
  Percent,
} = require("@uniswap/sdk-core");
const ERC20_abi = require("./ERC20_abi.json");

const rpcUrl =
  "https://eth-mainnet.g.alchemy.com/v2/Jr8LwLYFtWORdP0gVAgOMiUjXvt28Z8S";
const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
const signer = new ethers.Wallet(
  "99a5b9e744beb919f4dfc3d03d8ea0811baf1203a80fbbc7a0d62cb78aa387c6",
  provider
);

const tokenBase = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"; // WETH (18 Dec)
const tokenQuote = "0xdAC17F958D2ee523a2206206994597C13D831ec7"; // USDT (6 Dec)
const walletAddress = "0x7e22e8e066574270e929f2FcE3f6515c4e5398Ad";
const chainId = 1; // Ethereum Mainnet

// create token contracts and related objects
const contractIn = new ethers.Contract(tokenBase, ERC20_abi, signer);
const contractOut = new ethers.Contract(tokenQuote, ERC20_abi, signer);
// console.log(contractIn);

const getTokenAndBalance = async function (contract) {
  var [dec, symbol, name, balance] = await Promise.all([
    contract.decimals(),
    contract.symbol(),
    contract.name(),
    contract.balanceOf(walletAddress),
  ]);

  return [new Token(chainId, contract.address, dec, symbol, name), balance];
};

const router = new AlphaRouter({
  // https://chainlist.org/?search=&testnets=false
  chainId: 1, // MAINNET
  provider,
});

(async () => {
  const [tokenIn, balanceTokenIn] = await getTokenAndBalance(contractIn);
  const [tokenOut, balanceTokenOut] = await getTokenAndBalance(contractOut);

  const amountIn = ethers.utils.parseUnits("1", 18);
  const inAmount = CurrencyAmount.fromRawAmount(tokenIn, amountIn.toString());
  //   console.log(inAmount);

  try {
    const route = await router.route(
      inAmount,
      tokenOut,
      TradeType.EXACT_INPUT,
      // swapOptions
      {
        type: SwapType.SWAP_ROUTER_02,
        recipient: walletAddress,
        slippageTolerance: new Percent(5, 10_000), // Slippage not > 0.05%
        deadline: Math.floor(Date.now() / 1000 + 1800), // add 1800 seconds – 30 mins deadline
      },
      // router config
      {
        // maxSwapsPerPath: 1, // remove this if you want multi-hop swaps as well.
      }
    );
    // console.log("rr", route);
    if (route == null || route.methodParameters === undefined) {
      throw "No route loaded";
    }
    console.log(
      `   You'll get ${route.quote.toFixed()} of ${tokenOut.symbol} from 1 ${
        tokenIn.symbol
      }`
    );
    // output quote minus gas fees
    console.log(`   Gas Adjusted Quote: ${route.quoteGasAdjusted.toFixed()}`);
    console.log(
      `   Gas Used Quote Token: ${route.estimatedGasUsedQuoteToken.toFixed()}`
    );
    console.log(`   Gas Used USD: ${route.estimatedGasUsedUSD.toFixed()}`);
    console.log(`   Gas Used: ${route.estimatedGasUsed.toString()}`);
    console.log(`   Gas Price Wei: ${route.gasPriceWei}`);
    console.log("");
  } catch (err) {
    console.log("Error: ", err);
  }
})();

/*
Output:
   You'll get 2899.431510 of USDT from 1 WETH
   Gas Adjusted Quote: 2880.491954
   Gas Used Quote Token: 18.939555
   Gas Used USD: 18.952500039884998199
   Gas Used: 128000
   Gas Price Wei: 51006581130
*/
