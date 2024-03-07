const { ethers, waffle } = require("hardhat");
const { expect, assert } = require("chai");

const {
  addressFactory,
  addressRouter,
  addressFrom,
  addressTo,
} = require("../utils/addressListUniswapV2");
const { erc20Decimal, factoryABI, routerABI } = require("../utils/ABIList");

describe("Read and Write to the Blockchain", function () {
  // Declaring the variables we will use
  let provider,
    contractFactory,
    contractRouter,
    contractToken0,
    amountIN,
    amountOUT;

  // Connecting to provider
  const url = "https://mainnet.infura.io/v3/5ab76f78c3f34a36b1c7e23bede5d927";
  provider = new ethers.providers.JsonRpcProvider(url);

  // New contracts for factory and router addresses
  contractFactory = new ethers.Contract(addressFactory, factoryABI, provider);
  contractRouter = new ethers.Contract(addressRouter, routerABI, provider);

  // Contract for base token
  contractToken0 = new ethers.Contract(addressFrom, erc20Decimal, provider);

  // Function converts amount to blockchain format
  async function convertBlockchain(amount = "5") {
    // Convert amountIn value into blockchain format with decimals
    const decimals = await contractToken0.decimals();
    const amountDec = ethers.utils.parseUnits(amount, decimals);
    return [decimals, amountDec];
  }

  // Function converts amount to readable format from blockchain format
  async function convertReadable(decimals, amount) {
    // Converts the amountOut value to a readable format
    const amountStr = ethers.utils.formatUnits(amount, decimals);
    return amountStr;
  }

  // Get price information
  const getAmountOut = async function (amountIn = "5") {
    const [decimals, amountInDec] = await convertBlockchain(amountIn);
    const amountsOut = await contractRouter.getAmountsOut(amountInDec, [
      addressFrom,
      addressTo,
    ]);
    // console.log("amountOUT", amountsOut[1].toString());
    return amountsOut[1].toString();
  };

  // DO validation values for each main variable
  it("Test connection (Provider, Factory, Router, Token)", async function () {
    assert(provider._isProvider);
    expect(contractFactory.address).to.equal(
      "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f"
    );
    expect(contractRouter.address).to.equal(
      "0xf164fC0Ec4E93095b804a4795bBe1e041497b92a"
    );
    expect(contractToken0.address).to.equal(
      "0xdac17f958d2ee523a2206206994597c13d831ec7"
    );
  });

  //   Check if we got the amountOut value
  it("Check if we got the amountOut value", async function () {
    const checkAmountOut = await getAmountOut();
    console.log("amountOUT", checkAmountOut);
    assert(checkAmountOut);
  });

  // Send transactions to the fork mainnet, without using the test network. This is why we use hardhat to develop smart contracts on-premises (Local machine).
  //   https://hardhat.org/hardhat-network/docs/guides/forking-other-networks
  it("Send a TRX, i.e swap a tokens", async function () {
    // Get signer wallet address with fork mainnet
    const [ownerSigner, vinoSigner] = await ethers.getSigners();
    /*
    Output for fake accounts and private keys after forking the ETH mainnet network with Quicknode:
    Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
    Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

    Account #1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 (10000 ETH)
    Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
    */

    // const [decimals, amountINDec] = await convertBlockchain();
    amountIN = "1";

    amountOUT = await getAmountOut(amountIN);

    // Create all previous contract addresses with fork mainnet
    const forkMainnetPancakeRouter = new ethers.Contract(
      addressRouter,
      routerABI,
      ownerSigner
    );
    const myAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

    // Build swap transaction
    // Parameters: amountIn (uint256), amountOutMin (uint256), path (address[]), to (address), deadline (uint256)
    const trxSwap = await forkMainnetPancakeRouter.swapExactTokensForTokens(
      amountIN,
      amountOUT,
      [addressFrom, addressTo],
      myAddress,
      Date.now() + 60000, // timestamp + 1 min delay
      {
        gasLimit: 50000, // Set a gas limit, how much gas we are prepared to use. Unused gas after execution will be returned to us
        gasPrice: ethers.utils.parseUnits("10", "gwei"), // Setting the gas price we are prepared to pay for the gas. This means that the higher the gasPrice we set, the higher the priority of our code to be executed.
        /*
        Maximum gas fee we will pay 50000*10gwei = 500000gwei
        https://coinbrain.com/converter/eth-0x29e683aeafd03bb6c02055c3ca8b6edb4bb9bae5/usd
        */
      }
    );

    assert(trxSwap.hash);
    // console.log(trxSwap);

    // Connect to fork mainnet with waffle
    const forkMainnetProvider = waffle.provider;

    // Submit a swap transaction where we will get a receipt for this transaction. Note that this is in the local env so we can't check it from the blockchain with etherscan.
    const trxReceipt = await forkMainnetProvider.getTransactionReceipt(
      trxSwap.hash
    );

    console.log("\nTRX Swap:", trxSwap);
    console.log("\n\nTRX Receipt:", trxReceipt);
  });
});
