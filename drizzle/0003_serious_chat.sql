CREATE TABLE `media` (
	`id` text PRIMARY KEY NOT NULL,
	`uploader_id` text NOT NULL,
	`tweet_id` text,
	`r2_key` text NOT NULL,
	`mime_type` text NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`uploader_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tweet_id`) REFERENCES `tweets`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `media_r2_key_unique` ON `media` (`r2_key`);