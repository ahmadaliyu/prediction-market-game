import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Deploy PredictionMarket
  console.log("\n📦 Deploying PredictionMarket...");
  const PredictionMarket = await ethers.getContractFactory("PredictionMarket");
  const predictionMarket = await PredictionMarket.deploy();
  await predictionMarket.waitForDeployment();
  const pmAddress = await predictionMarket.getAddress();
  console.log("✅ PredictionMarket deployed to:", pmAddress);

  // Deploy MarketFactory
  console.log("\n📦 Deploying MarketFactory...");
  const MarketFactory = await ethers.getContractFactory("MarketFactory");
  const marketFactory = await MarketFactory.deploy(pmAddress);
  await marketFactory.waitForDeployment();
  const mfAddress = await marketFactory.getAddress();
  console.log("✅ MarketFactory deployed to:", mfAddress);

  // Log deployment summary
  console.log("   DEPLOYMENT SUMMARY");
  console.log(`PredictionMarket: ${pmAddress}`);
  console.log(`MarketFactory:    ${mfAddress}`);
  console.log("\n📝 Add these to your .env.local:");
  console.log(`NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS=${pmAddress}`);
  console.log(`NEXT_PUBLIC_MARKET_FACTORY_ADDRESS=${mfAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
