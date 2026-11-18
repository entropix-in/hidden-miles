CREATE TABLE `photos` (
	`id` varchar(64) NOT NULL,
	`data` mediumblob NOT NULL,
	CONSTRAINT `photos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `destinations` ADD `content_blocks` json;--> statement-breakpoint
ALTER TABLE `experiences` ADD `content_blocks` json;--> statement-breakpoint
ALTER TABLE `tours` ADD `content_blocks` json;