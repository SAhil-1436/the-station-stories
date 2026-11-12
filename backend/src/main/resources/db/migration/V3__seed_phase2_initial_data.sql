-- ==============================================================================
-- THE STATION STORIES – Initial Seed Data Migration (Phase 2)
-- Version: V3
-- Description: Roles, Default Settings, Menu Categories, Sample Dishes & Authentic Gallery Assets
-- ==============================================================================

-- 1. Seed Roles
INSERT INTO roles (id, name, description) VALUES
    (1, 'ROLE_ADMIN', 'System Administrator with full access to settings, menus, reports, and staff management'),
    (2, 'ROLE_CASHIER', 'Counter cashier and POS operator with billing and customer lookup access')
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- Ensure phone columns accommodate placeholder text
ALTER TABLE restaurant_settings MODIFY phone_primary VARCHAR(50) NOT NULL;
ALTER TABLE restaurant_settings MODIFY phone_secondary VARCHAR(50) NULL;
ALTER TABLE restaurant_settings MODIFY whatsapp_number VARCHAR(50) NOT NULL;

-- 2. Seed Restaurant Settings (Singleton row)
INSERT INTO restaurant_settings (
    id, restaurant_name, tagline, address, phone_primary, phone_secondary,
    whatsapp_number, email, gst_enabled, gstin, cgst_rate, sgst_rate,
    upi_id, currency_symbol, opening_hours, google_maps_url, instagram_handle
) VALUES (
    1,
    'THE STATION STORIES',
    'Fast Food & Restaurant',
    '[Pending Owner Confirmation - Placeholder Address]',
    '[Pending Owner Confirmation]',
    NULL,
    '[Pending Owner Confirmation]',
    '[Pending Owner Confirmation]',
    FALSE,
    NULL,
    0.00,
    0.00,
    'stationstories@upi',
    '₹',
    '11:00 AM - 11:00 PM',
    'https://maps.google.com',
    '@thestationstories'
) ON DUPLICATE KEY UPDATE restaurant_name = VALUES(restaurant_name);

-- 3. Seed Menu Categories
INSERT INTO categories (id, name, hindi_name, display_order, is_active, icon_name) VALUES
    (1, 'Burgers & Sandwiches', 'बर्गर और सैंडविच', 1, TRUE, 'Sandwich'),
    (2, 'Pizzas & Garlic Breads', 'पिज़्ज़ा और गार्लिक ब्रेड', 2, TRUE, 'Pizza'),
    (3, 'Chinese & Fast Food', 'चाइनीज और फास्ट फूड', 3, TRUE, 'Utensils'),
    (4, 'Beverages & Shakes', 'पेय और शेक्स', 4, TRUE, 'Coffee'),
    (5, 'Chaat & Quick Bites', 'चाट और स्नैक्स', 5, TRUE, 'Sparkles')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 4. Seed Initial Menu Items
