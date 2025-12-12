CREATE TABLE `card_images` (
	`id` int AUTO_INCREMENT NOT NULL,
	`frontImageUrl` text NOT NULL,
	`backImageUrl` text NOT NULL,
	`name` varchar(255) NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `card_images_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `game_moves` (
	`id` int AUTO_INCREMENT NOT NULL,
	`gameSessionId` int NOT NULL,
	`userId` int NOT NULL,
	`firstCardIndex` int NOT NULL,
	`secondCardIndex` int NOT NULL,
	`isMatch` boolean NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `game_moves_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `game_participants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`gameSessionId` int NOT NULL,
	`userId` int NOT NULL,
	`score` int NOT NULL DEFAULT 0,
	`pairsFound` int NOT NULL DEFAULT 0,
	`placement` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `game_participants_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `game_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`mode` enum('single','local','online') NOT NULL,
	`status` enum('active','completed','abandoned') NOT NULL DEFAULT 'active',
	`roomId` varchar(64),
	`totalMoves` int NOT NULL DEFAULT 0,
	`totalSeconds` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`completedAt` timestamp,
	CONSTRAINT `game_sessions_id` PRIMARY KEY(`id`)
);
