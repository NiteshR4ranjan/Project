import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Scale, X, ArrowRight, Trash2 } from 'lucide-react';
import { useCompare } from '../context/CompareContext';

const CompareBar = () => {
  const location = useLocation();
  const { compareList, removeFromCompare, clearCompare } = useCompare();

  // Don't show the floating bar if already on the compare page or if empty
  if (compareList.length === 0 || location.pathname === '/compare') {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 32px)',
        maxWidth: '780px',
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(99, 102, 241, 0.4)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.6)',
        padding: '0.85rem 1.25rem',
        zIndex: 1500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        animation: 'fadeIn 0.25s ease-out',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', overflowX: 'auto', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#818cf8', fontWeight: 700, fontSize: '0.88rem', whiteSpace: 'nowrap' }}>
          <Scale size={18} />
          <span>Compare ({compareList.length}/4)</span>
        </div>

        {/* Product Chips */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {compareList.map((item) => (
            <div
              key={item._id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-full)',
                padding: '0.25rem 0.6rem 0.25rem 0.35rem',
                fontSize: '0.78rem',
                color: '#fff',
                whiteSpace: 'nowrap',
              }}
            >
              <img
                src={item.imageUrl}
                alt=""
                style={{ width: '20px', height: '20px', objectFit: 'contain', borderRadius: '50%' }}
              />
              <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {item.name}
              </span>
              <button
                onClick={() => removeFromCompare(item._id)}
                style={{ color: 'var(--text-dim)', display: 'flex', alignItems: 'center' }}
                title="Remove"
              >
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}>
        <button
          onClick={clearCompare}
          className="btn btn-secondary btn-sm"
          style={{ padding: '0.4rem 0.6rem', color: 'var(--text-dim)' }}
          title="Clear all"
        >
          <Trash2 size={15} />
        </button>

        <Link
          to={`/compare?ids=${compareList.map((c) => c._id).join(',')}`}
          className="btn btn-primary btn-sm"
          style={{ padding: '0.45rem 1rem' }}
        >
          Compare Now <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
};

export default CompareBar;
