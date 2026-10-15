import React, { useState, useEffect } from 'react';
import { Tag, Sparkles, Filter, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import CouponCard from '../components/CouponCard';
import LoadingSpinner from '../components/LoadingSpinner';

const Deals = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStore, setSelectedStore] = useState('all');

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        setLoading(true);
        const res = await api.get('/coupons');
        if (res.data?.success) {
          setCoupons(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load coupons:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCoupons();
  }, []);

  // Filter coupons by store name
  const filteredCoupons = coupons.filter((c) => {
    if (selectedStore === 'all') return true;
    return c.storeId?.name?.toLowerCase() === selectedStore.toLowerCase();
  });

  const stores = ['all', 'Amazon', 'Flipkart', 'Croma', 'Myntra', 'Ajio', 'Reliance Digital'];

  return (
    <div style={{ padding: '2.5rem 0 5rem' }}>
      <div className="container">
        {/* Hero Banner */}
        <div
          className="glass-panel"
          style={{
            padding: '2.5rem',
            background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.12), rgba(16, 185, 129, 0.08))',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: 'var(--radius-xl)',
            marginBottom: '2.5rem',
            textAlign: 'center',
          }}
        >
          <div style={{ display: 'inline-flex', marginBottom: '0.75rem' }}>
            <span className="badge badge-green">
              <Sparkles size={14} /> Verified & Active Coupons
            </span>
          </div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 800, marginBottom: '0.75rem' }}>
            Exclusive Store Deals & Discount Promo Codes
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '600px', margin: '0 auto' }}>
            Copy verified discount codes to redeem instant cashbacks and savings during checkout across leading online platforms.
          </p>
        </div>

        {/* Store Filter Tabs */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            overflowX: 'auto',
            paddingBottom: '1rem',
            marginBottom: '2rem',
          }}
        >
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginRight: '0.5rem', whiteSpace: 'nowrap' }}>
            <Filter size={15} /> Store:
          </span>
          {stores.map((st) => {
            const isSelected = selectedStore === st;
            return (
              <button
                key={st}
                onClick={() => setSelectedStore(st)}
                style={{
                  padding: '0.45rem 1rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.85rem',
                  fontWeight: isSelected ? 700 : 500,
                  background: isSelected ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
                  color: isSelected ? '#fff' : 'var(--text-muted)',
                  border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {st === 'all' ? 'All Stores' : st}
              </button>
            );
          })}
        </div>

        {/* Coupons Grid */}
        {loading ? (
          <LoadingSpinner message="Checking active store promo codes..." />
        ) : filteredCoupons.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {filteredCoupons.map((c) => (
              <CouponCard key={c._id} coupon={c} />
            ))}
          </div>
        ) : (
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <h3>No active coupons found for {selectedStore}</h3>
            <p style={{ marginTop: '0.5rem' }}>Check back soon or select "All Stores" to see other active discounts.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Deals;
