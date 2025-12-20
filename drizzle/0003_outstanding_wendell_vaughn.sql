CREATE TABLE `behavior` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`scroll` real NOT NULL,
	`time` real NOT NULL,
	`clicks` integer NOT NULL,
	`section` text
);
--> statement-breakpoint
ALTER TABLE `users` ADD `role` text DEFAULT 'user' NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` DROP COLUMN `created_at`;