CREATE TABLE `pengerjaan_event` (
	`id` varchar(255) NOT NULL,
	`pengerjaan_id` varchar(255) NOT NULL,
	`event_type` varchar(255) NOT NULL,
	`payload` text NOT NULL,
	`created_at` datetime NOT NULL DEFAULT now(),
	CONSTRAINT `pengerjaan_event_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
RENAME TABLE `work_sessions` TO `pengerjaan`;
--> statement-breakpoint
RENAME TABLE `work_session_answers` TO `pengerjaan_jawaban`;
--> statement-breakpoint
RENAME TABLE `work_session_markers` TO `pengerjaan_marker`;
--> statement-breakpoint
ALTER TABLE `pengerjaan_jawaban` RENAME COLUMN `work_session_id` TO `pengerjaan_id`;
--> statement-breakpoint
ALTER TABLE `pengerjaan_marker` RENAME COLUMN `work_session_id` TO `pengerjaan_id`;
--> statement-breakpoint
DROP INDEX `work_session_idx` ON `pengerjaan_jawaban`;
--> statement-breakpoint
DROP INDEX `work_session_idx` ON `pengerjaan_marker`;
--> statement-breakpoint
CREATE INDEX `pengerjaan_idx` ON `pengerjaan_event` (`pengerjaan_id`);
--> statement-breakpoint
CREATE INDEX `pengerjaan_idx` ON `pengerjaan_jawaban` (`pengerjaan_id`);
--> statement-breakpoint
CREATE INDEX `pengerjaan_idx` ON `pengerjaan_marker` (`pengerjaan_id`);