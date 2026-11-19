CREATE TABLE `user_sessions` (
	`id` varchar(64) NOT NULL,
	`user_id` bigint unsigned NOT NULL,
	`expires_at` timestamp NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`name` varchar(120) NOT NULL,
	`email` varchar(190) NOT NULL,
	`phone` varchar(40) NOT NULL DEFAULT '',
	`password_hash` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `uniq_users_email` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `bookings` ADD `user_id` bigint unsigned;--> statement-breakpoint
CREATE INDEX `idx_user_sessions_user` ON `user_sessions` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_user_sessions_expiry` ON `user_sessions` (`expires_at`);--> statement-breakpoint
CREATE INDEX `idx_bookings_user` ON `bookings` (`user_id`);