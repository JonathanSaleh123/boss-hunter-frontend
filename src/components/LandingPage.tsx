'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AIBossBattleUI from './landing/CharacterCreationUI';
import UserStats from './UserStats';
import { Character as ApiCharacter } from '@/lib/api';
import { CharacterCreationStyles } from './landing/styles';

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
    statusEffects?: string[]; // Optional status effects array
  };
}

const AIBossBattle: React.FC = () => {
  const router = useRouter();
  const [character, setCharacter] = useState<Character | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editableCharacter, setEditableCharacter] = useState<Character | null>(null);
  
  // New state for character selection mode
  const [mode, setMode] = useState<'create' | 'select'>('create');
  const [selectedFromLibrary, setSelectedFromLibrary] = useState<ApiCharacter | null>(null);


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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.description) return;

    setIsGenerating(true);
    setError(null);
    setCharacter(null);

    try {
      const response = await fetch('/api/create-character', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to generate character');
      }

      // The API is now expected to return the new Character structure
      const newCharacter: Character = await response.json();
      
      // Example of adding status effects if the API doesn't provide them initially
      if (!newCharacter.game_stats.statusEffects) {
        newCharacter.game_stats.statusEffects = [];
      }
      
      setCharacter(newCharacter);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleGenerateImage = async () => {
      if (!character) {
          alert('Please generate a character first.');
          return;
      }

      setIsGeneratingImage(true);
      setError(null);

      try {
          const response = await fetch('/api/generate-character-image', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                  name: character.name,
                  description: character.description,
              }),
          });

          if (!response.ok) {
              const errData = await response.json();
              throw new Error(errData.error || 'Failed to generate image');
          }

          const { imageUrl } = await response.json();
          setCharacter(prevCharacter => prevCharacter ? { ...prevCharacter, imageUrl } : null);

      } catch (err) {
          setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
          setIsGeneratingImage(false);
      }
  };

  const handleEditClick = () => {
    setEditableCharacter(JSON.parse(JSON.stringify(character))); // Deep copy
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditableCharacter(null);
  };

  const handleSaveEdit = () => {
    setCharacter(editableCharacter);
    setIsEditing(false);
  };

  const handleStatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (editableCharacter) {
        const newStats = { ...editableCharacter.game_stats };
        if (name in newStats.base_stats.general) {
            (newStats.base_stats.general as any)[name] = parseInt(value, 10) || 0;
        } else if (name in newStats.base_stats.advanced) {
            (newStats.base_stats.advanced as any)[name] = parseInt(value, 10) || 0;
        }
        setEditableCharacter({ ...editableCharacter, game_stats: newStats });
    }
  };

  const handleCharacterSelect = (selectedChar: ApiCharacter) => {
    // Convert API character format to local Character format for compatibility
    const convertedCharacter: Character = {
      name: selectedChar.name,
      description: selectedChar.description,
      imageUrl: selectedChar.imageUrl,
      background_info: selectedChar.background_info,
      game_stats: {
        base_stats: selectedChar.game_stats.base_stats,
        abilities: selectedChar.game_stats.abilities,
        statusEffects: selectedChar.game_stats.statusEffects || []
      }
    };
    
    setSelectedFromLibrary(selectedChar);
    setCharacter(convertedCharacter);
    setError(null);
    
    // Clear form data since we're not creating a new character
    setFormData({ name: '', description: '' });
    
    // Switch back to create mode to show the character details
    setMode('create');
  };

  const handleBackToLibrary = () => {
    setMode('select');
  };

  const navigateToArena = () => {
    const characterToUse = character;
    if (characterToUse) {
      sessionStorage.setItem('character', JSON.stringify(characterToUse));
      router.push('/arena');
    } else {
      alert('Please generate or select a character first!');
    }
  };

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
        
        {/* Mode Toggle */}
        <div className="flex justify-center mb-6">
          <div className="glass-card rounded-2xl p-2 shadow-2xl border-2 border-slate-600">
            <div className="flex space-x-2">
              <button
                onClick={() => setMode('create')}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  mode === 'create'
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Create New Character
              </button>
              <button
                onClick={() => setMode('select')}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  mode === 'select'
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Select Existing Character
              </button>
            </div>
          </div>
        </div>

        {mode === 'create' ? (
          <AIBossBattleUI
            character={character}
            isGenerating={isGenerating}
            isGeneratingImage={isGeneratingImage}
            error={error}
            formData={formData}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            handleGenerateImage={handleGenerateImage}
            joinRoom={navigateToArena}
            createRoom={navigateToArena}
            isEditing={isEditing}
            editableCharacter={editableCharacter}
            handleEditClick={handleEditClick}
            handleCancelEdit={handleCancelEdit}
            handleSaveEdit={handleSaveEdit}
            handleStatChange={handleStatChange}
            isSelectedFromLibrary={!!selectedFromLibrary}
            onBackToLibrary={handleBackToLibrary}
          />
        ) : (
          <div className="space-y-6">
            <UserStats onCharacterSelect={handleCharacterSelect} />
            
            {character && (
              <div className="glass-card rounded-2xl p-4 shadow-2xl border-2 border-slate-600">
                <h2 className="text-xl font-bold text-white text-center mb-3 relative">
                  Ready to Battle with {character.name}?
                  <div className="absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 w-16 h-0.5 bg-gradient-to-r from-transparent via-slate-400 to-transparent"></div>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
                  <button
                    onClick={navigateToArena}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-2 px-4 rounded-lg font-bold uppercase tracking-wider hover:transform hover:-translate-y-1 hover:shadow-lg hover:shadow-green-500/30 transition-all text-sm"
                  >
                    Join Room
                  </button>
                  <button
                    onClick={navigateToArena}
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-2 px-4 rounded-lg font-bold uppercase tracking-wider hover:transform hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-500/30 transition-all text-sm"
                  >
                    Create Room
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIBossBattle;