# 🏗️ PartyUp Architecture Overview

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PartyUp Platform (Web)                            │
│                    React 18 + TypeScript + Tailwind CSS                     │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────┐  ┌──────────────────┐  ┌──────────────────────┐
│  FRONTEND LAYERS    │  │  STATE MGMT      │  │  ROUTING             │
│                     │  │                  │  │                      │
│ • React Components  │  │ • ThemeContext   │  │ • Wouter Router      │
│ • Tailwind CSS      │  │ • AuthContext    │  │ • Role-based Routes  │
│ • Custom UI Lib    │  │ • SafetyContext  │  │ • Protected Routes   │
│ • Lucide Icons      │  │                  │  │                      │
└─────────────────────┘  └──────────────────┘  └──────────────────────┘

                            ↓ API Calls ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                          API Layer (tRPC)                                    │
│                     Type-Safe RPC Framework                                  │
│                                                                              │
│  • User Routes         • Staff Routes         • Admin Routes                │
│  • Auth/Login          • Moderation           • Analytics                   │
│  • Trip Mgmt           • Disputes             • Staff Management            │
│  • Buddy Matching      • Vehicle Verify       • Audit Log                   │
│  • Chat (Socket.io)    • Trip Monitoring      • Settings                    │
│  • Ratings/Reviews     • Safety Alerts        • System Config               │
└─────────────────────────────────────────────────────────────────────────────┘

                            ↓ Database Queries ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                    Database Layer (Drizzle ORM)                              │
│                         MySQL Database                                       │
│                                                                              │
│  Tables:                                                                     │
│  • users (id, email, name, role, verified, trust_score, rating)           │
│  • trips (id, origin, destination, date_start, date_end, creator_id)      │
│  • matches (id, trip_id, user_id, status, created_at)                     │
│  • chat_messages (id, sender_id, receiver_id, message, timestamp)          │
│  • vehicles (id, owner_id, model, seats, verified, insurance)             │
│  • disputes (id, trip_id, type, status, resolution)                       │
│  • staff_actions (id, staff_id, action_type, target_id, severity, ts)     │
│  • audit_logs (id, admin_id, action, resource, timestamp)                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Role-Based Access Control (RBAC) Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                      Authentication                              │
│  Login → Role Assignment ("user", "staff", "admin")             │
│  Stored in → AuthContext + localStorage                         │
│  Routes Protected by → ProtectedRoute, AdminRoute, StaffRoute   │
└──────────────────────────────────────────────────────────────────┘

        ↓

┌─────────────────────────────────────────────────────────────────┐
│                    USER ROLE ("user")                           │
│  7 Pages • 11 Features                                          │
│                                                                 │
│  ✓ Discovery (find buddies with matching algorithm)           │
│  ✓ Chat (real-time messaging)                                 │
│  ✓ Map (GPS tracking + geofence)                              │
│  ✓ My Trips (trip management)                                 │
│  ✓ Ratings (feedback system)                                  │
│  ✓ Trusted Circle (save verified contacts)                    │
│  ✓ Carpooling (rent vehicles)                                 │
│  ✓ Profile (trust score + ratings)                            │
│  ✓ Settings (account preferences)                             │
│                                                                 │
│  Permission Matrix:                                            │
│  ✗ No access to moderation                                     │
│  ✗ No access to admin features                                 │
│  ✗ Can only see own trips/profiles                             │
└─────────────────────────────────────────────────────────────────┘

        ↓

┌─────────────────────────────────────────────────────────────────┐
│                 STAFF ROLE ("staff")                            │
│  5 Pages • 4 Core Workflows                                    │
│                                                                 │
│  ✓ Dashboard (see queue of pending work)                       │
│  ✓ Moderation Queue (review & suspend users)                   │
│  ✓ Disputes (resolve trip conflicts)                           │
│  ✓ Vehicle Verify (approve/reject rentals)                     │
│  ✓ Trip Monitor (safety tracking)                              │
│                                                                 │
│  Permission Matrix:                                            │
│  ✓ View reported users & content                               │
│  ✓ Suspend/ban users                                           │
│  ✓ Resolve disputes                                            │
│  ✓ Verify vehicles                                             │
│  ✓ See active trip status                                      │
│  ✓ All actions logged in audit trail                           │
│  ✗ Cannot view analytics                                       │
│  ✗ Cannot manage staff                                         │
│  ✗ Cannot change system settings                               │
└─────────────────────────────────────────────────────────────────┘

        ↓

