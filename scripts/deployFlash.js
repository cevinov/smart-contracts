const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  // console.log(deployer);
  console.log("Account for deploying the contract:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Get smart contract for flashloans
  const Token = await ethers.getContractFactory("FlashSwap");
  const token = await Token.deploy();
  await token.deployed();

  console.log("Token address:", token.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
