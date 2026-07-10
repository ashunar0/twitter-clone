CREATE TABLE `mentions` (
	`tweet_id` text NOT NULL,
	`mentioned_user_id` text NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	PRIMARY KEY(`tweet_id`, `mentioned_user_id`),
	FOREIGN KEY (`tweet_id`) REFERENCES `tweets`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`mentioned_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
