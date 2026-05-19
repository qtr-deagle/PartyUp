# 🗂️ PartyUp Complete Page Directory & Feature Map

## Visual Navigation Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                   PartyUp Platform (25 Pages)                   │
└─────────────────────────────────────────────────────────────────┘

LANDING & AUTH (3 Pages)
├─ Landing.tsx              → Public info + sign up CTA
├─ Login.tsx                → Authentication with role detection
└─ Register.tsx             → User signup & profile creation

                            ↓ Role-Based Redirect ↓

┌───────────────────────┬──────────────────┬──────────────────────┐
│   REGULAR USER (7)    │   STAFF (5)       │   ADMIN (8)          │
└───────────────────────┴──────────────────┴──────────────────────┘

USER PAGES (Regular Travelers) - 8 Pages
├─ Home.tsx                 → Dashboard (active trip status)
├─ Discovery.tsx            → Find buddies (matching algorithm)
├─ Chat.tsx                 → Real-time messaging
├─ MapPage.tsx              → GPS tracking + geofence
├─ MyTrips.tsx              → Trip history & management
├─ Profile.tsx              → User profile + trust score
├─ TrustedCircle.tsx        → Saved verified contacts
├─ Carpooling.tsx           → Vehicle ride sharing
├─ Cars.tsx                 → Personal vehicle tracking
├─ PostRide.tsx             → Create new trip
└─ Settings.tsx             → Account preferences

STAFF PAGES (Moderators) - 4 Pages
├─ StaffDashboard.tsx       → Queue overview (all pending work)
├─ StaffDisputes.tsx        → Review community-reported users
├─ StaffVehicles.tsx        → Verify travelers' personal vehicles
└─ StaffTrips.tsx           → Monitor active trips for safety

ADMIN PAGES (Management) - 8 Pages
├─ AdminDashboard.tsx       → Platform KPIs (users, trips, safety)
├─ AdminAnalytics.tsx       → Business intelligence & trends
├─ AdminStaff.tsx           → Manage staff team
├─ AdminUsers.tsx           → Monitor user accounts
├─ AdminTrips.tsx           → Oversee all trips
├─ AdminReports.tsx         → Moderation statistics
├─ AdminSettings.tsx        → System configuration
└─ AdminAudit.tsx           → Compliance & audit logging

ERROR PAGES (1 Page)
└─ NotFound.tsx             → 404 page
```

---

## Features by Page

### **👤 REGULAR USER (Travelers)**

#### **1. Home.tsx** `/` 
**Purpose**: Dashboard showing active trip status
```
Displays:
  • Active ride card (destination, pickup time, buddy name)
  • Live traffic status
  • Compatibility score (92%)
  • Distance to buddy (2.3 km)
  • Trust score (92/100)
  • Geofence status ("Within 5km safe zone")
  • Notifications feed (recent activity)

Quick Actions:
  • Start Trip button
  • Share Location button
```

#### **2. Discovery.tsx** `/discovery`
**Purpose**: Find travel buddies with matching algorithm
```
Filters:
  • Destination (autocomplete)
  • Date range (from/to)
  • Budget range (budget/mid-range/luxury)
  • Travel style (chill-explorer/instagram-hunter/party-mode/cultural-explorer)
  • Interests (multi-select)
  • Min compatibility score slider

Results:
  • Traveler cards showing:
    - Name, age, bio
    - Compatibility % (based on 5 factors)
    - Ratings ⭐
    - Verified badge ✓
    - "Send Request" button

Key Algorithm Factors:
  1. Destination match (exact)
  2. Date overlap (within 2 weeks)
  3. Budget compatibility (within 1 tier)
  4. Travel style alignment
  5. Shared interests count
```

#### **3. Chat.tsx** `/chat`
**Purpose**: Real-time messaging with matched buddies
```
Features:
  • Message history with matched users
  • Online status indicator
  • Timestamp for each message
  • Message search
  • Send message input
  • User avatar + name
```

#### **4. MapPage.tsx** `/map`
**Purpose**: Real-time GPS tracking & safety zones
```
Displays:
  • Interactive map with pins
  • User location (blue pin)
  • Buddy location (green pin)
  • Distance between users (2.3 km)
  • Geofence circle (5km radius)
  
Safety Features:
  • Alert if leaving geofence
  • Live traffic overlay
  • Route overlay (if planned)
  • Real-time position updates
```

#### **5. MyTrips.tsx** `/my-trips`
**Purpose**: Manage all trips (past & upcoming)
```
Sections:
  Upcoming Trips:
    • Trip destination, dates
    • Buddy name + avatar
    • Trip status (Confirmed/Pending/Cancelled)
    • Days until trip countdown
    
  Past Trips:
    • Completed trip info
    • Buddy name + final rating
    • Duration of trip
    • Rating given by user
    • Can review again

