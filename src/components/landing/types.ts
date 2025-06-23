// The Ability interface
export interface Ability {
  name: string;
  type: "Passive" | "Buff" | "Attack" | string;
  description: string;
  cooldown: number | null; // null if passive or no cooldown
}

// The character interface, updated to use the Ability interface and include statusEffects
export interface Character {
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
    statusEffects?: string[]; // Optional status effects
  };
}

// Define the props that the UI component will accept
export interface AIBossBattleUIProps {
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

// Props for StatInput component
export interface StatInputProps {
  label: string;
  name: string;
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  colorClass: string;
} 