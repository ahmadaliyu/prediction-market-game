#!/usr/bin/env node

/**
 * Print deployed contract addresses from Hardhat Ignition
 * Usage: node scripts/print-deployments.js <chainId>
 * Example: node scripts/print-deployments.js 43113
 */

const fs = require('fs');
const path = require('path');

const chainId = process.argv[2];

if (!chainId) {
  console.error('❌ Error: Chain ID is required');
  console.error('Usage: node scripts/print-deployments.js <chainId>');
  console.error('Examples:');
  console.error('  node scripts/print-deployments.js 31337   # Localhost');
  console.error('  node scripts/print-deployments.js 43113   # Fuji testnet');
  process.exit(1);
}

const deployedAddressesPath = path.join(
  __dirname,
  '..',
  'ignition',
  'deployments',
  `chain-${chainId}`,
  'deployed_addresses.json'
);

if (!fs.existsSync(deployedAddressesPath)) {
  console.error(`❌ No deployment found for chain ${chainId}`);
  console.error(`   File not found: ${deployedAddressesPath}`);
  console.error('');
  console.error('Deploy first with:');
  console.error(chainId === '31337' ? '  npm run deploy:local' : '  npm run deploy:fuji');
  process.exit(1);
}

try {
  const addresses = JSON.parse(fs.readFileSync(deployedAddressesPath, 'utf8'));
  
  const chainName = chainId === '31337' ? 'Localhost' : chainId === '43113' ? 'Fuji Testnet' : `Chain ${chainId}`;
  
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`📋 Deployed Addresses (${chainName})`);
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
  
  // Find PredictionMarket and MarketFactory addresses
  let predictionMarketAddress = null;
  let marketFactoryAddress = null;
  
  for (const [key, address] of Object.entries(addresses)) {
    if (key.includes('PredictionMarket') && !key.includes('MarketFactory')) {
      predictionMarketAddress = address;
    } else if (key.includes('MarketFactory')) {
      marketFactoryAddress = address;
    }
  }
  
  if (predictionMarketAddress) {
    console.log(`PredictionMarket: ${predictionMarketAddress}`);
  }
  if (marketFactoryAddress) {
    console.log(`MarketFactory:    ${marketFactoryAddress}`);
  }
  
  console.log('');
  console.log('───────────────────────────────────────────────────────────');
  console.log('📝 Copy these to your .env file:');
  console.log('───────────────────────────────────────────────────────────');
  console.log('');
  
  if (predictionMarketAddress) {
    console.log(`NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS=${predictionMarketAddress}`);
  }
  if (marketFactoryAddress) {
    console.log(`NEXT_PUBLIC_MARKET_FACTORY_ADDRESS=${marketFactoryAddress}`);
  }
  
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
  
} catch (error) {
  console.error(`❌ Error reading deployment file: ${error.message}`);
  process.exit(1);
}
