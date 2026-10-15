const axios = require('axios');
const ReviewAnalysis = require('../models/ReviewAnalysis');
const ReviewData = require('../models/ReviewData');
const GeminiRequestLog = require('../models/GeminiRequestLog');

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const GEMINI_API_URL = process.env.GEMINI_API_URL || 'https://generativelanguage.googleapis.com/v1beta/models';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

const normalizeText = (value = '') => String(value || '').trim();
const toNumber = (value, fallback = 0) => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : fallback;
  const parsed = Number(String(value || '').replace(/[^0-9.]/g, ''));
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeUrl = (value = '') => {
  const url = normalizeText(value);
  return /^https?:\/\//i.test(url) ? url : '';
};

const queryKeyFor = (prefix, value = '') => `${prefix}:${normalizeText(value).toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
const hasValidGeminiConfig = () => Boolean(process.env.GEMINI_API_KEY);
const getGeminiUrl = () => `${GEMINI_API_URL}/${GEMINI_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`;

const logGeminiRequest = async ({ operation, query, status, message = '', sourceCount = 0 }) => {
  try {
    await GeminiRequestLog.create({
      operation,
      query,
      status,
      message: String(message || '').slice(0, 500),
      model: GEMINI_MODEL,
      sourceCount,
    });
  } catch (error) {
    console.warn('[Gemini Service] Request logging failed:', error.message);
  }
};

const parseJsonFromText = (rawText = '') => {
  const cleaned = String(rawText).replace(/```json|```/gi, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch (error) {
    const objectMatch = cleaned.match(/\{[\s\S]*\}/);
    const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
    const candidate = objectMatch?.[0] || arrayMatch?.[0];
    if (!candidate) {
      throw new Error('Gemini returned non-JSON content');
    }
    return JSON.parse(candidate);
  }
};

const extractGroundingSources = (response) => {
  const chunks = response?.data?.candidates?.flatMap((candidate) => candidate.groundingMetadata?.groundingChunks || []) || [];
  const sourceMap = new Map();

  chunks.forEach((chunk) => {
    const url = normalizeUrl(chunk?.web?.uri || chunk?.retrievedContext?.uri || '');
    if (!url || sourceMap.has(url)) return;
    sourceMap.set(url, {
      title: normalizeText(chunk?.web?.title || chunk?.retrievedContext?.title || 'Source'),
      url,
    });
  });

  return [...sourceMap.values()].slice(0, 12);
};

const callGeminiJson = async ({ prompt, operation, query, useGrounding = true }) => {
  if (!hasValidGeminiConfig()) {
    await logGeminiRequest({ operation, query, status: 'FAILED', message: 'GEMINI_API_KEY missing' });
    throw new Error('AI analysis is temporarily unavailable.');
  }

  try {
    const response = await axios.post(
      getGeminiUrl(),
      {
        contents: [{ parts: [{ text: prompt }] }],
        tools: useGrounding ? [{ google_search: {} }] : undefined,
        generationConfig: {
          temperature: 0.2,
          response_mime_type: 'application/json',
        },
      },
      {
        timeout: 45000,
        headers: { 'Content-Type': 'application/json' },
      }
    );

    const rawText = response?.data?.candidates?.[0]?.content?.parts?.map((part) => part.text).join('') || '';
    const parsed = parseJsonFromText(rawText);
    const sources = extractGroundingSources(response);

    await logGeminiRequest({ operation, query, status: 'SUCCESS', sourceCount: sources.length });
    return { parsed, sources };
  } catch (error) {
    const message = error.response?.data?.error?.message || error.message;
    await logGeminiRequest({ operation, query, status: 'FAILED', message });
    throw new Error(message);
  }
};

const normalizeReviewAnalysis = (value = {}, fallback = {}) => ({
  score: toNumber(value.score ?? value.overallScore, toNumber(fallback.score ?? fallback.overallScore, 0)),
  overallScore: toNumber(value.overallScore ?? value.score, toNumber(fallback.overallScore ?? fallback.score, 0)),
  sentiment: typeof value.sentiment === 'string' ? value.sentiment : normalizeText(fallback.sentiment || 'Not available'),
  sentimentBreakdown: typeof value.sentiment === 'object' ? value.sentiment : { positive: 0, neutral: 0, negative: 0 },
  summary: normalizeText(value.summary || fallback.summary || 'AI analysis is temporarily unavailable.'),
  positivePoints: Array.isArray(value.positivePoints) ? value.positivePoints.map(normalizeText).filter(Boolean).slice(0, 4) : [],
  negativePoints: Array.isArray(value.negativePoints) ? value.negativePoints.map(normalizeText).filter(Boolean).slice(0, 4) : [],
  commonPraises: Array.isArray(value.commonPraises) ? value.commonPraises.map(normalizeText).filter(Boolean).slice(0, 4) : [],
  commonComplaints: Array.isArray(value.commonComplaints) ? value.commonComplaints.map(normalizeText).filter(Boolean).slice(0, 4) : [],
  recommendationReason: normalizeText(value.recommendationReason || fallback.recommendationReason || ''),
});

const normalizeProduct = (item = {}, query = '', index = 0) => {
  const name = normalizeText(item.name || item.productName || item.title);
  if (!name) return null;

  const price = toNumber(item.price ?? item.currentPrice, 0);
  const originalPrice = toNumber(item.originalPrice ?? item.mrp ?? item.listPrice, price);
  const discount = toNumber(item.discount, originalPrice > price && price > 0 ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0);
  const store = normalizeText(item.store || item.source || 'Not available');
  const imageUrl = normalizeUrl(item.imageUrl || item.image || item.thumbnail || '');
  const productUrl = normalizeUrl(item.productUrl || item.url || item.link || '');
  const reviewAnalysis = normalizeReviewAnalysis(item.reviewAnalysis || {}, {
    score: item.reviewScore,
    overallScore: item.reviewScore,
  });

  return {
    _id: `gemini-${Date.now()}-${index}`,
    name,
    brand: normalizeText(item.brand || name.split(/\s+/)[0] || 'Product'),
    price,
    lowestPrice: price,
    highestPrice: originalPrice || price,
    originalPrice: originalPrice || price,
    currency: normalizeText(item.currency || 'INR'),
    store,
    source: normalizeText(item.source || 'Gemini web grounding'),
    productUrl,
    imageUrl,
    rating: toNumber(item.rating, 0),
    reviewCount: toNumber(item.reviewCount, 0),
    discount,
    maxDiscount: discount,
    specifications: item.specifications && typeof item.specifications === 'object' && !Array.isArray(item.specifications) ? item.specifications : {},
    reviewAnalysis,
    overallScore: reviewAnalysis.overallScore || reviewAnalysis.score || 0,
    recommendationReason: reviewAnalysis.recommendationReason,
    availability: normalizeText(item.availability || 'Not available'),
    isLiveResult: true,
    availableStoresCount: 1,
    storeResults: [
      {
        storeName: store,
        price,
        originalPrice: originalPrice || price,
        discount,
        productUrl,
        imageUrl,
        source: normalizeText(item.source || 'Gemini web grounding'),
        availability: normalizeText(item.availability || 'Not available'),
      },
    ],
    query,
  };
};

const normalizeRecommendation = (item = {}, products = [], index = 0) => {
  const labels = ['Best Overall', 'Best Value', 'Best Rated', 'Budget Choice', 'Alternative Choice'];
  const productName = normalizeText(item.productName || item.name || products[index]?.name || '');
  const matched = products.find((product) => product.name.toLowerCase() === productName.toLowerCase()) || products[index] || {};
  const analysis = normalizeReviewAnalysis(item.reviewAnalysis || matched.reviewAnalysis || {}, matched.reviewAnalysis || {});

  return {
    label: normalizeText(item.label || labels[index] || 'Recommended'),
    productName: productName || matched.name || 'Product',
    price: toNumber(item.price, matched.price || 0),
    imageUrl: normalizeUrl(item.imageUrl || matched.imageUrl || ''),
    productUrl: normalizeUrl(item.productUrl || matched.productUrl || ''),
    store: normalizeText(item.store || matched.store || 'Not available'),
    rating: toNumber(item.rating, matched.rating || 0),
    reviewCount: toNumber(item.reviewCount, matched.reviewCount || 0),
    overallScore: toNumber(item.overallScore ?? item.reviewScore, analysis.overallScore || analysis.score || 0),
    summary: normalizeText(item.summary || analysis.summary || ''),
    positivePoints: Array.isArray(item.positivePoints) ? item.positivePoints.map(normalizeText).filter(Boolean).slice(0, 4) : analysis.positivePoints,
    negativePoints: Array.isArray(item.negativePoints) ? item.negativePoints.map(normalizeText).filter(Boolean).slice(0, 4) : analysis.negativePoints,
    recommendationReason: normalizeText(item.recommendationReason || analysis.recommendationReason || ''),
  };
};

const productSearchPrompt = (query) => `
You are DealKart's product research engine. Use Google Search grounding to find current public product information for this user query: "${query}".

Return valid JSON only with this exact shape:
{
  "products": [
    {
      "name": "string",
      "brand": "string or null",
      "price": number or null,
      "currency": "INR",
      "store": "string or null",
      "productUrl": "https URL or null",
      "imageUrl": "https URL or null",
      "rating": number or null,
      "reviewCount": number or null,
      "discount": number or null,
      "specifications": {},
      "source": "Gemini web grounding",
      "reviewAnalysis": {
        "score": number or null,
        "sentiment": "Positive, Neutral, Negative, Mixed, or Not available",
        "summary": "string",
        "positivePoints": ["string"],
        "negativePoints": ["string"],
        "commonPraises": ["string"],
        "commonComplaints": ["string"],
        "recommendationReason": "string"
      }
    }
  ],
  "recommendations": [
    {
      "label": "Best Overall",
      "productName": "string",
      "overallScore": number,
      "summary": "string",
      "recommendationReason": "string",
      "positivePoints": ["string"],
      "negativePoints": ["string"]
    }
  ],
  "recommendedProduct": {
    "productName": "string",
    "price": number or null,
    "rating": number or null,
    "reviewCount": number or null,
    "overallScore": number or null,
    "recommendationReason": "string",
    "positivePoints": ["string"]
  }
}

Rules:
- Try to return up to 5 reliable product choices. Return fewer if fewer can be verified.
- Do not invent prices, ratings, review counts, images, stores, URLs, specifications, or reviews. Use null when not verified.
- Review summaries must summarize available public review information, not pretend to be raw customer reviews.
- Recommendations must prioritize review quality, sentiment, complaint severity, specifications, and price/value. Do not simply choose the cheapest item.
- Use INR prices when available. If a price is unavailable, use null.
`;

const searchProductsWithGemini = async (query) => {
  const cleanQuery = normalizeText(query);
  const queryKey = queryKeyFor('search', cleanQuery);

  const cached = await ReviewAnalysis.findOne({
    queryKey,
    analysisType: 'search',
    analyzedAt: { $gte: new Date(Date.now() - CACHE_TTL_MS) },
  });

  if (cached?.metadata?.products) {
    await logGeminiRequest({ operation: 'search', query: cleanQuery, status: 'CACHED', sourceCount: cached.sources?.length || 0 });
    return {
      success: true,
      cached: true,
      products: cached.metadata.products,
      recommendations: cached.metadata.recommendations || [],
      recommendedProduct: cached.metadata.recommendedProduct || null,
      sources: cached.sources || [],
    };
  }

  const { parsed, sources } = await callGeminiJson({
    prompt: productSearchPrompt(cleanQuery),
    operation: 'search',
    query: cleanQuery,
    useGrounding: true,
  });

  const products = (Array.isArray(parsed.products) ? parsed.products : [])
    .map((item, index) => normalizeProduct(item, cleanQuery, index))
    .filter(Boolean);
  const recommendations = (Array.isArray(parsed.recommendations) ? parsed.recommendations : [])
    .map((item, index) => normalizeRecommendation(item, products, index))
    .filter((item) => item.productName);
  const recommendedProduct = parsed.recommendedProduct
    ? normalizeRecommendation(parsed.recommendedProduct, products, 0)
    : recommendations[0] || null;

  await ReviewAnalysis.findOneAndUpdate(
    { queryKey, analysisType: 'search' },
    {
      query: cleanQuery,
      queryKey,
      analysisType: 'search',
      productName: cleanQuery,
      store: 'Gemini',
      source: 'Gemini web grounding',
      overallScore: recommendedProduct?.overallScore || 0,
      summary: recommendedProduct?.summary || `Gemini search results for ${cleanQuery}`,
      positivePoints: recommendedProduct?.positivePoints || [],
      negativePoints: recommendedProduct?.negativePoints || [],
      recommendationReason: recommendedProduct?.recommendationReason || '',
      recommendationLabel: recommendedProduct?.label || 'Recommended',
      sources,
      metadata: { products, recommendations, recommendedProduct },
      analyzedAt: new Date(),
      expiresAt: new Date(Date.now() + CACHE_TTL_MS),
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return { success: true, cached: false, products, recommendations, recommendedProduct, sources };
};

const saveAnalysis = async ({ productId, query, queryKey, productName, store, source, price, imageUrl, rating, reviewCount, analysis, analysisType = 'product', sources = [] }) => {
  const normalizedAnalysis = normalizeReviewAnalysis(analysis || {});
  const sentiment = analysis?.sentiment && typeof analysis.sentiment === 'object'
    ? analysis.sentiment
    : normalizedAnalysis.sentimentBreakdown;

  return ReviewAnalysis.findOneAndUpdate(
    {
      queryKey: queryKey || queryKeyFor(analysisType, `${productName}:${store || ''}`),
      productId: productId || null,
      analysisType,
    },
    {
      productId,
      query,
      queryKey: queryKey || queryKeyFor(analysisType, `${productName}:${store || ''}`),
      analysisType,
      productName,
      store,
      source,
      price,
      imageUrl,
      rating,
      reviewCount,
      overallScore: normalizedAnalysis.overallScore || normalizedAnalysis.score || 0,
      summary: normalizedAnalysis.summary || '',
      positivePoints: normalizedAnalysis.positivePoints,
      negativePoints: normalizedAnalysis.negativePoints,
      sentiment,
      recommendationReason: normalizedAnalysis.recommendationReason || '',
      recommendationLabel: analysis?.recommendationLabel || 'Recommended',
      rankingLabel: analysis?.rankingLabel || '',
      sources,
      analyzedAt: new Date(),
      expiresAt: new Date(Date.now() + CACHE_TTL_MS),
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
};

const analysisPrompt = ({ productName, query, store, price, rating, reviewCount, productUrl }) => `
Use Google Search grounding to analyze public review information for:
Product: "${productName}"
Store/source hint: "${store || 'any reliable public source'}"
Price hint: "${price || 'Not available'}"
Rating hint: "${rating || 'Not available'}"
Review count hint: "${reviewCount || 'Not available'}"
Product URL hint: "${productUrl || 'Not available'}"
User query: "${query || productName}"

Return valid JSON only:
{
  "productName": "string",
  "overallScore": number,
  "rating": number or null,
  "reviewCount": number or null,
  "summary": "string",
  "positivePoints": ["string"],
  "negativePoints": ["string"],
  "sentiment": { "positive": number, "neutral": number, "negative": number },
  "recommendationReason": "string"
}

Do not invent customer reviews. If review information cannot be verified, say that public review data is limited.
`;

const generateReviewAnalysis = async ({ productName, reviews = [], query, productId, store, source, price, imageUrl, rating, reviewCount, productUrl, analysisType = 'product' }) => {
  const cleanName = normalizeText(productName || query || 'Product');
  const queryKey = queryKeyFor(analysisType, `${cleanName}:${store || ''}`);

  const existing = await ReviewAnalysis.findOne({
    queryKey,
    analysisType,
    analyzedAt: { $gte: new Date(Date.now() - CACHE_TTL_MS) },
  });

  if (existing) {
    await logGeminiRequest({ operation: 'analysis', query: cleanName, status: 'CACHED', sourceCount: existing.sources?.length || 0 });
    return { success: true, fallback: false, analysis: existing, cached: true };
  }

  try {
    const prompt = reviews.length
      ? `Analyze only this stored review data for "${cleanName}" and return valid JSON with productName, overallScore, rating, reviewCount, summary, positivePoints, negativePoints, sentiment, recommendationReason. Do not invent reviews. Reviews: ${JSON.stringify(reviews)}`
      : analysisPrompt({ productName: cleanName, query, store, price, rating, reviewCount, productUrl });

    const { parsed, sources } = await callGeminiJson({
      prompt,
      operation: 'analysis',
      query: cleanName,
      useGrounding: reviews.length === 0,
    });

    const normalizedAnalysis = {
      ...normalizeReviewAnalysis(parsed, { rating, reviewCount }),
      productName: normalizeText(parsed.productName || cleanName),
      rating: toNumber(parsed.rating, rating || 0),
      reviewCount: toNumber(parsed.reviewCount, reviewCount || 0),
      sentiment: parsed.sentiment || { positive: 0, neutral: 0, negative: 0 },
    };

    const saved = await saveAnalysis({
      productId,
      query,
      queryKey,
      productName: cleanName,
      store,
      source: source || 'Gemini web grounding',
      price,
      imageUrl,
      rating: normalizedAnalysis.rating,
      reviewCount: normalizedAnalysis.reviewCount,
      analysis: normalizedAnalysis,
      analysisType,
      sources,
    });

    return { success: true, fallback: false, cached: false, analysis: saved };
  } catch (error) {
    console.error('[Gemini Service] Analysis failed:', error.message);
    const fallbackDoc = await ReviewAnalysis.findOne({ queryKey, analysisType });

    if (fallbackDoc) {
      return {
        success: true,
        fallback: true,
        cached: true,
        analysis: fallbackDoc,
        message: 'AI review analysis is temporarily unavailable. Showing the last available analysis.',
      };
    }

    return { success: false, fallback: true, message: 'AI analysis is temporarily unavailable.', analysis: null };
  }
};

const compareProductsWithGemini = async (products = []) => {
  const safeProducts = products.slice(0, 4).map((product) => ({
    name: product.name,
    brand: product.brand,
    price: product.lowestPrice || product.price || 0,
    rating: product.rating || 0,
    reviewCount: product.reviewCount || 0,
    reviewScore: product.reviewAnalysis?.overallScore || product.reviewAnalysis?.score || product.overallScore || 0,
    specifications: product.specifications || {},
    positivePoints: product.reviewAnalysis?.positivePoints || product.positivePoints || [],
    negativePoints: product.reviewAnalysis?.negativePoints || product.negativePoints || [],
  }));
  const query = safeProducts.map((product) => product.name).join(' vs ');
  const queryKey = queryKeyFor('comparison', query);

  const existing = await ReviewAnalysis.findOne({
    queryKey,
    analysisType: 'comparison',
    analyzedAt: { $gte: new Date(Date.now() - CACHE_TTL_MS) },
  });

  if (existing) {
    await logGeminiRequest({ operation: 'comparison', query, status: 'CACHED', sourceCount: existing.sources?.length || 0 });
    return { success: true, cached: true, analysis: existing };
  }

  const prompt = `
Compare these DealKart products and choose the better overall option. Consider review rating, review count, review sentiment, specifications, price/value, positive points and complaints.

Products:
${JSON.stringify(safeProducts, null, 2)}

Return valid JSON only:
{
  "productName": "best product name",
  "overallScore": number,
  "summary": "short comparison summary",
  "positivePoints": ["2-4 reasons the winner is strong"],
  "negativePoints": ["important tradeoffs"],
  "recommendationReason": "2-4 short sentences explaining the choice",
  "sentiment": { "positive": 0, "neutral": 0, "negative": 0 }
}
`;

  const { parsed, sources } = await callGeminiJson({ prompt, operation: 'comparison', query, useGrounding: false });
  const saved = await saveAnalysis({
    query,
    queryKey,
    productName: normalizeText(parsed.productName || safeProducts[0]?.name || 'Comparison'),
    store: 'DealKart',
    source: 'Gemini comparison',
    analysis: { ...parsed, recommendationLabel: 'AI Comparison' },
    analysisType: 'comparison',
    sources,
  });

  return { success: true, cached: false, analysis: saved };
};

const getStoredAnalysesForProducts = async (productIds = []) => {
  if (!Array.isArray(productIds) || productIds.length === 0) {
    return {};
  }

  const analyses = await ReviewAnalysis.find({
    productId: { $in: productIds },
    analyzedAt: { $gte: new Date(Date.now() - CACHE_TTL_MS) },
  });

  return analyses.reduce((acc, analysis) => {
    acc[String(analysis.productId)] = analysis;
    return acc;
  }, {});
};

const getReviewDataForProduct = async ({ productName, source, productId }) => {
  const reviewData = await ReviewData.find({
    productName: { $regex: productName, $options: 'i' },
    ...(productId ? { productId } : {}),
  }).sort({ fetchedAt: -1 }).limit(20);

  return reviewData.map((entry) => ({
    rating: entry.rating || 0,
    reviewText: entry.reviewText || '',
    source: entry.source || source || 'stored-data',
    fetchedAt: entry.fetchedAt,
  }));
};

module.exports = {
  searchProductsWithGemini,
  generateReviewAnalysis,
  compareProductsWithGemini,
  getStoredAnalysesForProducts,
  getReviewDataForProduct,
  hasValidGeminiConfig,
};
