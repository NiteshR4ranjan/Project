import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { TrendingDown, TrendingUp, Minus, DollarSign } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="glass-panel"
        style={{
          padding: '10px 14px',
          background: 'rgba(15, 23, 42, 0.95)',
          boxShadow: 'var(--shadow-md)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          fontSize: '0.85rem',
        }}
      >
        <div style={{ color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600 }}>{label}</div>
        <div style={{ color: '#10b981', fontWeight: 800, fontSize: '1rem' }}>
          ₹{payload[0].value?.toLocaleString('en-IN')}
        </div>
        {payload[0].payload.store && (
          <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem', marginTop: '2px' }}>
            Store: {payload[0].payload.store}
          </div>
        )}
      </div>
    );
  }
  return null;
};

const PriceHistoryChart = ({ historyData = [], stats = {} }) => {
  if (!historyData || historyData.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        No historical price records tracked yet.
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '0.2rem' }}>Historical Price Trend</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
            Tracking price movements over the last 45-60 days
          </p>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '1rem',
          marginBottom: '1.75rem',
        }}
      >
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1rem',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
            Current Price
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
            ₹{stats.current?.toLocaleString('en-IN') || '-'}
          </div>
        </div>

        <div
          style={{
            background: 'rgba(16, 185, 129, 0.05)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1rem',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <TrendingDown size={14} /> Lowest Price
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>
            ₹{stats.lowest?.toLocaleString('en-IN') || '-'}
          </div>
        </div>

        <div
          style={{
            background: 'rgba(244, 63, 94, 0.05)',
            border: '1px solid rgba(244, 63, 94, 0.2)',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1rem',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: '#fb7185', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <TrendingUp size={14} /> Highest Price
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f43f5e', marginTop: '4px' }}>
            ₹{stats.highest?.toLocaleString('en-IN') || '-'}
          </div>
        </div>

        <div
          style={{
            background: 'rgba(99, 102, 241, 0.05)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1rem',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: '#a5b4fc', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Minus size={14} /> Average Price
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#818cf8', marginTop: '4px' }}>
            ₹{stats.average?.toLocaleString('en-IN') || '-'}
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div style={{ width: '100%', height: '280px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={historyData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
            />
            <YAxis
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
              domain={['auto', 'auto']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#4f46e5"
              strokeWidth={3}
              dot={{ fill: '#818cf8', r: 4, strokeWidth: 2, stroke: '#0f172a' }}
              activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PriceHistoryChart;
