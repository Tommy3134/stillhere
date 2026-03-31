import hre from "hardhat";

const ethers = hre.ethers;
const upgrades = (hre as any).upgrades;

const SPIRIT_NAME = process.env.SPIRIT_NAME ?? "Stillhere Spirit";
const SPIRIT_SYMBOL = process.env.SPIRIT_SYMBOL ?? "SPIRIT";
const MIN_BLESSING_AMOUNT_WEI = process.env.MIN_BLESSING_AMOUNT_WEI ?? "0";

async function main() {
  console.log("Deploying SpiritNFT proxy...");
  const SpiritFactory = await ethers.getContractFactory("SpiritNFT");
  const spirit = await upgrades.deployProxy(SpiritFactory, [SPIRIT_NAME, SPIRIT_SYMBOL], {
    kind: "uups",
  });
  await spirit.waitForDeployment();
  const spiritAddress = await spirit.getAddress();
  console.log(`SpiritNFT deployed at ${spiritAddress}`);

  console.log("Deploying BlessingContract...");
  const BlessingFactory = await ethers.getContractFactory("BlessingContract");
  const blessing = await BlessingFactory.deploy(spiritAddress, BigInt(MIN_BLESSING_AMOUNT_WEI));
  await blessing.waitForDeployment();
  const blessingAddress = await blessing.getAddress();
  console.log(`BlessingContract deployed at ${blessingAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
