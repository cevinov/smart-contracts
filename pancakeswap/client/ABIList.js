// Copy of ABI contract from factory address in JSON format
// const ABIToken = [
//   {
//     status: "1",
//     message: "OK-Missing/Invalid API Key, rate limit of 1/5sec applied",
//     result: [
//       {
//         inputs: [
//           { internalType: "address", name: "_feeToSetter", type: "address" },
//         ],
//         payable: false,
//         stateMutability: "nonpayable",
//         type: "constructor",
//       },
//       {
//         anonymous: false,
//         inputs: [
//           {
//             indexed: true,
//             internalType: "address",
//             name: "token0",
//             type: "address",
//           },
//           {
//             indexed: true,
//             internalType: "address",
//             name: "token1",
//             type: "address",
//           },
//           {
//             indexed: false,
//             internalType: "address",
//             name: "pair",
//             type: "address",
//           },
//           {
//             indexed: false,
//             internalType: "uint256",
//             name: "",
//             type: "uint256",
//           },
//         ],
//         name: "PairCreated",
//         type: "event",
//       },
//       {
//         constant: true,
//         inputs: [],
//         name: "INIT_CODE_PAIR_HASH",
//         outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
//         payable: false,
//         stateMutability: "view",
//         type: "function",
//       },
//       {
//         constant: true,
//         inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
//         name: "allPairs",
//         outputs: [{ internalType: "address", name: "", type: "address" }],
//         payable: false,
//         stateMutability: "view",
//         type: "function",
//       },
//       {
//         constant: true,
//         inputs: [],
//         name: "allPairsLength",
//         outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
//         payable: false,
//         stateMutability: "view",
//         type: "function",
//       },
//       {
//         constant: false,
//         inputs: [
//           { internalType: "address", name: "tokenA", type: "address" },
//           { internalType: "address", name: "tokenB", type: "address" },
//         ],
//         name: "createPair",
//         outputs: [{ internalType: "address", name: "pair", type: "address" }],
//         payable: false,
//         stateMutability: "nonpayable",
//         type: "function",
//       },
//       {
//         constant: true,
//         inputs: [],
//         name: "feeTo",
//         outputs: [{ internalType: "address", name: "", type: "address" }],
//         payable: false,
//         stateMutability: "view",
//         type: "function",
//       },
//       {
//         constant: true,
//         inputs: [],
//         name: "feeToSetter",
//         outputs: [{ internalType: "address", name: "", type: "address" }],
//         payable: false,
//         stateMutability: "view",
//         type: "function",
//       },
//       {
//         constant: true,
//         inputs: [
//           { internalType: "address", name: "", type: "address" },
//           { internalType: "address", name: "", type: "address" },
//         ],
//         name: "getPair",
//         outputs: [{ internalType: "address", name: "", type: "address" }],
//         payable: false,
//         stateMutability: "view",
//         type: "function",
//       },
//       {
//         constant: false,
//         inputs: [{ internalType: "address", name: "_feeTo", type: "address" }],
//         name: "setFeeTo",
//         outputs: [],
//         payable: false,
//         stateMutability: "nonpayable",
//         type: "function",
//       },
//       {
//         constant: false,
//         inputs: [
//           { internalType: "address", name: "_feeToSetter", type: "address" },
//         ],
//         name: "setFeeToSetter",
//         outputs: [],
//         payable: false,
//         stateMutability: "nonpayable",
//         type: "function",
//       },
//     ],
//   },
// ];
// console.log(ABIToken[0].status);

// Select the required functions from the smart contract code
const erc20Decimal = ["function decimals() external pure returns (uint8)"];

// This function resides in the address factory source code, to return a list of smart contracts that interact with token0 (addressFrom) and token1 (addressTo).
// https://bscscan.com/address/0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73#code
const factoryABI = [
  "function getPair(address tokenA, address tokenB) external view returns (address pair)",
];

// Return variables for Token0 and Token1 using getPair function from factory smart contract.
const pairABI = [
  "function token0() external view returns (address)",
  "function token1() external view returns (address)",
  "function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
];

// A return list of all smart contracts at the factory address, which can be used to interact with token0 (Base) and token1 (Quote)
// Where each contract will return the same quote coin which in this case is the WBNB token, but a different base coin (addressFrom)
const allPairs = [
  "function allPairs(uint) external view returns (address pair)",
];

// Function to get token price details, with ABI router
// https://bscscan.com/address/0x10ed43c718714eb63d5aa57b78b54704e256024e#code
const routerABI = [
  "function getAmountsIn(uint amountOut, address[] calldata path) external view returns (uint[] memory amounts)",
  "function getAmountsOut(uint amountOut, address[] calldata path) external view returns (uint[] memory amounts)",
  "function swapTokensForExactTokens(uint amountOut,uint amountInMax,address[] calldata path,address to,uint deadline) external returns (uint[] memory amounts)",
];

module.exports = {
  erc20Decimal,
  factoryABI,
  pairABI,
  allPairs,
  routerABI,
};
// console.log(erc20Decimal);

/* NB: 
1. The number of decimal places used to represent the token. For example, if the token has 18 decimal places, one token is equal to 1000000000000000000 (10^18) units.
2. Requires an ABI (Application Binary Interface) to interact with smart contracts in the blockchain.
3. When interacting with smart contracts, make sure we understand the functionality we are importing with the ABI.
4. This is the main function when we do flashloans, swapTokensForExactTokens where it will help do the swap between tokens
*/
