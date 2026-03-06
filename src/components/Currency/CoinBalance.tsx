import { motion } from 'framer-motion';
import { Coins } from 'lucide-react';
import React from 'react';

interface CoinBalanceProps {
  balance: number;
}

const CoinBalance: React.FC<CoinBalanceProps> = ({ balance }) => {
  return (
    <motion.div 
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="flex items-center space-x-2 bg-gradient-to-br from-indigo-600 to-indigo-700 px-4 py-2 rounded-2xl shadow-lg shadow-indigo-600/30 border border-white/20 cursor-default"
    >
      <div className="relative">
        <div className="absolute inset-0 bg-yellow-400 blur-md opacity-20 animate-pulse" />
        <Coins className="w-5 h-5 text-yellow-400 relative z-10" />
      </div>
      <div className="flex flex-col">
        <span className="text-[8px] font-black text-indigo-200 uppercase tracking-widest leading-none mb-0.5">ClubCoins</span>
        <span className="text-sm font-black text-white leading-none italic">{balance.toLocaleString()}</span>
      </div>
    </motion.div>
  );
};

export default CoinBalance;
