import axios from 'axios';

const api = axios.create({
  baseURL: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) || '',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor to attach JWT token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('tss_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || '';

    // Handle HTTP 401 Unauthorized safely on authenticated requests (skip login)
    if (status === 401 && !requestUrl.includes('/api/v1/auth/login')) {
      try {
        localStorage.removeItem('tss_token');
      } catch (storageErr) {
        // Ignore localStorage access failures in private browsing
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('tss:auth:expired'));
      }
    }

    const customError = {
      message: error.response?.data?.message || error.message || 'An unexpected error occurred',
      status: status,
      errorCode: error.response?.data?.errorCode,
      errors: error.response?.data?.errors,
    };

    // Note: Never log tokens or sensitive credentials to console or telemetry
    return Promise.reject(customError);
  }
);

export { api };

// System Health
export const getHealth = async () => {
  return await api.get('/api/health');
};

// Public Website APIs
export const getRestaurantInfo = async () => {
  try {
    const res = await api.get('/api/v1/public/restaurant-info');
    return res.data;
  } catch (err) {
    console.warn('Using fallback restaurant info:', err.message);
    return {
      restaurantName: 'THE STATION STORIES',
      tagline: 'Fast Food & Restaurant',
      address: '[Pending Owner Confirmation - Placeholder Address]',
      phonePrimary: '[Pending Owner Confirmation]',
      whatsappNumber: '[Pending Owner Confirmation]',
      email: '[Pending Owner Confirmation]',
      gstEnabled: false,
      currencySymbol: '₹',
      openingHours: '11:00 AM - 11:00 PM',
      googleMapsUrl: 'https://maps.google.com',
      instagramHandle: '@thestationstories',
    };
  }
};

export const getCategories = async () => {
  try {
    const res = await api.get('/api/v1/public/categories');
    return res.data;
  } catch (err) {
    console.warn('Using fallback categories:', err.message);
    return [
      { id: 1, name: 'Burgers & Sandwiches', hindiName: 'बर्गर और सैंडविच', iconName: 'Sandwich', displayOrder: 1, itemCount: 4 },
      { id: 2, name: 'Pizzas & Garlic Breads', hindiName: 'पिज़्ज़ा और गार्लिक ब्रेड', iconName: 'Pizza', displayOrder: 2, itemCount: 4 },
      { id: 3, name: 'Chinese & Fast Food', hindiName: 'चाइनीज और फास्ट फूड', iconName: 'Utensils', displayOrder: 3, itemCount: 5 },
      { id: 4, name: 'Beverages & Shakes', hindiName: 'पेय और शेक्स', iconName: 'Coffee', displayOrder: 4, itemCount: 4 },
      { id: 5, name: 'Chaat & Quick Bites', hindiName: 'चाट और स्नैक्स', iconName: 'Sparkles', displayOrder: 5, itemCount: 3 },
    ];
  }
};

