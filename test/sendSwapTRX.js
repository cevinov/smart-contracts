const { ethers } = require("hardhat");
const { expect, assert } = require("chai");

const {
  addressFactory,
  addressRouter,
  addressFrom,
  addressTo,
} = require("../utils/addressList");
const { erc20Decimal, factoryABI, routerABI } = require("../utils/ABIList");

describe("Read and Write to the Blockchain", function () {
  // Declaring the variables we will use
  let provider,
    contractFactory,
    contractRouter,
    contractToken0,
    decimals,
    amountIn,
    amountOut;

  const url = "https://bsc-dataseed.bnbchain.org";
  provider = new ethers.providers.JsonRpcProvider(url);

  // New contracts for factory and router addresses
  contractFactory = new ethers.Contract(addressFactory, factoryABI, provider);
  contractRouter = new ethers.Contract(addressRouter, routerABI, provider);

  // Contract for base token
  contractToken0 = new ethers.Contract(addressFrom, erc20Decimal, provider);
});
