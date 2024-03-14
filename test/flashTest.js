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

describe("Test FlashSwap Contract (SushiSwap)", function () {
  let flashSwap, loanAmountDec, fundAmount, initFund, trxArb;

  const decimals = 18;

  // Address of the top holder of the MKR token, which we use as a funding source when doing flashloan
  const MKRWhale = "0x0a3f6849f78076aefaDf113F5BED87720274dDC0";

  // Dummy token only to start a flashloan
  const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
  const MKR = "0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2";

  // This is a list of tokens as a triangular arbitration group
  const UNI = "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984";
  const BNB = "0xB8c77482e45F1F44dE1745F52C74426C631bDD52";

  // Starting capital with MKR token
  const baseToken = MKR;

  // Connect to base token
  const tokenBase = new ethers.Contract(baseToken, abi, provider);

  // Use the beforeEach function of the chai library to run the code before the test (it)
  beforeEach(async function () {
    // Get signer wallet address with fork mainnet
    // https://hardhat.org/hardhat-runner/docs/other-guides/waffle-testing
    const [owner] = await ethers.getSigners();

    // Check if the whale account has a balance
    const balanceWhale = await tokenBase.balanceOf(MKRWhale);
    console.log(
      "\n\nBalance Whale:",
      ethers.utils.formatUnits(balanceWhale, decimals)
    );

    // Get and deploy smart contract
    const FlashSwap = await ethers.getContractFactory("FlashSwapCross");
    flashSwap = await FlashSwap.deploy(); // deploy() will create the transaction (contract address)
    await flashSwap.deployed(); // deployed() will wait until it has been

    // Configuring the loan amount
    const loanAmount = "1"; // This value will be used when swapping to another token, for example MKR to UNI
    loanAmountDec = ethers.utils.parseUnits(loanAmount, decimals);

    // Configure the funding amount to buy tokens in this case 100 MKR (Make sure we can handle the loan fees)
    initFund = "100"; // 100 MKR
    fundAmount = ethers.utils.parseUnits(initFund, decimals);

    // Funding the contract using the whale account - for testing only
    // Arg: contract, sender, recepient, amount
    await impersonateFundErc20(
      tokenBase,
      MKRWhale,
      flashSwap.address,
      initFund
    );
  });

  // Test scenario contract has balance
  describe("Arbitrage Execution", async function () {
    it("Check if contract is funded", async function () {
      // Get contract balance
      const flashSwapBalanceDec = await flashSwap.getTokenBalance(baseToken);

      // Convert to readable format
      const flashSwapBalance = ethers.utils.formatUnits(
        flashSwapBalanceDec,
        decimals
      );
      console.log("Fund:", flashSwapBalance);

      // Check if the contract balance is equal to the initialized fund amount
      expect(Number(flashSwapBalance)).equal(Number(initFund));

      const contractBalanceMKRDec = await flashSwap.getTokenBalance(MKR);
      const contractBalanceMKR = ethers.utils.formatUnits(
        contractBalanceMKRDec,
        decimals
      ); // Convert to readable format
      console.log("MKR:", contractBalanceMKR);
    });
  });

  it("Execute the arbitrage", async function () {
    // Create an arbitration contract to make a flashloan by doing swap
    trxArb = await flashSwap.startLoan(MKR, USDC, loanAmountDec); // Request a loan for MKR token
    // console.log("TRX", trxArb);
    assert("TRX:", trxArb);

    // Get the token balance we borrowed after doing flashloan
    const contractBalanceMKRDec = await flashSwap.getTokenBalance(MKR);
    const contractBalanceMKR = Number(
      ethers.utils.formatUnits(contractBalanceMKRDec, decimals)
    );
    console.log("MKR:", contractBalanceMKR);

    // Start Swapping
    console.log(`\n\nStart with ${initFund} MKR`);
    // Token balance decreases, as we pay loan fees (3%) + Swap 10 MKR to UNI

    // 1. Check balance for UNI token as target token swap (MKR to UNI)
    const contractBalanceUNIDec = await flashSwap.getTokenBalance(UNI);
    const contractBalanceUNI = ethers.utils.formatUnits(
      contractBalanceUNIDec,
      decimals
    ); // Convert to readable format
    console.log("Balance of UNI:", contractBalanceUNI);

    // 2. Check balance after swapping UNI for BNB
    const contractBalanceBNBDec = await flashSwap.getTokenBalance(BNB);
    const contractBalanceBNB = ethers.utils.formatUnits(
      contractBalanceBNBDec,
      decimals
    ); // Convert to readable format
    console.log("Balance of BNB:", contractBalanceBNB);

    // 3. Check balance after swapping BNB for MKR
    const finalBalanceMKRDec = await flashSwap.getTokenBalance(MKR);
    const finalBalanceMKR = Number(
      ethers.utils.formatUnits(finalBalanceMKRDec, decimals)
    );
    console.log("Balance of MKR after swap:", finalBalanceMKR);
  });
});
