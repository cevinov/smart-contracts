/*
The Uniswap Protocol is a decentralized marketplace to swap cryptocurrencies on the Ethereum blockchain. This means we will use etherscan to check the transactions of an address.
https://blog.uniswap.org/what-is-uniswap

https://docs.uniswap.org/contracts/v2/overview
*/

// Set up a uniswap address factory, a smart contract that allows us to find the right pair contract for a pair of tokens for a swap (getPair)
// https://docs.uniswap.org/contracts/v2/reference/smart-contracts/factory
const addressFactory = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f"; // Ethereum Network

// Set the address router to get the token price detail (ex: getAmountIn, getAmountOut)
// https://etherscan.io/address/0xf164fc0ec4e93095b804a4795bbe1e041497b92a#code
const addressRouter = "0xf164fC0Ec4E93095b804a4795bBe1e041497b92a"; // Ethereum Network

// Check the address of the token running on the ETH network with etherscan
// https://etherscan.io/

// Set a constant address for the token we want to interact with. uniswap is on the Ethereum network
// https://v2.info.uniswap.org/tokens
const addressFrom = "0xdac17f958d2ee523a2206206994597c13d831ec7"; // USDT
const addressTo = "0x4206931337dc273a630d328da6441786bfad668f"; // TRX

// Exporting scripts to make variables accessible to other modules (ES6)
export { addressFactory, addressRouter, addressFrom, addressTo };
