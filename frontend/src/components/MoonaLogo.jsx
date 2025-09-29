import React from 'react';

const MoonaLogo = ({ size = 'md', className = '', showTagline = false }) => {
  const sizeClasses = {
    sm: {
      container: 'space-y-1',
      moon: 'text-2xl',
      title: 'text-xl',
      tagline: 'text-xs'
    },
    md: {
      container: 'space-y-2',
      moon: 'text-3xl',
      title: 'text-2xl',
      tagline: 'text-sm'
    },
    lg: {
      container: 'space-y-3',
      moon: 'text-4xl',
      title: 'text-4xl',
      tagline: 'text-base'
    },
    xl: {
      container: 'space-y-4',
      moon: 'text-6xl',
      title: 'text-5xl',
      tagline: 'text-lg'
    }
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={`flex items-center ${currentSize.container} ${className}`}>
      {/* Logo Container */}
      <div className="flex items-center space-x-3">
        {/* Animated Moon Icon */}
        <div className="relative group">
          <div className="absolute -inset-2 bg-gradient-to-r from-blue-400/20 to-slate-400/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative flex items-center justify-center">
            <div 
              className={`${currentSize.moon} transform transition-all duration-300 group-hover:scale-110 filter drop-shadow-lg`}
              style={{
                background: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 50%, #94a3b8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 20px rgba(148, 163, 184, 0.5)'
              }}
            >
              🌙
            </div>
            {/* Subtle glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-300/10 to-slate-300/10 rounded-full blur-sm animate-pulse"></div>
          </div>
        </div>

        {/* Brand Text */}
        <div className="flex flex-col">
          <h1 
            className={`${currentSize.title} font-black tracking-tight relative`}
            style={{
              background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 30%, #94a3b8 70%, #64748b 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
            }}
          >
            Moona
            
            {/* Subtle shimmer effect */}
            <div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-1000"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                WebkitBackgroundClip: 'text',
                animation: 'shimmer 3s ease-in-out infinite'
              }}
            >
              Moona
            </div>
          </h1>

          {/* Tagline */}
          {showTagline && (
            <p 
              className={`${currentSize.tagline} font-semibold opacity-80`}
              style={{
                background: 'linear-gradient(135deg, #e2e8f0 0%, #94a3b8 100%)',
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
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default MoonaLogo;