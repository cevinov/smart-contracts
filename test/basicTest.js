const { ethers } = require("hardhat");

// `expect` and `assert` allow writing assertions to validate values, compare results and check for errors in tests.
const { expect, assert, Assertion } = require("chai");

describe("Test Variable Values", function () {
  const name = "Cevino";
  const email = "cevino@mail.com";
  const pin = 12345;

  // There are 2 groups of tests for the above variables
  it("Checking Values", function () {
    describe("Do Validation", function () {
      it("Check Name", function () {
        expect(name).to.equal("Cevino");
      });

      it("Check Email", function () {
        expect(email).to.equal("cevino@mail.com");
      });
    });
    /*

    */
    describe("Check PIN Requirements", function () {
      it("User has PIN", function () {
        assert(pin); // Check if this variable has a value
      });
      it("PIN has 5 digits", function () {
        // Check if the PIN has 5 digits. This is a string, so we need to convert it to a number.
        // This will return `true` if the PIN has 5 digits, and `false` if it does not.
        assert(pin.toString().length == 5);
      });
    });
  });
});

// Run npx hardhat test