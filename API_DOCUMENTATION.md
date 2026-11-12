# THE STATION STORIES – REST API Documentation

## 1. Specification Overview

- **Base URL**: `/api/v1`
- **Protocol**: HTTPS / REST
- **Payload Format**: `application/json;charset=UTF-8`
- **Authentication**: Bearer Token in `Authorization` header (`Bearer <JWT_TOKEN>`)

### Standard Response Envelope
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "timestamp": "2026-11-12T10:30:00Z"
}
```

### Standard Error Envelope
```json
{
  "success": false,
  "message": "Validation failed on incoming request",
  "errorCode": "VALIDATION_ERROR",
  "errors": [
    {
      "field": "phone",
      "rejectedValue": "123",
      "reason": "Phone number must be exactly 10 digits when provided"
    }
  ],
  "timestamp": "2026-11-12T10:30:00Z"
}
```

---

## 2. Authentication Endpoints (`/api/v1/auth`)

### `POST /api/v1/auth/login`
Authenticates credentials and issues a signed JWT token.
- **Access**: Public (Protected by in-memory rate limiting: 5 attempts/minute/IP)
- **Response Headers**:
  - `X-RateLimit-Remaining`: Remaining attempts before temporary block
- **Request Body**:
```json
{
  "username": "admin",
  "password": "SecurePassword123"
}
```
- **Response `200 OK`**:
```json
{
  "success": true,
  "message": "Authentication successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": 28800,
    "user": {
      "id": 1,
      "username": "admin",
      "fullName": "Restaurant Manager",
      "role": "ROLE_ADMIN"
    }
  }
}
```

### `GET /api/v1/auth/me`
Retrieves current user identity and permissions from token claims.
- **Access**: Authenticated (`ROLE_ADMIN`, `ROLE_CASHIER`)

---

## 3. Public Customer Endpoints (`/api/v1/public`)

### `GET /api/v1/public/restaurant-info`
Retrieves verified public brand details and settings. Unconfirmed fields return explicit placeholders.
- **Access**: Public
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "restaurantName": "THE STATION STORIES",
    "tagline": "Fast Food & Restaurant",
    "address": "[Pending Owner Confirmation - Placeholder Address]",
    "phonePrimary": "[Pending Owner Confirmation]",
    "whatsappNumber": "[Pending Owner Confirmation]",
    "email": "[Pending Owner Confirmation]",
    "gstEnabled": false,
    "currencySymbol": "₹",
    "openingHours": "[Pending Owner Confirmation]",
    "googleMapsUrl": "[Pending Owner Confirmation]",
    "instagramHandle": "[Pending Owner Confirmation]"
  }
}
```

### `GET /api/v1/public/categories`
Retrieves active food menu categories with display sequences.
- **Access**: Public
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "Burgers & Sandwiches", "hindiName": "बर्गर और सैंडविच", "iconName": "Sandwich", "displayOrder": 1, "itemCount": 4 },
    { "id": 2, "name": "Pizzas & Garlic Breads", "hindiName": "पिज़्ज़ा और गार्लिक ब्रेड", "iconName": "Pizza", "displayOrder": 2, "itemCount": 4 },
    { "id": 3, "name": "Chinese & Fast Food", "hindiName": "चाइनीज और फास्ट फूड", "iconName": "Utensils", "displayOrder": 3, "itemCount": 5 },
    { "id": 4, "name": "Beverages & Shakes", "hindiName": "पेय और शेक्स", "iconName": "Coffee", "displayOrder": 4, "itemCount": 4 },
    { "id": 5, "name": "Chaat & Quick Bites", "hindiName": "चाट और स्नैक्स", "iconName": "Sparkles", "displayOrder": 5, "itemCount": 3 }
  ]
}
```

### `GET /api/v1/public/menu`
Retrieves active food menu catalog with filtering parameters.
- **Access**: Public
- **Query Parameters**:
  - `categoryId` (optional): Filter by category ID.
  - `isVeg` (optional, boolean): Filter vegetarian dishes.
  - `search` (optional, string): Search by dish name or ingredient.
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": [
    {
      "id": 101,
      "categoryId": 1,
      "categoryName": "Burgers & Sandwiches",
      "name": "Station Veg Burger",
      "hindiName": "स्टेशन वेज बर्गर",
      "description": "Crispy vegetable patty, lettuce, tomatoes, and chef's signature railway sauce",
      "price": 89.00,
      "isVeg": true,
      "isAvailable": true,
      "imageUrl": "/images/food/temp-burger-classic.webp",
      "isOriginalImage": false,
      "spiceLevel": 1
    }
  ]
}
```

