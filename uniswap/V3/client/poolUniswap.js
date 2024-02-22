// https://techgeorgii.com/uniswap-v3-sdk-swap-tutorial-part-2-get-pool-information/

const { ethers } = require("ethers");
const UNISWAP_FACTORY_ADDRESS = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
const {
  abi: ABIFactoryV3,
} = require("@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Factory.sol/IUniswapV3Factory.json");
const rpcUrl =
  "https://eth-mainnet.g.alchemy.com/v2/Jr8LwLYFtWORdP0gVAgOMiUjXvt28Z8S";
const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

const factoryContract = new ethers.Contract(
  UNISWAP_FACTORY_ADDRESS,
  ABIFactoryV3,
  provider
);

// Loading pool smart contract address
// Pool is just a smart contract, responsible for swapping one token for another, for example, MAKER-USDC pool
async function getPoolAddress() {
  const tokenBase = "0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2"; // MAKER
  const tokenQuote = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"; // USDC
  const result = await factoryContract.getPool(tokenBase, tokenQuote, 3000); // commission - 3%
  console.log("Pool Address:", result);

  // Output: Pool Address: 0x0F9d9d1cCE530C91f075455EfEf2D9386375df3d
}

getPoolAddress();
