-- notifications を write-time aggregate 形にリライト。dev のため既存 event 行は破棄。
PRAGMA foreign_keys=OFF;--> statement-breakpoint
DROP TABLE `notifications`;--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`recipient_id` text NOT NULL,
	`kind` text NOT NULL,
	`object_id` text,
	`actor_ids` text NOT NULL,
	`count` integer DEFAULT 1 NOT NULL,
	`is_read` integer DEFAULT false NOT NULL,
	`first_at` text DEFAULT (current_timestamp) NOT NULL,
	`last_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`recipient_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);--> statement-breakpoint
PRAGMA foreign_keys=ON;
