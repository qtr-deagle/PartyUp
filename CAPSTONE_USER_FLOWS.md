# PartyUp - User Roles, Features & Methodology

## 📊 System Overview

PartyUp is a **3-tier Role-Based Access Control (RBAC)** platform for travel buddy matching and trip coordination.

---

## 🎯 The Three User Roles

### 1️⃣ **REGULAR USER (Traveler/Rider)**
**Purpose:** Find travel buddies, book rides, manage trips, build trusted circle

**Key Pages & Features:**

| Page | Purpose | Key Actions |
|------|---------|------------|
| **Home** | Live dashboard showing active trips | Active ride status, Notification feed, Quick actions (Start Trip, Share Location) |
| **Discovery** | Browse and find travel buddies | Filter by destination/dates/budget/travel style, View compatibility scores, Send match requests |
| **My Trips** | Manage all trips (past & upcoming) | View trip details, Track buddies, Rate experiences, Cancel/reschedule |
| **Carpooling** | Post & join ride shares | List vehicle seats available, See driver ratings, Book specific routes |
| **Post Ride** | Create a new trip | Set destination, departure date, budget, travel style, interests |
| **Chat** | Message with matched buddies | Real-time messaging, Share location links |
| **Map** | Real-time location tracking | See active trips on map, Geofence monitoring (within 5km safe zone) |
| **Trusted Circle** | Manage verified contacts | Add verified travelers, Emergency contacts |
| **Cars** | Track personal vehicles | Add vehicles, View vehicle details, Use for carpooling |
| **Profile** | Edit personal information | Bio, verified status, trust score (92%), ratings (⭐) |
| **Settings** | Account preferences | Notification settings, Privacy controls, Safety preferences |

**User Journey (Flow):**
```
Login → Home Dashboard → Discovery (Find Buddies) → Send Request →
Match Confirmed → Chat → Map (Coordinate) → My Trips (Track) → 
Rate/Review → Trusted Circle (Save)
```

---

### 2️⃣ **STAFF (Moderators/Operations)**
**Purpose:** Day-to-day platform operations, content moderation, dispute resolution

**Key Pages & Features:**

| Page | Purpose | Key Actions |
|------|---------|------------|
| **Staff Dashboard** | Overview of pending work | Show: User Reports (7), Vehicles to Verify (12), Active Trips (456), Recent Actions |
| **Moderation Queue** | Review user-submitted reports | Review flagged content, Approve/Reject reports, Suspend users, Add notes |
| **Disputes** | Resolve trip conflicts | Handle: No-show claims, Route disagreements, Payment disputes, Customer feedback from trip issues |
| **Verify Vehicles** | Approve travelers' personal vehicles | Review vehicle info, Confirm ownership, Check safety compliance, Approve/Reject |
| **Trip Monitoring** | Safety monitoring of active trips | Monitor live trips, Check safety alerts (Normal/Alert status), Eye icon for investigation |

**Staff Workflow:**
```
Staff Login → Dashboard (See Queue) →
├─ Moderation: Review Reports → Approve/Suspend Users
├─ Disputes: Investigate Conflicts → Resolve
├─ Vehicles: Review Personal Vehicles → Approve/Reject
└─ Trips: Monitor Safety → Alert if issues
```

**Responsibilities:**
- ✅ Review user reports & complaints  
- ✅ Suspend bad actors
- ✅ Resolve trip disputes
- ✅ Verify travelers' personal vehicles for safety
- ✅ Monitor active trips for safety
- ✅ Keep moderation queue under control

---

### 3️⃣ **ADMIN (Platform Management)**
**Purpose:** Strategic decisions, system configuration, analytics, staff oversight

**Key Pages & Features:**

| Page | Purpose | Key Actions |
|------|---------|------------|
| **Dashboard** | High-level platform health KPIs | Display: Total Users (1,234), Completed Trips (2,847), Active Trips (456), Safety Score (98.5%), Staff Performance grid |
| **Analytics** | Business intelligence & metrics | Show: Total Trips (2,847), New Users (+342), Trip Completion (94.2%), Avg Resolution Time (2.4h), Weekly trends, Regional breakdown |
| **Staff Management** | Manage moderators | Create/Edit/Delete staff, View performance (Resolved count, Accuracy %), Track active staff |
| **User Management** | Monitor user accounts | View all users, Search, Bulk actions (suspend, verify), User statistics |
| **Trip Management** | Oversee all trips | Search trips, View details, Flag issues, Data export |
| **Reports** | View moderation stats | Pending reports, Resolved cases, Staff metrics |
| **Settings** | System configuration | Toggle features (Maintenance Mode, New Signups, Trip Booking, SOS Alerts), Set max disputes per user |
| **Audit Log** | Compliance & accountability | Track all staff actions, Filter by staff/action type, View severity (High/Medium/Low), Timestamp all actions |

