import { ethers } from "hardhat";
import { expect } from "chai";
import { Item } from "../typechain-types";

describe("Item", function () {
  let itemContract: Item;

  beforeEach(async function () {
    // get owner (first account)
    const [owner] = await ethers.getSigners();

    // deploy Item contract
    const Item = await ethers.getContractFactory("Item");
    itemContract = await Item.deploy(
      owner.address, // owner
      "Item", // name
      "ITEM", // symbol
      "https://example.com/", // baseURI
      "https://example.com/contract", // contractURI
      owner.address,
      ethers.BigNumber.from("2000")
    );
    await itemContract.deployed();

    // grant owner the minter role
    await itemContract.grantRole(
      await itemContract.MINTER_ROLE(),
      owner.address
    );
  });

  it("Owner should be able to mint an NFT", async function () {
    const [owner, recipient] = await ethers.getSigners();
    await itemContract.connect(owner).mint(recipient.address, 1);
    expect(await itemContract.balanceOf(recipient.address)).to.equal(1);
  });

  it("User should be able to forge two items into a new one", async function () {
    const [owner, user] = await ethers.getSigners();
    // mint two items to the user
    await itemContract.connect(owner).mint(user.address, 2);

    // forge the items with IDs 1 and 2 into a new item with token ID 3
    // check that the ItemForged event is emitted with the correct arguments
    await expect(itemContract.connect(user).forgeItems(1, 2))
      .to.emit(itemContract, "ItemForged")
      .withArgs(user.address, 1, 2, 3);

    // check that the new item has a token ID of 3 and is owned by the user
    expect(await itemContract.ownerOf(3)).to.equal(user.address);
    // check that the user has a balance of 1
    expect(await itemContract.balanceOf(user.address)).to.equal(1);
    // check that input items are burned, i.e. invalid token ID
    await expect(itemContract.ownerOf(0)).to.be.revertedWith(
      "ERC721: invalid token ID"
    );
    await expect(itemContract.ownerOf(1)).to.be.revertedWith(
      "ERC721: invalid token ID"
    );
  });
});
