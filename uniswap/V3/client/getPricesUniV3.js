"use strict";
/*
The Uniswap Protocol is a decentralized marketplace to swap cryptocurrencies on the Ethereum blockchain. This means we will use etherscan to check the transactions of an address.
https://blog.uniswap.org/what-is-uniswap

https://docs.uniswap.org/sdk/v3/guides/swaps/routing
*/
const { ethers } = require("ethers");
const {
  abi: quoterABI,
} = require("@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json");
const { Token } = require("@uniswap/sdk-core");

const rpcUrl = "uniswap/V2/client/calcSwapToken.js";
const quoterAddressV3 = "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6";
const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
// console.log(provider);

async function getPrice() {
  const quoterContract = new ethers.Contract(
    quoterAddressV3,
    quoterABI,
    provider
  );
  console.log(quoterContract);
}

getPrice();