┌─────────────────────────────────────────────────────────────────┐
│                  ADMIN ROLE ("admin")                           │
│  8 Pages • Full Platform Control                              │
│                                                                 │
│  ✓ Dashboard (KPI overview)                                    │
│  ✓ Analytics (trends & insights)                               │
│  ✓ Staff Management (hire/fire/evaluate)                       │
│  ✓ User Management (monitor accounts)                          │
│  ✓ Trip Management (oversee all trips)                         │
│  ✓ Reports (moderation statistics)                             │
│  ✓ Settings (system config & toggles)                          │
│  ✓ Audit Log (compliance & accountability)                     │
│                                                                 │
│  Permission Matrix:                                            │
│  ✓ View all analytics & KPIs                                   │
│  ✓ Hire, fire, & evaluate staff                                │
│  ✓ Monitor all users                                           │
│  ✓ View all trips                                              │
│  ✓ Toggle features (maintenance mode, etc.)                    │
│  ✓ Set system config (max disputes per user, etc.)             │
│  ✓ View complete audit logs                                    │
│  ✓ Make strategic decisions                                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Feature Map by Role

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FEATURE MATRIX                                  │
│                                                                        │
│  Feature                  │ User │ Staff │ Admin │ Description       │
│ ─────────────────────────┼──────┼───────┼───────┼──────────────────│
│  Discovery               │  ✅  │   ❌  │   ❌  │ Find buddies     │
│  Chat                    │  ✅  │   ❌  │   ❌  │ Messaging        │
│  GPS Tracking            │  ✅  │   ❌  │   ❌  │ Map location     │
│  My Trips                │  ✅  │   ❌  │   ❌  │ Personal history │
│  Rate/Review             │  ✅  │   ❌  │   ❌  │ Feedback system  │
│  Moderation Queue        │  ❌  │   ✅  │   ❌  │ Review reports   │
│  Resolve Disputes        │  ❌  │   ✅  │   ❌  │ Handle conflicts │
│  Verify Vehicles         │  ❌  │   ✅  │   ❌  │ Vet rentals      │
│  Monitor Trips           │  ❌  │   ✅  │   ❌  │ Safety tracking  │
│  Analytics               │  ❌  │   ❌  │   ✅  │ Trends & metrics │
│  Staff Management        │  ❌  │   ❌  │   ✅  │ Hire staff       │
│  User Management         │  ❌  │   ❌  │   ✅  │ Monitor accounts │
│  System Settings         │  ❌  │   ❌  │   ✅  │ Config platform  │
│  Audit Log               │  ❌  │   ❌  │   ✅  │ Compliance       │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow: A Complete Trip Journey

