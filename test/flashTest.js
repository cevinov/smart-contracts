// Importing tools for testing from the chai library
const { assert, expect } = require("chai");
const { ethers, waffle } = require("hardhat");

// Testing loan repayment by funding smart contracts. By impersonating another account that has enough of the tokens we want to borrow
// Check holders menu for this case from blockchain explorer
const { impersonateFundErc20 } = require("../utils/utilities");

// Import ABI from IERC20 contract
const {
  abi,
} = require("../artifacts/contracts/interfaces/IERC20.sol/IERC20.json");

// Connected to mainnet blockchain with waffle as provider
const provider = waffle.provider;

describe("Test FlashSwap Contract", function () {
  let flashSwap, loanAmountDec, fundAmount, initFund, trxArb, gassUsedIDR;

  const decimals = 18;
  const DAIWhale = "0xF977814e90dA44bFA03b6295A0616a897441aceC";
  const DAI = "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3";
  const WBNB = "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c";
  const XRP = "0x1d2f0da169ceb9fc7b3144628db156f3f6c60dbe";
  const ADA = "0x3ee2200efb3400fabb9aacf31297cbdd1d435d47";

  // Starting capital with DAI token
  const baseToken = DAI;

  // Connect to base token
  const tokenBase = new ethers.Contract(baseToken, abi, provider);

  // Use the beforeEach function of the chai library to run the code before the test (it)
  beforeEach(async function () {
    // Get signer wallet address with fork mainnet
    // https://hardhat.org/hardhat-runner/docs/other-guides/waffle-testing
    const [owner] = await ethers.getSigners();

    // Check if the whale account has a balance
    const balanceWhale = await tokenBase.balanceOf(DAIWhale);
    // console.log(balanceWhale);

    // Get and deploy smart contract
    const FlashSwap = await ethers.getContractFactory("FlashSwap");
    flashSwap = await FlashSwap.deploy(); // deploy() will create the transaction (contract address)
    await flashSwap.deployed(); // deployed() will wait until it has been

    // Configuring the loan amount
    const loanAmount = "10"; // 10 DAI
    loanAmountDec = ethers.utils.parseUnits(loanAmount, decimals);

    // Configure funding amount to payback the loan
    initFund = "100"; // 100 DAI
    fundAmount = ethers.utils.parseUnits(initFund, decimals);

    // Funding the contract using the whale account - for testing only
    // Arg: contract, sender, recepient, amount
    await impersonateFundErc20(
      tokenBase,
      DAIWhale,
      flashSwap.address,
      initFund
    );
  });

  // Create test scenario
  describe("Arbitrage Execution", async function () {
    it("Check if contract is funded", async function () {
      // Get contract balance
      const flashSwapBalanceDec = await flashSwap.getTokenBalance(baseToken);

      // Convert to readable format
      const flashSwapBalance = ethers.utils.formatUnits(
        flashSwapBalanceDec,
        decimals
      );

      // Check if the contract balance is equal to the initialized fund amount
      expect(Number(flashSwapBalance)).equal(Number(initFund));
    });
  });
});
