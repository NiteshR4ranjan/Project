import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  RefreshCw,
  Package,
  Store,
  Tag,
  Users,
  Bell,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Database,
  Sparkles,
} from 'lucide-react';
import api from '../services/api';
import { useToast } from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminDashboard = () => {
  const { addToast } = useToast();
  const [stats, setStats] = useState(null);
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingPrices, setUpdatingPrices] = useState(false);
  const [lastUpdateResult, setLastUpdateResult] = useState(null);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statRes, sourceRes] = await Promise.all([
        api.get('/admin/statistics'),
        api.get('/admin/sources'),
      ]);

      if (statRes.data?.success) setStats(statRes.data.data);
      if (sourceRes.data?.success) setSources(sourceRes.data.data);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
      addToast('Failed to fetch admin statistics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleUpdatePricesNow = async () => {
    try {
      setUpdatingPrices(true);
      setLastUpdateResult(null);
      addToast('Requesting fresh grounded data from Gemini...', 'info');

      const res = await api.post('/admin/update-prices');
      if (res.data?.success) {
        setLastUpdateResult(res.data.data);
        addToast(res.data.message || 'Price collection completed successfully!', 'success');
        // Refresh stats
        fetchAdminData();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Price update execution failed', 'error');
    } finally {
      setUpdatingPrices(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading Administrator Control Panel..." size={45} />;
  }

  return (
    <div style={{ padding: '2.5rem 0 5rem' }}>
      <div className="container">
        {/* Admin Header */}
        <div
          className="glass-panel"
          style={{
            padding: '2rem 2.5rem',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(79, 70, 229, 0.12))',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: 'var(--radius-xl)',
            marginBottom: '2.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1.5rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span className="badge badge-amber">Administrator Console</span>
              <span className="badge badge-green">Engine Online</span>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>
              Gemini Review Intelligence Center
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '4px' }}>
              Manage catalog items, grounded price records, review analyses, users, and recommendation activity.
            </p>
          </div>

          {/* Prominent "Update Prices Now" Button */}
          <button
            onClick={handleUpdatePricesNow}
            disabled={updatingPrices}
            className="btn btn-primary btn-lg"
            style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              fontWeight: 700,
            }}
          >
            <RefreshCw size={18} className={updatingPrices ? 'animate-spin' : ''} />
            {updatingPrices ? 'Refreshing...' : 'Refresh Gemini Data'}
          </button>
        </div>

        {/* Price Update Live Result Banner */}
        {lastUpdateResult && (
          <div
            className="glass-panel animate-fade-in"
            style={{
              padding: '1.5rem',
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              marginBottom: '2rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem' }}>
              <CheckCircle2 size={18} /> Gemini Refresh Finished!
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Refreshed grounded product data for {lastUpdateResult.productsUpdated} products in {lastUpdateResult.durationSeconds} seconds.
            </p>
          </div>
        )}

        {/* Stats Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1.25rem',
            marginBottom: '3rem',
          }}
        >
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>
              Total Products
              <Package size={16} style={{ color: '#818cf8' }} />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginTop: '0.5rem' }}>
              {stats?.totalProducts || 0}
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>
              Gemini Requests
              <Sparkles size={16} style={{ color: '#10b981' }} />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginTop: '0.5rem' }}>
              {stats?.recentGeminiRequests || 0}
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>
              Review Analyses
              <Database size={16} style={{ color: '#06b6d4' }} />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginTop: '0.5rem' }}>
              {stats?.totalAnalyses || 0}
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>
              Active Coupons
              <Tag size={16} style={{ color: '#fbbf24' }} />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginTop: '0.5rem' }}>
              {stats?.totalCoupons || 0}
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>
              Registered Users
              <Users size={16} style={{ color: '#a5b4fc' }} />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginTop: '0.5rem' }}>
              {stats?.totalUsers || 0}
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>
              Price Alerts
              <Bell size={16} style={{ color: '#f43f5e' }} />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginTop: '0.5rem' }}>
              {stats?.totalAlerts || 0}
            </div>
          </div>
        </div>

        {/* Quick Admin Navigation Panels */}
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1.25rem' }}>
          Management Modules
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.5rem',
            marginBottom: '3rem',
          }}
        >
          <Link
            to="/admin/products"
            className="glass-panel"
            style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              transition: 'transform 0.2s, border-color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.4)';
              e.currentTarget.style.transform = 'translateY(-3px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--primary-light)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Package size={20} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Product Management</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5 }}>
              Add new catalog products, edit specifications, or delete items.
            </p>
            <span style={{ color: '#818cf8', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginTop: 'auto' }}>
              Manage Products <ArrowRight size={13} />
            </span>
          </Link>

          <Link
            to="/admin/prices"
            className="glass-panel"
            style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              transition: 'transform 0.2s, border-color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.4)';
              e.currentTarget.style.transform = 'translateY(-3px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Store size={20} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Store Price Management</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5 }}>
              Manually add, edit, or remove store prices and view last fetched records.
            </p>
            <span style={{ color: '#10b981', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginTop: 'auto' }}>
              Manage Prices <ArrowRight size={13} />
            </span>
          </Link>

          <Link
            to="/admin/coupons"
            className="glass-panel"
            style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              transition: 'transform 0.2s, border-color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.4)';
              e.currentTarget.style.transform = 'translateY(-3px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.1)', color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Tag size={20} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Coupon Management</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5 }}>
              Create new discount promo codes, edit details, or toggle active status.
            </p>
            <span style={{ color: '#fbbf24', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginTop: 'auto' }}>
              Manage Coupons <ArrowRight size={13} />
            </span>
          </Link>

          <Link
            to="/admin/users"
            className="glass-panel"
            style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              transition: 'transform 0.2s, border-color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.4)';
              e.currentTarget.style.transform = 'translateY(-3px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={20} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>User Management</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5 }}>
              Inspect user registrations and promote or revoke administrator roles.
            </p>
            <span style={{ color: '#818cf8', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginTop: 'auto' }}>
              Manage Users <ArrowRight size={13} />
            </span>
          </Link>

          <Link
            to="/admin/sources"
            className="glass-panel"
            style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              transition: 'transform 0.2s, border-color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.4)';
              e.currentTarget.style.transform = 'translateY(-3px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Database size={20} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Gemini Source Monitor</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5 }}>
              Monitor grounded source records and Gemini retrieval status.
            </p>
            <span style={{ color: '#06b6d4', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginTop: 'auto' }}>
              View Sources <ArrowRight size={13} />
            </span>
          </Link>

          <Link
            to="/admin/review-analyses"
            className="glass-panel"
            style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              transition: 'transform 0.2s, border-color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(129, 140, 248, 0.4)';
              e.currentTarget.style.transform = 'translateY(-3px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(129, 140, 248, 0.1)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={20} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Review Analysis Records</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5 }}>
              Inspect and manage cached Gemini recommendations, product analyses, and AI comparisons.
            </p>
            <span style={{ color: '#818cf8', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginTop: 'auto' }}>
              Manage Analyses <ArrowRight size={13} />
            </span>
          </Link>
        </div>

        {/* Source Status Table Overview */}
        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Gemini Retrieval Sources Health</h3>
            <Link to="/admin/sources" style={{ fontSize: '0.82rem', color: '#818cf8', fontWeight: 600 }}>
              View Details →
            </Link>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>Source Name</th>
                  <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>Adapter Type</th>
                  <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>Health Status</th>
                  <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>Last Successful Fetch</th>
                  <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>Tracked Products</th>
                </tr>
              </thead>
              <tbody>
                {sources.map((st) => (
                  <tr key={st._id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.85rem 1.25rem', fontWeight: 700, color: '#fff' }}>{st.name}</td>
                    <td style={{ padding: '0.85rem 1.25rem' }}>
                      <span className="badge badge-primary">{st.sourceType?.toUpperCase()}</span>
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem' }}>
                      <span className={`badge ${st.lastFetchStatus === 'SUCCESS' ? 'badge-green' : st.lastFetchStatus === 'PARTIAL' ? 'badge-amber' : 'badge-rose'}`}>
                        {st.lastFetchStatus || 'ACTIVE'}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                      {st.lastSuccessfulFetch ? new Date(st.lastSuccessfulFetch).toLocaleString() : 'Never'}
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem', fontWeight: 700, color: '#fff' }}>
                      {st.productsTracked || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
