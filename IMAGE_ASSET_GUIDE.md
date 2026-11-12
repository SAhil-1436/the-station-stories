# THE STATION STORIES – Image Asset & Production Media Guide

## 1. Official Asset Management Principles

1. **Preservation of Original Assets**:
   - The original photograph folder created in the workspace is **`referance-assets/`**.
   - **Strict Directive**: Files within `referance-assets/` are permanent master records. They will **never** be renamed, moved, altered, or deleted.
2. **Production Asset Directory Hierarchy**:
   During frontend setup, optimized web-ready copies (WebP / compressed JPEG format) will be organized under the following directory tree:
   ```
   frontend/public/images/
   ├── restaurant/       # Optimized copies of authentic interior, reception, seating, and lighting photos
   ├── food/             # Temporary licensed food photography (strictly marked as dev placeholders)
   └── branding/         # Vector traces and optimized signage extracted from authentic brand imagery
   ```
3. **Authentic Photography Prioritization**:
   - Authentic restaurant photographs from `referance-assets/` have the highest priority and will serve as the primary visual foundation for the Homepage, Ambiance highlights, About Us, Brand Story, and Photo Gallery.
4. **Temporary Food Photography Policy**:
   - The workspace contains authentic architectural and ambiance photographs; it does **not** yet contain photographs of prepared food dishes.
   - For initial development and layout testing, temporary licensed food photography (from royalty-free licensed stock sources such as Unsplash/Pexels) will be placed in `frontend/public/images/food/`.
   - **Crucial Rule**: Stock images are strictly marked with the metadata tag `is_original_image: false` and accompanied by a visible UI disclaimer (`[Representative Image]`). They will **never** be misrepresented as authentic restaurant dishes, and must be replaced with genuine dish photography before production launch unless explicitly authorized by the owner.

---

## 2. Workspace Image Inventory & Technical Audit

All 13 original photographs located in `/Users/sahil/Documents/Station_Stories/referance-assets/` have been audited. Every file has dimensions of **1200 × 1600 pixels (Portrait)** in **JPEG** format.

| # | Original Filename | Dimensions | Asset Status | Primary Category | Secondary Category | Proposed Production Path | Proposed Website Placement |
|---|---|---|---|---|---|---|---|
| 1 | `WhatsApp Image 2026-11-12 at 10.12.14.jpeg` | 1200 × 1600 | **Original** | **Logo and Branding** | Wall decorations | `images/branding/station-stories-signage.webp` | Homepage "Our Brand Story", About Us brand emblem, Navbar logo inspiration, Receipt header |
| 2 | `WhatsApp Image 2026-11-12 at 10.12.13.jpeg` | 1200 × 1600 | **Original** | **Restaurant Interior** | Seating arrangements | `images/restaurant/interior-main-hall.webp` | Homepage Hero banner / Interior Ambience carousel, Gallery central view |
| 3 | `WhatsApp Image 2026-11-12 at 10.12.13 (1).jpeg` | 1200 × 1600 | **Original** | **Restaurant Interior** | Seating arrangements | `images/restaurant/interior-dining-booths.webp` | Gallery (Dining Area), About Us (Atmosphere & Seating) |
| 4 | `WhatsApp Image 2026-11-12 at 10.12.16 (1).jpeg` | 1200 × 1600 | **Original** | **Restaurant Interior** | Seating arrangements | `images/restaurant/interior-table-view.webp` | Gallery (Family & Group Seating), Digital Menu Header backdrop |
| 5 | `WhatsApp Image 2026-11-12 at 10.12.16.jpeg` | 1200 × 1600 | **Original** | **Reception & Entrance** | Wall decorations | `images/restaurant/reception-counter-front.webp` | Contact Us (Billing & Reception Desk), About Us (Hospitality Desk) |
| 6 | `WhatsApp Image 2026-11-12 at 10.12.15 (2).jpeg` | 1200 × 1600 | **Original** | **Reception & Entrance** | Restaurant interior | `images/restaurant/entrance-portal-view.webp` | Homepage "Step Inside" entrance view, Virtual Tour, Gallery overview |
| 7 | `WhatsApp Image 2026-11-12 at 10.12.12.jpeg` | 1200 × 1600 | **Original** | **Reception & Entrance** | Lighting and ambience | `images/restaurant/reception-lamp-idol.webp` | Contact Us / Front Desk detail, Gallery (Tradition & Warmth) |
| 8 | `WhatsApp Image 2026-11-12 at 10.12.14 (1).jpeg` | 1200 × 1600 | **Original** | **Seating Arrangements** | Lighting and ambience | `images/restaurant/seating-swing-chair.webp` | Homepage Feature Card ("Cozy Hanging Swing Pod"), Instagram highlight, Gallery |
| 9 | `WhatsApp Image 2026-11-12 at 10.12.15.jpeg` | 1200 × 1600 | **Original** | **Seating Arrangements** | Lighting and ambience | `images/restaurant/seating-swing-corner.webp` | Gallery (Swing Pod & Glass Partition), Mobile showcase |
| 10 | `WhatsApp Image 2026-11-12 at 10.12.15 (1).jpeg` | 1200 × 1600 | **Original** | **Wall Decorations** | Restaurant interior | `images/restaurant/decor-burger-mural.webp` | Homepage "Vibrant Youth Culture & Pop Art" section, Menu intro, Gallery |
| 11 | `WhatsApp Image 2026-11-12 at 10.12.13 (2).jpeg` | 1200 × 1600 | **Original** | **Wall Decorations** | Seating arrangements | `images/restaurant/decor-arch-niche.webp` | Gallery (Architectural Niches & Cozy Corners), Interior features |
| 12 | `WhatsApp Image 2026-11-12 at 10.12.14 (2).jpeg` | 1200 × 1600 | **Original** | **Lighting & Ambience** | Restaurant interior | `images/restaurant/lighting-purple-chandelier.webp` | Gallery (Night Ambiance & Crystal Chandelier lighting), Visual mood board |
| 13 | `WhatsApp Image 2026-11-12 at 10.12.16 (2).jpeg` | 1200 × 1600 | **Original** | **Lighting & Ambience** | Reception & entrance | `images/restaurant/lighting-cove-reception.webp` | Gallery (Neon Ceiling Illumination & Reception), Visual styling guide |

