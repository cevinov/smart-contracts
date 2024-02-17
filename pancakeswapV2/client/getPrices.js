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
const contractFactory = new ethers.Contract(
  addressFactory,
  factoryABI,
  provider
);
// console.log(contractFactory);

// Connect to router address
const contractRouter = new ethers.Contract(addressRouter, routerABI, provider);
// console.log(contractRouter);
/*


*/
// Call function inside the smart contract
const getPrices = async function (amountInReadable) {
  const contractToken = new ethers.Contract(
    addressFrom,
    erc20Decimal,
    provider
  );

  // Get decimal value from the address
  const decimals = await contractToken.decimals();

  // Convert the variables that have been passed into the blockchain format with decimal value
  const amountInSTR = ethers.utils
    .parseUnits(amountInReadable, decimals)
    .toString();

  // console.log(decimals);
  return amountInSTR;
};

async function awaitVal() {
  const value = await getPrices("5");
  console.log(
    "Format in Blockchain for 5 ETH: ",
    value,
    typeof value,
    value.length
  );
}

awaitVal();
