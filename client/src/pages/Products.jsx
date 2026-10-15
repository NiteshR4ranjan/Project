import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import FilterSidebar from '../components/FilterSidebar';
import SortDropdown from '../components/SortDropdown';
import LoadingSpinner from '../components/LoadingSpinner';
import { Grid, SlidersHorizontal } from 'lucide-react';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [availableBrands, setAvailableBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Initialize filters from URL parameters
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    brand: searchParams.get('brand') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    minRating: searchParams.get('minRating') || '',
    minDiscount: searchParams.get('minDiscount') || '',
    sort: searchParams.get('sort') || 'newest',
    page: parseInt(searchParams.get('page') || '1', 10),
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (filters.category && filters.category !== 'all') queryParams.set('category', filters.category);
      if (filters.brand) queryParams.set('brand', filters.brand);
      if (filters.minPrice) queryParams.set('minPrice', filters.minPrice);
      if (filters.maxPrice) queryParams.set('maxPrice', filters.maxPrice);
      if (filters.minRating) queryParams.set('minRating', filters.minRating);
      if (filters.minDiscount) queryParams.set('minDiscount', filters.minDiscount);
      if (filters.sort) queryParams.set('sort', filters.sort);
      queryParams.set('page', filters.page);
      queryParams.set('limit', '12');

      const res = await api.get(`/products?${queryParams.toString()}`);
      if (res.data?.success) {
        setProducts(res.data.data);
        setPagination(res.data.pagination);
        if (res.data.availableBrands) {
          setAvailableBrands(res.data.availableBrands);
        }
      }
    } catch (err) {
      console.error('Products fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({
      category: '',
      brand: '',
      minPrice: '',
      maxPrice: '',
      minRating: '',
      minDiscount: '',
      sort: 'newest',
      page: 1,
    });
  };

  return (
    <div style={{ padding: '2.5rem 0 4rem' }}>
      <div className="container">
        {/* Page Title & Sort Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Products Catalog</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              Showing {products.length} of {pagination.total} verified products
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Mobile Filter Toggle */}
            <button
              className="btn btn-secondary btn-sm mobile-filter-btn"
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              style={{ display: 'none' }}
            >
              <SlidersHorizontal size={15} /> Filters
            </button>

            <SortDropdown
              value={filters.sort}
              onChange={(newSort) => handleFilterChange({ ...filters, sort: newSort, page: 1 })}
            />
          </div>
        </div>

        {/* 2-Column Layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '260px 1fr',
            gap: '2rem',
            alignItems: 'start',
          }}
          className="products-grid-layout"
        >
          {/* Sidebar */}
          <div className={mobileFilterOpen ? 'mobile-sidebar-open' : 'desktop-sidebar'}>
            <FilterSidebar
              filters={filters}
              onChange={handleFilterChange}
              onReset={handleResetFilters}
              availableBrands={availableBrands}
            />
          </div>

          {/* Main Grid */}
          <div>
            {loading ? (
              <LoadingSpinner message="Filtering products..." />
            ) : products.length > 0 ? (
              <>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                    gap: '1.5rem',
                    marginBottom: '2.5rem',
                  }}
                >
                  {products.map((p) => (
                    <ProductCard key={p._id} product={p} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <button
                      disabled={filters.page <= 1}
                      onClick={() => handleFilterChange({ ...filters, page: filters.page - 1 })}
                      className="btn btn-secondary btn-sm"
                      style={{ opacity: filters.page <= 1 ? 0.5 : 1 }}
                    >
                      Previous
                    </button>

                    {Array.from({ length: pagination.pages }).map((_, idx) => {
                      const pNum = idx + 1;
                      const isCur = pNum === filters.page;
                      return (
                        <button
                          key={pNum}
                          onClick={() => handleFilterChange({ ...filters, page: pNum })}
                          style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '8px',
                            background: isCur ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
                            color: '#fff',
                            fontWeight: isCur ? 700 : 500,
                            border: '1px solid var(--border-subtle)',
                          }}
                        >
                          {pNum}
                        </button>
                      );
                    })}

                    <button
                      disabled={filters.page >= pagination.pages}
                      onClick={() => handleFilterChange({ ...filters, page: filters.page + 1 })}
                      className="btn btn-secondary btn-sm"
                      style={{ opacity: filters.page >= pagination.pages ? 0.5 : 1 }}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div
                className="glass-panel"
                style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}
              >
                <h3>No products match these filters</h3>
                <p style={{ marginTop: '0.5rem', marginBottom: '1rem', fontSize: '0.88rem' }}>
                  Try relaxing your price range or clearing brand selections.
                </p>
                <button onClick={handleResetFilters} className="btn btn-primary btn-sm">
                  Reset All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .products-grid-layout {
            grid-template-columns: 1fr !important;
          }
          .mobile-filter-btn {
            display: inline-flex !important;
          }
          .desktop-sidebar {
            display: none !important;
          }
          .mobile-sidebar-open {
            display: block !important;
            margin-bottom: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Products;
