// Select the required functions from the smart contract code
const erc20Decimal = ["function decimals() external pure returns (uint8)"];

// This function resides in the address factory source code, to return a list of smart contracts that interact with token0 (addressFrom) and token1 (addressTo).
// https://bscscan.com/address/0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73#code
const factoryABI = [
  "function getPair(address tokenA, address tokenB) external view returns (address pair)",
];

// Function to get token price details, with ABI router
// https://bscscan.com/address/0x10ed43c718714eb63d5aa57b78b54704e256024e#code
const routerABI = [
  "function getAmountsOut(uint amountOut, address[] calldata path) external view returns (uint[] memory amounts)",
  "function swapExactTokensForTokens(uint amountIn,uint amountOutMin,address[] calldata path,address to,uint deadline) external returns (uint[] memory amounts)",
];

module.exports = {
  erc20Decimal,
  factoryABI,
  routerABI,
};
// console.log(erc20Decimal);

/* NB: 
1. The number of decimal places used to represent the token. For example, if the token has 18 decimal places, one token is equal to 1000000000000000000 (10^18) units.
2. Requires an ABI (Application Binary Interface) to interact with smart contracts in the blockchain.
3. When interacting with smart contracts, make sure we understand the functionality we are importing with the ABI.
4. This is the main function when we do flashloans, swapTokensForExactTokens where it will help do the swap between tokens
*/
