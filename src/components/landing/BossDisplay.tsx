import React from 'react';

const BossDisplay: React.FC = () => {
  return (
    <div className="glass-card rounded-2xl p-5 shadow-2xl border-2 border-purple-500 shadow-purple-500/20">
      <h2 className="text-xl font-bold text-purple-300 text-center mb-3 relative">
        Current Boss
        <div className="absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 w-16 h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent"></div>
      </h2>
      <div className="boss-image w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto mb-3 flex items-center justify-center text-3xl shadow-lg shadow-purple-500/50 overflow-hidden">
        <img 
          src="https://oaidalleapiprodscus.blob.core.windows.net/private/org-wjzyvmRjFIezvYsgRjuutE6i/user-hrHYhNiVUGGPGrx0EvJQka6T/img-5WBoy9QLzSHmXlbjtTLRBi1P.png?st=2025-06-22T20%3A15%3A33Z&se=2025-06-22T22%3A15%3A33Z&sp=r&sv=2024-08-04&sr=b&rscd=inline&rsct=image/png&skoid=8b33a531-2df9-46a3-bc02-d4b1430a422c&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-06-22T10%3A36%3A23Z&ske=2025-06-23T10%3A36%3A23Z&sks=b&skv=2024-08-04&sig=IGZanYRMK6qm6qKnu5vKoDhJ6zY%2BQIXkV%2Bjk67DlMy4%3D" 
          alt="Ancient Shadow Drake" 
          className="w-full h-full object-cover" 
        />
      </div>
      <div className="text-center">
        <h3 className="text-lg font-bold text-purple-300 mb-2">Ancient Shadow Drake</h3>
        <p className="text-slate-300 text-xs mb-3 leading-relaxed">
          A primordial beast of shadow and fury, awakened from a slumber of eons.
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-800/50 p-2 rounded border-l-2 border-purple-400">
            <span className="text-slate-300">Health: </span>
            <span className="text-white font-bold">3500</span>
          </div>
          <div className="bg-slate-800/50 p-2 rounded border-l-2 border-red-400">
            <span className="text-slate-300">Attack: </span>
            <span className="text-white font-bold">100</span>
          </div>
          <div className="bg-slate-800/50 p-2 rounded border-l-2 border-blue-400">
            <span className="text-slate-300">Defense: </span>
            <span className="text-white font-bold">80</span>
          </div>
          <div className="bg-slate-800/50 p-2 rounded border-l-2 border-yellow-400">
            <span className="text-slate-300">Speed: </span>
            <span className="text-white font-bold">120</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BossDisplay; 