'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AIBossBattleUI from './CharacterCreationUI'; // This is your character creation UI

// The character interface remains the same
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
  const router = useRouter();
  const [character, setCharacter] = useState<Character | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

      const newCharacter = await response.json();
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
  
  // Update the functions to handle navigation
  const navigateToArena = () => {
    if (character) {
      // Save the character object to session storage
      sessionStorage.setItem('character', JSON.stringify(character));
      // Navigate to the arena page
      router.push('/arena');
    } else {
      alert('Please generate a character first!');
    }
  };

  const joinRoom = () => {
    navigateToArena();
  };

  const createRoom = () => {
    navigateToArena();
  };

  return (
    <AIBossBattleUI
      character={character}
      isGenerating={isGenerating}
      error={error}
      formData={formData}
      handleInputChange={handleInputChange}
      handleSubmit={handleSubmit}
      joinRoom={joinRoom}
      createRoom={createRoom}
    />
  );
};

export default AIBossBattle;