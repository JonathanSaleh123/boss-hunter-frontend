"use client"
import React, { useState, useEffect, useRef } from 'react';
import { Crown, Check, BookOpen, LogOut, Music } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { Character, Boss, ChatMessage } from './arena/types';
import { CharacterDetailsModal } from './arena/CharacterDetailsModal';
import { PlayerCard } from './arena/PlayerCard';
import { GameStatusDisplay } from './arena/GameStatusDisplay';
import { GameOverModal } from './arena/GameOverModal'; // --- 1. IMPORT the new component

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
  const [detailsCharacter, setDetailsCharacter] = useState<Character | Boss | null>(null);

  const audioRef = useRef<HTMLAudioElement>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  
  // --- 2. ADD state for game over screen ---
  const [isGameOver, setIsGameOver] = useState(false);


  useEffect(() => {
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
    newSocket.on('player_joined', (newPlayer) => setPlayers(prev => [...prev, {...newPlayer, isPlayer: false}]));
    newSocket.on('player_left', (playerId) => setPlayers(prev => prev.filter(p => p.id !== playerId)));
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
    newSocket.on('new_message', (newMsg) => setChatMessages(prev => [...prev.slice(-19), newMsg]));

    // --- 3. LISTEN for the server's restart confirmation ---
    newSocket.on('game_restarted', () => {
      setIsGameOver(false);
      // The server will likely follow up with an 'initial_state' or 'update_game_state'
      // to provide the new data for the fresh game.
    });

    return () => newSocket.disconnect();
  }, []);

  // --- 4. USEEFFECT to check for the game over condition ---
  useEffect(() => {
    // Only check for game over if there are players and the game is not idle.
    if (players.length > 0 && gameState !== 'IDLE' && players.every(p => !p.isAlive)) {
      setIsGameOver(true);
    }
  }, [players, gameState]);
  
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = 0.1; 
      return () => {
        audio.pause();
      };
    }
  }, []);
  
  useEffect(() => {
    if (gameState === 'WAITING_FOR_ACTIONS') setHasSubmittedAction(false);
  }, [gameState]);

  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;
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
    if (socket) socket.emit('start_game');
  };

  const handleLeaveRoom = () => {
    window.location.href = '/';
  };
  
  // --- 5. FUNCTION to request a game restart ---
  const handleRestartGame = () => {
    //Reload the page to reset the game state
    window.location.reload();
  };

  const handleToggleMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isMusicPlaying) {
      audio.pause();
    } else {
      audio.play().catch(e => console.error("Audio play failed:", e));
    }
    setIsMusicPlaying(!isMusicPlaying);
  };

  if (!boss || players.length === 0) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black p-6 flex flex-col items-center justify-center text-white">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-cyan-500"></div>
            <h2 className="text-2xl font-bold mt-8">Connecting to the Arena...</h2>
        </div>
    );
  }

  const bossHealthPercentage = (boss.health / boss.maxHealth) * 100;
  const isInputDisabled = gameState !== 'WAITING_FOR_ACTIONS' || hasSubmittedAction;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black p-6 overflow-hidden relative">
      {/* --- 6. RENDER the modal when game is over --- */}
      {isGameOver && <GameOverModal onRestart={handleRestartGame} />}

      <audio ref={audioRef} src="/audio/hopes.mp3" loop />

      {detailsCharacter && <CharacterDetailsModal character={detailsCharacter} onClose={() => setDetailsCharacter(null)} />}
      
      <div className="absolute top-4 right-4 z-30 flex items-center gap-3">
        <button 
          onClick={handleToggleMusic}
          className="flex items-center gap-2 bg-cyan-800/50 hover:bg-cyan-700/70 text-cyan-300 hover:text-white transition-all text-sm font-bold px-4 py-2 rounded-lg"
        >
          <Music size={16} />
          {isMusicPlaying ? 'Mute' : 'Play Music'}
        </button>

        <button 
          onClick={handleLeaveRoom}
          className="flex items-center gap-2 bg-red-800/50 hover:bg-red-700/70 text-red-300 hover:text-white transition-all text-sm font-bold px-4 py-2 rounded-lg"
        >
          <LogOut size={16} />
          Leave Room
        </button>
      </div>

      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
          {gameState !== 'IDLE' && <GameStatusDisplay gameState={gameState} timer={timer} onStartGame={handleStartGame} />}
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-slate-900/20 to-black/20 z-0"></div>
      <div className="absolute inset-0 cyber-grid z-0"></div>
      <div className={`flex justify-center gap-8 mb-8 relative z-10 mt-24 transition-filter duration-500 ${isGameOver ? 'blur-md' : ''}`}>
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
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-full" /><div className="absolute inset-0 flex items-center justify-center"><span className="text-white font-bold drop-shadow-lg text-sm">{Math.round(bossHealthPercentage)}%</span></div>
                </div>
              </div>
            </div>
          </div>
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
                <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder={gameState !== 'WAITING_FOR_ACTIONS' ? "Waiting..." : hasSubmittedAction ? "Action locked..." : "Describe your action..."} className="flex-1 bg-slate-800 text-white rounded-lg px-3 py-2 text-sm border border-slate-600 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 disabled:bg-slate-900 disabled:cursor-not-allowed" maxLength={200} disabled={isInputDisabled}/>
                <button type="submit" className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 hover:scale-105 disabled:bg-slate-700 disabled:from-slate-600 disabled:scale-100 disabled:cursor-not-allowed flex items-center gap-2" disabled={isInputDisabled}>{gameState === 'WAITING_FOR_ACTIONS' ? (hasSubmittedAction ? <><Check className="w-4 h-4" /> Locked In</> : "Send Action") : "Waiting..."}</button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div className={`flex justify-center items-end gap-16 relative z-10 transition-filter duration-500 ${isGameOver ? 'blur-md' : ''}`}>
        {players.map((player, index) => (<React.Fragment key={player.id}><PlayerCard player={player} onShowDetails={setDetailsCharacter} playerIndex={index} />{index === 1 && (<div className="flex flex-col items-center mx-8">{<GameStatusDisplay gameState={gameState} timer={timer} onStartGame={handleStartGame}/>}</div>)}</React.Fragment>))}
        {players.length === 1 && (<div className="flex flex-col items-center mx-8"><GameStatusDisplay gameState={gameState} timer={timer} onStartGame={handleStartGame} /></div>)}
      </div>
      <style jsx>{`.cyber-grid { background-image: linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px); background-size: 50px 50px; } .glass-card { background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.1); }`}</style>
    </div>
  );
};

export default ArenaUI;