export const getMenu = async (params = {}) => {
  try {
    const res = await api.get('/api/v1/public/menu', { params });
    return res.data;
  } catch (err) {
    console.warn('Using fallback menu items:', err.message);
    const fallbackItems = [
      { id: 101, categoryId: 1, categoryName: 'Burgers & Sandwiches', name: 'Station Veg Burger', hindiName: 'स्टेशन वेज बर्गर', description: 'Crispy vegetable patty, lettuce, tomatoes, and chef special railway sauce', price: 89.00, isVeg: true, isAvailable: true, imageUrl: '/images/food/temp-burger-classic.webp', isOriginalImage: false, spiceLevel: 1 },
      { id: 102, categoryId: 1, categoryName: 'Burgers & Sandwiches', name: 'Cheese Burst Burger', hindiName: 'चीज़ बर्स्ट बर्गर', description: 'Loaded melted cheese patty with caramelized onions and spicy chipotle', price: 129.00, isVeg: true, isAvailable: true, imageUrl: '/images/food/temp-burger-cheese.webp', isOriginalImage: false, spiceLevel: 1 },
      { id: 103, categoryId: 1, categoryName: 'Burgers & Sandwiches', name: 'Grilled Paneer Sandwich', hindiName: 'ग्रिल्ड पनीर सैंडविच', description: 'Marinated cottage cheese with bell peppers and green mint chutney', price: 119.00, isVeg: true, isAvailable: true, imageUrl: '/images/food/temp-sandwich-paneer.webp', isOriginalImage: false, spiceLevel: 2 },
      { id: 104, categoryId: 1, categoryName: 'Burgers & Sandwiches', name: 'Veg Club Sandwich', hindiName: 'वेज क्लब सैंडविच', description: 'Triple-layer toasted sandwich with fresh vegetables and coleslaw', price: 99.00, isVeg: true, isAvailable: true, imageUrl: '/images/food/temp-sandwich-club.webp', isOriginalImage: false, spiceLevel: 1 },
      { id: 201, categoryId: 2, categoryName: 'Pizzas & Garlic Breads', name: 'Classic Margherita Pizza', hindiName: 'क्लासिक मार्गेरीटा पिज़्ज़ा', description: 'Classic Italian pizza with tomato concasse, fresh mozzarella and basil herbs', price: 149.00, isVeg: true, isAvailable: true, imageUrl: '/images/food/temp-pizza-margherita.webp', isOriginalImage: false, spiceLevel: 0 },
      { id: 202, categoryId: 2, categoryName: 'Pizzas & Garlic Breads', name: 'Farmhouse Special Pizza', hindiName: 'फार्महाउस स्पेशल पिज़्ज़ा', description: 'Loaded with capsicum, red paprika, mushrooms, onions and golden corn', price: 199.00, isVeg: true, isAvailable: true, imageUrl: '/images/food/temp-pizza-farmhouse.webp', isOriginalImage: false, spiceLevel: 1 },
      { id: 203, categoryId: 2, categoryName: 'Pizzas & Garlic Breads', name: 'Paneer Tikka Pizza', hindiName: 'पनीर टिक्का पिज़्ज़ा', description: 'Tandoori spiced paneer cubes, capsicum and spicy makhani sauce', price: 219.00, isVeg: true, isAvailable: true, imageUrl: '/images/food/temp-pizza-paneer.webp', isOriginalImage: false, spiceLevel: 2 },
      { id: 204, categoryId: 2, categoryName: 'Pizzas & Garlic Breads', name: 'Cheesy Garlic Bread', hindiName: 'चीज़ी गार्लिक ब्रेड', description: 'Toasted French baguette infused with roasted garlic butter and mozzarella', price: 89.00, isVeg: true, isAvailable: true, imageUrl: '/images/food/temp-garlic-bread.webp', isOriginalImage: false, spiceLevel: 0 },
      { id: 301, categoryId: 3, categoryName: 'Chinese & Fast Food', name: 'Veg Hakka Noodles', hindiName: 'वेज हक्का नूडल्स', description: 'Wok-tossed noodles with shredded vegetables and soya sauce', price: 119.00, isVeg: true, isAvailable: true, imageUrl: '/images/food/temp-noodles.webp', isOriginalImage: false, spiceLevel: 1 },
      { id: 302, categoryId: 3, categoryName: 'Chinese & Fast Food', name: 'Chilli Paneer Dry', hindiName: 'चिली पनीर ड्राई', description: 'Crispy batter-fried paneer cubes tossed in spicy Indo-Chinese sauce', price: 149.00, isVeg: true, isAvailable: true, imageUrl: '/images/food/temp-chilli-paneer.webp', isOriginalImage: false, spiceLevel: 3 },
      { id: 303, categoryId: 3, categoryName: 'Chinese & Fast Food', name: 'Veg Fried Rice', hindiName: 'वेज फ्राइड राइस', description: 'Aromatic basmati rice stir-fried with seasonal vegetables and scallions', price: 109.00, isVeg: true, isAvailable: true, imageUrl: '/images/food/temp-fried-rice.webp', isOriginalImage: false, spiceLevel: 1 },
      { id: 304, categoryId: 3, categoryName: 'Chinese & Fast Food', name: 'Crispy French Fries', hindiName: 'क्रिस्पी फ्रेंच फ्राइज', description: 'Golden potato fries seasoned with sea salt', price: 79.00, isVeg: true, isAvailable: true, imageUrl: '/images/food/temp-fries-classic.webp', isOriginalImage: false, spiceLevel: 0 },
      { id: 305, categoryId: 3, categoryName: 'Chinese & Fast Food', name: 'Peri Peri Fries', hindiName: 'पेरी पेरी फ्राइज', description: 'Crispy fries dusted with fiery peri-peri seasoning blend', price: 89.00, isVeg: true, isAvailable: true, imageUrl: '/images/food/temp-fries-periperi.webp', isOriginalImage: false, spiceLevel: 2 },
      { id: 401, categoryId: 4, categoryName: 'Beverages & Shakes', name: 'Cold Coffee with Ice Cream', hindiName: 'कोल्ड कॉफी आइसक्रीम के साथ', description: 'Rich blended brew topped with creamy vanilla ice cream', price: 89.00, isVeg: true, isAvailable: true, imageUrl: '/images/food/temp-cold-coffee.webp', isOriginalImage: false, spiceLevel: 0 },
      { id: 402, categoryId: 4, categoryName: 'Beverages & Shakes', name: 'Thick Chocolate Shake', hindiName: 'थिक चॉकलेट शेक', description: 'Decadent chocolate milkshake topped with dark chocolate drizzle', price: 99.00, isVeg: true, isAvailable: true, imageUrl: '/images/food/temp-chocolate-shake.webp', isOriginalImage: false, spiceLevel: 0 },
      { id: 403, categoryId: 4, categoryName: 'Beverages & Shakes', name: 'Masala Mint Lemonade', hindiName: 'मसाला पुदीना नींबू पानी', description: 'Refreshing fresh lemon squeeze with mint and rock salt blend', price: 59.00, isVeg: true, isAvailable: true, imageUrl: '/images/food/temp-lemonade.webp', isOriginalImage: false, spiceLevel: 0 },
      { id: 404, categoryId: 4, categoryName: 'Beverages & Shakes', name: 'Kulhad Masala Chai', hindiName: 'कुल्हड़ मसाला चाय', description: 'Authentic Indian spiced railway tea served piping hot in terracotta cup', price: 30.00, isVeg: true, isAvailable: true, imageUrl: '/images/food/temp-kulhad-tea.webp', isOriginalImage: false, spiceLevel: 1 },
      { id: 501, categoryId: 5, categoryName: 'Chaat & Quick Bites', name: 'Mumbai Sev Puri', hindiName: 'मुंबई सेव पूरी', description: 'Crisp flat puris topped with potatoes, tangy chutneys and fine nylon sev', price: 69.00, isVeg: true, isAvailable: true, imageUrl: '/images/food/temp-sev-puri.webp', isOriginalImage: false, spiceLevel: 2 },
      { id: 502, categoryId: 5, categoryName: 'Chaat & Quick Bites', name: 'Dahi Papdi Chaat', hindiName: 'दही पापड़ी चाट', description: 'Crispy papdis smothered in chilled sweet yogurt and tamarind reduction', price: 79.00, isVeg: true, isAvailable: true, imageUrl: '/images/food/temp-dahi-papdi.webp', isOriginalImage: false, spiceLevel: 1 },
      { id: 503, categoryId: 5, categoryName: 'Chaat & Quick Bites', name: 'Cheese Corn Nuggets', hindiName: 'चीज़ कॉर्न नगेट्स', description: 'Crunchy golden bites filled with gooey melted cheese and sweet corn', price: 99.00, isVeg: true, isAvailable: true, imageUrl: '/images/food/temp-corn-nuggets.webp', isOriginalImage: false, spiceLevel: 0 },
    ];
    let filtered = fallbackItems;
    if (params.categoryId) {
      filtered = filtered.filter(i => i.categoryId === Number(params.categoryId));
    }
    if (params.isVeg !== undefined) {
      filtered = filtered.filter(i => i.isVeg === (params.isVeg === 'true' || params.isVeg === true));
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(i => i.name.toLowerCase().includes(q) || i.hindiName.includes(q) || i.description.toLowerCase().includes(q));
    }
    return filtered;
  }
};

