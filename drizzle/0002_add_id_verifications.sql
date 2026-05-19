CREATE TABLE `idVerifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`idNumber` varchar(255) NOT NULL,
	`dateOfBirth` varchar(10) NOT NULL,
	`selfieUrl` text NOT NULL,
	`idPhotoUrl` text,
	`facialMatchScore` int DEFAULT 0,
	`facialMatchStatus` enum('high_confidence','manual_review','rejected') DEFAULT 'rejected',
	`idTypeDetected` varchar(50),
	`idValidityScore` int DEFAULT 0,
	`idExpirationValid` boolean DEFAULT false,
	`staffReviewedBy` int,
	`staffReviewNotes` text,
	`staffDecision` enum('approved','rejected','needs_new_selfie'),
	`staffDecisionReason` text,
	`verificationStatus` enum('pending','approved','rejected') DEFAULT 'pending',
	`nameMatchesId` boolean DEFAULT true,
	`dobMatchesId` boolean DEFAULT true,
	`isIdDuplicate` boolean DEFAULT false,
	`auditLog` json,
	`createdAt` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`reviewedAt` timestamp,
	`expiresAt` timestamp,
	`updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `idVerifications_id` PRIMARY KEY (`id`),
	CONSTRAINT `idVerifications_userId_unique` UNIQUE KEY (`userId`)
);
--> statement-breakpoint
CREATE INDEX `userId_idx` ON `idVerifications` (`userId`);
--> statement-breakpoint
CREATE INDEX `verificationStatus_idx` ON `idVerifications` (`verificationStatus`);
--> statement-breakpoint
CREATE INDEX `facialMatchStatus_idx` ON `idVerifications` (`facialMatchStatus`);
