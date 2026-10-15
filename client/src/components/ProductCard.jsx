import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart, Scale, ExternalLink, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCompare } from '../context/CompareContext';
import { useToast } from './Toast';

const ProductCard = ({ product }) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isInCompare, addToCompare, removeFromCompare } = useCompare();
  const { addToast } = useToast();

  const storeResults = Array.isArray(product.storeResults) ? product.storeResults : [];
  const externalProductUrl = product.productUrl || storeResults[0]?.productUrl || '';
  const displayLowestPrice = product.lowestPrice ?? product.price ?? storeResults[0]?.price ?? 0;
  const displayHighestPrice = product.highestPrice ?? product.originalPrice ?? storeResults[0]?.originalPrice ?? displayLowestPrice;
  const displayAvailableStoresCount = product.availableStoresCount > 0 ? product.availableStoresCount : (storeResults.length || 1);
  const isLiveResult = Boolean(product.isLiveResult || externalProductUrl);
  const detailHref = product._id ? `/product/${product._id}` : externalProductUrl;
  const isFav = !isLiveResult && isInWishlist(product._id);
  const isCompared = !isLiveResult && isInCompare(product._id);

  const handleWishlistClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const added = await toggleWishlist(product._id);
      addToast(
        added ? `Added "${product.name}" to Wishlist!` : `Removed from Wishlist`,
        added ? 'success' : 'info'
      );
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleCompareClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isCompared) {
      removeFromCompare(product._id);
      addToast(`Removed from comparison`, 'info');
    } else {
      const res = addToCompare(product);
      addToast(res.message, res.success ? 'success' : 'error');
    }
  };

  return (
    <div
      className="glass-panel"
      style={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.4)';
        e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'var(--border-subtle)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Top badges & action buttons */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          right: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 2,
        }}
      >
        {product.maxDiscount > 0 ? (
          <span className="badge badge-green" style={{ fontWeight: 700 }}>
            {product.maxDiscount}% OFF
          </span>
        ) : (
          <span />
        )}

        {!isLiveResult && (
          <div style={{ display: 'flex', gap: '6px' }}>
            {/* Compare toggle */}
            <button
              onClick={handleCompareClick}
              title={isCompared ? 'Remove from compare' : 'Add to compare'}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: isCompared ? 'var(--primary)' : 'rgba(15, 23, 42, 0.75)',
                color: isCompared ? '#fff' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--border-subtle)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <Scale size={15} />
            </button>

            {/* Wishlist toggle */}
            <button
              onClick={handleWishlistClick}
              title={isFav ? 'Remove from wishlist' : 'Add to wishlist'}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: isFav ? 'var(--accent-rose-light)' : 'rgba(15, 23, 42, 0.75)',
                color: isFav ? 'var(--accent-rose)' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--border-subtle)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <Heart size={15} fill={isFav ? 'var(--accent-rose)' : 'none'} />
            </button>
          </div>
        )}
      </div>

      {/* Product Image */}
      <Link
        to={detailHref}
        style={{
          height: '210px',
          background: 'rgba(255, 255, 255, 0.02)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          overflow: 'hidden',
        }}
      >
        <img
          src={product.imageUrl}
          alt={product.name}
          loading="lazy"
          style={{
            maxHeight: '100%',
            maxWidth: '100%',
            objectFit: 'contain',
            transition: 'transform 0.3s ease',
          }}
          onError={(e) => {
            e.target.src = '/fallback-product.png';
          }}
        />
      </Link>

      {/* Product Details */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {product.brand}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.75rem', color: '#fbbf24' }}>
            <Star size={13} fill="#fbbf24" />
            <span style={{ fontWeight: 600 }}>{product.rating?.toFixed(1) || '4.5'}</span>
            <span style={{ color: 'var(--text-dim)' }}>({product.reviewCount || 100})</span>
          </div>
        </div>

        <Link to={detailHref}>
          <h3
            style={{
              fontSize: '0.98rem',
              fontWeight: 600,
              lineHeight: 1.4,
              color: '#ffffff',
              marginBottom: '0.75rem',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              minHeight: '2.8rem',
            }}
          >
            {product.name}
          </h3>
        </Link>

        {/* Pricing Block */}
        <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>
              ₹{displayLowestPrice?.toLocaleString('en-IN')}
            </span>
            {displayHighestPrice > displayLowestPrice && (
              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textDecoration: 'line-through' }}>
                ₹{displayHighestPrice?.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              In {displayAvailableStoresCount} store{displayAvailableStoresCount === 1 ? '' : 's'}
            </span>

            <Link
              to={detailHref}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#818cf8',
              }}
            >
              {isLiveResult ? 'View comparison' : 'Compare'} <ArrowRight size={14} />
            </Link>
          </div>

          {storeResults.length > 0 && (
            <div style={{ marginTop: '0.85rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {storeResults.map((store, index) => (
                <a
                  key={`${store.storeName}-${index}`}
                  href={store.productUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.2rem',
                    padding: '0.28rem 0.55rem',
                    borderRadius: '999px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.7rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  {store.storeName}
                  <span style={{ color: '#fff', fontWeight: 700 }}>₹{store.price.toLocaleString('en-IN')}</span>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
