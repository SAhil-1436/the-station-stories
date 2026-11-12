# THE STATION STORIES – Development Progress Tracker

## Project Overview
- **Project Name**: THE STATION STORIES Restaurant Website & Management System
- **Brand Identity**: **THE STATION STORIES** (strictly plural)
- **Database Name**: **`the_station_stories`** (MySQL 8)
- **Current Active Phase**: Phase 0 (Workspace Analysis, Architecture, Asset Audit & Planning)
- **Phase Status**: ✅ **PHASE 0 FINAL TECHNICAL AUDIT & CORRECTIONS COMPLETED – PENDING OWNER APPROVAL TO PROCEED TO PHASE 1**
- **Last Updated**: 2026-11-12

---

## Phase Status Matrix

| Phase | Description | Status | Blockers / Next Step |
|---|---|---|---|
| **Phase 0** | Workspace Analysis, Asset Audit, Architecture, Security & Planning | ✅ **Completed & Audited** | Awaiting Owner Approval to begin Phase 1 |
| **Phase 1** | Project Scaffolding, Git, MySQL Connection & Environment Setup | ⏳ Ready to Start | Awaiting Phase 0 sign-off |
| **Phase 2** | Database Migrations & Core Backend REST APIs (Modular Monolith) | ⏳ Pending | Depends on Phase 1 |
| **Phase 3** | Customer-Facing Website, Digital Menu & Gallery with Authentic Photos | ⏳ Pending | Depends on Phase 2 |
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

## Final Phase 1 Implementation Checklist (Ready for Sign-Off)

- [ ] **Git Repository Initialization**:
  - Run `git init` in project root.
  - Configure `.gitignore` for Java/Maven (`target/`, `.class`), Node (`node_modules/`, `dist/`), and IDE files.
  - Create initial commit with finalized Phase 0 documentation and untouched assets.
- [ ] **Backend Project Bootstrapping (`backend/`)**:
  - Scaffold Maven project with Java 21 and Spring Boot 3.3.x dependencies.
  - Configure `application.yml` and `application-dev.yml` targeting `the_station_stories`.
  - Implement Flyway migrations: `V1__init_schema.sql` and `V2__seed_initial_data.sql`.
  - Verify Maven build compiles cleanly (`mvn clean compile`).
- [ ] **Frontend Project Bootstrapping (`frontend/`)**:
  - Scaffold React 18 SPA via Vite.
  - Configure Tailwind CSS with the official design system palette and fonts.
  - Install dependencies: `react-router-dom`, `axios`, `lucide-react`, `jspdf`, `html2canvas`.
  - Create production image asset folders (`restaurant/`, `food/`, `branding/`).
  - Verify Vite development server boots cleanly (`npm run dev`).
- [ ] **Database Connection & Verification**:
  - Ensure MySQL database `the_station_stories` is reachable.
  - Run Flyway migrations to establish all 8 core tables, sequences, and indexes.
  - Boot Spring Boot backend and verify schema integrity.
- [ ] **Phase 1 Verification & Summary**:
  - Test communication between frontend Vite dev server and Spring Boot backend via a health check endpoint.
  - Document all commands, ports, and configuration steps in `DEVELOPMENT_PROGRESS.md`.
  - Request owner approval before beginning Phase 2 backend REST API development.
