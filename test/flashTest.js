const { assert, expect } = require("chai");
isTrue = true;
describe("Test Basic", function () {
  it("Return TRUE", async function () {
    expect(isTrue).to.be.equal(true);
  });

  it("Check", async function () {
    it("Valid", async function () {
      assert(isTrue);
    });
  });
});
