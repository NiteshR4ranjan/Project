import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Scale,
  Heart,
  Tag,
  User,
  ShieldCheck,
  Bell,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  Grid,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCompare } from '../context/CompareContext';
import { useWishlist } from '../context/WishlistContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { compareCount } = useCompare();
  const { wishlistCount } = useWishlist();

  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="glass-nav" style={{ position: 'sticky', top: 0, zIndex: 1000 }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px', gap: '1.5rem' }}>
        {/* DealKart Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #4f46e5, #06b6d4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 15px rgba(79, 70, 229, 0.4)',
            }}
          >
            <Tag size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.35rem', fontWeight: '800', letterSpacing: '-0.03em', lineHeight: 1 }}>
              <span style={{ color: '#ffffff' }}>Deal</span>
              <span style={{ color: '#6366f1' }}>Kart</span>
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.04em', fontWeight: 500 }}>
              COMPARE & SAVE
            </div>
          </div>
        </Link>

        {/* Global Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          style={{
            flex: 1,
            maxWidth: '480px',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <input
            type="text"
            placeholder="Search for your product"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.65rem 1rem 0.65rem 2.6rem',
              backgroundColor: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-full)',
              color: '#ffffff',
              fontSize: '0.88rem',
              outline: 'none',
              transition: 'all 0.2s',
            }}
          />
          <Search
            size={17}
            style={{
              position: 'absolute',
              left: '12px',
              color: 'var(--text-dim)',
              pointerEvents: 'none',
            }}
          />
          <button
            type="submit"
            className="btn btn-primary btn-sm"
            style={{
              position: 'absolute',
              right: '4px',
              padding: '0.35rem 0.85rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.78rem',
            }}
          >
            Search
          </button>
        </form>

        {/* Desktop Nav Links */}
        <nav style={{ display: 'none', alignItems: 'center', gap: '1.25rem' }} className="desktop-nav">
          <Link
            to="/products"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: 'var(--text-muted)',
              transition: 'color 0.2s',
            }}
          >
            <Grid size={16} /> Products
          </Link>

          <Link
            to="/deals"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: 'var(--text-muted)',
              transition: 'color 0.2s',
            }}
          >
            <Tag size={16} /> Deals
          </Link>

          <Link
            to="/compare"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: 'var(--text-muted)',
              position: 'relative',
              transition: 'color 0.2s',
            }}
          >
            <Scale size={16} /> Compare
            {compareCount > 0 && (
              <span
                style={{
                  background: 'var(--primary)',
                  color: '#fff',
                  fontSize: '0.7rem',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  fontWeight: 700,
                }}
              >
                {compareCount}
              </span>
            )}
          </Link>

          <Link
            to="/wishlist"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: 'var(--text-muted)',
              position: 'relative',
              transition: 'color 0.2s',
            }}
          >
            <Heart size={16} /> Wishlist
            {wishlistCount > 0 && (
              <span
                style={{
                  background: 'var(--accent-rose)',
                  color: '#fff',
                  fontSize: '0.7rem',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  fontWeight: 700,
                }}
              >
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* User Section */}
          {isAuthenticated ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.4rem 0.85rem',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(255, 255, 255, 0.07)',
                  border: '1px solid var(--border-subtle)',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}
              >
                <div
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: isAdmin ? 'var(--accent-amber)' : 'var(--primary)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                  }}
                >
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <span>{user?.name?.split(' ')[0]}</span>
                {isAdmin && (
                  <span className="badge badge-amber" style={{ fontSize: '0.65rem', padding: '1px 5px' }}>
                    Admin
                  </span>
                )}
              </button>

              {/* Dropdown Menu */}
              {userDropdownOpen && (
                <div
                  className="glass-panel"
                  style={{
                    position: 'absolute',
                    top: '115%',
                    right: 0,
                    width: '210px',
                    padding: '0.5rem',
                    boxShadow: 'var(--shadow-lg)',
                    zIndex: 1050,
                  }}
                  onClick={() => setUserDropdownOpen(false)}
                >
                  <Link
                    to="/dashboard"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      padding: '0.6rem 0.8rem',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-main)',
                      fontSize: '0.85rem',
                    }}
                  >
                    <LayoutDashboard size={15} /> Dashboard
                  </Link>

                  <Link
                    to="/wishlist"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      padding: '0.6rem 0.8rem',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-main)',
                      fontSize: '0.85rem',
                    }}
                  >
                    <Heart size={15} /> My Wishlist
                  </Link>

                  <Link
                    to="/profile"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      padding: '0.6rem 0.8rem',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-main)',
                      fontSize: '0.85rem',
                    }}
                  >
                    <User size={15} /> Profile Settings
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        padding: '0.6rem 0.8rem',
                        borderRadius: 'var(--radius-sm)',
                        color: '#fbbf24',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        borderTop: '1px solid var(--border-subtle)',
                      }}
                    >
                      <ShieldCheck size={15} /> Admin Control
                    </Link>
                  )}

                  <button
                    onClick={logout}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      width: '100%',
                      padding: '0.6rem 0.8rem',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--accent-rose)',
                      fontSize: '0.85rem',
                      borderTop: '1px solid var(--border-subtle)',
                      marginTop: '4px',
                    }}
                  >
                    <LogOut size={15} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile menu hamburger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="mobile-hamburger"
          style={{ display: 'flex', color: '#ffffff', padding: '0.5rem' }}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          className="glass-panel"
          style={{
            borderTop: '1px solid var(--border-subtle)',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <Link to="/products" onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.5rem' }}>
            <Grid size={18} /> All Products
          </Link>
          <Link to="/deals" onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.5rem' }}>
            <Tag size={18} /> Deals & Coupons
          </Link>
          <Link to="/compare" onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.5rem' }}>
            <Scale size={18} /> Compare Products ({compareCount})
          </Link>
          <Link to="/wishlist" onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.5rem' }}>
            <Heart size={18} /> Wishlist ({wishlistCount})
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.5rem' }}>
                <LayoutDashboard size={18} /> Dashboard
              </Link>
              {isAdmin && (
                <Link to="/admin" onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.5rem', color: '#fbbf24' }}>
                  <ShieldCheck size={18} /> Admin Dashboard
                </Link>
              )}
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: 'flex-start', color: 'var(--accent-rose)' }}
              >
                <LogOut size={16} /> Logout ({user?.name})
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                Login
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="btn btn-primary" style={{ flex: 1 }}>
                Register
              </Link>
            </div>
          )}
        </div>
      )}

      <style>{`
        @media (min-width: 860px) {
          .desktop-nav { display: flex !important; }
          .mobile-hamburger { display: none !important; }
        }
      `}</style>
    </header>
  );
};

export default Navbar;
