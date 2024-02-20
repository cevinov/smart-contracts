// const { ethers } = require("hardhat"); // Need this to remove ReferenceError: ethers is not defined

import { ethers } from "ethers";

import {
  addressFactory,
  addressRouter,
  addressFrom,
  addressTo,
} from "./addressList.js";

import {
  erc20Decimal,
  factoryABI,
  pairABI,
  allPairs,
  routerABI,
} from "./ABIList.js";

// console.log(addressFrom, addressTo, allPairs);
/*


*/
// What is RPC endpoint?: https://101blockchains.com/rpc-node/
// RPC endpoint used to send commands to blockchain nodes and receive responses
// https://ethereumnodes.com

// The next thing is connected to the blockchain with the provider (ETH RPC endpoint) using ethers library
const url =
  "https://eth-mainnet.g.alchemy.com/v2/Jr8LwLYFtWORdP0gVAgOMiUjXvt28Z8S";
const provider = new ethers.providers.JsonRpcProvider(url);
// console.log(provider);

// Connect to factory address using provider
const contractFactory = new ethers.Contract(
  addressFactory,
  factoryABI,
  provider
);
// console.log(contractFactory);

// Connect to router address
const contractRouter = new ethers.Contract(addressRouter, routerABI, provider);
// console.log(contractRouter);
/*


*/
// Call function inside the smart contract
const getPrices = async function (amountInSTR) {
  const contractToken1 = new ethers.Contract(
    addressFrom,
    erc20Decimal,
    provider
  );

  // Convert the variables that have been passed into the blockchain format with decimal value (Base)
  // Get decimal value from the address
  const decimalToken1 = await contractToken1.decimals();
  const amountInDec = ethers.utils
    .parseUnits(amountInSTR, decimalToken1)
    .toString();

  // This function (getAmountsOut) performs chained getAmountOut calculations on any number of pairs
  // Will return an array that has 2 values (input amount and the maximum output amount of the asset)
  const amountsOut = await contractRouter.getAmountsOut(amountInDec, [
    addressFrom,
    addressTo,
  ]);

  // Convert amountOut value with decimal (Quote)
  const contractToken2 = new ethers.Contract(addressTo, erc20Decimal, provider);
  const decimalToken2 = await contractToken2.decimals();

  // Convert amount out value from blockchain format to readable format (String)
  const amountOutSTR = ethers.utils
    .formatUnits(amountsOut[1].toString(), decimalToken2)
    .toString();

  return amountOutSTR;
};

// getPrices("5");

async function calcSwap() {
  const amountIn = "5";
  const amountOut = await getPrices(amountIn);
  console.log("AmountIn - AmountOut (Base to Quote): ", amountIn, amountOut);

  // Check the output with pancakeswap
  // https://pancakeswap.finance/swap

  // Output: AmountIn - AmountOut (Base to Quote):  5 40.4384848917597639
}

calcSwap();
