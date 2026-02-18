CREATE TABLE `bookings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`carId` int NOT NULL,
	`travelerId` int NOT NULL,
	`renterId` int NOT NULL,
	`startDate` datetime NOT NULL,
	`endDate` datetime NOT NULL,
	`totalDays` int NOT NULL,
	`dailyRate` decimal(10,2) NOT NULL,
	`totalCost` decimal(10,2) NOT NULL,
	`depositAmount` decimal(10,2),
	`paymentStatus` enum('pending','completed','refunded') DEFAULT 'pending',
	`stripePaymentId` varchar(255),
	`status` enum('pending','confirmed','completed','cancelled') DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bookings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `carAvailability` (
	`id` int AUTO_INCREMENT NOT NULL,
	`carId` int NOT NULL,
	`date` datetime NOT NULL,
	`isAvailable` boolean DEFAULT true,
	`bookedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `carAvailability_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cars` (
	`id` int AUTO_INCREMENT NOT NULL,
	`renterId` int NOT NULL,
	`make` varchar(100) NOT NULL,
	`model` varchar(100) NOT NULL,
	`year` int NOT NULL,
	`licensePlate` varchar(50) NOT NULL,
	`vin` varchar(100),
	`seats` int NOT NULL,
	`transmission` enum('manual','automatic') DEFAULT 'automatic',
	`fuelType` enum('gasoline','diesel','electric','hybrid'),
	`mileage` int,
	`dailyRate` decimal(10,2) NOT NULL,
	`location` varchar(255) NOT NULL,
	`locationCoords` json,
	`photos` json,
	`features` json,
	`status` enum('available','unavailable','maintenance') DEFAULT 'available',
	`isVerified` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cars_id` PRIMARY KEY(`id`),
	CONSTRAINT `cars_licensePlate_unique` UNIQUE(`licensePlate`)
);
--> statement-breakpoint
CREATE TABLE `emergencyContacts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`phone` varchar(20) NOT NULL,
	`email` varchar(320),
	`relationship` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `emergencyContacts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `geofences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tripId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`latitude` decimal(10,8) NOT NULL,
	`longitude` decimal(11,8) NOT NULL,
	`radius` int NOT NULL,
	`alertType` enum('entry','exit','both') DEFAULT 'both',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `geofences_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`senderId` int NOT NULL,
	`recipientId` int NOT NULL,
	`tripId` int,
	`bookingId` int,
	`content` text NOT NULL,
	`messageType` enum('text','image','location') DEFAULT 'text',
	`isRead` boolean DEFAULT false,
	`readAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`notificationType` enum('booking_confirmation','trip_update','safety_alert','match_notification','message','review','payment') NOT NULL,
	`relatedId` int,
	`isRead` boolean DEFAULT false,
	`readAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`bookingId` int,
	`tripId` int,
	`amount` decimal(10,2) NOT NULL,
	`currency` varchar(3) DEFAULT 'USD',
	`paymentMethod` enum('stripe','bank_transfer','wallet') DEFAULT 'stripe',
	`stripePaymentIntentId` varchar(255),
	`status` enum('pending','completed','failed','refunded') DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reportedUsers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reporterId` int NOT NULL,
	`reportedUserId` int NOT NULL,
	`reason` varchar(255) NOT NULL,
	`description` text,
	`status` enum('pending','investigating','resolved','dismissed') DEFAULT 'pending',
	`adminNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reportedUsers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reviewerId` int NOT NULL,
	`revieweeId` int NOT NULL,
	`tripId` int,
	`bookingId` int,
	`rating` tinyint NOT NULL,
	`title` varchar(255),
	`comment` text,
	`reviewType` enum('traveler','car_renter','car'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tripCheckIns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tripId` int NOT NULL,
	`userId` int NOT NULL,
	`latitude` decimal(10,8) NOT NULL,
	`longitude` decimal(11,8) NOT NULL,
	`status` enum('safe','unsafe','emergency') DEFAULT 'safe',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tripCheckIns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tripMembers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tripId` int NOT NULL,
	`userId` int NOT NULL,
	`status` enum('pending','accepted','rejected','cancelled') DEFAULT 'pending',
	`costShare` decimal(10,2),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tripMembers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `trips` (
	`id` int AUTO_INCREMENT NOT NULL,
	`creatorId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`origin` varchar(255) NOT NULL,
	`destination` varchar(255) NOT NULL,
	`originCoords` json,
	`destinationCoords` json,
	`departureDate` datetime NOT NULL,
	`returnDate` datetime,
	`tripType` enum('carpool','buddy_matching','both') DEFAULT 'buddy_matching',
	`interests` json,
	`budget` varchar(50),
	`seatsAvailable` int,
	`costPerSeat` decimal(10,2),
	`status` enum('draft','active','completed','cancelled') DEFAULT 'active',
	`isGeofenced` boolean DEFAULT false,
	`geofenceRadius` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `trips_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `trustedContacts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`trustedUserId` int NOT NULL,
	`status` enum('pending','accepted','blocked') DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `trustedContacts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','traveler','car_renter') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(20);--> statement-breakpoint
ALTER TABLE `users` ADD `profilePhotoUrl` text;--> statement-breakpoint
ALTER TABLE `users` ADD `bio` text;--> statement-breakpoint
ALTER TABLE `users` ADD `isVerified` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `users` ADD `verificationBadge` enum('none','id_verified','phone_verified','premium') DEFAULT 'none';--> statement-breakpoint
ALTER TABLE `users` ADD `averageRating` decimal(3,2) DEFAULT '0.00';--> statement-breakpoint
ALTER TABLE `users` ADD `totalReviews` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `users` ADD `travelPreferences` json;--> statement-breakpoint
ALTER TABLE `users` ADD `travelHistory` json;--> statement-breakpoint
ALTER TABLE `users` ADD `companyName` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `businessLicense` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `bankAccount` varchar(255);