```
Step 1: USER CREATES TRIP
┌─────────────────┐
│  User at Home   │ → Posts trip to Paris (destination, dates, budget, travel style)
└─────────────────┘
        ↓
    Stored in Database: trips table

Step 2: OTHER USERS DISCOVER & MATCH
┌─────────────────────────────────────┐
│  Discovery Page Matching Algorithm  │ → Calculate compatibility for all users
│  (destination + dates + budget +    │ → Rank by compatibility score
│   travel style + interests)         │ → "Sarah: 92% match", "Mike: 78% match"
└─────────────────────────────────────┘
        ↓
    Stored in Database: matches table (with status = pending)

Step 3: BUDDY ACCEPTS MATCH
┌────────────────────────────┐
│  Match Status → ACCEPTED   │ → Creates confirmed trip relationship
└────────────────────────────┘
        ↓
    Chat opens automatically (users can now message)

Step 4: COORDINATION PHASE
┌────────────────────────┐
│  Chat & Map Page       │ → Exchange messages
│                        │ → Share GPS location
│                        │ → Real-time tracking begins
└────────────────────────┘
        ↓
    Stored in Database: chat_messages, location_tracking

Step 5: TRIP DAY EXECUTION
┌────────────────────────┐
│  My Trips Page         │ → Live trip status
│  "Pickup in 2:15h"     │ → Traffic updates
│  "Within Safe Zone"    │ → Geofence alerts
│                        │ → "Start Trip" button
└────────────────────────┘
        ↓
    Stored in Database: trip_status table

Step 6: STAFF SAFETY MONITORING (BACKGROUND)
┌─────────────────────────────────────┐
│  Staff Trip Monitor Page            │ → See active trip
│  Dashboard shows trip status        │ → Check for safety alerts
│  "Alert if 20km radius exceeded"    │ → Can investigate if needed
└─────────────────────────────────────┘
        ↓
    No interference unless safety issue detected

Step 7: TRIP COMPLETION & RATING
┌────────────────────────────────┐
│  Rating Modal                   │ → User rates buddy (1-5 stars)
│  "How was Sarah?"              │ → Leave written review
│  Submit rating                 │ → Calculate trust score impact
└────────────────────────────────┘
        ↓
    Stored in Database: ratings table, update users.trust_score

Step 8: SAVE TO TRUSTED CIRCLE (OPTIONAL)
┌──────────────────────────┐
│  Trusted Circle Page     │ → User adds Sarah to trusted contacts
│  "Quick re-book feature" │ → Can easily book together again
└──────────────────────────┘
        ↓
    Stored in Database: trusted_contacts table

Step 9: CONFLICT RESOLUTION (IF DISPUTE)
┌─────────────────────────────────────────────┐
│  If dispute reported:                       │
│  → Appears in Staff Disputes Queue          │
│  → Staff investigates (messages, trip data) │
│  → Resolves conflict (refund, warning, etc) │
│  → All logged to Audit Trail                │
└─────────────────────────────────────────────┘
        ↓
    Stored in Database: disputes table, staff_actions table
```

---

## Safety Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                  Safety Layers (Defense in Depth)           │
└──────────────────────────────────────────────────────────────┘

LAYER 1: PREVENTION
┌─────────────────────────────────────────────────────────────┐
│  Trust Score System (0-100)                                 │
│  • New users start at 50                                    │
│  • Verified profile → +10 points                            │
│  • Good ratings → +5 per 5-star review                      │
│  • Suspicious activity → -20 points                         │
│  • Users below 30 → can't book trips                        │
│                                                              │
│  Verification System                                        │
│  • Email verification required                              │
│  • ID verification (optional, verified badge)               │
│  • Vehicle verification (rental owners)                     │
│  • Badge system (✓ Verified, ⭐ Rating)                     │
└─────────────────────────────────────────────────────────────┘

LAYER 2: MONITORING
┌─────────────────────────────────────────────────────────────┐
│  Real-Time Tracking                                         │
│  • GPS tracking enabled during trips                        │
│  • Geofence alerts (5km safe zone)                          │
│  • Staff can monitor active trips                           │
│  • Alerts if user leaves safe zone                          │
│                                                              │
│  Compatibility Algorithm                                    │
│  • Matches on destination, dates, budget, travel style      │
│  • No matching with low trust scores                        │
│  • Prevents high-risk pairings                              │
└─────────────────────────────────────────────────────────────┘

LAYER 3: RESPONSE
┌─────────────────────────────────────────────────────────────┐
│  User Reporting System                                      │
│  • Users can report suspicious activity                     │
│  • Reports go to Staff Moderation Queue                     │
│  • Staff can suspend users immediately                      │
│                                                              │
│  Emergency Response (SOS Button)                            │
│  • Emergency alert system (visible in UI)                   │
│  • Notifies authorities + trip buddy                        │
│  • Can be toggled on/off by admin                           │
│  • Logged in audit trail (compliance)                       │
└─────────────────────────────────────────────────────────────┘

LAYER 4: RECOVERY
┌─────────────────────────────────────────────────────────────┐
│  Dispute Resolution                                         │
│  • Staff investigates incidents                             │
│  • Can suspend bad actors                                   │
│  • Can issue refunds/compensation                           │
│  • All actions audited and logged                           │
│                                                              │
│  Audit Trail for Compliance                                 │
│  • Every staff action logged                                │
│  • Every admin action logged                                │
│  • Severity levels (High/Medium/Low)                        │
│  • Full timestamp history                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### **Frontend**
- **Framework**: React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Lucide Icons, ShadCN/UI
- **Routing**: Wouter (lightweight)
- **State Management**: React Context (AuthContext, ThemeContext, SafetyContext)
- **Build Tool**: Vite
- **Testing**: Vitest

