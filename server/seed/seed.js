const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: __dirname + '/../.env' });

const User = require('../models/User');
const Category = require('../models/Category');
const Store = require('../models/Store');
const Product = require('../models/Product');
const Price = require('../models/Price');
const PriceHistory = require('../models/PriceHistory');
const Coupon = require('../models/Coupon');
const PriceAlert = require('../models/PriceAlert');
const Wishlist = require('../models/Wishlist');
const Notification = require('../models/Notification');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/dealkart';
    await mongoose.connect(mongoUri);
    console.log(`[Seed Script]: Connected to MongoDB at ${mongoUri}`);

    // Clean database completely to ensure no legacy index conflicts
    console.log('[Seed Script]: Dropping database to reset legacy indexes...');
    await mongoose.connection.dropDatabase();
    console.log('[Seed Script]: Database reset cleanly.');

    // 1. Create Demo Users
    console.log('[Seed Script]: Creating Demo Accounts...');
    const adminUser = await User.create({
      name: 'DealKart Administrator',
      email: 'admin@dealkart.com',
      password: 'Admin@123',
      role: 'admin',
    });

    const studentUser = await User.create({
      name: 'College Student (Demo)',
      email: 'user@dealkart.com',
      password: 'User@123',
      role: 'user',
    });

    // 2. Create Stores discovered through Gemini grounding or maintained manually
    console.log('[Seed Script]: Creating Shopping Stores...');
    const storeData = [
      {
        name: 'Amazon',
        websiteUrl: 'https://www.amazon.in',
        sourceType: 'gemini',
        status: 'active',
        lastFetchStatus: 'SUCCESS',
        lastSuccessfulFetch: new Date(Date.now() - 1000 * 60 * 45), // 45 mins ago
        lastAttemptedFetch: new Date(Date.now() - 1000 * 60 * 45),
      },
      {
        name: 'Flipkart',
        websiteUrl: 'https://www.flipkart.com',
        sourceType: 'gemini',
        status: 'active',
        lastFetchStatus: 'SUCCESS',
        lastSuccessfulFetch: new Date(Date.now() - 1000 * 60 * 90), // 1.5 hrs ago
        lastAttemptedFetch: new Date(Date.now() - 1000 * 60 * 90),
      },
      {
        name: 'Croma',
        websiteUrl: 'https://www.croma.com',
        sourceType: 'gemini',
        status: 'active',
        lastFetchStatus: 'SUCCESS',
        lastSuccessfulFetch: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
        lastAttemptedFetch: new Date(Date.now() - 1000 * 60 * 30),
      },
      {
        name: 'Myntra',
        websiteUrl: 'https://www.myntra.com',
        sourceType: 'gemini',
        status: 'active',
        lastFetchStatus: 'SUCCESS',
        lastSuccessfulFetch: new Date(Date.now() - 1000 * 60 * 120), // 2 hrs ago
        lastAttemptedFetch: new Date(Date.now() - 1000 * 60 * 120),
      },
      {
        name: 'Ajio',
        websiteUrl: 'https://www.ajio.com',
        sourceType: 'gemini',
        status: 'active',
        lastFetchStatus: 'SUCCESS',
        lastSuccessfulFetch: new Date(Date.now() - 1000 * 60 * 60), // 1 hr ago
        lastAttemptedFetch: new Date(Date.now() - 1000 * 60 * 60),
      },
      {
        name: 'Reliance Digital',
        websiteUrl: 'https://www.reliancedigital.in',
        sourceType: 'gemini',
        status: 'active',
        lastFetchStatus: 'SUCCESS',
        lastSuccessfulFetch: new Date(Date.now() - 1000 * 60 * 75),
        lastAttemptedFetch: new Date(Date.now() - 1000 * 60 * 75),
      },
    ];

    const stores = await Store.insertMany(storeData);
    const storeMap = {};
    stores.forEach((s) => (storeMap[s.name] = s._id));

    // 3. Create Categories (9 major categories)
    console.log('[Seed Script]: Creating Categories...');
    const categoryData = [
      { name: 'Mobiles', slug: 'mobiles', icon: 'Smartphone', description: 'Smartphones, 5G devices & accessories' },
      { name: 'Laptops', slug: 'laptops', icon: 'Laptop', description: 'MacBooks, ultrabooks & gaming rigs' },
      { name: 'Headphones', slug: 'headphones', icon: 'Headphones', description: 'Wireless earbuds, noise cancelling headphones' },
      { name: 'Smart Watches', slug: 'smart-watches', icon: 'Watch', description: 'Fitness bands & luxury smart wearables' },
      { name: 'TVs', slug: 'tvs', icon: 'Tv', description: '4K OLED, QLED & Smart televisions' },
      { name: 'Cameras', slug: 'cameras', icon: 'Camera', description: 'Mirrorless cameras, DSLRs & professional lenses' },
      { name: 'Accessories', slug: 'accessories', icon: 'Zap', description: 'Chargers, docks, mice & powerbanks' },
      { name: 'Fashion', slug: 'fashion', icon: 'Shirt', description: 'Sneakers, apparel, watches & lifestyle' },
      { name: 'Fitness', slug: 'fitness', icon: 'Activity', description: 'Fitness trackers, dumbbells & workout gear' },
    ];

    const categories = await Category.insertMany(categoryData);
    const catMap = {};
    categories.forEach((c) => (catMap[c.slug] = c._id));

    // 4. Products with Real Indian Market Prices and Specifications
    console.log('[Seed Script]: Seeding 36 Products across 9 categories...');

    const productsSeed = [
      // 1. Mobiles
      {
        name: 'Apple iPhone 15 (128 GB) - Blue',
        brand: 'Apple',
        category: catMap['mobiles'],
        description: 'Dynamic Island bubbles up alerts and Live Activities. 48MP Main camera with 2x Telephoto. Durable color-infused glass and aluminum design.',
        imageUrl: 'https://www.apple.com/v/iphone/home/ck/images/meta/iphone__bh930eyjnj0i_og.png',
        rating: 4.6,
        reviewCount: 4210,
        specifications: {
          Display: '6.1-inch Super Retina XDR OLED',
          Processor: 'A16 Bionic chip',
          Camera: '48MP + 12MP Dual Rear, 12MP Front',
          Storage: '128 GB',
          Battery: 'Up to 20 hours video playback',
          OS: 'iOS 17',
        },
        prices: [
          { store: 'Flipkart', price: 65999, originalPrice: 79900, url: 'https://www.flipkart.com/apple-iphone-15-blue-128-gb/p/itmbf555373360e1' },
          { store: 'Amazon', price: 66499, originalPrice: 79900, url: 'https://www.amazon.in/dp/B0CHX1W1XY' },
          { store: 'Croma', price: 66990, originalPrice: 79900, url: 'https://www.croma.com/apple-iphone-15-128gb-blue/p/300652' },
          { store: 'Reliance Digital', price: 67900, originalPrice: 79900, url: 'https://www.reliancedigital.in/apple-iphone-15-128-gb-blue/p/493839311' },
        ],
      },
      {
        name: 'Samsung Galaxy S24 5G (8GB RAM, 256GB Storage) - Onyx Black',
        brand: 'Samsung',
        category: catMap['mobiles'],
        description: 'Galaxy AI is here. Search like never before, get real-time voice translation on a call, format your notes into a clear summary.',
        imageUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=80',
        rating: 4.5,
        reviewCount: 1890,
        specifications: {
          Display: '6.2-inch Dynamic AMOLED 2X, 120Hz',
          Processor: 'Exynos 2400 Deca-Core',
          Camera: '50MP + 12MP + 10MP Triple Camera',
          RAM: '8 GB',
          Storage: '256 GB',
          Battery: '4000 mAh Fast Charging',
        },
        prices: [
          { store: 'Amazon', price: 74999, originalPrice: 79999, url: 'https://www.amazon.in/dp/B0CS5X6D8N' },
          { store: 'Flipkart', price: 74999, originalPrice: 79999, url: 'https://www.flipkart.com/samsung-galaxy-s24-5g-onyx-black-256-gb/p/itm28eef62a939f6' },
          { store: 'Croma', price: 75999, originalPrice: 79999, url: 'https://www.croma.com/samsung-galaxy-s24-5g/p/304412' },
          { store: 'Reliance Digital', price: 76990, originalPrice: 79999, url: 'https://www.reliancedigital.in/samsung-s24-256gb/p/494352110' },
        ],
      },
      {
        name: 'OnePlus 12 5G (12GB RAM, 256GB Storage) - Silky Black',
        brand: 'OnePlus',
        category: catMap['mobiles'],
        description: 'Snapdragon 8 Gen 3 Flagship processor with 4th Gen Hasselblad Camera for Mobile. 100W SUPERVOOC charging.',
        imageUrl: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80',
        rating: 4.4,
        reviewCount: 2310,
        specifications: {
          Display: '6.82-inch 120Hz ProXDR 2K AMOLED',
          Processor: 'Qualcomm Snapdragon 8 Gen 3',
          Camera: '50MP Sony LYT-808 + 64MP 3X Periscope + 48MP Ultra-wide',
          Battery: '5400 mAh with 100W wired & 50W wireless',
          RAM: '12 GB LPDDR5X',
        },
        prices: [
          { store: 'Amazon', price: 64999, originalPrice: 69999, url: 'https://www.amazon.in/dp/B0CQPNWCF7' },
          { store: 'Croma', price: 64999, originalPrice: 69999, url: 'https://www.croma.com/oneplus-12-5g-256gb/p/304381' },
          { store: 'Reliance Digital', price: 65990, originalPrice: 69999, url: 'https://www.reliancedigital.in/oneplus-12/p/494352089' },
          { store: 'Flipkart', price: 66999, originalPrice: 69999, url: 'https://www.flipkart.com/oneplus-12-silky-black-256-gb/p/itmd4cfa43265eb4' },
        ],
      },
      {
        name: 'Google Pixel 8 5G (8GB RAM, 128GB Storage) - Hazel',
        brand: 'Google',
        category: catMap['mobiles'],
        description: 'Google Tensor G3 chip is built with Google AI for cutting-edge photo and video features, and smarter ways to help throughout the day.',
        imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80',
        rating: 4.3,
        reviewCount: 1420,
        specifications: {
          Display: '6.2-inch Actua display, 120Hz OLED',
          Processor: 'Google Tensor G3 & Titan M2',
          Camera: '50MP Octa PD + 12MP Ultra-wide with Macro Focus',
          Storage: '128 GB UFS 3.1',
          OS: 'Android 14 with 7 years of OS updates',
        },
        prices: [
          { store: 'Flipkart', price: 62999, originalPrice: 75999, url: 'https://www.flipkart.com/google-pixel-8-hazel-128-gb/p/itme35251a37c5f8' },
          { store: 'Amazon', price: 63499, originalPrice: 75999, url: 'https://www.amazon.in/dp/B0CGVDSTVT' },
          { store: 'Croma', price: 64999, originalPrice: 75999, url: 'https://www.croma.com/google-pixel-8/p/301982' },
        ],
      },

      // 2. Laptops
      {
        name: 'Apple MacBook Air 13" M3 chip (8GB Unified Memory, 256GB SSD) - Starlight',
        brand: 'Apple',
        category: catMap['laptops'],
        description: 'Lean. Mean. M3 machine. Built with Apple M3 chip with an 8-core CPU and up to 10-core GPU, up to 18 hours of battery life.',
        imageUrl: 'https://www.apple.com/v/macbook-air/z/images/meta/macbook_air_mx__ez5y0k5yy7au_og.png',
        rating: 4.8,
        reviewCount: 3180,
        specifications: {
          Processor: 'Apple M3 8-core CPU, 8-core GPU',
          Memory: '8GB Unified Memory',
          Storage: '256GB SSD',
          Display: '13.6-inch Liquid Retina display with True Tone',
          Weight: '1.24 kg',
          Battery: 'Up to 18 hours',
        },
        prices: [
          { store: 'Amazon', price: 103990, originalPrice: 114900, url: 'https://www.amazon.in/dp/B0CX21C64T' },
          { store: 'Croma', price: 104900, originalPrice: 114900, url: 'https://www.croma.com/apple-macbook-air-2024-m3/p/305272' },
          { store: 'Reliance Digital', price: 105990, originalPrice: 114900, url: 'https://www.reliancedigital.in/macbook-air-m3/p/494352410' },
          { store: 'Flipkart', price: 106990, originalPrice: 114900, url: 'https://www.flipkart.com/apple-2024-macbook-air-m3/p/itmd5f7243c3f256' },
        ],
      },
      {
        name: 'Dell XPS 13 9315 Laptop (Intel i5-1230U, 16GB RAM, 512GB SSD) - Sky Blue',
        brand: 'Dell',
        category: catMap['laptops'],
        description: 'Thinnest and lightest 13-inch XPS laptop designed for a lifestyle on the move with Intel Evo platform.',
        imageUrl: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop&q=80',
        rating: 4.3,
        reviewCount: 940,
        specifications: {
          Processor: '12th Gen Intel Core i5-1230U',
          RAM: '16GB LPDDR5 5200MHz',
          Storage: '512GB PCIe NVMe SSD',
          Display: '13.4" FHD+ (1920 x 1200) InfinityEdge, 500 nits',
          Weight: '1.17 kg',
        },
        prices: [
          { store: 'Amazon', price: 114990, originalPrice: 129990, url: 'https://www.amazon.in/dp/B0B68C3SGL' },
          { store: 'Croma', price: 118990, originalPrice: 129990, url: 'https://www.croma.com/dell-xps-13/p/260810' },
          { store: 'Reliance Digital', price: 119990, originalPrice: 129990, url: 'https://www.reliancedigital.in/dell-xps-13/p/493177112' },
        ],
      },
      {
        name: 'Lenovo ThinkPad X1 Carbon Gen 11 (Intel Core i7-1355U, 16GB, 512GB SSD)',
        brand: 'Lenovo',
        category: catMap['laptops'],
        description: 'Ultralight enterprise flagship engineered on Intel Evo with military-spec durability and legendary ThinkPad keyboard.',
        imageUrl: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80',
        rating: 4.7,
        reviewCount: 650,
        specifications: {
          Processor: '13th Gen Intel Core i7-1355U',
          Memory: '16GB Soldered LPDDR5-6400',
          Storage: '512GB SSD M.2 2280 PCIe 4.0x4',
          Display: '14" WUXGA (1920x1200) IPS 400nits Anti-glare',
          Weight: '1.12 kg',
        },
        prices: [
          { store: 'Amazon', price: 154990, originalPrice: 175000, url: 'https://www.amazon.in/dp/B0C39YTH5C' },
          { store: 'Croma', price: 159990, originalPrice: 175000, url: 'https://www.croma.com/lenovo-thinkpad-x1-carbon/p/275689' },
          { store: 'Reliance Digital', price: 162500, originalPrice: 175000, url: 'https://www.reliancedigital.in/lenovo-thinkpad-x1/p/493839211' },
        ],
      },
      {
        name: 'ASUS ROG Zephyrus G14 Gaming Laptop (AMD Ryzen 9 8945HS, RTX 4060, 16GB, 1TB)',
        brand: 'ASUS',
        category: catMap['laptops'],
        description: 'Precision CNC-machined aluminum chassis, stunning 3K 120Hz OLED ROG Nebula Display, and AMD Ryzen AI power.',
        imageUrl: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=80',
        rating: 4.6,
        reviewCount: 820,
        specifications: {
          Processor: 'AMD Ryzen 9 8945HS (Up to 5.2 GHz)',
          Graphics: 'NVIDIA GeForce RTX 4060 8GB GDDR6',
          Display: '14-inch 3K (2880 x 1800) OLED 120Hz 0.2ms',
          RAM: '16GB LPDDR5X 6400MHz',
          Storage: '1TB PCIe 4.0 NVMe SSD',
        },
        prices: [
          { store: 'Flipkart', price: 149990, originalPrice: 169990, url: 'https://www.flipkart.com/asus-rog-zephyrus-g14-2024/p/itm1288412092a1' },
          { store: 'Amazon', price: 152490, originalPrice: 169990, url: 'https://www.amazon.in/dp/B0CZJCG33D' },
          { store: 'Croma', price: 154990, originalPrice: 169990, url: 'https://www.croma.com/asus-rog-zephyrus-g14/p/306212' },
        ],
      },

      // 3. Headphones & Audio
      {
        name: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones - Black',
        brand: 'Sony',
        category: catMap['headphones'],
        description: 'Industry-leading noise canceling with two processors and eight microphones for unprecedented sound purity and call clarity.',
        imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80',
        rating: 4.7,
        reviewCount: 5280,
        specifications: {
          Type: 'Over-ear Wireless',
          Battery: '30 hours with ANC on (Quick charge: 3 min = 3 hours)',
          NoiseCancellation: 'Dual Processor V1 + HD Noise Cancelling QN1',
          Microphone: '4 Beamforming microphones',
          Weight: '250 grams',
        },
        prices: [
          { store: 'Amazon', price: 26990, originalPrice: 34990, url: 'https://www.amazon.in/dp/B09XS7JWHH' },
          { store: 'Flipkart', price: 27490, originalPrice: 34990, url: 'https://www.flipkart.com/sony-wh-1000xm5-bluetooth-headset/p/itm87a41235b2a0c' },
          { store: 'Croma', price: 28990, originalPrice: 34990, url: 'https://www.croma.com/sony-wh-1000xm5-noise-cancelling-headphones/p/262295' },
          { store: 'Reliance Digital', price: 29490, originalPrice: 34990, url: 'https://www.reliancedigital.in/sony-wh-1000xm5/p/492913101' },
        ],
      },
      {
        name: 'Bose QuietComfort Ultra Wireless Noise Cancelling Headphones - White Smoke',
        brand: 'Bose',
        category: catMap['headphones'],
        description: 'World-class noise cancellation, breakthrough spatialized audio for immersive listening, and ultra-luxurious design.',
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
        rating: 4.6,
        reviewCount: 1650,
        specifications: {
          Battery: 'Up to 24 hours playback',
          AudioTech: 'Bose Immersive Audio & CustomTune',
          Connectivity: 'Bluetooth 5.3 with multipoint',
          Controls: 'Touch volume slider and physical shortcut buttons',
        },
        prices: [
          { store: 'Amazon', price: 29900, originalPrice: 35900, url: 'https://www.amazon.in/dp/B0CCZ26B5V' },
          { store: 'Croma', price: 31900, originalPrice: 35900, url: 'https://www.croma.com/bose-quietcomfort-ultra-headphones/p/302488' },
          { store: 'Reliance Digital', price: 32900, originalPrice: 35900, url: 'https://www.reliancedigital.in/bose-qc-ultra/p/494248891' },
        ],
      },
      {
        name: 'Apple AirPods Pro (2nd Generation with MagSafe Case USB-C)',
        brand: 'Apple',
        category: catMap['headphones'],
        description: 'Up to 2x more Active Noise Cancellation, Adaptive Audio, Transparency mode, and Personalized Spatial Audio with dynamic head tracking.',
        imageUrl: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&auto=format&fit=crop&q=80',
        rating: 4.8,
        reviewCount: 6890,
        specifications: {
          Chip: 'Apple H2 headphone chip in earbuds, U1 in case',
          Battery: '6 hours on single charge, up to 30 hours with case',
          Charging: 'USB-C, MagSafe, Apple Watch charger, Qi certified',
          SweatAndWaterResistance: 'IP54 dust, sweat, and water resistant',
        },
        prices: [
          { store: 'Amazon', price: 21990, originalPrice: 24900, url: 'https://www.amazon.in/dp/B0CHWRXH8B' },
          { store: 'Flipkart', price: 22499, originalPrice: 24900, url: 'https://www.flipkart.com/apple-airpods-pro-2nd-gen-usb-c/p/itmd5f7823412091' },
          { store: 'Croma', price: 22990, originalPrice: 24900, url: 'https://www.croma.com/apple-airpods-pro-2nd-gen-usb-c/p/301168' },
        ],
      },

      // 4. Smart Watches
      {
        name: 'Apple Watch Series 9 GPS 45mm - Midnight Aluminum with Sport Band',
        brand: 'Apple',
        category: catMap['smart-watches'],
        description: 'S9 SiP enables a super-illuminated display and a magical new way to interact with your Apple Watch using Double Tap gesture.',
        imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
        rating: 4.7,
        reviewCount: 3410,
        specifications: {
          CaseSize: '45mm Aluminum',
          Chip: 'S9 SiP 64-bit dual-core',
          Display: 'Always-On Retina OLED, up to 2000 nits',
          Sensors: 'Blood Oxygen, ECG, Temperature sensing, Fall/Crash detection',
          WaterResistance: '50m water resistant (swimproof)',
        },
        prices: [
          { store: 'Amazon', price: 41900, originalPrice: 44900, url: 'https://www.amazon.in/dp/B0CHX7XF64' },
          { store: 'Flipkart', price: 41999, originalPrice: 44900, url: 'https://www.flipkart.com/apple-watch-series-9-gps-45mm/p/itm19d28e754a123' },
          { store: 'Croma', price: 42900, originalPrice: 44900, url: 'https://www.croma.com/apple-watch-series-9-45mm/p/300712' },
          { store: 'Reliance Digital', price: 43490, originalPrice: 44900, url: 'https://www.reliancedigital.in/apple-watch-s9/p/493839810' },
        ],
      },
      {
        name: 'Samsung Galaxy Watch 6 44mm Bluetooth - Graphite',
        brand: 'Samsung',
        category: catMap['smart-watches'],
        description: 'Start your everyday wellness journey with sleep coaching, heart rate monitoring, body composition analysis (BIA), and Sapphire crystal glass.',
        imageUrl: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80',
        rating: 4.4,
        reviewCount: 1980,
        specifications: {
          Display: '1.5-inch Super AMOLED 480x480 Always-on',
          Sensors: 'Samsung BioActive Sensor (Optical Heart Rate + ECG + BIA)',
          Battery: '425 mAh Fast Wireless Charging',
          OS: 'Wear OS Powered by Samsung',
        },
        prices: [
          { store: 'Amazon', price: 26999, originalPrice: 33999, url: 'https://www.amazon.in/dp/B0CC9H5Y9F' },
          { store: 'Flipkart', price: 27499, originalPrice: 33999, url: 'https://www.flipkart.com/samsung-galaxy-watch-6-44mm/p/itm71cba5432918e' },
          { store: 'Croma', price: 28999, originalPrice: 33999, url: 'https://www.croma.com/samsung-galaxy-watch-6-44mm/p/276412' },
        ],
      },

      // 5. TVs
      {
        name: 'LG C3 55-inch 4K OLED evo Smart TV (OLED55C3PSA)',
        brand: 'LG',
        category: catMap['tvs'],
        description: 'Self-lit OLED evo pixels with Brightness Booster. α9 AI Processor Gen6 delivers spectacular picture and 0.1ms response time with Dolby Vision & Atmos.',
        imageUrl: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&auto=format&fit=crop&q=80',
        rating: 4.8,
        reviewCount: 1120,
        specifications: {
          ScreenSize: '55 inches',
          DisplayType: 'OLED evo 4K (3840 x 2160)',
          RefreshRate: '120Hz Native, G-Sync & FreeSync',
          Sound: '40W 2.2 Channel Dolby Atmos',
          Ports: '4x HDMI 2.1 (4K 120Hz, eARC), 3x USB',
        },
        prices: [
          { store: 'Amazon', price: 128490, originalPrice: 169990, url: 'https://www.amazon.in/dp/B0C5DT17F9' },
          { store: 'Croma', price: 129990, originalPrice: 169990, url: 'https://www.croma.com/lg-c3-55-inch-oled-4k-smart-tv/p/272312' },
          { store: 'Reliance Digital', price: 131990, originalPrice: 169990, url: 'https://www.reliancedigital.in/lg-c3-55inch-oled/p/493838210' },
          { store: 'Flipkart', price: 132490, originalPrice: 169990, url: 'https://www.flipkart.com/lg-c3-139-cm-55-inch-oled-ultra-hd-4k-smart-webos-tv/p/itm4b29141f23456' },
        ],
      },
      {
        name: 'Samsung 65-inch QLED 4K Smart TV (QA65Q60CAUXKE)',
        brand: 'Samsung',
        category: catMap['tvs'],
        description: '100% Color Volume with Quantum Dot. Quantum HDR and AirSlim design bring out the best in home entertainment.',
        imageUrl: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800&auto=format&fit=crop&q=80',
        rating: 4.5,
        reviewCount: 1450,
        specifications: {
          ScreenSize: '65 inches',
          Resolution: '4K Ultra HD (3840 x 2160)',
          Technology: 'Dual LED Quantum Dot',
          SmartTV: 'Tizen OS with Bixby and Alexa',
          Audio: '20W with Object Tracking Sound Lite',
        },
        prices: [
          { store: 'Amazon', price: 99990, originalPrice: 134900, url: 'https://www.amazon.in/dp/B0BY8KCH8J' },
          { store: 'Flipkart', price: 101990, originalPrice: 134900, url: 'https://www.flipkart.com/samsung-q60c-163-cm-65-inch-qled-ultra-hd-4k-smart-tizen-tv/p/itm5a61029c34512' },
          { store: 'Croma', price: 102990, originalPrice: 134900, url: 'https://www.croma.com/samsung-q60c-65-inch-qled-tv/p/271289' },
        ],
      },

      // 6. Cameras
      {
        name: 'Sony Alpha 7 IV Full-frame Mirrorless Interchangeable Lens Camera (Body Only)',
        brand: 'Sony',
        category: catMap['cameras'],
        description: '33MP Exmor R back-illuminated CMOS sensor with BIONZ XR processing engine. 4K 60p 10-bit 4:2:2 recording and Real-time Eye AF.',
        imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80',
        rating: 4.8,
        reviewCount: 910,
        specifications: {
          Sensor: '33.0 MP Full-Frame Exmor R CMOS',
          VideoResolution: '4K 60p in Super 35mm, 4K 30p full sensor oversampled 7K',
          Stabilization: '5-axis in-body optical image stabilization (5.5 stops)',
          Autofocus: '759 phase-detection points (94% coverage)',
          Connectivity: 'USB 3.2 Gen 2, Full HDMI, Wi-Fi 5GHz',
        },
        prices: [
          { store: 'Amazon', price: 214990, originalPrice: 242490, url: 'https://www.amazon.in/dp/B09K11718J' },
          { store: 'Croma', price: 219990, originalPrice: 242490, url: 'https://www.croma.com/sony-alpha-ilce-7m4-body-only/p/249821' },
          { store: 'Reliance Digital', price: 221990, originalPrice: 242490, url: 'https://www.reliancedigital.in/sony-a7-iv-camera/p/492573210' },
        ],
      },
      {
        name: 'Fujifilm X-T5 Mirrorless Digital Camera (Silver Body)',
        brand: 'Fujifilm',
        category: catMap['cameras'],
        description: 'Fifth-generation 40.2MP X-Trans CMOS 5 HR sensor and X-Processor 5. 7.0-stop 5-axis in-body image stabilization and classic dial operation.',
        imageUrl: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&auto=format&fit=crop&q=80',
        rating: 4.7,
        reviewCount: 480,
        specifications: {
          Sensor: '40.2MP X-Trans CMOS 5 HR APS-C',
          Video: '6.2K 30p, 4K 60p, FHD 240p 10-bit',
          Shutter: 'Electronic shutter up to 1/180,000 sec',
          Weight: '557 grams including battery and SD card',
        },
        prices: [
          { store: 'Amazon', price: 154990, originalPrice: 169999, url: 'https://www.amazon.in/dp/B0BLSQ52B1' },
          { store: 'Croma', price: 156990, originalPrice: 169999, url: 'https://www.croma.com/fujifilm-x-t5-body/p/266412' },
        ],
      },

      // 7. Accessories
      {
        name: 'Logitech MX Master 3S Wireless Performance Mouse - Graphite',
        brand: 'Logitech',
        category: catMap['accessories'],
        description: 'Quiet Clicks, 8K DPI track-on-glass sensor, and MagSpeed electromagnetic scrolling for supreme precision and tactile feel.',
        imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80',
        rating: 4.8,
        reviewCount: 4210,
        specifications: {
          Sensor: 'Darkfield 8000 DPI track on glass',
          ScrollWheel: 'MagSpeed SmartShift 1000 lines/sec',
          Battery: '500 mAh rechargeable (70 days full charge, 1 min = 3 hours)',
          Connectivity: 'Logi Bolt USB receiver or Bluetooth Low Energy',
        },
        prices: [
          { store: 'Amazon', price: 8495, originalPrice: 10995, url: 'https://www.amazon.in/dp/B0B11LK69K' },
          { store: 'Croma', price: 8995, originalPrice: 10995, url: 'https://www.croma.com/logitech-mx-master-3s-mouse/p/260481' },
          { store: 'Flipkart', price: 9299, originalPrice: 10995, url: 'https://www.flipkart.com/logitech-mx-master-3s-wireless-mouse/p/itm3c829e12019ab' },
        ],
      },
      {
        name: 'Anker 735 Charger (GaNPrime 65W 3-Port Fast Wall Charger)',
        brand: 'Anker',
        category: catMap['accessories'],
        description: 'Power 3 devices simultaneously with 2 USB-C ports and 1 USB-A port. GaNPrime dynamic power distribution with ActiveShield 2.0 safety.',
        imageUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80',
        rating: 4.6,
        reviewCount: 2190,
        specifications: {
          TotalWattage: '65W GaN',
          Ports: '2x USB-C (Max 65W single port), 1x USB-A (Max 22.5W)',
          Compatibility: 'MacBook, iPhone, Galaxy, iPad, Pixel',
        },
        prices: [
          { store: 'Amazon', price: 3499, originalPrice: 4999, url: 'https://www.amazon.in/dp/B09W2N774C' },
          { store: 'Croma', price: 3799, originalPrice: 4999, url: 'https://www.croma.com/anker-65w-ganprime-charger/p/271109' },
          { store: 'Flipkart', price: 3899, originalPrice: 4999, url: 'https://www.flipkart.com/anker-735-65w-gan-charger/p/itm5b128412891ec' },
        ],
      },

      // 8. Fashion & Lifestyle
      {
        name: 'Nike Air Max 270 Men Running & Lifestyle Shoes - Triple Black',
        brand: 'Nike',
        category: catMap['fashion'],
        description: 'Nike Air Max 270 delivers visible cushioning under every step with a huge 270 Max Air unit and breathable engineered mesh upper.',
        imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
        rating: 4.6,
        reviewCount: 3890,
        specifications: {
          Material: 'Breathable engineered mesh & synthetic',
          Sole: 'Rubber outsole with large 270 Max Air heel unit',
          Fit: 'Snug stretch bootie design',
          Color: 'Triple Black',
        },
        prices: [
          { store: 'Myntra', price: 11195, originalPrice: 13995, url: 'https://www.myntra.com/casual-shoes/nike/nike-men-black-air-max-270-sneakers/7451291/buy' },
          { store: 'Ajio', price: 11495, originalPrice: 13995, url: 'https://www.ajio.com/nike-air-max-270-lace-up-sneakers/p/469123891_black' },
          { store: 'Flipkart', price: 11895, originalPrice: 13995, url: 'https://www.flipkart.com/nike-air-max-270-sneakers-men/p/itm87c1209e12019' },
          { store: 'Amazon', price: 12290, originalPrice: 13995, url: 'https://www.amazon.in/dp/B078XG948F' },
        ],
      },
      {
        name: 'Adidas Ultraboost Light Running Shoes - Core Black / Cloud White',
        brand: 'Adidas',
        category: catMap['fashion'],
        description: 'Lightest Ultraboost ever made with 30% lighter BOOST material. Primeknit+ textile upper and Continental Better Rubber outsole.',
        imageUrl: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop&q=80',
        rating: 4.7,
        reviewCount: 2640,
        specifications: {
          Midsole: 'Light BOOST with Linear Energy Push system',
          Upper: 'Adidas PRIMEKNIT+ textile (contains 50% Parley Ocean Plastic)',
          Outsole: 'Continental Better Rubber',
          Weight: '299 grams (UK size 8.5)',
        },
        prices: [
          { store: 'Myntra', price: 13299, originalPrice: 18999, url: 'https://www.myntra.com/running-shoes/adidas/adidas-men-ultraboost-light-running-shoes/21983012/buy' },
          { store: 'Ajio', price: 13699, originalPrice: 18999, url: 'https://www.ajio.com/adidas-ultraboost-light-running-shoes/p/469248101_black' },
          { store: 'Amazon', price: 13999, originalPrice: 18999, url: 'https://www.amazon.in/dp/B0BSG9F44L' },
        ],
      },
      {
        name: "Levi's 511 Slim Fit Stretch Dark Indigo Jeans",
        brand: "Levi's",
        category: catMap['fashion'],
        description: 'A modern slim with room to move. Added stretch for all-day comfort. Sits below the waist with a slim leg from hip to ankle.',
        imageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&auto=format&fit=crop&q=80',
        rating: 4.4,
        reviewCount: 5120,
        specifications: {
          Fabric: '99% Cotton, 1% Elastane',
          Closure: 'Zip Fly with button closure',
          Fit: 'Slim through seat and thigh, slim leg',
        },
        prices: [
          { store: 'Myntra', price: 2199, originalPrice: 3999, url: 'https://www.myntra.com/jeans/levis/levis-511-slim-fit-jeans/1298412/buy' },
          { store: 'Ajio', price: 2299, originalPrice: 3999, url: 'https://www.ajio.com/levis-511-slim-fit-jeans/p/441298101_blue' },
          { store: 'Amazon', price: 2399, originalPrice: 3999, url: 'https://www.amazon.in/dp/B0759H4911' },
          { store: 'Flipkart', price: 2499, originalPrice: 3999, url: 'https://www.flipkart.com/levi-s-511-slim-men-dark-blue-jeans/p/itm5a82910c21098' },
        ],
      },

      // 9. Fitness
      {
        name: 'Fitbit Charge 6 Advanced Health & Fitness Tracker - Obsidian / Black Aluminum',
        brand: 'Fitbit',
        category: catMap['fitness'],
        description: 'Give your routine a boost with 40+ exercise modes, built-in GPS, EDA sensor for stress management, and Google Maps & Wallet integration.',
        imageUrl: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800&auto=format&fit=crop&q=80',
        rating: 4.3,
        reviewCount: 1650,
        specifications: {
          Battery: 'Up to 7 days battery life',
          Sensors: 'Optical heart rate, EDA Scan, Skin temp, SpO2',
          GPS: 'Built-in GPS + GLONASS',
          Waterproof: 'Water resistant up to 50 meters',
        },
        prices: [
          { store: 'Amazon', price: 11999, originalPrice: 14999, url: 'https://www.amazon.in/dp/B0CCV37T31' },
          { store: 'Croma', price: 12499, originalPrice: 14999, url: 'https://www.croma.com/fitbit-charge-6-tracker/p/302198' },
          { store: 'Reliance Digital', price: 12999, originalPrice: 14999, url: 'https://www.reliancedigital.in/fitbit-charge-6/p/494248101' },
        ],
      },
      {
        name: 'Bowflex SelectTech 552 Adjustable Dumbbells (Pair: 2.5 to 24 kg)',
        brand: 'Bowflex',
        category: catMap['fitness'],
        description: 'Replace 15 sets of weights with one compact pair. Dial system adjusts resistance from 2.5 kg up to 24 kg per dumbbell.',
        imageUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&auto=format&fit=crop&q=80',
        rating: 4.8,
        reviewCount: 1820,
        specifications: {
          WeightRange: '2.5 to 24 kg per dumbbell (5 to 52.5 lbs)',
          WeightSettings: '15 weight increments per dumbbell',
          Dimensions: '42.9 x 20.3 x 22.9 cm',
        },
        prices: [
          { store: 'Amazon', price: 37990, originalPrice: 44990, url: 'https://www.amazon.in/dp/B001ARYU58' },
          { store: 'Flipkart', price: 38990, originalPrice: 44990, url: 'https://www.flipkart.com/bowflex-selecttech-552-adjustable-dumbbells/p/itm12891048201ab' },
        ],
      },
      {
        name: 'Apple iPhone 15 Pro (128 GB) - Natural Titanium',
        brand: 'Apple',
        category: catMap['mobiles'],
        description: 'Forged in titanium with industry-leading A17 Pro chip. Customizable Action button. Pro camera system with 7 pro lenses.',
        imageUrl: 'https://www.apple.com/v/iphone/home/ck/images/meta/iphone__bh930eyjnj0i_og.png',
        rating: 4.8,
        reviewCount: 5120,
        specifications: {
          Display: '6.1-inch Super Retina XDR OLED with ProMotion 120Hz',
          Processor: 'A17 Pro chip with 6-core GPU',
          Camera: '48MP Main + 12MP Ultra-wide + 12MP 3x Telephoto',
          Storage: '128 GB NVMe',
          Frame: 'Grade 5 Titanium',
        },
        prices: [
          { store: 'Amazon', price: 127990, originalPrice: 134900, url: 'https://www.amazon.in/dp/B0CHWV2WYK' },
          { store: 'Flipkart', price: 128499, originalPrice: 134900, url: 'https://www.flipkart.com/apple-iphone-15-pro-natural-titanium-128-gb/p/itm3d213456789ab' },
          { store: 'Croma', price: 129900, originalPrice: 134900, url: 'https://www.croma.com/apple-iphone-15-pro-128gb-natural-titanium/p/300689' },
        ],
      },
      {
        name: 'Apple MacBook Pro 14" M3 (8-core CPU, 10-core GPU, 8GB, 512GB SSD) - Space Grey',
        brand: 'Apple',
        category: catMap['laptops'],
        description: 'Blazing-fast M3 chip with hardware-accelerated ray tracing, Liquid Retina XDR display with 1,600 nits peak brightness, and MagSafe 3.',
        imageUrl: 'https://www.apple.com/v/macbook-pro/ax/images/meta/macbook-pro__difvbgz1plsi_og.png',
        rating: 4.9,
        reviewCount: 1980,
        specifications: {
          Processor: 'Apple M3 chip (8-core CPU, 10-core GPU)',
          Memory: '8GB Unified Memory',
          Storage: '512GB SSD',
          Display: '14.2-inch Liquid Retina XDR (3024 x 1964) 120Hz ProMotion',
          Ports: 'HDMI, SDXC, 3.5mm headphone jack, 2x Thunderbolt / USB 4',
        },
        prices: [
          { store: 'Amazon', price: 159900, originalPrice: 169900, url: 'https://www.amazon.in/dp/B0CM5JSB8Z' },
          { store: 'Croma', price: 161900, originalPrice: 169900, url: 'https://www.croma.com/apple-macbook-pro-14-m3/p/302812' },
          { store: 'Reliance Digital', price: 163900, originalPrice: 169900, url: 'https://www.reliancedigital.in/apple-macbook-pro-14/p/494248201' },
        ],
      },
      {
        name: 'Sennheiser Momentum 4 Wireless Headphones - Denim Edition',
        brand: 'Sennheiser',
        category: catMap['headphones'],
        description: 'Audiophile-inspired 42mm transducer system delivering Sennheiser signature sound with staggering 60-hour battery life.',
        imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80',
        rating: 4.6,
        reviewCount: 2190,
        specifications: {
          Driver: '42mm dynamic driver',
          Battery: 'Up to 60 hours with ANC activated',
          Codecs: 'aptX, aptX Adaptive, AAC, SBC',
          NoiseCancellation: 'Hybrid Adaptive ANC with Transparency Mode',
        },
        prices: [
          { store: 'Amazon', price: 24990, originalPrice: 34990, url: 'https://www.amazon.in/dp/B0B6GHW1SX' },
          { store: 'Croma', price: 26990, originalPrice: 34990, url: 'https://www.croma.com/sennheiser-momentum-4-wireless/p/262512' },
          { store: 'Flipkart', price: 27490, originalPrice: 34990, url: 'https://www.flipkart.com/sennheiser-momentum-4-bluetooth-headset/p/itm4b29141029c12' },
        ],
      },
      {
        name: 'Garmin Forerunner 265 Running GPS Smartwatch - Black & Amp Yellow',
        brand: 'Garmin',
        category: catMap['smart-watches'],
        description: 'Vibrant AMOLED touchscreen display with training readiness score, morning report, wrist-based running power, and multi-band GPS.',
        imageUrl: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80',
        rating: 4.7,
        reviewCount: 890,
        specifications: {
          Display: '1.3-inch Colorful AMOLED Display (416 x 416)',
          Battery: 'Up to 13 days in smartwatch mode, 20 hours GPS',
          GPS: 'Multi-band GNSS with SatIQ technology',
          Weight: '47 grams lightweight running design',
        },
        prices: [
          { store: 'Amazon', price: 48490, originalPrice: 50490, url: 'https://www.amazon.in/dp/B0BSLN937P' },
          { store: 'Croma', price: 49990, originalPrice: 50490, url: 'https://www.croma.com/garmin-forerunner-265/p/274198' },
        ],
      },
      {
        name: 'Sony Bravia XR 55-inch 4K Ultra HD Smart OLED Google TV (XR-55A80L)',
        brand: 'Sony',
        category: catMap['tvs'],
        description: 'Cognitive Processor XR understands how humans see and hear to deliver intense contrast, pure OLED blacks, and Acoustic Surface Audio+ sound.',
        imageUrl: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&auto=format&fit=crop&q=80',
        rating: 4.8,
        reviewCount: 940,
        specifications: {
          Panel: '55" OLED XR Triluminos Pro 120Hz',
          Processor: 'Cognitive Processor XR',
          Gaming: 'Auto HDR Tone Mapping, 4K 120fps, VRR, ALLM for PS5',
          Audio: '50W 3.2ch Acoustic Surface Audio+',
        },
        prices: [
          { store: 'Amazon', price: 153990, originalPrice: 189900, url: 'https://www.amazon.in/dp/B0C39YTH5D' },
          { store: 'Croma', price: 154990, originalPrice: 189900, url: 'https://www.croma.com/sony-bravia-xr-55-inch-oled-tv/p/273112' },
          { store: 'Reliance Digital', price: 156990, originalPrice: 189900, url: 'https://www.reliancedigital.in/sony-a80l-55inch/p/493839101' },
        ],
      },
      {
        name: 'Canon EOS R6 Mark II Mirrorless Camera (RF 24-105mm IS STM Lens Kit)',
        brand: 'Canon',
        category: catMap['cameras'],
        description: '24.2MP full-frame CMOS sensor with up to 40 fps electronic shutter. 6K oversampled uncropped 4K 60p and Dual Pixel CMOS AF II.',
        imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80',
        rating: 4.8,
        reviewCount: 720,
        specifications: {
          Sensor: '24.2MP Full-Frame CMOS',
          BurstRate: 'Up to 40 fps electronic, 12 fps mechanical',
          Video: '6K oversampled 4K 60p 10-bit Canon Log 3',
          Stabilization: 'In-Body IS with up to 8 stops coordinated control',
        },
        prices: [
          { store: 'Amazon', price: 218990, originalPrice: 243995, url: 'https://www.amazon.in/dp/B0BMK2PXZX' },
          { store: 'Croma', price: 222990, originalPrice: 243995, url: 'https://www.croma.com/canon-eos-r6-mark-ii-lens-kit/p/266190' },
        ],
      },
      {
        name: 'Puma Iconic T7 Track Jacket - Puma Black',
        brand: 'Puma',
        category: catMap['fashion'],
        description: 'A true classic from 1968. Featuring signature 7cm stripes along the sleeves, ribbed stand-up collar, and soft cotton-poly blend.',
        imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80',
        rating: 4.5,
        reviewCount: 2110,
        specifications: {
          Material: '59% Polyester, 41% Cotton French Terry',
          Fit: 'Regular fit with full zip closure',
          Pockets: 'Side zip pockets',
        },
        prices: [
          { store: 'Myntra', price: 2749, originalPrice: 4999, url: 'https://www.myntra.com/jackets/puma/puma-men-black-t7-track-jacket/1928410/buy' },
          { store: 'Ajio', price: 2899, originalPrice: 4999, url: 'https://www.ajio.com/puma-t7-zip-front-track-jacket/p/469128091_black' },
          { store: 'Flipkart', price: 2999, originalPrice: 4999, url: 'https://www.flipkart.com/puma-men-black-track-jacket/p/itm5b12841209abc' },
        ],
      },
      {
        name: 'Spalding NBA Official Indoor/Outdoor Composite Basketball (Size 7)',
        brand: 'Spalding',
        category: catMap['fitness'],
        description: 'Premium composite leather cover with deep channel design for superior grip and dribble control on indoor hardwood and outdoor courts.',
        imageUrl: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=800&auto=format&fit=crop&q=80',
        rating: 4.6,
        reviewCount: 3120,
        specifications: {
          Size: 'Official Size 7 (29.5 inches)',
          Material: 'Full ball pebbling composite leather',
          Usage: 'Indoor / Outdoor recreational and competition',
        },
        prices: [
          { store: 'Amazon', price: 2499, originalPrice: 3499, url: 'https://www.amazon.in/dp/B00091RHQC' },
          { store: 'Flipkart', price: 2599, originalPrice: 3499, url: 'https://www.flipkart.com/spalding-composite-basketball-size-7/p/itm7a12098e12019' },
        ],
      },
    ];

    // Seed each product, its store prices, and 30-day historical prices
    let seededProductCount = 0;
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    for (const item of productsSeed) {
      const { prices: storePrices, ...productData } = item;

      const pValues = storePrices.map((sp) => sp.price);
      const dValues = storePrices.map((sp) =>
        Math.round(((sp.originalPrice - sp.price) / sp.originalPrice) * 100)
      );

      const product = await Product.create({
        ...productData,
        lowestPrice: Math.min(...pValues),
        highestPrice: Math.max(...pValues),
        maxDiscount: Math.max(...dValues, 0),
        availableStoresCount: storePrices.length,
      });

      // Insert current prices for each store
      for (const sp of storePrices) {
        const storeId = storeMap[sp.store];
        if (!storeId) continue;

        const discount = Math.round(((sp.originalPrice - sp.price) / sp.originalPrice) * 100);

        await Price.create({
          productId: product._id,
          storeId,
          price: sp.price,
          originalPrice: sp.originalPrice,
          discount,
          availability: 'In Stock',
          productUrl: sp.url,
          lastFetchStatus: 'SUCCESS',
          lastUpdated: new Date(),
        });

        // Generate 30-60 days of realistic simulated historical fluctuations
        // (e.g. price was slightly higher 30 days ago, dipped during sale 15 days ago, etc.)
        const historyEntries = [];
        const basePrice = sp.price;

        // Day 45 ago
        historyEntries.push({
          productId: product._id,
          storeId,
          price: Math.round(basePrice * 1.06),
          recordedAt: new Date(now - 45 * dayMs),
        });
        // Day 30 ago
        historyEntries.push({
          productId: product._id,
          storeId,
          price: Math.round(basePrice * 1.04),
          recordedAt: new Date(now - 30 * dayMs),
        });
        // Day 20 ago (Sale festival dip)
        historyEntries.push({
          productId: product._id,
          storeId,
          price: Math.round(basePrice * 0.97),
          recordedAt: new Date(now - 20 * dayMs),
        });
        // Day 10 ago
        historyEntries.push({
          productId: product._id,
          storeId,
          price: Math.round(basePrice * 1.02),
          recordedAt: new Date(now - 10 * dayMs),
        });
        // Current day
        historyEntries.push({
          productId: product._id,
          storeId,
          price: basePrice,
          recordedAt: new Date(),
        });

        await PriceHistory.insertMany(historyEntries);
      }

      seededProductCount++;
    }

    console.log(`[Seed Script]: Successfully created ${seededProductCount} products with full store prices and 45-day history.`);

    // 5. Create Active & Real Store Coupons
    console.log('[Seed Script]: Creating active store coupons...');
    const thirtyDaysAhead = new Date(now + 30 * dayMs);
    const fortyFiveDaysAhead = new Date(now + 45 * dayMs);

    const couponsData = [
      {
        code: 'CROMA5000',
        storeId: storeMap['Croma'],
        title: 'Flat ₹5,000 Off on Premium Laptops & MacBooks',
        discountType: 'flat',
        discountValue: 5000,
        startDate: new Date(),
        endDate: thirtyDaysAhead,
        description: 'Applicable on transactions above ₹75,000 using HDFC Bank credit cards at Croma stores & online.',
        active: true,
      },
      {
        code: 'MYNTRA15',
        storeId: storeMap['Myntra'],
        title: 'Extra 15% Off on Footwear & Running Shoes',
        discountType: 'percentage',
        discountValue: 15,
        startDate: new Date(),
        endDate: thirtyDaysAhead,
        description: 'Valid on Nike, Adidas, Puma footwear. Max discount up to ₹1,500.',
        active: true,
      },
      {
        code: 'AMZTECH1000',
        storeId: storeMap['Amazon'],
        title: 'Instant ₹1,000 Cashback on Noise Cancelling Audio',
        discountType: 'flat',
        discountValue: 1000,
        startDate: new Date(),
        endDate: fortyFiveDaysAhead,
        description: 'Valid on Sony, Bose, and Apple AirPods on Amazon India with SBI Card.',
        active: true,
      },
      {
        code: 'FKSMART2000',
        storeId: storeMap['Flipkart'],
        title: '₹2,000 Instant Discount on 5G Smartphones',
        discountType: 'flat',
        discountValue: 2000,
        startDate: new Date(),
        endDate: thirtyDaysAhead,
        description: 'Valid on iPhone 15, Galaxy S24, and OnePlus 12 via Flipkart Axis Bank card.',
        active: true,
      },
      {
        code: 'AJIOFIRST20',
        storeId: storeMap['Ajio'],
        title: '20% Off on Premium Fashion & Denim',
        discountType: 'percentage',
        discountValue: 20,
        startDate: new Date(),
        endDate: thirtyDaysAhead,
        description: 'Valid on orders above ₹2,490 on Ajio across all brand collections.',
        active: true,
      },
      {
        code: 'RELIANCE3000',
        storeId: storeMap['Reliance Digital'],
        title: 'Flat ₹3,000 Off on 4K OLED and QLED Smart TVs',
        discountType: 'flat',
        discountValue: 3000,
        startDate: new Date(),
        endDate: fortyFiveDaysAhead,
        description: 'Valid on LG, Samsung & Sony 55"+ Smart TVs at Reliance Digital.',
        active: true,
      },
    ];

    await Coupon.insertMany(couponsData);

    // 6. Create sample Wishlist, Price Alert, and Notification for Demo User
    console.log('[Seed Script]: Creating demo user Wishlist and Price Alerts...');
    const iphoneProduct = await Product.findOne({ brand: 'Apple', name: /iPhone 15/i });
    const sonyHeadphones = await Product.findOne({ brand: 'Sony', name: /WH-1000XM5/i });

    if (iphoneProduct) {
      await Wishlist.create({
        userId: studentUser._id,
        productId: iphoneProduct._id,
      });

      // Price alert with target higher than current -> triggers immediately!
      await PriceAlert.create({
        userId: studentUser._id,
        productId: iphoneProduct._id,
        targetPrice: 66000,
        status: 'triggered',
        triggeredAt: new Date(now - 1000 * 60 * 15),
      });

      await Notification.create({
        userId: studentUser._id,
        productId: iphoneProduct._id,
        type: 'price_drop',
        message: `Price Drop Alert! "Apple iPhone 15 (128 GB)" is currently at ₹${iphoneProduct.lowestPrice.toLocaleString('en-IN')}, reaching your target price!`,
        read: false,
      });
    }

    if (sonyHeadphones) {
      await Wishlist.create({
        userId: studentUser._id,
        productId: sonyHeadphones._id,
      });

      // Active alert waiting for price to drop further
      await PriceAlert.create({
        userId: studentUser._id,
        productId: sonyHeadphones._id,
        targetPrice: 24000,
        status: 'active',
      });
    }

    console.log('===========================================================');
    console.log('✅ SEED COMPLETED SUCCESSFULLY!');
    console.log(`👤 Admin: ${adminUser.email} / Admin@123`);
    console.log(`👤 Demo User: ${studentUser.email} / User@123`);
    console.log(`📦 Seeded Products: ${seededProductCount}`);
    console.log(`🏪 Seeded Stores: ${stores.length}`);
    console.log(`🏷️  Seeded Coupons: ${couponsData.length}`);
    console.log('===========================================================');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Script Error]:', error);
    process.exit(1);
  }
};

seedData();
