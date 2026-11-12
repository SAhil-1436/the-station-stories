# PHASE 4.6 – STAFF PROVISIONING & RESTAURANT SETTINGS REPORT
**Project:** The Station Stories – Restaurant Management Platform  
**Target Release:** Phase 4.6 (Staff Provisioning & Restaurant Settings)  
**Status:** ✅ Implementation & Verification Complete  
**Date:** November 2026  

---

## 1. Executive Summary

Phase 4.6 delivers two core administrative modules for The Station Stories:
1. **Staff Account Provisioning (`/admin/staff`)**: Dedicated provisioning workflow to register cashier (`ROLE_CASHIER`) and administrator (`ROLE_ADMIN`) accounts with mandatory physical company card verification.
2. **Restaurant Settings & GST Policy (`/admin/settings`)**: Central store metadata configuration, UPI VPA identifier setup, and dynamic Goods & Services Tax (GST) computation policy controls.

Both modules connect directly to verified Spring Boot endpoints in `AdminController.java` (`/api/v1/admin/**`) via `adminApi.js`. No artificial mock databases or unverified endpoints were introduced.

---

## 2. Files Created & Modified

| File | Status | Description |
|---|:---:|---|
| `frontend/src/pages/admin/StaffManagementPage.jsx` | Modified | Replaced placeholder with complete staff provisioning form. Features role selector (`ROLE_CASHIER` default), password visibility toggle, mandatory company card number field, error handlers, and a sanitized success view. |
| `frontend/src/pages/admin/SettingsPage.jsx` | Modified | Replaced placeholder with master store settings form. Structured into Restaurant Profile, Online Presence, Payment Configuration, and GST & Tax Configuration sections. Features placeholder badges, GST activation guard modal, and tax calculation previews. |
| `frontend/src/pages/admin/AdminDashboardPage.jsx` | Modified | Updated module shortcuts for "Staff Accounts" and "Settings & GST" from `Phase 4.6` to `Live` status. |
| `DEVELOPMENT_PROGRESS.md` | Modified | Updated Phase 4 status matrix to reflect Phase 4.6 completion. |
| `documentation/DEVELOPMENT_PROGRESS.md` | Modified | Synchronized progress tracker mirror. |

---

## 3. Routes & Exact API Methods Used

### 3.1 Staff Account Provisioning: `POST /api/v1/admin/users/staff`
- **Route**: `/admin/staff`
- **Method in `adminApi.js`**: `createStaff(staffData)`
- **Request Contract (`CreateStaffRequest`)**:
  - `username`: String (Required, 3–50 chars, unique).
  - `password`: String (Required, minimum 8 characters).
  - `fullName`: String (Required).
  - `phone`: String (Optional, 10–14 digits).
  - `companyCardNumber`: String (Mandatory verification number).
  - `role`: String (`ROLE_CASHIER` or `ROLE_ADMIN`; default: `ROLE_CASHIER`).
- **Response Contract (`UserDto`)**:
  - `id`: Long
  - `username`: String
  - `fullName`: String
  - `phone`: String
  - `companyCardNumber`: String
  - `roles`: `List<String>`
  - `active`: boolean

### 3.2 Fetch Restaurant Settings: `GET /api/v1/admin/settings`
- **Route**: `/admin/settings`
- **Method in `adminApi.js`**: `getSettings()`
- **Response Contract (`RestaurantSettingResponse`)**:
  - `restaurantName`: String
  - `tagline`: String
  - `address`: String
  - `phonePrimary`: String
  - `phoneSecondary`: String
  - `whatsappNumber`: String
  - `email`: String
  - `openingHours`: String
  - `googleMapsUrl`: String
  - `instagramHandle`: String
  - `upiId`: String
  - `currencySymbol`: String
  - `gstEnabled`: boolean
  - `gstin`: String
  - `cgstRate`: BigDecimal
  - `sgstRate`: BigDecimal
  - `updatedAt`: Instant

### 3.3 Update Restaurant Settings: `PUT /api/v1/admin/settings`
- **Route**: `/admin/settings`
- **Method in `adminApi.js`**: `updateSettings(settingsData)`
- **Request Contract (`RestaurantSettingRequest`)**:
  - Requires all 16 fields in complete payload; updates `RestaurantSetting` entity and records an audit log event (`TAX_POLICY_CHANGED` if GST or tax rates changed; otherwise `SETTINGS_UPDATED`).

---

## 4. Field Mapping & UI Structure

### 4.1 Staff Account Provisioning Form
- **Form Fields**: Full Name, Login Username (monospace), Secret Password (with eye toggle), Role Selection (`ROLE_CASHIER` vs `ROLE_ADMIN`), Mandatory Company Card Verification Number, and Optional Phone.
- **Success View**:
  - Displays provisioned staff ID (`#id`), username, full name, role, and active status.
  - Hides/clears the password immediately upon submission to prevent plaintext leakage.
  - Masks company card number as `[Verified & Recorded]` for employee confidentiality.
  - Includes clear guidance that the staff member can now log in at `/admin/login` or the POS terminal.

### 4.2 Restaurant Settings Sections
1. **Section A: Restaurant Profile & Identity**:
   - `restaurantName` (Required)
   - `tagline` (Optional)
   - `address` (Required)
   - `phonePrimary` (Required)
   - `phoneSecondary` (Optional)
   - `whatsappNumber` (Required)
   - `email` (Optional)
   - `openingHours` (Required)
