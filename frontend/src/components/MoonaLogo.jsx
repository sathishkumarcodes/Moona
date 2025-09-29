import React, { useState, useEffect } from 'react';

const MoonaLogo = ({ size = 'md', className = '', showTagline = false, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [moonPhase, setMoonPhase] = useState(0);

  const sizeClasses = {
    sm: {
      container: 'space-y-1',
      moonContainer: 'w-8 h-8',
      title: 'text-xl',
      tagline: 'text-xs'
    },
    md: {
      container: 'space-y-2',
      moonContainer: 'w-12 h-12',
      title: 'text-2xl',
      tagline: 'text-sm'
    },
    lg: {
      container: 'space-y-3',
      moonContainer: 'w-16 h-16',
      title: 'text-4xl',
      tagline: 'text-base'
    },
    xl: {
      container: 'space-y-4',
      moonContainer: 'w-20 h-20',
      title: 'text-5xl',
      tagline: 'text-lg'
    }
  };

  const currentSize = sizeClasses[size];

  // Cycle through moon phases on click
  useEffect(() => {
    if (isClicked) {
      const timer = setTimeout(() => setIsClicked(false), 600);
      return () => clearTimeout(timer);
    }
  }, [isClicked]);

  // Auto-cycle moon phases slowly
  useEffect(() => {
    const interval = setInterval(() => {
      setMoonPhase(prev => (prev + 1) % 8);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const moonPhases = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'];
  const currentMoon = moonPhases[moonPhase];

  const handleClick = () => {
    setIsClicked(true);
    setMoonPhase(prev => (prev + 1) % 8);
    if (onClick) onClick();
  };

  return (
    <div className={`flex items-center ${currentSize.container} ${className}`}>
      {/* Logo Container */}
      <div 
        className="flex items-center space-x-3 cursor-pointer select-none"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
      >
        {/* Interactive Moon Icon */}
        <div className="relative group">
          {/* Outer Glow Ring */}
          <div 
            className={`absolute -inset-4 bg-gradient-to-r from-purple-400/30 via-blue-400/30 to-indigo-400/30 rounded-full blur-lg transition-all duration-700 ${
              isHovered ? 'opacity-100 scale-110' : 'opacity-0 scale-100'
            }`}
          ></div>
          
          {/* Celestial Particles */}
          <div className="absolute -inset-6 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className={`absolute w-1 h-1 bg-gradient-to-r from-yellow-300 to-amber-200 rounded-full transition-all duration-1000 ${
                  isHovered ? 'opacity-100 animate-twinkle' : 'opacity-0'
                }`}
                style={{
                  top: `${15 + Math.sin(i * 60) * 20}%`,
                  left: `${15 + Math.cos(i * 60) * 20}%`,
                  animationDelay: `${i * 0.2}s`
                }}
              ></div>
            ))}
          </div>

          {/* Moon Container */}
          <div 
            className={`${currentSize.moonContainer} relative flex items-center justify-center rounded-full transition-all duration-500 ${
              isClicked ? 'animate-bounce' : isHovered ? 'animate-float' : ''
            }`}
            style={{
              background: isHovered 
                ? 'radial-gradient(circle at 30% 30%, #fbbf24, #f59e0b, #d97706, #92400e)'
                : 'radial-gradient(circle at 30% 30%, #e5e7eb, #d1d5db, #9ca3af, #6b7280)',
              boxShadow: isHovered 
                ? '0 0 30px rgba(251, 191, 36, 0.4), inset 0 0 20px rgba(0,0,0,0.2)'
                : '0 0 20px rgba(107, 114, 128, 0.3), inset 0 0 15px rgba(0,0,0,0.1)',
              transform: isHovered ? 'scale(1.1) rotate(10deg)' : 'scale(1) rotate(0deg)'
            }}
          >
            {/* Moon Surface Details */}
            <div className="absolute inset-0 rounded-full overflow-hidden">
              {/* Craters */}
              <div className="absolute top-2 left-2 w-1 h-1 bg-black/20 rounded-full"></div>
              <div className="absolute bottom-3 right-2 w-0.5 h-0.5 bg-black/30 rounded-full"></div>
              <div className="absolute top-1/2 left-1/3 w-0.5 h-0.5 bg-black/25 rounded-full"></div>
            </div>
            
            {/* Moon Phase Emoji */}
            <div 
              className={`text-2xl transition-all duration-300 ${
                isClicked ? 'animate-spin' : ''
              }`}
              style={{
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                transform: isHovered ? 'scale(1.2)' : 'scale(1)'
              }}
            >
              {currentMoon}
            </div>

            {/* Magical sparkle overlay */}
            <div 
              className={`absolute inset-0 bg-gradient-to-br from-yellow-200/20 via-transparent to-purple-200/20 rounded-full transition-opacity duration-500 ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`}
            ></div>
          </div>

          {/* Orbital Ring */}
          <div 
            className={`absolute -inset-8 border border-purple-300/30 rounded-full transition-all duration-1000 ${
              isHovered ? 'opacity-100 animate-spin-slow' : 'opacity-0'
            }`}
            style={{ animationDuration: '10s' }}
          ></div>
        </div>

        {/* Brand Text */}
        <div className="flex flex-col">
          <h1 
            className={`${currentSize.title} font-black tracking-tight relative transition-all duration-300 ${
              isHovered ? 'scale-105' : 'scale-100'
            }`}
            style={{
              background: isHovered 
                ? 'linear-gradient(135deg, #a855f7 0%, #7c3aed 30%, #6366f1 70%, #3b82f6 100%)'
                : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 30%, #94a3b8 70%, #64748b 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
            }}
          >
            Moona
            
            {/* Enhanced shimmer effect */}
            <div 
              className={`absolute inset-0 transition-opacity duration-1000 ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                WebkitBackgroundClip: 'text',
                animation: isHovered ? 'shimmer 2s ease-in-out infinite' : 'none'
              }}
            >
              Moona
            </div>

            {/* Magical particles around text */}
            {isHovered && (
              <div className="absolute -inset-2 pointer-events-none">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-0.5 h-0.5 bg-purple-300 rounded-full animate-ping"
                    style={{
                      top: `${20 + i * 20}%`,
                      right: `${-10 + (i % 2) * -5}px`,
                      animationDelay: `${i * 0.3}s`
                    }}
                  ></div>
                ))}
              </div>
            )}
          </h1>

          {/* Enhanced Tagline */}
          {showTagline && (
            <p 
              className={`${currentSize.tagline} font-semibold transition-all duration-300 ${
                isHovered ? 'opacity-100 translate-y-0' : 'opacity-80 translate-y-1'
              }`}
              style={{
                background: isHovered 
                  ? 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)'
                  : 'linear-gradient(135deg, #e2e8f0 0%, #94a3b8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              where your portfolio shines brighter ✨
            </p>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-3px) rotate(2deg); }
          50% { transform: translateY(-5px) rotate(0deg); }
          75% { transform: translateY(-3px) rotate(-2deg); }
        }
        
        @keyframes twinkle {
          0%, 100% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(1); }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-twinkle {
          animation: twinkle 2s ease-in-out infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 10s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default MoonaLogo;