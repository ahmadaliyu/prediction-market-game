#!/bin/bash
# Start local Hardhat node, deploy contracts, and run the app — all in one command.

echo "🔄 Killing any existing processes on port 8545..."
lsof -ti:8545 | xargs kill -9 2>/dev/null
sleep 1

echo "🚀 Starting Hardhat node..."
npx hardhat node &
NODE_PID=$!

# Wait for the node to be ready
echo "⏳ Waiting for node to start..."
for i in {1..30}; do
  if curl -s http://127.0.0.1:8545 -X POST -H "Content-Type: application/json" \
    -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' > /dev/null 2>&1; then
    echo "✅ Hardhat node is running on http://127.0.0.1:8545"
    break
  fi
  sleep 1
done

# Clean old deployment and deploy fresh
echo "📦 Deploying contracts..."
rm -rf ignition/deployments/chain-31337
npx hardhat ignition deploy ignition/modules/PredictionMarket.ts --network localhost

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Contracts deployed! Starting Next.js..."
  echo ""
  npx next dev
else
  echo "❌ Deployment failed!"
  kill $NODE_PID 2>/dev/null
  exit 1
fi
