CREATE TABLE `bookings` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`departure_id` bigint unsigned,
	`tour_slug` varchar(190) NOT NULL,
	`tour_title` varchar(190) NOT NULL DEFAULT '',
	`start_date` date,
	`name` varchar(120) NOT NULL,
	`email` varchar(190) NOT NULL,
	`phone` varchar(40) NOT NULL DEFAULT '',
	`travellers` int unsigned NOT NULL DEFAULT 1,
	`amount` int unsigned NOT NULL DEFAULT 0,
	`notes` text,
	`status` enum('pending','confirmed','cancelled') NOT NULL DEFAULT 'pending',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bookings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tour_departures` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`tour_slug` varchar(190) NOT NULL,
	`start_date` date NOT NULL,
	`price` int unsigned NOT NULL DEFAULT 0,
	`capacity` int unsigned NOT NULL DEFAULT 20,
	`note` varchar(190),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tour_departures_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `idx_bookings_tour` ON `bookings` (`tour_slug`);--> statement-breakpoint
CREATE INDEX `idx_bookings_departure` ON `bookings` (`departure_id`);--> statement-breakpoint
CREATE INDEX `idx_bookings_status` ON `bookings` (`status`);--> statement-breakpoint
CREATE INDEX `idx_departures_tour` ON `tour_departures` (`tour_slug`);--> statement-breakpoint
CREATE INDEX `idx_departures_start_date` ON `tour_departures` (`start_date`);