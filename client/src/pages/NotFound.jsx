import React from 'react';
import { Link } from 'react-router-dom';
import { Tag, Home, Search } from 'lucide-react';

const NotFound = () => {
  return (
    <div
      style={{
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '2rem',
      }}
    >
      <div className="glass-panel" style={{ padding: '3.5rem 2rem', maxWidth: '500px', width: '100%' }}>
        <h1 style={{ fontSize: '5rem', fontWeight: 900, color: 'var(--primary)', lineHeight: 1 }}>
          404
        </h1>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '1rem 0 0.5rem' }}>
          Page Not Found
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
          The page you are looking for might have been moved or does not exist on DealKart.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <Link to="/" className="btn btn-primary">
            <Home size={16} /> Home
          </Link>
          <Link to="/products" className="btn btn-secondary">
            <Search size={16} /> Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
