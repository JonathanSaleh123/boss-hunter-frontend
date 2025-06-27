'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { apiService } from '@/lib/api';
import type { UserStats, Battle, Character } from '@/lib/api';
import { Trophy, Sword, Shield, Users, Clock, Target } from 'lucide-react';

interface UserStatsProps {
  onCharacterSelect?: (character: Character) => void;
}

export default function UserStats({ onCharacterSelect }: UserStatsProps) {
  const { data: session } = useSession();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [battles, setBattles] = useState<Battle[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'stats' | 'battles' | 'characters'>('stats');

  useEffect(() => {
    if (session?.user?.email) {
      loadUserData();
    }
  }, [session]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const auth0Id = (session as any)?.user?.sub || session?.user?.email;
      
      const [statsResponse, battlesResponse, charactersResponse] = await Promise.all([
        apiService.getUserStats(auth0Id),
        apiService.getUserBattles(auth0Id, 1, 5),
        apiService.getUserCharacters(auth0Id)
      ]);

      setStats(statsResponse.stats);
      setBattles(battlesResponse.battles);
      setCharacters(charactersResponse.characters);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-700 rounded"></div>
            <div className="h-3 bg-gray-700 rounded w-5/6"></div>
            <div className="h-3 bg-gray-700 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'stats' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Statistics
        </button>
        <button
          onClick={() => setActiveTab('battles')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'battles' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Battle History
        </button>
        <button
          onClick={() => setActiveTab('characters')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'characters' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Characters
        </button>
      </div>

      {activeTab === 'stats' && stats && (
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-white mb-4">Your Statistics</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-700 rounded-lg p-4 text-center">
              <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{stats.totalBattles}</div>
              <div className="text-sm text-gray-400">Total Battles</div>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-4 text-center">
              <Sword className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{stats.victories}</div>
              <div className="text-sm text-gray-400">Victories</div>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-4 text-center">
              <Target className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{stats.winRate}%</div>
              <div className="text-sm text-gray-400">Win Rate</div>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-4 text-center">
              <Users className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{stats.totalCharacters}</div>
              <div className="text-sm text-gray-400">Characters</div>
            </div>
          </div>

          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-white mb-3">Battle Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">Victories:</span>
                <span className="text-green-400">{stats.victories}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Defeats:</span>
                <span className="text-red-400">{stats.defeats}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Draws:</span>
                <span className="text-yellow-400">{stats.draws}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'battles' && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white mb-4">Recent Battles</h3>
          
          {battles.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <Sword className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No battles recorded yet.</p>
              <p className="text-sm">Join the arena to start your journey!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {battles.map((battle) => (
                <div key={battle._id} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-white">{battle.bossName}</h4>
                      <p className="text-sm text-gray-400">
                        {battle.participants.length} participants
                      </p>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      battle.outcome === 'victory' ? 'bg-green-600 text-white' :
                      battle.outcome === 'defeat' ? 'bg-red-600 text-white' :
                      'bg-yellow-600 text-black'
                    }`}>
                      {battle.outcome.toUpperCase()}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {formatDuration(battle.duration)}
                    </div>
                    <div className="flex items-center">
                      <Target className="w-4 h-4 mr-1" />
                      {battle.turnCount} turns
                    </div>
                    <div>{formatDate(battle.createdAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'characters' && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white mb-4">Your Characters</h3>
          
          {characters.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No characters created yet.</p>
              <p className="text-sm">Create your first character to begin!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {characters.map((character) => (
                <div key={character._id} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-white">{character.name}</h4>
                      <p className="text-sm text-gray-400">{character.background_info.personality}</p>
                    </div>
                    {onCharacterSelect && (
                      <button
                        onClick={() => onCharacterSelect(character)}
                        className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 transition-colors"
                      >
                        Select
                      </button>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-400 mb-3">
                    <p className="line-clamp-2">{character.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500">Health:</span>
                      <span className="text-white ml-1">{character.game_stats.base_stats.general.max_health}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Attack:</span>
                      <span className="text-white ml-1">{character.game_stats.base_stats.general.attack}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Defense:</span>
                      <span className="text-white ml-1">{character.game_stats.base_stats.general.defense}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Speed:</span>
                      <span className="text-white ml-1">{character.game_stats.base_stats.general.speed}</span>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 mt-2">
                    Created: {formatDate(character.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 