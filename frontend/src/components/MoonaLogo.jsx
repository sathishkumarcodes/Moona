import React, { useState, useEffect } from 'react';

const MoonaLogo = ({ size = 'md', className = '', showTagline = false, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const sizeClasses = {
    sm: {
      container: 'space-y-1',
      moonSize: 'w-8 h-8 text-xl',
      title: 'text-xl',
      tagline: 'text-xs'
    },
    md: {
      container: 'space-y-2',
      moonSize: 'w-10 h-10 text-2xl',
      title: 'text-2xl',
      tagline: 'text-sm'
    },
    lg: {
      container: 'space-y-2',
      moonSize: 'w-14 h-14 text-3xl',
      title: 'text-4xl',
      tagline: 'text-base'
    },
    xl: {
      container: 'space-y-3',
      moonSize: 'w-16 h-16 text-4xl',
      title: 'text-5xl',
      tagline: 'text-lg'
    }
  };

  const currentSize = sizeClasses[size];

  const handleClick = () => {
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 200);
    if (onClick) onClick();
  };

  return (
    <div className={`flex items-center ${currentSize.container} ${className}`}>
      <div 
        className="flex items-center space-x-4 cursor-pointer select-none group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
      >
        {/* Moon Icon */}
        <div className="relative">
          {/* Glow effect */}
          <div 
            className={`absolute -inset-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full blur-md transition-all duration-500 ${
              isHovered ? 'opacity-100 scale-110' : 'opacity-0'
            }`}
          />
          
          {/* Main moon container */}
          <div 
            className={`${currentSize.moonSize} relative flex items-center justify-center rounded-full transition-all duration-300 ${
              isPressed ? 'scale-95' : isHovered ? 'scale-105' : 'scale-100'
            }`}
            style={{
              background: `linear-gradient(135deg, 
                ${isHovered ? '#f8fafc' : '#e2e8f0'} 0%, 
                ${isHovered ? '#e2e8f0' : '#cbd5e1'} 50%, 
                ${isHovered ? '#cbd5e1' : '#94a3b8'} 100%)`,
              boxShadow: isHovered 
                ? '0 10px 25px -5px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)' 
                : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
          >
            {/* Moon emoji */}
            <span className="relative z-10 transition-transform duration-300">
              🌙
            </span>
            
            {/* Shine effect */}
            <div 
              className={`absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent rounded-full transition-opacity duration-500 ${
                isHovered ? 'opacity-100' : 'opacity-50'
              }`}
            />
          </div>
        </div>

        {/* Brand Text */}
        <div className="flex flex-col">
          <h1 
            className={`${currentSize.title} font-black tracking-tight transition-all duration-300 ${
              isPressed ? 'scale-98' : isHovered ? 'scale-102' : 'scale-100'
            }`}
            style={{
              background: isHovered 
                ? 'linear-gradient(135deg, #7c3aed 0%, #a855f7 30%, #c084fc 70%, #e879f9 100%)'
                : 'linear-gradient(135deg, #1e293b 0%, #334155 30%, #475569 70%, #64748b 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
              transform: isHovered ? 'translateY(-1px)' : 'translateY(0)'
            }}
          >
            Moona
          </h1>

          {showTagline && (
            <p 
              className={`${currentSize.tagline} font-semibold transition-all duration-300 ${
                isHovered ? 'opacity-100 translate-y-0' : 'opacity-70 translate-y-0.5'
              }`}
              style={{
                background: isHovered 
                  ? 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)'
                  : 'linear-gradient(135deg, #64748b 0%, #94a3b8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              where your portfolio shines brighter ✨
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MoonaLogo;