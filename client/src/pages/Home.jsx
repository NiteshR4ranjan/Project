import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  ArrowRight,
  TrendingUp,
  Tag,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Smartphone,
  Laptop,
  Headphones,
  Watch,
  Tv,
  Camera,
  Shirt,
  Activity,
  History,
  Scale,
  BellRing,
} from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';

const CATEGORY_CARDS = [
  { name: 'Mobiles', slug: 'mobiles', icon: Smartphone, count: 'Apple, Samsung, OnePlus' },
  { name: 'Laptops', slug: 'laptops', icon: Laptop, count: 'MacBook, Dell, ThinkPad' },
  { name: 'Headphones', slug: 'headphones', icon: Headphones, count: 'Sony, Bose, AirPods' },
  { name: 'Smart Watches', slug: 'smart-watches', icon: Watch, count: 'Apple Watch, Galaxy, Garmin' },
  { name: 'TVs & Displays', slug: 'tvs', icon: Tv, count: 'OLED, QLED, 4K Smart TVs' },
  { name: 'Cameras', slug: 'cameras', icon: Camera, count: 'Sony Alpha, Canon, Fujifilm' },
  { name: 'Accessories', slug: 'accessories', icon: Zap, count: 'Logitech, Anker, Chargers' },
  { name: 'Fashion & Shoes', slug: 'fashion', icon: Shirt, count: 'Nike, Adidas, Levi\'s' },
  { name: 'Fitness Gear', slug: 'fitness', icon: Activity, count: 'Fitbit, Bowflex, Spalding' },
];

