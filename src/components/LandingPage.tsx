'use client';

import React, { useState, useEffect } from 'react';

interface Character {
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
    conditions: string[];
    signature_ability: {
      name: string;
      description: string;
      cooldown: number;
    };
  };
}

const AIBossBattle: React.FC = () => {
  const [character, setCharacter] = useState<Character | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    createParticles();
  }, []);

  const createParticles = () => {
    const particlesContainer = document.getElementById('particles');
    if (!particlesContainer) return;
    
    particlesContainer.innerHTML = '';
    for (let i = 0; i < 15; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.top = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 6 + 's';
      particle.style.animationDuration = (Math.random() * 3 + 3) + 's';
      particlesContainer.appendChild(particle);
    }
  };

  const generateCharacter = (name: string, description: string): Character => {
    const alignments = ['Heroic', 'Neutral', 'Chaotic', 'Lawful', 'Rebel'];
    const voices = ['Commanding', 'Mysterious', 'Cheerful', 'Gruff', 'Ethereal'];
    const personalities = ['Brave', 'Cunning', 'Wise', 'Reckless', 'Stoic'];
    const conditions = ['Blessed', 'Cursed', 'Enhanced', 'Weakened', 'Neutral'];
    
    const baseHealthPool = 400;
    const baseStatPool = 100;
    
    const stats = {
      max_health: Math.floor(Math.random() * 200) + baseHealthPool,
      speed: Math.floor(Math.random() * baseStatPool) + 50,
      attack: Math.floor(Math.random() * baseStatPool) + 50,
      defense: Math.floor(Math.random() * baseStatPool) + 50,
      luck: Math.floor(Math.random() * 50) + 25,
      intelligence: Math.floor(Math.random() * 50) + 25,
      agility: Math.floor(Math.random() * 50) + 25,
      endurance: Math.floor(Math.random() * 50) + 25
    };
    
    const abilities = [
      'Quick Strike', 'Energy Blast', 'Shield Wall', 'Stealth Mode',
      'Power Surge', 'Healing Aura', 'Time Dilation', 'Mind Control'
    ];
    
    const signatureAbilities = [
      { name: 'Ultimate Devastation', desc: 'Unleashes maximum power in a devastating attack' },
      { name: 'Reality Warp', desc: 'Bends the fabric of reality to the user\'s will' },
      { name: 'Phoenix Rise', desc: 'Resurrects with enhanced abilities after defeat' },
      { name: 'Dimensional Rift', desc: 'Opens portals to other dimensions for tactical advantage' }
    ];
    
    const selectedAbilities = [];
    for (let i = 0; i < 3; i++) {
      const randomAbility = abilities[Math.floor(Math.random() * abilities.length)];
      if (!selectedAbilities.includes(randomAbility)) {
        selectedAbilities.push(randomAbility);
      }
    }
    
    const sigAbility = signatureAbilities[Math.floor(Math.random() * signatureAbilities.length)];
    
    return {
      name,
      description,
      background_info: {
        backstory: `Born from ${description.toLowerCase()}, ${name} has risen to become a legendary warrior.`,
        personality: personalities[Math.floor(Math.random() * personalities.length)],
        voice: voices[Math.floor(Math.random() * voices.length)],
        alignment: alignments[Math.floor(Math.random() * alignments.length)]
      },
      game_stats: {
        base_stats: {
          general: {
            max_health: stats.max_health,
            speed: stats.speed,
            attack: stats.attack,
            defense: stats.defense
          },
          advanced: {
            luck: stats.luck,
            intelligence: stats.intelligence,
            agility: stats.agility,
            endurance: stats.endurance
          },
          total_stat_points: 500
        },
        abilities: selectedAbilities,
        conditions: [conditions[Math.floor(Math.random() * conditions.length)]],
        signature_ability: {
          name: sigAbility.name,
          description: sigAbility.desc,
          cooldown: Math.floor(Math.random() * 10) + 5
        }
      }
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.description) return;
    
    setIsGenerating(true);
    
    // Simulate generation time
    setTimeout(() => {
      const newCharacter = generateCharacter(formData.name, formData.description);
      setCharacter(newCharacter);
      setIsGenerating(false);
    }, 2000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const joinRoom = () => {
    alert('🎮 Connecting to existing battle room...\n\nThis feature would connect you to an ongoing battle!');
  };

  const createRoom = () => {
    alert('🚀 Creating new battle room...\n\nThis feature would set up a new arena for you to host!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black text-white overflow-hidden relative">
      <style jsx>{`
        .cyber-grid {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: 
            linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px);
          background-size: 50px 50px;
          animation: gridPulse 4s ease-in-out infinite;
          z-index: -2;
        }

        @keyframes gridPulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.1; }
        }

        @keyframes titleGlow {
          from { filter: brightness(1); }
          to { filter: brightness(1.2); }
        }

        @keyframes bossFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
          100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
            opacity: 1;
          }
          50% {
            transform: translateY(-100px) rotate(180deg);
            opacity: 0.5;
          }
        }

        .title-gradient {
          background: linear-gradient(45deg, #06b6d4, #8b5cf6, #ec4899);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: titleGlow 2s ease-in-out infinite alternate;
        }

        .boss-image {
          animation: bossFloat 3s ease-in-out infinite;
          position: relative;
          overflow: hidden;
        }

        .boss-image::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(45deg, transparent, rgba(139, 92, 246, 0.2), transparent);
          animation: shimmer 2s infinite;
        }

        .loading {
          display: inline-block;
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: #06b6d4;
          animation: spin 1s ease-in-out infinite;
        }

        .particle {
          position: absolute;
          width: 2px;
          height: 2px;
          background: #06b6d4;
          border-radius: 50%;
          animation: float 6s infinite;
        }

        .glass-card {
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
        }

        .glass-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(6, 182, 212, 0.1);
        }
      `}</style>

      {/* Cyber Grid Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-slate-900/20 to-black/20 z-0"></div>
      <div className="cyber-grid"></div>
      <div id="particles" className="fixed top-0 left-0 w-full h-full pointer-events-none z-[-1]"></div>

      <div className="container mx-auto px-4 py-4 max-w-7xl relative z-10">
        {/* Header */}
        <header className="text-center mb-6">
          <h1 className="text-4xl md:text-5xl font-black title-gradient mb-2">
            AI BOSS BATTLE
          </h1>
          <p className="text-lg text-slate-400 mb-4">
            Enter the Arena. Face the Machine. Prove Your Worth.
          </p>
        </header>

        {/* Top Section - Boss and Character Creation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Boss Section */}
          <div className="glass-card rounded-2xl p-5 shadow-2xl border-2 border-purple-500 shadow-purple-500/20">
            <h2 className="text-xl font-bold text-purple-300 text-center mb-3 relative">
              Current Boss
              <div className="absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 w-16 h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent"></div>
            </h2>
            <div className="boss-image w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto mb-3 flex items-center justify-center text-3xl shadow-lg shadow-purple-500/50">
              🤖
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-purple-300 mb-2">NEURAL TYRANT</h3>
              <p className="text-slate-300 text-xs mb-3 leading-relaxed">
                A rogue AI seeking digital dominance with neural networks spanning multiple dimensions.
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-800/50 p-2 rounded border-l-2 border-purple-400">
                  <span className="text-slate-300">Health: </span>
                  <span className="text-white font-bold">10,000</span>
                </div>
                <div className="bg-slate-800/50 p-2 rounded border-l-2 border-red-400">
                  <span className="text-slate-300">Attack: </span>
                  <span className="text-white font-bold">850</span>
                </div>
                <div className="bg-slate-800/50 p-2 rounded border-l-2 border-blue-400">
                  <span className="text-slate-300">Defense: </span>
                  <span className="text-white font-bold">750</span>
                </div>
                <div className="bg-slate-800/50 p-2 rounded border-l-2 border-yellow-400">
                  <span className="text-slate-300">Speed: </span>
                  <span className="text-white font-bold">600</span>
                </div>
              </div>
            </div>
          </div>

          {/* Character Creation */}
          <div className="glass-card rounded-2xl p-5 shadow-2xl border-2 border-cyan-400 shadow-cyan-400/20">
            <h2 className="text-xl font-bold text-cyan-300 text-center mb-3 relative">
              Create Character
              <div className="absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 w-16 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-cyan-300 font-semibold mb-1 text-sm">Character Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all text-sm"
                  placeholder="Enter your character's name"
                />
              </div>
              <div>
                <label className="block text-cyan-300 font-semibold mb-1 text-sm">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all resize-none h-16 text-sm"
                  placeholder="Describe your character"
                />
              </div>
              <button
                onClick={handleSubmit}
                disabled={isGenerating || !formData.name || !formData.description}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white py-2 px-4 rounded-lg font-bold uppercase tracking-wider hover:transform hover:-translate-y-1 hover:shadow-lg hover:shadow-cyan-500/30 transition-all disabled:opacity-50 text-sm"
              >
                {isGenerating ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="loading"></span>
                    Generating...
                  </span>
                ) : (
                  'Generate Character'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Section - Character Display and Battle Controls */}
        {character && (
          <div className="glass-card rounded-2xl p-5 shadow-2xl mb-4 border-2 border-slate-600">
            <h2 className="text-xl font-bold text-white text-center mb-4 relative">
              Your Character
              <div className="absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 w-16 h-0.5 bg-gradient-to-r from-transparent via-slate-400 to-transparent"></div>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              {/* Character Info */}
              <div className="space-y-3">
                <div className="text-center">
                  <h3 className="text-cyan-300 font-bold text-base">{character.name}</h3>
                  <p className="text-slate-300 text-xs mb-2">{character.description}</p>
                </div>
                
                <div>
                  <h4 className="text-purple-300 font-semibold mb-2 text-center">Background</h4>
                  <div className="space-y-1">
                    <div className="bg-slate-800/50 p-2 rounded">
                      <span className="text-slate-300">Personality: </span>
                      <span className="text-white">{character.background_info.personality}</span>
                    </div>
                    <div className="bg-slate-800/50 p-2 rounded">
                      <span className="text-slate-300">Voice: </span>
                      <span className="text-white">{character.background_info.voice}</span>
                    </div>
                    <div className="bg-slate-800/50 p-2 rounded">
                      <span className="text-slate-300">Alignment: </span>
                      <span className="text-white">{character.background_info.alignment}</span>
                    </div>
                    <div className="bg-slate-800/50 p-2 rounded">
                      <span className="text-slate-300">Condition: </span>
                      <span className="text-white">{character.game_stats.conditions[0]}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Base Stats */}
              <div>
                <h4 className="text-purple-300 font-semibold mb-2 text-center">Base Stats</h4>
                <div className="space-y-1">
                  <div className="bg-slate-800/50 p-2 rounded border-l-2 border-green-400">
                    <span className="text-slate-300">Health: </span>
                    <span className="text-white font-bold">{character.game_stats.base_stats.general.max_health}</span>
                  </div>
                  <div className="bg-slate-800/50 p-2 rounded border-l-2 border-red-400">
                    <span className="text-slate-300">Attack: </span>
                    <span className="text-white font-bold">{character.game_stats.base_stats.general.attack}</span>
                  </div>
                  <div className="bg-slate-800/50 p-2 rounded border-l-2 border-blue-400">
                    <span className="text-slate-300">Defense: </span>
                    <span className="text-white font-bold">{character.game_stats.base_stats.general.defense}</span>
                  </div>
                  <div className="bg-slate-800/50 p-2 rounded border-l-2 border-yellow-400">
                    <span className="text-slate-300">Speed: </span>
                    <span className="text-white font-bold">{character.game_stats.base_stats.general.speed}</span>
                  </div>
                </div>
              </div>
              
              {/* Advanced Stats */}
              <div>
                <h4 className="text-purple-300 font-semibold mb-2 text-center">Advanced Stats</h4>
                <div className="space-y-1">
                  <div className="bg-slate-800/50 p-2 rounded border-l-2 border-green-400">
                    <span className="text-slate-300">Luck: </span>
                    <span className="text-white font-bold">{character.game_stats.base_stats.advanced.luck}</span>
                  </div>
                  <div className="bg-slate-800/50 p-2 rounded border-l-2 border-purple-400">
                    <span className="text-slate-300">Intelligence: </span>
                    <span className="text-white font-bold">{character.game_stats.base_stats.advanced.intelligence}</span>
                  </div>
                  <div className="bg-slate-800/50 p-2 rounded border-l-2 border-orange-400">
                    <span className="text-slate-300">Agility: </span>
                    <span className="text-white font-bold">{character.game_stats.base_stats.advanced.agility}</span>
                  </div>
                  <div className="bg-slate-800/50 p-2 rounded border-l-2 border-pink-400">
                    <span className="text-slate-300">Endurance: </span>
                    <span className="text-white font-bold">{character.game_stats.base_stats.advanced.endurance}</span>
                  </div>
                </div>
              </div>
              
              {/* Abilities */}
              <div>
                <h4 className="text-purple-300 font-semibold mb-2 text-center">Abilities</h4>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1">
                    {character.game_stats.abilities.map((ability, index) => (
                      <span key={index} className="bg-cyan-400/20 text-cyan-300 px-2 py-1 rounded-full text-xs border border-cyan-400/30">
                        {ability}
                      </span>
                    ))}
                  </div>
                  
                  <div>
                    <h5 className="text-yellow-400 font-semibold text-center mb-1">Signature Ability</h5>
                    <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 p-2 rounded-lg border border-purple-400/30 text-center">
                      <div className="text-yellow-400 font-bold text-xs">{character.game_stats.signature_ability.name}</div>
                      <div className="text-xs text-slate-300">Cooldown: {character.game_stats.signature_ability.cooldown}s</div>
                      <div className="text-xs italic mt-1 text-slate-400">{character.game_stats.signature_ability.description}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Battle Controls */}
        <div className="glass-card rounded-2xl p-4 shadow-2xl border-2 border-slate-600">
          <h2 className="text-xl font-bold text-white text-center mb-3 relative">
            Ready to Battle?
            <div className="absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 w-16 h-0.5 bg-gradient-to-r from-transparent via-slate-400 to-transparent"></div>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
            <button
              onClick={joinRoom}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-2 px-4 rounded-lg font-bold uppercase tracking-wider hover:transform hover:-translate-y-1 hover:shadow-lg hover:shadow-green-500/30 transition-all text-sm"
            >
              Join Room
            </button>
            <button
              onClick={createRoom}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-2 px-4 rounded-lg font-bold uppercase tracking-wider hover:transform hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-500/30 transition-all text-sm"
            >
              Create Room
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIBossBattle;