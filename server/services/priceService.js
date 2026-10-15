const Product = require('../models/Product');
const Price = require('../models/Price');
const PriceHistory = require('../models/PriceHistory');
const Store = require('../models/Store');
const Category = require('../models/Category');
const PriceAlert = require('../models/PriceAlert');
const Notification = require('../models/Notification');
const ReviewAnalysis = require('../models/ReviewAnalysis');
const { searchProductsWithGemini } = require('./geminiService');

class PriceService {
  constructor() {
    this.sources = [{ name: 'Gemini web grounding' }];
    this.searchSources = [{ name: 'Gemini web grounding' }];
  }

  normalizeProductName(value = '') {
    return String(value || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .replace(/\b(5g|smartphone|mobile|phone|new|sealed|unlocked)\b/g, ' ')
      .replace(/\b\d+\s*(gb|tb|mb|ram|rom|storage)\b/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  getBrandAndModelKey(name = '') {
    const normalized = this.normalizeProductName(name);
    const tokens = normalized.split(' ').filter(Boolean);

    if (tokens.length === 0) {
      return 'product';
    }

    const brandAliases = {
      apple: ['iphone', 'ipad', 'macbook', 'airpods'],
      samsung: ['galaxy'],
      google: ['pixel'],
      oneplus: ['nord'],
      sony: ['playstation', 'ps5'],
      microsoft: ['xbox', 'surface'],
    };

    const explicitBrand = Object.keys(brandAliases).find((brand) => tokens.includes(brand));
    const inferredBrand = explicitBrand || Object.entries(brandAliases).find(([, aliases]) => aliases.some((alias) => tokens.includes(alias)))?.[0] || tokens[0];
    const modelTokens = tokens.filter((token) => token !== inferredBrand).slice(0, 4);

    return [inferredBrand, ...modelTokens].join(' ').trim() || normalized;
  }

  offersMatchByBrandModel(left, right) {
    return this.getBrandAndModelKey(left?.name || '') === this.getBrandAndModelKey(right?.name || '');
  }

  normalizeStoreName(storeName = '') {
    return String(storeName || '')
      .toLowerCase()
      .replace(/\.(in|com|co|net|org)/gi, '')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }

  isDedicatedStoreOffer(product) {
    const storeName = this.normalizeStoreName(product?.store || product?.storeName || '');
    return ['amazon', 'myntra', 'flipkart', 'croma'].some((name) => storeName === name || storeName.includes(name));
  }

  async fetchProductPrices(query) {
    const failures = [];
    let successfulOffers = [];
    let geminiResult = null;

    try {
      geminiResult = await searchProductsWithGemini(query);
      successfulOffers = (geminiResult.products || []).map((product) => ({
        ...product,
        sourceName: 'Gemini web grounding',
        fetchStatus: 'SUCCESS',
      }));
      console.log(`[Price Service] Gemini web grounding returned ${successfulOffers.length} product(s)`);
    } catch (error) {
      const message = error.message || 'Unknown Gemini error';
      failures.push({ source: 'Gemini web grounding', error: message });
      console.error('[Price Service] Gemini web grounding search failed:', message);
    }

    const mergedResults = successfulOffers
      .filter((offer) => offer?.name)
      .sort((a, b) => {
        const scoreDiff = (Number(b.overallScore) || 0) - (Number(a.overallScore) || 0);
        if (scoreDiff !== 0) return scoreDiff;
        return (Number(a.price) || Number.MAX_SAFE_INTEGER) - (Number(b.price) || Number.MAX_SAFE_INTEGER);
      });

    const primaryOffer = mergedResults[0] || successfulOffers[0] || { name: query };
    const productKey = this.getBrandAndModelKey(primaryOffer.name || query);
    const sourceStatuses = this.searchSources.map((source) => {
      const failed = failures.find((failure) => failure.source === source.name);
      return failed
        ? { source: source.name, fetchStatus: 'FAILED', error: failed.error }
        : { source: source.name, fetchStatus: 'SUCCESS' };
    });

    const hydratedResults = mergedResults.map((offer) => ({
      ...offer,
      productKey,
      canonicalProductName: primaryOffer.name || offer.name || query,
      sourceStatuses,
      sources: geminiResult?.sources || [],
    }));

    console.log('[Price Service] Gemini normalized products:', JSON.stringify(hydratedResults.slice(0, 10), null, 2));

    return {
      results: hydratedResults,
      failures,
      recommendations: geminiResult?.recommendations || [],
      recommendedProduct: geminiResult?.recommendedProduct || null,
      sources: geminiResult?.sources || [],
      cached: Boolean(geminiResult?.cached),
    };
  }

  async getSearchCategoryRecord() {
    return Category.findOneAndUpdate(
      { slug: 'live-search' },
      {
        name: 'Live Search',
        slug: 'live-search',
        icon: 'search',
        description: 'Products created from live marketplace search results',
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  async findOrCreateProductForOffer(localProducts, offer) {
    const incomingKey = this.getBrandAndModelKey(offer?.canonicalProductName || offer?.name || '');
    const existingProduct = localProducts.find((product) => {
      const productOffer = { name: `${product.brand || ''} ${product.name || ''}`.trim() };
      return this.offersMatchByBrandModel(productOffer, { name: incomingKey });
    });

    if (existingProduct) {
      return existingProduct;
    }

    const category = await this.getSearchCategoryRecord();
    const name = offer?.canonicalProductName || offer?.name || 'Live Search Product';
    const brand = this.getBrandAndModelKey(name).split(' ')[0] || offer?.store || 'Marketplace';

    const createdProduct = await Product.create({
      name,
      brand: brand.charAt(0).toUpperCase() + brand.slice(1),
      description: `Live marketplace result for ${name}.`,
      category: category._id,
      imageUrl: offer?.imageUrl || '',
      rating: Number(offer?.rating || 0) || 0,
      reviewCount: Number(offer?.reviewCount || 0) || 0,
      fetchStatus: 'SUCCESS',
    });

    localProducts.push(createdProduct);
    return createdProduct;
  }

  async saveSearchResultsToProducts(localProducts, apiResults) {
    if (!Array.isArray(apiResults) || apiResults.length === 0) {
      return [];
    }

    const productGroups = new Map();

    for (const apiProduct of apiResults) {
      const productKey = apiProduct.productKey || this.getBrandAndModelKey(apiProduct.canonicalProductName || apiProduct.name || '');
      if (!productGroups.has(productKey)) {
        productGroups.set(productKey, []);
      }
      productGroups.get(productKey).push(apiProduct);
    }

    for (const offers of productGroups.values()) {
      const representativeOffer = [...offers].sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0))[0];
      const existingProduct = await this.findOrCreateProductForOffer(localProducts, representativeOffer);

      if (!existingProduct) {
        continue;
      }

      const nextLowestPrice = existingProduct.lowestPrice
        ? Math.min(existingProduct.lowestPrice, ...offers.map((offer) => offer.price || existingProduct.lowestPrice))
        : Math.min(...offers.map((offer) => offer.price || Number.MAX_SAFE_INTEGER).filter(Boolean));
      const nextHighestPrice = existingProduct.highestPrice
        ? Math.max(existingProduct.highestPrice, ...offers.map((offer) => offer.originalPrice || offer.price || existingProduct.highestPrice))
        : Math.max(...offers.map((offer) => offer.originalPrice || offer.price || 0));

      existingProduct.lowestPrice = Number.isFinite(nextLowestPrice) && nextLowestPrice !== Number.MAX_SAFE_INTEGER ? nextLowestPrice : 0;
      existingProduct.highestPrice = Number.isFinite(nextHighestPrice) ? nextHighestPrice : existingProduct.lowestPrice;
      existingProduct.maxDiscount = Math.max(existingProduct.maxDiscount || 0, ...offers.map((offer) => offer.discount || 0));
      existingProduct.imageUrl = existingProduct.imageUrl || representativeOffer.imageUrl || '';
      existingProduct.lastSuccessfulFetch = new Date();
      existingProduct.fetchStatus = 'SUCCESS';
      await existingProduct.save();

      for (const apiProduct of offers) {
        const storeRecord = await this.getStoreRecord(apiProduct.store || apiProduct.storeName || 'Unknown');
        const existingPrice = await Price.findOne({
          productId: existingProduct._id,
          storeId: storeRecord._id,
        });
        const isPriceChanged = !existingPrice || existingPrice.price !== (apiProduct.price || 0);

        await Price.findOneAndUpdate(
          { productId: existingProduct._id, storeId: storeRecord._id },
          {
            productId: existingProduct._id,
            storeId: storeRecord._id,
            price: apiProduct.price || 0,
            originalPrice: apiProduct.originalPrice || apiProduct.price || 0,
            discount: apiProduct.discount || 0,
            availability: apiProduct.availability === 'Out of Stock'
              ? 'Out of Stock'
              : apiProduct.availability === 'Limited Stock'
                ? 'Limited Stock'
                : 'In Stock',
            productUrl: apiProduct.productUrl || storeRecord.websiteUrl,
            imageUrl: apiProduct.imageUrl || '',
            lastUpdated: new Date(),
            lastFetchStatus: 'SUCCESS',
          },
          { upsert: true, new: true }
        );

        if (isPriceChanged && apiProduct.price > 0) {
          await PriceHistory.create({
            productId: existingProduct._id,
            storeId: storeRecord._id,
            price: apiProduct.price,
            recordedAt: new Date(),
          });
        }

        if (apiProduct.reviewAnalysis) {
          await ReviewAnalysis.findOneAndUpdate(
            {
              productId: existingProduct._id,
              analysisType: 'product',
              queryKey: `product:${this.normalizeProductName(existingProduct.name)}`,
            },
            {
              productId: existingProduct._id,
              query: apiProduct.query || existingProduct.name,
              queryKey: `product:${this.normalizeProductName(existingProduct.name)}`,
              analysisType: 'product',
              productName: existingProduct.name,
              store: apiProduct.store || apiProduct.storeName || '',
              source: 'Gemini web grounding',
              price: apiProduct.price || 0,
              imageUrl: apiProduct.imageUrl || existingProduct.imageUrl || '',
              rating: apiProduct.rating || 0,
              reviewCount: apiProduct.reviewCount || 0,
              overallScore: apiProduct.reviewAnalysis.overallScore || apiProduct.reviewAnalysis.score || 0,
              summary: apiProduct.reviewAnalysis.summary || '',
              positivePoints: apiProduct.reviewAnalysis.positivePoints || [],
              negativePoints: apiProduct.reviewAnalysis.negativePoints || [],
              sentiment: apiProduct.reviewAnalysis.sentimentBreakdown || { positive: 0, neutral: 0, negative: 0 },
              recommendationReason: apiProduct.reviewAnalysis.recommendationReason || '',
              sources: apiProduct.sources || [],
              analyzedAt: new Date(),
              expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
          );
        }

        storeRecord.lastSuccessfulFetch = new Date();
        storeRecord.lastFetchStatus = 'SUCCESS';
        await storeRecord.save();
      }
    }

    for (const product of localProducts) {
      const prices = await Price.find({ productId: product._id });
      if (prices.length > 0) {
        product.lowestPrice = Math.min(...prices.map((entry) => entry.price || 0));
        product.highestPrice = Math.max(...prices.map((entry) => entry.originalPrice || entry.price || 0));
        product.maxDiscount = Math.max(...prices.map((entry) => entry.discount || 0), 0);
        product.availableStoresCount = prices.length;
      }
      await product.save();
    }

    return apiResults;
  }

  /**
   * Helper to fetch or get store document by name
   */
  async getStoreRecord(storeName) {
    let store = await Store.findOne({ name: storeName });
    if (!store) {
      store = await Store.create({
        name: storeName,
        websiteUrl: `https://www.${storeName.toLowerCase().replace(/\s+/g, '')}.com`,
        sourceType: 'gemini',
        status: 'active',
      });
    }
    return store;
  }

  /**
   * Fetch prices for a single product across its appropriate store adapters
   */
  async updateProductPrices(product) {
    const query = `${product.brand} ${product.name}`.trim();
    console.log(`[Price Engine]: Querying Gemini web grounding for "${query}"...`);

    const results = [];
    const sourceStatuses = [];

    try {
      const liveSearch = await this.fetchProductPrices(query);
      const offers = liveSearch.results || [];

      for (const priceData of offers) {
        if (!priceData || priceData.price <= 0) {
          continue;
        }

        const storeRecord = await this.getStoreRecord(priceData.store || priceData.storeName || 'Gemini Source');
        storeRecord.lastAttemptedFetch = new Date();

        const existingPrice = await Price.findOne({
          productId: product._id,
          storeId: storeRecord._id,
        });
        const isPriceChanged = !existingPrice || existingPrice.price !== priceData.price;

        const updatedPrice = await Price.findOneAndUpdate(
          { productId: product._id, storeId: storeRecord._id },
          {
            price: priceData.price,
            originalPrice: priceData.originalPrice || priceData.price,
            discount: priceData.discount || 0,
            availability: priceData.availability === 'Out of Stock' ? 'Out of Stock' : 'In Stock',
            productUrl: priceData.productUrl || existingPrice?.productUrl || storeRecord.websiteUrl,
            imageUrl: priceData.imageUrl || '',
            lastUpdated: new Date(),
            lastFetchStatus: 'SUCCESS',
          },
          { upsert: true, new: true }
        );

        if (isPriceChanged) {
          await PriceHistory.create({
            productId: product._id,
            storeId: storeRecord._id,
            price: priceData.price,
            recordedAt: new Date(),
          });
        }

        storeRecord.lastSuccessfulFetch = new Date();
        storeRecord.lastFetchStatus = 'SUCCESS';
        await storeRecord.save();

        results.push(updatedPrice);
        sourceStatuses.push({ source: storeRecord.name, status: 'SUCCESS', price: priceData.price });
      }
    } catch (err) {
      console.error('[Price Engine Error] Gemini price refresh failed:', err.message);
      sourceStatuses.push({ source: 'Gemini web grounding', status: 'FAILED', error: err.message });
    }

    // Recalculate and update product's cached price range
    const allStorePrices = await Price.find({ productId: product._id });
    if (allStorePrices.length > 0) {
      const prices = allStorePrices.map((p) => p.price);
      const discounts = allStorePrices.map((p) => p.discount);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const maxDisc = Math.max(...discounts, 0);

      product.lowestPrice = minPrice;
      product.highestPrice = maxPrice;
      product.maxDiscount = maxDisc;
      product.availableStoresCount = allStorePrices.length;
      await product.save();

      // Check price drop alerts
      await this.checkPriceDropAlerts(product._id, minPrice, product.name);
    }

    return {
      product: product.name,
      pricesFound: results.length,
      sourceStatuses,
    };
  }

  /**
   * Check if any user's active price-drop alert is met
   */
  async checkPriceDropAlerts(productId, currentLowestPrice, productName) {
    try {
      const activeAlerts = await PriceAlert.find({
        productId,
        status: 'active',
        targetPrice: { $gte: currentLowestPrice },
      });

      for (const alert of activeAlerts) {
        alert.status = 'triggered';
        alert.triggeredAt = new Date();
        await alert.save();

        await Notification.create({
          userId: alert.userId,
          productId,
          type: 'price_drop',
          message: `Great news! "${productName}" has dropped to ₹${currentLowestPrice.toLocaleString(
            'en-IN'
          )}, which meets your target alert price of ₹${alert.targetPrice.toLocaleString('en-IN')}!`,
          read: false,
        });
      }

      return activeAlerts.length;
    } catch (error) {
      console.error('[Price Alert Trigger Error]:', error.message);
      return 0;
    }
  }

  /**
   * Run price update across all products in the database
   * (Invoked by cron or manual "Update Prices Now" button in Admin)
   */
  async updateAllProductPrices(limit = 10) {
    console.log('[Price Engine]: Starting scheduled / manual batch price update...');
    const startTime = Date.now();

    // Fetch products needing update (ordered by oldest updated prices or all)
    const products = await Product.find({}).limit(limit);
    let totalUpdated = 0;
    let alertsTriggered = 0;
    const summaries = [];

    for (const prod of products) {
      const summary = await this.updateProductPrices(prod);
      summaries.push(summary);
      totalUpdated++;
    }

    const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(
      `[Price Engine]: Completed price update for ${totalUpdated} products in ${durationSec}s.`
    );

    return {
      success: true,
      productsUpdated: totalUpdated,
      durationSeconds: durationSec,
      timestamp: new Date(),
      summaries,
    };
  }
}

module.exports = new PriceService();
