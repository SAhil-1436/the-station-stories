-- ==============================================================================
-- THE STATION STORIES – Database Schema Migration (Phase 2)
-- Version: V2
-- Description: Core business tables, relations, constraints, and indexes
-- ==============================================================================

-- 1. Roles Table
CREATE TABLE IF NOT EXISTS roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NULL,
    company_card_number VARCHAR(50) NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. User Roles Mapping Table
CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    hindi_name VARCHAR(100) NULL,
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    icon_name VARCHAR(50) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Menu Items Table
CREATE TABLE IF NOT EXISTS menu_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_id BIGINT NOT NULL,
    name VARCHAR(150) NOT NULL,
    hindi_name VARCHAR(150) NULL,
    description TEXT NULL,
    price DECIMAL(10,2) NOT NULL,
    is_veg BOOLEAN NOT NULL DEFAULT TRUE,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    image_url VARCHAR(255) NULL,
    is_original_image BOOLEAN NOT NULL DEFAULT FALSE,
    spice_level INT NOT NULL DEFAULT 0,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_menu_items_category FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Customers Table
CREATE TABLE IF NOT EXISTS customers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    phone VARCHAR(15) NOT NULL UNIQUE,
    name VARCHAR(100) NULL,
    email VARCHAR(120) NULL,
    visit_count INT NOT NULL DEFAULT 1,
    total_spent DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    last_visit_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Bill Number Sequences Table (Thread-Safe Atomic Sequences)
CREATE TABLE IF NOT EXISTS bill_number_sequences (
    sequence_date DATE NOT NULL PRIMARY KEY,
    current_sequence INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Bills Table (Immutable Sales Ledger)
CREATE TABLE IF NOT EXISTS bills (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    bill_number VARCHAR(50) NOT NULL UNIQUE,
    invoice_uuid VARCHAR(64) NOT NULL UNIQUE,
    order_type VARCHAR(20) NOT NULL DEFAULT 'DINE_IN',
    cabin_table_ref VARCHAR(50) NULL,
    customer_id BIGINT NULL,
    customer_name_snapshot VARCHAR(100) NOT NULL DEFAULT 'Walk-in Customer',
    customer_phone_snapshot VARCHAR(15) NULL,
    cashier_id BIGINT NOT NULL,
    payment_method VARCHAR(20) NOT NULL DEFAULT 'CASH',
    subtotal DECIMAL(10,2) NOT NULL,
    discount_type VARCHAR(20) NOT NULL DEFAULT 'NONE',
    discount_value DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    tax_rate DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    cgst_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    sgst_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total_tax DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    grand_total DECIMAL(10,2) NOT NULL,
    payment_status VARCHAR(20) NOT NULL DEFAULT 'PAID',
    cancellation_reason VARCHAR(255) NULL,
    cancelled_by BIGINT NULL,
    cancelled_at TIMESTAMP NULL,
    refund_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    whatsapp_delivery_status VARCHAR(30) NOT NULL DEFAULT 'NOT_SENT',
    whatsapp_sent_at TIMESTAMP NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    notes TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_bills_customer FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE SET NULL,
    CONSTRAINT fk_bills_cashier FOREIGN KEY (cashier_id) REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT fk_bills_cancelled_by FOREIGN KEY (cancelled_by) REFERENCES users (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Bill Items Table (Frozen Item Snapshots)
CREATE TABLE IF NOT EXISTS bill_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    bill_id BIGINT NOT NULL,
    menu_item_id BIGINT NULL,
    item_name VARCHAR(150) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    subtotal DECIMAL(10,2) NOT NULL,
    notes VARCHAR(255) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_bill_items_bill FOREIGN KEY (bill_id) REFERENCES bills (id) ON DELETE RESTRICT,
    CONSTRAINT fk_bill_items_menu_item FOREIGN KEY (menu_item_id) REFERENCES menu_items (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    bill_id BIGINT NOT NULL,
    payment_method VARCHAR(20) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PAID',
    transaction_reference VARCHAR(100) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payments_bill FOREIGN KEY (bill_id) REFERENCES bills (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Audit Logs Table (Compliance & Event Tracking)
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    entity_name VARCHAR(50) NOT NULL,
    entity_id BIGINT NOT NULL,
    action VARCHAR(50) NOT NULL,
    performed_by BIGINT NULL,
    old_value TEXT NULL,
    new_value TEXT NULL,
    ip_address VARCHAR(45) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_logs_user FOREIGN KEY (performed_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Restaurant Settings Table (Singleton Configuration)
CREATE TABLE IF NOT EXISTS restaurant_settings (
    id BIGINT PRIMARY KEY DEFAULT 1,
    restaurant_name VARCHAR(150) NOT NULL DEFAULT 'THE STATION STORIES',
    tagline VARCHAR(255) NULL DEFAULT 'Fast Food & Restaurant',
    address TEXT NOT NULL,
    phone_primary VARCHAR(20) NOT NULL,
    phone_secondary VARCHAR(20) NULL,
    whatsapp_number VARCHAR(20) NOT NULL,
    email VARCHAR(120) NULL,
    gst_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    gstin VARCHAR(25) NULL,
    cgst_rate DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    sgst_rate DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    upi_id VARCHAR(100) NULL,
    currency_symbol VARCHAR(10) NOT NULL DEFAULT '₹',
    opening_hours VARCHAR(100) NOT NULL,
    google_maps_url TEXT NULL,
    instagram_handle VARCHAR(100) NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. Gallery Images Table
CREATE TABLE IF NOT EXISTS gallery_images (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_original BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- High-Performance Indexes
-- ==============================================================================

CREATE INDEX idx_customers_phone ON customers (phone);
CREATE INDEX idx_bills_created_at ON bills (created_at);
CREATE INDEX idx_bills_payment_status ON bills (payment_status);
CREATE INDEX idx_bills_payment_method ON bills (payment_method);
CREATE INDEX idx_bills_bill_number ON bills (bill_number);
CREATE INDEX idx_bills_invoice_uuid ON bills (invoice_uuid);
CREATE INDEX idx_bill_items_bill_id ON bill_items (bill_id);
CREATE INDEX idx_bill_items_menu_item_id ON bill_items (menu_item_id);
CREATE INDEX idx_menu_items_category_id ON menu_items (category_id);
CREATE INDEX idx_menu_items_is_available ON menu_items (is_available);
CREATE INDEX idx_categories_display_order ON categories (display_order);
CREATE INDEX idx_audit_logs_entity ON audit_logs (entity_name, entity_id);
CREATE INDEX idx_audit_logs_action ON audit_logs (action);
CREATE INDEX idx_payments_bill_id ON payments (bill_id);
