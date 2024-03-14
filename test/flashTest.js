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
  let flashSwap, loanAmountDec, fundAmount, initFund, trxArb, gassUsedIDR;

  const decimals = 18;

  // Address of the top holder of the ETH token, which we use as a funding source when doing flashloan
  const ETHWhale = "0xC882b111A75C0c657fC507C04FbFcD2cC984F071";

  // Dummy token only to start a flashloan
  const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
  const ETH = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8";

  // This is a list of tokens as a triangular arbitration group
  const CAKE = "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82";
  const WBNB = "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c";

  // Starting capital with ETH token
  const baseToken = ETH;

  // Connect to base token
  const tokenBase = new ethers.Contract(baseToken, abi, provider);

  // Use the beforeEach function of the chai library to run the code before the test (it)
  beforeEach(async function () {
    // Get signer wallet address with fork mainnet
    // https://hardhat.org/hardhat-runner/docs/other-guides/waffle-testing
    const [owner] = await ethers.getSigners();

    // Check if the whale account has a balance
    const balanceWhale = await tokenBase.balanceOf(ETHWhale);
    console.log(
      "\n\nBalance Whale:",
      ethers.utils.formatUnits(balanceWhale, decimals)
    );

    // Get and deploy smart contract
    const FlashSwap = await ethers.getContractFactory("FlashSwapCross");
    flashSwap = await FlashSwap.deploy(); // deploy() will create the transaction (contract address)
    await flashSwap.deployed(); // deployed() will wait until it has been

    // Configuring the loan amount
    const loanAmount = "1"; // This value will be used when swapping to another token, for example ETH to CAKE
    loanAmountDec = ethers.utils.parseUnits(loanAmount, decimals);

    // Configure the funding amount to buy tokens in this case 100 ETH (Make sure we can handle the loan fees)
    initFund = "100"; // 100 ETH
    fundAmount = ethers.utils.parseUnits(initFund, decimals);

    // Funding the contract using the whale account - for testing only
    // Arg: contract, sender, recepient, amount
    await impersonateFundErc20(
      tokenBase,
      ETHWhale,
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

      const contractBalanceETHDec = await flashSwap.getTokenBalance(ETH);
      const contractBalanceETH = ethers.utils.formatUnits(
        contractBalanceETHDec,
        decimals
      ); // Convert to readable format
      console.log("ETH:", contractBalanceETH);
    });
  });

  it("Execute the arbitrage", async function () {
    // Create an arbitration contract to make a flashloan by doing swap
    trxArb = await flashSwap.startLoan(ETH, USDC, loanAmountDec); // Request a loan for ETH token
    // console.log("TRX", trxArb);
    assert("TRX:", trxArb);

    // Get the token balance we borrowed after doing flashloan
    const contractBalanceETHDec = await flashSwap.getTokenBalance(ETH);
    const contractBalanceETH = Number(
      ethers.utils.formatUnits(contractBalanceETHDec, decimals)
    );
    console.log("ETH:", contractBalanceETH);

    // Start Swapping
    console.log(`\n\nStart with ${initFund} ETH`);
    // Token balance decreases, as we pay loan fees (3%) + Swap 10 ETH to CAKE

    // 1. Check balance for CAKE token as target token swap (ETH to CAKE)
    const contractBalanceCAKEDec = await flashSwap.getTokenBalance(CAKE);
    const contractBalanceCAKE = ethers.utils.formatUnits(
      contractBalanceCAKEDec,
      decimals
    ); // Convert to readable format
    console.log("Balance of CAKE:", contractBalanceCAKE);

    // 2. Check balance after swapping CAKE for WBNB
    const contractBalanceWBNBDec = await flashSwap.getTokenBalance(WBNB);
    const contractBalanceWBNB = ethers.utils.formatUnits(
      contractBalanceWBNBDec,
      decimals
    ); // Convert to readable format
    console.log("Balance of WBNB:", contractBalanceWBNB);

    // 3. Check balance after swapping WBNB for ETH
    const finalBalanceETHDec = await flashSwap.getTokenBalance(ETH);
    const finalBalanceETH = Number(
      ethers.utils.formatUnits(finalBalanceETHDec, decimals)
    );
    console.log("Balance of ETH after swap:", finalBalanceETH);
  });
});
