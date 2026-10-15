import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ArrowRight, Frown, Scale } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCompare } from '../context/CompareContext';
import { useToast } from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';

const Wishlist = () => {
  const { wishlist, loading, toggleWishlist } = useWishlist();
  const { isInCompare, addToCompare } = useCompare();
  const { addToast } = useToast();

  const handleRemove = async (productId, productName) => {
    try {
      await toggleWishlist(productId);
      addToast(`Removed "${productName}" from wishlist`, 'info');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleCompare = (product) => {
    const res = addToCompare(product);
    addToast(res.message, res.success ? 'success' : 'error');
  };

  if (loading) {
    return <LoadingSpinner message="Fetching your saved products..." />;
  }

  return (
    <div style={{ padding: '2.5rem 0 5rem' }}>
      <div className="container">
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.25rem' }}>
            <Heart size={24} style={{ color: 'var(--accent-rose)' }} fill="var(--accent-rose)" />
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>My Wishlist</h1>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {wishlist.length} product{wishlist.length === 1 ? '' : 's'} saved for price tracking
          </p>
        </div>

        {wishlist.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {wishlist.map((item) => {
              const p = item.productId;
              if (!p) return null;

              return (
                <div
                  key={item._id}
                  className="glass-panel"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                  <button
                    onClick={() => handleRemove(p._id, p.name)}
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'rgba(244, 63, 94, 0.15)',
                      color: 'var(--accent-rose)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid rgba(244, 63, 94, 0.3)',
                      zIndex: 2,
                    }}
                    title="Remove from wishlist"
                  >
                    <Trash2 size={15} />
                  </button>

                  <Link
                    to={`/product/${p._id}`}
                    style={{
                      height: '200px',
                      background: 'rgba(255, 255, 255, 0.02)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '1.5rem',
                    }}
                  >
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                    />
                  </Link>

                  <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#818cf8', textTransform: 'uppercase' }}>
                      {p.brand}
                    </span>

                    <Link to={`/product/${p._id}`}>
                      <h3
                        style={{
                          fontSize: '0.95rem',
                          fontWeight: 700,
                          lineHeight: 1.4,
                          color: '#fff',
                          margin: '0.25rem 0 0.75rem',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          minHeight: '2.6rem',
                        }}
                      >
                        {p.name}
                      </h3>
                    </Link>

                    <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Lowest available price:</div>
                      <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#10b981', marginBottom: '0.75rem' }}>
                        ₹{p.lowestPrice?.toLocaleString('en-IN')}
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Link to={`/product/${p._id}`} className="btn btn-primary btn-sm" style={{ flex: 1 }}>
                          View Details <ArrowRight size={13} />
                        </Link>
                        <button
                          onClick={() => handleCompare(p)}
                          className="btn btn-secondary btn-sm"
                          title="Add to Compare"
                        >
                          <Scale size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            className="glass-panel"
            style={{ padding: '4rem 2rem', textAlign: 'center', maxWidth: '600px', margin: '2rem auto' }}
          >
            <Heart size={48} style={{ color: 'var(--text-dim)', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>Your wishlist is empty</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Explore products across categories and save your favorite electronics, gadgets, or apparel to monitor price cuts.
            </p>
            <Link to="/products" className="btn btn-primary">
              Discover Products
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