---

## 3. Temporary Food Photography Catalog (Development Placeholders)

The following placeholder items will reside under `frontend/public/images/food/` during Phase 1–3 development. All are licensed stock images and strictly flagged with `is_original_image: false`:

| Placeholder Identifier | Target Dish Category | Sample Item Name | Image Status | Production Action Required |
|---|---|---|---|---|
| `food/temp-burger-classic.webp` | Burgers & Sandwiches | Station Veg Burger | Temporary Stock | Replace before launch with owner's authentic photo |
| `food/temp-burger-cheese.webp` | Burgers & Sandwiches | Double Cheese Paneer Burger | Temporary Stock | Replace before launch with owner's authentic photo |
| `food/temp-pizza-margherita.webp` | Pizzas & Garlic Breads | Margherita Gourmet Pizza | Temporary Stock | Replace before launch with owner's authentic photo |
| `food/temp-pizza-farmhouse.webp` | Pizzas & Garlic Breads | Station Special Farmhouse Pizza | Temporary Stock | Replace before launch with owner's authentic photo |
| `food/temp-chinese-noodles.webp` | Chinese & Fast Food | Hakka Chili Garlic Noodles | Temporary Stock | Replace before launch with owner's authentic photo |
| `food/temp-chinese-momos.webp` | Chinese & Fast Food | Steamed / Fried Veg Momos | Temporary Stock | Replace before launch with owner's authentic photo |
| `food/temp-drink-coffee.webp` | Beverages & Shakes | Thick Cold Coffee with Ice Cream | Temporary Stock | Replace before launch with owner's authentic photo |
| `food/temp-drink-cooler.webp` | Beverages & Shakes | Blue Lagoon Mint Mocktail | Temporary Stock | Replace before launch with owner's authentic photo |
| `food/temp-snack-fries.webp` | Chaat & Quick Bites | Peri Peri French Fries | Temporary Stock | Replace before launch with owner's authentic photo |

---

## 4. Owner Replacement & Media Management Workflow

To facilitate replacing temporary stock images with genuine restaurant dish photography:
1. **Admin Media Upload Interface**: The Admin Dashboard (`/admin/menu`) includes a "Replace Dish Photo" upload modal with client-side image compression and aspect ratio validation (1:1 square crop for menu cards).
2. **Metadata Switching**: Upon uploading an authentic dish photo, the backend updates `menu_items.image_url` to the newly stored asset path and automatically toggles `is_original_image = true`.
3. **Public Disclaimer Removal**: The frontend menu card checks `is_original_image`:
   - If `false`, renders a subtle `[Representative Image]` badge.
   - If `true`, removes the badge and displays the certified authentic photo.
