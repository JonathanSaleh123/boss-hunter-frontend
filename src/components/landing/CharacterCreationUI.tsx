'use client';

import React from 'react';
import { AIBossBattleUIProps } from './types';
import BossDisplay from './BossDisplay';
import CharacterForm from './CharacterForm';
import CharacterDisplay from './CharacterDisplay';
import { CharacterCreationStyles } from './styles';

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
      <CharacterCreationStyles />
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
          <BossDisplay />
          <CharacterForm
            formData={formData}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            isGenerating={isGenerating}
            isEditing={isEditing}
          />
        </div>
        
        {error && (
          <div className="glass-card rounded-2xl p-5 shadow-2xl mb-4 border-2 border-red-500 text-center">
            <p className="text-red-400">{error}</p>
          </div>
        )}
        
        {currentCharacter && (
          <CharacterDisplay
            character={currentCharacter}
            isGeneratingImage={isGeneratingImage}
            isGenerating={isGenerating}
            isEditing={isEditing}
            editableCharacter={editableCharacter}
            handleEditClick={handleEditClick}
            handleCancelEdit={handleCancelEdit}
            handleSaveEdit={handleSaveEdit}
            handleStatChange={handleStatChange}
            handleGenerateImage={handleGenerateImage}
          />
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