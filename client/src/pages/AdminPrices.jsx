import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Store, Plus, Edit2, Trash2, ArrowLeft, X, RefreshCw } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminPrices = () => {
  const { addToast } = useToast();
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [prices, setPrices] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPrice, setEditingPrice] = useState(null);
  const [form, setForm] = useState({
    productId: '',
    storeId: '',
    price: '',
    originalPrice: '',
    discount: '',
    availability: 'In Stock',
    productUrl: '',
  });

  const loadBaseData = async () => {
    try {
      setLoading(true);
      const [prodRes, storeRes] = await Promise.all([
        api.get('/products?limit=50'),
        api.get('/admin/sources'),
      ]);

      if (prodRes.data?.success && prodRes.data.data.length > 0) {
        setProducts(prodRes.data.data);
        const firstProdId = prodRes.data.data[0]._id;
        setSelectedProductId(firstProdId);
        loadPricesForProduct(firstProdId);
      }
      if (storeRes.data?.success) {
        setStores(storeRes.data.data);
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to load pricing data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadPricesForProduct = async (prodId) => {
    try {
      const res = await api.get(`/products/${prodId}/prices`);
      if (res.data?.success) {
        setPrices(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load prices:', err);
    }
  };

  useEffect(() => {
    loadBaseData();
  }, []);

  const handleProductChange = (prodId) => {
    setSelectedProductId(prodId);
    loadPricesForProduct(prodId);
  };

  const handleTriggerRefresh = async () => {
    try {
      setUpdating(true);
      addToast('Refreshing live prices for selected product...', 'info');
      const res = await api.post('/prices/update', { productId: selectedProductId });
      if (res.data?.success) {
        addToast(res.data.message || 'Prices refreshed successfully!', 'success');
        loadPricesForProduct(selectedProductId);
      }
    } catch (err) {
      addToast('Failed to refresh prices', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingPrice(null);
    setForm({
      productId: selectedProductId,
      storeId: stores[0]?._id || '',
      price: '',
      originalPrice: '',
      discount: '',
      availability: 'In Stock',
      productUrl: '',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditingPrice(p);
    setForm({
      productId: p.productId,
      storeId: p.storeId?._id || p.storeId,
      price: p.price,
      originalPrice: p.originalPrice,
      discount: p.discount || '',
      availability: p.availability || 'In Stock',
      productUrl: p.productUrl || '',
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this store price record?')) {
      try {
        await api.delete(`/prices/${id}`);
        setPrices((prev) => prev.filter((p) => p._id !== id));
        addToast('Store price record deleted', 'success');
      } catch (err) {
        addToast('Failed to delete price', 'error');
      }
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPrice) {
        await api.put(`/prices/${editingPrice._id}`, form);
        addToast('Price updated successfully!', 'success');
      } else {
        await api.post('/prices', form);
        addToast('Price created successfully!', 'success');
      }
      setModalOpen(false);
      loadPricesForProduct(selectedProductId);
    } catch (err) {
      addToast(err.response?.data?.message || 'Operation failed', 'error');
    }
  };

  const selectedProduct = products.find((p) => p._id === selectedProductId);

  return (
    <div style={{ padding: '2.5rem 0 5rem' }}>
      <div className="container">
        {/* Navigation Breadcrumb */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Link
            to="/admin"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--text-muted)',
              fontSize: '0.85rem',
            }}
          >
            <ArrowLeft size={16} /> Back to Admin Dashboard
          </Link>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Store Price Management</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Manage retail store prices, trigger live refreshes, or manually edit entries
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={handleTriggerRefresh}
              disabled={updating}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <RefreshCw size={15} className={updating ? 'animate-spin' : ''} />
              {updating ? 'Fetching...' : 'Fetch Live Prices'}
            </button>
            <button onClick={handleOpenAdd} className="btn btn-primary btn-sm">
              <Plus size={15} /> Add Store Price
            </button>
          </div>
        </div>

        {/* Product Selector Bar */}
        <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff', whiteSpace: 'nowrap' }}>
            Select Product:
          </span>
          <select
            value={selectedProductId}
            onChange={(e) => handleProductChange(e.target.value)}
            className="form-select"
            style={{ flex: 1, minWidth: '240px' }}
          >
            {products.map((p) => (
              <option key={p._id} value={p._id} style={{ background: '#0f172a' }}>
                {p.brand} - {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Prices Table */}
        {loading ? (
          <LoadingSpinner message="Loading pricing tables..." />
        ) : prices.length > 0 ? (
          <div className="glass-panel" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                Prices for: <span style={{ color: '#818cf8' }}>{selectedProduct?.name}</span>
              </h3>
              <span className="badge badge-primary">{prices.length} Stores Recorded</span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid var(--border-subtle)' }}>
                    <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Store Name</th>
                    <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Selling Price</th>
                    <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Original MRP</th>
                    <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Discount</th>
                    <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Stock Status</th>
                    <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Last Status</th>
                    <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {prices.map((pr, idx) => (
                    <tr key={pr._id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: '#fff' }}>
                        {pr.storeId?.name || 'Store'}
                        {idx === 0 && (
                          <span className="badge badge-green" style={{ marginLeft: '8px', fontSize: '0.65rem' }}>
                            Cheapest
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '1rem 1.25rem', fontWeight: 800, color: '#10b981', fontSize: '1.05rem' }}>
                        ₹{pr.price?.toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '1rem 1.25rem', color: 'var(--text-dim)', textDecoration: 'line-through' }}>
                        ₹{pr.originalPrice?.toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <span className="badge badge-green">{pr.discount || 0}% OFF</span>
                      </td>
                      <td style={{ padding: '1rem 1.25rem', fontSize: '0.85rem' }}>
                        {pr.availability || 'In Stock'}
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <span className="badge badge-primary">{pr.lastFetchStatus || 'SUCCESS'}</span>
                      </td>
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                          <button onClick={() => handleOpenEdit(pr)} className="btn btn-secondary btn-sm">
                            <Edit2 size={13} />
                          </button>
                          <button onClick={() => handleDelete(pr._id)} className="btn btn-secondary btn-sm" style={{ color: 'var(--accent-rose)' }}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <h3>No store prices currently recorded for this product</h3>
            <button onClick={handleOpenAdd} className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }}>
              Add First Store Price
            </button>
          </div>
        )}

        {/* Modal */}
        {modalOpen && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(8px)',
              zIndex: 2000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
            }}
            onClick={() => setModalOpen(false)}
          >
            <div
              className="glass-panel"
              style={{ width: '100%', maxWidth: '480px', padding: '2rem' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                  {editingPrice ? 'Edit Store Price' : 'Add Store Price'}
                </h3>
                <button onClick={() => setModalOpen(false)} style={{ color: 'var(--text-muted)' }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleFormSubmit}>
                <div className="form-group">
                  <label className="form-label">Store</label>
                  <select
                    className="form-select"
                    value={form.storeId}
                    onChange={(e) => setForm({ ...form, storeId: e.target.value })}
                    required
                  >
                    {stores.map((s) => (
                      <option key={s._id} value={s._id} style={{ background: '#0f172a' }}>
                        {s.name} ({s.sourceType?.toUpperCase()})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Selling Price (₹)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      required
                      min="1"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Original MRP (₹)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={form.originalPrice}
                      onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Product URL on Store</label>
                  <input
                    type="url"
                    className="form-input"
                    value={form.productUrl}
                    onChange={(e) => setForm({ ...form, productUrl: e.target.value })}
                    placeholder="https://..."
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Stock Availability</label>
                  <select
                    className="form-select"
                    value={form.availability}
                    onChange={(e) => setForm({ ...form, availability: e.target.value })}
                  >
                    <option value="In Stock" style={{ background: '#0f172a' }}>In Stock</option>
                    <option value="Out of Stock" style={{ background: '#0f172a' }}>Out of Stock</option>
                    <option value="Limited Stock" style={{ background: '#0f172a' }}>Limited Stock</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                  <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                    {editingPrice ? 'Save Changes' : 'Create Price'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPrices;
