import React from 'react';
import { ExternalLink, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

// Format relative time helper
const formatRelativeTime = (dateStr) => {
  if (!dateStr) return 'Recently';
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 5) return 'Just now';
  if (diffMins < 60) return `${diffMins} mins ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays} days ago`;
};

const PriceComparisonTable = ({ prices = [] }) => {
  if (!prices || prices.length === 0) {
    return (
      <div
        className="glass-panel"
        style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}
      >
        <AlertTriangle size={32} style={{ color: 'var(--accent-amber)', margin: '0 auto 0.75rem' }} />
        <p>No store price records currently available for this product.</p>
      </div>
    );
  }

  // Sort prices ascending so index 0 is guaranteed cheapest
  const sortedPrices = [...prices].sort((a, b) => a.price - b.price);
  const lowestPriceVal = sortedPrices[0]?.price;

  return (
    <div className="glass-panel" style={{ overflow: 'hidden' }}>
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
        <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          Live Store Price Comparison
          <span className="badge badge-primary">{sortedPrices.length} Retailers</span>
        </h3>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '680px' }}>
          <thead>
            <tr style={{ background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid var(--border-subtle)' }}>
              <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Store</th>
              <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Price</th>
              <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Original</th>
              <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Discount</th>
              <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Availability</th>
              <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Last Updated</th>
              <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {sortedPrices.map((item, index) => {
              const isCheapest = item.price === lowestPriceVal;
              const storeName = item.storeId?.name || 'Retailer';
              const productUrl = item.productUrl || item.storeId?.websiteUrl || '#';

              return (
                <tr
                  key={item._id || index}
                  className={isCheapest ? 'highlight-cheapest' : ''}
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    transition: 'background 0.2s',
                  }}
                >
                  {/* Store Name & Best Price Tag */}
                  <td style={{ padding: '1.1rem 1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div
                        style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '8px',
                          background: 'rgba(255, 255, 255, 0.08)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          color: '#ffffff',
                        }}
                      >
                        {storeName[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.95rem' }}>
                          {storeName}
                        </div>
                        {isCheapest && (
                          <span className="badge badge-green" style={{ fontSize: '0.68rem', padding: '1px 6px', marginTop: '2px' }}>
                            ★ Lowest Price
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Selling Price */}
                  <td style={{ padding: '1.1rem 1.25rem', fontWeight: 800, fontSize: '1.15rem', color: isCheapest ? '#10b981' : '#ffffff' }}>
                    ₹{item.price?.toLocaleString('en-IN')}
                  </td>

                  {/* Original Price */}
                  <td style={{ padding: '1.1rem 1.25rem', color: 'var(--text-dim)', textDecoration: 'line-through', fontSize: '0.9rem' }}>
                    {item.originalPrice > item.price ? `₹${item.originalPrice?.toLocaleString('en-IN')}` : '-'}
                  </td>

                  {/* Discount */}
                  <td style={{ padding: '1.1rem 1.25rem' }}>
                    {item.discount > 0 ? (
                      <span className="badge badge-green">
                        {item.discount}% OFF
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-dim)' }}>-</span>
                    )}
                  </td>

                  {/* Stock Availability */}
                  <td style={{ padding: '1.1rem 1.25rem' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        fontSize: '0.85rem',
                        color: item.availability === 'In Stock' ? '#34d399' : '#f87171',
                        fontWeight: 600,
                      }}
                    >
                      <CheckCircle size={14} />
                      {item.availability || 'In Stock'}
                    </span>
                  </td>

                  {/* Last Updated Timestamp */}
                  <td style={{ padding: '1.1rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Clock size={13} style={{ color: 'var(--text-dim)' }} />
                      <span>{formatRelativeTime(item.lastUpdated)}</span>
                    </div>
                  </td>

                  {/* Deal URL Button */}
                  <td style={{ padding: '1.1rem 1.25rem', textAlign: 'right' }}>
                    <a
                      href={productUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`btn ${isCheapest ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                      View Deal <ExternalLink size={13} />
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PriceComparisonTable;
