// Importing tools for testing from the chai library
const { assert, expect } = require("chai");
const { ethers } = require("hardhat");

describe("Test Flashloans Smart Contract", function () {
  it("Check Name", async function () {
    // Get and deploy flashloans smart contract
    const FlashSwap = await ethers.getContractFactory("FlashSwap");
    const flashSwap = await FlashSwap.deploy();
    await flashSwap.deployed();
    await flashSwap.setName("vino");

    // Code block to test the functionality in the smart contract
    expect(await flashSwap.getName()).to.be.equal("vino");
  });
});
