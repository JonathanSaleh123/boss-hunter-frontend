import React, { useEffect } from 'react';
import { Heart, Skull, User, BookOpen } from 'lucide-react';
import { motion, useAnimation } from 'framer-motion'; // --- 1. IMPORTED from Framer Motion
import { Character } from './types';
import { usePrevious } from '../../hooks/usePrevious'; // --- 1. IMPORTED custom hook (adjust path if needed)

const getHealthColor = (health: number, maxHealth: number) => {
    const percentage = (health / maxHealth) * 100;
    if (percentage > 60) return 'bg-gradient-to-r from-cyan-400 to-green-400';
    if (percentage > 30) return 'bg-gradient-to-r from-yellow-400 to-orange-400';
    return 'bg-gradient-to-r from-red-500 to-pink-500';
};

const getHealthGlow = (health: number, maxHealth: number) => {
    const percentage = (health / maxHealth) * 100;
    if (percentage > 60) return 'shadow-cyan-400/50';
    if (percentage > 30) return 'shadow-yellow-400/50';
    return 'shadow-red-400/50';
};

interface PlayerCardProps {
    player: Character;
    onShowDetails: (p: Character) => void;
    playerIndex: number;
}

export const PlayerCard = ({ player, onShowDetails, playerIndex }: PlayerCardProps) => {
    const healthPercentage = (player.health / player.maxHealth) * 100;

    // --- 2. SET UP animation controls and track previous health ---
    const controls = useAnimation();
    const prevHealth = usePrevious(player.health);

    // --- 3. USEEFFECT to trigger the animation on health decrease ---
    useEffect(() => {
        // If prevHealth is defined and current health is less than previous, trigger the shake
        if (prevHealth !== undefined && player.health < prevHealth) {
            controls.start({
                // Shake animation on the x-axis
                x: [0, -7, 7, -7, 7, 0],
                transition: { duration: 0.4, ease: 'easeInOut' },
            });
        }
    }, [player.health, prevHealth, controls]);
    
    return (
      // --- 4. CONVERTED the root div to a motion.div and linked animation controls ---
      <motion.div 
        animate={controls}
        className={`relative flex flex-col items-center transition-all duration-300`}
      >
        <div className={`relative w-56 rounded-2xl p-5 border-2 shadow-2xl transition-all duration-300 flex flex-col glass-card ${
          player.isPlayer ? 'border-cyan-400 shadow-cyan-400/50 ring-2 ring-cyan-400/30 scale-105' 
          : player.isAlive ? 'border-slate-600 hover:border-purple-400 hover:scale-105' 
          : 'border-red-500 opacity-60'}`}>
          
          {!player.isAlive && (
            <div className="absolute inset-0 bg-black/70 rounded-2xl flex items-center justify-center z-10"><Skull className="w-12 h-12 text-red-400" /></div>
          )}
          
          <div className="flex-1">
            <div className="relative mb-4">
              <div className={`w-36 h-44 rounded-xl overflow-hidden border-2 ${ player.isPlayer ? 'border-cyan-400' : 'border-slate-600' } bg-slate-800 mx-auto`}>
                <img src={player.image} alt={player.name} className="w-full h-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://placehold.co/200x300/1e293b/ffffff?text=Char'; }} />
              </div>
              <div className={`absolute -top-2 -right-2 rounded-full w-7 h-7 flex items-center justify-center ${ player.isPlayer ? 'bg-gradient-to-r from-cyan-500 to-blue-500 ring-2 ring-cyan-300' : 'bg-gradient-to-r from-purple-500 to-pink-500' }`}>
                {player.isPlayer ? <User className="w-4 h-4 text-white" /> : <span className="text-white text-xs font-bold">{playerIndex + 1}</span> }
              </div>
              {player.isPlayer && (<div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold">YOU</div>)}
            </div>
            <div className="text-center mb-4">
              <h3 className={`font-bold text-lg truncate ${player.isPlayer ? 'text-cyan-300' : 'text-white'}`}>{player.name}</h3>
              {/* <p className={`text-sm ${player.isPlayer ? 'text-cyan-400' : 'text-slate-400'}`}>{player.class}</p> */}
            </div>
            <div className="w-full">
              <div className="flex items-center justify-between mb-2"><div className="flex items-center gap-1"><Heart className="w-4 h-4 text-red-400" /><span className="text-xs text-slate-300">HP</span></div><span className="text-xs text-slate-300">{player.health}/{player.maxHealth}</span></div>
              <div className="relative h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-600">
                <div className={`absolute left-0 top-0 h-full transition-all duration-500 rounded-full ${getHealthColor(player.health, player.maxHealth)} shadow-md ${getHealthGlow(player.health, player.maxHealth)}`} style={{ width: `${healthPercentage}%` }}/>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10 rounded-full" />
              </div>
            </div>
          </div>
          <button onClick={() => onShowDetails(player)} className="mt-4 w-full bg-slate-700/50 hover:bg-slate-600/70 text-slate-300 hover:text-white transition-colors text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-2"><BookOpen size={14} /> Details</button>
        </div>
      </motion.div>
    );
};