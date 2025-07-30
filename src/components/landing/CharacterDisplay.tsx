import React from 'react';
import { Character } from './types';
import StatInput from './StatInput';

interface CharacterDisplayProps {
  character: Character;
  isGeneratingImage: boolean;
  isGenerating: boolean;
  isEditing: boolean;
  editableCharacter: Character | null;
  handleEditClick: () => void;
  handleCancelEdit: () => void;
  handleSaveEdit: () => void;
  handleStatChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleGenerateImage: () => void;
  isSelectedFromLibrary?: boolean;
  onBackToLibrary?: () => void;
}

const CharacterDisplay: React.FC<CharacterDisplayProps> = ({
  character,
  isGeneratingImage,
  isGenerating,
  isEditing,
  editableCharacter,
  handleEditClick,
  handleCancelEdit,
  handleSaveEdit,
  handleStatChange,
  handleGenerateImage,
  isSelectedFromLibrary = false,
  onBackToLibrary,
}) => {
  return (
    <div className="glass-card rounded-2xl p-5 shadow-2xl mb-4 border-2 border-slate-600">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-white text-center relative">
            {isSelectedFromLibrary ? 'Selected Character' : 'Your Character'}
          </h2>
          {isSelectedFromLibrary && (
            <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded-full text-xs border border-green-400/30">
              From Library
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {isSelectedFromLibrary && onBackToLibrary && (
            <button
              onClick={onBackToLibrary}
              className="bg-indigo-500 hover:bg-indigo-600 text-white py-1 px-3 rounded-lg font-bold text-xs uppercase"
            >
              Back to Library
            </button>
          )}
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
                {isEditing && editableCharacter ? (
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
                {isEditing && editableCharacter ? (
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
                {character.game_stats?.statusEffects && character.game_stats.statusEffects.length > 0 ? (
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
        </div>
      </div>
    </div>
  );
};

export default CharacterDisplay; 