const { ethers, network, getNamedAccounts } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")
const { assert } = require("chai")

// let variable = true
// let someVar = variable ? "yes" : "no"
// is literally the same with
// if (variable) {someVar = "yes"} else {someVae = "no"}

// if developmentChains.includes(network.name) i.e if our network is a developmentChain that is localhost then we skip the whole describe
// only run on testnets
developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async function () {
          // variables
          let fundMe
          let deployer
          const sendValue = ethers.utils.parseEther("0.9") // your wallet must have at least this amount, otherwise change the value
          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer
              fundMe = await ethers.getContract("FundMe", deployer)
          })

          it("allows people to fund and withdraw", async function () {
              await fundMe.fund({ value: sendValue })
              await fundMe.withdraw
              const endingBalance = await fundMe.provider.getBalance(
                  fundMe.address
              )
              assert.equal(endingBalance.toString(), "0")
          })
      })
