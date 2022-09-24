// Unlike our normal deploy scipts which has
// imports
// main function
// calling of our main function
// We are not going to be using our function and main function here
// Whenever we call hardhat deploy, it is going to call a function that we specify in the script here

const { network } = require("hardhat")
const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

// module.exports = async (hre) => { // wrapping the async function of hre in module.exports
//     const { getNamedAccounts, deployments } = hre  // pulling the variables getNamedAccounts and deployments from hre
// }

// same as the above commented
module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments // pulling the deploy and log from the deployments variable
    const { deployer } = await getNamedAccounts() // pulls the deployer from the getNamedAccounts function
    const chainId = network.config.chainId

    // choosing the pricefeed address to use if the chainId is called
    // const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    let ethUsdPriceFeedAddress
    if (developmentChains.includes(network.name)) {
        // local development chain
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        // testnet or mainnet chain
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }

    // when going for a localhost or hardhat network, we want to use a mock
    // what happens when we want to change chains
    const args = [ethUsdPriceFeedAddress]
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args, // put price feed address here
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })
    // verifies contract if we deploy to a testnet/mainnet and not localhost
    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        //verify
        await verify(fundMe.address, args)
    }

    log("---------------------------------------")
}
module.exports.tags = ["all", "fundme"]
