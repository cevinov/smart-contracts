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

  // Address of the top holder of the DAI token, which we use as a funding source when doing flashloan
  const DAIWhale = "0xF977814e90dA44bFA03b6295A0616a897441aceC";

  // Dummy token only to start a flashloan
  const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";

  // This is a list of tokens as a triangular arbitration group
  const DAI = "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3";
  const CAKE = "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82";
  const WBNB = "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c";

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
    const loanAmount = "10"; // This value will be used when swapping to another token from DAI.
    loanAmountDec = ethers.utils.parseUnits(loanAmount, decimals);

    // Configure the funding amount to buy tokens in this case 100 DAI (Make sure we can handle the loan fees)
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
      // console.log("Fund:", flashSwapBalance);

      // Check if the contract balance is equal to the initialized fund amount
      expect(Number(flashSwapBalance)).equal(Number(initFund));

      const contractBalanceWBNBDec = await flashSwap.getTokenBalance(WBNB);
      const contractBalanceWBNB = ethers.utils.formatUnits(
        contractBalanceWBNBDec,
        decimals
      ); // Convert to readable format
    });
  });

  it("Execute the arbitrage", async function () {
    // Create an arbitration contract to make a flashloan by doing swap
    trxArb = await flashSwap.startLoan(DAI, USDC, loanAmountDec); // Request a loan
    // console.log(trxArb);
    assert("TRX:", trxArb);

    // Get the token balance we borrowed after doing flashloan
    const contractBalanceDAIDec = await flashSwap.getTokenBalance(DAI);
    const contractBalanceDAI = Number(
      ethers.utils.formatUnits(contractBalanceDAIDec, decimals)
    );

    // Start Swapping
    console.log(`\n\nStart with ${initFund} DAI`);
    // Token balance decreases, as we pay loan fees (3%) + Swap 10 DAI to CAKE

    // 1. Check balance for CAKE token as target token swap (DAI to CAKE)
    const contractBalanceCAKEDec = await flashSwap.getTokenBalance(CAKE);
    const contractBalanceCAKE = ethers.utils.formatUnits(
      contractBalanceCAKEDec,
      decimals
    ); // Convert to readable format
    console.log("Balance of CAKE:", contractBalanceCAKE);

    // 2. Swap CAKE for WBNB
    // const contractBalanceWBNBDec = await flashSwap.getTokenBalance(WBNB);
    const contractBalanceWBNBDec = await flashSwap.getTokenBalance(WBNB);
    const contractBalanceWBNB = ethers.utils.formatUnits(
      contractBalanceWBNBDec,
      decimals
    ); // Convert to readable format
    console.log("Balance of WBNB:", contractBalanceWBNB);

    // 3. Swap WBNB for DAI
    const finalBalanceDAIDec = await flashSwap.getTokenBalance(DAI);
    const finalBalanceDAI = Number(
      ethers.utils.formatUnits(finalBalanceDAIDec, decimals)
    );
    console.log("Balance of DAI after swap:", finalBalanceDAI);
  });
});
