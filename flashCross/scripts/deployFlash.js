const { ethers } = require("hardhat");

/*
Account details of the fork mainnet:
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
*/

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
