import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  boolean,
  datetime,
  json,
  tinyint,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extended with role-specific fields for Traveler, Car Renter, and Admin.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "traveler", "car_renter"]).default("user").notNull(),
  
  // Profile information
  profilePhotoUrl: text("profilePhotoUrl"),
  bio: text("bio"),
  isVerified: boolean("isVerified").default(false),
  verificationBadge: mysqlEnum("verificationBadge", ["none", "id_verified", "phone_verified", "premium"]).default("none"),
  
  // Ratings and reviews
  averageRating: decimal("averageRating", { precision: 3, scale: 2 }).default("0.00"),
  totalReviews: int("totalReviews").default(0),
  
  // Traveler-specific
  travelPreferences: json("travelPreferences"), // { interests: [], budget: "", style: "" }
  travelHistory: json("travelHistory"), // Array of trip IDs
  
  // Car Renter-specific
  companyName: varchar("companyName", { length: 255 }),
  businessLicense: varchar("businessLicense", { length: 255 }),
  bankAccount: varchar("bankAccount", { length: 255 }),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Trips created by travelers for carpooling or buddy matching
 */
export const trips = mysqlTable("trips", {
  id: int("id").autoincrement().primaryKey(),
  creatorId: int("creatorId").notNull(),
  
  // Trip details
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  origin: varchar("origin", { length: 255 }).notNull(),
  destination: varchar("destination", { length: 255 }).notNull(),
  originCoords: json("originCoords"), // { lat: number, lng: number }
  destinationCoords: json("destinationCoords"), // { lat: number, lng: number }
  
  // Dates and times
  departureDate: datetime("departureDate").notNull(),
  returnDate: datetime("returnDate"),
  
  // Trip type and preferences
  tripType: mysqlEnum("tripType", ["carpool", "buddy_matching", "both"]).default("buddy_matching"),
  interests: json("interests"), // Array of tags: adventure, food, beach, hiking, budget, luxury
  budget: varchar("budget", { length: 50 }), // "budget", "moderate", "luxury"
  
  // Carpool specific
  seatsAvailable: int("seatsAvailable"),
  costPerSeat: decimal("costPerSeat", { precision: 10, scale: 2 }),
  
  // Status
  status: mysqlEnum("status", ["draft", "active", "completed", "cancelled"]).default("active"),
  isGeofenced: boolean("isGeofenced").default(false),
  geofenceRadius: int("geofenceRadius"), // in meters
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Trip = typeof trips.$inferSelect;
export type InsertTrip = typeof trips.$inferInsert;

/**
 * Cars listed by car renters
 */
export const cars = mysqlTable("cars", {
  id: int("id").autoincrement().primaryKey(),
  renterId: int("renterId").notNull(),
  
  // Vehicle information
  make: varchar("make", { length: 100 }).notNull(),
  model: varchar("model", { length: 100 }).notNull(),
  year: int("year").notNull(),
  licensePlate: varchar("licensePlate", { length: 50 }).notNull().unique(),
  vin: varchar("vin", { length: 100 }),
  
  // Specifications
  seats: int("seats").notNull(),
  transmission: mysqlEnum("transmission", ["manual", "automatic"]).default("automatic"),
  fuelType: mysqlEnum("fuelType", ["gasoline", "diesel", "electric", "hybrid"]),
  mileage: int("mileage"),
  
  // Rental details
  dailyRate: decimal("dailyRate", { precision: 10, scale: 2 }).notNull(),
  location: varchar("location", { length: 255 }).notNull(),
  locationCoords: json("locationCoords"), // { lat: number, lng: number }
  
  // Media
  photos: json("photos"), // Array of S3 URLs
  
  // Features
  features: json("features"), // Array: AC, GPS, WiFi, etc.
  
  // Status
  status: mysqlEnum("status", ["available", "unavailable", "maintenance"]).default("available"),
  isVerified: boolean("isVerified").default(false),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Car = typeof cars.$inferSelect;
export type InsertCar = typeof cars.$inferInsert;

/**
 * Bookings for car rentals
 */
export const bookings = mysqlTable("bookings", {
  id: int("id").autoincrement().primaryKey(),
  carId: int("carId").notNull(),
  travelerId: int("travelerId").notNull(),
  renterId: int("renterId").notNull(),
  
  // Booking details
  startDate: datetime("startDate").notNull(),
  endDate: datetime("endDate").notNull(),
  totalDays: int("totalDays").notNull(),
  
  // Pricing
  dailyRate: decimal("dailyRate", { precision: 10, scale: 2 }).notNull(),
  totalCost: decimal("totalCost", { precision: 10, scale: 2 }).notNull(),
  depositAmount: decimal("depositAmount", { precision: 10, scale: 2 }),
  
  // Payment
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "completed", "refunded"]).default("pending"),
  stripePaymentId: varchar("stripePaymentId", { length: 255 }),
  
  // Status
  status: mysqlEnum("status", ["pending", "confirmed", "completed", "cancelled"]).default("pending"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;

/**
 * Trip memberships - travelers joining trips
 */
export const tripMembers = mysqlTable("tripMembers", {
  id: int("id").autoincrement().primaryKey(),
  tripId: int("tripId").notNull(),
  userId: int("userId").notNull(),
  
  // Status
  status: mysqlEnum("status", ["pending", "accepted", "rejected", "cancelled"]).default("pending"),
  
  // Carpool cost split
  costShare: decimal("costShare", { precision: 10, scale: 2 }),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TripMember = typeof tripMembers.$inferSelect;
export type InsertTripMember = typeof tripMembers.$inferInsert;

/**
 * Messages for real-time chat
 */
export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  
  // Conversation participants
  senderId: int("senderId").notNull(),
  recipientId: int("recipientId").notNull(),
  
  // Context
  tripId: int("tripId"),
  bookingId: int("bookingId"),
  
  // Message content
  content: text("content").notNull(),
  messageType: mysqlEnum("messageType", ["text", "image", "location"]).default("text"),
  
  // Status
  isRead: boolean("isRead").default(false),
  readAt: timestamp("readAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

/**
 * Reviews and ratings
 */
export const reviews = mysqlTable("reviews", {
  id: int("id").autoincrement().primaryKey(),
  
  // Review parties
  reviewerId: int("reviewerId").notNull(),
  revieweeId: int("revieweeId").notNull(),
  
  // Context
  tripId: int("tripId"),
  bookingId: int("bookingId"),
  
  // Review content
  rating: tinyint("rating").notNull(), // 1-5
  title: varchar("title", { length: 255 }),
  comment: text("comment"),
  
  // Review type
  reviewType: mysqlEnum("reviewType", ["traveler", "car_renter", "car"]),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

/**
 * Emergency contacts for safety
 */
export const emergencyContacts = mysqlTable("emergencyContacts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  email: varchar("email", { length: 320 }),
  relationship: varchar("relationship", { length: 100 }),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EmergencyContact = typeof emergencyContacts.$inferSelect;
export type InsertEmergencyContact = typeof emergencyContacts.$inferInsert;

/**
 * Trusted contacts for trip sharing
 */
export const trustedContacts = mysqlTable("trustedContacts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  trustedUserId: int("trustedUserId").notNull(),
  
  status: mysqlEnum("status", ["pending", "accepted", "blocked"]).default("pending"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TrustedContact = typeof trustedContacts.$inferSelect;
export type InsertTrustedContact = typeof trustedContacts.$inferInsert;

/**
 * Geofence zones for location-based alerts
 */
export const geofences = mysqlTable("geofences", {
  id: int("id").autoincrement().primaryKey(),
  tripId: int("tripId").notNull(),
  
  name: varchar("name", { length: 255 }).notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }).notNull(),
  longitude: decimal("longitude", { precision: 11, scale: 8 }).notNull(),
  radius: int("radius").notNull(), // in meters
  
  alertType: mysqlEnum("alertType", ["entry", "exit", "both"]).default("both"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Geofence = typeof geofences.$inferSelect;
export type InsertGeofence = typeof geofences.$inferInsert;

/**
 * Notifications
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  
  notificationType: mysqlEnum("notificationType", [
    "booking_confirmation",
    "trip_update",
    "safety_alert",
    "match_notification",
    "message",
    "review",
    "payment",
  ]).notNull(),
  
  relatedId: int("relatedId"), // Trip ID, Booking ID, Message ID, etc.
  
  isRead: boolean("isRead").default(false),
  readAt: timestamp("readAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * Payment records
 */
export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  
  userId: int("userId").notNull(),
  bookingId: int("bookingId"),
  tripId: int("tripId"),
  
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD"),
  
  paymentMethod: mysqlEnum("paymentMethod", ["stripe", "bank_transfer", "wallet"]).default("stripe"),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
  
  status: mysqlEnum("status", ["pending", "completed", "failed", "refunded"]).default("pending"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

/**
 * Trip check-ins for safety
 */
export const tripCheckIns = mysqlTable("tripCheckIns", {
  id: int("id").autoincrement().primaryKey(),
  tripId: int("tripId").notNull(),
  userId: int("userId").notNull(),
  
  latitude: decimal("latitude", { precision: 10, scale: 8 }).notNull(),
  longitude: decimal("longitude", { precision: 11, scale: 8 }).notNull(),
  
  status: mysqlEnum("status", ["safe", "unsafe", "emergency"]).default("safe"),
  notes: text("notes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TripCheckIn = typeof tripCheckIns.$inferSelect;
export type InsertTripCheckIn = typeof tripCheckIns.$inferInsert;

/**
 * Reported users for moderation
 */
export const reportedUsers = mysqlTable("reportedUsers", {
  id: int("id").autoincrement().primaryKey(),
  
  reporterId: int("reporterId").notNull(),
  reportedUserId: int("reportedUserId").notNull(),
  
  reason: varchar("reason", { length: 255 }).notNull(),
  description: text("description"),
  
  status: mysqlEnum("status", ["pending", "investigating", "resolved", "dismissed"]).default("pending"),
  adminNotes: text("adminNotes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ReportedUser = typeof reportedUsers.$inferSelect;
export type InsertReportedUser = typeof reportedUsers.$inferInsert;

/**
 * Car availability calendar
 */
export const carAvailability = mysqlTable("carAvailability", {
  id: int("id").autoincrement().primaryKey(),
  carId: int("carId").notNull(),
  
  date: datetime("date").notNull(),
  isAvailable: boolean("isAvailable").default(true),
  bookedBy: int("bookedBy"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CarAvailability = typeof carAvailability.$inferSelect;
export type InsertCarAvailability = typeof carAvailability.$inferInsert;
