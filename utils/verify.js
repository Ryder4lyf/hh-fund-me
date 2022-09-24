const { run } = require("hardhat")
// progmmatic verification of contracts
const verify = async (contractAddress, args) => {
    // parsing the verify function with our contract address and args
    console.log("Verifying contract...")
    try {
        // running a try-catch incase we run into an already verified error
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        })
    } catch (e) {
        // catches the try-catch verify error
        if (e.message.toLowerCase().includes("already verified")) {
            console.log("Already Verified!")
        } else {
            // if it didn't catch any error, it continues
            console.log(e)
        }
    }
}

module.exports = { verify }
