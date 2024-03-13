const { ethers } = require("hardhat");
const { expect, assert } = require("chai");

const {
  addressFactory,
  addressRouter,
  addressFrom,
  addressTo,
} = require("./utils/addressListPancake");
const { erc20Decimal, factoryABI, routerABI } = require("./utils/ABIList");

// Declaring the variables we will use
let provider,
  contractFactory,
  contractRouter,
  contractToken0,
  decimals,
  amountIn,
  amountOut;

// Connecting to provider
const url = "https://bsc-dataseed.bnbchain.org";
provider = new ethers.providers.JsonRpcProvider(url);

// New contracts for factory and router addresses
contractFactory = new ethers.Contract(addressFactory, factoryABI, provider);
contractRouter = new ethers.Contract(addressRouter, routerABI, provider);

// Contract for base token
contractToken0 = new ethers.Contract(addressFrom, erc20Decimal, provider);

// Get price information
const getAmountOut = async function (amountIn) {
  const decimals = await contractToken0.decimals();
  const amountInDec = ethers.utils.parseUnits(amountIn, decimals);
  // return amountInDec;
  const amountsOut = await contractRouter.getAmountsOut(amountInDec, [
    addressFrom,
    addressTo,
  ]);
  console.log("VAL", amountsOut);

  return amountsOut[1].toString();
};

(async function () {
  const timestamp = Date.now() + 60000;
  const date = new Date(timestamp);
  console.log(date, typeof timestamp);
})();
