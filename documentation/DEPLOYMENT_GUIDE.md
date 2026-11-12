# THE STATION STORIES – Deployment & Operations Guide

## 1. System Requirements & Prerequisites

### Server / Local Machine Environment
- **Operating System**: macOS, Linux (Ubuntu 22.04 LTS recommended), or Windows 11.
- **Java Runtime**: OpenJDK 21 LTS (or OpenJDK 26 runtime available via Homebrew/Eclipse Temurin).
- **Build Tool**: Apache Maven 3.9+.
- **Node.js**: Node.js v20+ or v26+ with npm v10+.
- **Database**: MySQL Server 8.0+ (MySQL 9.x fully supported).
- **Hardware Minimums**: 4 GB RAM, 2 CPU cores, 10 GB disk storage.

---

## 2. Database Initialization (`the_station_stories`)

1. Connect to MySQL CLI:
```bash
mysql -u root -p
```

2. Create the production database:
```sql
CREATE DATABASE IF NOT EXISTS the_station_stories
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Create dedicated application user
CREATE USER IF NOT EXISTS 'station_app_user'@'localhost' IDENTIFIED BY 'ChangeMeToAStrongPasswordInProd!';
GRANT ALL PRIVILEGES ON the_station_stories.* TO 'station_app_user'@'localhost';
FLUSH PRIVILEGES;
```

---

## 3. Backend Configuration & Startup

The backend is configured via environment variables or `application-prod.yml`.

### Environment Variables
| Variable | Description | Example / Default |
|---|---|---|
| `SPRING_DATASOURCE_URL` | JDBC Connection String | `jdbc:mysql://localhost:3306/the_station_stories?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true` |
| `SPRING_DATASOURCE_USERNAME` | MySQL Application User | `station_app_user` |
| `SPRING_DATASOURCE_PASSWORD` | MySQL Application Password | `[Injected via Environment - Never Committed]` |
| `SERVER_PORT` | Backend HTTP Port | `8080` |
| `JWT_SECRET` | 256-bit cryptographically secure key | `[Injected via Environment - 64+ char random string]` |
| `JWT_EXPIRATION_MS` | Access token lifespan | `28800000` (8 Hours) |
| `STATIONSTORIES_CORS_ORIGIN` | Frontend Whitelist Origin | `http://localhost:5173` (Dev) / `https://thestationstories.com` (Prod) |

### Secure Initial Admin Account Setup
- The system will **never** expose public admin registration endpoints.
- During initial bootstrap via Flyway (`V2__seed_initial_data.sql`), an initial administrative account is seeded with disabled state or a temporary hash that triggers a mandatory password reset upon initial login, or created through an interactive CLI runner:
```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.arguments="--setup-admin --username=admin --password=YourStrongPasswordHere"
```

---

## 4. Frontend Configuration & Startup

### Environment Variables (`frontend/.env`)
```ini
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_RESTAURANT_NAME="THE STATION STORIES"
VITE_DEFAULT_LANGUAGE="en"
```

### Development Execution
```bash
cd frontend
npm install
npm run dev
```
The Vite development server will start at `http://localhost:5173/`.

### Production Build
```bash
cd frontend
npm run build
```
Generates an optimized static bundle in `frontend/dist/`.

---

## 5. Thermal Receipt Printer Configuration (Laptop + USB Printer)

The counter setup consists of a laptop running the POS web application connected via USB to a thermal receipt printer.

### Capability A: Browser-Based Printing (Initial Implementation)
1. **Printer Connection**: Plug the USB thermal printer into the laptop. The operating system (macOS / Windows / Linux) will detect it as a standard printer.
2. **Browser Print Settings (Chrome / Edge / Firefox)**:
   - Open `/pos` in Google Chrome or Edge.
   - Execute a test bill print.
   - In the print dialog, select the thermal printer as Destination.
   - **Paper Size**:
     - For 80mm printers (3-inch): Choose `80mm x Receipt` (or `Roll Paper 80 x 297 mm`).
     - For 58mm printers (2-inch): Choose `58mm x Receipt`.
   - **Margins**: Set to **None**.
   - **Headers and Footers**: **Uncheck** (prevents URL and page numbers on receipts).
   - **Background Graphics**: **Check** (preserves restaurant branding dividers).
3. **One-Click Experience**: Once configured, the browser saves these parameters. Cashiers can click "Print Receipt" for instant output.

### Capability B: Direct USB Printing Bridge (Future Architecture)
- When the owner confirms the exact printer manufacturer and model, an optional lightweight background service (print bridge) can be run on the counter laptop.
- The POS web application will send raw ESC/POS commands directly to `http://localhost:9100/print` to bypass the browser dialog entirely.

---

## 6. WhatsApp Bill Delivery Operations

1. **Initial Mode: Manual Web Intent (Zero-Cost / Out of the Box)**:
   - Cashier clicks "Send WhatsApp" in the POS interface upon bill generation.
   - The browser opens WhatsApp Web or WhatsApp Desktop with the formatted receipt prefilled:
     ```
     *THE STATION STORIES*
     --------------------------------
     Bill No: TSS-20261112-0001
     Date: 12-Nov-2026 01:45 PM
     Customer: Rahul Sharma

     Items:
     1. Station Veg Burger x 2 = ₹178.00
     --------------------------------
     Subtotal: ₹178.00
     Grand Total: ₹178.00
     Paid via: UPI

     View your digital invoice:
     https://thestationstories.com/bill/view/a8f3b9c2-5e1d-4f8a-9b7c-0e2d3c4b5a6f

     Thank you for dining at The Station Stories!
     ```
   - Cashier hits Enter to send.
   - System updates delivery status to `WHATSAPP_OPENED`.

2. **Official Meta WhatsApp Cloud API Mode (Future Upgrade)**:
   - Set environment variables `WHATSAPP_API_TOKEN` and `WHATSAPP_PHONE_NUMBER_ID`.
   - Enables background automated delivery directly to customer phone numbers with official Meta delivery receipts.
