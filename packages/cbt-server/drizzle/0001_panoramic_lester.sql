RENAME TABLE `agenda_siswa` TO `acara_siswa`;--> statement-breakpoint
RENAME TABLE `agenda` TO `acara`;--> statement-breakpoint
DROP INDEX `agenda_idx` ON `acara_siswa`;--> statement-breakpoint
DROP INDEX `agenda_idx` ON `jadwal`;--> statement-breakpoint
ALTER TABLE `acara_siswa` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `acara` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `acara_siswa` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `acara` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `acara_siswa` RENAME COLUMN `agenda_id` TO `acara_id`;--> statement-breakpoint
ALTER TABLE `jadwal` RENAME COLUMN `agenda_id` TO `acara_id`;--> statement-breakpoint
CREATE INDEX `acara_idx` ON `acara_siswa` (`acara_id`);--> statement-breakpoint
CREATE INDEX `acara_idx` ON `jadwal` (`acara_id`);