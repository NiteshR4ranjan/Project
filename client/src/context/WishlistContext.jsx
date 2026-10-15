import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [loading, setLoading] = useState(false);

  const fetchWishlist = async () => {
    if (!isAuthenticated) {
      setWishlist([]);
      setWishlistIds(new Set());
      return;
    }

    try {
      setLoading(true);
      const res = await api.get('/wishlist');
      if (res.data?.success) {
        setWishlist(res.data.data);
        const ids = new Set(
          res.data.data
            .filter((item) => item.productId)
            .map((item) => (typeof item.productId === 'object' ? item.productId._id : item.productId))
        );
        setWishlistIds(ids);
      }
    } catch (err) {
      console.warn('[Wishlist] Failed to fetch:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [isAuthenticated]);

  const isInWishlist = (productId) => {
    return wishlistIds.has(productId);
  };

  const toggleWishlist = async (productId) => {
    if (!isAuthenticated) {
      throw new Error('Please log in to add products to your wishlist.');
    }

    if (isInWishlist(productId)) {
      // Remove
      await api.delete(`/wishlist/${productId}`);
      setWishlist((prev) => prev.filter((item) => {
        const id = typeof item.productId === 'object' ? item.productId._id : item.productId;
        return id !== productId;
      }));
      setWishlistIds((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
      return false; // Removed
    } else {
      // Add
      const res = await api.post('/wishlist', { productId });
      if (res.data?.success) {
        setWishlist((prev) => [res.data.data, ...prev]);
        setWishlistIds((prev) => {
          const next = new Set(prev);
          next.add(productId);
          return next;
        });
        return true; // Added
      }
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount: wishlist.length,
        loading,
        isInWishlist,
        toggleWishlist,
        refreshWishlist: fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
