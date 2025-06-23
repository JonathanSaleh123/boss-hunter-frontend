import React from 'react';

export const CharacterCreationStyles: React.FC = () => (
  <style jsx>{`
    .cyber-grid {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-image:
        linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px);
      background-size: 50px 50px;
      animation: gridPulse 4s ease-in-out infinite;
      z-index: -2;
    }
    @keyframes gridPulse {
      0%, 100% { opacity: 0.3; }
      50% { opacity: 0.1; }
    }
    @keyframes titleGlow {
      from { filter: brightness(1); }
      to { filter: brightness(1.2); }
    }
    @keyframes bossFloat {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }
    @keyframes shimmer {
      0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
      100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    @keyframes float {
      0%, 100% {
        transform: translateY(0px) rotate(0deg);
        opacity: 1;
      }
      50% {
        transform: translateY(-100px) rotate(180deg);
        opacity: 0.5;
      }
    }
    .title-gradient {
      background: linear-gradient(45deg, #06b6d4, #8b5cf6, #ec4899);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: titleGlow 2s ease-in-out infinite alternate;
    }
    .boss-image {
      animation: bossFloat 3s ease-in-out infinite;
      position: relative;
      overflow: hidden;
    }
    .boss-image::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: linear-gradient(45deg, transparent, rgba(139, 92, 246, 0.2), transparent);
      animation: shimmer 2s infinite;
    }
    .loading {
      display: inline-block;
      width: 20px;
      height: 20px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top-color: #06b6d4;
      animation: spin 1s ease-in-out infinite;
    }
    .particle {
      position: absolute;
      width: 2px;
      height: 2px;
      background: #06b6d4;
      border-radius: 50%;
      animation: float 6s infinite;
    }
    .glass-card {
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      transition: all 0.3s ease;
    }
    .glass-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(6, 182, 212, 0.1);
    }
  `}</style>
); 