export const getGallery = async (category = null) => {
  try {
    const params = category ? { category } : {};
    const res = await api.get('/api/v1/public/gallery', { params });
    return res.data;
  } catch (err) {
    console.warn('Using fallback gallery photos:', err.message);
    const fallbackPhotos = [
      { id: 1, title: 'Central Dining Hall & Golden Station Lights', category: 'INTERIOR', imageUrl: '/images/restaurant/interior-main-hall.jpeg', displayOrder: 1, isOriginal: true },
      { id: 2, title: 'Grand Dining Booths & Warm Ambience', category: 'INTERIOR', imageUrl: '/images/restaurant/interior-dining-booths.jpeg', displayOrder: 2, isOriginal: true },
      { id: 3, title: 'Family Table & Banquette Seating', category: 'INTERIOR', imageUrl: '/images/restaurant/interior-table-view.jpeg', displayOrder: 3, isOriginal: true },
      { id: 4, title: 'Main Reception & Hospitality Counter', category: 'RECEPTION', imageUrl: '/images/restaurant/reception-counter-front.jpeg', displayOrder: 4, isOriginal: true },
      { id: 5, title: 'Express Entrance Portal View', category: 'ENTRANCE', imageUrl: '/images/restaurant/entrance-portal-view.jpeg', displayOrder: 5, isOriginal: true },
      { id: 6, title: 'Traditional Welcome Lamp & Counter Decor', category: 'RECEPTION', imageUrl: '/images/restaurant/reception-lamp-idol.jpeg', displayOrder: 6, isOriginal: true },
      { id: 7, title: 'Cozy Hanging Swing Pod Seating', category: 'SEATING', imageUrl: '/images/restaurant/seating-swing-chair.jpeg', displayOrder: 7, isOriginal: true },
      { id: 8, title: 'Neon Lounge & Corner Swing Sanctuary', category: 'SEATING', imageUrl: '/images/restaurant/seating-swing-corner.jpeg', displayOrder: 8, isOriginal: true },
      { id: 9, title: 'Vibrant Fast Food Wall Mural Artwork', category: 'DECOR', imageUrl: '/images/restaurant/decor-burger-mural.jpeg', displayOrder: 9, isOriginal: true },
      { id: 10, title: 'Architectural Brick Arch & Cozy Niche', category: 'DECOR', imageUrl: '/images/restaurant/decor-arch-niche.jpeg', displayOrder: 10, isOriginal: true },
      { id: 11, title: 'Evening Glow & Crystal Chandelier Radiance', category: 'LIGHTING', imageUrl: '/images/restaurant/lighting-purple-chandelier.jpeg', displayOrder: 11, isOriginal: true },
      { id: 12, title: 'Neon Cove Illumination & Reception Ceiling', category: 'LIGHTING', imageUrl: '/images/restaurant/lighting-cove-reception.jpeg', displayOrder: 12, isOriginal: true },
      { id: 13, title: 'The Station Stories Official Signage & Emblem', category: 'BRAND', imageUrl: '/images/branding/station-stories-signage.jpeg', displayOrder: 13, isOriginal: true },
    ];
    if (category && category !== 'ALL') {
      return fallbackPhotos.filter(p => p.category === category);
    }
    return fallbackPhotos;
  }
};

export const getPublicInvoice = async (uuid) => {
  const res = await api.get(`/api/v1/public/bill/view/${uuid}`);
  return res.data;
};

export default api;
