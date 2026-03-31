CREATE TABLE `analysisJobs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`type` enum('context','competitors','territories','brief','full') NOT NULL,
	`status` enum('pending','running','completed','failed') NOT NULL DEFAULT 'pending',
	`progress` int DEFAULT 0,
	`progressMessage` varchar(500),
	`result` text,
	`error` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `analysisJobs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `briefs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`overallScore` int,
	`scoreExplanation` text,
	`executiveSummary` text,
	`marketPosition` text,
	`competitiveAdvantages` json,
	`strategicRecommendations` json,
	`riskFactors` json,
	`opportunities` json,
	`isPublic` boolean DEFAULT false,
	`publicSlug` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `briefs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `competitors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`url` varchar(2048),
	`description` text,
	`threatScore` int,
	`threatLevel` enum('critical','high','moderate','low') DEFAULT 'moderate',
	`funding` varchar(255),
	`founded` varchar(50),
	`employees` varchar(100),
	`headquarters` varchar(255),
	`strengths` json,
	`weaknesses` json,
	`keyDifferentiators` json,
	`overlapAreas` json,
	`isManual` boolean DEFAULT false,
	`aiAnalysis` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `competitors_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`url` varchar(2048) NOT NULL,
	`description` text,
	`region` varchar(100) DEFAULT 'Global',
	`industry` varchar(255),
	`status` enum('draft','analyzing','ready','error') NOT NULL DEFAULT 'draft',
	`step` enum('define','discover','brief') NOT NULL DEFAULT 'define',
	`contextSummary` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `territories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`type` enum('owned','unoccupied','contested','indefensible') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`evidence` text,
	`competitors` json,
	`strength` int,
	`opportunity` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `territories_id` PRIMARY KEY(`id`)
);
