import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search as SearchIcon, ArrowLeft, Frown } from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';

const normalizeText = (value = '') => String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

const stripVariantDetails = (value = '') => {
  const withoutParens = String(value || '').replace(/\s*\([^)]*\)/g, ' ');
  const withoutPipes = withoutParens.replace(/\s*\|.*$/g, '');

  return withoutPipes
    .replace(/\b(5g|ai|smartphone|mobile|phone|galaxy ai|with galaxy ai)\b/gi, ' ')
    .replace(/\b\d+\s*(gb|tb|mb|ram|storage)\b/gi, ' ')
    .replace(/\b(cream|lavender|mint|graphite|navy|jetblack|blue|black|white|green|red|purple|titanium|midnight|iceblue|onyx|cobalt|violet|phantom|awesome|brand new sealed packed|sealed packed)\b/gi, ' ')
    .replace(/\bby\s+[a-z0-9 .-]+$/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const getCanonicalProductKey = (title = '', searchTerm = '') => {
  const candidate = stripVariantDetails(title || searchTerm || 'Product');
  const normalizedCandidate = normalizeText(candidate);

  if (!normalizedCandidate) {
    return 'product';
  }

  return normalizedCandidate;
};

const getQueryMatchScore = (query = '', title = '') => {
  const normalizedQuery = normalizeText(query);
  const normalizedTitle = normalizeText(title);

  if (!normalizedQuery || !normalizedTitle) {
    return 0;
  }

  if (normalizedTitle.includes(normalizedQuery)) {
    return 100;
  }

  const queryTokens = normalizedQuery.split(' ').filter(Boolean);
  const titleTokens = normalizedTitle.split(' ').filter(Boolean);

  if (!queryTokens.length) {
    return 0;
  }

  let matchedTokens = 0;
  queryTokens.forEach((token) => {
    if (normalizedTitle.includes(token)) {
      matchedTokens += 1;
    }
  });

  const exactTokenMatches = queryTokens.filter((token) => titleTokens.includes(token)).length;
  const bonus = exactTokenMatches === queryTokens.length ? 20 : 0;
  const penalty = Math.max(0, titleTokens.length - queryTokens.length - 2) * 2;

  return matchedTokens * 10 + bonus - penalty;
};

const normalizeSearchResult = (item, index, searchTerm = '') => {
  const storeResults = Array.isArray(item.storeResults)
    ? item.storeResults
    : [
        {
          storeName: item.storeName || item.store || 'Retailer',
          price: Number(item.price ?? item.lowestPrice ?? 0) || 0,
          originalPrice: Number(item.originalPrice ?? item.highestPrice ?? item.price ?? 0) || 0,
          productUrl: item.productUrl || item.url || item.link || item.product_url || '',
          imageUrl: item.imageUrl || item.image || item.thumbnail || item.image_url || '',
          availability: item.availability || 'In Stock',
        },
      ];

  const normalizedStoreResults = storeResults
    .map((store) => ({
      ...store,
      storeName: store.storeName || store.store || 'Retailer',
      price: Number(store.price ?? store.lowestPrice ?? 0) || 0,
      originalPrice: Number(store.originalPrice ?? store.highestPrice ?? store.price ?? 0) || 0,
      productUrl: store.productUrl || store.url || store.link || store.product_url || '',
      imageUrl: store.imageUrl || store.image || store.thumbnail || store.image_url || '',
      availability: store.availability || 'In Stock',
    }))
    .filter((store) => Number(store.price) > 0 || store.productUrl || store.storeName);

  const name = item.name || item.title || item.product_title || searchTerm || 'Product';
  const queryMatchScore = getQueryMatchScore(searchTerm, name);

  const normalized = {
    ...item,
    _id: item._id || item.id || `live-product-${Date.now()}-${index}`,
    name,
    price: Number(item.price ?? item.lowestPrice ?? 0) || 0,
    originalPrice: Number(item.originalPrice ?? item.highestPrice ?? item.price ?? 0) || 0,
    lowestPrice: Number(item.lowestPrice ?? item.price ?? storeResults[0]?.price ?? 0) || 0,
    highestPrice: Number(item.highestPrice ?? item.originalPrice ?? item.price ?? storeResults[0]?.originalPrice ?? 0) || 0,
    imageUrl: item.imageUrl || item.image || item.thumbnail || item.image_url || storeResults[0]?.imageUrl || '',
    productUrl: item.productUrl || item.url || item.link || item.product_url || storeResults[0]?.productUrl || '',
    storeResults: normalizedStoreResults.map((store) => ({
      ...store,
      _queryMatchScore: queryMatchScore,
    })),
    availableStoresCount: Number(item.availableStoresCount ?? storeResults.length ?? 1) || 1,
    rating: Number(item.rating) || 4.5,
    reviewCount: Number(item.reviewCount) || 0,
    isLiveResult: true,
    queryMatchScore,
  };

  sessionStorage.setItem(`dealkart-live-product:${normalized._id}`, JSON.stringify(normalized));

  return normalized;
};

const aggregateSearchResults = (items = [], searchTerm = '') => {
  if (!Array.isArray(items) || items.length === 0) {
    return [];
  }

  const normalizedItems = items.map((item, index) => normalizeSearchResult(item, index, searchTerm));

  const productGroups = new Map();

  normalizedItems.forEach((item) => {
    const baseKey = getCanonicalProductKey(item.name || item.title || item.product_title || searchTerm || 'Product', searchTerm);
    const existing = productGroups.get(baseKey);

    if (existing) {
      existing.offers.push(item);
      return;
    }

    productGroups.set(baseKey, {
      baseKey,
      offers: [item],
    });
  });

  const aggregatedProducts = Array.from(productGroups.values()).map(({ offers }) => {
    const bestOffer = [...offers].sort((a, b) => {
      const scoreDiff = (b.queryMatchScore ?? 0) - (a.queryMatchScore ?? 0);
      if (scoreDiff !== 0) {
        return scoreDiff;
      }

      return (Number(a.lowestPrice ?? a.price ?? 0) || 0) - (Number(b.lowestPrice ?? b.price ?? 0) || 0);
    })[0];

    const uniqueStores = new Map();

    offers.forEach((offer) => {
      const storeResults = Array.isArray(offer.storeResults) && offer.storeResults.length > 0
        ? offer.storeResults
        : [
            {
              storeName: offer.storeName || offer.store || 'Retailer',
              price: Number(offer.price ?? offer.lowestPrice ?? 0) || 0,
              originalPrice: Number(offer.originalPrice ?? offer.highestPrice ?? offer.price ?? 0) || 0,
              productUrl: offer.productUrl || offer.url || offer.link || offer.product_url || '',
              imageUrl: offer.imageUrl || offer.image || offer.thumbnail || offer.image_url || '',
              availability: offer.availability || 'In Stock',
            },
          ];

      storeResults.forEach((store) => {
        const storeName = store.storeName || store.store || 'Retailer';
        const storeKey = normalizeText(storeName);
        const candidate = {
          ...store,
          storeName,
          price: Number(store.price ?? 0) || 0,
          originalPrice: Number(store.originalPrice ?? store.price ?? 0) || 0,
          productUrl: store.productUrl || '',
          imageUrl: store.imageUrl || '',
          availability: store.availability || 'In Stock',
        };

        const existingStore = uniqueStores.get(storeKey);

        if (!existingStore) {
          uniqueStores.set(storeKey, candidate);
          return;
        }

        const existingPrice = Number(existingStore.price) || Number.MAX_SAFE_INTEGER;
        const incomingPrice = Number(candidate.price) || Number.MAX_SAFE_INTEGER;

        if (incomingPrice < existingPrice) {
          uniqueStores.set(storeKey, candidate);
        }
      });
    });

    const storeResults = [...uniqueStores.values()].sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    const cheapestStore = storeResults[0] || {};
    const lowestPrice = storeResults.length > 0 ? Math.min(...storeResults.map((store) => Number(store.price) || 0)) : (Number(bestOffer.lowestPrice ?? bestOffer.price ?? 0) || 0);
    const highestPrice = storeResults.length > 0 ? Math.max(...storeResults.map((store) => Number(store.originalPrice ?? store.price ?? 0) || 0)) : (Number(bestOffer.highestPrice ?? bestOffer.originalPrice ?? bestOffer.price ?? 0) || 0);

    const groupedProduct = {
      ...bestOffer,
      _id: bestOffer._id || `live-product-${Date.now()}`,
      name: stripVariantDetails(bestOffer.name) || bestOffer.name,
      price: lowestPrice,
      originalPrice: highestPrice,
      lowestPrice,
      highestPrice,
      imageUrl: bestOffer.imageUrl || cheapestStore.imageUrl || '',
      productUrl: bestOffer.productUrl || cheapestStore.productUrl || '',
      storeResults,
      availableStoresCount: storeResults.length || 1,
      maxDiscount: Math.max(...storeResults.map((store) => Number(store.discount) || 0), Number(bestOffer.maxDiscount ?? 0) || 0),
      isLiveResult: true,
      queryMatchScore: bestOffer.queryMatchScore || 0,
    };

    sessionStorage.setItem(`dealkart-live-product:${groupedProduct._id}`, JSON.stringify(groupedProduct));

    return groupedProduct;
  });

  return aggregatedProducts.sort((a, b) => {
    const scoreDiff = (b.queryMatchScore ?? 0) - (a.queryMatchScore ?? 0);
    if (scoreDiff !== 0) {
      return scoreDiff;
    }

    return (Number(a.lowestPrice ?? a.price ?? 0) || 0) - (Number(b.lowestPrice ?? b.price ?? 0) || 0);
  });
};

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [recommendedProduct, setRecommendedProduct] = useState(null);
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query.trim()) {
        setProducts([]);
        setRecommendations([]);
        setRecommendedProduct(null);
        setSources([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await api.get(`/products/search?q=${encodeURIComponent(query)}`);
        if (res.data?.success) {
          const normalizedProducts = aggregateSearchResults(res.data.data || [], query);
          setProducts(normalizedProducts);
          setRecommendations(Array.isArray(res.data.recommendations) ? res.data.recommendations : []);
          setRecommendedProduct(res.data.recommendedProduct || null);
          setSources(Array.isArray(res.data.sources) ? res.data.sources : []);
        }
      } catch (err) {
        console.error('Search query error:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query]);

  return (
    <div style={{ padding: '2.5rem 0 4rem' }}>
      <div className="container">
        {/* Search header */}
        <div style={{ marginBottom: '2rem' }}>
          <Link
            to="/products"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--text-muted)',
              fontSize: '0.85rem',
              marginBottom: '1rem',
            }}
          >
            <ArrowLeft size={16} /> Back to all products
          </Link>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.4rem' }}>
            Search Results for <span style={{ color: '#818cf8' }}>"{query}"</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Found {products.length} product{products.length === 1 ? '' : 's'} matching your search
          </p>
        </div>

        {loading ? (
          <LoadingSpinner message={`Searching stores for "${query}"...`} />
        ) : (
          <>
            {recommendedProduct && (
              <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', gap: '1rem', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#a5b4fc', fontWeight: 700 }}>
                      DealKart's Recommended Choice
                    </div>
                    <h2 style={{ fontSize: '1.4rem', margin: '0.35rem 0 0', color: '#fff' }}>{recommendedProduct.productName}</h2>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span className="badge badge-primary">Best Overall</span>
                    <span className="badge badge-green">{recommendedProduct.overallScore || recommendedProduct.rating || 0}/10</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 220px) 1fr', gap: '1.25rem', alignItems: 'center' }}>
                  <img
                    src={recommendedProduct.imageUrl || '/fallback-product.png'}
                    alt={recommendedProduct.productName}
                    style={{ width: '100%', height: '180px', objectFit: 'contain', borderRadius: '12px', background: 'rgba(255,255,255,0.02)' }}
                    onError={(e) => {
                      e.target.src = '/fallback-product.png';
                    }}
                  />

                  <div>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                      <span style={{ color: '#fbbf24', fontWeight: 700 }}>⭐ {recommendedProduct.rating || 4.5}/5</span>
                      <span style={{ color: 'var(--text-muted)' }}>Reviews analyzed: {recommendedProduct.reviewCount || 0}</span>
                      <span style={{ color: '#10b981', fontWeight: 700 }}>₹{Number(recommendedProduct.price || 0).toLocaleString('en-IN')}</span>
                    </div>

                    <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: 1.6 }}>
                      {recommendedProduct.summary || 'AI review analysis is available for this product.'}
                    </p>

                    <div style={{ marginBottom: '0.75rem' }}>
                      <div style={{ fontSize: '0.8rem', color: '#a5b4fc', fontWeight: 700, marginBottom: '0.4rem' }}>Why we recommend it</div>
                      <ul style={{ margin: 0, paddingLeft: '1.1rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
                        {(recommendedProduct.positivePoints || []).slice(0, 4).map((point, idx) => (
                          <li key={`${recommendedProduct.productName}-positive-${idx}`}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {sources.length > 0 && (
              <div className="glass-panel" style={{ padding: '1rem 1.25rem', marginBottom: '2rem' }}>
                <div style={{ fontWeight: 700, color: '#fff', marginBottom: '0.65rem' }}>Sources</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {sources.slice(0, 8).map((source, index) => (
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

            {recommendations.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#fff' }}>Top 5 Product Recommendations</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                  {recommendations.map((item, idx) => (
                    <div key={`${item.productName}-${idx}`} className="glass-panel" style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span className="badge badge-primary">{item.label || 'Recommended'}</span>
                        <span style={{ color: '#fbbf24', fontWeight: 700 }}>⭐ {Number(item.rating || 0).toFixed(1)}</span>
                      </div>
                      <div style={{ fontWeight: 700, color: '#fff', marginBottom: '0.4rem' }}>{item.productName}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>{item.store}</div>
                      <div style={{ color: '#10b981', fontWeight: 700, marginBottom: '0.75rem' }}>₹{Number(item.price || 0).toLocaleString('en-IN')}</div>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: 1.5, marginBottom: '0.8rem' }}>
                        {item.summary || 'AI review analysis pending.'}
                      </p>
                      {(item.positivePoints || []).length > 0 && (
                        <div style={{ fontSize: '0.75rem', color: '#a5b4fc', marginBottom: '0.2rem' }}>Best signals</div>
                      )}
                      <ul style={{ margin: 0, paddingLeft: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: 1.6 }}>
                        {(item.positivePoints || []).slice(0, 2).map((point, pIdx) => (
                          <li key={`${item.productName}-rec-positive-${pIdx}`}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {products.length > 0 ? (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                  gap: '1.5rem',
                }}
              >
                {products.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
            ) : (
              <div
                className="glass-panel"
                style={{
                  padding: '4rem 2rem',
                  textAlign: 'center',
                  maxWidth: '600px',
                  margin: '2rem auto',
                }}
              >
                <Frown size={48} style={{ color: 'var(--text-dim)', margin: '0 auto 1rem' }} />
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No direct matches found</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  We couldn't find any products matching "{query}". Try checking for spelling errors or search for common brands like Apple, Sony, Samsung, or Nike.
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  {['iPhone 15', 'MacBook', 'Sony Headphones', 'Apple Watch', 'Nike Shoes'].map((s) => (
                    <Link
                      key={s}
                      to={`/search?q=${encodeURIComponent(s)}`}
                      className="btn btn-secondary btn-sm"
                    >
                      {s}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Search;