2. **Section B: Online & Social Presence**:
   - `googleMapsUrl` (Optional)
   - `instagramHandle` (Optional)
3. **Section C: Payment Gateway & UPI Configuration**:
   - `upiId` (Optional, e.g. `stationstories@upi`)
   - `currencySymbol` (Default `₹`)
4. **Section D: GST Regulatory & Tax Policy**:
   - `gstEnabled` toggle: When disabled, visually disables `gstin`, `cgstRate`, and `sgstRate` while preserving their values.
   - Confirmation dialog before enabling GST: Requires administrator to acknowledge GST registration requirements.
   - Real-time combined tax preview (`Total Tax = CGST + SGST`).
   - Immutable snapshot notice: Explicitly documents that saving settings applies solely to future bills and does not alter historical invoices.
5. **Transparent Placeholder Identification**:
   - Any field whose value includes `"[Pending Owner Confirmation..."` displays an amber `Pending Confirmation` pill badge so managers immediately spot unfinalized store data.

---

## 5. Validation & Security Behavior

1. **Role-Based Access Control**:
   - Both pages are protected under `ProtectedRoute.jsx` requiring an active session with `ROLE_ADMIN` authority.
   - Cashier accounts (`ROLE_CASHIER`) are blocked and redirected.
2. **Input Validation**:
   - Username: 3 to 50 characters, non-blank.
   - Password: Minimum 8 characters.
   - Company card number: Required, non-blank.
   - Mandatory settings: `restaurantName`, `address`, `phonePrimary`, `whatsappNumber`, and `openingHours` cannot be empty.
   - Tax rates: CGST and SGST rates reject negative values.
3. **Data Sanitization**:
   - Zero hardcoded credentials or passwords stored in browser storage.
   - Passwords and company card numbers are never printed to the browser console.
   - Submit buttons are locked during in-flight requests to eliminate duplicate submissions.

---

## 6. Build Output

Execution of `npm run build` in `frontend/`:
```
vite v5.4.21 building for production...
✓ 2147 modules transformed.
dist/index.html                          1.40 kB │ gzip:   0.69 kB
dist/assets/index-BaaO1l7R.css          60.97 kB │ gzip:  10.28 kB
dist/assets/vendor-icons-DtT6x9Ke.js    39.44 kB │ gzip:   8.05 kB
dist/assets/vendor-motion-DWkJKsgf.js  143.66 kB │ gzip:  48.67 kB
dist/assets/vendor-react-BRkJHJC4.js   163.87 kB │ gzip:  53.42 kB
dist/assets/index-BV6pGRD4.js          425.42 kB │ gzip: 103.89 kB
✓ built in 1.40s
```
**Result**: Build succeeded with **0 errors and 0 warnings**.

---

## 7. Tests Performed & Not Performed

### 7.1 Tests Performed
1. **Frontend Production Build**: Verified zero compilation, syntax, or typing errors.
2. **Admin Authentication**: Verified JWT bearer token generation via `POST /api/v1/auth/login` (`200 OK`).
3. **Settings Contract Inspection**: Verified `GET /api/v1/admin/settings` returns all 17 expected fields matching `RestaurantSettingResponse` with 100% field parity (`200 OK`).
4. **Staff Input Validation Rejection**: Dispatched an invalid staff registration payload (short password, missing company card, invalid role) to `POST /api/v1/admin/users/staff` and confirmed the backend properly rejected it with HTTP 400 Bad Request.
5. **Phase 3 Public Website Compatibility**: Verified public endpoints (`/restaurant-info`, `/categories`, `/menu`) remain completely operational with zero regression.

### 7.2 Tests NOT Performed & Justification
- **Live Staff Account Creation**: **NOT PERFORMED**.
  - **Reason**: Per user prompt (*"For POST staff and PUT settings live API tests, use only a disposable development database and explicitly designated test data. Do not create real staff accounts or overwrite actual restaurant settings for testing"*), creating persistent staff accounts in the active database was avoided to prevent credential pollution.
- **Live Settings Overwrite**: **NOT PERFORMED**.
  - **Reason**: Calling `PUT /api/v1/admin/settings` permanently mutates the restaurant's stored configuration and triggers an audit log event (`TAX_POLICY_CHANGED` or `SETTINGS_UPDATED`). In accordance with testing constraints, settings were inspected via read-only GET without destructive overwrites.

---

## 8. Known Backend Limitations

1. **Staff Management Scope**: The backend supports staff account creation only (`POST /api/v1/admin/users/staff`). There is no endpoint for listing existing staff accounts, editing staff details, resetting passwords, or deactivating accounts. The UI clearly communicates this limitation to administrators.
2. **Single-Store Settings Record**: The backend persists a single configuration record (`ID: 1L`). Multi-location or branch-level configuration is not supported.
3. **Placeholder Values**: When unconfigured, the backend returns default placeholders (e.g. `"[Pending Owner Confirmation]"`). The frontend displays these transparently with visual indicator badges so management can replace them at their convenience.

---

## 9. Next Steps

Phase 4.6 is complete. In accordance with project instructions, we have stopped here and are ready for **Phase 4.7 (Audit Logs & Daily Sales Reporting)** upon your authorization.
