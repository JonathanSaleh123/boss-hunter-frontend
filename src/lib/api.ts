const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface User {
  _id: string;
  email: string;
  name: string;
  image?: string;
  auth0Id: string;
  characters: Character[];
  createdAt: string;
  lastLogin: string;
}

export interface Character {
  _id: string;
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
    abilities: Ability[];
    statusEffects?: string[];
  };
  owner: string;
  createdAt: string;
  lastUsed: string;
}

export interface Ability {
  name: string;
  type: "Passive" | "Buff" | "Attack" | "Debuff";
  description: string;
  cooldown: number | null;
}

export interface Battle {
  _id: string;
  participants: BattleParticipant[];
  bossName: string;
  bossHealth: number;
  outcome: 'victory' | 'defeat' | 'draw';
  duration: number;
  turnCount: number;
  battleLog: BattleLogEntry[];
  createdAt: string;
}

export interface BattleParticipant {
  characterId: string | null;
  characterName: string;
  playerEmail: string;
  finalHealth: number;
  survived: boolean;
  damageDealt: number;
  damageTaken: number;
}

export interface BattleLogEntry {
  turn: number;
  action: string;
  damage: number;
  target: string;
  timestamp: string;
}

export interface UserStats {
  totalBattles: number;
  victories: number;
  defeats: number;
  draws: number;
  totalCharacters: number;
  winRate: string;
}

export interface GlobalStats {
  totalBattles: number;
  victories: number;
  defeats: number;
  draws: number;
  winRate: string;
  avgDuration: number;
  topBosses: Array<{ _id: string; count: number }>;
}

export interface LeaderboardEntry {
  _id: string;
  totalBattles: number;
  victories: number;
  totalDamageDealt: number;
  totalDamageTaken: number;
  winRate: number;
}

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // User Management
  async createOrUpdateUser(userData: { email: string; name: string; image?: string; auth0Id: string }): Promise<{ user: User }> {
    return this.request<{ user: User }>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getUser(auth0Id: string): Promise<{ user: User }> {
    return this.request<{ user: User }>(`/users/${auth0Id}`);
  }

  async getUserCharacters(auth0Id: string): Promise<{ characters: Character[] }> {
    return this.request<{ characters: Character[] }>(`/users/${auth0Id}/characters`);
  }

  async getUserBattles(auth0Id: string, page = 1, limit = 10): Promise<{
    battles: Battle[];
    totalPages: number;
    currentPage: number;
    total: number;
  }> {
    return this.request(`/users/${auth0Id}/battles?page=${page}&limit=${limit}`);
  }

  async getUserStats(auth0Id: string): Promise<{ stats: UserStats }> {
    return this.request<{ stats: UserStats }>(`/users/${auth0Id}/stats`);
  }

  // Character Management
  async createCharacter(characterData: Omit<Character, '_id' | 'owner' | 'createdAt' | 'lastUsed'>, auth0Id: string): Promise<{ character: Character }> {
    return this.request<{ character: Character }>('/characters', {
      method: 'POST',
      body: JSON.stringify({ characterData, auth0Id }),
    });
  }

  async getCharacter(characterId: string): Promise<{ character: Character }> {
    return this.request<{ character: Character }>(`/characters/${characterId}`);
  }

  async updateCharacter(characterId: string, characterData: Partial<Character>, auth0Id: string): Promise<{ character: Character }> {
    return this.request<{ character: Character }>(`/characters/${characterId}`, {
      method: 'PUT',
      body: JSON.stringify({ characterData, auth0Id }),
    });
  }

  async deleteCharacter(characterId: string, auth0Id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/characters/${characterId}`, {
      method: 'DELETE',
      body: JSON.stringify({ auth0Id }),
    });
  }

  // Battle Management
  async getBattles(page = 1, limit = 10, outcome?: string): Promise<{
    battles: Battle[];
    totalPages: number;
    currentPage: number;
    total: number;
  }> {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (outcome) params.append('outcome', outcome);
    return this.request(`/battles?${params.toString()}`);
  }

  async getBattle(battleId: string): Promise<{ battle: Battle }> {
    return this.request<{ battle: Battle }>(`/battles/${battleId}`);
  }

  async getGlobalStats(): Promise<{ stats: GlobalStats }> {
    return this.request<{ stats: GlobalStats }>('/battles/stats/global');
  }

  async getLeaderboard(timeframe = 'all'): Promise<{ leaderboard: LeaderboardEntry[] }> {
    return this.request<{ leaderboard: LeaderboardEntry[] }>(`/battles/leaderboard?timeframe=${timeframe}`);
  }
}

export const apiService = new ApiService(); 