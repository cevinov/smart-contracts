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
/*

*/
const exchangeETH = async () => {
  const gasPrice = await providerTestnet.getGasPrice(); // Check recommendation for gasPrice (Priority)
  const nonce = 5; // an incrementing value indexed per owner,token,and spender for each signature (So change it every time we send a transaction)
  // https://docs.uniswap.org/contracts/permit2/reference/allowance-transfer

  // Build transactions that are represented as objects
  const trxBuild = {
    from: walletAddress,
    to: "0xb16F35c0Ae2912430DAc15764477E179D9B9EbEa", // Import this token address into MetaMask wallet (sepolia)
    value: ethers.utils.parseEther(amountShipped),
    nonce: nonce,
    gasLimit: 100000, // Set a gas limit, how much gas we are prepared to use. Unused gas after execution will be returned to us
    gasPrice: gasPrice, // Setting the gas price we are prepared to pay for the gas. This means that the higher the gasPrice we set, the higher the priority of our code to be executed.
  };
  //   console.log(trxBuild);

  // Send transactions that have been created from walletSigner
  const trxSend = await walletSigner.sendTransaction(trxBuild);
  console.log(trxSend);
  /* Hash value: 
  0xba9d9f9f62299d9c374d16a6d95692cb0600aa71fbcaa99f0413c689a6b91d83
  0x225c5500dd24c1fb980b161e6e178b712a16267e89aae57d68829e4ec3b87dd2
  0x6c4cf9938ac04f878795fd248d49fdc50dbec8ab6d33172dc7fe2bd52598eea8
  */
};

exchangeETH();
