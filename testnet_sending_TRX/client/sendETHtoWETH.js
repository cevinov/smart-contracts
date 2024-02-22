const { ethers } = require("ethers");

// Set up a provider to connect to the testnet network (sepolia)
const rpcUrl =
  "https://eth-sepolia.g.alchemy.com/v2/wQ6iV99uGPGeKk7H7nKlZLbNLcz3SCu6";
const providerTestnet = new ethers.providers.JsonRpcProvider(rpcUrl);

const amountShipped = "0.1"; // Total amount of ETH to be sent

// Create signer with privateKey from wallet to sign transaction on blockchain
const walletAddress = "0x28D40a1c05Ace3AE7Ce42e289a14cb8268ACe2e4";
const privateKey =
  "52d5291354b9bdb23866e3c5c619ab9bd19b50c15272496296d4252a3eb63761";
const walletSigner = new ethers.Wallet(privateKey, providerTestnet);
// console.log(walletSigner);

const exchangeETH = async () => {
  const gasPrice = await providerTestnet.getGasPrice(); // Check recommendation for gasPrice (Priority)
  const nonce = 0; // Default value as this is the first TRX we send to the network

  // Build transactions that are represented as objects
  const trxBuild = {
    from: walletAddress,
    to: "0xb16F35c0Ae2912430DAc15764477E179D9B9EbEa",
    value: ethers.utils.parseEther(amountShipped),
    nonce: nonce,
    gasLimit: 100000, // Set a gas limit, how much gas we are prepared to use. Unused gas after execution will be returned to us
    gasPrice: gasPrice, // Setting the gas price we are prepared to pay for the gas. This means that the higher the gasPrice we set, the higher the priority of our code to be executed.
  };

  console.log(trxBuild);
};

exchangeETH();