Trip Actions:
  • View details
  • Message buddy
  • Cancel trip
  • Rate buddy (if completed)
```

#### **6. Profile.tsx** `/profile`
**Purpose**: User profile showing trust & verification
```
Components:
  Profile Header:
    • Avatar + name
    • Verified badge ✓ (if verified)
    • Edit profile button
    
  Trust Metrics:
    • Trust score (0-100, shown as %)
    • Rating (⭐ average from reviews)
    • Number of trips completed
    • Number of reviews
    • Trust score breakdown (last 30 days)
    
  Personal Info:
    • Bio
    • Location
    • Join date
    • Payment method (last 4 digits)
    
  Travel Preferences (editable):
    • Favorite destinations
    • Budget range
    • Travel style
    • Interests
```

#### **7. TrustedCircle.tsx** `/trusted-circle`
**Purpose**: Saved verified travelers for quick re-booking
```
Features:
  • List of saved travelers
  • Quick re-book button for each
  • Remove from trusted circle
  • Verified status badge
  • Last trip together date
  • Average rating
```

#### **8. Carpooling.tsx** `/carpooling`
**Purpose**: Browse & book vehicle rides (two-sided market)
```
Displays:
  Available Rides:
    • Driver name + avatar
    • Vehicle (make, model, color)
    • Seats available (out of total: "2 of 4")
    • Departure time
    • Pickup location
    • Destination
    • Cost per seat
    • Driver rating ⭐
    • Verified vehicle badge ✓
    
  Book Actions:
    • Preview route
    • Message driver
    • Book seat button
```

#### **9. Cars.tsx** `/cars`
**Purpose**: Manage personal vehicles for carpooling
```
My Vehicles Section:
  For each vehicle:
    • Photo gallery
    • Make, model, color, year
    • License plate
    • Seats available
    • Transmission & fuel type
    • Mileage
    • Edit vehicle button

Usage:
  • Track personal vehicles
  • Use for carpooling trips
  • Share vehicle details with carpool buddies
  • Maintain vehicle information
```

#### **10. PostRide.tsx** `/post-ride`
**Purpose**: Create a new trip/ride posting
```
Form Fields:
  • Destination (autocomplete)
  • Departure date
  • Return date
  • Departure location
  • Budget (select: budget/mid/luxury)
  • Trip purpose (vacation/business/backpacking/study)
  • Travel style (4 options)
  • Interests (multi-select)
  • Description (optional)
  • Visibility (public/friends only)

Submit:
  • "Post Trip" button
  • Trip goes live in Discovery
```

#### **10. Settings.tsx** `/settings`
**Purpose**: Account preferences & controls
```
Sections:
Notification Settings:
  • Email notifications (toggle)
  • Push notifications (toggle)
  • Safety alerts (toggle)
  • Message notifications (toggle)
  
Privacy Settings:
  • Show profile publicly (toggle)
  • Allow trip matching (toggle)
  • Show location (toggle)
  • Allow ratings (toggle)
  
Account Management:
  • Change password
  • Email address
  • Two-factor authentication (toggle)
  • Session management (log out all devices)
  • Delete account (dangerous action)
```

---

### **👨‍💼 STAFF (Moderators)**

#### **1. StaffDashboard.tsx** `/staff/dashboard`
**Purpose**: Queue overview showing all pending work
```
KPI Cards:
  • 📊 Pending Reports (23)
  • ⚖️ Open Disputes (8)
  • 🚗 Vehicles to Verify (12)
  • 🚕 Active Trips (456)

Recent Actions (Last 4 staff actions):
  • Who did what, when
  • Timestamp + staff member

Quick Action Buttons:
  • Go to Moderation Queue
  • Go to Disputes
  • Go to Vehicle Verification
  • Go to Trip Monitoring
```

#### **2. StaffDisputes.tsx** `/staff/disputes`
**Purpose**: Review user reports and take community moderation action
```
Reports Table:
  Columns:
    • Reporter (who reported)
    • Reported User (user being reported)
    • Reason (report category: spam, harassment, fraud, safety, other)
    • Time Submitted (timestamp)
    • Status (Pending/Resolved)
    • Actions

Actions Available:
  • View Profile (check verification status, history)
  • View Chat (review conversation history)
  • View Reports (check if user has previous reports)
  • Mark Resolved (close the case)
  • Take Action (warning, suspension, removal)

Moderation Actions:
  • Warning (send notification to user)
  • Temporary Suspension (7 days / 30 days)
  • Permanent Removal (delete account + data)
  • Add Note (internal documentation)
