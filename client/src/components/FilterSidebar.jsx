import React from 'react';
import { Filter, RotateCcw, Check } from 'lucide-react';

const CATEGORIES_LIST = [
  { slug: 'all', label: 'All Categories' },
  { slug: 'mobiles', label: 'Mobiles' },
  { slug: 'laptops', label: 'Laptops' },
  { slug: 'headphones', label: 'Headphones' },
  { slug: 'smart-watches', label: 'Smart Watches' },
  { slug: 'tvs', label: 'TVs & Displays' },
  { slug: 'cameras', label: 'Cameras' },
  { slug: 'accessories', label: 'Accessories' },
  { slug: 'fashion', label: 'Fashion & Shoes' },
  { slug: 'fitness', label: 'Fitness Gear' },
];

const FilterSidebar = ({
  filters,
  onChange,
  onReset,
  availableBrands = [],
}) => {
  const handleCategoryChange = (slug) => {
    onChange({ ...filters, category: slug, page: 1 });
  };

  const handleBrandToggle = (brandName) => {
    let current = filters.brand ? filters.brand.split(',') : [];
    if (current.includes(brandName)) {
      current = current.filter((b) => b !== brandName);
    } else {
      current.push(brandName);
    }
    onChange({ ...filters, brand: current.join(','), page: 1 });
  };

  const selectedBrands = filters.brand ? filters.brand.split(',') : [];

  return (
    <aside
      className="glass-panel"
      style={{
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        height: 'fit-content',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1rem' }}>
          <Filter size={18} style={{ color: '#818cf8' }} /> Filters
        </div>
        <button
          onClick={onReset}
          style={{
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            cursor: 'pointer',
          }}
          title="Reset all filters"
        >
          <RotateCcw size={13} /> Reset
        </button>
      </div>

      {/* Category List */}
      <div>
        <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Category
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {CATEGORIES_LIST.map((cat) => {
            const isSelected = (!filters.category && cat.slug === 'all') || filters.category === cat.slug;
            return (
              <button
                key={cat.slug}
                onClick={() => handleCategoryChange(cat.slug)}
                style={{
                  textAlign: 'left',
                  padding: '0.45rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.88rem',
                  fontWeight: isSelected ? 700 : 500,
                  color: isSelected ? '#ffffff' : 'var(--text-muted)',
                  background: isSelected ? 'var(--primary)' : 'transparent',
                  transition: 'all 0.15s',
                }}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range */}
      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
        <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Price Range (₹)
        </h4>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice || ''}
            onChange={(e) => onChange({ ...filters, minPrice: e.target.value, page: 1 })}
            className="form-input"
            style={{ padding: '0.45rem 0.65rem', fontSize: '0.85rem' }}
          />
          <span style={{ color: 'var(--text-dim)' }}>-</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice || ''}
            onChange={(e) => onChange({ ...filters, maxPrice: e.target.value, page: 1 })}
            className="form-input"
            style={{ padding: '0.45rem 0.65rem', fontSize: '0.85rem' }}
          />
        </div>
      </div>

      {/* Brand Filters */}
      {availableBrands.length > 0 && (
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Brand
          </h4>
          <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.4rem', paddingRight: '4px' }}>
            {availableBrands.map((b) => {
              const checked = selectedBrands.includes(b);
              return (
                <label
                  key={b}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.85rem',
                    color: checked ? '#fff' : 'var(--text-muted)',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleBrandToggle(b)}
                    style={{ accentColor: 'var(--primary)', cursor: 'pointer' }}
                  />
                  <span>{b}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Minimum Rating */}
      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
        <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Customer Rating
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {[
            { val: 4.5, label: '4.5★ & above' },
            { val: 4.0, label: '4.0★ & above' },
            { val: 3.5, label: '3.5★ & above' },
          ].map((r) => (
            <label
              key={r.val}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.85rem',
                color: filters.minRating === String(r.val) ? '#fbbf24' : 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              <input
                type="radio"
                name="ratingFilter"
                checked={filters.minRating === String(r.val)}
                onChange={() => onChange({ ...filters, minRating: String(r.val), page: 1 })}
                style={{ accentColor: 'var(--primary)', cursor: 'pointer' }}
              />
              <span>{r.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Minimum Discount */}
      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
        <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Discount
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {[
            { val: 20, label: '20% or more' },
            { val: 15, label: '15% or more' },
            { val: 10, label: '10% or more' },
          ].map((d) => (
            <label
              key={d.val}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.85rem',
                color: filters.minDiscount === String(d.val) ? '#34d399' : 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              <input
                type="radio"
                name="discountFilter"
                checked={filters.minDiscount === String(d.val)}
                onChange={() => onChange({ ...filters, minDiscount: String(d.val), page: 1 })}
                style={{ accentColor: 'var(--primary)', cursor: 'pointer' }}
              />
              <span>{d.label}</span>
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default FilterSidebar;
