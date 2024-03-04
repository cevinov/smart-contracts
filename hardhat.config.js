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
      { version: "0.8.24" },
      { version: "0.5.0" },
      { version: "0.7.0" },
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
        url: "https://ultra-dry-sheet.bsc.quiknode.pro/da7eedbc68bff1b7cf710e61ca4e145bf98c69fb", // JSON-RPC Endpoint for BSC (pancakeSwap)
      },
    },
    testnet: {
      url: "https://bsc-testnet-dataseed.bnbchain.org", // https://docs.bnbchain.org/docs/rpc/
      chainId: 97,
      accounts: [PRIVATE_KEY],
    },
    mainnet: {
      url: "https://bsc-dataseed.bnbchain.org",
      chainId: 56,
      accounts: [PRIVATE_KEY],
    },
  },
};
