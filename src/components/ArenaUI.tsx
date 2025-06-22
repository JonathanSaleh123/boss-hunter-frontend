"use client"
import React, { useState, useEffect, useRef } from 'react';
import { Sword, Shield, Heart, Skull, Crown, User } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

// --- Interfaces for Game State (Matching the Server) ---
interface Character {
  id: string; // Socket ID
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
  // Gameplay-specific state added by the server
  health: number;
  maxHealth: number;
  class: string;
  image: string;
  isAlive: boolean;
  isPlayer: boolean;
}

interface Boss extends Omit<Character, 'id' | 'isPlayer' | 'class'> {
    // Gameplay-specific state for the boss
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

// This is the character object created on the previous page.
// In a real app, you would get this from router state (e.g., useLocation().state)
const characterFromPrevPage = {
    name: 'Sir Gareth',
    description: 'A valiant knight sworn to protect the innocent.',
    background_info: {
        backstory: 'Born to a noble family, he forsook a life of luxury to defend the weak.',
        personality: 'Paladin',
        voice: 'Commanding',
        alignment: 'Lawful Good',
    },
    game_stats: {
        base_stats: {
            general: { max_health: 120, speed: 50, attack: 80, defense: 90 },
            advanced: { luck: 20, intelligence: 30, agility: 40, endurance: 60 },
            total_stat_points: 500,
        },
        abilities: ["Holy Strike", "Divine Shield", "Lay on Hands"],
    }
};


const ArenaUI = () => {
  // Game state, now managed by the server
  const [players, setPlayers] = useState<Character[]>([]);
  const [boss, setBoss] = useState<Boss | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // --- Socket.IO Connection ---
  useEffect(() => {

    const storedCharacterJSON = sessionStorage.getItem('character');
    if (!storedCharacterJSON) {
        // Handle case where no character is found, maybe redirect back
        alert("No character found! Redirecting to character creation.");
        window.location.href = '/'; // Or use router.push('/') if you pass it
        return;
    }
    const characterFromPrevPage = JSON.parse(storedCharacterJSON);

    // Connect to the server
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    // Join the room with the character data
    newSocket.emit('join_room', characterFromPrevPage);

    // Listener for the initial game state when joining
    newSocket.on('initial_state', ({ players, boss }) => {
        const currentPlayerId = newSocket.id;
        const updatedPlayers = players.map(p => ({...p, isPlayer: p.id === currentPlayerId}));
        setPlayers(updatedPlayers);
        setBoss(boss);
    });

    // Listener for when another player joins
    newSocket.on('player_joined', (newPlayer) => {
        setPlayers(prev => [...prev, {...newPlayer, isPlayer: false}]);
    });
    
    // Listener for when another player leaves
    newSocket.on('player_left', (playerId) => {
        setPlayers(prev => prev.filter(p => p.id !== playerId));
    });

    // Listener for real-time game state updates
    newSocket.on('update_game_state', ({ players, boss }) => {
        const currentPlayerId = newSocket.id;
        const updatedPlayers = players.map(p => ({...p, isPlayer: p.id === currentPlayerId}));
        setPlayers(updatedPlayers);
        setBoss(boss);
    });

    // Listener for new chat messages
    newSocket.on('new_message', (newMsg) => {
        setChatMessages(prev => [...prev.slice(-19), newMsg]); // Keep last 20 messages
    });

    // Disconnect on component unmount
    return () => {
      newSocket.disconnect();
    };
  }, []);
  
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && socket) {
      socket.emit('send_message', newMessage.trim());
      setNewMessage('');
    }
  };

  // --- UI Rendering Functions ---
  const getHealthColor = (health, maxHealth) => {
    const percentage = (health / maxHealth) * 100;
    if (percentage > 60) return 'bg-gradient-to-r from-cyan-400 to-green-400';
    if (percentage > 30) return 'bg-gradient-to-r from-yellow-400 to-orange-400';
    if (percentage > 15) return 'bg-gradient-to-r from-orange-400 to-red-400';
    return 'bg-gradient-to-r from-red-500 to-pink-500';
  };

  const getHealthGlow = (health, maxHealth) => {
    const percentage = (health / maxHealth) * 100;
    if (percentage > 60) return 'shadow-cyan-400/50';
    if (percentage > 30) return 'shadow-yellow-400/50';
    if (percentage > 15) return 'shadow-orange-400/50';
    return 'shadow-red-400/50';
  };

const PlayerCard = ({ player, position }) => {
    const healthPercentage = (player.health / player.maxHealth) * 100;
    
    return (
      <div className={`relative flex flex-col items-center transition-all duration-300`}>
        <div className={`relative w-56 rounded-2xl p-5 border-2 shadow-2xl transition-all duration-300 glass-card ${
          player.isPlayer 
            ? 'border-cyan-400 shadow-cyan-400/50 ring-2 ring-cyan-400/30 scale-105' 
            : player.isAlive 
              ? 'border-slate-600 hover:border-purple-400 hover:scale-105' 
              : 'border-red-500 opacity-60'
        }`}>
          {!player.isAlive && (
            <div className="absolute inset-0 bg-black/70 rounded-2xl flex items-center justify-center z-10">
              <Skull className="w-12 h-12 text-red-400" />
            </div>
          )}
          <div className="relative mb-4">
            {/* MODIFIED LINE: Added mx-auto to center the image container */}
            <div className={`w-36 h-44 rounded-xl overflow-hidden border-2 ${ player.isPlayer ? 'border-cyan-400' : 'border-slate-600' } bg-slate-800 mx-auto`}>
              <img src={player.image} alt={player.name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = 'https://placehold.co/200x300/1e293b/ffffff?text=Char'; }} />
            </div>
            <div className={`absolute -top-2 -right-2 rounded-full w-7 h-7 flex items-center justify-center ${ player.isPlayer ? 'bg-gradient-to-r from-cyan-500 to-blue-500 ring-2 ring-cyan-300' : 'bg-gradient-to-r from-purple-500 to-pink-500' }`}>
              {player.isPlayer ? <User className="w-4 h-4 text-white" /> : <span className="text-white text-xs font-bold">{players.findIndex(p => p.id === player.id) + 1}</span> }
            </div>
            {player.isPlayer && (<div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold">YOU</div>)}
          </div>
          <div className="text-center mb-4">
            {/* MODIFIED LINE: Added truncate to prevent name overflow */}
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
      </div>
    );
  };
  
  if (!boss || players.length === 0) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black p-6 flex flex-col items-center justify-center text-white">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-cyan-500"></div>
            <h2 className="text-2xl font-bold mt-8">Connecting to the Arena...</h2>
            <p className="text-slate-400">Please wait while we find a battle for you.</p>
        </div>
    )
  }

  const bossHealthPercentage = (boss.health / boss.maxHealth) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black p-6 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-slate-900/20 to-black/20 z-0"></div>
      <div className="absolute inset-0 cyber-grid z-0"></div>
      <div className="flex justify-center gap-8 mb-8 relative z-10">
        <div className={`relative glass-card rounded-3xl p-6 border-2 transition-all duration-500 shadow-2xl ${ boss.isEnraged ? 'border-red-500 shadow-red-500/30 animate-pulse' : 'border-purple-500 shadow-purple-500/20' }`}>
          <div className="flex flex-col items-center gap-4 mb-4">
            <div className="relative boss-float">
              <div className={`w-40 h-40 rounded-2xl overflow-hidden border-4 transition-all duration-300 ${ boss.isEnraged ? 'border-red-500' : 'border-purple-500' }`}>
                <img src={boss.image} alt={boss.name} className={`w-full h-full object-cover transition-all duration-300 ${ boss.isEnraged ? 'filter brightness-110 contrast-110' : '' }`} onError={(e) => { e.currentTarget.src = 'https://placehold.co/400x400/1e293b/ffffff?text=Boss'; }} />
              </div>
              <div className="absolute -top-3 -right-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full px-3 py-1 flex items-center gap-1">
                <Crown className="w-4 h-4 text-yellow-400" /><span className="text-white font-bold text-sm">BOSS</span>
              </div>
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2 justify-center">{boss.name}{boss.isEnraged && (<span className="text-red-400 text-lg animate-bounce">⚡</span>)}</h1>
              <p className="text-purple-300 text-sm mb-3">Phase {boss.phase} Boss</p>
              <div className="w-64">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-300 text-sm">Health Points</span>
                  <span className="text-lg font-bold text-white">{boss.health.toLocaleString()} / {boss.maxHealth.toLocaleString()}</span>
                </div>
                <div className="relative h-6 bg-slate-800 rounded-full overflow-hidden border-2 border-slate-600">
                  <div className={`absolute left-0 top-0 h-full transition-all duration-700 rounded-full ${ boss.isEnraged ? 'bg-gradient-to-r from-red-500 to-pink-500 shadow-lg shadow-red-400/50' : 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg shadow-purple-400/30' }`} style={{ width: `${bossHealthPercentage}%` }}/>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-full" />
                  <div className="absolute inset-0 flex items-center justify-center"><span className="text-white font-bold drop-shadow-lg text-sm">{Math.round(bossHealthPercentage)}%</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="w-[500px] h-[380px] glass-card rounded-xl border-2 border-slate-600 shadow-2xl">
          <div className="h-full flex flex-col">
            <div className="bg-gradient-to-r from-purple-600 to-cyan-600 rounded-t-xl px-4 py-2 border-b border-slate-600"><h3 className="text-white font-bold text-center">Battle Chat</h3></div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
              {chatMessages.map((msg) => (
                <div key={msg.id} className={`flex flex-col text-sm ${ msg.type === 'damage' ? 'bg-red-900/30 rounded-lg p-2 border border-red-400/30' : msg.type === 'boss' ? 'bg-purple-900/30 rounded-lg p-2 border border-purple-400/30' : msg.type === 'attack' ? 'bg-orange-900/30 rounded-lg p-2 border border-orange-400/30' : 'bg-slate-800/30 rounded-lg p-2 border border-slate-600/30' }`}>
                  <div className="flex items-center justify-between">
                    <span className={`font-bold ${ msg.type === 'damage' ? 'text-red-400' : msg.type === 'boss' ? 'text-purple-400' : msg.type === 'attack' ? 'text-orange-400' : msg.player === 'System' ? 'text-cyan-400' : players.find(p=>p.name === msg.player)?.isPlayer ? 'text-cyan-300' : 'text-green-400' }`}>
                      {players.find(p=>p.name === msg.player)?.isPlayer ? `${msg.player} (YOU)` : msg.player}
                    </span>
                    <span className="text-slate-500 text-xs">{msg.timestamp}</span>
                  </div>
                  <span className="text-slate-200 mt-1">{msg.message}</span>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className="border-t border-slate-600 p-3">
              <form className="flex gap-2" onSubmit={handleSendMessage}>
                <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Describe your action..." className="flex-1 bg-slate-800 text-white rounded-lg px-3 py-2 text-sm border border-slate-600 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20" maxLength={200}/>
                <button type="submit" className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 hover:scale-105">Send</button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-center items-end gap-16 relative z-10">
        {players.map((player, index) => (
          <React.Fragment key={player.id}>
            <PlayerCard player={player} />
            {index === 1 && (
                <div className="flex flex-col items-center mx-8">
                    <div className="w-2 h-24 bg-gradient-to-b from-cyan-500 via-purple-500 to-transparent rounded-full shadow-lg shadow-cyan-400/50" />
                    <div className="text-transparent bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-lg font-bold mt-3">VS</div>
                </div>
            )}
          </React.Fragment>
        ))}
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