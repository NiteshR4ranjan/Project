import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Tag, Plus, Edit2, Trash2, ArrowLeft, X, Calendar, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminCoupons = () => {
  const { addToast } = useToast();
  const [coupons, setCoupons] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [form, setForm] = useState({
    code: '',
    storeId: '',
    title: '',
    discountType: 'percentage',
    discountValue: 10,
    endDate: '',
    description: '',
    active: true,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [coupRes, storeRes] = await Promise.all([
        api.get('/coupons'),
        api.get('/admin/sources'),
      ]);

      if (coupRes.data?.success) setCoupons(coupRes.data.data);
      if (storeRes.data?.success) setStores(storeRes.data.data);
    } catch (err) {
      console.error(err);
      addToast('Failed to load coupons', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingCoupon(null);
    const inThirtyDays = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    setForm({
      code: '',
      storeId: stores[0]?._id || '',
      title: '',
      discountType: 'percentage',
      discountValue: 10,
      endDate: inThirtyDays,
      description: '',
      active: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (c) => {
    setEditingCoupon(c);
    setForm({
      code: c.code,
      storeId: c.storeId?._id || c.storeId,
      title: c.title,
      discountType: c.discountType || 'percentage',
      discountValue: c.discountValue || 10,
      endDate: c.endDate ? new Date(c.endDate).toISOString().split('T')[0] : '',
      description: c.description || '',
      active: c.active !== undefined ? c.active : true,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id, code) => {
    if (window.confirm(`Delete coupon "${code}"?`)) {
      try {
        await api.delete(`/coupons/${id}`);
        setCoupons((prev) => prev.filter((c) => c._id !== id));
        addToast('Coupon deleted successfully', 'success');
      } catch (err) {
        addToast('Failed to delete coupon', 'error');
      }
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCoupon) {
        await api.put(`/coupons/${editingCoupon._id}`, form);
        addToast('Coupon updated successfully!', 'success');
      } else {
        await api.post('/coupons', form);
        addToast('Coupon created successfully!', 'success');
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Operation failed', 'error');
    }
  };

  return (
    <div style={{ padding: '2.5rem 0 5rem' }}>
      <div className="container">
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
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Coupon Management</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Create, edit, and publish promotional discount coupons
            </p>
          </div>

          <button onClick={handleOpenAdd} className="btn btn-primary">
            <Plus size={16} /> Add New Coupon
          </button>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading active coupons..." />
        ) : (
          <div className="glass-panel" style={{ overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid var(--border-subtle)' }}>
                    <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Code</th>
                    <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Store</th>
                    <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Title & Details</th>
                    <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Discount</th>
                    <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Valid Until</th>
                    <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((c) => (
                    <tr key={c._id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#818cf8', fontSize: '0.95rem' }}>
                          {c.code}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <span className="badge badge-primary">{c.storeId?.name || 'Retailer'}</span>
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem' }}>{c.title}</div>
                        <div style={{ color: 'var(--text-dim)', fontSize: '0.78rem' }}>{c.description}</div>
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <span className="badge badge-green">
                          {c.discountType === 'percentage' ? `${c.discountValue}%` : `₹${c.discountValue}`} OFF
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {new Date(c.endDate).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                          <button onClick={() => handleOpenEdit(c)} className="btn btn-secondary btn-sm" title="Edit">
                            <Edit2 size={13} />
                          </button>
                          <button onClick={() => handleDelete(c._id, c.code)} className="btn btn-secondary btn-sm" style={{ color: 'var(--accent-rose)' }} title="Delete">
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
            <div className="glass-panel" style={{ width: '100%', maxWidth: '480px', padding: '2rem' }} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                  {editingCoupon ? 'Edit Coupon' : 'Create Coupon'}
                </h3>
                <button onClick={() => setModalOpen(false)} style={{ color: 'var(--text-muted)' }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleFormSubmit}>
                <div className="form-group">
                  <label className="form-label">Coupon Code</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. CROMA5000"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    required
                  />
                </div>

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
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Title</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Flat ₹5,000 Off on Laptops"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Discount Type</label>
                    <select
                      className="form-select"
                      value={form.discountType}
                      onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                    >
                      <option value="percentage" style={{ background: '#0f172a' }}>Percentage (%)</option>
                      <option value="flat" style={{ background: '#0f172a' }}>Flat Amount (₹)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Discount Value</label>
                    <input
                      type="number"
                      className="form-input"
                      value={form.discountValue}
                      onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                      required
                      min="1"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Valid Until (Expiry Date)</label>
                  <input
                    type="date"
                    className="form-input"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description / Terms</label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                  <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                    {editingCoupon ? 'Save Changes' : 'Create Coupon'}
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

export default AdminCoupons;
