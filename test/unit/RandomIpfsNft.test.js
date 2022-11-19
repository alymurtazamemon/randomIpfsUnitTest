//fulfillRandomWords
const { expect, assert } = require("chai")
const { network, ethers, deployments } = require("hardhat")
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("RandomIpfsNft unit test", () => {
          let deployer, randomIpfs, vrfCoordinatorV2Mock, mintFee, dogTokenUris
          beforeEach(async () => {
              const accounts = await ethers.getSigners()
              // the one who deploys the contract
              deployer = accounts.deployer
              //the one who gets transfers etc
              user1 = accounts.user1
              await deployments.fixture("all")
              vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer)
              randomIpfs = await ethers.getContract("RandomIpfsNft", deployer)
              mintFee = await randomIpfs.getmintFee()
          })
          it("Should deploy", async () => {
              //A contract is deployed if it has an address
              assert(randomIpfs.address)
          })
          describe("Constructor", async () => {
              it("Should initialize correctly", async () => {
                  //   mintFee = await randomIpfs.getmintFee();
                  assert.equal(mintFee.toString(), 10000000000000000)
              })
          })
          describe("Request Nft", async () => {
              it("Should revert if not enough eth is send", async () => {
                  await expect(randomIpfs.requestNft()).to.be.revertedWith(
                      "RandomIpfsNft__NeedMoreEthSent"
                  )
              })
          })
          describe("fulfillRandomWords", () => {
              beforeEach(async () => {
                  //   mintFee = await randomIpfs.getmintFee();
                  //   await randomIpfs.requestNft({ value: mintFee });
              })

              // * What are you testing here?

              //   it("_safeMint", async () => {
              //       const tx = await randomIpfs.requestNft({ value: mintFee });
              //       const txReceipt = await tx.wait(1);
              //       const requestId = txReceipt.events[1].args.requestId;
              //       const dogOwner = await randomIpfs.s_requestIdToSender[
              //           requestId
              //       ];
              //       const newTokenId = await randomIpfs.getTokenCounter();

              //       await expect(
              //           randomIpfs
              //               .fulfillRandomWords()
              //               ._safeMint(dogOwner, newTokenId)
              //       );
              //   });
              it("Should emit the NftMinted event", async () => {
                  //fulfillRandomWords(mocks being chainlink vrf)
                  //We will have to wait for fulfillRandomWorgs to be called
                  await new Promise(async (resolve, reject) => {
                      randomIpfs.once("NftMinted", async () => {
                          console.log("Found the event")
                          resolve()
                          try {
                              const requestId = txReceipt.events[1].args.requestId
                              const dogBreed = await randomIpfs.getBreedFromModdedRng({
                                  value: 25,
                              })
                              const dogOwner = await randomIpfs.s_requestIdToSender[requestId]
                              assert.equal(dogOwner, msg.sender)
                              assert.equal(dogBreed.toString(), "SHIBA_INU")
                          } catch (e) {
                              reject()
                          }
                      })
                      //Setting up the listener
                      //below we will fire the event, the listener will pick it up and resolve
                      const tx = await randomIpfs.requestNft({
                          value: mintFee,
                      })
                      const txReceipt = await tx.wait(1)
                      await vrfCoordinatorV2Mock.fulfillRandomWords(
                          txReceipt.events[1].args.requestId,
                          randomIpfs.address
                      )
                  })
              })
          })
      })
