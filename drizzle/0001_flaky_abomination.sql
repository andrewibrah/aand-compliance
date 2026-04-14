CREATE TABLE `compliance_answers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`dealership_id` int NOT NULL,
	`section` int NOT NULL,
	`section_name` text NOT NULL,
	`answers` json NOT NULL,
	`score` int,
	`completed` int DEFAULT 0,
	`completed_at` timestamp,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `compliance_answers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dealerships` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`name` text NOT NULL,
	`address` text,
	`city` text,
	`state` varchar(2),
	`dms_vendor` varchar(64),
	`rooftop_count` int DEFAULT 1,
	`qualified_individual` text,
	`qi_email` varchar(320),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dealerships_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `generated_documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`dealership_id` int NOT NULL,
	`doc_type` varchar(64) NOT NULL,
	`version` int DEFAULT 1,
	`storage_path` text,
	`generated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `generated_documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`dealership_id` int NOT NULL,
	`stripe_customer_id` text,
	`stripe_subscription_id` text,
	`plan` varchar(64) DEFAULT 'free',
	`status` varchar(64) DEFAULT 'active',
	`current_period_end` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `compliance_answers` ADD CONSTRAINT `compliance_answers_dealership_id_dealerships_id_fk` FOREIGN KEY (`dealership_id`) REFERENCES `dealerships`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dealerships` ADD CONSTRAINT `dealerships_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `generated_documents` ADD CONSTRAINT `generated_documents_dealership_id_dealerships_id_fk` FOREIGN KEY (`dealership_id`) REFERENCES `dealerships`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `subscriptions` ADD CONSTRAINT `subscriptions_dealership_id_dealerships_id_fk` FOREIGN KEY (`dealership_id`) REFERENCES `dealerships`(`id`) ON DELETE no action ON UPDATE no action;