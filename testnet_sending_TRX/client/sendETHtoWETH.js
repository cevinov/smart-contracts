const { ethers } = require("ethers");

// Set up a provider to connect to the testnet network (sepolia)
const rpcUrl = "https://goerli.infura.io/v3/5ab76f78c3f34a36b1c7e23bede5d927";
const providerTestnet = new ethers.providers.JsonRpcProvider(rpcUrl);

const amountShipped = "0.003"; // Total amount of ETH to be sent

// Create signer with privateKey from wallet to sign transaction on blockchain
const walletAddress = "0x28D40a1c05Ace3AE7Ce42e289a14cb8268ACe2e4";
const privateKey =
  "0x52d5291354b9bdb23866e3c5c619ab9bd19b50c15272496296d4252a3eb63761";
const walletSigner = new ethers.Wallet(privateKey, providerTestnet);
// console.log(walletSigner);
/*

*/
const exchangeETH = async () => {
  const gasPrice = await providerTestnet.getGasPrice(); // Check recommendation for gasPrice (Priority)
  const nonce = 2; // an incrementing value indexed per owner,token,and spender for each signature (So change it every time we send a transaction)
  // https://docs.uniswap.org/contracts/permit2/reference/allowance-transfer

  // Build transactions that are represented as objects
  const trxBuild = {
    from: walletAddress,
    to: "0x0B1ba0af832d7C05fD64161E0Db78E85978E8082", // Import this token address into MetaMask wallet (sepolia)
    value: ethers.utils.parseEther(amountShipped),
    nonce: nonce,
    gasLimit: 100000, // Set a gas limit, how much gas we are prepared to use. Unused gas after execution will be returned to us
    gasPrice: gasPrice, // Setting the gas price we are prepared to pay for the gas. This means that the higher the gasPrice we set, the higher the priority of our code to be executed.
  };
  //   console.log(trxBuild);

  // Send transactions that have been created from walletSigner
  const trxSend = await walletSigner.sendTransaction(trxBuild);
  console.log(trxSend); // Check hash value, and check in MetaMask if there is a change in the amount for WETH
  /* Hash value: 
  0x2623416348f3f1fc70fdadd6cd2ae2f683063a71369e983aaeea1e525ed63472
  */
};

exchangeETH();
