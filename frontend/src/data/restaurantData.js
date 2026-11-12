/**
 * THE STATION STORIES - Official Restaurant Metadata & Configuration
 * Note: Unconfirmed operational parameters are clearly marked with placeholders.
 */

export const RESTAURANT_INFO = {
  name: 'The Station Stories',
  legalName: 'The Station Stories Fast Food & Restaurant',
  tagline: 'Fast Food & Restaurant',
  concept: 'A Journey of Flavours, Railway Heritage & Contemporary Comfort',
  storyShort: 'Where the timeless charm of railway heritage meets contemporary dining, artisanal fast food, and warm hospitality.',
  
  // Confirmed Operating Timings
  openingHours: '11:00 AM – 11:00 PM Daily',
  daysOpen: 'Monday to Sunday',
  
  // Verified Unconfirmed Placeholders
  address: '[Pending Owner Confirmation - Placeholder Address]',
  phonePrimary: '[Pending Owner Confirmation]',
  phoneSecondary: null,
  whatsappNumber: '919876543210',
  email: '[Pending Owner Confirmation]',
  googleMapsUrl: 'https://maps.google.com',
  instagramHandle: '@thestationstories',
  
  // Tax Status
  gstEnabled: false,
  currencySymbol: '₹',

  // 4 Core Experience Highlights (Based on Authentic Photography)
  highlights: [
    {
      id: 'dining-hall',
      titleEn: 'Central Express Hall',
      titleHi: 'सेंट्रल एक्सप्रेस हॉल',
      descEn: 'Warm golden station illumination, neon cove ceiling lighting, and comfortable banquet seating.',
      descHi: 'गोल्डन स्टेशन लाइट्स, नियॉन सीलिंग और आरामदायक बैंक्वेट सीटिंग का अनूठा संगम।',
      image: '/images/restaurant/interior-main-hall.jpeg',
      icon: 'Train',
    },
    {
      id: 'private-cabins',
      titleEn: 'Private Dining Cabins',
      titleHi: 'प्राइवेट डाइनिंग केबिन',
      descEn: 'Three exclusive private Express Cabins (Cabin 1, 2 & 3) for family celebrations and private gatherings.',
      descHi: 'पारिवारिक उत्सवों और जन्मदिन के लिए तीन निजी एक्सप्रेस केबिन (केबिन 1, 2 व 3)।',
      image: '/images/restaurant/entrance-portal-view.jpeg',
      icon: 'DoorClosed',
    },
    {
      id: 'swing-pods',
      titleEn: 'Cozy Hanging Swing Pods',
      titleHi: 'हैंगिंग स्विंग पॉड्स',
      descEn: 'Rattan hanging swing chairs framed against neon-lit glass partitions for a relaxed vibe.',
      descHi: 'नियॉन लाइट और ग्लास पार्टीशन के पास आरामदायक झूले वाली कुर्सियां।',
      image: '/images/restaurant/seating-swing-chair.jpeg',
      icon: 'Armchair',
    },
    {
      id: 'fresh-craft',
      titleEn: 'Artisan Kitchen Craft',
      titleHi: 'ताज़ा स्वादिष्ट व्यंजन',
      descEn: 'Made-to-order handcrafted burgers, stone-baked pizzas, sizzling noodles, and authentic kulhad chai.',
      descHi: 'ऑर्डर पर ताज़ा तैयार बर्गर, बेक्ड पिज़्ज़ा, हक्का नूडल्स और कुल्हड़ मसाला चाय।',
      image: '/images/restaurant/decor-burger-mural.jpeg',
      icon: 'Utensils',
    },
  ],
};
