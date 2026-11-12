# THE STATION STORIES – Comprehensive Project Plan & Roadmap

## 1. Executive Vision & Brand Identity

**THE STATION STORIES** is a restaurant web platform and point-of-sale management system engineered to deliver:
1. **A Customer-Facing Web Experience**: Showcases authentic restaurant interior and ambiance photography, a vintage locomotive dining theme, dual-language (English/Hindi) support, Google reviews, and an interactive digital menu accessible via QR code.
2. **A High-Speed POS Counter Terminal (`/pos`)**: Fast, error-free counter operations supporting product catalog browsing, instant cart management, Cash and UPI payment settlement, thermal receipt generation (80mm & 58mm standard), and secure digital invoices.
3. **An Admin Control Hub (`/admin`)**: Gives the restaurant owner full authority over menu pricing, dish availability, authentic photo uploads, customer purchase history, daily/monthly revenue analytics, and flexible tax configurations.
4. **Instant Digital Bill Delivery**: WhatsApp sharing of itemized receipts, reducing paper waste and enhancing customer delight.

> [!NOTE]
> **Official Brand Name**: **THE STATION STORIES** (strictly plural).
> **Production Database**: **`the_station_stories`**.

---

## 2. Feature Scope Matrix

### Confirmed In-Scope Features (Initial Release)

| Domain | Feature | Specification |
|---|---|---|
| **Customer Web** | Premium Homepage | Hero showcase featuring authentic dining hall photos, locomotive brand story, atmosphere highlights, operating hours, and location. |
| **Customer Web** | Digital Food Menu | Filterable by category, veg/non-veg, spice level, real-time search, responsive card layout with `[Representative Image]` badge on dev items. |
| **Customer Web** | QR-Code Digital Menu | Dedicated mobile-optimized menu view (`/qr-menu`) accessible via in-restaurant QR scans. |
| **Customer Web** | Restaurant Gallery | High-resolution grid categorizing the 13 authentic interior, lighting, and decor photographs. |
| **Customer Web** | Hindi & English Support | Dynamic language switch toggle preserving food dish context and navigation. |
| **Customer Web** | Social & Maps | Embedded Google Maps location, Google Reviews link, Instagram profile link. |
| **POS Billing** | Dedicated Route (`/pos`) | Standalone, protected cashier interface optimized for high-volume counter speed. |
| **POS Billing** | Fast Order Builder | Instant category filtering, dish search, quantity toggles, custom item notes. |
| **POS Billing** | Customer Lookup | Optional 10-digit mobile lookup auto-populating returning customer details and visit count; supports walk-in anonymous checkout. |
| **POS Billing** | Payment Processing | Multi-mode settlement: Cash and UPI (with dynamic UPI QR). |
| **POS Billing** | Thermal Receipt Print | One-click browser print targeting 80mm and 58mm thermal POS roll standards. |
| **POS Billing** | Secure Digital Invoice | Cryptographically secure random UUIDv4 invoice link (`/bill/view/:uuid`) for customer access. |
| **POS Billing** | WhatsApp Sharing | Pre-filled WhatsApp click-to-send intent delivering itemized receipts; 6 distinct delivery states tracked. |
| **Admin Hub** | Authentication | Secure JWT login with role-based authorization (`ROLE_ADMIN`, `ROLE_CASHIER`) and login rate limiting. |
| **Admin Hub** | Analytics Dashboard | Today's revenue, order count, average ticket value, payment breakdown (Cash vs UPI), top dishes. |
| **Admin Hub** | Menu Management | Complete CRUD for categories and dishes; real-time in-stock/86 toggle; dish image replacement. |
| **Admin Hub** | Customer CRM | Searchable customer directory with lifetime visit count and total spent metrics. |
| **Admin Hub** | Billing History & Audit | Historical invoices with filtering, auditable cancellation/refund workflow, and one-click reprint. |
| **Admin Hub** | Financial Reports | Daily and monthly sales reconciliation reports. |
| **Admin Hub** | Restaurant Settings | Store profile, UPI VPA configuration, contact details, and dynamic tax engine toggles. |
| **Tax Engine** | Flexible GST System | **Disabled by default (0.00% tax)**. Dynamically enabled only if confirmed by owner in settings. |

### Postponed Features (Architecturally Prepared for Future Releases)

