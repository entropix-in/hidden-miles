-- Runs inside the database selected by MYSQL_DATABASE (safarnest by default).
CREATE TABLE IF NOT EXISTS enquiries (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    type VARCHAR(32) NOT NULL DEFAULT 'enquiry',
    name VARCHAR(120) NOT NULL,
    email VARCHAR(190) NOT NULL,
    phone VARCHAR(40) NULL,
    destination VARCHAR(80) NULL,
    travellers VARCHAR(20) NULL,
    travel_month VARCHAR(40) NULL,
    message TEXT NULL,
    tour VARCHAR(190) NULL,
    source VARCHAR(190) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_enquiries_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
