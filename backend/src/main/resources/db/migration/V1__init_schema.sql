-- ==============================================================================
-- THE STATION STORIES – Initial Schema Baseline Migration (Phase 1)
-- Version: V1
-- ==============================================================================

CREATE TABLE IF NOT EXISTS app_metadata (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    property_key VARCHAR(100) NOT NULL UNIQUE,
    property_value VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO app_metadata (property_key, property_value)
VALUES
    ('app_name', 'The Station Stories'),
    ('schema_version', '1.0.0'),
    ('environment', 'development'),
    ('active_phase', 'Phase 1 - Foundation & Environment Setup')
ON DUPLICATE KEY UPDATE property_value = VALUES(property_value);