- **Online Cabin Booking**: The restaurant has three private cabins. In the initial release, cabin assignment is handled at the counter via `cabin_table_ref` on POS bills (`Cabin 1`, `Cabin 2`, `Cabin 3`). Online customer booking is postponed.
- **Online Food Ordering**: Order type enums accommodate `ONLINE_ORDER` alongside `DINE_IN` and `TAKEAWAY`.
- **Payment Gateway Integration**: Strategy interfaces (`PaymentProcessingStrategy`) prepared for Razorpay/Cashfree.
- **Automatic Table Management**: Status tracking designed for future visual floorplan.
- **Kitchen Order Ticket (KOT)**: Item status enums (`ORDERED`, `PREPARING`, `SERVED`) prepared for kitchen display screen route `/kitchen`.
- **Inventory & Recipe Management**: Extensible schema references prepared.

---

## 3. UI/UX Design System Direction

- **Brand Mood**: Heritage railway elegance fused with vibrant contemporary neon ambiance.
- **Color Palette**:
  - **Midnight Charcoal** (`#12161A`, `#1A2026`) – Deep luxury background.
  - **Warm Ivory** (`#FBF9F5`, `#F5F0E6`) – Clean surface and text background.
  - **Champagne Gold** (`#D4AF37`, `#C5A059`) – Accent highlights and badges.
  - **Atmosphere Purple / Indigo** (`#6366F1`, `#7C3AED`, `#9333EA`) – Subtle atmospheric glow echoing authentic restaurant lighting.
- **Typography**:
  - Headings: Serif elegance (Playfair Display / Cormorant Garamond).
  - Body & Numbers: High-legibility geometric sans-serif (Inter / Plus Jakarta Sans).
- **Asset Hierarchy**:
  - Authentic photos prioritized across Homepage, Gallery, and About Us.
  - Temporary licensed food images clearly distinguished in development.

---

## 4. Unconfirmed Business Information & Placeholder Strategy

The following information has not yet been confirmed by the restaurant owner:
- Complete restaurant street address
- Primary and secondary contact phone numbers
- Official WhatsApp business number
- Daily opening and closing hours
- Actual UPI ID (VPA) for payment collection
- GST registration status and GSTIN
- Official food menu items, recipe descriptions, and prices
- Official Instagram profile handle
- Google Maps location URL and Google Business Profile

**Strict Policy**: These parameters remain fully configurable through the Admin Settings and database. Clearly marked placeholders (e.g. `[Pending Owner Confirmation]`) will be used during development. **No fake business information, invented menu prices, or fictitious customer reviews will ever be published.**

---

## 5. Phased Development Roadmap

### Phase 0: Workspace Analysis, Architecture, Schema & Planning (Current Phase)
- **Status**: ✅ **COMPLETED – PENDING OWNER APPROVAL TO BEGIN PHASE 1**
- **Deliverables**:
  - Complete workspace inspection and audit of 13 authentic photos in `referance-assets/`.
  - Architecture specification (`TECHNICAL_ARCHITECTURE.md`).
  - Database schema & ER diagram (`DATABASE_DESIGN.md`).
  - REST API contracts (`API_DOCUMENTATION.md`).
  - Project execution plan (`PROJECT_PLAN.md`).
  - Image asset guide (`IMAGE_ASSET_GUIDE.md`).
  - Progress tracker (`DEVELOPMENT_PROGRESS.md`).
  - Deployment guide (`DEPLOYMENT_GUIDE.md`).

---

### Phase 1: Project Scaffolding, Git, MySQL Connection & Environment Setup
- **Goal**: Initialize Git repository, configure Spring Boot backend (Java 21, Maven), configure React frontend (Vite, Tailwind CSS), configure MySQL connection (`the_station_stories`) and Flyway migrations.
- **Tasks**:
  1. Initialize Git repository with structured `.gitignore`.
  2. Bootstrap backend directory structure (`backend/`) with Maven `pom.xml` and Java 21 dependencies.
  3. Bootstrap frontend directory structure (`frontend/`) with React, Vite, and Tailwind CSS.
  4. Create MySQL database `the_station_stories` and test connectivity.
  5. Implement Flyway migration scripts (`V1__init_schema.sql` and `V2__seed_initial_data.sql`).
  6. Verify backend compiles and boots cleanly.
  7. Verify frontend compiles and serves cleanly.
  8. Document setup and seek approval.

---

