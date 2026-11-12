# The Station Stories – Restaurant Management Platform

> **Official Restaurant Platform**: The Station Stories  
> **Repository**: [https://github.com/SAhil-1436/the-station-stories](https://github.com/SAhil-1436/the-station-stories)  
> **Architecture**: Modular Monolith (Spring Boot 3.3.x REST API + React 18 Vite Single Page Application)  
> **Database**: MySQL 8 (`the_station_stories`) managed via Flyway migrations

---

## 1. System Requirements & Prerequisites

Ensure the following tools are installed on your workstation:
- **Operating System**: macOS, Linux, or Windows 11
- **Java**: OpenJDK 21 LTS (or compatible Homebrew OpenJDK 26)
- **Maven**: Apache Maven 3.9+
- **Node.js**: Node.js v20+ or v26+ with npm v10+
- **Database**: MySQL 8.0+ (MySQL 9.x supported)

---

## 2. Project Directory Structure

```
The-Station-Stories/
├── backend/                   # Spring Boot 3.3 (Java 21, Maven)
│   ├── pom.xml
│   └── src/
│       ├── main/java/com/stationstories/
│       │   ├── config/        # SecurityConfig, CorsConfig, OpenApiConfig
│       │   ├── common/        # ApiResponse, HealthResponse
│       │   ├── exception/     # GlobalExceptionHandler, ErrorResponse
│       │   ├── controller/    # HealthController (GET /api/health)
│       │   ├── service/       # HealthService
│       │   ├── repository/    # JPA Repositories
│       │   ├── entity/        # JPA Entities
│       │   ├── dto/           # Data Transfer Objects
│       │   └── mapper/        # Object Mappers
│       └── main/resources/
│           ├── application.yml
│           └── db/migration/  # Flyway SQL migrations (V1__init_schema.sql)
├── frontend/                  # React 18 + Vite + Tailwind CSS SPA
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── public/
│   │   └── images/
│   │       ├── restaurant/    # Optimized authentic restaurant photographs
│   │       ├── food/          # Temporary licensed food stock photos
│   │       └── branding/      # Vector logos and signage
│   └── src/
│       ├── components/        # Navbar, HealthStatusBanner, LanguageToggle
│       ├── layouts/           # CustomerLayout, AdminLayout, PosLayout
│       ├── pages/             # HomePage, AdminLoginPage, AdminDashboardPage, PosPage
│       ├── routes/            # AppRoutes.jsx
│       ├── services/          # api.js (Axios centralized client)
│       ├── styles/            # index.css (Tailwind & @media print)
│       └── i18n/              # English & Hindi translation dictionaries
├── documentation/             # Phase 0 architectural blueprints and plans
├── referance-assets/          # Original master photographs (strictly preserved)
├── .env.example               # Environment variables template
├── .gitignore                 # Secret protection and build exclusions
└── README.md                  # Project overview and setup guide
```

---

## 3. Database Setup (MySQL 8)

1. Connect to MySQL:
```bash
mysql -u root -p
```

2. Create the database:
```sql
CREATE DATABASE IF NOT EXISTS the_station_stories
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

---

## 4. Environment Variables Configuration

Copy `.env.example` to create your local `.env` file (never commit `.env`):
```bash
cp .env.example .env
```

Set your local database password in `.env`:
```ini
DB_HOST=localhost
DB_PORT=3306
DB_NAME=the_station_stories
DB_USERNAME=root
DB_PASSWORD=your_actual_mysql_password
```

---

## 5. Starting the Backend

From the project root:
```bash
export JAVA_HOME=/opt/homebrew/opt/openjdk  # (or path to your JDK 21+)
cd backend
mvn clean spring-boot:run
```

The Spring Boot backend will:
1. Connect to MySQL database `the_station_stories`.
2. Execute Flyway migration `V1__init_schema.sql`.
3. Start Tomcat server on port **8080**.

### Verify Backend Health
```bash
curl http://localhost:8080/api/health
```

Expected JSON response:
```json
{
  "success": true,
  "message": "Backend system is operational",
  "data": {
    "status": "UP",
    "appName": "The Station Stories",
    "version": "1.0.0",
    "phase": "Phase 1 - Project Foundation & Environment Setup",
    "databaseStatus": "CONNECTED",
    "databaseName": "the_station_stories"
  }
}
```

### Swagger API Documentation
Open your browser at:
`http://localhost:8080/swagger-ui.html`

---

## 6. Starting the Frontend

From the project root in a separate terminal:
```bash
cd frontend
npm install
npm run dev
```

The Vite development server will start at:
`http://localhost:5173/`

### Frontend Routes Available (Phase 3 Customer Experience)
- `/`: Premium Customer Website Homepage (Hero, 4 Pillars, Story, Featured Menu, 6-photo Ambience Showcase, Visit Us).
- `/menu`: Full Digital Menu with category tabs, search, veg toggle, and dish cards with `[Representative Image]` badges.
- `/qr-menu`: Touch-optimized Table/Cabin QR digital browsing menu with cabin selector and captain call alert (browsing only, no checkout).
- `/gallery`: High-resolution gallery with all 13 authentic photos categorized and interactive Lightbox modal.
- `/about`: Brand story, railway heritage narrative, and authentic interior/signage highlights.
- `/contact`: Operating hours (`11:00 AM – 11:00 PM`), inquiry reservation form, and direct WhatsApp chat.
- `/bill/view/:uuid`: Public digital invoice view with 80mm/58mm thermal receipt layout and browser print support.
- `/admin/login`: Discreet staff portal login (accessible via footer link only).

---

## 7. Dual-Language Support (i18n)

Click the language button in the navigation header to toggle dynamically between **English** and **हिंदी (Hindi)**.

---

## 8. Development Rules & Security

- **Original Master Photos**: Master images inside `referance-assets/` are permanent records and must never be altered or renamed.
- **Tax Policy**: GST calculation is **strictly disabled by default (0.00% tax)** until confirmed by the owner.
- **Secrets Protection**: Credentials and JWT secrets are injected via environment variables and excluded from Git commits via `.gitignore`.
