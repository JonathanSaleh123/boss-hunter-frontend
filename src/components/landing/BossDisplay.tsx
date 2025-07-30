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
          src="https://fastly.picsum.photos/id/91/3504/2336.jpg?hmac=tK6z7RReLgUlCuf4flDKeg57o6CUAbgklgLsGL0UowU" 
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