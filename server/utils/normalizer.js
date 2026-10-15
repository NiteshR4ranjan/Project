/**
 * DealKart Data & Product Normalization Utilities
 */

// Clean raw price strings (e.g. "₹65,999", "Rs. 1,04,900.00", "65999") to a clean positive integer
const parsePrice = (priceVal) => {
  if (typeof priceVal === 'number') {
    return Math.round(priceVal);
  }
  if (!priceVal) return 0;

  // Remove currency symbols, commas, non-breaking spaces
  const cleaned = String(priceVal)
    .replace(/[₹$,Rs\.\s]/gi, '')
    .trim();
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : Math.round(parsed);
};

// Normalize string for keyword matching
const normalizeString = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/(\d+)\s*(gb|tb|mb|ram|rom)/gi, '$1$2') // e.g. 128 gb -> 128gb
    .replace(/[^a-z0-9\s]/gi, '') // Remove symbols
    .trim();
};

// Simple keyword overlap matching to identify identical or matching products
const matchProductTitles = (targetTitle, candidateTitle, targetBrand = '') => {
  const normTarget = normalizeString(targetTitle);
  const normCandidate = normalizeString(candidateTitle);

  if (normTarget === normCandidate) return 1.0;

  // If brand is provided, candidate must contain the brand
  if (targetBrand) {
    const normBrand = normalizeString(targetBrand);
    if (!normCandidate.includes(normBrand)) {
      return 0;
    }
  }

  const targetTokens = normTarget.split(' ').filter((t) => t.length > 1);
  const candidateTokens = new Set(normCandidate.split(' ').filter((t) => t.length > 1));

  if (targetTokens.length === 0) return 0;

  let matchCount = 0;
  for (const token of targetTokens) {
    if (candidateTokens.has(token)) {
      matchCount++;
    }
  }

  return matchCount / targetTokens.length;
};

// Standard DealKart price object normalizer
const createNormalizedPrice = ({
  productId,
  storeId,
  storeName,
  name,
  price,
  originalPrice,
  discount,
  availability = 'In Stock',
  productUrl,
  imageUrl,
  lastFetchStatus = 'SUCCESS',
}) => {
  const cleanPrice = parsePrice(price);
  let cleanOriginal = parsePrice(originalPrice);

  if (!cleanOriginal || cleanOriginal < cleanPrice) {
    cleanOriginal = cleanPrice;
  }

  const calculatedDiscount =
    discount ||
    (cleanOriginal > cleanPrice
      ? Math.round(((cleanOriginal - cleanPrice) / cleanOriginal) * 100)
      : 0);

  return {
    productId,
    storeId,
    storeName,
    name: (name || '').trim(),
    price: cleanPrice,
    originalPrice: cleanOriginal,
    discount: calculatedDiscount,
    availability: availability || 'In Stock',
    productUrl: productUrl || '',
    imageUrl: imageUrl || '',
    fetchedAt: new Date(),
    lastFetchStatus,
  };
};

module.exports = {
  parsePrice,
  normalizeString,
  matchProductTitles,
  createNormalizedPrice,
};
