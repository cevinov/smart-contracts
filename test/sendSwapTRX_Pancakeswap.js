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
    amountInSTR,
    amountOutSTR;

  // Connecting to provider
  const url =
    "https://ultra-dry-sheet.bsc.quiknode.pro/da7eedbc68bff1b7cf710e61ca4e145bf98c69fb/";
  provider = new ethers.providers.JsonRpcProvider(url);

  // New contracts for factory and router addresses
  contractFactory = new ethers.Contract(addressFactory, factoryABI, provider);
  contractRouter = new ethers.Contract(addressRouter, routerABI, provider);

  // Contract for base token
  contractToken0 = new ethers.Contract(addressFrom, erc20Decimal, provider);

  // Get price information
  const getAmountOut = async function (amountIn = "5") {
    // Convert amountIn value into blockchain format with decimals
    const decimals = await contractToken0.decimals();
    const amountInDec = ethers.utils.parseUnits(amountIn, decimals);

    const amountsOut = await contractRouter.getAmountsOut(amountInDec, [
      addressFrom,
      addressTo,
    ]);

    // Converts the amountOut value to a readable format
    const amountOutStr = ethers.utils.formatUnits(
      amountsOut[1].toString(),
      decimals
    );
    return amountOutStr;
  };

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

  //   Check if we got the amountOut value
  it("Check if we got the amountOut value", async function () {
    const checkAmountOut = await getAmountOut();
    assert(checkAmountOut);
  });

  // Send transactions to the fork mainnet, without using the test network. This is why we use hardhat to develop smart contracts on-premises.
  //   https://hardhat.org/hardhat-network/docs/guides/forking-other-networks
  it("Send a TRX, i.e swap a tokens", async function () {
    // Get signer wallet address with fork mainnet
    const [vinoSigner, ownerSigner] = await ethers.getSigners();
    console.log(vinoSigner.address, "\n", ownerSigner.address);

    /*
    Output for fake accounts and private keys after forking the BSC mainnet network with Quicknode:
    Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
    Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

    Account #1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 (10000 ETH)
    Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
    */
  });
});
