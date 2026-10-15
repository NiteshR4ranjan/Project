import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, Trash2 } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminReviewAnalyses = () => {
  const { addToast } = useToast();
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAnalyses = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/review-analyses');
      if (res.data?.success) {
        setAnalyses(res.data.data);
      }
    } catch (error) {
      console.error('Failed to load review analyses:', error.message);
      addToast('Failed to load review analyses', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadAnalyses();
  }, [loadAnalyses]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this stored Gemini analysis?')) return;

    try {
      await api.delete(`/admin/review-analyses/${id}`);
      setAnalyses((prev) => prev.filter((item) => item._id !== id));
      addToast('Review analysis deleted', 'success');
    } catch (error) {
      console.error('Failed to delete review analysis:', error.message);
      addToast('Failed to delete review analysis', 'error');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading Gemini review analysis records..." />;
  }

  return (
    <div style={{ padding: '2.5rem 0 5rem' }}>
      <div className="container">
        <div style={{ marginBottom: '1.5rem' }}>
          <Link to="/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <ArrowLeft size={16} /> Back to Admin Dashboard
          </Link>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
              <Sparkles size={24} style={{ color: '#818cf8' }} /> Review Analysis Records
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Inspect cached Gemini review analyses, recommendations, and comparison records.
            </p>
          </div>
          <span className="badge badge-primary">{analyses.length} Records</span>
        </div>

        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '760px' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.8rem' }}>Product / Query</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.8rem' }}>Type</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.8rem' }}>Score</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.8rem' }}>Sources</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.8rem' }}>Analyzed</th>
                  <th style={{ padding: '1rem', textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.8rem' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {analyses.map((item) => (
                  <tr key={item._id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ color: '#fff', fontWeight: 700 }}>{item.productName}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{item.query || item.store || 'Gemini analysis'}</div>
                    </td>
                    <td style={{ padding: '1rem' }}><span className="badge badge-secondary">{item.analysisType}</span></td>
                    <td style={{ padding: '1rem' }}><span className="badge badge-green">{Number(item.overallScore || 0).toFixed(1)}/10</span></td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{item.sources?.length || 0}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{item.analyzedAt ? new Date(item.analyzedAt).toLocaleString() : '-'}</td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <button onClick={() => handleDelete(item._id)} className="btn btn-secondary btn-sm" style={{ color: 'var(--accent-rose)' }} title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {analyses.length === 0 && (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No Gemini review analysis records yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminReviewAnalyses;
