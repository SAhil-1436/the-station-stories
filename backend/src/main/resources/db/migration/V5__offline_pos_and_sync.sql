-- Migration V5: Offline POS PWA Schema Extensions, Device Registry, and Sync Metadata

-- 1. Add offline synchronization columns to bills table
ALTER TABLE bills 
    ADD COLUMN local_bill_reference VARCHAR(100) NULL AFTER idempotency_key,
    ADD COLUMN device_id VARCHAR(100) NULL AFTER local_bill_reference,
    ADD COLUMN is_offline_created BOOLEAN NOT NULL DEFAULT FALSE AFTER device_id,
    ADD COLUMN synced_at TIMESTAMP NULL AFTER is_offline_created;

CREATE INDEX idx_bills_local_bill_ref ON bills (local_bill_reference);
CREATE INDEX idx_bills_device_id ON bills (device_id);

-- 2. Add device_id to bill_operations table
ALTER TABLE bill_operations
    ADD COLUMN device_id VARCHAR(100) NULL AFTER cashier_id;

CREATE INDEX idx_bill_operations_device_id ON bill_operations (device_id);

-- 3. Create pos_devices registry for device enrollment & offline lease binding
CREATE TABLE IF NOT EXISTS pos_devices (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    device_id VARCHAR(100) NOT NULL UNIQUE,
    device_name VARCHAR(150) NOT NULL,
    registered_by BIGINT NOT NULL,
    is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
    revoked_at TIMESTAMP NULL,
    last_seen_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_pos_devices_user FOREIGN KEY (registered_by) REFERENCES users (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_pos_devices_device_id ON pos_devices (device_id);
CREATE INDEX idx_pos_devices_status ON pos_devices (is_revoked);
