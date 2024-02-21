"use strict";
/*
The Uniswap Protocol is a decentralized marketplace to swap cryptocurrencies on the Ethereum blockchain. This means we will use etherscan to check the transactions of an address.
https://blog.uniswap.org/what-is-uniswap

https://docs.uniswap.org/sdk/v3/guides/swaps/routing
*/
const { ethers } = require("ethers");

// ABI list for interacting with smart contract
const {
  abi: quoterABI,
} = require("@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json");
const {
  abi: factoryABI,
} = require("@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json");

// https://techgeorgii.com/uniswap-v3-sdk-tutorial-part-1-load-token-balances/
const erc20Decimal = ["function decimals() external pure returns (uint8)"];

const factoryAddressV3 = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
const quoterAddressV3 = "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6";

const rpcUrl =
  "https://eth-mainnet.g.alchemy.com/v2/Jr8LwLYFtWORdP0gVAgOMiUjXvt28Z8S";
const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

const contractFactory = new ethers.Contract(
  factoryAddressV3,
  factoryABI,
  provider
);
const contractQuoter = new ethers.Contract(
  quoterAddressV3,
  quoterABI,
  provider
);
// console.log(contractQuoter);

async function getPrice(addressFrom, addressTo, amountInSTR) {
  // Read decimal value for Token1
  const contractToken1 = new ethers.Contract(
    addressFrom,
    erc20Decimal,
    provider
  );
  const decimalToken1 = await contractToken1.decimals();

  // Convert to blockchain format with parseUnits
  const amountInDec = ethers.utils
    .parseUnits(amountInSTR, decimalToken1)
    .toString();
  //   console.log(amountInDec);

  // Read decimal value for Token2
  const contractToken2 = new ethers.Contract(addressTo, erc20Decimal, provider);
  const decimalToken2 = await contractToken2.decimals();

  // Fee tiers are denoted in 1/100ths of a basis point so our fee tier will be 3000 (3%)
  const fee = 3000;

  // Get the quoteAmount value which is the value after the swap from Base (Token1) to Quote (Token2)
  // https://docs.uniswap.org/sdk/v3/guides/swaps/quoting
  // Given the amount you want to swap, produces a quote for the amount out for a swap of a single pool
  const quoteAmountOut = await contractQuoter.callStatic.quoteExactInputSingle(
    addressFrom,
    addressTo,
    fee,
    amountInDec.toString(),
    0
  );

  // Convert amount out value from blockchain format to readable format (String)
  const amoutOutSTR = ethers.utils
    .formatUnits(quoteAmountOut.toString(), decimalToken2)
    .toString();
  //   console.log(amoutOutSTR);

  console.log(decimalToken1, decimalToken2);
  return amoutOutSTR;
}

async function main() {
  // https://info.uniswap.org/home#/tokens
  const addressFrom = "0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2"; // MAKER
  const addressTo = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"; // USDC
  const amountInSTR = "1";

  const amoutOutSTR = await getPrice(addressFrom, addressTo, amountInSTR);
  console.log(`Swap MAKER to USDC = ${amountInSTR} -- ${amoutOutSTR}`);

  // Output: Swap MAKER to USDC = 1 -- 2086.148062
}

main();
