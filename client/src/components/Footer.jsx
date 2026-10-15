import React from 'react';
import { Link } from 'react-router-dom';
import { Tag, ShieldCheck, Zap, Scale, Heart, Sparkles } from 'lucide-react';

const Footer = () => {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--border-subtle)',
        background: 'rgba(10, 15, 26, 0.95)',
        marginTop: '5rem',
        padding: '3.5rem 0 2rem 0',
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '2.5rem',
            marginBottom: '3rem',
          }}
        >
          {/* Brand Col */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #4f46e5, #06b6d4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                }}
              >
                <Tag size={18} />
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                Deal<span style={{ color: '#6366f1' }}>Kart</span>
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              "Compare Prices. Find Better Deals."
              <br />
              Smart product price discovery platform collecting live prices across major Indian online shopping destinations.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: '#fff' }}>
              Quick Navigation
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              <li><Link to="/products" style={{ transition: 'color 0.2s' }}>All Products Catalog</Link></li>
              <li><Link to="/deals">Active Deals & Coupons</Link></li>
              <li><Link to="/compare">Multi-Product Comparison</Link></li>
              <li><Link to="/wishlist">Saved Wishlist</Link></li>
              <li><Link to="/dashboard">Personalized Dashboard</Link></li>
            </ul>
          </div>

          {/* Popular Categories */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: '#fff' }}>
              Popular Categories
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              <li><Link to="/products?category=mobiles">Smartphones & Mobiles</Link></li>
              <li><Link to="/products?category=laptops">Laptops & Ultrabooks</Link></li>
              <li><Link to="/products?category=headphones">Noise Cancelling Headphones</Link></li>
              <li><Link to="/products?category=smart-watches">Smart Watches & Fitness</Link></li>
              <li><Link to="/products?category=fashion">Footwear & Fashion</Link></li>
            </ul>
          </div>

          {/* Supported Stores Info */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: '#fff' }}>
              Supported Retail Stores
            </h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '0.75rem' }}>
              Automated price acquisition engine tracks verified prices from:
            </p>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              <span className="badge badge-green">Amazon</span>
              <span className="badge badge-primary">Flipkart</span>
              <span className="badge badge-amber">Croma</span>
              <span className="badge badge-rose">Myntra</span>
              <span className="badge badge-primary">Ajio</span>
              <span className="badge badge-green">Reliance Digital</span>
            </div>
          </div>
        </div>

        {/* Disclaimer Bar */}
        <div
          style={{
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '1.5rem',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            fontSize: '0.8rem',
            color: 'var(--text-dim)',
          }}
        >
          <div>
            © {new Date().getFullYear()} DealKart. Designed & Built for Academic Evaluation.
          </div>
          <div>
            All product names, logos, and brands are property of their respective owners. DealKart does not process payments.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
