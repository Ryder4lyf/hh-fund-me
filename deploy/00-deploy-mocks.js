// Deploying a priceFaed to a localhost

// imports
const { network } = require("hardhat")
const {
    developmentChains,
    DECIMALS,
    INITIAL_ANSWER,
} = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments // pulling the deploy and log from the deployments variable
    const { deployer } = await getNamedAccounts() // pulls the deployer from the getNamedAccounts function
    const chainId = network.config.chainId

    if (developmentChains.includes(network.name)) {
        log("Local Network Detected! Deploying mocks...")
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_ANSWER], // must be aranged the way it is in the github constructor
        })
        log("Mocks Deployed!")
        log("------------------------------------------------") // shows this is the end of our mock script
    }
}

module.exports.tags = ["all", "mocks"]
