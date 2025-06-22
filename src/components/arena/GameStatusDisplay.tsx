import React from 'react';
import { Timer as TimerIcon, Play } from 'lucide-react';

interface GameStatusDisplayProps {
    gameState: string;
    timer: number;
    onStartGame: () => void;
}

const GameStatus = ({ gameState, timer }: { gameState: string, timer: number }) => {
    let statusText = "Waiting for players...";
    let color = "text-slate-400";
    
    switch (gameState) {
        case 'WAITING_FOR_ACTIONS': statusText = `CHOOSE YOUR ACTION`; color = 'text-cyan-400'; break;
        case 'PLAYERS_ATTACKING': statusText = 'PARTY ATTACKING'; color = 'text-orange-400 animate-pulse'; break;
        case 'BOSS_ATTACKING': statusText = 'BOSS ATTACKING'; color = 'text-red-400 animate-pulse'; break;
    }

    return (
      <div className="glass-card border-slate-600 border-2 rounded-xl px-6 py-3 flex flex-col items-center shadow-lg">
          <h2 className={`text-xl font-bold ${color} tracking-widest`}>{statusText}</h2>
          {gameState === 'WAITING_FOR_ACTIONS' && (<div className="flex items-center gap-2 mt-2 text-2xl text-white font-mono"><TimerIcon className="w-6 h-6 text-cyan-400" /><span>{timer}</span></div>)}
      </div>
    );
};

const StartGameButton = ({ onStartGame }: { onStartGame: () => void }) => (
    <div className="flex flex-col items-center gap-4">
        <p className="text-slate-300">The lobby is ready. The battle awaits.</p>
        <button onClick={onStartGame} className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-cyan-500 text-white font-bold text-lg px-8 py-4 rounded-lg shadow-lg hover:scale-105 transition-transform duration-300"><Play />START BATTLE</button>
    </div>
);

export const GameStatusDisplay = ({ gameState, timer, onStartGame }: GameStatusDisplayProps) => {
    // Render in the main layout (`ArenaUI`) based on gameState
    if (gameState === 'IDLE') {
        return <StartGameButton onStartGame={onStartGame} />;
    }
    return <GameStatus gameState={gameState} timer={timer} />;
};