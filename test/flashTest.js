const { assert, expect } = require("chai");
const { ethers } = require("hardhat");
describe("Test Flashloans Smart Contract", function () {
  it("Check Name", async function () {
    // Get and deploy flashloans smart contract
    const FlashSwap = await ethers.getContractFactory("FlashSwap");
    const flashSwap = await FlashSwap.deploy();
    await flashSwap.deployed();
    await flashSwap.setName("vino");

    expect(await flashSwap.getName()).to.be.equal("vino");
  });
});
