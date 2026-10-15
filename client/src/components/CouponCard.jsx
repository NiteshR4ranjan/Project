import React, { useState } from 'react';
import { Copy, Check, Calendar, Tag } from 'lucide-react';
import { useToast } from './Toast';

const CouponCard = ({ coupon }) => {
  const { addToast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(coupon.code);
    setCopied(true);
    addToast(`Coupon "${coupon.code}" copied to clipboard!`, 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const storeName = coupon.storeId?.name || 'Retailer';
  const expiryDate = new Date(coupon.endDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div
      className="glass-panel"
      style={{
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        transition: 'transform 0.2s, border-color 0.2s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.4)')}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
    >
      <div>
        {/* Store & Discount Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <span className="badge badge-primary">{storeName}</span>
          <span className="badge badge-green">
            {coupon.discountType === 'percentage'
              ? `${coupon.discountValue}% OFF`
              : `₹${coupon.discountValue.toLocaleString('en-IN')} OFF`}
          </span>
        </div>

        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem', lineHeight: 1.4 }}>
          {coupon.title}
        </h3>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '1.25rem' }}>
          {coupon.description || 'Exclusive deal verified across stores.'}
        </p>
      </div>

      <div>
        {/* Expiry */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-dim)', fontSize: '0.78rem', marginBottom: '0.85rem' }}>
          <Calendar size={13} />
          <span>Valid until {expiryDate}</span>
        </div>

        {/* Code Box & Working Copy Button */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(0, 0, 0, 0.35)',
            border: '1.5px dashed rgba(99, 102, 241, 0.4)',
            borderRadius: 'var(--radius-md)',
            padding: '0.4rem 0.6rem 0.4rem 1rem',
          }}
        >
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: '1rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              color: '#818cf8',
            }}
          >
            {coupon.code}
          </span>

          <button
            onClick={handleCopy}
            className={`btn btn-sm ${copied ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              fontSize: '0.78rem',
              padding: '0.4rem 0.75rem',
              background: copied ? '#10b981' : undefined,
              borderColor: copied ? '#10b981' : undefined,
            }}
          >
            {copied ? (
              <>
                <Check size={14} /> Copied!
              </>
            ) : (
              <>
                <Copy size={14} /> Copy Code
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CouponCard;
