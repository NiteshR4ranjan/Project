import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Heart,
  Bell,
  History,
  Scale,
  CheckCircle,
  AlertCircle,
  Clock,
  Trash2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
  const { user } = useAuth();
  const { wishlist, refreshWishlist } = useWishlist();
  const { addToast } = useToast();

  const [alerts, setAlerts] = useState([]);
  const [recentViewed, setRecentViewed] = useState([]);
  const [compareHistory, setCompareHistory] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [activeTab, setActiveTab] = useState('alerts');
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [alertsRes, recentRes, compRes, notifRes, aiRecRes] = await Promise.all([
        api.get('/alerts'),
        api.get('/recently-viewed'),
        api.get('/compare/history'),
        api.get('/notifications'),
        api.get('/products/recommendations/recent'),
      ]);

      if (alertsRes.data?.success) setAlerts(alertsRes.data.data);
      if (recentRes.data?.success) setRecentViewed(recentRes.data.data);
      if (compRes.data?.success) setCompareHistory(compRes.data.data);
      if (notifRes.data?.success) setNotifications(notifRes.data.data);
      if (aiRecRes.data?.success) setAiRecommendations(aiRecRes.data.data);
    } catch (err) {
      console.warn('Dashboard data fetch warning:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleDeleteAlert = async (alertId) => {
    try {
      await api.delete(`/alerts/${alertId}`);
      setAlerts((prev) => prev.filter((a) => a._id !== alertId));
      addToast('Price alert removed', 'info');
    } catch (err) {
      addToast('Failed to delete alert', 'error');
    }
  };

  const handleMarkNotificationRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      addToast('All notifications marked as read', 'success');
    } catch (err) {
      console.error(err);
    }
  };

  const activeAlertsCount = alerts.filter((a) => a.status === 'active').length;
  const triggeredAlertsCount = alerts.filter((a) => a.status === 'triggered').length;

  if (loading) {
    return <LoadingSpinner message="Gathering your personalized dashboard..." size={45} />;
  }

  return (
    <div style={{ padding: '2.5rem 0 5rem' }}>
      <div className="container">
        {/* Welcome Header */}
        <div
          className="glass-panel"
          style={{
            padding: '2rem 2.5rem',
            background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.15), rgba(6, 182, 212, 0.08))',
            border: '1px solid rgba(99, 102, 241, 0.3)',
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
            <span className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>
              Personalized Review Intelligence Hub
            </span>
            <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>
              Welcome back, <span style={{ color: '#818cf8' }}>{user?.name}</span>!
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '4px' }}>
              Manage alerts, wishlist items, recent products, comparison history, and AI recommendations.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/products" className="btn btn-primary btn-sm">
              Explore Products
            </Link>
            <Link to="/deals" className="btn btn-secondary btn-sm">
              View Coupons
            </Link>
          </div>
        </div>

        {/* 5 Key Statistics Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
            gap: '1.25rem',
            marginBottom: '3rem',
          }}
        >
          {/* Wishlist */}
          <div
            className="glass-panel"
            style={{ padding: '1.25rem', cursor: 'pointer' }}
            onClick={() => setActiveTab('wishlist')}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Wishlist Items</span>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(244, 63, 94, 0.1)', color: 'var(--accent-rose)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Heart size={16} fill="var(--accent-rose)" />
              </div>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>{wishlist.length}</div>
          </div>

          {/* Active Alerts */}
          <div
            className="glass-panel"
            style={{ padding: '1.25rem', cursor: 'pointer' }}
            onClick={() => setActiveTab('alerts')}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active Alerts</span>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bell size={16} />
              </div>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#818cf8' }}>{activeAlertsCount}</div>
          </div>

          {/* Triggered Alerts */}
          <div
            className="glass-panel"
            style={{ padding: '1.25rem', cursor: 'pointer' }}
            onClick={() => setActiveTab('alerts')}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: 600 }}>Triggered Alerts</span>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle size={16} />
              </div>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981' }}>{triggeredAlertsCount}</div>
          </div>

          {/* Recently Viewed */}
          <div
            className="glass-panel"
            style={{ padding: '1.25rem', cursor: 'pointer' }}
            onClick={() => setActiveTab('recent')}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Recently Viewed</span>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.1)', color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <History size={16} />
              </div>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>{recentViewed.length}</div>
          </div>

          {/* Products Compared */}
          <div
            className="glass-panel"
            style={{ padding: '1.25rem', cursor: 'pointer' }}
            onClick={() => setActiveTab('comparison')}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Comparisons</span>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Scale size={16} />
              </div>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>{compareHistory.length}</div>
          </div>

          <div
            className="glass-panel"
            style={{ padding: '1.25rem', cursor: 'pointer' }}
            onClick={() => setActiveTab('recommendations')}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>AI Recommendations</span>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(129, 140, 248, 0.1)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={16} />
              </div>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>{aiRecommendations.length}</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            borderBottom: '1px solid var(--border-subtle)',
            marginBottom: '2rem',
            overflowX: 'auto',
          }}
        >
          {[
            { id: 'alerts', label: `Price Alerts (${alerts.length})`, icon: Bell },
            { id: 'notifications', label: `Notifications (${notifications.filter((n) => !n.read).length} unread)`, icon: Sparkles },
            { id: 'wishlist', label: `My Wishlist (${wishlist.length})`, icon: Heart },
            { id: 'recent', label: `Recently Viewed (${recentViewed.length})`, icon: History },
            { id: 'comparison', label: `Comparison History (${compareHistory.length})`, icon: Scale },
            { id: 'recommendations', label: `AI Recommendations (${aiRecommendations.length})`, icon: Sparkles },
          ].map((tab) => {
            const isCur = activeTab === tab.id;
            const IconC = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.75rem 1.25rem',
                  borderBottom: isCur ? '2px solid var(--primary)' : '2px solid transparent',
                  color: isCur ? '#fff' : 'var(--text-muted)',
                  fontWeight: isCur ? 700 : 500,
                  fontSize: '0.9rem',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s',
                }}
              >
                <IconC size={16} /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content 1: Price Alerts */}
        {activeTab === 'alerts' && (
          <div>
            {alerts.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {alerts.map((al) => {
                  const p = al.productId;
                  if (!p) return null;
                  const isTriggered = al.status === 'triggered';

                  return (
                    <div
                      key={al._id}
                      className="glass-panel"
                      style={{
                        padding: '1.25rem 1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '1rem',
                        borderLeft: isTriggered ? '4px solid #10b981' : '4px solid #818cf8',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                        <img
                          src={p.imageUrl}
                          alt=""
                          style={{ width: '56px', height: '56px', objectFit: 'contain', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '4px' }}
                        />
                        <div>
                          <Link to={`/product/${p._id}`} style={{ fontWeight: 700, fontSize: '1.02rem', color: '#fff' }}>
                            {p.name}
                          </Link>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '4px', fontSize: '0.85rem' }}>
                            <span style={{ color: 'var(--text-muted)' }}>
                              Target Alert Price:{' '}
                              <strong style={{ color: '#fff' }}>₹{al.targetPrice?.toLocaleString('en-IN')}</strong>
                            </span>
                            <span style={{ color: 'var(--text-muted)' }}>
                              Current Lowest:{' '}
                              <strong style={{ color: '#10b981' }}>₹{p.lowestPrice?.toLocaleString('en-IN')}</strong>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {isTriggered ? (
                          <span className="badge badge-green" style={{ fontSize: '0.8rem', padding: '4px 10px' }}>
                            <CheckCircle size={14} /> Price Drop Reached!
                          </span>
                        ) : (
                          <span className="badge badge-primary" style={{ fontSize: '0.8rem', padding: '4px 10px' }}>
                            <Clock size={14} /> Active Monitoring
                          </span>
                        )}

                        <Link to={`/product/${p._id}`} className="btn btn-secondary btn-sm">
                          View Deals
                        </Link>

                        <button
                          onClick={() => handleDeleteAlert(al._id)}
                          style={{ color: 'var(--accent-rose)', padding: '6px' }}
                          title="Delete alert"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Bell size={40} style={{ color: 'var(--text-dim)', margin: '0 auto 0.75rem' }} />
                <h3>No active price alerts</h3>
                <p style={{ marginTop: '0.5rem', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
                  Set a price alert on any product page to be notified the moment its price drops below your target.
                </p>
                <Link to="/products" className="btn btn-primary btn-sm">Browse Products</Link>
              </div>
            )}
          </div>
        )}

        {/* Tab Content 2: Notifications */}
        {activeTab === 'notifications' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
              <button onClick={handleMarkAllRead} className="btn btn-secondary btn-sm">
                Mark All Read
              </button>
            </div>

            {notifications.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {notifications.map((n) => (
                  <div
                    key={n._id}
                    className="glass-panel"
                    style={{
                      padding: '1rem 1.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1rem',
                      background: n.read ? 'rgba(19, 29, 49, 0.5)' : 'rgba(79, 70, 229, 0.1)',
                      borderColor: n.read ? 'var(--border-subtle)' : 'rgba(99, 102, 241, 0.4)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: n.type === 'price_drop' ? 'rgba(16, 185, 129, 0.15)' : 'var(--primary-light)',
                          color: n.type === 'price_drop' ? '#10b981' : '#818cf8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Bell size={18} />
                      </div>
                      <div>
                        <div style={{ color: '#fff', fontSize: '0.92rem', fontWeight: n.read ? 500 : 700 }}>
                          {n.message}
                        </div>
                        <div style={{ color: 'var(--text-dim)', fontSize: '0.78rem', marginTop: '2px' }}>
                          {new Date(n.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {!n.read && (
                      <button
                        onClick={() => handleMarkNotificationRead(n._id)}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <h3>No notifications</h3>
                <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>You're all caught up!</p>
              </div>
            )}
          </div>
        )}

        {/* Tab Content 3: Wishlist */}
        {activeTab === 'wishlist' && (
          <div>
            {wishlist.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
                {wishlist.map((w) => {
                  const p = w.productId;
                  if (!p) return null;
                  return (
                    <div key={w._id} className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column' }}>
                      <img src={p.imageUrl} alt="" style={{ height: '140px', objectFit: 'contain', margin: '0 auto 0.75rem' }} />
                      <span style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 600 }}>{p.brand}</span>
                      <h4 style={{ fontSize: '0.9rem', color: '#fff', margin: '0.2rem 0 0.5rem' }}>{p.name}</h4>
                      <div style={{ marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 800, color: '#10b981' }}>₹{p.lowestPrice?.toLocaleString('en-IN')}</span>
                        <Link to={`/product/${p._id}`} className="btn btn-secondary btn-sm" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>
                          View
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <h3>No products in wishlist</h3>
                <Link to="/products" className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }}>Browse Catalog</Link>
              </div>
            )}
          </div>
        )}

        {/* Tab Content 4: Recently Viewed */}
        {activeTab === 'recent' && (
          <div>
            {recentViewed.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
                {recentViewed.map((p) => (
                  <div key={p._id} className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column' }}>
                    <img src={p.imageUrl} alt="" style={{ height: '140px', objectFit: 'contain', margin: '0 auto 0.75rem' }} />
                    <span style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 600 }}>{p.brand}</span>
                    <h4 style={{ fontSize: '0.9rem', color: '#fff', margin: '0.2rem 0 0.5rem' }}>{p.name}</h4>
                    <div style={{ marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 800, color: '#10b981' }}>₹{p.lowestPrice?.toLocaleString('en-IN')}</span>
                      <Link to={`/product/${p._id}`} className="btn btn-secondary btn-sm" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>
                        View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <h3>No recent viewing history recorded yet.</h3>
              </div>
            )}
          </div>
        )}

        {/* Tab Content 5: Comparison History */}
        {activeTab === 'comparison' && (
          <div>
            {compareHistory.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {compareHistory.map((item) => (
                  <div
                    key={item._id}
                    className="glass-panel"
                    style={{
                      padding: '1.25rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '1rem',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>
                        Compared on {new Date(item.comparedAt).toLocaleDateString()} at{' '}
                        {new Date(item.comparedAt).toLocaleTimeString()}
                      </div>
                      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        {item.productIds?.map((prod) => (
                          <div
                            key={prod._id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.4rem',
                              background: 'rgba(255,255,255,0.04)',
                              borderRadius: 'var(--radius-full)',
                              padding: '0.25rem 0.65rem',
                              fontSize: '0.8rem',
                            }}
                          >
                            <img src={prod.imageUrl} alt="" style={{ width: '18px', height: '18px', objectFit: 'contain' }} />
                            <span>{prod.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Link
                      to={`/compare?ids=${item.productIds?.map((p) => p._id).join(',')}`}
                      className="btn btn-secondary btn-sm"
                    >
                      Re-compare <ArrowRight size={13} />
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <h3>No product comparisons saved</h3>
                <p style={{ marginTop: '0.5rem' }}>Compare 2-4 products to save and revisit them here.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div>
            {aiRecommendations.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {aiRecommendations.map((item) => {
                  const rec = item.recommendedProduct || {};
                  return (
                    <div key={item._id} className="glass-panel" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                      <div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '0.35rem' }}>
                          Search: {item.query || item.productName}
                        </div>
                        <h4 style={{ color: '#fff', fontSize: '1rem', marginBottom: '0.45rem' }}>
                          {rec.productName || item.productName}
                        </h4>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <span className="badge badge-primary">{rec.label || 'Recommended'}</span>
                          <span className="badge badge-green">{Number(rec.overallScore || 0).toFixed(1)}/10</span>
                          {rec.price > 0 && <span className="badge badge-secondary">₹{Number(rec.price).toLocaleString('en-IN')}</span>}
                        </div>
                      </div>
                      <Link to={`/search?q=${encodeURIComponent(item.query || item.productName || '')}`} className="btn btn-secondary btn-sm">
                        Open Search <ArrowRight size={13} />
                      </Link>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <h3>No AI recommendations yet</h3>
                <Link to="/products" className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }}>Start Searching</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
