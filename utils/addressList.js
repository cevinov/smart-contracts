// https://docs.pancakeswap.finance/developers/smart-contracts/pancakeswap-exchange/v2-contracts/
// Pancakeswap is a multichain decentralized exchange that has become the go-to platform for trading cryptocurrencies.
// It is built on the BNB Smart Chain (BSC), Ethereum and Aptos Network.

// Set up a pancake address factory, a smart contract that allows us to find the right pair contract for a pair of tokens for a swap (getPair)
const addressFactory = "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73"; // BSC

// Set the address router to get the token price detail (ex: getAmountIn, getAmountOut)
const addressRouter = "0x10ED43C718714eb63d5aA57B78B54704E256024E"; // BSC

// Check the address of the token running on the BCS network with BSC scan
// https://bscscan.com

// Set a constant address for the token we want to interact with. PancakeSwap is on the Binance Smart Chain network
// https://docs.pancakeswap.finance/developers/smart-contracts/pancakeswap-exchange/v2-contracts/factory-v2
const addressFrom = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8"; // ETH
const addressTo = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"; // WBNB

// Exporting scripts to make variables accessible to other modules
// https://wiki.vino0333.my.id/books/javascript/page/commonjs-amd-module
module.exports = {
  addressFactory,
  addressRouter,
  addressFrom,
  addressTo,
};
