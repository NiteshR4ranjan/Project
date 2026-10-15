import React from 'react';

const LoadingSpinner = ({ message = 'Loading...', size = 36 }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1rem',
        gap: '1rem',
        color: 'var(--text-muted)',
      }}
    >
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          border: '3px solid rgba(255, 255, 255, 0.1)',
          borderTopColor: 'var(--primary)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      <p style={{ fontSize: '0.9rem', fontWeight: 500 }}>{message}</p>
    </div>
  );
};

export default LoadingSpinner;