**Admin Workflow:**
```
Admin Login → Dashboard (See KPIs) →
├─ Analytics: Monitor trends & health
├─ Staff: Hire/manage moderators
├─ Users: Monitor accounts
├─ Trips: Oversee operations
├─ Settings: Configure system
└─ Audit: Track accountability
```

**Responsibilities:**
- 📊 Monitor platform metrics
- 👤 Hire & manage staff
- ⚙️ Configure system features
- 📋 Ensure compliance & auditing
- 📈 Make strategic decisions

---

## 🔄 Complete User Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                          LOGIN PAGE                             │
└────┬──────────────┬──────────────┬──────────────┬───────────────┘
     │ Role Check   │ Role Check   │ Role Check   │
     ▼              ▼              ▼              ▼
┌─────────────┐ ┌──────────────┐ ┌─────────────┐ ┌──────────────┐
│ REGULAR     │ │ STAFF        │ │ ADMIN       │ │ UNAUTH USER  │
│ USER HOME   │ │ STAFF        │ │ ADMIN       │ │ LANDING PAGE │
│             │ │ DASHBOARD    │ │ DASHBOARD   │ │              │
└──┬──────────┘ └──┬───────────┘ └──┬──────────┘ └──────────────┘
   │               │                │
   ▼               ▼                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     DISCOVERY/MATCHING                          │
│                                                                 │
│ USERS:                 STAFF:                ADMIN:             │
│ • Find Buddies         • Review Reports      • View Analytics   │
│ • Browse Trips         • Check Disputes      • Monitor Users    │
│ • View Profiles        • Verify Vehicles     • Manage Staff     │
│ • Send Requests        • Monitor Safety      • Config System    │
└──┬──────────────────────┬──────────────────────┬────────────────┘
   │                      │                      │
   ▼                      ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                   TRIP EXECUTION & SUPPORT                      │
│                                                                 │
│ USERS:                 STAFF:                ADMIN:             │
│ • My Trips (track)     • Respond to Issues   • View Reports     │
│ • Real-time Chat       • Resolve Disputes    • Audit Log        │
│ • Map Tracking         • Suspend Users       • System Health    │
│ • Rate/Review          • Approve Vehicles    • Staff Metrics    │
└──┬──────────────────────┬──────────────────────┬────────────────┘
   │                      │                      │
   ▼                      ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│              TRIP COMPLETION & FEEDBACK CYCLE                   │
│                                                                 │
│ USERS:                 STAFF:                ADMIN:             │
│ • Rate Buddy           • Respond to Issues   • Monitor KPIs     │
│ • Leave Review         • Track Resolutions   • Analyze Trends   │
│ • Save to Trusted      • Generate Reports    • Plan Strategy    │
│ • Book Next Trip       • Review Audits       • Optimize System  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📸 Recommended Screenshots for Capstone Methodology

### **Core User Journey Screenshots:**

#### **User (Traveler) Path:**
1. **Login Page** - Shows role selection & authentication
2. **Home Dashboard** - Active trip status, compatibility score, notifications
3. **Discovery Page** - Buddy matching with filters (destination, dates, budget, style)
4. **Profile + Trust Score** - Shows verified status & rating system
5. **Carpooling Page** - Vehicle rental integration
6. **My Trips** - Trip tracking & history
7. **Chat Page** - Real-time communication
8. **Map Page** - Live GPS tracking with geofence
9. **Rating/Review** - After-trip feedback system
10. **Trusted Circle** - Saved verified travelers

#### **Staff (Moderator) Path:**
1. **Staff Dashboard** - Queue overview (Reports, Disputes, Vehicles, Active Trips)
2. **Moderation Queue** - Review user reports
3. **Disputes Page** - Trip conflict investigation
4. **Vehicle Verification** - Document review & approval flow
5. **Trip Monitoring** - Live safety tracking
6. **Audit Trail** - Visible proof of staff actions (compliance)

