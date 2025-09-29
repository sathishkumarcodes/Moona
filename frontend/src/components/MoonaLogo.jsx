import React from 'react';

const MoonaLogo = ({ size = 'md', className = '', showTagline = false }) => {
  const sizeClasses = {
    sm: {
      moonSize: 'w-6 h-6 text-lg',
      title: 'text-lg',
      tagline: 'text-xs'
    },
    md: {
      moonSize: 'w-8 h-8 text-xl',
      title: 'text-xl',
      tagline: 'text-sm'
    },
    lg: {
      moonSize: 'w-10 h-10 text-2xl',
      title: 'text-2xl',
      tagline: 'text-base'
    }
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Static Moon */}
      <div 
        className={`${currentSize.moonSize} flex items-center justify-center rounded-full`}
        style={{
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        }}
      >
        <span>🌙</span>
      </div>

      {/* Brand Text */}
      <div className="flex flex-col">
        <h1 
          className={`${currentSize.title} font-bold tracking-tight`}
          style={{
            background: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Moona
        </h1>

        {showTagline && (
          <p 
            className={`${currentSize.tagline} font-medium opacity-70`}
            style={{
              color: '#64748b'
            }}
          >
            where your portfolio shines brighter ✨
          </p>
        )}
      </div>
    </div>
  );
};

export default MoonaLogo;