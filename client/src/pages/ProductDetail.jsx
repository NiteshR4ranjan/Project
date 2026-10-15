import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star,
  Heart,
  Scale,
  Bell,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Info,
} from 'lucide-react';
import api from '../services/api';
import PriceComparisonTable from '../components/PriceComparisonTable';
import PriceHistoryChart from '../components/PriceHistoryChart';
import PriceAlertModal from '../components/PriceAlertModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { useWishlist } from '../context/WishlistContext';
import { useCompare } from '../context/CompareContext';
import { useToast } from '../components/Toast';

const ProductDetail = () => {
  const { id } = useParams();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isInCompare, addToCompare, removeFromCompare } = useCompare();
  const { addToast } = useToast();

  const [product, setProduct] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [historyStats, setHistoryStats] = useState({});
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alertModalOpen, setAlertModalOpen] = useState(false);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);

        const res = await api.get(`/products/${id}`);
        if (res.data?.success) {
          setProduct(res.data.data);

          const token = localStorage.getItem('dealkart_token');
          if (token) {
            api.post('/recently-viewed', { productId: id }).catch(() => {});
          }
        }

        const histRes = await api.get(`/products/${id}/price-history`);
        if (histRes.data?.success) {
          setHistoryData(histRes.data.data);
          setHistoryStats(histRes.data.stats);
        }

        const analysisRes = await api.get(`/products/${id}/review-analysis`);
        if (analysisRes.data?.success) {
          setAnalysis(analysisRes.data.data || null);
        }
      } catch (err) {
        console.error('Failed to load product details:', err.message);

        const liveResult = sessionStorage.getItem(`dealkart-live-product:${id}`);
        if (liveResult) {
          const parsed = JSON.parse(liveResult);
          const storeResults = Array.isArray(parsed.storeResults) && parsed.storeResults.length > 0
            ? parsed.storeResults
            : [
                {
                  storeName: parsed.storeName || parsed.store || 'Retailer',
                  price: Number(parsed.price ?? parsed.lowestPrice ?? 0) || 0,
                  originalPrice: Number(parsed.originalPrice ?? parsed.highestPrice ?? parsed.price ?? 0) || 0,
                  productUrl: parsed.productUrl || '#',
                  imageUrl: parsed.imageUrl || '',
                  availability: parsed.availability || 'In Stock',
                },
              ];

          setProduct({
            ...parsed,
            _id: parsed._id || id,
            brand: parsed.brand || parsed.storeName || parsed.store || 'Retailer',
            description: parsed.description || `Live price comparison for ${parsed.name}.`,
            category: parsed.category || { name: 'Electronics' },
            lowestPrice: Number(parsed.lowestPrice ?? parsed.price ?? storeResults[0]?.price ?? 0) || 0,
            highestPrice: Number(parsed.highestPrice ?? parsed.originalPrice ?? parsed.price ?? storeResults[0]?.originalPrice ?? 0) || 0,
            availableStoresCount: Number(parsed.availableStoresCount ?? storeResults.length ?? 1) || 1,
            maxDiscount: Number(parsed.maxDiscount ?? 0) || 0,
            ratings: Number(parsed.rating) || 4.5,
            reviewCount: Number(parsed.reviewCount) || 0,
            prices: storeResults.map((store, index) => ({
              _id: `${id}-store-${index}`,
              price: Number(store.price) || 0,
              originalPrice: Number(store.originalPrice) || Number(store.price) || 0,
              discount: store.discount || 0,
              availability: store.availability || 'In Stock',
              lastUpdated: new Date().toISOString(),
              productUrl: store.productUrl || '#',
              storeId: { name: store.storeName || store.store || 'Retailer' },
            })),
          });

          if (parsed.reviewAnalysis) {
            setAnalysis({
              productName: parsed.name,
              overallScore: parsed.reviewAnalysis.overallScore || parsed.reviewAnalysis.score || 0,
              reviewCount: parsed.reviewCount || 0,
              rating: parsed.rating || 0,
              summary: parsed.reviewAnalysis.summary || '',
              positivePoints: parsed.reviewAnalysis.positivePoints || [],
              negativePoints: parsed.reviewAnalysis.negativePoints || [],
              recommendationReason: parsed.reviewAnalysis.recommendationReason || '',
              sources: parsed.sources || [],
            });
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id]);

  if (loading) {
    return <LoadingSpinner message="Loading product specs and store prices..." size={45} />;
  }

  if (!product) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <h2>Product not found</h2>
        <p style={{ color: 'var(--text-muted)', margin: '1rem 0' }}>The product you requested does not exist or has been removed.</p>
        <Link to="/products" className="btn btn-primary">Browse Catalog</Link>
      </div>
    );
  }

  const isFav = isInWishlist(product._id);
  const isCompared = isInCompare(product._id);

  const handleWishlistToggle = async () => {
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

  const handleCompareToggle = () => {
    if (isCompared) {
      removeFromCompare(product._id);
      addToast('Removed from comparison', 'info');
    } else {
      const res = addToCompare(product);
      addToast(res.message, res.success ? 'success' : 'error');
    }
  };

  // Convert specifications Map/Object to key-value array
  const specsEntries = product.specifications
    ? Object.entries(product.specifications)
    : [];

  return (
    <div style={{ padding: '2rem 0 5rem' }}>
      <div className="container">
        {/* Breadcrumb */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Link
            to="/products"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--text-muted)',
              fontSize: '0.85rem',
            }}
          >
            <ArrowLeft size={16} /> Back to Products
          </Link>
        </div>

        {/* Product Hero Layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(300px, 460px) 1fr',
            gap: '2.5rem',
            marginBottom: '3rem',
          }}
          className="product-detail-hero"
        >
          {/* Left: Product Image Box */}
          <div
            className="glass-panel"
            style={{
              padding: '2.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '400px',
              background: 'rgba(255, 255, 255, 0.02)',
              position: 'relative',
            }}
          >
            {product.maxDiscount > 0 && (
              <span
                className="badge badge-green"
                style={{ position: 'absolute', top: '16px', left: '16px', fontSize: '0.85rem' }}
              >
                {product.maxDiscount}% OFF
              </span>
            )}
            <img
              src={product.imageUrl}
              alt={product.name}
              style={{
                maxHeight: '340px',
                maxWidth: '100%',
                objectFit: 'contain',
              }}
              onError={(e) => {
                e.target.src = '/fallback-product.png';
              }}
            />
          </div>

          {/* Right: Product Info & Actions */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <span className="badge badge-primary">{product.brand}</span>
              {product.category?.name && (
                <span className="badge badge-secondary" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  {product.category.name}
                </span>
              )}
            </div>

            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, lineHeight: 1.3, marginBottom: '0.75rem' }}>
              {product.name}
            </h1>

            {/* Rating Stars */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#fbbf24', fontSize: '0.9rem' }}>
                <Star size={16} fill="#fbbf24" />
                <span style={{ fontWeight: 700 }}>{product.rating?.toFixed(1) || '4.5'}</span>
              </div>
              <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                Based on {product.reviewCount || 100} verified store reviews
              </span>
            </div>

            {/* Pricing Card */}
            <div
              className="glass-panel"
              style={{
                padding: '1.25rem 1.5rem',
                background: 'rgba(16, 185, 129, 0.05)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                marginBottom: '1.75rem',
              }}
            >
              <div style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
                Cheapest Available Price
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
                <span style={{ fontSize: '2.2rem', fontWeight: 900, color: '#10b981' }}>
                  ₹{product.lowestPrice?.toLocaleString('en-IN')}
                </span>
                {product.highestPrice > product.lowestPrice && (
                  <span style={{ fontSize: '1.1rem', color: 'var(--text-dim)', textDecoration: 'line-through' }}>
                    ₹{product.highestPrice?.toLocaleString('en-IN')}
                  </span>
                )}
                {product.maxDiscount > 0 && (
                  <span className="badge badge-green">Save up to {product.maxDiscount}%</span>
                )}
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '4px' }}>
                Compared across {product.availableStoresCount || 3} retailers (Amazon, Flipkart, Croma, etc.)
              </p>
            </div>

            {/* Action Buttons: Wishlist, Compare, Set Alert */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
              <button
                onClick={() => setAlertModalOpen(true)}
                className="btn btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Bell size={17} /> Set Price Alert
              </button>

              <button
                onClick={handleWishlistToggle}
                className="btn btn-secondary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: isFav ? 'var(--accent-rose)' : undefined,
                }}
              >
                <Heart size={17} fill={isFav ? 'var(--accent-rose)' : 'none'} />
                {isFav ? 'Wishlisted' : 'Add to Wishlist'}
              </button>

              <button
                onClick={handleCompareToggle}
                className="btn btn-secondary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: isCompared ? '#818cf8' : undefined,
                }}
              >
                <Scale size={17} />
                {isCompared ? 'In Compare' : 'Add to Compare'}
              </button>
            </div>

            {/* Description */}
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem', color: '#fff' }}>
                About this item
              </h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                {product.description || 'Verified product from official manufacturer listings and leading retail catalogs.'}
              </p>
            </div>
          </div>
        </div>

        {analysis && (
          <div className="glass-panel" style={{ padding: '1.75rem', marginBottom: '3rem' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={18} style={{ color: '#818cf8' }} /> AI Review Analysis
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Overall Review Score</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981', marginTop: '0.25rem' }}>{Number(analysis.overallScore || 0).toFixed(1)}/10</div>
              </div>

              <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Based on</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginTop: '0.25rem' }}>{analysis.reviewCount || product.reviewCount || 0} reviews</div>
              </div>

              <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>DealKart Recommendation</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#818cf8', marginTop: '0.25rem' }}>{analysis.recommendationLabel || 'Recommended'}</div>
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ color: '#fff', fontWeight: 700, marginBottom: '0.5rem' }}>AI Summary</div>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>{analysis.summary || 'Review summary is currently unavailable.'}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
              <div>
                <h4 style={{ fontSize: '0.95rem', marginBottom: '0.75rem', color: '#10b981' }}>What users liked</h4>
                <ul style={{ margin: 0, paddingLeft: '1rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
                  {(analysis.positivePoints || []).length > 0 ? analysis.positivePoints.map((point, index) => (
                    <li key={`positive-${index}`}>{point}</li>
                  )) : <li>No positive points available yet.</li>}
                </ul>
              </div>

              <div>
                <h4 style={{ fontSize: '0.95rem', marginBottom: '0.75rem', color: '#f87171' }}>Common complaints</h4>
                <ul style={{ margin: 0, paddingLeft: '1rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
                  {(analysis.negativePoints || []).length > 0 ? analysis.negativePoints.map((point, index) => (
                    <li key={`negative-${index}`}>{point}</li>
                  )) : <li>No major complaints identified.</li>}
                </ul>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ color: '#fff', fontWeight: 700, marginBottom: '0.4rem' }}>Why we recommend it</div>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>{analysis.recommendationReason || 'DealKart recommends this product based on the available review profile.'}</p>
            </div>

            {Array.isArray(analysis.sources) && analysis.sources.length > 0 && (
              <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
                <div style={{ color: '#fff', fontWeight: 700, marginBottom: '0.65rem' }}>Sources</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {analysis.sources.slice(0, 8).map((source, index) => (
                    <a
                      key={`${source.url}-${index}`}
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="badge badge-secondary"
                      style={{ maxWidth: '260px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    >
                      {source.title || source.url}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Section 1: Live Price Comparison Table */}
        <div style={{ marginBottom: '3rem' }}>
          <PriceComparisonTable prices={product.prices} />
        </div>

        {/* Section 2: Recharts Historical Price Chart */}
        <div style={{ marginBottom: '3rem' }}>
          <PriceHistoryChart historyData={historyData} stats={historyStats} />
        </div>

        {/* Section 3: Technical Specifications */}
        {specsEntries.length > 0 && (
          <div className="glass-panel" style={{ padding: '1.75rem', overflow: 'hidden' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Info size={18} style={{ color: '#818cf8' }} /> Technical Specifications
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              {specsEntries.map(([key, val]) => (
                <div
                  key={key}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '0.85rem 1rem',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                    {key}
                  </span>
                  <span style={{ fontSize: '0.92rem', color: '#ffffff', fontWeight: 600, marginTop: '2px' }}>
                    {String(val)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Price Alert Modal */}
      <PriceAlertModal
        isOpen={alertModalOpen}
        onClose={() => setAlertModalOpen(false)}
        product={product}
      />

      <style>{`
        @media (max-width: 860px) {
          .product-detail-hero {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductDetail;