#### **Admin (Management) Path:**
1. **Admin Dashboard** - KPI overview (Users, Trips, Safety Score, Staff Performance)
2. **Analytics Dashboard** - Trends, completion rates, resolution times, regional data
3. **Staff Management** - Hire, evaluate, manage moderators
4. **System Settings** - Feature toggles, configuration
5. **Audit Log** - All admin actions logged with severity & timestamp
6. **User Management** - Monitor & manage user base

---

## 🔐 Role-Based Access Control Matrix

| Feature | User | Staff | Admin | Public |
|---------|------|-------|-------|--------|
| **Discovery & Matching** | ✅ | ❌ | ❌ | ❌ |
| **Post/Book Trips** | ✅ | ❌ | ❌ | ❌ |
| **My Trips & Chat** | ✅ | ❌ | ❌ | ❌ |
| **Rate & Review** | ✅ | ❌ | ❌ | ❌ |
| **Moderation Queue** | ❌ | ✅ | ❌ | ❌ |
| **Resolve Disputes** | ❌ | ✅ | ❌ | ❌ |
| **Verify Vehicles** | ❌ | ✅ | ❌ | ❌ |
| **Monitor Trips Safety** | ❌ | ✅ | ❌ | ❌ |
| **View Analytics** | ❌ | ❌ | ✅ | ❌ |
| **Manage Staff** | ❌ | ❌ | ✅ | ❌ |
| **System Config** | ❌ | ❌ | ✅ | ❌ |
| **Audit Log** | ❌ | ❌ | ✅ | ❌ |
| **View Landing** | ✅ | ✅ | ✅ | ✅ |
| **Login/Register** | ✅ | ✅ | ✅ | ✅ |

---

## 🎨 Design Philosophy

**PartyUp** follows a **Minimalist Luxury** aesthetic:
- Clean, professional UI with subtle shadows
- Consistent sidebar navigation across all roles
- Card-based layouts with clear information hierarchy
- Real-time features (maps, live trip status)
- Safety-first approach (geofencing, trust scores, ratings)

---

## 📋 Methodology Summary for Capstone Presentation

### **What Makes PartyUp Different:**

1. **3-Tier RBAC System:**
   - Users focus on matching & trip execution
   - Staff handles day-to-day moderation
   - Admin manages platform strategy

2. **Safety-First Architecture:**
   - Geofence monitoring (keep users within safe zones)
   - Trust scores & verification badges
   - Real-time GPS tracking
   - SOS alert system
   - Compatibility scoring algorithm

3. **Efficient Operations:**
   - Staff queue system (reports, disputes, vehicle verification)
   - Audit logging for compliance
   - Real-time analytics for admin decision-making

4. **Feature Completeness:**
   - Buddy matching algorithm
   - Vehicle rental system
   - Real-time chat
   - Trip rating/review system
   - Trusted circle management

### **Key Differentiators to Highlight:**

✅ **Real-time Safety Monitoring** - GPS tracking with geofence alert  
✅ **Intelligent Matching** - Compatibility score (trips, budget, style, interests)  
✅ **Two-Sided Market** - Both travelers AND vehicle renters  
✅ **Complete Moderation** - Staff tier for scalable content management  
✅ **Compliance Ready** - Audit logging for every admin action  
✅ **Role Separation** - Clear responsibility boundaries  

---

## 🚀 Recommended Demo Flow for Presentation

**Time: 5-7 minutes**

1. **Login & Role Selection** (30 sec) - Show 3 personas
2. **User Flow: Discovery → Match → Chat → Map → Rate** (2 min) - Core value prop
3. **Staff Flow: Dashboard → Review Report → Suspend User** (1.5 min) - Safety/moderation
4. **Admin Flow: Analytics → Staff Management → Audit Log** (1.5 min) - Scalability
5. **Safety Feature Highlight: Geofencing & GPS Tracking** (1 min)
6. **Q&A** (TBD)

---

## 📝 Technical Stack (For Methodology Section)

- **Frontend:** React 18 + TypeScript + Tailwind CSS
- **Backend:** tRPC for type-safe APIs + Node.js
- **Database:** MySQL with Drizzle ORM
- **Routing:** Wouter (lightweight client router)
- **State Management:** React Context API
- **Authentication:** Token-based with role-based routing
- **Real-time:** Socket.io (for chat/notifications)
- **Maps:** Map integration for GPS tracking

---

## ✅ Implementation Status

- ✅ All 3 user roles fully architected
- ✅ All pages created with mock data
- ✅ Role-based routing implemented
- ✅ RBAC matrix defined
- ⏳ Backend API integration pending
- ⏳ Real data from database pending
- ⏳ Permission enforcement pending

