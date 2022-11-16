const { network, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
const { storeImages, storeTokenUriMetaData } = require("../utils/uploadToPinata")

const imagesLocation = "./images/randomNft"
const FUND_AMOUNT = "1000000000000000000000"

const metadataTemplate = {
    name: "",
    description: "",
    image: "",
    attributes: [],
}

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    let tokenUris = [
        "ipfs://QmewKiebG7ocHNygt8WLpSpTHXoFwp6zN3iwc34wV7s4US",
        "ipfs://QmdcsQSP7PwcJj3pf4NJ7XxJHY42wSJERCF9BZap92XxfF",
        "ipfs://QmRsQCmPLf3zJjGWnG28VgHxawwo1WmrSLkqgMECxqR23u",
    ]
    //get hte IPFS hashes of our images
    if (process.env.UPLOAD_TO_PINATA == "true") {
        tokenUris = await handleTokenUris()
    }

    //1. With our own IPFS node
    //2. Pinata https://www.pinata.cloud
    //3. Nft.storage https://nft.storage

    let vrfCoordinatorV2Address, subscriptionId
    if (chainId == 31337) {
        const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
        vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address
        const tx = await vrfCoordinatorV2Mock.createSubscription()
        const txReceipt = await tx.wait()
        subscriptionId = txReceipt.events[0].args.subId
        await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, FUND_AMOUNT)
    } else {
        vrfCoordinatorV2Address = networkConfig[chainId].vrfCoordinatorV2Mock
        subscriptionId = networkConfig[chainId].subscriptionId
    }
    log("----------------------------")
    // await storeImages(imagesLocation)
    const args = [
        vrfCoordinatorV2Address,
        subscriptionId,
        networkConfig[chainId].gasLane,
        networkConfig[chainId].callbackGasLimit,
        tokenUris,
        networkConfig[chainId].mintFee,
    ]
    const randomIpfsNft = await deploy("RandomIpfsNft", {
        from: deployer,
        args: args,
        log: true,
        waiConfirmations: network.config.blockConfirmations,
    })
    if (developmentChains.includes(network.name)) {
        const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
        await vrfCoordinatorV2Mock.addConsumer(subscriptionId, randomIpfsNft.address)
    }
    log("--------------------------------")
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifiying.....")
        await verify(randomIpfsNft.address, args)
        log("___________________________________")
    }
}
async function handleTokenUris() {
    tokenUris = []
    //Store the image in IPFS
    //Store the metadata in IPFS
    const { responces: imagesUploadResponces, files } = await storeImages(imagesLocation)
    for (imageUploadResponceIndex in imagesUploadResponces) {
        //create the metadata
        // upload the metadata
        let tokenUriMetadata = { ...metadataTemplate }
        tokenUriMetadata.name = files[imageUploadResponceIndex.replace(".png")]
        tokenUriMetadata.description = `An adorable ${tokenUriMetadata.name} pup!`
        tokenUriMetadata.image = `ipfs://${imagesUploadResponces[imageUploadResponceIndex].IpfsHash}`
        console.log(`Uploading ${tokenUriMetadata.name}....`)
        //store the JSON to pinata/IPFS
        const metadataUploadResponce = await storeTokenUriMetaData(tokenUriMetadata)
        tokenUris.push(`ipfs://${metadataUploadResponce.IpfsHash}`)
    }
    console.log("Token URI's uploaded ! They are:")
    console.log(tokenUris)
    return tokenUris
}
module.exports.tags = ["all", "randomIpfs", "main"]