### **Backend**
- **Runtime**: Node.js
- **API Framework**: tRPC (type-safe RPC)
- **Language**: TypeScript
- **Real-time**: Socket.io (for chat)
- **Authentication**: JWT tokens + localStorage

### **Database**
- **Database**: MySQL
- **ORM**: Drizzle ORM
- **Migrations**: Drizzle migrations
- **Schema Versioning**: _journal.json snapshots

### **Deployment**
- **Frontend**: Netlify (deployed)
- **Backend**: Node.js server
- **Database**: MySQL hosting

---

## Page Directory Structure

```
client/src/pages/
├── User Pages (Regular Travelers)
│   ├── Home.tsx                   (dashboard)
│   ├── Discovery.tsx              (find buddies)
│   ├── Chat.tsx                   (real-time messaging)
│   ├── MapPage.tsx                (GPS tracking)
│   ├── MyTrips.tsx                (trip history)
│   ├── Profile.tsx                (user profile + trust score)
│   ├── Settings.tsx               (account settings)
│   ├── TrustedCircle.tsx           (saved contacts)
│   ├── Cars.tsx                   (personal vehicle tracking)
│   ├── Carpooling.tsx             (ride sharing)
│   └── PostRide.tsx               (create trip)
│
├── Staff Pages (Moderators)
│   ├── StaffDashboard.tsx         (queue overview)
│   ├── StaffDisputes.tsx          (user reports review - community moderation)
│   ├── StaffVehicles.tsx          (verify travelers' personal vehicles)
│   └── StaffTrips.tsx             (monitor safety)
│
├── Admin Pages (Management)
│   ├── AdminDashboard.tsx         (KPI overview)
│   ├── AdminAnalytics.tsx         (trends & insights)
│   ├── AdminStaff.tsx             (staff management)
│   ├── AdminUsers.tsx             (user management)
│   ├── AdminTrips.tsx             (trip oversight)
│   ├── AdminReports.tsx           (moderation stats)
│   ├── AdminSettings.tsx          (system config)
│   └── AdminAudit.tsx             (audit logging)
│
├── Public Pages
│   ├── Landing.tsx                (public landing page)
│   ├── Login.tsx                  (authentication)
│   ├── Register.tsx               (signup)
│   └── NotFound.tsx               (404 page)
```

---

## Key Metrics Dashboard Shows

### **User Dashboard (Home)**
- Active Trip Status: "Boracay, pickup in 2:15h"
- Compatibility Score: 92%
- Distance to Buddy: 2.3 km
- Trust Score: 92/100
- Geofence Status: Within 5km safe zone
- Activity Feed: Recent notifications

### **Staff Dashboard**
- Pending Reports: 23
- Open Disputes: 8
- Vehicles to Verify: 12
- Active Trips: 456
- Recent Actions: Last 4 staff modules
- Quick Actions: Buttons to access queues

### **Admin Dashboard**
- Total Users: 1,234
- Completed Trips: 2,847
- Active Trips: 456
- System Safety Score: 98.5%
- Staff Performance Grid: 3 staff with resolved count/accuracy
- System Alerts: High/Medium/Low priority items

---

## Compliance & Audit Trail

**Every Significant Action Logged:**

```json
{
  "id": "audit_123",
  "staff_id": "staff_001",
  "action": "SUSPEND_USER",
  "target_id": "user_456",
  "severity": "HIGH",
  "reason": "Multiple no-show reports",
  "timestamp": "2026-03-22T14:30:00Z",
  "metadata": {
    "dispute_count": 3,
    "trust_score_before": 45,
    "trust_score_after": 0
  }
}
```

**Audit Log Features:**
- All staff moderation actions logged
- All admin configuration changes logged
- Severity levels for filtering (High/Medium/Low)
- Timestamps for timeline reconstruction
- Staff member attribution for accountability
- Export capability for compliance

