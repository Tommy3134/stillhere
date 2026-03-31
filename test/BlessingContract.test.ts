import { expect } from "chai";
import hre from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers.js";

const ethers = hre.ethers;
const upgrades = (hre as any).upgrades;

const NAME = "Stillhere Spirit";
const SYMBOL = "SPIRIT";
const DEFAULT_URI = "ipfs://spirit";
const MIN_AMOUNT = ethers.parseEther("0.01");

async function deployFixture() {
  const [owner, alice, bob, carol] = await ethers.getSigners();
  const SpiritFactory = await ethers.getContractFactory("SpiritNFT");
  const spirit = await upgrades.deployProxy(SpiritFactory, [NAME, SYMBOL], {
    kind: "uups",
  }) as any;
  await spirit.waitForDeployment();

  const BlessingFactory = await ethers.getContractFactory("BlessingContract");
  const blessing = await BlessingFactory.deploy(await spirit.getAddress(), MIN_AMOUNT) as any;
  await blessing.waitForDeployment();

  return { owner, alice, bob, carol, spirit, blessing };
}

describe("BlessingContract", () => {
  async function mintSpirit(spirit: any, to: string) {
    const tokenId = await spirit.mintSpirit.staticCall(to, "Spirit", "human", DEFAULT_URI);
    await spirit.mintSpirit(to, "Spirit", "human", DEFAULT_URI);
    return tokenId;
  }

  it("records blessings and emits events", async () => {
    const { blessing, spirit, alice, bob } = await loadFixture(deployFixture);
    const tokenId = await mintSpirit(spirit, alice.address);

    const tx = await blessing.connect(bob).bless(tokenId, "candle", { value: MIN_AMOUNT });
    await expect(tx)
      .to.emit(blessing, "BlessingReceived")
      .withArgs(tokenId, bob.address, "candle", MIN_AMOUNT);

    expect(await blessing.getBlessingCount(tokenId)).to.equal(1);
    const records = await blessing.getRecentBlessings(tokenId, 1);
    expect(records[0].from).to.equal(bob.address);
    expect(records[0].amount).to.equal(MIN_AMOUNT);
  });

  it("rejects insufficient offerings", async () => {
    const { blessing, spirit, alice, bob } = await loadFixture(deployFixture);
    const tokenId = await mintSpirit(spirit, alice.address);

    await expect(
      blessing.connect(bob).bless(tokenId, "flower", { value: ethers.parseEther("0.005") })
    ).to.be.revertedWithCustomError(blessing, "BlessingAmountTooLow");
  });

  it("validates spirit existence", async () => {
    const { blessing, bob } = await loadFixture(deployFixture);
    await expect(
      blessing.connect(bob).bless(999, "charm", { value: MIN_AMOUNT })
    ).to.be.revertedWithCustomError(blessing, "InvalidSpirit");
  });

  it("returns recent blessings in chronological order", async () => {
    const { blessing, spirit, alice, bob, carol } = await loadFixture(deployFixture);
    const tokenId = await mintSpirit(spirit, alice.address);

    await blessing.connect(bob).bless(tokenId, "candle", { value: MIN_AMOUNT });
    await blessing.connect(carol).bless(tokenId, "flower", { value: MIN_AMOUNT });
    await blessing.connect(bob).bless(tokenId, "prayer", { value: MIN_AMOUNT });

    const recent = await blessing.getRecentBlessings(tokenId, 2);
    expect(recent.length).to.equal(2);
    expect(recent[0].blessingType).to.equal("flower");
    expect(recent[1].blessingType).to.equal("prayer");
  });

  it("allows the owner to withdraw funds", async () => {
    const { blessing, spirit, owner, alice, bob } = await loadFixture(deployFixture);
    const tokenId = await mintSpirit(spirit, alice.address);

    await blessing.connect(bob).bless(tokenId, "candle", { value: MIN_AMOUNT });
    await blessing.connect(alice).bless(tokenId, "flower", { value: MIN_AMOUNT });

    await expect(() => blessing.connect(owner).withdraw()).to.changeEtherBalances(
      [owner, blessing],
      [MIN_AMOUNT * 2n, -MIN_AMOUNT * 2n]
    );
  });

  it("lets the owner tune the minimum amount", async () => {
    const { blessing, owner, spirit, alice, bob } = await loadFixture(deployFixture);
    const tokenId = await mintSpirit(spirit, alice.address);

    await expect(blessing.connect(bob).setMinBlessingAmount(0)).to.be.revertedWithCustomError(
      blessing,
      "OwnableUnauthorizedAccount"
    );

    await blessing.connect(owner).setMinBlessingAmount(0);
    await blessing.connect(bob).bless(tokenId, "prayer", { value: 0 });
    expect(await blessing.getBlessingCount(tokenId)).to.equal(1);
  });
});
