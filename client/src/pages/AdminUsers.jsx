import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Shield, ArrowLeft, Mail, Calendar, UserCheck } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminUsers = () => {
  const { addToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/users');
      if (res.data?.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to fetch user list', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleToggleRole = async (userId, currentRole, userName) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (window.confirm(`Change role of "${userName}" to ${newRole}?`)) {
      try {
        const res = await api.put(`/admin/users/${userId}/role`, { role: newRole });
        if (res.data?.success) {
          setUsers((prev) =>
            prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
          );
          addToast(`User role updated to ${newRole}`, 'success');
        }
      } catch (err) {
        addToast(err.response?.data?.message || 'Failed to update user role', 'error');
      }
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

        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>User Management</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Inspect registered accounts and manage system administrative permissions
          </p>
        </div>

        {loading ? (
          <LoadingSpinner message="Fetching user directory..." />
        ) : (
          <div className="glass-panel" style={{ overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid var(--border-subtle)' }}>
                    <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>User</th>
                    <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Email</th>
                    <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Current Role</th>
                    <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Joined Date</th>
                    <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'right' }}>Role Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div
                            style={{
                              width: '34px',
                              height: '34px',
                              borderRadius: '50%',
                              background: u.role === 'admin' ? 'var(--accent-amber)' : 'var(--primary)',
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.85rem',
                              fontWeight: 700,
                            }}
                          >
                            {u.name?.[0]?.toUpperCase()}
                          </div>
                          <span style={{ fontWeight: 600, color: '#fff' }}>{u.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                        {u.email}
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <span className={`badge ${u.role === 'admin' ? 'badge-amber' : 'badge-primary'}`}>
                          {u.role?.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1.25rem', color: 'var(--text-dim)', fontSize: '0.82rem' }}>
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                        <button
                          onClick={() => handleToggleRole(u._id, u.role, u.name)}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.78rem' }}
                        >
                          {u.role === 'admin' ? 'Revoke Admin' : 'Promote to Admin'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
