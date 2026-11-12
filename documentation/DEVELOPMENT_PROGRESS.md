# THE STATION STORIES – Development Progress Tracker

## Project Overview
- **Project Name**: THE STATION STORIES Restaurant Website & Management System
- **Brand Identity**: **THE STATION STORIES** (strictly plural)
- **Database Name**: **`the_station_stories`** (MySQL 8)
- **Current Active Phase**: Phase 2 (Database & Backend Business Logic)
- **Phase Status**: ✅ **PHASE 2 COMPLETED & VERIFIED – READY FOR OWNER REVIEW TO PROCEED TO PHASE 3**
- **Last Updated**: 2026-11-12

---

## Phase Status Matrix

| Phase | Description | Status | Blockers / Next Step |
|---|---|---|---|
| **Phase 0** | Workspace Analysis, Asset Audit, Architecture, Security & Planning | ✅ **Completed & Audited** | Phase complete |
| **Phase 1** | Project Scaffolding, Git, MySQL Connection & Environment Setup | ✅ **Completed & Verified** | Preserved Java 26.0.1 & MySQL 9.5.0 compatibility |
| **Phase 2** | Database Migrations & Core Backend REST APIs (Modular Monolith) | ✅ **Completed & Verified** | 24/24 Tests Passed, Live APIs Verified, Ready for Owner Sign-off |
| **Phase 3** | Customer-Facing Website, Digital Menu & Gallery with Authentic Photos | ⏳ Ready to Start | Awaiting Phase 2 sign-off |
| **Phase 4** | POS Billing System, Thermal Receipt Printing (80mm/58mm) & PDF Bills | ⏳ Pending | Depends on Phase 3 |
| **Phase 5** | Admin Dashboard, Analytics, Menu Management & Dynamic Tax Controls | ⏳ Pending | Depends on Phase 4 |
| **Phase 6** | Digital Bill Delivery & WhatsApp Sharing Integration | ⏳ Pending | Depends on Phase 5 |
| **Phase 7** | End-to-End Verification, Security Hardening, Polish & Deployment | ⏳ Pending | Depends on Phase 6 |

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

## Current Status & Next Phase
- **Phase 2 Status**: ✅ **100% Complete & Verified**.
- **Phase 3 Next**: Customer-Facing Website, Digital Menu & Gallery with Authentic Photos.
- **Rule**: STRICTLY STOP after Phase 2. Awaiting explicit owner review and sign-off before Phase 3 begins.