### `GET /api/v1/public/gallery`
Retrieves restaurant photographs categorized from original workspace assets.
- **Access**: Public
- **Query Parameters**:
  - `category` (optional): `INTERIOR`, `ENTRANCE`, `SEATING`, `LIGHTING`, `DECOR`, `BRAND`.
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Grand Dining Hall Overview",
      "category": "INTERIOR",
      "imageUrl": "/referance-assets/WhatsApp Image 2026-11-12 at 10.12.13.jpeg",
      "isOriginal": true,
      "displayOrder": 1
    }
  ]
}
```

### `GET /api/v1/public/bill/view/{uuid}`
Secure, unguessable public invoice endpoint for customer receipt viewing.
- **Access**: Public (Protected by cryptographically secure 128-bit UUIDv4)
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "billNumber": "TSS-20261112-0001",
    "invoiceUuid": "a8f3b9c2-5e1d-4f8a-9b7c-0e2d3c4b5a6f",
    "restaurantName": "THE STATION STORIES",
    "orderType": "DINE_IN",
    "cabinTableRef": "Cabin 1",
    "customerName": "Walk-in Customer",
    "createdAt": "2026-11-12T13:45:00Z",
    "items": [
      { "itemName": "Station Veg Burger", "unitPrice": 89.00, "quantity": 2, "subtotal": 178.00 }
    ],
    "subtotal": 178.00,
    "discountAmount": 0.00,
    "taxRate": 0.00,
    "totalTax": 0.00,
    "grandTotal": 178.00,
    "paymentMethod": "UPI",
    "paymentStatus": "PAID"
  }
}
```

---

## 4. POS Terminal Endpoints (`/api/v1/pos`)

### `GET /api/v1/pos/customers/lookup`
Instant 10-digit customer lookup for returning customer identification.
- **Access**: `ROLE_CASHIER`, `ROLE_ADMIN`
- **Query Parameters**: `phone=9876543210`
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "id": 45,
    "phone": "9876543210",
    "name": "Sahil Kumar",
    "visitCount": 5,
    "totalSpent": 2450.00,
    "lastVisitAt": "2026-11-10T19:30:00Z"
  }
}
```

### `POST /api/v1/pos/bills`
Authoritative bill creation with thread-safe sequence generation, transaction safety, and tax calculations.
- **Access**: `ROLE_CASHIER`, `ROLE_ADMIN`
- **Request Body**:
```json
{
  "orderType": "DINE_IN",
  "cabinTableRef": "Cabin 1",
  "customerPhone": "9876543210",
  "customerName": "Sahil Kumar",
  "paymentMethod": "UPI",
  "discountType": "FLAT",
  "discountValue": 20.00,
  "notes": "Less spicy",
  "items": [
    { "menuItemId": 101, "quantity": 2, "notes": "Extra crispy" }
  ]
}
```
*Note: `customerPhone` is completely optional. If omitted, `customerName` defaults to `'Walk-in Customer'`.*

- **Response `201 Created`**:
```json
{
  "success": true,
  "message": "Bill generated successfully",
  "data": {
    "id": 501,
    "billNumber": "TSS-20261112-0001",
    "invoiceUuid": "a8f3b9c2-5e1d-4f8a-9b7c-0e2d3c4b5a6f",
    "subtotal": 178.00,
    "discountAmount": 20.00,
    "taxRate": 0.00,
    "totalTax": 0.00,
    "grandTotal": 158.00,
    "paymentMethod": "UPI",
    "paymentStatus": "PAID",
    "whatsappDeliveryStatus": "WHATSAPP_LINK_PREPARED",
    "whatsAppShareUrl": "https://wa.me/919876543210?text=...",
    "publicInvoiceUrl": "https://thestationstories.com/bill/view/a8f3b9c2-5e1d-4f8a-9b7c-0e2d3c4b5a6f"
  }
}
```

### `PATCH /api/v1/pos/bills/{id}/whatsapp-status`
Updates WhatsApp delivery state machine upon cashier action.
- **Access**: `ROLE_CASHIER`, `ROLE_ADMIN`
- **Request Body**:
```json
{
  "status": "WHATSAPP_OPENED"
}
```

### `GET /api/v1/pos/bills/{id}/receipt`
Fetches structured receipt payload with thermal printer formatting instructions (80mm and 58mm modes).
- **Access**: `ROLE_CASHIER`, `ROLE_ADMIN`
- **Query Parameters**: `width=80mm` or `width=58mm`

---

## 5. Admin Management Endpoints (`/api/v1/admin`)

### Bill History, Cancellation & Audit
- `GET /api/v1/admin/bills`: Searchable historical invoices with date range, status (`PAID`, `CANCELLED`), and payment method filters.
- `POST /api/v1/admin/bills/{id}/cancel`: Authoritative cancellation workflow.
  - **Request Body**:
  ```json
  {
    "cancellationReason": "Customer changed mind before preparation",
    "refundAmount": 158.00
  }
  ```
- `GET /api/v1/admin/audit-logs`: Audit trail of cancellations, settings edits, and security events.

### Menu & Category Management
- `POST /api/v1/admin/categories` – Create food category.
- `PUT /api/v1/admin/categories/{id}` – Edit category.
- `POST /api/v1/admin/menu` – Add dish item.
- `PUT /api/v1/admin/menu/{id}` – Edit dish details or price (never impacts historical bills).
- `PATCH /api/v1/admin/menu/{id}/toggle-availability` – Instant in-stock/86 switch.

### Financial Analytics & Reports
- `GET /api/v1/admin/reports/dashboard` – Real-time today metrics (gross sales, cash vs UPI, order count).
- `GET /api/v1/admin/reports/daily?date=2026-11-12` – Daily hourly breakdown and cashier reconciliation.
- `GET /api/v1/admin/reports/monthly?year=2026&month=11` – Monthly aggregated financial summary.

### Store Settings & Dynamic Tax Controls
- `GET /api/v1/admin/settings` – Retrieve current settings.
- `PUT /api/v1/admin/settings` – Update settings (GST toggle, rates, UPI ID, contact details).
