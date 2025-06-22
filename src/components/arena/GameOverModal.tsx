import React from 'react';
import { Skull, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

interface GameOverModalProps {
  onRestart: () => void;
}

export const GameOverModal = ({ onRestart }: GameOverModalProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.8, y: 50, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="glass-card border-2 border-red-500/50 shadow-2xl shadow-red-500/30 rounded-2xl p-8 flex flex-col items-center gap-6 text-center text-white"
      >
        <Skull className="w-20 h-20 text-red-400" />
        <div className="flex flex-col gap-2">
          <h2 className="text-4xl font-bold text-red-400 tracking-wider">GAME OVER</h2>
          <p className="text-slate-300">All heroes have fallen. The darkness prevails... for now.</p>
        </div>
        <button
          onClick={onRestart}
          className="mt-4 flex items-center justify-center gap-3 w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-6 py-3 rounded-lg text-lg font-bold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/50"
        >
          <RefreshCw size={20} />
          Restart Game
        </button>
      </motion.div>
    </motion.div>
  );
};