```

#### **3. StaffTrips.tsx** `/staff/trips`
**Purpose**: Monitor active trips for safety issues
```
Active Trips List:
  For each trip:
    • Trip ID
    • Participants (both users)
    • Status badge (Normal ✓ / Alert ⚠️)
    • Pickup location
    • Destination
    • Time started
    • Eye icon (click to investigate)
    
Safety Status Indicators:
  🟢 Normal - Trip progressing normally
  🟡 Alert - Something suspicious detected
    - Users outside geofence
    - Route diversion from planned
    - Safety report filed
    - Communication stopped

Investigation:
  • View trip details
  • View current GPS location
  • View chat history
  • View reported issues
  • Intervention options (notify users, stop trip)
```

---

### **⚙️ ADMIN (Platform Management)**

#### **1. AdminDashboard.tsx** `/admin/dashboard`
**Purpose**: High-level platform health metrics
```
KPI Cards (4):
  • 👥 Total Users: 1,234 (↑ +5% this week)
  • 🚗 Completed Trips: 2,847 (↑ +28% vs last month)
  • 🚕 Active Trips: 456 (→ stable)
  • 🛡️ Safety Score: 98.5% (↑ +0.3% trend)

Staff Performance Grid (3 staff shown):
  Per staff member:
    • Name
    • Role
    • Disputes Resolved (this week)
    • Accuracy % (quality rating)
    • Status (Online/Offline)

System Alerts:
  • Production alerts (errors, downtime)
  • Performance alerts (slow requests)
  • Security alerts (suspicious activity)
  • Operational alerts (important dates)
```

#### **2. AdminAnalytics.tsx** `/admin/analytics`
**Purpose**: Business intelligence for strategic decisions
```
KPI Metrics (4):
  • 📊 Total Trips: 2,847
  • 👥 New Users: +342 (↑ +18%)
  • ✅ Completion Rate: 94.2%
  • ⏱️ Avg Resolution Time: 2.4 hours

Charts/Visualizations:
  • Weekly Trips Line Chart (7-day trend)
  • Completion Rate vs Target
  • New User Signups Trend

Data Table: Weekly Breakdown
  Week | Trips | Disputes | Resolution Time
  ─────┼───────┼──────────┼─────────────────
  Wk1  | 412   | 8        | 2.1h
  Wk2  | 428   | 9        | 2.3h
  Wk3  | 405   | 7        | 2.2h
  Wk4  | 475   | 8        | 2.8h

Regional Analysis:
  Geographic Breakdown (%)
  • New York: 28.4%
  • Los Angeles: 23.1%
  • Chicago: 17.2%
  • Other: 31.3%
```

#### **3. AdminStaff.tsx** `/admin/staff`
**Purpose**: Manage moderators & team members
```
Staff List Table:
  Columns:
    • Name
    • Role (Moderator / Vehicle Verifier / etc)
    • Status (Active / Inactive / On Leave)
    • Joined Date
    • Disputes Resolved
    • Accuracy %
    • Actions (Edit, Delete)

Staff Details (modal):
  • Email
  • Phone
  • Join date
  • Total actions
  • Accuracy rating
  • Recent activity (last 5 actions)

Actions:
  • Edit staff info
  • Change role
  • Change status
  • Delete staff
  • "Add Staff" button (hire new)
```

#### **4. AdminUsers.tsx** `/admin/users`
**Purpose**: Monitor & manage user accounts
```
User Search & Filter:
  • Name search
  • Email search
  • Status filter (Active/Suspended/Verified)
  • Join date range
  • Trust score range

User List Table:
  • Name
  • Email
  • Join date
  • Trust score
  • Rating
  • Status
  • # Trips
  • Last activity

Actions Per User:
  • View profile
  • Message user
  • Flag for review
  • Verify account
  • Suspend account
  • Delete account

Bulk Actions:
  • Email campaign
  • Suspend multiple
  • Export to CSV
```

#### **5. AdminTrips.tsx** `/admin/trips`
**Purpose**: Oversee all trips for quality & compliance
```
Trip Search & Filter:
  • Date range
  • Status (Ongoing/Completed/Cancelled)
  • Participants (search by names)
  • Destination search
  • Min/max distance

Trip List Table:
  • Trip ID
  • Participants (2 users)
  • Destination
  • Date
  • Status
  • Duration
  • Rating given

Trip Details (click row):
  • Full participant info
  • Route taken
  • Chat history
  • Rating given by each party
  • Disputes (if any)

Actions:
  • Flag trip (for investigation)
  • View GPS track
  • View chat
  • Export data
```

#### **6. AdminReports.tsx** `/admin/reports`
**Purpose**: Overview of moderation activity
```
Report Statistics:
  • Total reports received: 342 (today)
  • Pending: 23
  • Resolved: 319
  • Avg resolution time: 2.4h