INSERT INTO menu_items (
    id, category_id, name, hindi_name, description, price, is_veg, is_available,
    image_url, is_original_image, spice_level, display_order
) VALUES
    -- Category 1: Burgers & Sandwiches
    (101, 1, 'Station Veg Burger', 'स्टेशन वेज बर्गर', 'Crispy vegetable patty, lettuce, tomatoes, and chef special railway sauce', 89.00, TRUE, TRUE, '/images/food/temp-burger-classic.webp', FALSE, 1, 1),
    (102, 1, 'Cheese Burst Burger', 'चीज़ बर्स्ट बर्गर', 'Loaded melted cheese patty with caramelized onions and spicy chipotle', 129.00, TRUE, TRUE, '/images/food/temp-burger-cheese.webp', FALSE, 1, 2),
    (103, 1, 'Grilled Paneer Sandwich', 'ग्रिल्ड पनीर सैंडविच', 'Marinated cottage cheese with bell peppers and green mint chutney', 119.00, TRUE, TRUE, '/images/food/temp-sandwich-paneer.webp', FALSE, 2, 3),
    (104, 1, 'Veg Club Sandwich', 'वेज क्लब सैंडविच', 'Triple-layer toasted sandwich with fresh vegetables and coleslaw', 99.00, TRUE, TRUE, '/images/food/temp-sandwich-club.webp', FALSE, 1, 4),

    -- Category 2: Pizzas & Garlic Breads
    (201, 2, 'Classic Margherita Pizza', 'क्लासिक मार्गेरीटा पिज़्ज़ा', 'Classic Italian pizza with tomato concasse, fresh mozzarella and basil herbs', 149.00, TRUE, TRUE, '/images/food/temp-pizza-margherita.webp', FALSE, 0, 1),
    (202, 2, 'Farmhouse Special Pizza', 'फार्महाउस स्पेशल पिज़्ज़ा', 'Loaded with capsicum, red paprika, mushrooms, onions and golden corn', 199.00, TRUE, TRUE, '/images/food/temp-pizza-farmhouse.webp', FALSE, 1, 2),
    (203, 2, 'Paneer Tikka Pizza', 'पनीर टिक्का पिज़्ज़ा', 'Tandoori spiced paneer cubes, capsicum and spicy makhani sauce', 219.00, TRUE, TRUE, '/images/food/temp-pizza-paneer.webp', FALSE, 2, 3),
    (204, 2, 'Cheesy Garlic Bread', 'चीज़ी गार्लिक ब्रेड', 'Toasted French baguette infused with roasted garlic butter and mozzarella', 89.00, TRUE, TRUE, '/images/food/temp-garlic-bread.webp', FALSE, 0, 4),

    -- Category 3: Chinese & Fast Food
    (301, 3, 'Veg Hakka Noodles', 'वेज हक्का नूडल्स', 'Wok-tossed noodles with shredded vegetables and soya sauce', 119.00, TRUE, TRUE, '/images/food/temp-noodles.webp', FALSE, 1, 1),
    (302, 3, 'Chilli Paneer Dry', 'चिली पनीर ड्राई', 'Crispy batter-fried paneer cubes tossed in spicy Indo-Chinese sauce', 149.00, TRUE, TRUE, '/images/food/temp-chilli-paneer.webp', FALSE, 3, 2),
    (303, 3, 'Veg Fried Rice', 'वेज फ्राइड राइस', 'Aromatic basmati rice stir-fried with seasonal vegetables and scallions', 109.00, TRUE, TRUE, '/images/food/temp-fried-rice.webp', FALSE, 1, 3),
    (304, 3, 'Crispy French Fries', 'क्रिस्पी फ्रेंच फ्राइज', 'Golden potato fries seasoned with sea salt', 79.00, TRUE, TRUE, '/images/food/temp-fries-classic.webp', FALSE, 0, 4),
    (305, 3, 'Peri Peri Fries', 'पेरी पेरी फ्राइज', 'Crispy fries dusted with fiery peri-peri seasoning blend', 89.00, TRUE, TRUE, '/images/food/temp-fries-periperi.webp', FALSE, 2, 5),

    -- Category 4: Beverages & Shakes
    (401, 4, 'Cold Coffee with Ice Cream', 'कोल्ड कॉफी आइसक्रीम के साथ', 'Rich blended brew topped with creamy vanilla ice cream', 89.00, TRUE, TRUE, '/images/food/temp-cold-coffee.webp', FALSE, 0, 1),
    (402, 4, 'Thick Chocolate Shake', 'थिक चॉकलेट शेक', 'Decadent chocolate milkshake topped with dark chocolate drizzle', 99.00, TRUE, TRUE, '/images/food/temp-chocolate-shake.webp', FALSE, 0, 2),
    (403, 4, 'Masala Mint Lemonade', 'मसाला पुदीना नींबू पानी', 'Refreshing fresh lemon squeeze with mint and rock salt blend', 59.00, TRUE, TRUE, '/images/food/temp-lemonade.webp', FALSE, 0, 3),
    (404, 4, 'Kulhad Masala Chai', 'कुल्हड़ मसाला चाय', 'Authentic Indian spiced railway tea served piping hot in terracotta cup', 30.00, TRUE, TRUE, '/images/food/temp-kulhad-tea.webp', FALSE, 1, 4),

    -- Category 5: Chaat & Quick Bites
    (501, 5, 'Mumbai Sev Puri', 'मुंबई सेव पूरी', 'Crisp flat puris topped with potatoes, tangy chutneys and fine nylon sev', 69.00, TRUE, TRUE, '/images/food/temp-sev-puri.webp', FALSE, 2, 1),
    (502, 5, 'Dahi Papdi Chaat', 'दही पापड़ी चाट', 'Crispy papdis smothered in chilled sweet yogurt and tamarind reduction', 79.00, TRUE, TRUE, '/images/food/temp-dahi-papdi.webp', FALSE, 1, 2),
    (503, 5, 'Cheese Corn Nuggets', 'चीज़ कॉर्न नगेट्स', 'Crunchy golden bites filled with gooey melted cheese and sweet corn', 99.00, TRUE, TRUE, '/images/food/temp-corn-nuggets.webp', FALSE, 0, 3)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 5. Seed Authentic Restaurant Gallery Assets (from referance-assets)
