-- Migration V4: Add Bill Idempotency Key and Bill Operations Table for Reliable POS Reconciliation

-- 1. Add unique idempotency_key to bills table
ALTER TABLE bills ADD COLUMN idempotency_key VARCHAR(100) NULL UNIQUE AFTER invoice_uuid;

-- 2. Create bill_operations table for atomic lifecycle tracking & safe reconciliation
CREATE TABLE IF NOT EXISTS bill_operations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    operation_key VARCHAR(100) NOT NULL UNIQUE,
    cashier_id BIGINT NOT NULL,
    bill_id BIGINT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PROCESSING',
    error_message VARCHAR(500) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_bill_operations_cashier FOREIGN KEY (cashier_id) REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT fk_bill_operations_bill FOREIGN KEY (bill_id) REFERENCES bills (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_bill_operations_key ON bill_operations (operation_key);
CREATE INDEX idx_bill_operations_cashier ON bill_operations (cashier_id);