### Phase 2: Database & Core Backend REST APIs
- **Goal**: Implement backend modular monolith modules with security and unit/integration tests.
- **Tasks**:
  1. Implement `common` modules: Global Exception Handler, CORS filter, Security configuration, JWT filter, Rate limiter.
  2. Implement `auth` module: Login, Token refresh, current user profile endpoint.
  3. Implement `menu` & `category` module: Public list endpoints, Admin CRUD endpoints.
  4. Implement `customer` module: Quick lookup by phone, deduplicated registration.
  5. Implement `billing` module: Order creation, thread-safe sequence generator, authoritative financial calculations, dynamic tax calculation engine (strictly 0% unless enabled), invoice UUID generation.
  6. Implement `report` module: Dashboard statistics, daily summary, monthly sales breakdown.
  7. Implement `setting` module: Dynamic tax policy, restaurant metadata.
  8. Implement `gallery` module: Categorized photo query.
  9. Run API test suite and verify all endpoints.

---

### Phase 3: Customer-Facing Web Platform & Digital Menu
- **Goal**: Build the responsive customer-facing website and QR menu.
- **Tasks**:
  1. Build layout system (`Navbar`, `Footer`, `LanguageToggle`, floating WhatsApp contact button).
  2. Build Homepage featuring authentic dining hall photos, locomotive theme, and ambiance highlights.
  3. Build Interactive Digital Food Menu with category filters, Veg/Non-Veg switch, search bar, and representative image badges.
  4. Build Dedicated Mobile QR Menu (`/qr-menu`).
  5. Build Restaurant Gallery (`/gallery`) with category filter pills.
  6. Implement English / Hindi dual-language switcher with locale dictionary.

---

### Phase 4: POS Billing System & Receipt Printing
- **Goal**: Build the cashier POS terminal (`/pos`) with fast order creation and thermal receipt generation.
- **Tasks**:
  1. Build POS layout with high-contrast cashier color scheme.
  2. Build interactive product catalog grid with instant search and category quick-buttons.
  3. Build active order cart with quantity controls, custom item notes, and discount calculator.
  4. Build optional customer lookup input with automatic phone-based match; support anonymous walk-in checkout.
  5. Build payment settlement modal (Cash, UPI QR display, Split payment).
  6. Build thermal receipt printing template with `@media print` CSS for 80mm and 58mm POS printers.
  7. Implement client-side PDF invoice generator and public bill view (`/bill/view/:uuid`).
  8. Test bill generation and print output.

---

### Phase 5: Admin Dashboard, Analytics & Management
- **Goal**: Implement the administrative portal (`/admin`) for store management.
- **Tasks**:
  1. Build Admin Layout with sidebar navigation and session status.
  2. Build Dashboard overview with KPI metric cards, daily sales charts, and top-selling dishes.
  3. Build Menu Management table: add/edit dishes, price adjustments, stock availability toggle.
  4. Build Category Management view with display ordering.
  5. Build Customer CRM table with lifetime purchase history.
  6. Build Historical Bills table with date filters, status indicators, auditable cancellation workflow, and reprint action.
  7. Build Financial Reports tab with downloadable summary data.
  8. Build Settings view: store profile, UPI ID, and flexible GST tax controls.

---

### Phase 6: Digital Bill Delivery & WhatsApp Integration
- **Goal**: Implement zero-cost WhatsApp intent sharing and cloud API adapter.
- **Tasks**:
  1. Build WhatsApp message formatter generating formatted receipts (emojis, bold totals, line items).
  2. Integrate one-click WhatsApp intent URL launching WhatsApp Web/Desktop.
  3. Implement delivery state tracker (`NOT_SENT`, `LINK_PREPARED`, `OPENED`, `MANUALLY_SENT`, `DELIVERY_CONFIRMED`).
  4. Create extensible backend adapter for Meta Cloud API integration.
  5. Test end-to-end bill sharing workflow.

---

### Phase 7: Verification, Hardening, Polish & Handover
- **Goal**: Comprehensive system testing, error handling polish, and production readiness.
- **Tasks**:
  1. Execute cross-browser and mobile responsiveness testing.
  2. Verify all 13 authentic restaurant photographs render crisply.
  3. Validate tax engine behavior under both disabled and enabled states.
  4. Conduct security review (CORS, token expiration, SQL injection, input sanitization).
  5. Complete `DEVELOPMENT_PROGRESS.md` and finalize `DEPLOYMENT_GUIDE.md`.
  6. Final demonstration walkthrough for owner approval.
