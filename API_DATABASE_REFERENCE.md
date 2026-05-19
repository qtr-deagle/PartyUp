# PartyUp - API & Database Reference Guide
## May 2, 2026

---

## 📡 API ENDPOINTS

### **Authentication Endpoints**
```typescript
POST /api/auth.login
  Body: { email: string, password: string }
  Response: { userId, token, user }

POST /api/auth.register
  Body: { email, password, name, age, location, interests[] }
  Response: { userId, token, user }

POST /api/auth.logout
  Response: { success: boolean }

POST /api/auth.otp
  Body: { email }
  Response: { otpSent: boolean }

POST /api/auth.verifyOtp
  Body: { email, otp }
  Response: { verified: boolean }
```

### **User Profile Endpoints**
```typescript
GET /api/user.profile
  Response: { id, name, age, email, verified, trustScore, bio, location, interests[] }

PATCH /api/user.profile
  Body: { name?, age?, bio?, location?, travelStyle?, budget?, interests[]? }
  Response: { success: boolean, user }

POST /api/user.addContact
  Body: { name, phone, email, relationship }
  Response: { contactId, contact }

DELETE /api/user.removeContact
  Body: { contactId }
  Response: { success: boolean }

GET /api/user.contacts
  Response: { contacts[] }
```

### **Tours Endpoints**
```typescript
GET /api/tours.list
  Query: { destination?, searchTerm?, page }
  Response: { tours[], total }

POST /api/tours.create
  Body: { title, destination, startDate, duration, maxParticipants, price, interests[], itinerary[] }
  Response: { tourId, tour }

GET /api/tours.manage
  Response: { myTours[] }

PATCH /api/tours.update
  Body: { tourId, ...updates }
  Response: { tour }

DELETE /api/tours.delete
  Body: { tourId }
  Response: { success: boolean }

POST /api/tours.join
  Body: { tourId }
  Response: { success: boolean, tour }

POST /api/tours.favorite
  Body: { tourId }
  Response: { favorited: boolean }
```

### **Carpool Endpoints**
```typescript
GET /api/carpool.rides
  Query: { destination?, searchTerm?, page }
  Response: { rides[], total }

POST /api/carpool.create
  Body: { from, to, date, time, seats, description }
  Response: { rideId, ride }

POST /api/carpool.request
  Body: { rideId }
  Response: { success: boolean, bookingId }

PATCH /api/carpool.cancel
  Body: { bookingId }
  Response: { success: boolean }

GET /api/carpool.myRides
  Response: { activeRides[], completedRides[], pendingRequests[] }
```

### **Chat Endpoints**
```typescript
GET /api/chat.conversations
  Response: { conversations[] }

GET /api/chat.messages
  Query: { conversationId }
  Response: { messages[] }

POST /api/chat.send
  Body: { conversationId, message, type }
  Response: { messageId, message }

POST /api/chat.block
  Body: { userId }
  Response: { success: boolean }

POST /api/chat.report
  Body: { conversationId, reason }
  Response: { reportId, report }
```

### **Admin Endpoints**
```typescript
GET /api/admin.dashboard
  Response: { kpis, recentActivity, alerts }

GET /api/admin.users
  Query: { search?, status?, page }
  Response: { users[], total }

PATCH /api/admin.user.suspend
  Body: { userId }
  Response: { success: boolean }

PATCH /api/admin.user.unsuspend
  Body: { userId }
  Response: { success: boolean }

PATCH /api/admin.user.verify
  Body: { userId }
  Response: { success: boolean }

POST /api/admin.staff.add
  Body: { name, email, role }
  Response: { staffId, staff }

DELETE /api/admin.staff.remove
  Body: { staffId }
  Response: { success: boolean }

GET /api/admin.feedback
  Query: { search?, rating?, status?, page }
  Response: { feedback[], total }

PATCH /api/admin.feedback.mark
  Body: { feedbackId }
  Response: { success: boolean }

POST /api/admin.feedback.respond
  Body: { feedbackId, response }
  Response: { success: boolean }

GET /api/admin.paymentIssues
  Query: { search?, status?, page }
  Response: { issues[], total }

PATCH /api/admin.issue.status
  Body: { issueId, status }
  Response: { success: boolean }

POST /api/admin.issue.note
  Body: { issueId, note }
  Response: { success: boolean }
```

### **Staff Endpoints**
```typescript
GET /api/staff.dashboard
  Response: { pendingReports, openDisputes, vehiclesToVerify, activeTrips }

GET /api/staff.disputes
  Query: { search?, status?, page }
  Response: { disputes[], total }

PATCH /api/staff.dispute.resolve
  Body: { disputeId, resolution }
  Response: { success: boolean }

GET /api/staff.vehicles
  Query: { status?, page }
  Response: { vehicles[], total }

PATCH /api/staff.vehicle.approve
  Body: { vehicleId }
  Response: { success: boolean }

PATCH /api/staff.vehicle.reject
  Body: { vehicleId, reason }
  Response: { success: boolean }

GET /api/staff.trips
  Query: { alertLevel?, page }
  Response: { trips[], total }
```

