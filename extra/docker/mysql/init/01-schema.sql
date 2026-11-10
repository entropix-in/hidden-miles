-- Runs inside the database selected by MYSQL_DATABASE (hiddenmiles by default).

CREATE TABLE IF NOT EXISTS tours (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    slug VARCHAR(190) NOT NULL,
    title VARCHAR(190) NOT NULL,
    destination_slug VARCHAR(190) NOT NULL,
    destination_name VARCHAR(190) NOT NULL,
    region ENUM('India', 'International') NOT NULL DEFAULT 'India',
    experiences JSON NOT NULL,
    image VARCHAR(1000) NOT NULL,
    nights INT UNSIGNED NOT NULL DEFAULT 0,
    days INT UNSIGNED NOT NULL DEFAULT 1,
    price INT UNSIGNED NOT NULL DEFAULT 0,
    old_price INT UNSIGNED NULL,
    rating DECIMAL(2, 1) NOT NULL DEFAULT 4.8,
    reviews INT UNSIGNED NOT NULL DEFAULT 0,
    badge VARCHAR(80) NULL,
    departure VARCHAR(190) NOT NULL DEFAULT '',
    group_size VARCHAR(80) NOT NULL DEFAULT '',
    summary TEXT NOT NULL,
    highlights JSON NOT NULL,
    inclusions JSON NOT NULL,
    exclusions JSON NOT NULL,
    itinerary JSON NOT NULL,
    featured TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uniq_tours_slug (slug),
    KEY idx_tours_destination (destination_slug),
    KEY idx_tours_featured (featured)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS destinations (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    slug VARCHAR(190) NOT NULL,
    name VARCHAR(190) NOT NULL,
    region ENUM('India', 'International') NOT NULL DEFAULT 'India',
    tagline VARCHAR(255) NOT NULL DEFAULT '',
    description TEXT NOT NULL,
    image VARCHAR(1000) NOT NULL,
    best_time VARCHAR(190) NOT NULL DEFAULT '',
    highlights JSON NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uniq_destinations_slug (slug)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS experiences (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    slug VARCHAR(190) NOT NULL,
    title VARCHAR(190) NOT NULL,
    short_title VARCHAR(120) NOT NULL,
    description TEXT NOT NULL,
    image VARCHAR(1000) NOT NULL,
    icon VARCHAR(32) NOT NULL DEFAULT 'sparkles',
    highlights JSON NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uniq_experiences_slug (slug)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS testimonials (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(190) NOT NULL,
    city VARCHAR(120) NOT NULL DEFAULT '',
    tour VARCHAR(190) NOT NULL DEFAULT '',
    rating TINYINT UNSIGNED NOT NULL DEFAULT 5,
    quote TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS enquiries (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    type VARCHAR(32) NOT NULL DEFAULT 'enquiry',
    name VARCHAR(120) NOT NULL,
    email VARCHAR(190) NOT NULL,
    phone VARCHAR(40) NOT NULL DEFAULT '',
    destination VARCHAR(80) NULL,
    travellers VARCHAR(20) NULL,
    travel_month VARCHAR(40) NULL,
    message TEXT NULL,
    tour VARCHAR(190) NULL,
    source VARCHAR(190) NULL,
    status ENUM('new', 'contacted', 'closed') NOT NULL DEFAULT 'new',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_enquiries_created_at (created_at),
    KEY idx_enquiries_status (status)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS settings (
    setting_key VARCHAR(64) NOT NULL,
    seeded TINYINT(1) NOT NULL DEFAULT 0,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (setting_key)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
