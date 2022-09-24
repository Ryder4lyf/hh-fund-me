// Pulling our deployment function from hardhat
const { assert, expect } = require("chai")
const { deployments, ethers, getNamedAccounts } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

// deploy our FundMe contract
// only run on developmentChains of localhost
!developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async function () {
          // naming variables
          let fundMe
          let deployer
          let mockV3Aggregator
          const sendValue = ethers.utils.parseEther("1") // same with 1000000000000000000 i.e 1 eth
          beforeEach(async function () {
              // deploying our FundMe contract
              // using Hardhat-deploy

              /** 
        // To get different account directly from our hardhat.config.js
        const accounts = await ethers.getSigners() // it returns whatever is in our accounts section of nnetwork in our hardhat.config.js
        // // To get different account directly from our localhost hardhat
        const accountZero = accounts(0) // using the zeroth account from our localhost here
        */
              deployer = (await getNamedAccounts()).deployer // To tell ethers the deployer account we want connected to FundMe
              await deployments.fixture(["all"]) // fixture allows us to run our deploy folder with as many tags as we want
              fundMe = await ethers.getContract("FundMe", deployer) // this gives us the most recent deployed FundMe contract deployed and connects our deployer to the fundMe account
              mockV3Aggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer
              )
          })

          // grouping our test around our constructor
          describe("constructor", async function () {
              // test
              it("Sets the aggregator addresses correctly", async function () {
                  const response = await fundMe.getPriceFeed()
                  assert.equal(response, mockV3Aggregator.address)
              })
          })
          // To test our fund function
          describe("fund", async function () {
              // test for the minimum fund amount in our contract
              it("Fails if you don't send enough USD", async function () {
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "Didn't send enough USD!"
                  )
              })
              it("Updates the amount funded data structure", async function () {
                  await fundMe.fund({ value: sendValue })
                  // checks the mapping for getAddressToAmountFunded
                  const response = await fundMe.getAddressToAmountFunded(
                      deployer
                  )
                  assert.equal(response.toString(), sendValue.toString())
              })
              // to test for adding getFunders address from our funder's array
              it("Adds funder to array of getFunders", async function () {
                  await fundMe.fund({ value: sendValue })
                  // calling the getFunders array
                  const funder = await fundMe.getFunders(0)
                  assert.equal(funder, deployer)
              })
          })
          // To test our withdraw function
          describe("withdraw", async function () {
              // To make sure that our contract is funded before running the withdraw test
              beforeEach(async function () {
                  await fundMe.fund({ value: sendValue })
              })

              // tests that the withdrawer's address is from a single funder
              it("Withdraw ETH from a single funder", async function () {
                  // Arrange

                  // Gets the starting balance of the fundMe contract
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  // Gets the balance of the deployer
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  // Act

                  const transactionResponse = await fundMe.withdraw()
                  const transactionReceipt = await transactionResponse.wait(1)
                  // gas count variables gotten from the javascript debugger after using breakpoint
                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  // To check that the entire fundMe balance has been added to the deployer balance
                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  // Assert

                  // To check to see if the number worked out during the act
                  assert.equal(endingFundMeBalance, 0) // checks to see if the endingFundMeBalance is 0
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString() // ensures the gas cost after withdrawing was also deducted from the deployer balance
                  ) // checks if the startingfundMeBalance and the startingDeployerBalance is now equal to the endingDeployerBalance
              })

              // tests that the cheaperWithdrawer's address is from a single funder
              it("cheaperWithdraw ETH from a single funder", async function () {
                  // Arrange

                  // Gets the starting balance of the fundMe contract
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  // Gets the balance of the deployer
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  // Act

                  const transactionResponse = await fundMe.cheaperWithdraw()
                  const transactionReceipt = await transactionResponse.wait(1)
                  // gas count variables gotten from the javascript debugger after using breakpoint
                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  // To check that the entire fundMe balance has been added to the deployer balance
                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  // Assert

                  // To check to see if the number worked out during the act
                  assert.equal(endingFundMeBalance, 0) // checks to see if the endingFundMeBalance is 0
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString() // ensures the gas cost after withdrawing was also deducted from the deployer balance
                  ) // checks if the startingfundMeBalance and the startingDeployerBalance is now equal to the endingDeployerBalance
              })

              // tests withdraw eth from multiple getFunders
              it("allows us to withdraw with multiple getFunders", async function () {
                  // Arrange

                  // to create a group of different accounts for this
                  const accounts = await ethers.getSigners()
                  // looping through the accounts and making each of these accounts call the fund function
                  // Using let i = 1 because we want the first index of the account to be 1, because the 0 index is the already the address of the deployer
                  // using 6 as the max no. of getFunders here
                  for (let i = 1; i < 6; i++) {
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i]
                      )
                      await fundMeConnectedContract.fund({ value: sendValue })
                  }
                  // Gets the starting balance of the fundMe contract
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  // Gets the balance of the deployer
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  // Act
                  const transactionResponse = await fundMe.withdraw()
                  const transactionReceipt = await transactionResponse.wait(1)
                  // gas count variables gotten from the javascript debugger after using breakpoint
                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  // Assert
                  // To check that the entire fundMe balance has been added to the deployer balance
                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)
                  // Assert: same from the single getFunders
                  // To check to see if the number worked out during the act
                  assert.equal(endingFundMeBalance, 0) // checks to see if the endingFundMeBalance is 0
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString() // ensures the gas cost after withdrawing was also deducted from the deployer balance
                  ) // checks if the startingfundMeBalance and the startingDeployerBalance is now equal to the endingDeployerBalance

                  // To make sure that the getFunders are reset properly after withdrawal
                  await expect(fundMe.getFunders(0)).to.be.reverted
                  // to loop through all our accounts and ensure that in our mapping, all the amounts funded are zero
                  for (i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.getAddressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      )
                  }
              })

              // To test that our onlyOwner modifier is working
              it("Only allows the owner to withdraw", async function () {
                  const accounts = await ethers.getSigners()
                  const fundMeConnectedContract = await fundMe.connect(
                      accounts[1]
                  )
                  await expect(fundMeConnectedContract.withdraw()).to.be
                      .reverted
              })

              /**  Tests cheaperWithdraw eth from multiple getFunders */
              it("cheaperWithdraw testing...", async function () {
                  // Arrange

                  // to create a group of different accounts for this
                  const accounts = await ethers.getSigners()
                  // looping through the accounts and making each of these accounts call the fund function
                  // Using let i = 1 because we want the first index of the account to be 1, because the 0 index is the already the address of the deployer
                  // using 6 as the max no. of getFunders here
                  for (let i = 1; i < 6; i++) {
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i]
                      )
                      await fundMeConnectedContract.fund({ value: sendValue })
                  }
                  // Gets the starting balance of the fundMe contract
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  // Gets the balance of the deployer
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  // Act
                  const transactionResponse = await fundMe.cheaperWithdraw()
                  const transactionReceipt = await transactionResponse.wait(1)
                  // gas count variables gotten from the javascript debugger after using breakpoint
                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  // Assert
                  // To check that the entire fundMe balance has been added to the deployer balance
                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)
                  // Assert: same from the single getFunders
                  // To check to see if the number worked out during the act
                  assert.equal(endingFundMeBalance, 0) // checks to see if the endingFundMeBalance is 0
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString() // ensures the gas cost after withdrawing was also deducted from the deployer balance
                  ) // checks if the startingfundMeBalance and the startingDeployerBalance is now equal to the endingDeployerBalance

                  // To make sure that the getFunders are reset properly after withdrawal
                  await expect(fundMe.getFunders(0)).to.be.reverted
                  // to loop through all our accounts and ensure that in our mapping, all the amounts funded are zero
                  for (i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.getAddressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      )
                  }
              })
          })
      })
