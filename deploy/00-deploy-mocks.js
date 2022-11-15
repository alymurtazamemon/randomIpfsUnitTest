const { LogDescription } = require("ethers/lib/utils")
const { developmentChains } = require("../helper-hardhat-config")

module.exports = async function (hre) {
    const { getNamedAccouunts, deployments, network, ethers } = hre
    const BASE_FEE = ethers.utils.parseEther("0.25")
    const GAS_PRICE_LINK = 1e9 //1000000000

    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const args = [BASE_FEE, GAS_PRICE_LINK]

    if (developmentChains.includes(network.name)) {
        log("Local network detected deploying mocks")
        log("--------------------------------------")
        await deploy("VRFCoordinatorV2Mock", {
            from: deployer,
            log: true,
            args: args,
        })
        log("Mocks deployed !")
        log("-----------------------------------")
    }
}
module.exports.tags = ["all", "mocks"]
