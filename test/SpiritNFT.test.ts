import { expect } from "chai";
import hre from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers.js";

const ethers = hre.ethers;
const upgrades = (hre as any).upgrades;

const NAME = "Stillhere Spirit";
const SYMBOL = "SPIRIT";
const DEFAULT_URI = "ipfs://spirit-1";

async function deploySpiritFixture() {
  const [owner, alice, bob] = await ethers.getSigners();
  const SpiritFactory = await ethers.getContractFactory("SpiritNFT");
  const spirit = await upgrades.deployProxy(SpiritFactory, [NAME, SYMBOL], {
    kind: "uups",
  }) as any;
  await spirit.waitForDeployment();

  return { spirit, owner, alice, bob };
}

describe("SpiritNFT", function () {
  it("mints spirits with metadata", async () => {
    const { spirit, owner, alice } = await loadFixture(deploySpiritFixture);

    const expectedId = await spirit.mintSpirit.staticCall(alice.address, "Nora", "pet_cat", DEFAULT_URI);
    const tx = await spirit.mintSpirit(alice.address, "Nora", "pet_cat", DEFAULT_URI);
    await tx.wait();

    const metadata = await spirit.getSpiritMetadata(expectedId);
    expect(metadata.name).to.equal("Nora");
    expect(metadata.spiritType).to.equal("pet_cat");
    expect(metadata.metadataURI).to.equal(DEFAULT_URI);
    expect(metadata.createdAt).to.be.gt(0);

    const ownerIds = await spirit.getSpiritsOf(alice.address);
    expect(ownerIds.map((id) => id.toString())).to.deep.equal([expectedId.toString()]);

    expect(await spirit.owner()).to.equal(owner.address);
  });

  it("blocks transfers to enforce soulbound behavior", async () => {
    const { spirit, alice, bob } = await loadFixture(deploySpiritFixture);
    const tokenId = await spirit.mintSpirit.staticCall(alice.address, "Milo", "pet_dog", DEFAULT_URI);
    await spirit.mintSpirit(alice.address, "Milo", "pet_dog", DEFAULT_URI);

    await expect(
      spirit.connect(alice).safeTransferFrom(alice.address, bob.address, tokenId)
    ).to.be.revertedWithCustomError(spirit, "SoulboundTransferBlocked");
  });

  it("restricts minting to the contract owner", async () => {
    const { spirit, alice } = await loadFixture(deploySpiritFixture);
    await expect(
      spirit.connect(alice).mintSpirit(alice.address, "Rex", "pet_other", DEFAULT_URI)
    ).to.be.revertedWithCustomError(spirit, "OwnableUnauthorizedAccount");
  });

  it("allows metadata updates by owner and holder", async () => {
    const { spirit, owner, alice, bob } = await loadFixture(deploySpiritFixture);
    const tokenId = await spirit.mintSpirit.staticCall(alice.address, "Lua", "human", DEFAULT_URI);
    await spirit.mintSpirit(alice.address, "Lua", "human", DEFAULT_URI);

    await spirit.connect(alice).updateMetadataURI(tokenId, "ipfs://spirit-1b");
    expect(await spirit.tokenURI(tokenId)).to.equal("ipfs://spirit-1b");

    await spirit.connect(owner).updateMetadataURI(tokenId, "ipfs://spirit-1c");
    expect(await spirit.tokenURI(tokenId)).to.equal("ipfs://spirit-1c");

    await expect(
      spirit.connect(bob).updateMetadataURI(tokenId, "ipfs://spirit-1d")
    ).to.be.revertedWithCustomError(spirit, "UnauthorizedMetadataUpdate");
  });

  it("supports UUPS upgrades without losing state", async () => {
    const { spirit, alice } = await loadFixture(deploySpiritFixture);
    const tokenId = await spirit.mintSpirit.staticCall(alice.address, "Nova", "pet_cat", DEFAULT_URI);
    await spirit.mintSpirit(alice.address, "Nova", "pet_cat", DEFAULT_URI);

    const SpiritV2Factory = await ethers.getContractFactory("SpiritNFTV2");
    const upgraded = await upgrades.upgradeProxy(await spirit.getAddress(), SpiritV2Factory) as any;

    expect(await upgraded.version()).to.equal("v2");
    const metadata = await upgraded.getSpiritMetadata(tokenId);
    expect(metadata.name).to.equal("Nova");
  });
});
