'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, ChevronDown, ExternalLink, Copy, LogOut } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { shortenAddress } from '@/lib/utils';
import { ACTIVE_CHAIN } from '@/lib/constants';

export default function WalletButton() {
  const { address, isConnected, balance, isCorrectChain, connect, disconnect, switchChain } =
    useWallet();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await connect();
    } catch (err) {
      console.error('Connect error:', err);
    } finally {
      setIsConnecting(false);
    }
  };

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
    }
  };

  if (!isConnected) {
    return (
      <button
        onClick={handleConnect}
        disabled={isConnecting}
        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-arena-primary/20 to-arena-secondary/20 
                   border border-arena-primary/40 rounded-xl hover:border-arena-primary/80 
                   transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,240,255,0.3)]
                   disabled:opacity-50 disabled:cursor-not-allowed group"
      >
        <Wallet className="w-4 h-4 text-arena-primary group-hover:animate-pulse" />
        <span className="text-sm font-medium text-white">
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </span>
      </button>
    );
  }

  if (!isCorrectChain) {
    return (
      <button
        onClick={switchChain}
        className="flex items-center gap-2 px-4 py-2.5 bg-red-500/20 border border-red-500/50 
                   rounded-xl hover:border-red-500 transition-all duration-300"
      >
        <span className="text-sm font-medium text-red-400">Switch to Avalanche</span>
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 px-4 py-2.5 bg-arena-card border border-arena-border 
                   rounded-xl hover:border-arena-primary/50 transition-all duration-300"
      >
        <div className="w-2 h-2 rounded-full bg-arena-green animate-pulse" />
        <span className="text-sm font-mono text-white">{shortenAddress(address!)}</span>
        <span className="text-xs text-arena-primary">{parseFloat(balance).toFixed(3)} AVAX</span>
        <ChevronDown className="w-3 h-3 text-gray-400" />
      </button>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-64 bg-arena-card border border-arena-border 
                       rounded-xl shadow-2xl overflow-hidden z-50"
          >
            <div className="p-4 border-b border-arena-border">
              <p className="text-xs text-gray-400 mb-1">Connected to</p>
              <p className="text-sm text-arena-primary font-medium">{ACTIVE_CHAIN.chainName}</p>
            </div>

            <div className="p-4 border-b border-arena-border">
              <p className="text-xs text-gray-400 mb-1">Balance</p>
              <p className="text-lg font-bold text-white">{parseFloat(balance).toFixed(4)} AVAX</p>
            </div>

            <div className="p-2">
              <button
                onClick={copyAddress}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 
                           transition-colors text-left"
              >
                <Copy className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-300">Copy Address</span>
              </button>

              <a
                href={`${ACTIVE_CHAIN.blockExplorerUrls[0]}address/${address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 
                           transition-colors"
              >
                <ExternalLink className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-300">View on Explorer</span>
              </a>

              <button
                onClick={() => {
                  disconnect();
                  setShowDropdown(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-500/10 
                           transition-colors text-left"
              >
                <LogOut className="w-4 h-4 text-red-400" />
                <span className="text-sm text-red-400">Disconnect</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside handler */}
      {showDropdown && (
        <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
      )}
    </div>
  );
}
