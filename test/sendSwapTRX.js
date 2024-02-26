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

  // DO validation values for each main variable
  it("Test connection (Provider, Factory, Router, Token)", async function () {
    assert(provider._isProvider);
    expect(contractFactory.address).to.equal(
      "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73"
    );
    expect(contractRouter.address).to.equal(
      "0x10ED43C718714eb63d5aA57B78B54704E256024E"
    );
    expect(contractToken0.address).to.equal(
      "0x2170Ed0880ac9A755fd29B2688956BD959F933F8"
    );
  });
});
