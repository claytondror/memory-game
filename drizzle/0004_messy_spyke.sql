CREATE TABLE `leaderboard` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`totalGames` int NOT NULL DEFAULT 0,
	`gamesWon` int NOT NULL DEFAULT 0,
	`winRate` varchar(5) NOT NULL DEFAULT '0',
	`bestTime` int,
	`averageTime` int,
	`totalMoves` int NOT NULL DEFAULT 0,
	`averageMoves` varchar(10) NOT NULL DEFAULT '0',
	`totalScore` int NOT NULL DEFAULT 0,
	`highestScore` int NOT NULL DEFAULT 0,
	`lastGameAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `leaderboard_id` PRIMARY KEY(`id`),
	CONSTRAINT `leaderboard_userId_unique` UNIQUE(`userId`)
);
