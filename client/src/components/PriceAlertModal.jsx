import React, { useState } from 'react';
import { Bell, X, AlertCircle, Check } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';

const PriceAlertModal = ({ isOpen, onClose, product }) => {
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const [targetPrice, setTargetPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !product) return null;

  const currentLowest = product.lowestPrice || 0;
  // Suggested target: 10% lower than current price
  const suggestedTarget = Math.round(currentLowest * 0.9);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      addToast('Please login to set price alerts.', 'error');
      return;
    }

    const priceNum = parseFloat(targetPrice);
    if (!priceNum || priceNum <= 0) {
      setError('Please enter a valid target price.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await api.post('/alerts', {
        productId: product._id,
        targetPrice: priceNum,
      });

      if (res.data?.success) {
        addToast(res.data.message || 'Price alert set successfully!', 'success');
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create price alert');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: '1.75rem',
          boxShadow: 'var(--shadow-lg)',
          animation: 'fadeIn 0.2s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'var(--primary-light)',
                color: '#818cf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Bell size={18} />
            </div>
            <h3 style={{ fontSize: '1.2rem' }}>Set Price Drop Alert</h3>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
          We will notify you immediately in your dashboard when{' '}
          <strong style={{ color: '#fff' }}>{product.name}</strong> drops to or below your desired target price.
        </p>

        {/* Current Price Info */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.25rem',
          }}
        >
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Current Lowest Price:</span>
          <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#10b981' }}>
            ₹{currentLowest.toLocaleString('en-IN')}
          </span>
        </div>

        {error && (
          <div
            style={{
              padding: '0.75rem',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: '#f87171',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1rem',
            }}
          >
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Your Target Price (₹)</label>
            <input
              type="number"
              className="form-input"
              placeholder={`e.g. ${suggestedTarget}`}
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              required
              min="1"
            />
          </div>

          {/* Quick preset buttons */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setTargetPrice(Math.round(currentLowest * 0.95))}
              style={{ fontSize: '0.75rem' }}
            >
              5% Drop (₹{Math.round(currentLowest * 0.95).toLocaleString('en-IN')})
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setTargetPrice(Math.round(currentLowest * 0.9))}
              style={{ fontSize: '0.75rem' }}
            >
              10% Drop (₹{Math.round(currentLowest * 0.9).toLocaleString('en-IN')})
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ flex: 1 }}>
              {loading ? 'Setting...' : 'Set Alert'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PriceAlertModal;
