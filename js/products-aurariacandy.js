/**
🔧 Aureria Candy - Centralized Product Data & Utilities (ULTRA PERFORMANCE EDITION)
📁 Path: /js/products-aureriacandy.js
✅ Specially coated candy fruits, sherbet, bubblegum flavours
*/
(function () {
'use strict';

// ️ ADVANCED CONFIGURATION
const CONFIG = {
  // ⚠️ IMPORTANT: Replace with your Google Apps Script deployment URL when ready
  SHEETS_API_URL: "https://script.google.com/macros/s/AKfycbz-WDbEedZrsqGcAA4ll9M1pPtyAZkT1n9W2OFYNgxlynRqKoBzBnDx2YEcIsTE1zfw/exec",
  basePath: "",
  imageDir: "/images",
  fallbackImage: "/images/aureria-candy-logo.jpg",
  businessName: "Aureria Candy",
  businessLogo: "/images/aureria-candy-logo.jpg",
  CACHE_KEY: "aureriacandy_products_cache_v1", // Fixed: Matches HTML cache key, removed trailing space
  CART_KEY: "aureriacandy_cart_v1",
  CACHE_TTL: 10 * 60 * 1000, // 10 minutes
  WHATSAPP_NUMBER: "27123456789", // Fixed: Removed trailing space
  
  resolveImage: function(src) {
    if (!src) return CONFIG.fallbackImage;
    if (src.indexOf('http://') === 0 || src.indexOf('https://') === 0) return src;
    if (src.indexOf(CONFIG.basePath) === 0) return src; // Fixed: Removed space in "basePa th"
    if (src.indexOf('/') === 0) return src;
    return CONFIG.basePath + CONFIG.imageDir + "/" + src;
  }
};

// ️ STATIC FALLBACK DATA (Candy Products from Aureria Candy)
const FALLBACK_PRODUCTS = [
  {
    id: "aureria-box-001",
    name: "Aureria Candy Box - Strawberry Mix",
    price: 75.00,
    category: "Candy Boxes",
    niche: "candy",
    location: "johannesburg",
    description: "Box of 12 specially coated candy fruits. Contains Strawberry Sherbet & Sour Strawberry flavours. Fresh ingredients, crackly coating, irresistible taste!",
    badge: "🔥 Best Seller",
    image: "/images/products/aureria-strawberry-box.jpg",
    popupImages: ["/images/products/aureria-strawberry-box.jpg"],
    businessName: "Aureria Candy",
    businessLogo: "/images/aureria-candy-logo.jpg",
    active: true
  },
  {
    id: "aureria-box-002",
    name: "Aureria Candy Box - Bubblegum Mix",
    price: 75.00,
    category: "Candy Boxes",
    niche: "candy",
    location: "johannesburg",
    description: "Box of 12 specially coated candy fruits. Contains Strawberry Bubblegum & Sour Strawberry Bubblegum flavours. Perfect for parties and events!",
    badge: "✨ Popular",
    image: "/images/products/aureria-bubblegum-box.jpg",
    popupImages: ["/images/products/aureria-bubblegum-box.jpg"],
    businessName: "Aureria Candy",
    businessLogo: "/images/aureria-candy-logo.jpg",
    active: true
  },
  {
    id: "aureria-box-003",
    name: "Aureria Candy Box - Blue Raspberry",
    price: 75.00,
    category: "Candy Boxes",
    niche: "candy",
    location: "johannesburg",
    description: "Box of 12 specially coated candy fruits. Contains Blue Raspberry Sherbet & Sour Blue Raspberry Sherbet. Cool and refreshing!",
    badge: "💰 Value",
    image: "/images/products/aureria-blueraspberry-box.jpg",
    popupImages: ["/images/products/aureria-blueraspberry-box.jpg"],
    businessName: "Aureria Candy",
    businessLogo: "/images/aureria-candy-logo.jpg",
    active: true
  },
  {
    id: "aureria-box-004",
    name: "Aureria Candy Box - Orange Sherbet",
    price: 75.00,
    category: "Candy Boxes",
    niche: "candy",
    location: "johannesburg",
    description: "Box of 12 specially coated candy fruits. Contains Orange Sherbet & Bubblegum Sherbet. Citrus burst with sweet bubblegum!",
    badge: "⭐ Premium",
    image: "/images/products/aureria-orange-box.jpg",
    popupImages: ["/images/products/aureria-orange-box.jpg"],
    businessName: "Aureria Candy",
    businessLogo: "/images/aureria-candy-logo.jpg",
    active: true
  },
  {
    id: "aureria-box-005",
    name: "Aureria Candy Box - Mixed Flavours",
    price: 75.00,
    category: "Candy Boxes",
    niche: "candy",
    location: "johannesburg",
    description: "Box of 12 specially coated candy fruits. Mix and match your favourite flavours. Colors customizable to your suitings!",
    badge: "🎨 Customizable",
    image: "/images/products/aureria-mixed-box.jpg",
    popupImages: ["/images/products/aureria-mixed-box.jpg"],
    businessName: "Aureria Candy",
    businessLogo: "/images/aureria-candy-logo.jpg",
    active: true
  },
  {
    id: "aureria-party-pack",
    name: "Aureria Party Pack (5 Boxes)",
    price: 350.00,
    category: "Party Packs",
    niche: "candy",
    location: "johannesburg",
    description: "Party pack with 5 boxes (60 pieces total). Choose your favourite flavour combinations. Perfect for birthdays and events!",
    badge: "🎉 Party Special",
    image: "/images/products/aureria-party-pack.jpg",
    popupImages: ["/images/products/aureria-party-pack.jpg"],
    businessName: "Aureria Candy",
    businessLogo: "/images/aureria-candy-logo.jpg",
    active: true
  }
];

// 🌐 State management
let PRODUCTS = [];
let PRODUCTS_MAP = new Map();
let isLoading = false;
let loadError = null;
let lastRawSnapshot = null;

// ⚡ localStorage cache helpers
function getCachedProducts() {
  try {
    const cached = localStorage.getItem(CONFIG.CACHE_KEY);
    if (!cached) return null;
    const data = JSON.parse(cached);
    if (Date.now() - data.timestamp > CONFIG.CACHE_TTL) {
      localStorage.removeItem(CONFIG.CACHE_KEY);
      return null;
    }
    return data.products;
  } catch (e) { return null; }
}

function setCachedProducts(products) {
  try {
    localStorage.setItem(CONFIG.CACHE_KEY, JSON.stringify({
      products: products,
      timestamp: Date.now()
    }));
  } catch (e) {}
}

// 🔄 Fetch products with advanced caching
async function fetchProducts(forceRefresh = false) {
  if (isLoading) {
    return new Promise(resolve => {
      const checkLoaded = setInterval(() => {
        if (!isLoading) { clearInterval(checkLoaded); resolve(PRODUCTS); }
      }, 50);
    });
  }
  isLoading = true;
  try {
    if (!forceRefresh) {
      const cached = getCachedProducts();
      if (cached && cached.length > 0) {
        console.log('⚡ Loaded Aureria Candy products from cache (instant)');
        processProducts(cached);
        isLoading = false;
        setTimeout(() => backgroundRefresh(), 100);
        return PRODUCTS;
      }
    }
    if (!CONFIG.SHEETS_API_URL || CONFIG.SHEETS_API_URL === "" || CONFIG.SHEETS_API_URL.includes("YOUR_DEPLOYMENT_ID")) {
      console.warn("⚠️ Using fallback data - SHEETS_API_URL not configured");
      processProducts(FALLBACK_PRODUCTS);
      isLoading = false;
      return PRODUCTS;
    }
    const url = CONFIG.SHEETS_API_URL + (CONFIG.SHEETS_API_URL.includes('?') ? '&' : '?') + 't=' + Date.now() + '&format=json';
    const response = await fetch(url, { cache: 'no-cache' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const productsArray = Array.isArray(data) ? data : (data.products || []);
    if (productsArray && productsArray.length >= 0) {
      processProducts(productsArray);
      setCachedProducts(productsArray);
      console.log('✅ Products loaded from Google Sheets');
    } else {
      throw new Error('Invalid data format');
    }
  } catch (error) {
    console.warn('⚠️ Failed to load from API, using fallback:', error.message);
    loadError = error;
    processProducts(FALLBACK_PRODUCTS);
  }
  isLoading = false;
  return PRODUCTS;
}

// Background refresh
async function backgroundRefresh(knownHash) {
  if (!CONFIG.SHEETS_API_URL || CONFIG.SHEETS_API_URL === "" || CONFIG.SHEETS_API_URL.includes("YOUR_DEPLOYMENT_ID")) return;
  try {
    const url = CONFIG.SHEETS_API_URL + (CONFIG.SHEETS_API_URL.includes('?') ? '&' : '?') + 't=' + Date.now() + '&bg=1&format=json';
    const response = await fetch(url, { cache: 'no-cache' });
    const data = await response.json();
    const productsArray = Array.isArray(data) ? data : (data.products || []);
    if (!productsArray) return;
    const snapshot = JSON.stringify(productsArray);
    if (lastRawSnapshot === null) lastRawSnapshot = JSON.stringify(window.AURERIA_PRODUCTS || []);
    if (snapshot === lastRawSnapshot) {
      console.log('🔄 Background refresh: no changes since last sync');
      return;
    }
    lastRawSnapshot = snapshot;
    processProducts(productsArray);
    setCachedProducts(productsArray);
    console.log('🔄 Background refresh: newer product data found, updated silently');
    if (document.getElementById('dynamicCategoriesContainer')) {
      if (typeof window.renderDynamicCategories === 'function') window.renderDynamicCategories();
    }
  } catch (error) {}
}

// 🔄 Process raw product data
function processProducts(rawProducts) {
  PRODUCTS = rawProducts.map(product => {
    const resolvedImage = CONFIG.resolveImage(product.image);
    const rawPopup = product.popupImages || product.popup_images || product.images || [];
    const resolvedPopupImages = (Array.isArray(rawPopup) ? rawPopup : [rawPopup]).map(img => CONFIG.resolveImage(img));
    
    const processed = {
      id: (product.id || "").trim(),
      name: (product.name || "").trim(),
      price: parseFloat(product.price) || 0,
      category: (product.category || "").trim(),
      subcategory: (product.subcategory || "").trim(),
      niche: (product.niche || "candy").trim(),
      location: (product.location || "johannesburg").trim(),
      description: (product.description || "").trim(),
      badge: (product.badge || "").trim(),
      image: resolvedImage,
      popupImages: resolvedPopupImages,
      imageFallback: CONFIG.fallbackImage,
      businessName: (product.businessName || CONFIG.businessName).trim(),
      businessLogo: CONFIG.resolveImage(product.businessLogo),
      whatsappNumber: (product.whatsappNumber || CONFIG.WHATSAPP_NUMBER).trim(),
      categorySlug: (product.category || "uncategorized").trim().toLowerCase().replace(/\s+/g, '-'),
      nicheSlug: (product.niche || "candy").trim().toLowerCase().replace(/\s+/g, '-'),
      locationSlug: (product.location || "johannesburg").trim().toLowerCase().replace(/\s+/g, '-')
    };
    PRODUCTS_MAP.set(processed.id, processed);
    return processed;
  });
  
  // ✅ CRITICAL: Expose to window so index.html can render them instantly!
  window.AURERIA_PRODUCTS = PRODUCTS;
  window.AURERIA_DATA = PRODUCTS;
  window.AURERIA_CANDY_PRODUCTS = PRODUCTS; // Added: Matches the variable name your HTML expects
  
  return PRODUCTS;
}

// 🛠️ Utility API
window.AureriaProducts = {
  getAll: () => PRODUCTS,
  getById: (id) => PRODUCTS_MAP.get(id),
  getByCategory: (category) => PRODUCTS.filter(p => p.categorySlug === category.toLowerCase().replace(/\s+/g, '-')),
  getByLocation: (location) => PRODUCTS.filter(p => p.locationSlug === location.toLowerCase()),
  getByNiche: (niche) => PRODUCTS.filter(p => p.nicheSlug === niche.toLowerCase()),
  filter: (filters) => {
    return PRODUCTS.filter(p => {
      if (filters.category && p.categorySlug !== filters.category.toLowerCase().replace(/\s+/g, '-')) return false;
      if (filters.location && p.locationSlug !== filters.location.toLowerCase()) return false;
      if (filters.niche && p.nicheSlug !== filters.niche.toLowerCase()) return false;
      if (filters.search) {
        const s = filters.search.toLowerCase();
        if (!p.name.toLowerCase().includes(s) && !p.description.toLowerCase().includes(s)) return false;
      }
      return true;
    });
  },
  renderCard: (p) => {
    const priceDisplay = p.price > 0 ? `R${p.price.toFixed(2)}` : 'POA';
    const btnText = p.price > 0 ? '<i class="fas fa-cart-plus"></i> Add' : '<i class="fas fa-quote-right"></i> Quote';
    return `<article class="product-card" data-id="${p.id}" data-category="${p.categorySlug}" data-price="${p.price}" data-name="${p.name}" data-description="${p.description}" data-image="${p.image}" onclick="openModal('${p.id}')" role="button" tabindex="0" style="cursor:pointer;">
      <div class="product-image-wrap">
        <img src="${p.image}" alt="${p.name}" loading="lazy" decoding="async" class="product-image" onerror="this.src='${p.imageFallback}'">
        ${p.badge ? `<span class="product-badge">${p.badge}</span>` : ''}
      </div>
      <div class="product-info">
        <h3 class="product-name">${p.name}</h3>
        <p class="product-description">${p.description}</p>
        <div class="product-price">${priceDisplay}</div>
        <div class="product-actions">
          <button class="add-to-cart-btn" onclick="event.stopPropagation(); AureriaProducts.addToCart('${p.id}'); return false;">
            ${btnText}
          </button>
          <a href="${AureriaProducts.getWhatsAppLink(p)}" class="whatsapp-product-btn" target="_blank" rel="noopener" onclick="event.stopPropagation();" aria-label="WhatsApp about ${p.name}" title="Chat on WhatsApp">
            <i class="fab fa-whatsapp"></i>
          </a>
        </div>
      </div>
    </article>`;
  },
  getWhatsAppLink: (product, phoneNumber) => {
    phoneNumber = phoneNumber || product.whatsappNumber || CONFIG.WHATSAPP_NUMBER;
    const priceStr = product.price > 0 ? `R${product.price.toFixed(2)}` : 'Price on Application';
    const msg = encodeURIComponent(`Hi ${product.businessName}! I'd like to inquire about:\n\n🍬 *${product.name}*\n💰 Price: ${priceStr}\n\nPlease confirm availability.`);
    return `https://wa.me/${phoneNumber}?text=${msg}`;
  },
  refresh: () => fetchProducts(true),
  addToCart: (productId, quantity = 1) => {
    if (typeof window.cart !== 'undefined' && window.cart.addToCart) {
      const product = PRODUCTS_MAP.get(productId);
      if (product) window.cart.addToCart(product, quantity);
    }
  },
  getStatus: () => ({
    loaded: PRODUCTS.length > 0,
    count: PRODUCTS.length,
    error: loadError ? loadError.message : null,
    loading: isLoading
  })
};

// 🚀 INITIALIZATION
(async function init() {
  const inlineData = window.AURERIA_PRODUCTS || window.AURERIA_CANDY_PRODUCTS;
  const hasInlineData = Array.isArray(inlineData) && inlineData.length > 0;
  
  if (hasInlineData) {
    processProducts(inlineData);
    setCachedProducts(inlineData);
    isLoading = false;
    console.log(`⚡ ${PRODUCTS.length} products loaded instantly from inline data (0 network requests)`);
    try {
      document.dispatchEvent(new CustomEvent('aureria:products:loaded', { detail: { products: PRODUCTS } }));
    } catch (err) {}
    setTimeout(() => backgroundRefresh(window.AURERIA_PRODUCTS_HASH), 1500);
  } else {
    await fetchProducts();
    try {
      document.dispatchEvent(new CustomEvent('aureria:products:loaded', { detail: { products: PRODUCTS } }));
    } catch (err) {}
  }
  
  console.group('Aureria Candy Products Initialized');
  console.log(`✅ ${PRODUCTS.length} products ready`);
  console.groupEnd();
})();

// ========== 🚀 DYNAMIC PRODUCT SCHEMA GENERATION (SEO) ==========
function generateProductSchema() {
  if (PRODUCTS.length === 0) return;
  const productList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Aureria Candy Product Catalog",
    "description": "Complete catalog of specially coated candy fruits from Aureria Candy. Premium quality candy with crackly coating, fresh ingredients, and delicious flavours.",
    "numberOfItems": PRODUCTS.length,
    "itemListElement": PRODUCTS.map((product, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Product",
        "name": product.name,
        "description": product.description,
        "image": product.image.startsWith('http') ? product.image : `https://aureriacandy.co.za${product.image}`,
        "sku": product.id,
        "brand": { "@type": "Brand", "name": "Aureria Candy" },
        "offers": {
          "@type": "Offer",
          "url": `https://aureriacandy.co.za/#product-${product.id}`,
          "priceCurrency": "ZAR",
          "price": product.price > 0 ? product.price.toFixed(2) : "0",
          "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          "availability": product.price > 0 ? "https://schema.org/InStock" : "https://schema.org/PreOrder",
          "itemCondition": "https://schema.org/NewCondition",
          "seller": { "@type": "Organization", "name": "Aureria Candy" }
        }
      }
    }))
  };
  let schemaEl = document.getElementById('aureriaProductSchema') || document.getElementById('productSchema');
  if (!schemaEl) {
    schemaEl = document.createElement('script');
    schemaEl.type = 'application/ld+json';
    schemaEl.id = 'aureriaProductSchema';
    document.head.appendChild(schemaEl);
  }
  schemaEl.textContent = JSON.stringify(productList);
}

document.addEventListener('aureria:products:loaded', () => setTimeout(generateProductSchema, 500));
document.addEventListener('DOMContentLoaded', () => {
  if (PRODUCTS.length > 0) setTimeout(generateProductSchema, 500);
});
})();