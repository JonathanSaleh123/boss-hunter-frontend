export interface Character {
  id: string; // Socket ID
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
  };
  // Gameplay-specific state
  health: number;
  maxHealth: number;
  class: string;
  image: string;
  isAlive: boolean;
  isPlayer: boolean;
}

export interface Boss extends Omit<Character, 'id' | 'isPlayer' | 'class'> {
    isEnraged: boolean;
    phase: number;
}

export interface ChatMessage {
    id: number;
    player: string;
    message: string;
    type: 'action' | 'attack' | 'damage' | 'boss' | 'system';
    timestamp: string;
}