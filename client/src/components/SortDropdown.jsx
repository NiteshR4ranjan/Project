import React from 'react';
import { ArrowUpDown } from 'lucide-react';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest Arrivals' },
  { value: 'price_asc', label: 'Lowest Price' },
  { value: 'price_desc', label: 'Highest Price' },
  { value: 'discount_desc', label: 'Highest Discount' },
  { value: 'rating_desc', label: 'Customer Rating' },
];

const SortDropdown = ({ value = 'newest', onChange }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem', whiteSpace: 'nowrap' }}>
        <ArrowUpDown size={15} /> Sort by:
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="form-select"
        style={{
          width: 'auto',
          padding: '0.45rem 2rem 0.45rem 0.85rem',
          fontSize: '0.85rem',
          fontWeight: 600,
          background: 'rgba(15, 23, 42, 0.85)',
          cursor: 'pointer',
        }}
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value} style={{ background: '#0f172a', color: '#fff' }}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SortDropdown;
