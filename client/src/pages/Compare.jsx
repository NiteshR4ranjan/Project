import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Scale,
  Trash2,
  ExternalLink,
  CheckCircle,
  XCircle,
  Plus,
  Star,
  ArrowRight,
  Info,
  Sparkles,
} from 'lucide-react';
import api from '../services/api';
import { useCompare } from '../context/CompareContext';
import LoadingSpinner from '../components/LoadingSpinner';

const Compare = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { compareList, removeFromCompare, clearCompare, addToCompare } = useCompare();

  const [comparedProducts, setComparedProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lowestPriceVal, setLowestPriceVal] = useState(0);
  const [aiComparison, setAiComparison] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  // Available products dropdown for quick slot filling
  const [quickAddList, setQuickAddList] = useState([]);

  // Fetch comparison data based on either URL query `ids` or context compareList
  useEffect(() => {
    const fetchComparison = async () => {
      const idsFromUrl = searchParams.get('ids');
      let targetIds = [];

      if (idsFromUrl) {
        targetIds = idsFromUrl.split(',').filter((id) => id.trim().length > 0);
      } else if (compareList.length > 0) {
        targetIds = compareList.map((p) => p._id);
      }

      if (targetIds.length === 0) {
        setComparedProducts([]);
        return;
      }

      try {
        setLoading(true);
        const res = await api.get(`/compare?ids=${targetIds.join(',')}`);
        if (res.data?.success) {
          setComparedProducts(res.data.data);
          setLowestPriceVal(res.data.lowestComparedPrice);

          // Log comparison if authenticated
          const token = localStorage.getItem('dealkart_token');
          if (token && targetIds.length >= 2) {
            api.post('/compare/log', { productIds: targetIds }).catch(() => {});
          }
        }
      } catch (err) {
        console.warn('Comparison query error:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchComparison();
  }, [searchParams, compareList]);

  // Load a quick list of popular products to easily add into an empty slot
  useEffect(() => {
    api.get('/products?limit=12').then((res) => {
      if (res.data?.success) {
        setQuickAddList(res.data.data);
      }
    }).catch(() => {});
  }, []);

  const handleRemoveProduct = (productId) => {
    removeFromCompare(productId);
    const remaining = comparedProducts.filter((p) => p._id !== productId);
    setComparedProducts(remaining);
    if (remaining.length > 0) {
      setSearchParams({ ids: remaining.map((r) => r._id).join(',') });
    } else {
      setSearchParams({});
    }
  };

  const handleAddProduct = (prod) => {
    addToCompare(prod);
    const updated = [...comparedProducts, prod];
    setComparedProducts(updated);
    setSearchParams({ ids: updated.map((r) => r._id).join(',') });
  };

  const handleAiComparison = async () => {
    if (comparedProducts.length < 2) return;

    try {
      setAiLoading(true);
      setAiError('');
      const res = await api.post('/compare/ai', {
        productIds: comparedProducts.map((product) => product._id),
      });

      if (res.data?.success) {
        setAiComparison(res.data.data);
      }
    } catch (err) {
      setAiError(err.response?.data?.message || 'AI analysis is temporarily unavailable.');
    } finally {
      setAiLoading(false);
    }
  };

  // Compile all unique specification keys across all compared products
  const allSpecKeys = Array.from(
    new Set(
      comparedProducts.flatMap((p) =>
        p.specifications ? Object.keys(p.specifications) : []
      )
    )
  );

  return (
    <div style={{ padding: '2.5rem 0 5rem' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
              <Scale size={24} style={{ color: '#818cf8' }} />
              <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Side-by-Side Product Comparison</h1>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Compare technical specifications, ratings, and real prices across {comparedProducts.length} items (2-4 items)
            </p>
          </div>

          {comparedProducts.length > 0 && (
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              {comparedProducts.length >= 2 && (
                <button
                  onClick={handleAiComparison}
                  className="btn btn-primary btn-sm"
                  disabled={aiLoading}
                >
                  <Sparkles size={15} /> {aiLoading ? 'Comparing...' : 'AI Comparison'}
                </button>
              )}
              <button
                onClick={() => {
                  clearCompare();
                  setComparedProducts([]);
                  setSearchParams({});
                  setAiComparison(null);
                }}
                className="btn btn-secondary btn-sm"
                style={{ color: 'var(--accent-rose)' }}
              >
                <Trash2 size={15} /> Clear All
              </button>
            </div>
          )}
        </div>

        {(aiComparison || aiError) && (
          <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Sparkles size={18} style={{ color: '#818cf8' }} /> AI Comparison
            </h3>
            {aiError ? (
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>{aiError}</p>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                  <span className="badge badge-primary">{aiComparison.productName || 'Recommended Choice'}</span>
                  <span className="badge badge-green">{Number(aiComparison.overallScore || 0).toFixed(1)}/10</span>
                </div>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '0.85rem' }}>
                  {aiComparison.summary || aiComparison.recommendationReason || 'Gemini compared the selected products.'}
                </p>
                {(aiComparison.positivePoints || []).length > 0 && (
                  <ul style={{ margin: 0, paddingLeft: '1.1rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
                    {aiComparison.positivePoints.slice(0, 4).map((point, index) => (
                      <li key={`ai-comparison-${index}`}>{point}</li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>
        )}

        {loading ? (
          <LoadingSpinner message="Assembling comparison metrics..." />
        ) : comparedProducts.length > 0 ? (
          <div className="glass-panel" style={{ overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '760px' }}>
                <tbody>
                  {/* Row 1: Product Header Card */}
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'rgba(255, 255, 255, 0.02)' }}>
                    <td style={{ padding: '1.5rem', width: '200px', fontWeight: 700, color: 'var(--text-muted)' }}>
                      Product Overview
                    </td>
                    {comparedProducts.map((p) => (
                      <td key={p._id} style={{ padding: '1.5rem', verticalAlign: 'top', width: `${80 / comparedProducts.length}%` }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <span className="badge badge-primary">{p.brand}</span>
                            <button
                              onClick={() => handleRemoveProduct(p._id)}
                              style={{ color: 'var(--text-dim)', padding: '2px' }}
                              title="Remove"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>

                          <div style={{ height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                            />
                          </div>

                          <h3 style={{ fontSize: '0.98rem', fontWeight: 700, lineHeight: 1.4, minHeight: '2.8rem' }}>
                            {p.name}
                          </h3>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#fbbf24', fontSize: '0.82rem' }}>
                            <Star size={14} fill="#fbbf24" />
                            <span style={{ fontWeight: 700 }}>{p.rating?.toFixed(1) || '4.5'}</span>
                            <span style={{ color: 'var(--text-dim)' }}>({p.reviewCount || 100})</span>
                          </div>

                          <Link to={`/product/${p._id}`} className="btn btn-secondary btn-sm" style={{ alignSelf: 'flex-start' }}>
                            View Product <ArrowRight size={13} />
                          </Link>
                        </div>
                      </td>
                    ))}

                    {/* Empty add slots if less than 4 */}
                    {comparedProducts.length < 4 && (
                      <td style={{ padding: '1.5rem', width: `${80 / 4}%`, verticalAlign: 'middle', textAlign: 'center' }}>
                        <div
                          style={{
                            border: '1.5px dashed rgba(255, 255, 255, 0.15)',
                            borderRadius: 'var(--radius-md)',
                            padding: '2rem 1rem',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.75rem',
                          }}
                        >
                          <Plus size={24} style={{ color: 'var(--text-dim)' }} />
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Add Another Item</span>
                          <select
                            onChange={(e) => {
                              const found = quickAddList.find((x) => x._id === e.target.value);
                              if (found) handleAddProduct(found);
                            }}
                            className="form-select"
                            style={{ fontSize: '0.78rem', maxWidth: '170px' }}
                            defaultValue=""
                          >
                            <option value="" disabled>Choose Product...</option>
                            {quickAddList
                              .filter((q) => !comparedProducts.some((cp) => cp._id === q._id))
                              .map((q) => (
                                <option key={q._id} value={q._id}>
                                  {q.brand} - {q.name.slice(0, 24)}...
                                </option>
                              ))}
                          </select>
                        </div>
                      </td>
                    )}
                  </tr>

                  {/* Row 2: Price Row */}
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '1.25rem 1.5rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                      Lowest Price
                    </td>
                    {comparedProducts.map((p) => {
                      const isCheapestGlobal = p.lowestPrice === lowestPriceVal;
                      return (
                        <td
                          key={p._id}
                          className={isCheapestGlobal ? 'highlight-cheapest' : ''}
                          style={{ padding: '1.25rem 1.5rem' }}
                        >
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                            <span style={{ fontSize: '1.4rem', fontWeight: 900, color: isCheapestGlobal ? '#10b981' : '#ffffff' }}>
                              ₹{p.lowestPrice?.toLocaleString('en-IN')}
                            </span>
                            {p.highestPrice > p.lowestPrice && (
                              <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', textDecoration: 'line-through' }}>
                                ₹{p.highestPrice?.toLocaleString('en-IN')}
                              </span>
                            )}
                          </div>
                          {isCheapestGlobal && (
                            <span className="badge badge-green" style={{ marginTop: '4px', fontSize: '0.7rem' }}>
                              ★ Best Value Choice
                            </span>
                          )}
                        </td>
                      );
                    })}
                    {comparedProducts.length < 4 && <td />}
                  </tr>

                  {/* Row 3: Cheapest Store */}
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '1.25rem 1.5rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                      Cheapest Store
                    </td>
                    {comparedProducts.map((p) => (
                      <td key={p._id} style={{ padding: '1.25rem 1.5rem', fontWeight: 600 }}>
                        <span className="badge badge-primary">{p.cheapestStore || 'Amazon'}</span>
                      </td>
                    ))}
                    {comparedProducts.length < 4 && <td />}
                  </tr>

                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '1.25rem 1.5rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                      Review Score
                    </td>
                    {comparedProducts.map((p) => {
                      const score = p.reviewAnalysis?.overallScore || p.reviewAnalysis?.score || p.overallScore || 0;
                      return (
                        <td key={p._id} style={{ padding: '1.25rem 1.5rem' }}>
                          <span className="badge badge-green">{Number(score || 0).toFixed(1)}/10</span>
                        </td>
                      );
                    })}
                    {comparedProducts.length < 4 && <td />}
                  </tr>

                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '1.25rem 1.5rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                      Review Signals
                    </td>
                    {comparedProducts.map((p) => {
                      const positives = p.reviewAnalysis?.positivePoints || [];
                      const negatives = p.reviewAnalysis?.negativePoints || [];
                      return (
                        <td key={p._id} style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.84rem', lineHeight: 1.55 }}>
                          <div style={{ color: '#10b981', fontWeight: 700, marginBottom: '0.35rem' }}>
                            {positives[0] || 'Positive review data unavailable'}
                          </div>
                          <div style={{ color: '#f87171' }}>
                            {negatives[0] || 'Complaint data unavailable'}
                          </div>
                        </td>
                      );
                    })}
                    {comparedProducts.length < 4 && <td />}
                  </tr>

                  {/* Row 4: Stores Count */}
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '1.25rem 1.5rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                      Available In
                    </td>
                    {comparedProducts.map((p) => (
                      <td key={p._id} style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                        {p.prices?.length || 3} Stores tracked
                      </td>
                    ))}
                    {comparedProducts.length < 4 && <td />}
                  </tr>

                  {/* Specification Rows */}
                  {allSpecKeys.map((specKey) => (
                    <tr key={specKey} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {specKey}
                      </td>
                      {comparedProducts.map((p) => {
                        const val = p.specifications?.[specKey] || '-';
                        return (
                          <td key={p._id} style={{ padding: '1rem 1.5rem', fontSize: '0.88rem', color: '#ffffff', fontWeight: 500 }}>
                            {String(val)}
                          </td>
                        );
                      })}
                      {comparedProducts.length < 4 && <td />}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div
            className="glass-panel"
            style={{ padding: '4rem 2rem', textAlign: 'center', maxWidth: '650px', margin: '2rem auto' }}
          >
            <Scale size={48} style={{ color: '#818cf8', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>No products in comparison</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              Select 2 to 4 products from the catalog to compare prices, technical specifications, and available store deals side by side.
            </p>
            <Link to="/products" className="btn btn-primary">
              Explore Products to Compare
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Compare;