Report Breakdown:
  If you received the reports above:
  • Spam: 120 (35%)
  • Harassment: 95 (28%)
  • Fraud: 67 (20%)
  • Other: 60 (17%)

Top Reporters:
  • User A: 12 reports
  • User B: 9 reports
  • User C: 7 reports

Most Reported Users:
  • User X: 8 times
  • User Y: 5 times
  • User Z: 4 times
```

#### **7. AdminSettings.tsx** `/admin/settings`
**Purpose**: System configuration & feature toggles
```
Feature Toggles:
  🔘 Maintenance Mode (OFF → click to enable)
     Description: Disables booking, shows maintenance message
     ⚠️ Warning: New users cannot sign up / make trips
     
  🔘 New User Signups (ON)
     Description: Allow new users to register
     
  🔘 Trip Booking (ON)
     Description: Allow users to book/post trips
     
  🔘 SOS Alert System (ON)
     Description: Allow emergency alerts

Configuration:
  • Max Disputes Per User: [10] (dropdown/input)
  • Default Trip Duration: [7 days]
  • Geofence Radius: [5 km]

Warning:
  ⚠️ Warning: These changes take effect immediately!
  
Save Button: "Save settings"
```

#### **8. AdminAudit.tsx** `/admin/audit`
**Purpose**: Compliance & complete action audit trail
```
Audit Log Filters:
  • Staff member search
  • Action type filter (Suspend, Approve, Reject, etc)
  • Severity filter (High / Medium / Low)
  • Date range picker

Audit Table:
  Columns:
    • Timestamp (2:15 PM, mar 22)
    • Staff Name
    • Action Type (SUSPEND_USER, APPROVE_VEHICLE, etc)
    • Target (user123, vehicle456)
    • Severity (🔴 High / 🟡 Medium / 🟢 Low)
    • Notes (brief description)

Example Entries:
  2:15 PM | Sarah Johnson | SUSPEND_USER       | user_123    | 🔴 High | Multiple no-show claims
  2:10 PM | Mike Chen     | APPROVE_VEHICLE    | vehicle_456 | 🟢 Low  | Insurance verified
  2:05 PM | Sarah Johnson | RESOLVE_DISPUTE    | dispute_789 | 🟡 Med  | Payment conflict resolved
  1:50 PM | Lisa Rodriguez| REJECT_VEHICLE     | vehicle_789 | 🟡 Med  | Insurance expired

Summary Stats:
  • Total Actions Today: 342
  • High Severity: 8
  • Medium Severity: 42
  • Low Severity: 292
  • Most Active Staff: Sarah Johnson (89 actions)
```

---

## URL Route Map

```
/ → Home (user dashboard)
/discovery → Discovery (find buddies)
/chat → Chat
/map → Map & GPS tracking
/my-trips → Trip history
/profile → User profile
/trusted-circle → Saved contacts
/carpooling → Ride sharing browse
/cars → Vehicle management
/post-ride → Create trip
/settings → Account settings

/staff → Staff dashboard (redirects to /staff/dashboard)
/staff/dashboard → Staff dashboard
/staff/disputes → User reports review
/staff/disputes → Disputes
/staff/vehicles → Vehicle verification
/staff/trips → Trip monitoring

/admin → Admin dashboard (redirects to /admin/dashboard)
/admin/dashboard → Admin dashboard
/admin/analytics → Analytics/BI
/admin/staff → Staff management
/admin/users → User management
/admin/trips → Trip overview
/admin/reports → Report statistics
/admin/settings → System settings
/admin/audit → Audit log

/login → Login page
/register → Register page
/404 → 404 page
```

---

## File Organization

```
client/src/pages/
├── User Pages (11 files)
│   ├── Home.tsx
│   ├── Discovery.tsx
│   ├── Chat.tsx
│   ├── MapPage.tsx
│   ├── MyTrips.tsx
│   ├── Profile.tsx
│   ├── TrustedCircle.tsx
│   ├── Carpooling.tsx
│   ├── Cars.tsx
│   ├── PostRide.tsx
│   └── Settings.tsx
│
├── Staff Pages (5 files)
│   ├── StaffDashboard.tsx
│   ├── StaffDisputes.tsx
│   ├── StaffDisputes.tsx
│   ├── StaffVehicles.tsx
│   └── StaffTrips.tsx
│
├── Admin Pages (8 files)
│   ├── AdminDashboard.tsx
│   ├── AdminAnalytics.tsx
│   ├── AdminStaff.tsx
│   ├── AdminUsers.tsx
│   ├── AdminTrips.tsx
│   ├── AdminReports.tsx
│   ├── AdminSettings.tsx
│   └── AdminAudit.tsx
│
└── Auth & Error (3 files)
    ├── Login.tsx
    ├── Register.tsx
    └── NotFound.tsx
```

