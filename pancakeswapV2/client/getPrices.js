const { ethers } = require("hardhat"); // Need this to remove ReferenceError: ethers is not defined

const {
  addressFactory,
  addressRouter,
  addressFrom,
  addressTo,
} = require("./addressList");

const {
  erc20Decimal,
  factoryABI,
  pairABI,
  allPairs,
  routerABI,
} = require("./ABIList");

// console.log(addressFrom, addressTo, allPairs);
/*


*/
// What is RPC endpoint?: https://101blockchains.com/rpc-node/
// RPC endpoint used to send commands to blockchain nodes and receive responses
// https://docs.bnbchain.org/docs/rpc/
url = "https://bsc-dataseed.bnbchain.org";

// The next thing is connected to the blockchain with the provider (BSC RPC endpoint) using ethers library
const provider = new ethers.providers.JsonRpcProvider(url);
// console.log(provider);

// Connect to factory address using provider
const contractFactory = new ethers.Contract(addressFactory, factoryABI);
// console.log(contractFactory);

// Connect to router address
const contractRouter = new ethers.Contract(addressRouter, routerABI);
// console.log(contractRouter);
/*


*/
