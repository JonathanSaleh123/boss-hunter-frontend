import React from 'react';

interface CharacterFormProps {
  formData: { name: string; description: string };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isGenerating: boolean;
  isEditing: boolean;
}

const CharacterForm: React.FC<CharacterFormProps> = ({
  formData,
  handleInputChange,
  handleSubmit,
  isGenerating,
  isEditing,
}) => {
  return (
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
  );
};

export default CharacterForm; 