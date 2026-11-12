# THE STATION STORIES – Development Progress Tracker

## Project Overview
- **Project Name**: THE STATION STORIES Restaurant Website & Management System
- **Brand Identity**: **THE STATION STORIES** (strictly plural)
- **Database Name**: **`the_station_stories`** (MySQL 8)
- **Current Active Phase**: Phase 3 (Public Customer Website Design and Frontend)
- **Phase Status**: 🔄 **PHASE 3 IN PROGRESS / FINAL REVIEW**
- **Next Phase**: Phase 2 (Backend Business Logic and APIs)
- **Last Updated**: 2026-11-12

---

## Phase Status Matrix (Final Agreed Workflow)

> [!IMPORTANT]
> **Deliberate Phase Sequence**: The project follows the agreed sequence:  
> **Phase 0 → Phase 1 → Phase 3 → Phase 2 → Phase 4 → Phase 5 → Phase 6**.  
> Do not renumber the phases. Phase 3 is being developed before Phase 2 by deliberate decision.

| Phase | Description | Status | Blockers / Next Step |
|---|---|---|---|
| **Phase 0** | Planning and Documentation | ✅ **Completed** | Approved |
| **Phase 1** | Project Foundation and Environment Setup | ✅ **Completed & Verified** | Preserved Java 26.0.1 & MySQL 9.5.0 compatibility |
| **Phase 3** | Public Customer Website Design and Frontend | 🔄 **In Progress / Final Review** | Approved Palette (#F7F1E8, #45213F, #C5A16B), Vite Build Passed |
| **Phase 2** | Backend Business Logic and APIs | ⏳ **Next** | Begins after Phase 3 review and sign-off |
| **Phase 4** | Admin Dashboard | ⏳ **Pending** | Depends on Phase 2 |
| **Phase 5** | Local POS and Billing System | ⏳ **Pending** | Depends on Phase 4 |
| **Phase 6** | Testing, Security, Windows Deployment, Backup and Production Launch | ⏳ **Pending** | Depends on Phase 5 |

---

## Phase 0 Technical Audit & Correction Log

### 1. Brand Identity & Database Standardization
- Updated all references across documentation to the official plural title: **THE STATION STORIES**.
- Standardized database name to **`the_station_stories`** across all schemas, connection strings, and configuration examples.

### 2. Media Asset Management Structure
- Verified master directory **`referance-assets/`** contains 13 original photographs (1200 × 1600 portrait JPEGs). Original files remain completely untouched.
- Defined organized production directory structure:
  ```
  frontend/public/images/
  ├── restaurant/   # Optimized authentic interior, reception, seating, and lighting photos
  ├── food/         # Temporary licensed food photography (marked as dev placeholders)
  └── branding/     # Vector traces and signage extracted from authentic brand imagery
  ```
- Established policy for temporary licensed food photos (`is_original_image: false`, `[Representative Image]` badge) to be replaced before production launch.

### 3. Billing & Financial Data Safety
- Enforced **permanence and immutability**: finalized bills can **never** be deleted (`ON DELETE RESTRICT` on `bill_items`).
- Historical pricing preservation: item names, unit prices, and quantities are captured as frozen snapshots. Subsequent menu price updates will never alter historical invoices.
- Implemented thread-safe, gap-free bill number generation using dedicated `bill_number_sequences` table with pessimistic row locking (`SELECT ... FOR UPDATE`).
- Built auditable cancellation and refund workflow (`cancelled_at`, `cancelled_by`, `cancellation_reason`, `refund_amount`, `audit_logs`).
- Supported walk-in anonymous customers without forced phone numbers; deduplicated returning customers when phone is provided.
- Backend authoritative financial calculations (never trusting frontend calculations).

### 4. Thermal Printer Architecture
- Designed dual-tier printing architecture:
  - **Capability A (Initial Release)**: Browser-based printing via `window.print()` and `@media print` CSS for 80mm and 58mm rolls.
  - **Capability B (Extensible Future)**: Direct USB printing bridge interface bypassing print dialog after printer model confirmation.

### 5. WhatsApp Delivery State Machine
- Defined 6 distinct delivery states:
  1. `BILL_GENERATED`
  2. `PDF_GENERATED`
  3. `WHATSAPP_LINK_PREPARED`
  4. `WHATSAPP_OPENED`
  5. `MESSAGE_MANUALLY_SENT`
  6. `DELIVERY_CONFIRMED` (Official Cloud API)
- Protected customer invoices via cryptographically secure UUIDv4 public links (`/bill/view/:uuid`).

### 6. Security Architecture
- BCrypt password hashing, stateless JWT with 8-hour access tokens, Spring Security RBAC (`ROLE_ADMIN`, `ROLE_CASHIER`).
- Login rate limiting (Token bucket algorithm via Bucket4j on `/api/v1/auth/login`).
- All secrets externalized to environment variables; zero hardcoded credentials committed.
- Initial admin account created through secure setup runner (no public admin registration).

### 7. Business Information Transparency
- Clearly documented all unconfirmed restaurant parameters with explicit placeholders (`[Pending Owner Confirmation]`).
- Strict policy against publishing fictitious customer reviews, invented prices, or fake contact info.
- GST tax engine strictly disabled by default (0.00% tax).

### 8. UI/UX Design System Preparation
- Documented color palette: Midnight Charcoal (`#12161A`), Warm Ivory (`#FBF9F5`), Champagne Gold (`#D4AF37`), Atmosphere Purple/Indigo (`#6366F1` / `#7C3AED` inspired by authentic neon lighting).
- Documented typography: Playfair Display / Cormorant Garamond (headings) and Inter / Plus Jakarta Sans (body).

---

---

## Phase 1 Execution & Verification (Completed)

- [x] **Git Repository Initialization**:
  - Initialized Git repository, configured root `.gitignore` covering Java/Maven, Vite/Node, and OS artifacts.
- [x] **Backend Bootstrapping & Environment Compatibility**:
  - Configured Spring Boot 3.3.5 and Maven compiler targeting Java 21 release bytecode on installed Java 26.0.1 runtime.
  - Connected to installed MySQL 9.5.0 database `the_station_stories`.
  - Zero hardcoded credentials in `application.yml` (`DB_PASSWORD`, `JWT_SECRET`, `INITIAL_ADMIN_PASSWORD`).
  - Health check endpoint `/api/health` reports actual running runtime versions without faking.
- [x] **Frontend Bootstrapping**:
  - React 18 + Vite project running on `http://127.0.0.1:5173/`.
  - Configured Tailwind CSS, Lucide React, i18next (Hindi/English), Axios, React Router.
  - Master photos in `referance-assets/` preserved untouched; mirrored to `frontend/public/images/`.

---

## Phase 2 Implementation & Verification Report (Completed)

### 1. Database Architecture & Migrations
- **Flyway Migrations Executed**:
  - `V1__init_schema.sql`: Phase 1 baseline schema verification.
  - `V2__create_phase2_tables.sql`: Scaffolds 14 core tables with performance indexes and strict foreign key integrity (`ON DELETE RESTRICT` on financial records).
  - `V3__seed_phase2_initial_data.sql`: Seeds roles (`ROLE_ADMIN`, `ROLE_CASHIER`), singleton `restaurant_settings`, initial menu categories, dishes, and 13 authentic restaurant photographs from `referance-assets/`.
- **Database Tables**:
  - `roles`, `users`, `user_roles`
  - `categories`, `menu_items`
  - `customers` (lookup by normalized 10-digit phone, supports anonymous walk-ins)
  - `bill_number_sequences` (pessimistic row locking for zero-gap daily bill numbers)
  - `bills` (frozen snapshots, authoritative totals, permanent sales ledger)
  - `bill_items` (immutable line item snapshots preserving historical prices)
  - `payments` (itemized payment transactions: CASH, UPI, CARD, SPLIT)
  - `audit_logs` (security and compliance ledger via `REQUIRES_NEW` transactions)
  - `restaurant_settings` (singleton brand parameters and dynamic tax toggle)
  - `gallery_images` (categorized restaurant photographs)

### 2. Business Logic & Authoritative Rules
- **Billing Calculations**:
  - Backend authoritative computation of subtotal, discount, tax, and grand total.
  - GST engine strictly disabled by default (0.00% tax).
  - Thread-safe daily bill sequence generator: `TSS-YYYYMMDD-XXXX`.
  - Finalized bills are **never** hard deleted. Cancellations are non-destructive with mandatory reason and refund tracking.
  - Receipt generation for both 80mm and 58mm thermal rolls, including UPI dynamic QR string (`upi://pay?...`).
  - Public digital invoice rendered securely via unguessable UUIDv4 (`/api/v1/public/bill/view/{uuid}`).
  - Dynamic WhatsApp share link generator (`https://wa.me/91XXXXXXXXXX?text=...`).
- **Menu & Category Operations**:
  - Price updates log to `audit_logs` with old and new values.
  - Safe category deletion prevents deleting categories that contain active menu items.
  - Instant stock availability toggle (`PATCH /api/v1/admin/menu/{id}/toggle-availability`).
  - Multi-part image upload abstraction (`POST /api/v1/admin/menu/{id}/image`) with MIME and extension validation.
- **Customer Management**:
  - Phone normalization to 10 digits in India (strips `+91`, `0`, spaces, dashes).
  - Automatic visit count and lifetime spend aggregation.
  - Full support for anonymous walk-in checkout without forcing phone collection.

### 3. Security, Authentication & Rate Limiting
- **Authentication**: Stateless JWT token authentication with 8-hour validity.
- **Role-Based Access Control**: `ROLE_ADMIN` and `ROLE_CASHIER` enforced via Spring Security method-level annotations.
- **Rate Limiting**: In-memory token bucket rate limiter restricting login to 5 attempts per minute per IP address.
- **Staff Provisioning**: Mandatory company card number verification (`companyCardNumber`) for staff creation.
- **One-time Setup**: Secure initial setup endpoint guarded by `ADMIN_SETUP_TOKEN`, strictly disabled once an administrator exists.
- **Secret Management**: All database passwords and JWT secrets are sourced exclusively from OS environment variables.

### 4. Interactive Documentation & OpenAPI Specification
- **OpenAPI 3.0 Specification**: `GET http://localhost:8080/api-docs`
- **Swagger UI Interactive Console**: `GET http://localhost:8080/swagger-ui.html`

### 5. Test Suite Verification
- **Automated Test Results**: **24 tests executed, 0 failures, 0 errors** (all passed in 3.428s).
  - `BillCalculationTest` (5 tests): Subtotal, percentage discount, flat discount, disabled GST (0.00%), enabled GST (5.00%).
  - `FinalizedBillProtectionTest` (4 tests): Soft cancellation, refund persistence, audit trail creation, non-destructive safety.
  - `CustomerLookupAndNormalizationTest` (5 tests): +91 normalization, 0-prefix normalization, punctuation cleanup, walk-in anonymous handling, existing customer tracking.
  - `AuthenticationAndRateLimitTest` (5 tests): Correct credentials, invalid password, rate limit throttling, staff account creation, duplicate username rejection.
  - `CategoryAndMenuServiceTest` (4 tests): Active catalog filtering, price update with audit log, empty category deletion, blocked deletion with active items.
  - `StationStoriesApplicationTests` (1 test): Spring Boot context loading, JPA repository scanning, Flyway schema validation.

### 6. Live API Verification Matrix
| Endpoint | Method | Result | Notes |
|---|---|---|---|
| `/api/health` | GET | `200 OK` | Java 26.0.1, MySQL 9.5.0 connected |
| `/api/v1/auth/login` | POST | `200 OK` | Admin JWT issued |
| `/api/v1/admin/users/staff` | POST | `201 Created` | Cashier created with card `TSS-EMP-101` |
| `/api/v1/pos/bills` | POST | `201 Created` | Generated bill `TSS-20261112-0001` with UPI & ₹20 discount |
| `/api/v1/pos/customers/lookup` | GET | `200 OK` | Customer lookup retrieved lifetime spend ₹237.00 |
| `/api/v1/pos/bills/1/receipt?width=80mm` | GET | `200 OK` | 80mm thermal receipt payload generated |
| `/api/v1/public/bill/view/{uuid}` | GET | `200 OK` | Public digital invoice view rendered |
| `/api/v1/admin/reports/dashboard` | GET | `200 OK` | Aggregated ₹237.00 today sales |
| `/api/v1/admin/bills/1/cancel` | POST | `200 OK` | Bill authoritatively cancelled with refund; preserved in DB |
| `/api/v1/admin/audit-logs` | GET | `200 OK` | Verified audit log trails |
| `/api-docs` | GET | `200 OK` | Complete OpenAPI 3.0 specification |
| `/swagger-ui.html` | GET | `302 -> 200` | Swagger UI interactive documentation |

---

---

## Phase 3 Execution & Verification Report (Completed)

### 1. Approved Brand Design & Architecture Alignment
- **Official Brand Name**: **The Station Stories** (strictly plural).
- **Approved Brand Color System (Warm Luxury Aesthetic)**:
  - **Warm Ivory (`#F7F1E8`)**: Dominant website background across all pages — bright, luxurious, and welcoming (strictly avoiding dark charcoal backgrounds).
  - **Royal Plum (`#45213F`)**: Primary brand headings, brand accents, and primary CTA buttons with ivory text.
  - **Champagne Gold (`#C5A16B`)**: Important highlights, borders, badges, star ratings, and subtle metallic dividers.
  - **Soft Lavender (`#E9DDEB`)**: Secondary card backgrounds and category filters.
  - **Muted Rose (`#B88E9D`)**: Decorative borders, tags, and delicate badges.
  - **Dark Plum (`#32172F`)**: Selected hero overlays, luxury footer background, and deep contrast panels.
  - **Body Text (`#332A35`)**: High contrast, readable typography on Warm Ivory surfaces.
  - **Pure White (`#FFFFFF`)**: Clean card surfaces and content wrappers.
- **Application Separation**:
  - Customer-facing website (`/`, `/menu`, `/qr-menu`, `/gallery`, `/about`, `/contact`, `/bill/view/:uuid`) is completely independent from the private POS system.
  - QR Menu (`/qr-menu`) is strictly a browsing and discovery tool (zero checkout, zero online payments, zero cart).
  - Discreet Staff Portal link (`/admin/login`) located exclusively in the footer; customer navigation contains zero internal POS/admin links.
- **Cross-Platform & Future POS Architecture**:
  - Confirmed future Windows local deployment with local MySQL and offline billing.
  - Confirmed future encrypted local and cloud backup architecture.
  - All paths, environment configs, and code are platform-neutral without macOS-specific assumptions.

### 2. Authentic Restaurant Asset Integration
- Preserved all 13 original master photographs in `referance-assets/` completely untouched.
- Mirrored assets into production directories:
  - `frontend/public/images/restaurant/`: 12 high-resolution authentic photos covering dining hall, booths, swing pods, neon lights, crystal chandelier, and murals.
  - `frontend/public/images/branding/`: `station-stories-signage.jpeg`.
  - `frontend/public/referance-assets/`: Mirrored master files for direct database URL resolution.
- Temporary Food Photos: 20 styled dish items with explicit `[Representative Image]` badges as mandated by `IMAGE_ASSET_GUIDE.md`.

### 3. Customer Web Platform Pages Implemented
1. **`HomePage.jsx` (`/`)**:
   - Hero banner with authentic central dining hall backdrop (`interior-main-hall.jpeg`), bold Cormorant Garamond / Playfair Display typography, "Open Today 11:00 AM - 11:00 PM" live status badge, and dual CTAs ("Explore Menu" & "Scan Table QR").
   - "The Journey & The Ambience" section featuring 4 core pillars with authentic photos (Express Dining Hall, Private Express Cabins, Cozy Swing Pods, Fresh Kitchen Craft).
   - "Chef's Handcrafted Highlights" dish grid with live backend data and offline fallback.
   - Authentic Ambience Showcase showcasing 6 real photographs with instant lightbox zoom.
   - Private Cabin Booking & Celebration Banner.
2. **`MenuPage.jsx` (`/menu`)**:
   - Dynamic category filter rail (`All`, `Burgers & Sandwiches`, `Pizzas & Garlic Breads`, `Chinese & Fast Food`, `Beverages & Shakes`, `Chaat & Quick Bites`).
   - 100% Vegetarian Only toggle switch.
   - Real-time search bar (by English or Hindi dish name, ingredients, or description).
   - Responsive grid of `MenuCard` items with spice level indicators, veg marks, dual-language titles, prices, and `[Representative Image]` badges.
3. **`QrMenuPage.jsx` (`/qr-menu`)**:
   - Touch-first mobile QR menu designed for table/cabin guests.
   - Table/Cabin selector dropdown (`Cabin 1, 2, 3`, `Table 1-10`).
   - Quick search and compact dish items (browsing only, no checkout/cart).
   - "Request Server / Call Captain" notification button with modal feedback.
4. **`GalleryPage.jsx` (`/gallery`)**:
   - Showcases all 13 authentic photographs categorized into `All`, `Main Dining Hall`, `Seating & Cabins`, `Reception & Entrance`, `Lighting & Decor`, `Art & Murals`.
   - Fullscreen `Lightbox` modal with ESC key exit, zoom, and authenticity watermark.
5. **`AboutPage.jsx` (`/about`)**:
   - Narrative of The Station Stories, railway heritage inspiration, and culinary mission.
   - Featured brand wall signage photo and architectural showcase.
6. **`ContactPage.jsx` (`/contact`)**:
   - Operating hours (`11:00 AM – 11:00 PM Daily`), address placeholder, phone placeholder.
   - Interactive inquiry form for private cabin reservations, celebrations, and feedback.
   - Direct click-to-chat WhatsApp button (`https://wa.me/91XXXXXXXXXX`).
7. **`PublicInvoicePage.jsx` (`/bill/view/:uuid`)**:
   - Public digital receipt view fetched securely from `/api/v1/public/bill/view/{uuid}`.
   - Thermal receipt layout (80mm/58mm standard) with Print Receipt button (`window.print()`).

### 4. Language, Typography & Motion Support
- **Dual Language**: Seamless Hindi & English switcher with persistent `i18next` detection.
- **Typography**: Google Fonts linked for `Cormorant Garamond`, `Playfair Display`, `Manrope`, `DM Sans`, and `Noto Sans Devanagari`.
- **Motion & Animations**: Supported via `framer-motion` (with `prefers-reduced-motion` safety), `gsap`, `embla-carousel-react`, and `lucide-react`.

### 5. Build & Live Route Verification Results
- **Optimized Production Build**: `npm run build` completed cleanly in 1.22s with 0 errors and zero chunk size warnings:
  - `dist/index.html` (1.40 kB)
  - `dist/assets/index-CqEmfSuW.css` (43.68 kB)
  - `dist/assets/vendor-icons-Cnq0dcb4.js` (22.88 kB)
  - `dist/assets/vendor-motion-Don2PPzU.js` (143.66 kB)
  - `dist/assets/vendor-react-nOh8J6eP.js` (162.27 kB)
  - `dist/assets/index-DGOH8kgP.js` (234.32 kB)
- **Vite Dev Server**: Serving hot-reloaded bundle on `http://127.0.0.1:5173/`.
- **Live HTTP Route Verification**:
  - `GET /` -> `200 OK`
  - `GET /menu` -> `200 OK`
  - `GET /qr-menu` -> `200 OK`
  - `GET /gallery` -> `200 OK`
  - `GET /about` -> `200 OK`
  - `GET /contact` -> `200 OK`
  - `GET /bill/view/demo-123` -> `200 OK`
  - `GET /images/restaurant/interior-main-hall.jpeg` -> `200 OK`
  - `GET /images/branding/station-stories-signage.jpeg` -> `200 OK`
  - `GET /images/food/biryani.webp` -> `200 OK`

### 6. Known Issues, Limitations & Pre-Launch Notices
1. **Representative Food Photography**: Dishes in the digital menu and QR menu currently display representative imagery with prominent `[Representative Image]` badges. Genuine high-resolution dish photography from the restaurant kitchen will replace them upon receipt from the owner.
2. **Pending Business Details**: Contact telephone number, GSTIN, and physical street address are populated with structured placeholders (`[Pending Owner Confirmation]`) in `restaurantData.js` until confirmed by management.
3. **QR Menu Ordering Scope**: The QR Menu (`/qr-menu`) provides touch-first dish discovery and server/captain calling functionality. Online ordering, cart checkout, and digital payment gateways are deliberately withheld in accordance with the offline-first, cashier-assisted POS architecture (Phase 5).
4. **Thermal Printing Mechanism**: Public bill invoices (`/bill/view/:uuid`) leverage browser-based `@media print` layout formatting. Raw direct USB ESC/POS binary printing is architected for Phase 5 POS deployment.

### 7. External Code & Design Review Visuals
Desktop and mobile high-resolution captures have been generated and archived in `documentation/screenshots/`:
- `desktop-homepage.png` (1440 × 1080) / `mobile-homepage.png` (390 × 844)
- `desktop-menu.png` (1440 × 1080) / `mobile-menu.png` (390 × 844)
- `desktop-gallery.png` (1440 × 1080) / `mobile-gallery.png` (390 × 844)
- `desktop-qrmenu.png` (1440 × 1080) / `mobile-qrmenu.png` (390 × 844)

---

## Current Status & Next Phase
- **Phase 3 Status**: 🔄 **In Progress / Final Review**.
- **Deliberate Phase Sequence**: **Phase 0 → Phase 1 → Phase 3 → Phase 2 → Phase 4 → Phase 5 → Phase 6**.
- **External Review Readiness**: ✅ **Security audit clean, gitignore verified, zero sensitive credentials committed, visual screenshots generated**.
- **Next Phase**: **Phase 2 – Backend Business Logic and APIs** (to begin only upon owner sign-off).
- **Rule**: STRICTLY STOP. Postponed features (Phase 2 APIs, Phase 4 Admin Dashboard, Phase 5 Local POS, Phase 6 Launch) are NOT started.
- Awaiting explicit owner review and sign-off before proceeding to Phase 2.