---

## 🗄️ DATABASE SCHEMA

### **Users Table**
```sql
CREATE TABLE users (
  id INT PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  name VARCHAR(100),
  age INT,
  bio TEXT,
  location VARCHAR(100),
  travel_style ENUM('budget', 'mid-range', 'luxury', 'explorer', 'relaxer'),
  budget INT,
  profile_photo_url VARCHAR(500),
  trust_score FLOAT,
  verified BOOLEAN,
  verified_email BOOLEAN,
  verified_phone BOOLEAN,
  verified_identity BOOLEAN,
  background_check BOOLEAN,
  status ENUM('active', 'suspended', 'inactive'),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### **Interests Table**
```sql
CREATE TABLE user_interests (
  user_id INT,
  interest_name VARCHAR(50),
  PRIMARY KEY (user_id, interest_name),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Interest categories:
-- Hiking, Museums, Food, Photography, Beaches, Shopping, Nightlife, 
-- History, Nature, Art, Adventure, Relaxation
```

### **Contacts Table (Trusted Circle)**
```sql
CREATE TABLE emergency_contacts (
  id INT PRIMARY KEY,
  user_id INT,
  contact_name VARCHAR(100),
  relationship VARCHAR(50),
  phone VARCHAR(20),
  email VARCHAR(100),
  verified BOOLEAN,
  notification_enabled BOOLEAN,
  created_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### **Vehicles Table**
```sql
CREATE TABLE vehicles (
  id INT PRIMARY KEY,
  owner_id INT,
  license_plate VARCHAR(20),
  make VARCHAR(50),
  model VARCHAR(50),
  year INT,
  color VARCHAR(30),
  seats INT,
  status ENUM('available', 'unavailable', 'maintenance'),
  verification_status ENUM('pending', 'verified', 'rejected'),
  insurance_valid BOOLEAN,
  registration_valid BOOLEAN,
  created_at TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id)
);
```

### **Tours Table**
```sql
CREATE TABLE tours (
  id INT PRIMARY KEY,
  organizer_id INT,
  title VARCHAR(200),
  destination VARCHAR(100),
  start_date DATE,
  duration_days INT,
  max_participants INT,
  current_participants INT,
  price_per_person DECIMAL(10,2),
  description TEXT,
  status ENUM('active', 'completed', 'cancelled'),
  rating FLOAT,
  review_count INT,
  created_at TIMESTAMP,
  FOREIGN KEY (organizer_id) REFERENCES users(id)
);
```

### **Tour Itinerary Table**
```sql
CREATE TABLE tour_itinerary (
  id INT PRIMARY KEY,
  tour_id INT,
  day_number INT,
  activities TEXT,
  FOREIGN KEY (tour_id) REFERENCES tours(id)
);
```

### **Tour Participants Table**
```sql
CREATE TABLE tour_participants (
  id INT PRIMARY KEY,
  tour_id INT,
  user_id INT,
  status ENUM('joined', 'interested', 'pending'),
  joined_date TIMESTAMP,
  FOREIGN KEY (tour_id) REFERENCES tours(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### **Rides (Carpool) Table**
```sql
CREATE TABLE carpool_rides (
  id INT PRIMARY KEY,
  driver_id INT,
  from_location VARCHAR(100),
  to_location VARCHAR(100),
  departure_date DATE,
  departure_time TIME,
  available_seats INT,
  booked_seats INT,
  price_per_seat DECIMAL(10,2),
  status ENUM('active', 'completed', 'cancelled'),
  description TEXT,
  created_at TIMESTAMP,
  FOREIGN KEY (driver_id) REFERENCES users(id)
);
```

### **Ride Bookings Table**
```sql
CREATE TABLE carpool_bookings (
  id INT PRIMARY KEY,
  ride_id INT,
  passenger_id INT,
  status ENUM('pending', 'confirmed', 'completed', 'cancelled'),
  booked_at TIMESTAMP,
  FOREIGN KEY (ride_id) REFERENCES carpool_rides(id),
  FOREIGN KEY (passenger_id) REFERENCES users(id)
);
```

### **Feedback Table**
```sql
CREATE TABLE feedback (
  id INT PRIMARY KEY,
  author_id INT,
  subject VARCHAR(200),
  message TEXT,
  type ENUM('trip', 'car', 'platform'),
  rating INT,
  status ENUM('unreviewed', 'reviewed'),
  created_at TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id)
);
```

### **Payment Issues Table**
```sql
CREATE TABLE payment_issues (
  id INT PRIMARY KEY,
  reporter_id INT,
  subject VARCHAR(200),
  description TEXT,
  amount DECIMAL(10,2),
  status ENUM('pending', 'investigating', 'resolved'),
  severity ENUM('high', 'medium', 'low'),
  related_transaction_id INT,
  created_at TIMESTAMP,
  FOREIGN KEY (reporter_id) REFERENCES users(id)
);
```

### **Staff Table**
```sql
CREATE TABLE staff (
  id INT PRIMARY KEY,
  user_id INT,
  role ENUM('moderator', 'verifier', 'admin'),
  status ENUM('active', 'inactive'),
  resolved_issues INT,
  accuracy_percentage FLOAT,
  created_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### **Audit Log Table**
```sql
CREATE TABLE audit_logs (
  id INT PRIMARY KEY,
  staff_id INT,
  action VARCHAR(200),
  details TEXT,
  severity ENUM('low', 'medium', 'high'),
  timestamp TIMESTAMP,
  FOREIGN KEY (staff_id) REFERENCES staff(id)
);
```

### **Chat Messages Table**
```sql
CREATE TABLE messages (
  id INT PRIMARY KEY,
  conversation_id INT,
  sender_id INT,
  content TEXT,
  message_type ENUM('text', 'location', 'emoji'),
  read BOOLEAN,
  created_at TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(id)
);
```

### **Reports Table**
```sql
CREATE TABLE reports (
  id INT PRIMARY KEY,
  reporter_id INT,
  reported_user_id INT,
  reason VARCHAR(200),
  description TEXT,
  status ENUM('pending', 'investigating', 'resolved', 'dismissed'),
  severity ENUM('low', 'medium', 'high'),
  created_at TIMESTAMP,
  FOREIGN KEY (reporter_id) REFERENCES users(id),
  FOREIGN KEY (reported_user_id) REFERENCES users(id)
);
```

---

## 🔐 AUTHENTICATION

### **OAuth Providers**
- ✅ Google OAuth
- ✅ GitHub OAuth
- ✅ Email/Password

### **JWT Structure**
```json
{
  "userId": 123,
  "email": "user@example.com",
  "role": "traveler|staff|admin",
  "iat": 1234567890,
  "exp": 1234571490
}
```

### **OTP Verification**
- ✅ 6-digit OTP sent via email
- ✅ Valid for 10 minutes
- ✅ Max 3 attempts

---

## 💳 PAYMENT INTEGRATION

### **Stripe Integration**
```typescript
- Payment Method Tokenization
- PCI Compliance
- Webhook Handling
- Refund Processing
- Transaction History
```

### **Payment Events**
```
payment.initiated
payment.completed
payment.failed
payment.refunded
payment.disputed
```

---

## 🔔 NOTIFICATIONS

### **Types**
- ✅ Tour updates
- ✅ Ride confirmations
- ✅ Chat messages
- ✅ Safety alerts
- ✅ Admin alerts
- ✅ Payment notifications

### **Channels**
- ✅ In-app (toast)
- ✅ Email
- ✅ Push notifications
- ✅ SMS alerts

---

## 🗺️ GEOFENCING

### **Implementation**
```typescript
- 5km radius safe zone around user
- Real-time location tracking
- Entry/exit event detection
- Proximity-based matching
```

### **Privacy**
```
- User opt-in required
- Granular location controls
- Data auto-deletion after trip
- No third-party sharing
```

---

## 📊 ANALYTICS

### **Tracked Metrics**
- Total users
- Active trips
- Revenue
- Completion rate
- User ratings
- Staff performance
- Safety incidents
- System uptime

---

## 🚀 TECH STACK

### **Frontend**
- React 18 + TypeScript
- Tailwind CSS
- Wouter routing
- Sonner notifications
- Lucide icons
- Socket.IO (real-time)

### **Backend**
- Node.js 24.14
- Express.js 5.2
- tRPC
- Drizzle ORM
- PostgreSQL
- JWT auth

### **Infrastructure**
- Vite (build)
- Vitest (testing)
- Git (version control)
- GitHub (repository)

---

## 📈 PERFORMANCE TARGETS

| Metric | Target | Status |
|--------|--------|--------|
| Page Load | < 2s | ✅ Met |
| API Response | < 200ms | ✅ Met |
| Uptime | 99.9% | ✅ Monitored |
| Memory Usage | < 500MB | ✅ Optimized |
| Bundle Size | < 500KB | ✅ Optimized |

---

**Document Created:** May 2, 2026
**Last Updated:** May 2, 2026
**Status:** Complete & Ready for Reference