const Home = () => {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [bestDeals, setBestDeals] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);
        // Fetch trending products (highest rating)
        const trendRes = await api.get('/products?sort=rating_desc&limit=8');
        if (trendRes.data?.success) {
          setTrendingProducts(trendRes.data.data);
        }

        // Fetch top deals (highest discount)
        const dealsRes = await api.get('/products?sort=discount_desc&limit=4');
        if (dealsRes.data?.success) {
          setBestDeals(dealsRes.data.data);
        }

        // Fetch recently viewed if user logged in
        const token = localStorage.getItem('dealkart_token');
        if (token) {
          const recRes = await api.get('/recently-viewed');
          if (recRes.data?.success) {
            setRecentlyViewed(recRes.data.data.slice(0, 4));
          }
        }
      } catch (err) {
        console.warn('Home data load error:', err.message);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section
        style={{
          position: 'relative',
          padding: '4.5rem 0 4rem',
          textAlign: 'center',
          overflow: 'hidden',
        }}
      >
        <div className="container">
          <div style={{ display: 'inline-flex', marginBottom: '1.25rem' }}>
            <span className="badge badge-primary" style={{ padding: '0.35rem 0.85rem', fontSize: '0.82rem' }}>
              <Zap size={14} /> Smart shopping across trusted retailers
            </span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
              lineHeight: 1.15,
              fontWeight: 800,
              maxWidth: '850px',
              margin: '0 auto 1.25rem',
              letterSpacing: '-0.03em',
            }}
          >
            Compare prices. <span style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Find better deals.</span> Shop with confidence.
          </h1>

          <p
            style={{
              color: 'var(--text-muted)',
              fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              maxWidth: '650px',
              margin: '0 auto 2.5rem',
              lineHeight: 1.6,
            }}
          >
            See live pricing from major stores, track how prices change over time, and choose the right product without the guesswork.
          </p>

          {/* Large Hero Search Box */}
          <form
            onSubmit={handleSearchSubmit}
            style={{
              maxWidth: '680px',
              margin: '0 auto 2rem',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              boxShadow: '0 12px 35px rgba(0, 0, 0, 0.5)',
              borderRadius: 'var(--radius-full)',
            }}
          >
            <input
              type="text"
              placeholder="Search for your product"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={{
                width: '100%',
                padding: '1.1rem 1.5rem 1.1rem 3.2rem',
                backgroundColor: 'rgba(19, 29, 49, 0.95)',
                border: '1.5px solid rgba(99, 102, 241, 0.4)',
                borderRadius: 'var(--radius-full)',
                color: '#ffffff',
                fontSize: '1.05rem',
                outline: 'none',
              }}
            />
            <Search
              size={22}
              style={{
                position: 'absolute',
                left: '18px',
                color: 'var(--text-muted)',
                pointerEvents: 'none',
              }}
            />
            <button
              type="submit"
              className="btn btn-primary"
              style={{
                position: 'absolute',
                right: '6px',
                padding: '0.75rem 1.5rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.95rem',
              }}
            >
              Search Products
            </button>
          </form>

          {/* Quick Search Chips */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-dim)' }}>Popular:</span>
            {['iPhone 15', 'MacBook Air M3', 'Sony WH-1000XM5', 'Apple Watch 9', 'Nike Air Max'].map((chip) => (
              <button
                key={chip}
                onClick={() => navigate(`/search?q=${encodeURIComponent(chip)}`)}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-full)',
                  padding: '0.2rem 0.75rem',
                  color: 'var(--text-muted)',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#fff';
                  e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-muted)';
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                }}
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Categories Grid */}
      <section style={{ padding: '3rem 0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.75rem' }}>
            <div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Popular Categories</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Explore the categories shoppers browse most often</p>
            </div>
            <Link to="/products" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#818cf8', fontWeight: 600, fontSize: '0.9rem' }}>
              View All <ArrowRight size={16} />
            </Link>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {CATEGORY_CARDS.map((cat) => {
              const IconComponent = cat.icon;
              return (
                <Link
                  key={cat.slug}
                  to={`/products?category=${cat.slug}`}
                  className="glass-panel"
                  style={{
                    padding: '1.35rem',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.75rem',
                    transition: 'transform 0.2s, border-color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  }}
                >
                  <div
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '14px',
                      background: 'rgba(99, 102, 241, 0.1)',
                      color: '#818cf8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <IconComponent size={24} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '2px' }}>{cat.name}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{cat.count}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trending Products Grid */}
      <section style={{ padding: '3rem 0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.75rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <TrendingUp size={20} style={{ color: '#10b981' }} />
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Trending Products</h2>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Popular picks people are comparing right now</p>
            </div>
            <Link to="/products?sort=rating_desc" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#818cf8', fontWeight: 600, fontSize: '0.9rem' }}>
              See All <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner message="Fetching verified products..." />
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {trendingProducts.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Best Deals Banner / Grid */}
      <section style={{ padding: '3rem 0' }}>
        <div className="container">
          <div
            className="glass-panel"
            style={{
              padding: '2rem',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(79, 70, 229, 0.08))',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              marginBottom: '2rem',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem',
            }}
          >
            <div>
              <span className="badge badge-green" style={{ marginBottom: '0.5rem' }}>
                ★ Best Deals
              </span>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Handpicked savings worth checking out</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                Great discounts on everyday essentials, gadgets, and lifestyle picks
              </p>
            </div>
            <Link to="/deals" className="btn btn-primary">
              Browse Active Coupons <ArrowRight size={16} />
            </Link>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {bestDeals.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Recently Viewed (if available) */}
      {recentlyViewed.length > 0 && (
        <section style={{ padding: '3rem 0' }}>
          <div className="container">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <History size={20} style={{ color: '#818cf8' }} />
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Recently Viewed by You</h2>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {recentlyViewed.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How DealKart Works */}
      <section style={{ padding: '4rem 0', borderTop: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 3rem' }}>
            <span className="badge badge-primary" style={{ marginBottom: '0.75rem' }}>Simple Workflow</span>
            <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>How DealKart Works</h2>
            <p style={{ color: 'var(--text-muted)' }}>
              Four simple steps to make sure you never overpay for your purchases online.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {[
              {
                step: '01',
                title: 'Search Product',
                desc: 'Type in the item you want and browse the latest listings in seconds.',
                icon: Search,
              },
              {
                step: '02',
                title: 'Compare Stores',
                desc: 'See live prices from major retailers side by side so you can spot the better deal quickly.',
                icon: Scale,
              },
              {
                step: '03',
                title: 'Track Price Drops',
                desc: 'Check how prices have moved over time and set alerts for the price you want.',
                icon: BellRing,
              },
              {
                step: '04',
                title: 'Save Money',
                desc: 'Pick the best option, apply the right coupon, and buy with more confidence.',
                icon: CheckCircle2,
              },
            ].map((st) => {
              const IconComp = st.icon;
              return (
                <div
                  key={st.step}
                  className="glass-panel"
                  style={{
                    padding: '1.75rem',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      fontSize: '2.5rem',
                      fontWeight: 900,
                      color: 'rgba(255, 255, 255, 0.05)',
                      position: 'absolute',
                      top: '10px',
                      right: '15px',
                    }}
                  >
                    {st.step}
                  </div>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      background: 'var(--primary-light)',
                      color: '#818cf8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '1rem',
                    }}
                  >
                    <IconComp size={20} />
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>{st.title}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6 }}>{st.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
