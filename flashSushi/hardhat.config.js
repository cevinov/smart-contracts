require("@nomiclabs/hardhat-waffle");
const { PRIVATE_KEY } = require("./utils/private_key");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 * We can import multiple versions of the solidity compiler, simply by declaring it as an object
 */
module.exports = {
  solidity: {
    compilers: [
      { version: "0.5.0" },
      { version: "0.7.0" },
      { version: "0.6.2" },
    ],
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      forking: {
        url: "https://mainnet.infura.io/v3/5ab76f78c3f34a36b1c7e23bede5d927", // JSON-RPC Endpoint for ETH mainnet (SushiSwap - Infura)
      },
    },
    testnet: {
      url: "https://sepolia.infura.io/v3/5ab76f78c3f34a36b1c7e23bede5d927",
      accounts: [PRIVATE_KEY], // Private key for test account on metamask for Ethereum network
    },
    mainnet: {
      url: "https://mainnet.infura.io/v3/5ab76f78c3f34a36b1c7e23bede5d927",
      accounts: [PRIVATE_KEY],
    },
  },
};
