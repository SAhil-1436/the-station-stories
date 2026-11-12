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

- **Brand Mood**: Heritage railway elegance fused with welcoming warmth, modern comfort, and authentic ambiance.
- **Approved Color Palette (Warm Luxury Aesthetic)**:
  - **Warm Ivory (`#F7F1E8`)**: Dominant website background across all pages — bright, luxurious, and welcoming (strictly avoiding dark charcoal backgrounds).
  - **Royal Plum (`#45213F`)**: Primary brand headings, brand accents, and primary CTA buttons with ivory text.
  - **Champagne Gold (`#C5A16B`)**: Accent highlights, borders, badges, star ratings, and subtle metallic dividers.
  - **Soft Lavender (`#E9DDEB`)**: Secondary card backgrounds and category filters.
  - **Muted Rose (`#B88E9D`)**: Decorative tag accents and delicate border details.
  - **Dark Plum (`#32172F`)**: Selective hero backdrop contrast, luxury footer background, and deep ambiance accents.
  - **Body Text (`#332A35`)**: High contrast, readable typography on Warm Ivory surfaces.
  - **Pure White (`#FFFFFF`)**: Clean card surfaces and content wrappers.
- **Typography**:
  - Headings: Serif elegance (`Cormorant Garamond` / `Playfair Display`).
  - Body & Numbers: High-legibility geometric sans-serif (`Manrope` / `DM Sans`).
  - Bilingual Devanagari: `Noto Sans Devanagari`.
- **Asset Hierarchy**:
  - Authentic photos prioritized across Homepage, Gallery, and About Us.
  - Temporary licensed food images clearly distinguished in development with `[Representative Image]` badges.

---

## 4. Separation of Functional Applications

The system comprises three strictly separated functional areas:
1. **Public Customer Website**:
   - Customer-facing web application optimized for desktop, tablet, and mobile browsers (`/`, `/menu`, `/qr-menu`, `/gallery`, `/about`, `/contact`, `/bill/view/:uuid`).
   - QR Menu (`/qr-menu`) is strictly a browsing and discovery tool (zero checkout, zero online payments, zero cart).
   - Customer navigation contains zero internal POS or Admin links.
2. **Private Admin Dashboard**:
   - Dedicated administrative operations portal for store management, menu catalog adjustments, financial reports, and tax settings.
   - Accessible only via discreet Staff Portal login (`/admin/login`) located in the footer.
   - Routes remain protected placeholders until Phase 4 implementation.
3. **Private Local POS & Billing Application**:
   - Dedicated counter billing application for cashiers, order settlement, and thermal receipt printing.
   - Routes remain protected placeholders until Phase 5 implementation.

---

## 5. Phased Development Roadmap

> [!IMPORTANT]
> **Deliberate Phase Sequence**: The project follows the agreed sequence:  
> **Phase 0 → Phase 1 → Phase 3 → Phase 2 → Phase 4 → Phase 5 → Phase 6**.  
> Do not renumber the phases. Phase 3 (Customer Website Design and Frontend) is developed before Phase 2 by deliberate design decision.

### Phase 0: Planning and Documentation
- **Status**: ✅ **COMPLETED**
- **Deliverables**:
  - Workspace inspection and audit of 13 authentic photos in `referance-assets/`.
  - Architecture specification (`TECHNICAL_ARCHITECTURE.md`).
  - Database schema & ER diagram (`DATABASE_DESIGN.md`).
  - REST API contracts (`API_DOCUMENTATION.md`).
  - Project execution plan (`PROJECT_PLAN.md`).
  - Image asset guide (`IMAGE_ASSET_GUIDE.md`).
  - Progress tracker (`DEVELOPMENT_PROGRESS.md`).
  - Deployment guide (`DEPLOYMENT_GUIDE.md`).

---

### Phase 1: Project Foundation and Environment Setup
- **Status**: ✅ **COMPLETED & VERIFIED**
- **Deliverables**:
  - Git repository with security-hardened `.gitignore`.
  - Spring Boot backend (Java 21 bytecode release targeting on verified Java 26.0.1 runtime).
  - MySQL database (`the_station_stories`, MySQL 9.5 compatible) with Flyway migrations baseline.
  - React 18 + Vite frontend with Tailwind CSS and dual-language (Hindi/English) `i18next`.
  - Health check endpoint `/api/health` reporting live status.

