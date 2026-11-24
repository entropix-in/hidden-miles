CREATE TABLE `discount_tours` (
	`discount_id` bigint unsigned NOT NULL,
	`tour_id` bigint unsigned NOT NULL,
	CONSTRAINT `discount_tours_discount_id_tour_id_pk` PRIMARY KEY(`discount_id`,`tour_id`)
);
--> statement-breakpoint
CREATE TABLE `discounts` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`name` varchar(120) NOT NULL,
	`code` varchar(40),
	`kind` enum('percent','fixed') NOT NULL DEFAULT 'percent',
	`value` int unsigned NOT NULL,
	`max_amount` int unsigned,
	`scope` enum('all','selected') NOT NULL DEFAULT 'all',
	`min_travellers` int unsigned NOT NULL DEFAULT 1,
	`starts_on` date,
	`ends_on` date,
	`usage_limit` int unsigned,
	`active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `discounts_id` PRIMARY KEY(`id`),
	CONSTRAINT `uniq_discounts_code` UNIQUE(`code`)
);
--> statement-breakpoint
ALTER TABLE `bookings` ADD `city` varchar(120);--> statement-breakpoint
ALTER TABLE `bookings` ADD `addons` json;--> statement-breakpoint
ALTER TABLE `bookings` ADD `discount_id` bigint unsigned;--> statement-breakpoint
ALTER TABLE `bookings` ADD `discount_name` varchar(120);--> statement-breakpoint
ALTER TABLE `bookings` ADD `discount_code` varchar(40);--> statement-breakpoint
ALTER TABLE `bookings` ADD `discount_amount` int unsigned DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `tours` ADD `addons` json;--> statement-breakpoint
ALTER TABLE `discount_tours` ADD CONSTRAINT `discount_tours_discount_id_discounts_id_fk` FOREIGN KEY (`discount_id`) REFERENCES `discounts`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `discount_tours` ADD CONSTRAINT `discount_tours_tour_id_tours_id_fk` FOREIGN KEY (`tour_id`) REFERENCES `tours`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `idx_discount_tours_tour` ON `discount_tours` (`tour_id`);--> statement-breakpoint
CREATE INDEX `idx_bookings_discount` ON `bookings` (`discount_id`);