import React from 'react';
import { X, Zap, Shield, Swords, HeartPulse } from 'lucide-react';
import { Character, Boss, Ability } from './types'; // Assuming types are in './types'

interface CharacterDetailsModalProps {
  character: Character | Boss;
  onClose: () => void;
}

const StatItem = ({ name, value }: { name: string, value: string | number }) => (
    <div className="bg-slate-800/50 p-3 rounded-lg flex justify-between items-center text-sm">
        <span className="text-slate-400">{name}</span>
        <span className="font-bold text-white">{value}</span>
    </div>
);

const InfoTag = ({ label, value, colorClass }: { label: string, value: string, colorClass: string }) => (
    <div className={`inline-block break-words text-sm font-medium px-3 py-1 rounded-sm border ${colorClass}`}>
        <span className="opacity-70">{label}: </span>
        {value}
    </div>
);

// New component to render a single ability with details
const AbilityCard = ({ ability }: { ability: Ability }) => {
    const getAbilityIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case 'attack':
                return <Swords size={16} className="text-red-400" />;
            case 'buff':
                return <Shield size={16} className="text-green-400" />;
            case 'passive':
                return <HeartPulse size={16} className="text-yellow-400" />;
            default:
                return <Zap size={16} className="text-cyan-400" />;
        }
    };
    
    return (
        <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700 w-full">
            <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-2">
                    {getAbilityIcon(ability.type)}
                    <span className="font-bold text-base text-cyan-300">{ability.name}</span>
                </div>
                <span className="text-xs bg-cyan-900/80 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-700">{ability.type}</span>
            </div>
            <p className="text-sm text-slate-300 ml-1">{ability.description}</p>
            {ability.cooldown !== null && (
                <p className="text-xs text-slate-400 mt-2 text-right">Cooldown: {ability.cooldown} turns</p>
            )}
        </div>
    );
};


export const CharacterDetailsModal = ({ character, onClose }: CharacterDetailsModalProps) => {
    return (
        <div 
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div 
                className="bg-slate-900/95 backdrop-blur-sm w-full max-w-2xl max-h-[90vh] border-2 border-cyan-400/30 rounded-2xl shadow-2xl p-6 relative flex flex-col gap-4"
                onClick={e => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
                    <X size={24} />
                </button>

                <div className="flex items-start gap-6">
                {character.imageUrl ? (
                  <img src={character.imageUrl} alt={character.name} className="w-32 h-32 object-cover rounded-xl border-2 border-slate-600" onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://placehold.co/200x300/1e293b/ffffff?text=Char'; }} />
                ) : (
                  <div className="w-32 h-32 object-cover rounded-xl border-2 border-slate-600 flex items-center justify-center bg-slate-800">
                    <span className="text-3xl font-bold text-slate-400">{character.name.substring(0, 2).toUpperCase()}</span>
                  </div>
                )}
                    <div className="flex-1">
                        <h2 className="text-3xl font-bold text-cyan-300">{character.name}</h2>
                        <p className="text-slate-300 mt-1">{character.description}</p>
                        <div className="flex items-center gap-2 mt-3">
                            <InfoTag label="Class" value={'class' in character ? character.class : character.background_info.personality} colorClass="bg-purple-900/50 text-purple-300 border-purple-700" />
                            <InfoTag label="Alignment" value={character.background_info.alignment} colorClass="bg-sky-900/50 text-sky-300 border-sky-700" />
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
                    <div className="space-y-6">
                        <div>
                            <h3 className="font-bold text-lg text-white mb-2 border-b-2 border-slate-700 pb-1">Background</h3>
                            <p className="text-sm text-slate-400 bg-slate-800/50 p-3 rounded-lg">{character.background_info.backstory}</p>
                        </div>
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
                        
                        {/* === UPDATED ABILITIES SECTION === */}
                        <div>
                            <h3 className="font-bold text-lg text-white mb-2 border-b-2 border-slate-700 pb-1">Abilities</h3>
                             <div className="flex flex-col gap-2">
                                {character.game_stats.abilities.map(ability => (
                                    <AbilityCard key={ability.name} ability={ability} />
                                ))}
                            </div>
                        </div>

                        {/* === NEW STATUS EFFECTS SECTION === */}
                        <div>
                            <h3 className="font-bold text-lg text-white mb-2 border-b-2 border-slate-700 pb-1">Status Effects</h3>
                             <div className="flex flex-wrap gap-2">
                                {character.game_stats.statusEffects && character.game_stats.statusEffects.length > 0 ? (
                                    character.game_stats.statusEffects.map(effect => (
                                        <div key={effect} className="bg-red-900/50 text-red-300 text-sm font-medium px-3 py-1 rounded-full border border-red-700">
                                            {effect}
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-slate-500">None</p>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};