"use client"
import React, { useState, useEffect } from 'react';
import { Sword, Shield, Heart, Skull, Crown, User } from 'lucide-react';

const ArenaUI = () => {
  // Game state
  const [players, setPlayers] = useState([
    { 
      id: 1, 
      name: 'Sir Gareth', 
      health: 85, 
      maxHealth: 100, 
      image: 'https://picsum.photos/200/300?random=1',
      class: 'Paladin', 
      isAlive: true,
      isPlayer: true // This is our hero
    },
    { 
      id: 2, 
      name: 'Mystral', 
      health: 62, 
      maxHealth: 80, 
      image: 'https://picsum.photos/200/300?random=2',
      class: 'Mage', 
      isAlive: true,
      isPlayer: false 
    },
    { 
      id: 3, 
      name: 'Ranger Kael', 
      health: 91, 
      maxHealth: 90, 
      image: 'https://picsum.photos/200/300?random=3',
      class: 'Archer', 
      isAlive: true,
      isPlayer: false 
    },
    { 
      id: 4, 
      name: 'Luna', 
      health: 45, 
      maxHealth: 75, 
      image: 'https://picsum.photos/200/300?random=4',
      class: 'Cleric', 
      isAlive: true,
      isPlayer: false 
    }
  ]);

  const [boss, setBoss] = useState({
    name: 'Ancient Shadow Drake',
    health: 2847,
    maxHealth: 3500,
    image: 'https://picsum.photos/400/400?random=10',
    isEnraged: false,
    phase: 1
  });

  const [chatMessages, setChatMessages] = useState([
    { id: 1, player: 'Sir Gareth', message: 'Raising shield and taunting the dragon!', type: 'action', timestamp: '12:34' },
    { id: 2, player: 'Mystral', message: 'Casting Fireball at the Shadow Drake!', type: 'attack', timestamp: '12:34' },
    { id: 3, player: 'System', message: 'Mystral deals 85 fire damage!', type: 'damage', timestamp: '12:34' },
    { id: 4, player: 'Ancient Shadow Drake', message: 'The dragon roars and breathes shadow fire!', type: 'boss', timestamp: '12:35' },
    { id: 5, player: 'Ranger Kael', message: 'Quick shot with poison arrow!', type: 'attack', timestamp: '12:35' },
    { id: 6, player: 'Luna', message: 'Healing Sir Gareth with divine light', type: 'action', timestamp: '12:36' }
  ]);

  const [newMessage, setNewMessage] = useState('');

  // Health bar color logic
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

  // Add new chat message
  const addChatMessage = (message, player = 'You', type = 'action') => {
    const newMsg = {
      id: Date.now(),
      player,
      message,
      type,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages(prev => [...prev.slice(-19), newMsg]); // Keep last 20 messages
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      addChatMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  // Demo damage simulation with chat messages
  useEffect(() => {
    const interval = setInterval(() => {
      // Random damage to players
      setPlayers(prev => prev.map(player => {
        if (Math.random() > 0.85 && player.isAlive) {
          const damage = Math.floor(Math.random() * 15) + 5;
          const newHealth = Math.max(0, player.health - damage);
          if (damage > 0) {
            setTimeout(() => {
              addChatMessage(
                `${player.name} takes ${damage} damage!`, 
                'System', 
                'damage'
              );
            }, 500);
          }
          return { ...player, health: newHealth, isAlive: newHealth > 0 };
        }
        return player;
      }));

      // Damage to boss
      setBoss(prev => {
        if (Math.random() > 0.75) {
          const damage = Math.floor(Math.random() * 120) + 50;
          const newHealth = Math.max(0, prev.health - damage);
          if (damage > 0) {
            setTimeout(() => {
              addChatMessage(
                `Shadow Drake takes ${damage} damage!`, 
                'System', 
                'damage'
              );
            }, 300);
          }
          return { 
            ...prev, 
            health: newHealth, 
            isEnraged: newHealth < prev.maxHealth * 0.3,
            phase: newHealth < prev.maxHealth * 0.5 ? 2 : 1
          };
        }
        return prev;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const PlayerCard = ({ player, position }) => {
    const healthPercentage = (player.health / player.maxHealth) * 100;
    
    return (
      <div className={`relative flex flex-col items-center transition-all duration-300 ${
        position === 'left' ? 'transform -rotate-6' : 
        position === 'right' ? 'transform rotate-6' : ''
      }`}>
        <div className={`relative rounded-2xl p-5 border-2 shadow-2xl transition-all duration-300 glass-card ${
          player.isPlayer 
            ? 'border-cyan-400 shadow-cyan-400/50 ring-2 ring-cyan-400/30 hover:scale-105' 
            : player.isAlive 
              ? 'border-slate-600 hover:border-purple-400 hover:scale-105' 
              : 'border-red-500 opacity-60'
        }`}>
          {!player.isAlive && (
            <div className="absolute inset-0 bg-black/70 rounded-2xl flex items-center justify-center z-10">
              <Skull className="w-12 h-12 text-red-400" />
            </div>
          )}
          
          {/* Character Portrait */}
          <div className="relative mb-4">
            <div className={`w-36 h-44 rounded-xl overflow-hidden border-2 ${
              player.isPlayer ? 'border-cyan-400' : 'border-slate-600'
            } bg-slate-800`}>
              <img 
                src={player.image} 
                alt={player.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="w-full h-full bg-slate-800 items-center justify-center text-4xl hidden">
                🛡️
              </div>
            </div>
            
            {/* Player indicator */}
            <div className={`absolute -top-2 -right-2 rounded-full w-7 h-7 flex items-center justify-center ${
              player.isPlayer 
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 ring-2 ring-cyan-300' 
                : 'bg-gradient-to-r from-purple-500 to-pink-500'
            }`}>
              {player.isPlayer ? (
                <User className="w-4 h-4 text-white" />
              ) : (
                <span className="text-white text-xs font-bold">{player.id}</span>
              )}
            </div>

            {/* YOU label for player */}
            {player.isPlayer && (
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                YOU
              </div>
            )}
          </div>

          {/* Player Info */}
          <div className="text-center mb-4">
            <h3 className={`font-bold text-lg ${player.isPlayer ? 'text-cyan-300' : 'text-white'}`}>
              {player.name}
            </h3>
            <p className={`text-sm ${player.isPlayer ? 'text-cyan-400' : 'text-slate-400'}`}>
              {player.class}
            </p>
          </div>

          {/* Health Bar */}
          <div className="w-full">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4 text-red-400" />
                <span className="text-xs text-slate-300">HP</span>
              </div>
              <span className="text-xs text-slate-300">
                {player.health}/{player.maxHealth}
              </span>
            </div>
            
            <div className="relative h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-600">
              <div 
                className={`absolute left-0 top-0 h-full transition-all duration-500 rounded-full ${getHealthColor(player.health, player.maxHealth)} shadow-md ${getHealthGlow(player.health, player.maxHealth)}`}
                style={{ width: `${healthPercentage}%` }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const bossHealthPercentage = (boss.health / boss.maxHealth) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black p-6 overflow-hidden relative">
      {/* Cyber Grid Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-slate-900/20 to-black/20 z-0"></div>
      <div className="absolute inset-0 cyber-grid z-0"></div>
      
      {/* Boss and Chat Side by Side */}
      <div className="flex justify-center gap-8 mb-8 relative z-10">
        {/* Boss Section */}
        <div className={`relative glass-card rounded-3xl p-6 border-2 transition-all duration-500 shadow-2xl ${
          boss.isEnraged 
            ? 'border-red-500 shadow-red-500/30 animate-pulse' 
            : 'border-purple-500 shadow-purple-500/20'
        }`}>
          {/* Boss Portrait */}
          <div className="flex flex-col items-center gap-4 mb-4">
            <div className="relative boss-float">
              <div className={`w-40 h-40 rounded-2xl overflow-hidden border-4 transition-all duration-300 ${
                boss.isEnraged ? 'border-red-500' : 'border-purple-500'
              }`}>
                <img 
                  src={boss.image} 
                  alt={boss.name}
                  className={`w-full h-full object-cover transition-all duration-300 ${
                    boss.isEnraged ? 'filter brightness-110 contrast-110' : ''
                  }`}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="w-full h-full bg-slate-800 items-center justify-center text-6xl hidden">
                  🐉
                </div>
              </div>
              <div className="absolute -top-3 -right-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full px-3 py-1 flex items-center gap-1">
                <Crown className="w-4 h-4 text-yellow-400" />
                <span className="text-white font-bold text-sm">BOSS</span>
              </div>
            </div>
            
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2 justify-center">
                {boss.name}
                {boss.isEnraged && (
                  <span className="text-red-400 text-lg animate-bounce">⚡</span>
                )}
              </h1>
              <p className="text-purple-300 text-sm mb-3">Phase {boss.phase} Boss</p>
              
              {/* Boss Health */}
              <div className="w-64">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-300 text-sm">Health Points</span>
                  <span className="text-lg font-bold text-white">
                    {boss.health.toLocaleString()} / {boss.maxHealth.toLocaleString()}
                  </span>
                </div>
                
                <div className="relative h-6 bg-slate-800 rounded-full overflow-hidden border-2 border-slate-600">
                  <div 
                    className={`absolute left-0 top-0 h-full transition-all duration-700 rounded-full ${
                      boss.isEnraged 
                        ? 'bg-gradient-to-r from-red-500 to-pink-500 shadow-lg shadow-red-400/50' 
                        : 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg shadow-purple-400/30'
                    }`}
                    style={{ width: `${bossHealthPercentage}%` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-full" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white font-bold drop-shadow-lg text-sm">
                      {Math.round(bossHealthPercentage)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Battle Chat */}
        <div className="w-[500px] h-[380px] glass-card rounded-xl border-2 border-slate-600 shadow-2xl">
          <div className="h-full flex flex-col">
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-purple-600 to-cyan-600 rounded-t-xl px-4 py-2 border-b border-slate-600">
              <h3 className="text-white font-bold text-center">Battle Chat</h3>
            </div>
            
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
              {chatMessages.map((msg) => (
                <div key={msg.id} className={`flex flex-col text-sm ${
                  msg.type === 'damage' ? 'bg-red-900/30 rounded-lg p-2 border border-red-400/30' :
                  msg.type === 'boss' ? 'bg-purple-900/30 rounded-lg p-2 border border-purple-400/30' :
                  msg.type === 'attack' ? 'bg-orange-900/30 rounded-lg p-2 border border-orange-400/30' :
                  'bg-slate-800/30 rounded-lg p-2 border border-slate-600/30'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className={`font-bold ${
                      msg.type === 'damage' ? 'text-red-400' :
                      msg.type === 'boss' ? 'text-purple-400' :
                      msg.type === 'attack' ? 'text-orange-400' :
                      msg.player === 'System' ? 'text-cyan-400' :
                      msg.player === 'Sir Gareth' ? 'text-cyan-300' :
                      'text-green-400'
                    }`}>
                      {msg.player === 'Sir Gareth' ? 'Sir Gareth (YOU)' : msg.player}
                    </span>
                    <span className="text-slate-500 text-xs">{msg.timestamp}</span>
                  </div>
                  <span className="text-slate-200 mt-1">{msg.message}</span>
                </div>
              ))}
            </div>
            
            {/* Input Area */}
            <div className="border-t border-slate-600 p-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(e)}
                  placeholder="Describe your action..."
                  className="flex-1 bg-slate-800 text-white rounded-lg px-3 py-2 text-sm border border-slate-600 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                  maxLength={200}
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 hover:scale-105"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Players Formation - More spaced out */}
      <div className="flex justify-center items-end gap-16 relative z-10">
        {/* Left Side Players */}
        <div className="flex gap-10">
          <PlayerCard player={players[0]} position="left" />
          <PlayerCard player={players[1]} position="center-left" />
        </div>
        
        {/* Center Divider */}
        <div className="flex flex-col items-center mx-8">
          <div className="w-2 h-24 bg-gradient-to-b from-cyan-500 via-purple-500 to-transparent rounded-full shadow-lg shadow-cyan-400/50" />
          <div className="text-transparent bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-lg font-bold mt-3">VS</div>
        </div>
        
        {/* Right Side Players */}
        <div className="flex gap-10">
          <PlayerCard player={players[2]} position="center-right" />
          <PlayerCard player={players[3]} position="right" />
        </div>
      </div>

      <style jsx>{`
        .cyber-grid {
          background-image: 
            linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px);
          background-size: 50px 50px;
          animation: gridPulse 4s ease-in-out infinite;
        }

        @keyframes gridPulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.1; }
        }

        @keyframes bossFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        .boss-float {
          animation: bossFloat 3s ease-in-out infinite;
        }

        .glass-card {
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
};

export default ArenaUI;