const { expect, assert } = require("chai")
const { network, ethers, deployments } = require("hardhat")
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describ.skip
    : describe("BasicNFT unit test", () => {
          let deployer
          beforeEach(async () => {
              const accounts = await ethers.getSigners()
              // the one who deploys the contract
              deployer = accounts.deployer
              //the one who gets transfers etc
              user1 = accounts.user1
              await deployments.fixture("all")
              basicNft = await ethers.getContract("BasicNFT", deployer)
          })
          it("Was deployed", async () => {
              // A contract isdeployed if it has an address
              assert(basicNft.address)
          })
          describe("Constructor", () => {
              it("Should have a correct name,symbol,nftId", async () => {
                  const name = await basicNft.name()
                  console.log(name)
                  const symbol = await basicNft.symbol()
                  console.log(symbol)
                  const nftId = await basicNft.getTokenCounter()
                  console.log(nftId.toString())
                  assert.equal(name, "Dogie")
                  assert.equal(symbol, "DOG")
                  assert.equal(nftId.toString(), "0")
              })
          })
          describe("The mint function", () => {
              it("Should increase the token id", async () => {
                  await basicNft.mintNft()
                  const recentNftId = await basicNft.getTokenCounter()
                  assert.equal(recentNftId.toString(), "1")
              })
              it("Should mint", async () => {
                  assert(basicNft.mintNft)
              })
              it("Should update the tokenURI", async () => {
                  recentTokenURI = await basicNft.tokenURI(0)
                  assert.equal(recentTokenURI, await basicNft.TOKEN_URI())
              })
          })
      })
