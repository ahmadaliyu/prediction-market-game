#!/usr/bin/env node

/**
 * Reset Hardhat Ignition deployment state for a specific chain
 * Usage: node scripts/reset-deployments.js <chainId>
 * Example: node scripts/reset-deployments.js 43113
 */

const fs = require('fs');
const path = require('path');

const chainId = process.argv[2];

if (!chainId) {
  console.error('❌ Error: Chain ID is required');
  console.error('Usage: node scripts/reset-deployments.js <chainId>');
  console.error('Examples:');
  console.error('  node scripts/reset-deployments.js 31337   # Reset localhost');
  console.error('  node scripts/reset-deployments.js 43113   # Reset Fuji testnet');
  process.exit(1);
}

// Only allow resetting localhost and Fuji for safety
const allowedChains = ['31337', '43113'];
if (!allowedChains.includes(chainId)) {
  console.error(`❌ Error: Chain ID ${chainId} is not allowed`);
  console.error(`Only these chains can be reset: ${allowedChains.join(', ')}`);
  console.error('This is a safety measure to prevent accidental mainnet deployment resets.');
  process.exit(1);
}

const deploymentDir = path.join(__dirname, '..', 'ignition', 'deployments', `chain-${chainId}`);

if (!fs.existsSync(deploymentDir)) {
  console.log(`ℹ️  No deployment found for chain ${chainId}`);
  console.log(`   Directory doesn't exist: ${deploymentDir}`);
  process.exit(0);
}

try {
  // Remove the entire deployment directory
  fs.rmSync(deploymentDir, { recursive: true, force: true });
  
  const chainName = chainId === '31337' ? 'Localhost' : chainId === '43113' ? 'Fuji Testnet' : `Chain ${chainId}`;
  console.log(`✅ Successfully reset deployment state for ${chainName} (chain ${chainId})`);
  console.log(`   Removed: ${deploymentDir}`);
  console.log('');
  console.log('You can now deploy fresh with:');
  console.log(chainId === '31337' ? '  npm run deploy:local' : '  npm run deploy:fuji');
} catch (error) {
  console.error(`❌ Error removing deployment directory: ${error.message}`);
  process.exit(1);
}
