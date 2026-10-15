import React, { createContext, useContext, useState, useEffect } from 'react';

const CompareContext = createContext(null);

export const CompareProvider = ({ children }) => {
  const [compareList, setCompareList] = useState(() => {
    try {
      const saved = localStorage.getItem('dealkart_compare');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('dealkart_compare', JSON.stringify(compareList));
  }, [compareList]);

  const isInCompare = (productId) => {
    return compareList.some((item) => item._id === productId);
  };

  const addToCompare = (product) => {
    if (isInCompare(product._id)) {
      return { success: false, message: 'Product is already in comparison list.' };
    }

    if (compareList.length >= 4) {
      return {
        success: false,
        message: 'You can compare up to 4 products at a time. Remove one first.',
      };
    }

    setCompareList((prev) => [...prev, product]);
    return { success: true, message: `Added "${product.name}" to comparison.` };
  };

  const removeFromCompare = (productId) => {
    setCompareList((prev) => prev.filter((item) => item._id !== productId));
  };

  const clearCompare = () => {
    setCompareList([]);
  };

  return (
    <CompareContext.Provider
      value={{
        compareList,
        compareCount: compareList.length,
        isInCompare,
        addToCompare,
        removeFromCompare,
        clearCompare,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => useContext(CompareContext);
