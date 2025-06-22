"use client"
import React, { useState, useEffect, useRef } from 'react';
import { Sword, Shield, Heart, Skull, Crown, User, Timer as TimerIcon, Check, Play, X, BookOpen } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

// --- (Interfaces are unchanged) ---
interface Character {
  id: string; 
  name: string;
  description: string;
  background_info: {
    backstory: string;
    personality: string;
    voice: string;
    alignment: string;
  };
  game_stats: {
    base_stats: {
      general: {
        max_health: number;
        speed: number;
        attack: number;
        defense: number;
      };
      advanced: {
        luck: number;
        intelligence: number;
        agility: number;
        endurance: number;
      };
      total_stat_points: number;
    };
    abilities: string[];
  };
  health: number;
  maxHealth: number;
  class: string;
  image: string;
  isAlive: boolean;
  isPlayer: boolean;
}
interface Boss extends Omit<Character, 'id' | 'isPlayer' | 'class'> {
    isEnraged: boolean;
    phase: number;
}
interface ChatMessage {
    id: number;
    player: string;
    message: string;
    type: 'action' | 'attack' | 'damage' | 'boss' | 'system';
    timestamp: string;
}


// --- NEW COMPONENT: Character Details Modal ---
const CharacterDetailsModal = ({ character, onClose }: { character: Character | Boss, onClose: () => void }) => {
    
    const StatItem = ({ name, value }: { name: string, value: string | number }) => (
        <div className="bg-slate-800/50 p-3 rounded-lg flex justify-between items-center text-sm">
            <span className="text-slate-400">{name}</span>
            <span className="font-bold text-white">{value}</span>
        </div>
    );
    
    return (
        <div 
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div 
                className="glass-card w-full max-w-2xl max-h-[90vh] border-2 border-cyan-400/30 rounded-2xl shadow-2xl p-6 relative flex flex-col gap-4"
                onClick={e => e.stopPropagation()} // Prevent click from closing modal
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
                    <X size={24} />
                </button>

                {/* Header */}
                <div className="flex items-start gap-6">
                    <img 
                        src={character.image} 
                        alt={character.name} 
                        className="w-32 h-32 object-cover rounded-xl border-2 border-slate-600"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://placehold.co/200x300/1e293b/ffffff?text=Char'; }}
                    />
                    <div className="flex-1">
                        <h2 className="text-3xl font-bold text-cyan-300">{character.name}</h2>
                        <p className="text-slate-300 mt-1">{character.description}</p>
                        <p className="text-purple-400 text-sm mt-2">{('class' in character ? character.class : character.background_info.personality)} / {character.background_info.alignment}</p>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
                    <div className="space-y-6">
                         {/* Background Info */}
                        <div>
                            <h3 className="font-bold text-lg text-white mb-2 border-b-2 border-slate-700 pb-1">Background</h3>
                            <p className="text-sm text-slate-400 bg-slate-800/50 p-3 rounded-lg">{character.background_info.backstory}</p>
                        </div>

                        {/* Stats */}
                        <div>
                            <h3 className="font-bold text-lg text-white mb-2 border-b-2 border-slate-700 pb-1">Base Stats</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                <StatItem name="Max Health" value={character.game_stats.base_stats.general.max_health} />
                                <StatItem name="Attack" value={character.game_stats.base_stats.general.attack} />
                                <StatItem name="Defense" value={character.game_stats.base_stats.general.defense} />
                                <StatItem name="Speed" value={character.game_stats.base_stats.general.speed} />
                                <StatItem name="Intelligence" value={character.game_stats.base_stats.advanced.intelligence} />
                                <StatItem name="Agility" value={character.game_stats.base_stats.advanced.agility} />
                                <StatItem name="Endurance" value={character.game_stats.base_stats.advanced.endurance} />
                                <StatItem name="Luck" value={character.game_stats.base_stats.advanced.luck} />
                            </div>
                        </div>

                        {/* Abilities */}
                        <div>
                            <h3 className="font-bold text-lg text-white mb-2 border-b-2 border-slate-700 pb-1">Abilities</h3>
                             <div className="flex flex-wrap gap-2">
                                {character.game_stats.abilities.map(ability => (
                                    <div key={ability} className="bg-cyan-900/50 text-cyan-300 text-sm font-medium px-3 py-1 rounded-full border border-cyan-700">
                                        {ability}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


const ArenaUI = () => {
  const [players, setPlayers] = useState<Character[]>([]);
  const [boss, setBoss] = useState<Boss | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  const [gameState, setGameState] = useState('IDLE');
  const [timer, setTimer] = useState(0);
  const [hasSubmittedAction, setHasSubmittedAction] = useState(false);
  // --- NEW STATE for details modal ---
  const [detailsCharacter, setDetailsCharacter] = useState<Character | Boss | null>(null);

  useEffect(() => {
    // ... main socket connection useEffect is unchanged
    const storedCharacterJSON = sessionStorage.getItem('character');
    if (!storedCharacterJSON) {
        alert("No character found! Redirecting to character creation.");
        window.location.href = '/';
        return;
    }
    const characterFromPrevPage = JSON.parse(storedCharacterJSON);

    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    newSocket.emit('join_room', characterFromPrevPage);

    newSocket.on('initial_state', ({ players, boss }) => {
        const currentPlayerId = newSocket.id;
        const updatedPlayers = players.map(p => ({...p, isPlayer: p.id === currentPlayerId}));
        setPlayers(updatedPlayers);
        setBoss(boss);
    });

    newSocket.on('player_joined', (newPlayer) => {
        setPlayers(prev => [...prev, {...newPlayer, isPlayer: false}]);
    });
    
    newSocket.on('player_left', (playerId) => {
        setPlayers(prev => prev.filter(p => p.id !== playerId));
    });

    newSocket.on('update_game_state', ({ players, boss }) => {
        const currentPlayerId = newSocket.id;
        const updatedPlayers = players.map(p => ({...p, isPlayer: p.id === currentPlayerId}));
        setPlayers(updatedPlayers);
        setBoss(boss);
    });
    
    newSocket.on('game_state_change', ({ state, timer }) => {
        setGameState(state);
        setTimer(timer || 0);
    });

    newSocket.on('new_message', (newMsg) => {
        setChatMessages(prev => [...prev.slice(-19), newMsg]);
    });

    return () => newSocket.disconnect();
  }, []);
  
  useEffect(() => {
    if (gameState === 'WAITING_FOR_ACTIONS') {
      setHasSubmittedAction(false);
    }
  }, [gameState]);

  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [chatMessages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const isActionPhase = gameState === 'WAITING_FOR_ACTIONS';
    if (newMessage.trim() && socket && isActionPhase && !hasSubmittedAction) {
      socket.emit('submit_action', newMessage.trim());
      setNewMessage('');
      setHasSubmittedAction(true);
    }
  };
  
  const handleStartGame = () => {
    if (socket) {
      socket.emit('start_game');
    }
  };

  const PlayerCard = ({ player, onShowDetails }: { player: Character, onShowDetails: (p: Character) => void }) => {
    const healthPercentage = (player.health / player.maxHealth) * 100;
    return (
      <div className={`relative flex flex-col items-center transition-all duration-300`}>
        <div className={`relative w-56 rounded-2xl p-5 border-2 shadow-2xl transition-all duration-300 glass-card flex flex-col ${
          player.isPlayer ? 'border-cyan-400 shadow-cyan-400/50 ring-2 ring-cyan-400/30 scale-105' 
          : player.isAlive ? 'border-slate-600 hover:border-purple-400 hover:scale-105' 
          : 'border-red-500 opacity-60'}`}>
          {!player.isAlive && (
            <div className="absolute inset-0 bg-black/70 rounded-2xl flex items-center justify-center z-10">
              <Skull className="w-12 h-12 text-red-400" />
            </div>
          )}
          {/* Main card content */}
          <div className="flex-1">
            <div className="relative mb-4">
              <div className={`w-36 h-44 rounded-xl overflow-hidden border-2 ${ player.isPlayer ? 'border-cyan-400' : 'border-slate-600' } bg-slate-800 mx-auto`}>
                <img src={player.image} alt={player.name} className="w-full h-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://placehold.co/200x300/1e293b/ffffff?text=Char'; }} />
              </div>
              <div className={`absolute -top-2 -right-2 rounded-full w-7 h-7 flex items-center justify-center ${ player.isPlayer ? 'bg-gradient-to-r from-cyan-500 to-blue-500 ring-2 ring-cyan-300' : 'bg-gradient-to-r from-purple-500 to-pink-500' }`}>
                {player.isPlayer ? <User className="w-4 h-4 text-white" /> : <span className="text-white text-xs font-bold">{players.findIndex(p => p.id === player.id) + 1}</span> }
              </div>
              {player.isPlayer && (<div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold">YOU</div>)}
            </div>
            <div className="text-center mb-4">
              <h3 className={`font-bold text-lg truncate ${player.isPlayer ? 'text-cyan-300' : 'text-white'}`}>{player.name}</h3>
              <p className={`text-sm ${player.isPlayer ? 'text-cyan-400' : 'text-slate-400'}`}>{player.class}</p>
            </div>
            <div className="w-full">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1"><Heart className="w-4 h-4 text-red-400" /><span className="text-xs text-slate-300">HP</span></div>
                <span className="text-xs text-slate-300">{player.health}/{player.maxHealth}</span>
              </div>
              <div className="relative h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-600">
                <div className={`absolute left-0 top-0 h-full transition-all duration-500 rounded-full ${getHealthColor(player.health, player.maxHealth)} shadow-md ${getHealthGlow(player.health, player.maxHealth)}`} style={{ width: `${healthPercentage}%` }}/>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10 rounded-full" />
              </div>
            </div>
          </div>
          {/* Details Button */}
          <button 
             onClick={() => onShowDetails(player)}
             className="mt-4 w-full bg-slate-700/50 hover:bg-slate-600/70 text-slate-300 hover:text-white transition-colors text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-2"
          >
            <BookOpen size={14} /> Details
          </button>
        </div>
      </div>
    );
  };
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
  
  const GameStatus = () => {
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

  const StartGameButton = () => (
    <div className="flex flex-col items-center gap-4">
        <p className="text-slate-300">The lobby is ready. The battle awaits.</p>
        <button onClick={handleStartGame} className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-cyan-500 text-white font-bold text-lg px-8 py-4 rounded-lg shadow-lg hover:scale-105 transition-transform duration-300"><Play />START BATTLE</button>
    </div>
  );


  if (!boss || players.length === 0) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black p-6 flex flex-col items-center justify-center text-white">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-cyan-500"></div><h2 className="text-2xl font-bold mt-8">Connecting to the Arena...</h2><p className="text-slate-400">Please wait while we find a battle for you.</p>
        </div>
    )
  }

  const bossHealthPercentage = (boss.health / boss.maxHealth) * 100;
  const isInputDisabled = gameState !== 'WAITING_FOR_ACTIONS' || hasSubmittedAction;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black p-6 overflow-hidden relative">
      {/* --- RENDER THE MODAL when a character is selected --- */}
      {detailsCharacter && <CharacterDetailsModal character={detailsCharacter} onClose={() => setDetailsCharacter(null)} />}

      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">{gameState !== 'IDLE' && <GameStatus />}</div>
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-slate-900/20 to-black/20 z-0"></div>
      <div className="absolute inset-0 cyber-grid z-0"></div>
      
      <div className="flex justify-center gap-8 mb-8 relative z-10 mt-24">
        <div className={`relative glass-card rounded-3xl p-6 border-2 transition-all duration-500 shadow-2xl ${ boss.isEnraged ? 'border-red-500 shadow-red-500/30 animate-pulse' : 'border-purple-500 shadow-purple-500/20' }`}>
          <div className="flex flex-col items-center gap-4">
            <div className="relative boss-float">
              <div className={`w-40 h-40 rounded-2xl overflow-hidden border-4 transition-all duration-300 ${ boss.isEnraged ? 'border-red-500' : 'border-purple-500' }`}>
                <img src={boss.image} alt={boss.name} className={`w-full h-full object-cover transition-all duration-300 ${ boss.isEnraged ? 'filter brightness-110 contrast-110' : '' }`} onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://placehold.co/400x400/1e293b/ffffff?text=Boss'; }} />
              </div>
              <div className="absolute -top-3 -right-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full px-3 py-1 flex items-center gap-1"><Crown className="w-4 h-4 text-yellow-400" /><span className="text-white font-bold text-sm">BOSS</span></div>
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2 justify-center">{boss.name}{boss.isEnraged && (<span className="text-red-400 text-lg animate-bounce">⚡</span>)}</h1>
              <p className="text-purple-300 text-sm mb-3">Phase {boss.phase} Boss</p>
              <div className="w-64">
                <div className="flex items-center justify-between mb-2"><span className="text-slate-300 text-sm">Health Points</span><span className="text-lg font-bold text-white">{boss.health.toLocaleString()} / {boss.maxHealth.toLocaleString()}</span></div>
                <div className="relative h-6 bg-slate-800 rounded-full overflow-hidden border-2 border-slate-600">
                  <div className={`absolute left-0 top-0 h-full transition-all duration-700 rounded-full ${ boss.isEnraged ? 'bg-gradient-to-r from-red-500 to-pink-500 shadow-lg shadow-red-400/50' : 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg shadow-purple-400/30' }`} style={{ width: `${bossHealthPercentage}%` }}/>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-full" />
                  <div className="absolute inset-0 flex items-center justify-center"><span className="text-white font-bold drop-shadow-lg text-sm">{Math.round(bossHealthPercentage)}%</span></div>
                </div>
              </div>
            </div>
          </div>
           {/* Details Button for Boss */}
          <button onClick={() => setDetailsCharacter(boss)} className="mt-4 w-full bg-slate-700/50 hover:bg-slate-600/70 text-slate-300 hover:text-white transition-colors text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-2"><BookOpen size={14} /> View Stats</button>
        </div>
        <div className="w-[500px] h-[380px] glass-card rounded-xl border-2 border-slate-600 shadow-2xl">
          <div className="h-full flex flex-col">
            <div className="bg-gradient-to-r from-purple-600 to-cyan-600 rounded-t-xl px-4 py-2 border-b border-slate-600"><h3 className="text-white font-bold text-center">Battle Chat</h3></div>
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
              {chatMessages.map((msg) => (<div key={msg.id} className={`flex flex-col text-sm ${ msg.type === 'damage' ? 'bg-red-900/30 rounded-lg p-2 border border-red-400/30' : msg.type === 'boss' ? 'bg-purple-900/30 rounded-lg p-2 border border-purple-400/30' : msg.type === 'attack' ? 'bg-orange-900/30 rounded-lg p-2 border border-orange-400/30' : 'bg-slate-800/30 rounded-lg p-2 border border-slate-600/30' }`}><div className="flex items-center justify-between"><span className={`font-bold ${ msg.type === 'damage' ? 'text-red-400' : msg.type === 'boss' ? 'text-purple-400' : msg.type === 'attack' ? 'text-orange-400' : msg.player === 'System' ? 'text-cyan-400' : players.find(p=>p.name === msg.player)?.isPlayer ? 'text-cyan-300' : 'text-green-400' }`}>{players.find(p=>p.name === msg.player)?.isPlayer ? `${msg.player} (YOU)` : msg.player}</span><span className="text-slate-500 text-xs">{msg.timestamp}</span></div><span className="text-slate-200 mt-1">{msg.message}</span></div>))}
            </div>
            <div className="border-t border-slate-600 p-3">
              <form className="flex gap-2" onSubmit={handleSendMessage}>
                <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder={gameState !== 'WAITING_FOR_ACTIONS' ? "Waiting for the next turn..." : hasSubmittedAction ? "Action locked. Waiting for others..." : "Describe your action..."} className="flex-1 bg-slate-800 text-white rounded-lg px-3 py-2 text-sm border border-slate-600 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 disabled:bg-slate-900 disabled:cursor-not-allowed" maxLength={200} disabled={isInputDisabled}/>
                <button type="submit" className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 hover:scale-105 disabled:bg-slate-700 disabled:from-slate-600 disabled:scale-100 disabled:cursor-not-allowed flex items-center gap-2" disabled={isInputDisabled}>{gameState === 'WAITING_FOR_ACTIONS' ? (hasSubmittedAction ? <><Check className="w-4 h-4" /> Locked In</> : "Send Action") : "Waiting..."}</button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center items-end gap-16 relative z-10">
        {players.map((player, index) => (
          <React.Fragment key={player.id}>
            <PlayerCard player={player} onShowDetails={setDetailsCharacter} />
            {index === 1 && (<div className="flex flex-col items-center mx-8">{gameState === 'IDLE' ? (<StartGameButton />) : (<><div className="w-2 h-24 bg-gradient-to-b from-cyan-500 via-purple-500 to-transparent rounded-full shadow-lg shadow-cyan-400/50" /><div className="text-transparent bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-lg font-bold mt-3">VS</div></>)}</div>)}
          </React.Fragment>
        ))}
        {players.length === 1 && gameState === 'IDLE' && (<div className="flex flex-col items-center mx-8"><StartGameButton /></div>)}
      </div>
      <style jsx>{`
        .cyber-grid { background-image: linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px); background-size: 50px 50px; animation: gridPulse 4s ease-in-out infinite; }
        @keyframes gridPulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.1; } }
        @keyframes bossFloat { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        .boss-float { animation: bossFloat 3s ease-in-out infinite; }
        .glass-card { background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.1); }
      `}</style>
    </div>
  );
};

export default ArenaUI;