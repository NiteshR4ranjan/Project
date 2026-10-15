const { searchProductsWithGemini } = require('./geminiService');

const searchLiveProducts = async (query) => {
  try {
    const result = await searchProductsWithGemini(query);
    return result.products || [];
  } catch (error) {
    console.warn('[LiveSearchService] Gemini grounded search failed:', error.message);
    return [];
  }
};

module.exports = {
  searchLiveProducts,
};