---

### Phase 3: Public Customer Website Design and Frontend
- **Status**: 🔄 **FINAL REVIEW**
- **Scope**:
  1. Full Customer Website built on approved Warm Ivory (`#F7F1E8`) and Royal Plum (`#45213F`) palette.
  2. Asymmetrical editorial Homepage with authentic central dining hall backdrop, 4 pillars, brand story, and photo gallery showcase.
  3. Interactive Digital Menu (`/menu`) with category tabs, search, veg toggle, and dish cards with `[Representative Image]` badges.
  4. Dedicated Mobile Table/Cabin QR Menu (`/qr-menu`) with cabin selector and captain call alert (browsing only, no checkout).
  5. High-resolution Photo Gallery (`/gallery`) showcasing all 13 authentic photos with interactive Lightbox preview.
  6. Narrative Brand Story (`/about`) and Contact & Inquiry Reservation page (`/contact`) with direct WhatsApp chat.
  7. Public digital invoice view (`/bill/view/:uuid`) with thermal receipt layout.
  8. Optimized production build with zero chunk warnings and verified live HTTP 200 responses.

---

### Phase 2: Backend Business Logic and APIs
- **Status**: ⏳ **IMPLEMENTATION COMPLETED – FUNCTIONAL VERIFICATION PENDING**
- **Architecture & Implementation State**:
  - Full backend domain modular monolith is implemented and compiling (11 JPA entities, 12 repositories, 12 services, 5 REST controllers, 16 DTOs, Spring Security RBAC, login rate limiter, and 3 Flyway migrations).
  - Authoritative financial calculations, discount models, zero-tax defaults, finalized bill soft-cancellation safety, customer phone normalization, and rate limiting have passed 23 unit tests in Mockito mock testing.
- **Pending Functional Verification**:
  - Comprehensive live end-to-end integration testing across all 15+ controller endpoints against live MySQL database constraints.
  - Multi-width thermal receipt layout verification (80mm & 58mm).
  - Multipart image upload endpoint (`POST /api/v1/admin/menu/{id}/image`) with live file system write.
  - Live multi-user concurrent daily bill sequence generation (`TSS-YYYYMMDD-XXXX`).
  - Full frontend-backend cross-origin integration with live JWT authorization tokens.
  - *(This dedicated functional verification is scheduled as the immediate next step upon Phase 3 sign-off)*.

---

### Phase 4: Admin Dashboard
- **Status**: ⏳ **PENDING (AFTER PHASE 2)**
- **Scope**:
  1. Implement Admin Layout with sidebar navigation and session status.
  2. Dashboard KPI metric cards, daily sales charts, and top-selling dishes.
  3. Menu and Category Management CRUD (dishes, prices, in-stock/86 toggle, image replacements).
  4. Customer CRM table with lifetime visit count and total spent metrics.
  5. Historical Bills table with date filters, auditable cancellation/refund workflow, and reprint actions.
  6. Financial Reports tab and dynamic GST tax controls.

---

### Phase 5: Local POS and Billing System
- **Status**: ⏳ **PENDING (AFTER PHASE 4)**
- **Scope**:
  1. High-speed cashier POS counter terminal (`/pos`) optimized for keyboard and touch speed.
  2. Fast Order Builder with category filters, quick search, quantity adjustments, and custom notes.
  3. Returning customer phone lookup with automatic visit count tracking; walk-in anonymous checkout.
  4. Payment settlement modal (Cash, dynamic UPI QR display, Split payment).
  5. Thermal receipt printing engine supporting 80mm and 58mm roll standards via browser print and direct USB printing interface.
  6. Local offline billing capability with local MySQL fallback.

---

### Phase 6: Testing, Security, Windows Deployment, Backup and Production Launch
- **Status**: ⏳ **PENDING (AFTER PHASE 5)**
- **Scope**:
  1. End-to-end testing, cross-browser verification, and mobile responsiveness hardening.
  2. Security audit: Rate limiting, CORS whitelist, JWT expiration, input sanitization, SQL injection prevention.
  3. Windows local deployment configuration for restaurant counter hardware with offline capability.
  4. Automated encrypted local backup (USB/external drive) and encrypted cloud backup synchronization.
  5. Production handover, staff operating documentation, and live launch.

