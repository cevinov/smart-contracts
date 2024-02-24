// Chai is used for making assertions about values
const { expect } = require("chai");

// Imports the ethers library, which is used for interacting with Ethereum contracts
const { ethers } = require("hardhat");

// This defines a test suite with the title "Hello".
describe("Hello", function () {
  // This defines an individual test. it provides a title for the test. The async function contains the actual test code.
  it("This will call the smart contract Hello.sol", async function () {
    // Get the smart contract file and deploy it
    const Hello = await ethers.getContractFactory("Hello");
    const hello = await Hello.deploy();
    await hello.deployed();

    // Testing the functionality inside the smart contract, and checking if the returned value is the same as what we expected
    expect(await hello.greeting()).to.equal("Hello, my name is cevino");
    const setName = await hello.setName("CCVN");

    // Wait for the transaction to be mined
    await setName.wait();
    expect(await hello.greeting()).to.equal("Hello, my name is CCVN");
  });
});

/*
Output:
  Hello
Hello, my name is 'cevino'
New name = 'CCVN'
Hello, my name is 'CCVN'
    ✔ This will call the smart contract Hello.sol (2213ms)


  1 passing (2s)
*/