INSERT INTO gallery_images (id, title, category, image_url, display_order, is_active, is_original) VALUES
    (1, 'Central Dining Hall & Golden Station Lights', 'INTERIOR', '/referance-assets/WhatsApp Image 2026-11-12 at 10.12.13.jpeg', 1, TRUE, TRUE),
    (2, 'Grand Entrance & Welcome Signage', 'ENTRANCE', '/referance-assets/WhatsApp Image 2026-11-12 at 10.12.14 (1).jpeg', 2, TRUE, TRUE),
    (3, 'Warm Ambient Dining Booths', 'SEATING', '/referance-assets/WhatsApp Image 2026-11-12 at 10.12.14 (2).jpeg', 3, TRUE, TRUE),
    (4, 'The Station Stories Signature Wall Mural', 'DECOR', '/referance-assets/WhatsApp Image 2026-11-12 at 10.12.14.jpeg', 4, TRUE, TRUE),
    (5, 'Private Express Cabin Seating Area', 'SEATING', '/referance-assets/WhatsApp Image 2026-11-12 at 10.12.15 (1).jpeg', 5, TRUE, TRUE),
    (6, 'Evening Ambience & Neon Glow', 'LIGHTING', '/referance-assets/WhatsApp Image 2026-11-12 at 10.12.15 (2).jpeg', 6, TRUE, TRUE),
    (7, 'Main Service Counter & Display Station', 'INTERIOR', '/referance-assets/WhatsApp Image 2026-11-12 at 10.12.15.jpeg', 7, TRUE, TRUE),
    (8, 'Family Banquet & Group Dining Lounge', 'SEATING', '/referance-assets/WhatsApp Image 2026-11-12 at 10.12.16 (1).jpeg', 8, TRUE, TRUE),
    (9, 'Designer Edison Hanging Lanterns', 'LIGHTING', '/referance-assets/WhatsApp Image 2026-11-12 at 10.12.16 (2).jpeg', 9, TRUE, TRUE),
    (10, 'Artistic Brick Wall & Train Journey Artwork', 'DECOR', '/referance-assets/WhatsApp Image 2026-11-12 at 10.12.16.jpeg', 10, TRUE, TRUE),
    (11, 'Cozy Window View Dining Stalls', 'SEATING', '/referance-assets/WhatsApp Image 2026-11-12 at 10.12.17 (1).jpeg', 11, TRUE, TRUE),
    (12, 'Full Panoramic Dining Room Perspective', 'INTERIOR', '/referance-assets/WhatsApp Image 2026-11-12 at 10.12.17 (2).jpeg', 12, TRUE, TRUE),
    (13, 'Official Brand Wall Logo & Welcome Arch', 'BRAND', '/referance-assets/WhatsApp Image 2026-11-12 at 10.12.17.jpeg', 13, TRUE, TRUE)
ON DUPLICATE KEY UPDATE title = VALUES(title);
