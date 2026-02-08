import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const PredictionMarketModule = buildModule("PredictionMarketModule", (m) => {
  // Deploy PredictionMarket (no constructor args)
  const predictionMarket = m.contract("PredictionMarket");

  // Deploy MarketFactory with predictionMarket address as constructor arg
  const marketFactory = m.contract("MarketFactory", [predictionMarket]);

  return { predictionMarket, marketFactory };
});

export default PredictionMarketModule;
