CREATE TABLE `game_rooms` (
	`id` int AUTO_INCREMENT NOT NULL,
	`roomCode` varchar(8) NOT NULL,
	`creatorId` int NOT NULL,
	`status` enum('waiting','playing','completed','abandoned') NOT NULL DEFAULT 'waiting',
	`maxPlayers` int NOT NULL DEFAULT 2,
	`currentPlayers` int NOT NULL DEFAULT 1,
	`gameSessionId` int,
	`expiresAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `game_rooms_id` PRIMARY KEY(`id`),
	CONSTRAINT `game_rooms_roomCode_unique` UNIQUE(`roomCode`)
);
