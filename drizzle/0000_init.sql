CREATE TABLE `destinations` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`slug` varchar(190) NOT NULL,
	`name` varchar(190) NOT NULL,
	`region` enum('India','International') NOT NULL DEFAULT 'India',
	`tagline` varchar(255) NOT NULL DEFAULT '',
	`description` text NOT NULL,
	`image` varchar(1000) NOT NULL,
	`best_time` varchar(190) NOT NULL DEFAULT '',
	`highlights` json NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `destinations_id` PRIMARY KEY(`id`),
	CONSTRAINT `uniq_destinations_slug` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `enquiries` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`type` varchar(32) NOT NULL DEFAULT 'enquiry',
	`name` varchar(120) NOT NULL,
	`email` varchar(190) NOT NULL,
	`phone` varchar(40) NOT NULL DEFAULT '',
	`destination` varchar(80),
	`travellers` varchar(20),
	`travel_month` varchar(40),
	`message` text,
	`tour` varchar(190),
	`source` varchar(190),
	`status` enum('new','contacted','closed') NOT NULL DEFAULT 'new',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `enquiries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `experiences` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`slug` varchar(190) NOT NULL,
	`title` varchar(190) NOT NULL,
	`short_title` varchar(120) NOT NULL,
	`description` text NOT NULL,
	`image` varchar(1000) NOT NULL,
	`icon` varchar(32) NOT NULL DEFAULT 'sparkles',
	`highlights` json NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `experiences_id` PRIMARY KEY(`id`),
	CONSTRAINT `uniq_experiences_slug` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`setting_key` varchar(64) NOT NULL,
	`seeded` tinyint NOT NULL DEFAULT 0,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `settings_setting_key` PRIMARY KEY(`setting_key`)
);
--> statement-breakpoint
CREATE TABLE `testimonials` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`name` varchar(190) NOT NULL,
	`city` varchar(120) NOT NULL DEFAULT '',
	`tour` varchar(190) NOT NULL DEFAULT '',
	`rating` tinyint unsigned NOT NULL DEFAULT 5,
	`quote` text NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `testimonials_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tours` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`slug` varchar(190) NOT NULL,
	`title` varchar(190) NOT NULL,
	`destination_slug` varchar(190) NOT NULL,
	`destination_name` varchar(190) NOT NULL,
	`region` enum('India','International') NOT NULL DEFAULT 'India',
	`experiences` json NOT NULL,
	`image` varchar(1000) NOT NULL,
	`nights` int unsigned NOT NULL DEFAULT 0,
	`days` int unsigned NOT NULL DEFAULT 1,
	`price` int unsigned NOT NULL DEFAULT 0,
	`old_price` int unsigned,
	`rating` decimal(2,1) NOT NULL DEFAULT '4.8',
	`reviews` int unsigned NOT NULL DEFAULT 0,
	`badge` varchar(80),
	`departure` varchar(190) NOT NULL DEFAULT '',
	`group_size` varchar(80) NOT NULL DEFAULT '',
	`summary` text NOT NULL,
	`highlights` json NOT NULL,
	`inclusions` json NOT NULL,
	`exclusions` json NOT NULL,
	`itinerary` json NOT NULL,
	`featured` tinyint NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tours_id` PRIMARY KEY(`id`),
	CONSTRAINT `uniq_tours_slug` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE INDEX `idx_enquiries_created_at` ON `enquiries` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_enquiries_status` ON `enquiries` (`status`);--> statement-breakpoint
CREATE INDEX `idx_tours_destination` ON `tours` (`destination_slug`);--> statement-breakpoint
CREATE INDEX `idx_tours_featured` ON `tours` (`featured`);