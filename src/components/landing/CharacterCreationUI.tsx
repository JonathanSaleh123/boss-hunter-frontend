'use client';

import React from 'react';

// The new Ability interface
interface Ability {
  name: string;
  type: "Passive" | "Buff" | "Attack" | string;
  description: string;
  cooldown: number | null; // null if passive or no cooldown
}

// The character interface, updated to use the Ability interface and include statusEffects
interface Character {
  name: string;
  description: string;
  imageUrl?: string;
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
    abilities: Ability[]; // Updated from string[]
  };
}

// Define the props that the UI component will accept
interface AIBossBattleUIProps {
  character: Character | null;
  isGenerating: boolean;
  isGeneratingImage: boolean;
  error: string | null;
  formData: { name: string; description: string };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  handleGenerateImage: () => void;
  joinRoom: () => void;
  createRoom: () => void;
  isEditing: boolean;
  editableCharacter: Character | null;
  handleEditClick: () => void;
  handleCancelEdit: () => void;
  handleSaveEdit: () => void;
  handleStatChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const StatInput = ({ label, name, value, onChange, colorClass }) => (
    <div className={`bg-slate-800/50 p-2 rounded border-l-2 ${colorClass} flex justify-between items-center`}>
      <label className="text-slate-300 text-xs">{label}: </label>
      <input
        type="number"
        name={name}
        value={value}
        onChange={onChange}
        className="bg-slate-900 text-white font-bold w-16 text-right p-1 rounded"
      />
    </div>
);


const AIBossBattleUI: React.FC<AIBossBattleUIProps> = ({
  character,
  isGenerating,
  isGeneratingImage,
  error,
  formData,
  handleInputChange,
  handleSubmit,
  handleGenerateImage,
  joinRoom,
  createRoom,
  isEditing,
  editableCharacter,
  handleEditClick,
  handleCancelEdit,
  handleSaveEdit,
  handleStatChange,
}) => {
  const currentCharacter = isEditing ? editableCharacter : character;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black text-white overflow-hidden relative">
        <style jsx>{`
        /* ... existing styles ... */
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
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-slate-900/20 to-black/20 z-0"></div>
      <div className="cyber-grid"></div>
      <div id="particles" className="fixed top-0 left-0 w-full h-full pointer-events-none z-[-1]"></div>
      <div className="container mx-auto px-4 py-4 max-w-7xl relative z-10">
        <header className="text-center mb-6">
          <h1 className="text-4xl md:text-5xl font-black title-gradient mb-2">
            Boss.AI
          </h1>
          <p className="text-lg text-slate-400 mb-4">
            Enter the Arena. Face the Machine. Prove Your Worth.
          </p>
        </header>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="glass-card rounded-2xl p-5 shadow-2xl border-2 border-purple-500 shadow-purple-500/20">
            <h2 className="text-xl font-bold text-purple-300 text-center mb-3 relative">
              Current Boss
              <div className="absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 w-16 h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent"></div>
            </h2>
            <div className="boss-image w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto mb-3 flex items-center justify-center text-3xl shadow-lg shadow-purple-500/50 overflow-hidden">
              <img src="https://oaidalleapiprodscus.blob.core.windows.net/private/org-wjzyvmRjFIezvYsgRjuutE6i/user-hrHYhNiVUGGPGrx0EvJQka6T/img-0UXwWkrcWTbfTc7PuRDmysAw.png?st=2025-06-22T18%3A42%3A50Z&se=2025-06-22T20%3A42%3A50Z&sp=r&sv=2024-08-04&sr=b&rscd=inline&rsct=image/png&skoid=8b33a531-2df9-46a3-bc02-d4b1430a422c&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-06-22T05%3A56%3A16Z&ske=2025-06-23T05%3A56%3A16Z&sks=b&skv=2024-08-04&sig=aOLc1sYp1qsY0XziGwv4dfDKuj//zUlMthoNe/ctCFI%3D" alt="Ancient Shadow Drake" className="w-full h-full object-cover" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-purple-300 mb-2">Ancient Shadow Drake</h3>
              <p className="text-slate-300 text-xs mb-3 leading-relaxed">
                A primordial beast of shadow and fury, awakened from a slumber of eons.
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-800/50 p-2 rounded border-l-2 border-purple-400">
                  <span className="text-slate-300">Health: </span>
                  <span className="text-white font-bold">3500</span>
                </div>
                <div className="bg-slate-800/50 p-2 rounded border-l-2 border-red-400">
                  <span className="text-slate-300">Attack: </span>
                  <span className="text-white font-bold">100</span>
                </div>
                <div className="bg-slate-800/50 p-2 rounded border-l-2 border-blue-400">
                  <span className="text-slate-300">Defense: </span>
                  <span className="text-white font-bold">80</span>
                </div>
                <div className="bg-slate-800/50 p-2 rounded border-l-2 border-yellow-400">
                  <span className="text-slate-300">Speed: </span>
                  <span className="text-white font-bold">120</span>
                </div>
              </div>
            </div>
          </div>
          <div className="glass-card rounded-2xl p-5 shadow-2xl border-2 border-cyan-400 shadow-cyan-400/20">
            <h2 className="text-xl font-bold text-cyan-300 text-center mb-3 relative">
              Create Character
              <div className="absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 w-16 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-cyan-300 font-semibold mb-1 text-sm">Character Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all text-sm"
                  placeholder="Enter your character's name"
                  disabled={isEditing}
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
                  disabled={isEditing}
                />
              </div>
              <button
                type="submit"
                disabled={isGenerating || !formData.name || !formData.description || isEditing}
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
            </form>
          </div>
        </div>
        {error && (
            <div className="glass-card rounded-2xl p-5 shadow-2xl mb-4 border-2 border-red-500 text-center">
                <p className="text-red-400">{error}</p>
            </div>
        )}
        {currentCharacter && (
          <div className="glass-card rounded-2xl p-5 shadow-2xl mb-4 border-2 border-slate-600">
             <div className="flex justify-between items-center mb-4">
               <h2 className="text-xl font-bold text-white text-center relative">
                 Your Character
               </h2>
               {!isEditing ? (
                 <button
                   onClick={handleEditClick}
                   className="bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded-lg font-bold text-xs uppercase"
                 >
                   Edit Stats
                 </button>
               ) : (
                 <div className="flex gap-2">
                   <button
                     onClick={handleSaveEdit}
                     className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded-lg font-bold text-xs uppercase"
                   >
                     Save
                   </button>
                   <button
                     onClick={handleCancelEdit}
                     className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-lg font-bold text-xs uppercase"
                   >
                     Cancel
                   </button>
                 </div>
               )}
             </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="md:col-span-1 flex flex-col items-center space-y-4">
                  <div className="w-full aspect-square bg-slate-800/50 rounded-lg flex items-center justify-center border border-slate-700">
                      {character.imageUrl ? (
                          <img src={character.imageUrl} alt={`Image of ${character.name}`} className="w-full h-full object-cover rounded-lg"/>
                      ) : isGeneratingImage ? (
                          <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                              <span className="loading"></span>
                              <span>Generating...</span>
                          </div>
                      ) : (
                          <div className="text-center text-slate-400 p-4 text-sm">
                              Your character portrait will appear here.
                          </div>
                      )}
                  </div>
                  <button
                    onClick={handleGenerateImage}
                    disabled={isGeneratingImage || isGenerating || isEditing}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-2 px-4 rounded-lg font-bold uppercase tracking-wider hover:transform hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                      {isGeneratingImage ? (
                          <span className="flex items-center justify-center gap-2">
                              <span className="loading"></span>
                              <span>Generating...</span>
                          </span>
                      ) : (
                          'Generate Image'
                      )}
                  </button>
              </div>
              <div className="md:col-span-3 grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
                <div className="space-y-3">
                  <div className="text-center lg:text-left">
                    <h3 className="text-cyan-300 font-bold text-base">{character.name}</h3>
                    <p className="text-slate-300 text-xs mb-2">{character.description}</p>
                  </div>

                  <div>
                    <h4 className="text-purple-300 font-semibold mb-2 text-center">Background</h4>
                    <div className="space-y-1">
                      <div className="bg-slate-800/50 p-2 rounded">
                        <span className="text-slate-300">Personality: </span>
                        <span className="text-white">{character.background_info?.personality}</span>
                      </div>
                      <div className="bg-slate-800/50 p-2 rounded">
                        <span className="text-slate-300">Voice: </span>
                        <span className="text-white">{character.background_info?.voice}</span>
                      </div>
                      <div className="bg-slate-800/50 p-2 rounded">
                        <span className="text-slate-300">Alignment: </span>
                        <span className="text-white">{character.background_info?.alignment}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-purple-300 font-semibold mb-2 text-center">Base Stats</h4>
                    <div className="space-y-1">
                      {isEditing ? (
                         <>
                            <StatInput label="Health" name="max_health" value={editableCharacter.game_stats.base_stats.general.max_health} onChange={handleStatChange} colorClass="border-green-400" />
                            <StatInput label="Attack" name="attack" value={editableCharacter.game_stats.base_stats.general.attack} onChange={handleStatChange} colorClass="border-red-400" />
                            <StatInput label="Defense" name="defense" value={editableCharacter.game_stats.base_stats.general.defense} onChange={handleStatChange} colorClass="border-blue-400" />
                            <StatInput label="Speed" name="speed" value={editableCharacter.game_stats.base_stats.general.speed} onChange={handleStatChange} colorClass="border-yellow-400" />
                         </>
                       ) : (
                         <>
                           <div className="bg-slate-800/50 p-2 rounded border-l-2 border-green-400">
                             <span className="text-slate-300">Health: </span>
                             <span className="text-white font-bold">{character.game_stats?.base_stats?.general?.max_health}</span>
                           </div>
                           <div className="bg-slate-800/50 p-2 rounded border-l-2 border-red-400">
                             <span className="text-slate-300">Attack: </span>
                             <span className="text-white font-bold">{character.game_stats?.base_stats?.general?.attack}</span>
                           </div>
                           <div className="bg-slate-800/50 p-2 rounded border-l-2 border-blue-400">
                             <span className="text-slate-300">Defense: </span>
                             <span className="text-white font-bold">{character.game_stats?.base_stats?.general?.defense}</span>
                           </div>
                           <div className="bg-slate-800/50 p-2 rounded border-l-2 border-yellow-400">
                             <span className="text-slate-300">Speed: </span>
                             <span className="text-white font-bold">{character.game_stats?.base_stats?.general?.speed}</span>
                           </div>
                         </>
                       )}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-purple-300 font-semibold mb-2 text-center">Advanced Stats</h4>
                     <div className="space-y-1">
                       {isEditing ? (
                         <>
                            <StatInput label="Luck" name="luck" value={editableCharacter.game_stats.base_stats.advanced.luck} onChange={handleStatChange} colorClass="border-green-400" />
                            <StatInput label="Intelligence" name="intelligence" value={editableCharacter.game_stats.base_stats.advanced.intelligence} onChange={handleStatChange} colorClass="border-purple-400" />
                            <StatInput label="Agility" name="agility" value={editableCharacter.game_stats.base_stats.advanced.agility} onChange={handleStatChange} colorClass="border-orange-400" />
                            <StatInput label="Endurance" name="endurance" value={editableCharacter.game_stats.base_stats.advanced.endurance} onChange={handleStatChange} colorClass="border-pink-400" />
                         </>
                       ) : (
                         <>
                           <div className="bg-slate-800/50 p-2 rounded border-l-2 border-green-400">
                             <span className="text-slate-300">Luck: </span>
                             <span className="text-white font-bold">{character.game_stats?.base_stats?.advanced?.luck}</span>
                           </div>
                           <div className="bg-slate-800/50 p-2 rounded border-l-2 border-purple-400">
                             <span className="text-slate-300">Intelligence: </span>
                             <span className="text-white font-bold">{character.game_stats?.base_stats?.advanced?.intelligence}</span>
                           </div>
                           <div className="bg-slate-800/50 p-2 rounded border-l-2 border-orange-400">
                             <span className="text-slate-300">Agility: </span>
                             <span className="text-white font-bold">{character.game_stats?.base_stats?.advanced?.agility}</span>
                           </div>
                           <div className="bg-slate-800/50 p-2 rounded border-l-2 border-pink-400">
                             <span className="text-slate-300">Endurance: </span>
                             <span className="text-white font-bold">{character.game_stats?.base_stats?.advanced?.endurance}</span>
                           </div>
                         </>
                       )}
                     </div>
                  </div>
                </div>

                {/* === START: UPDATED ABILITIES AND NEW STATUS EFFECTS SECTION === */}
                <div className="lg:col-span-1 space-y-4">
                    <div>
                        <h4 className="text-purple-300 font-semibold mb-2 text-center">Abilities</h4>
                        <div className="space-y-2">
                            {character.game_stats?.abilities?.map((ability, index) => (
                                <div key={index} className="bg-slate-800/50 p-2 rounded border-l-2 border-cyan-400">
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-cyan-300">{ability.name}</span>
                                        <span className="text-xs bg-cyan-400/20 text-cyan-300 px-2 py-0.5 rounded-full">{ability.type}</span>
                                    </div>
                                    <p className="text-slate-300 text-xs mt-1">{ability.description}</p>
                                    {ability.cooldown !== null && (
                                        <p className="text-xs text-slate-400 mt-1">Cooldown: {ability.cooldown} turns</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h4 className="text-purple-300 font-semibold mb-2 text-center">Status Effects</h4>
                        <div className="flex flex-wrap gap-1 content-start">
                            {character.game_stats?.statusEffects?.length > 0 ? (
                                character.game_stats.statusEffects.map((effect, index) => (
                                    <span key={index} className="bg-red-400/20 text-red-300 px-2 py-1 rounded-full text-xs border border-red-400/30">
                                        {effect}
                                    </span>
                                ))
                            ) : (
                                <p className="text-slate-400 text-center w-full text-xs">None</p>
                            )}
                        </div>
                    </div>
                </div>
                {/* === END: UPDATED ABILITIES AND NEW STATUS EFFECTS SECTION === */}

              </div>
            </div>
          </div>
        )}
        <div className="glass-card rounded-2xl p-4 shadow-2xl border-2 border-slate-600">
          <h2 className="text-xl font-bold text-white text-center mb-3 relative">
            Ready to Battle?
            <div className="absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 w-16 h-0.5 bg-gradient-to-r from-transparent via-slate-400 to-transparent"></div>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
            <button
              onClick={joinRoom}
              disabled={isEditing}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-2 px-4 rounded-lg font-bold uppercase tracking-wider hover:transform hover:-translate-y-1 hover:shadow-lg hover:shadow-green-500/30 transition-all text-sm disabled:opacity-50"
            >
              Join Room
            </button>
            <button
              onClick={createRoom}
              disabled={isEditing}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-2 px-4 rounded-lg font-bold uppercase tracking-wider hover:transform hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-500/30 transition-all text-sm disabled:opacity-50"
            >
              Create Room
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIBossBattleUI;