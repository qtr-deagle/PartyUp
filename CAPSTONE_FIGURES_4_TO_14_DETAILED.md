# PartyUp Capstone - Figures 4-14 Complete Screenshot Guide

## Your Progression: Figure 4 onwards

You've completed:
- ✅ Figure 1: Landing Page
- ✅ Figure 2A: Register Step 1
- ✅ Figure 2B: Register Step 2  
- ✅ Figure 2C: Register Step 3 (12 interests)
- ✅ Figure 3: Discovery/Matching

**Next: Figure 4 (User Profile)**

---

# TIER 1: Core Features (Figures 1-6) - MINIMUM REQUIRED

## Figure 4: User Profile - Complete Profile View

**Location:** `/profile` or click on user avatar/name  
**Purpose:** Show user data persistence and trust indicators

### What to Show on Screen:

**Header Section:**
- User avatar (profile photo)
- Name: "Sarah Chen" or realistic name
- Age: "24"
- Location: "San Francisco, CA"
- Edit Profile button (primary CTA)

**Stats Row (Key Metrics):**
- Total Trips: "24"
- Total Rating: "⭐⭐⭐⭐⭐ 4.8" (5 stars)
- Response Rate: "98%"
- Verification: "✓ Verified" badge

**Bio Section:**
- Bio text: "Love backpacking through Southeast Asia and trying local food. Always up for adventure!"

**Selected Travel Interests (from Step 3):**
- Display the 5-8 interests they selected during registration
- Show as pill tags: `🎒 Backpacking` `🍜 Food` `📸 Photography` `🧘 Wellness` `🏔️ Adventure`
- These should match Figure 2C selections (CRITICAL for continuity)

**Verification Badges & Trust Indicators:**
- "✓ Email Verified"
- "✓ Phone Verified"
- "✓ Identity Verified"
- "🛡️ Background Check Passed"
- Any safety certifications

**Trip History Section:**
- Past trips listed (show 3-4):
  - "Paris Trip - Feb 2026" | 5 members | ⭐⭐⭐⭐⭐
  - "Bali Adventure - Jan 2026" | 3 members | ⭐⭐⭐⭐⭐
  - "Tokyo Cultural Tour - Dec 2025" | 4 members | ⭐⭐⭐⭐
  - With status badge (Completed/Active)

**Review/Recommendation Cards:**
- Show 2-3 short reviews from travel buddies:
  - "Sarah is amazing! She's organized and fun. Would travel with her again!" - James M. ⭐⭐⭐⭐⭐

**Action Buttons (Bottom):**
- "Edit Profile" (primary)
- "Share Profile" (secondary)
- "Report User" (danger/tertiary)

### Annotation Strategy:

```
🔴 PRIMARY (Red circles):
   - Name + Age + Location (identity)
   - Star rating (4.8⭐) - trust indicator
   - Verified badge (verification)
   - Travel interests tags (algorithm matching)

🟡 SECONDARY (Yellow boxes):
   - Trip count (24 trips)
   - Response rate (98%)
   - Review cards

🟢 SUPPORTING:
   - Bio text
   - Edit button
```

### Talking Points (2-3 minutes):

> "This is Sarah's profile as seen by other users. When someone looks at Sarah's profile after the matching system shows 92% compatibility, they see this. Notice several key trust elements: Her 4.8-star rating from 24 completed trips. Her verified badges—email, phone, identity, background check all completed. These badges are critical. Before a trip, users want to know: 'Is this person real? Are they trustworthy?'

> Notice her travel interests match what we selected in registration: Backpacking, Food, Photography, Wellness, Adventure. This consistency is intentional. Every match you see in the Discovery page reflects these same interests.

> Her past trip history is visible—other travelers can see she's completed 24 trips successfully. The reviews below her profile are from actual travel buddies. That social proof is powerful. Real trips, real people, real reviews."

### Key Elements to Verify:
- [ ] Profile photo is professional and clear
- [ ] All 5 stat numbers are visible (trips, rating, response rate, etc.)
- [ ] Interests match Step 3 selections from earlier screenshots
- [ ] At least 3 past trips listed
- [ ] At least 2 review cards visible
- [ ] All verification badges shown
- [ ] Edit button is clickable-looking

---

## Figure 5: Trip Creation Form - Post Your Trip

**Location:** `/post-trip` or "Create Trip" button  
**Purpose:** Show how users create trips that others can join

### What to Show on Screen:

**Form Header:**
- "Create Your Next Adventure" heading
- Step indicator (e.g., 1/2 or single form)

**Trip Information Fields:**

1. **Trip Title** (required)
   - Input: "Paris to Amsterdam Adventure"

2. **Origin & Destination** (required)
   - From: "Paris, France" (with location icon)
   - To: "Amsterdam, Netherlands" (with location icon)
   - Show Google Maps autocomplete suggestion

3. **Trip Dates** (required)
   - Start Date: "Mar 15, 2026"
   - End Date: "Mar 22, 2026"
   - Shows "7 days" calculation

4. **Budget per Person** (required)
   - Fields: Low $ | Mid $$ | High $$$
   - Or slider: $50/day to $200/day
   - Selected: "Mid-range - $75-100/day"

5. **Trip Purpose/Interests** (required)
   - Checkboxes: Select from 12 interests
   - Show: `☑ Food` `☑ Cultural` `☑ Adventure` (3-5 selected)
   - Unselected items gray out

6. **Description** (optional)
   - Text area: "Looking for fun travelers to explore Paris! We'll do museums, eat amazing food, and experience local nightlife."

7. **Number of Seats/Travelers Available** (required if carpool)
   - Seats: "2 more seats needed"
   - Or travelers: "Looking for 3 travel buddies"

8. **Photo Upload** (optional)
   - "📷 Upload trip photo" button
   - Or drag-and-drop zone

**Form Buttons (Bottom):**
- "Create Trip" (primary blue button - CTA)
- "Save as Draft" (secondary)
- "Cancel" (tertiary)

### Annotation Strategy:

```
🔴 PRIMARY (Red circles):
   - Trip title input (identifies the trip)
   - Destination fields (where it's going)
   - Budget selection (cost transparency)
   - Interests checkboxes (algo matching input)
   - Create Trip button (CTA)

🟡 SECONDARY:
   - Dates (when it's happening)
   - Seats/travelers count

🟢 SUPPORTING:
   - Description text
   - Photo upload
```

### Talking Points (1-2 minutes):

> "When a user wants to create a trip, they fill this form. Notice the structure mirrors what users selected during registration. Budget options: Low, Mid, High. Interests: The same 12 categories. So if Sarah created a trip with 'Food', 'Cultural', 'Adventure'—our algorithm would immediately identify other users with matching interests.

> The destination and date fields feed our geofencing technology. We know exactly where the trip is, when it happens, and can surface it to nearby users with matching dates.

> Most important: This form is intentionally simple. Three required fields minimum: Where, When, Budget. Everything else is optional. Why? Because complex forms have lower completion rates. We want users to post trips easily."

### Key Elements to Verify:
- [ ] All required fields marked with *
- [ ] Origin and destination fields show autocomplete
- [ ] Date picker shows full calendar month
- [ ] Budget options displayed clearly (three options or slider)
- [ ] Interest checkboxes show 3-5 selected
- [ ] Budget value displays dynamically (e.g., "$75-100/day")
- [ ] Create Trip button is prominent and blue

---

## Figure 6: Chat Interface - Real-Time Messaging

**Location:** `/chat` or click "Connect" after a match  
**Purpose:** Show real-time communication between partners

### What to Show on Screen:

**Chat Header:**
- User avatar + name: "Emma, 23"
- Green online indicator (dot)
- "Last active: now" or "Active now"
- Call/video icon (optional, if feature exists)
- More menu icon

**Message Thread (Conversation View):**

**Message 1 (from Emma - left side):**
- Avatar thumbnail
- Message bubble: "Hey! Love your profile, especially the photography interest 📸"
- Timestamp: "Today 2:14 PM"
- Status: Single checkmark (sent)

**Message 2 (from Emma - left side):**
- Message bubble: "I'm planning a trip to Tokyo next month, are you interested?"
- Timestamp: "Today 2:14 PM"
- Status: Double checkmark (delivered)

**Message 3 (from Current User - right side, blue bubble):**
- Message bubble: "Tokyo! I'd love that! When exactly?"
- Timestamp: "Today 2:15 PM"
- Status: Double checkmark (read) - show "read" indicator if possible

**Message 4 (from Current User - right side, blue bubble):**
- Message bubble: "I'm free Mar 10-20 if that works"
- Timestamp: "Today 2:16 PM"
- Status: Double checkmark (read)

**Message 5 (from Emma - left side):**
- Message bubble: "Perfect! That's exactly when I'm traveling! 🎉 Let's chat more details"
- Timestamp: "Today 2:17 PM"

**Input Area (Bottom):**
- Text input field: "Type a message..." placeholder
- Send button (paper plane icon or arrow)
- Optional: Emoji picker, photo attachment icons

### Annotation Strategy:

```
🔴 PRIMARY (Red circles):
   - User avatar + online indicator (shows live connection)
   - Message bubbles with clear direction (sent/received)
   - Timestamps (shows real-time interaction)
   - Double checkmark read status (confirmation)

🟡 SECONDARY:
   - Message content (travel plan discussion)
   - Input field and send button

🟢 SUPPORTING:
   - Chat header info
   - Emoji in messages
```

### Talking Points (2 minutes):

> "This is the chat interface—where matches become real conversations. After Sarah clicked 'Connect' on Emma's profile, they can now message. Notice several things:

> **1. Online Status:** Green dot shows Emma is active right now. Sarah knows she'll get a quick response.

> **2. Message Status:** Single checkmark = sent. Double checkmark = delivered and read. Users know the message went through AND was seen.

> **3. Natural Conversation Flow:** They're coordinating dates, discussing interests, building trust. This is where the 92% compatibility score turns into a real trip.

> **4. Planning Tool:** They've moved from 'Are we compatible?' (Discovery page) to 'Let's plan together' (Chat). The chat is the bridge between matching and booking."

### Key Elements to Verify:
- [ ] Both user messages and incoming messages show clearly
- [ ] Colors differentiate (blue = current user, gray = other)
- [ ] Timestamps on every message
- [ ] Read receipts visible (checkmarks or "read" indicator)
- [ ] User avatar visible on left side
- [ ] Current user avatar visible or implied on right
- [ ] Online indicator shown in header
- [ ] Input field and send button at bottom

---

# TIER 2: Secondary Features (Figures 7-10)

## Figure 7: My Trips Dashboard - Trip Management

**Location:** `/my-trips`  
**Purpose:** Show users their active and past trips with status

### What to Show on Screen:

**Tabs/Filters:**
- "Active" (currently happening or upcoming)
- "Completed" (finished)
- "Cancelled"
- Show "Active" tab selected

**Active Trip Cards (Show 2-3):**

**Card 1: Active Trip**
- Trip name: "Paris to Amsterdam Adventure"
- Status badge: "🟢 In Progress" (green)
- Dates: "Mar 15-22, 2026"
- Members avatar row: Show 3-4 small circular avatars
- Member count: "+2 members"
- Destination preview: "🗺️ Paris → Amsterdam"
- Budget: "$75-100/day"
- Trip type badges: `Food` `Cultural` `Adventure`
- Action buttons:
  - "View Details" 
  - "Chat with Members"
  - "View on Map" (if location tracking)

**Card 2: Upcoming Trip**
- Trip name: "Tokyo Photography Tour"
- Status badge: "🟡 Upcoming" (yellow)
- Dates: "Apr 1-15, 2026"
- Members avatar row: Show 2 avatars
- Member count: "2 members"
- Destination: "🗺️ Tokyo, Japan"
- Budget: "$50-75/day"
- Trip type badges: `Photography` `Cultural`
- Action buttons similar

**Card 3: Simple/Minimal**
- Shows similar structure with different data

**Empty/Completed Section:**
- "No active trips" or show 1-2 past trips

### Annotation Strategy:

```
🔴 PRIMARY:
   - Trip status badges (color-coded)
   - Member avatars (social proof, team)
   - Trip dates (key info)

🟡 SECONDARY:
   - Trip name and destination
   - Budget and interests
   - Action buttons

🟢 SUPPORTING:
   - Tabs at top
   - Completed trips section
```

### Talking Points (1 minute):

> "My Trips shows users all their upcoming adventures. Each card displays: where they're going, when, with whom, and the budget. The green 'In Progress' badge tells them the trip is happening now. The avatar circles show who they're traveling with—this social proof is important. Action buttons let them chat with travel buddies, see details, or track location in real time."

---

## Figure 8: Carpool/Vehicle Details - Car Rental Info

**Location:** `/cars` or `/carpooling`  
**Purpose:** Show vehicle rental integration

### What to Show on Screen:

**Car Header:**
- Large photo of car (realistic vehicle image)
- Car title: "2024 Honda Civic - Automatic"
- Owner name: "John M." with avatar
- Owner rating: "⭐⭐⭐⭐⭐ 4.9" (24 reviews)
- "✓ Verified Owner"

**Car Specs (Grid or List):**
- Seats: "5 passengers"
- Transmission: "Automatic"
- Fuel Type: "Hybrid"
- Year: "2024"
- Color: "Silver"
- License Plate: "ABC1234"
- Insurance: "Covered - Allstate"

**Location & Availability:**
- Current Location: "San Francisco, CA"
- Available: "Mar 15 - Mar 30, 2026"
- Pickup Location: "Downtown SF"

**Daily Rate:**
- Price display: "$60/day" (highlighted in blue)
- Fuel policy: "Driver pays for fuel"
- Mileage: "Unlimited"

**Car Photos Gallery:**
- Multiple photos showing interior, trunk, details
- Can swipe/scroll through

**Owner Info Section:**
- Owner profile link
- Response time: "Usually responds in 5 minutes"
- Joined: "Member since 2023"

**Reviews/Ratings Section:**
- Show 2-3 review snippets:
  - "Great car! Clean and reliable." - Sarah C. ⭐⭐⭐⭐⭐
  - "Perfect for our group trip. Would rent again." - James L. ⭐⭐⭐⭐⭐

**Booking Buttons (Bottom):**
- "Reserve This Car" (primary blue button - CTA)
- "Message Owner" (secondary)
- "Report" (tertiary)

### Annotation Strategy:

```
🔴 PRIMARY:
   - Car photo (shows what you get)
   - Daily rate ($60/day)
   - Seats available (5 passengers)
   - Owner rating (trust)
   - Reserve button (CTA)

🟡 SECONDARY:
   - Car specs (transmission, fuel)
   - Availability dates
   - Owner info

🟢 SUPPORTING:
   - Reviews
   - Location info
```

### Talking Points (1 minute):

> "When users plan a carpool trip, they browse available cars. Each car card shows: the vehicle itself with photos, detailed specs, the daily rate, and crucially—the owner's rating and background. Why important? Because you're renting from a peer. That 4.9-star rating from 24 reviews tells you: 'This person takes care of their vehicle and treats renters well.' The affordable $60/day rate makes group trip costs split easily across multiple travelers."

---

## Figure 9: Booking/Payment Flow - Confirmation Screen

**Location:** `/booking` or after selecting a trip and clicking "Confirmm"  
**Purpose:** Show payment processing and booking confirmation

### What to Show on Screen:

**Header:**
- "Confirm Booking" heading
- Step indicator: "Step 3 of 3" or progress bar

**Trip Summary Section:**
- Trip title: "Paris to Amsterdam Adventure"
- Dates: "Mar 15-22, 2026 (7 days)"
- Members: "4 total (including you)"
- Destination: "🗺️ Paris, France → Amsterdam, Netherlands"

**Cost Breakdown (Box with gray background):**
- Trip fee: "$500" (base cost for 7 days @ $75/day)
- Service fee: "$50" (10% platform fee)
- Tax: "$44" (calculation shown)
- **Total: $594.00** (highlighted in blue, larger font)

**Traveler Information Section:**
- Name: "Sarah Chen"
- Email: "sarah@example.com"
- Phone: "+1 (555) 123-4567"
- [Edit link if needed]

**Payment Method Section:**
- Payment type: "💳 Credit Card"
- Card display: "Visa ending in 4242"
- [Change link]

**Stripe Payment UI (Hint):**
- Show "Powered by Stripe" badge
- If showing payment form: Card number, CVC, expiration fields (blurred for security)
- Or show processed indicator: "✓ Card verified"

**Safety & Cancellation:**
- Cancellation policy: "Free cancellation until Mar 10, 2026"
- Travel insurance checkbox: "☐ Add $25 travel insurance"

**Final Buttons:**
- "Confirm & Pay $594" (large blue CTA button)
- "Back" (secondary button)
- "Need help?" (support link)

**Trust Indicators (Bottom):**
- "🔒 Secure payment (SSL encrypted)"
- Stripe logo
- Money-back guarantee text

### Annotation Strategy:

```
🔴 PRIMARY:
   - Total cost highlighted ($594.00)
   - Confirm & Pay button (CTA)
   - Stripe security badge (trust)

🟡 SECONDARY:
   - Cost breakdown (transparency)
   - Payment method shown
   - Trip summary

🟢 SUPPORTING:
   - Cancellation policy
   - Insurance option
   - Help link
```

### Talking Points (1 minute):

> "After selecting a trip, users see this confirmation screen. Transparency is critical—users see the exact breakdown: base trip cost, service fee, tax. We use Stripe for payment processing, which is industry standard and secure. Notice the SSL badge at bottom—users know their payment data is encrypted. Before confirming, they see the cancellation policy: free to cancel until Mar 10. This reduces booking anxiety. The travel insurance option is optional but recommended."

---

# TIER 2 Continuation: Figures 10

## Figure 10: Admin Dashboard - System Overview

**Location:** `/admin` (requires admin login)  
**Purpose:** Show admin oversight and system health

### What to Show on Screen:

**Dashboard Header:**
- "Admin Dashboard" title
- Date range picker: "Last 30 days"
- Refresh button
- Notifications badge: "🔔 3"

**Top Metrics Row (4 KPI Cards):**

**Card 1: Active Users**
- Number: "3,247"
- Trend: "↑ +12% vs last month"
- Icon: 👥 Users
- Secondary: "1,823 online now"

**Card 2: Active Trips**
- Number: "142"
- Trend: "↑ +8% vs last month"
- Icon: 🗺️ Trips
- Secondary: "Avg 4.2 members/trip"

**Card 3: Total Revenue**
- Number: "$18,420"
- Trend: "↑ +24% vs last month"
- Icon: 💰 Revenue
- Secondary: "3.2% platform fee"

**Card 4: Safety Incidents**
- Number: "2"
- Trend: "↓ -50% vs last month"
- Icon: 🛡️ Safety
- Secondary: "All resolved"

**Main Dashboard Sections:**

**Section 1: Recent Trips Activity (Table/List)**
- Columns: Trip ID | Destination | Members | Status | Date | Action
- Row 1: "TRIP-2847" | Paris → Amsterdam | 4 | ✅ Active | Mar 15-22 | [View]
- Row 2: "TRIP-2846" | Tokyo Tour | 3 | ✅ Active | Apr 1-15 | [View]
- Row 3: "TRIP-2845" | Bali Beach | 5 | ✅ Completed | Mar 1-10 | [View]
- Row 4: "TRIP-2844" | Bangkok Adventure | 2 | ⏳ Pending | Mar 25-30 | [View]
- Pagination: "Showing 1-4 of 523 trips"

**Section 2: System Health/Issues (Alert Box)**
- Alert 1: "✓ All systems operational"
- Alert 2: "⚠️ 2 flagged accounts pending review" [Review]
- Alert 3: "⚠️ 5 pending SOS button activations" [View Incidents]
- Alert 4: "✓ Payment processor: NORMAL"

**Section 3: Moderation Queue (Card Layout)**
- Title: "Content Review Queue"
- "3 items waiting review"
- Item 1: Profile report - "Inappropriate photos" [Review] [Approve/Reject]
- Item 2: Message report - "Harassment" [Review] [Approve/Reject]
- Item 3: Trip report - "Cancellation dispute" [Review] [Approve/Reject]

**Section 4: Recent User Reports (Mini Table)**
- User reports of violations
- Show reporter, violator, reason, date, status

**Right Sidebar (Additional Info):**
- Quick Stats:
  - Active now: "1,823"
  - New users today: "47"
  - Churn rate: "2.1%"
- Quick Links:
  - Manage Users [Link]
  - System Logs [Link]
  - Payment Reports [Link]
  - API Status [Link]

**Bottom Navigation:**
- "View Full Reports" [Link]
- "Export Data" [Link]
- "Settings" [Link]

### Annotation Strategy:

```
🔴 PRIMARY:
   - Top 4 KPI cards (system health)
   - Active trips table (system activity)
   - Safety incidents alert (security focus)

🟡 SECONDARY:
   - Moderation queue (community management)
   - Recent reports

🟢 SUPPORTING:
   - System status
   - Quick links
```

### Talking Points (2-3 minutes):

> "The admin dashboard is where I oversee the entire PartyUp system. At a glance:

> **3,247 active users** with 1,823 online right now. This tells us the platform is healthy and engaged. **142 active trips** running simultaneously—people are using the matching algorithm to travel together. **$18,420 in revenue** last month—the business model works.

> But most importantly: **2 safety incidents** last month, and they're all resolved. Every single trip gets monitored. When someone clicks the SOS button during a trip, the system immediately alerts our safety team. See those 5 pending SOS activations? We check every one.

> The moderation queue shows reports from the community. If users see inappropriate behavior, they report it through the app. Our team reviews and takes action—ban accounts, remove content, whatever's needed.

> The active trips table shows real-time trip data. I can click any trip and see member details, chat history, location data, everything. Total transparency for safety."

### Key Elements to Verify:
- [ ] 4 KPI cards show real numbers (users, trips, revenue, safety)
- [ ] Trend indicators show month-over-month (up/down arrows)
- [ ] Active trips table shows at least 4 rows
- [ ] Status indicators use clear badges (✅ Active, ✅ Completed, ⏳ Pending)
- [ ] Safety alerts section is prominent
- [ ] Moderation queue shows items waiting review
- [ ] All numbers are realistic and consistent

---

# TIER 2 Continuation: Staff/Moderator Dashboard

## Figure 10B: Staff Dashboard - Moderation & Safety

**Location:** `/staff` (requires staff/moderator login)  
**Purpose:** Show safety team tools and moderation capabilities

### What to Show on Screen:

**Dashboard Header:**
- "Safety & Moderation Dashboard" title
- Team member: "Logged in as: John Smith (Moderator)"
- Status: "🟢 On duty"
- Shift info: "8am-5pm PST"

**Top Alert Section (Red/Orange Box):**
- "⚠️ URGENT: 1 active SOS signal in progress"
- Details: "Trip ID: TRIP-2809, Location: [Map pin], User: Sarah Chen"
- Action buttons: [View on Map] [Call Police] [Contact Traveler]

**Main Sections:**

**Section 1: Moderation Queue (Priority List)**
- Title: "Items Needing Review"
- Count: "12 items in queue"

**Item Priority 1 (Red/High):**
- Type: 🚨 SOS Activation
- Trip: "TRIP-2847 - Paris Adventure"
- User: "Sarah Chen"
- Incident: "User pressed SOS button at 14:32 UTC"
- Details: "Last location: 48.87°N, 2.35°E (Paris, France)"
- Status: In progress
- Actions: [View Location] [Contact User] [Send Help]
- Time: "2 min ago"

**Item Priority 2 (Yellow/Medium):**
- Type: ⚠️ Harassment Report
- Trip: "TRIP-2844"
- Reporter: "James L."
- Violator: "Mike T."
- Reason: "Inappropriate messages in trip chat"
- Actions: [Read Messages] [Warn User] [Ban User]
- Time: "15 min ago"

**Item Priority 3 (Yellow/Medium):**
- Type: ⚠️ Profile Report
- Reported User: "Alex K."
- Reason: "Inappropriate photos on profile"
- Reporter: "Anonymous"
- Evidence: "[View Photos]"
- Actions: [Approve Removal] [Reject Report]
- Time: "1 hour ago"

**Item 4-12:** (Listed but less detailed)
- Similar format, lower priority

**Section 2: Active Trips Monitoring (Map View or List)**
- Real-time trip locations
- Show 3-5 active trips:
  - TRIP-2847: "Paris → Amsterdam" - 4 members - ✅ Good
  - TRIP-2846: "Tokyo Tour" - 3 members - ✅ Good
  - TRIP-2845: "Bali Beach" - 5 members - ✅ Good
- Click any trip to see:
  - Member list with profile checks
  - Chat history (read-only)
  - Location tracking
  - SOS status

**Section 3: User Verification Queue**
- New users awaiting background check approval
- Show: Profile photo, name, verification status, days waiting
- Actions: [Approve] [Reject/Request More Info]
- Count: "8 users pending verification"

**Section 4: Escalations & Logs**
- Recent actions taken:
  - "14:32 - SOS activated: TRIP-2847"
  - "14:10 - User warned for harassment: Mike T."
  - "13:45 - Profile photos removed: Alex K."
  - "13:20 - User banned: David X. (repeat offender)"

**Right Sidebar: Quick Tools**
- Emergency Contacts
- Police (Emergency)
- Mental Health Crisis Line
- Platform Legal Team
- Help Center
- Staff Handbook

**Bottom Section: Statistics**
- "Today's Stats:"
- Trips monitored: "47"
- SOS calls: "0" ✅
- Violations handled: "3"
- Users banned: "1"
- False alarms: "2"

### Annotation Strategy:

```
🔴 PRIMARY (Highest emphasis):
   - SOS alert at top (active emergency)
   - Moderation queue (priority items)
   - Location tracking (real-time monitoring)

🟡 SECONDARY:
   - Active trips list
   - Verification queue
   - User verification status

🟢 SUPPORTING:
   - Escalation logs
   - Quick tools/contacts
   - Statistics
```

### Talking Points (3-4 minutes):

> "This is our Safety & Moderation Dashboard—where the safety team monitors the entire platform in real-time.

> **The SOS Button:** See that alert at top? When a user feels unsafe during a trip, they press the SOS button in the app. This immediately shows on our dashboard with their exact location, trip ID, and real-time status. We can contact them instantly, call police if needed, or coordinate with local authorities. This is our safety net.

> **Moderation Queue:** Users report inappropriate behavior, harassment, or violations. Every report goes into this queue. Our team prioritizes them: P1 = emergencies, P2 = safety concerns, P3 = policy violations. For each report, we can view the evidence (messages, photos, profile), then take action: warn the user, remove content, or ban them.

> **Active Trip Monitoring:** At any moment, we see all active trips on a map. We know who's traveling, where they are, how many members. If anything looks suspicious—unusual location, sudden movement, repeated SOS—we can drill in and investigate.

> **User Verification Queue:** New users must pass background checks before full access. We review their profiles, verify their identity, check for red flags. 300+ positive user stories are from users who passed our verification.

> **Why This Matters:** Solo travelers, especially women, are concerned about safety. Our dashboard shows we take that seriously. Every trip is monitored. Every violation is reviewed. Every SOS is answered."

### Key Elements to Verify:
- [ ] SOS alert prominently displayed at top in red/orange
- [ ] Moderation queue shows at least 3-4 priority items
- [ ] Items have clear action buttons ([View] [Approve] [Ban] etc.)
- [ ] Location data or trip reference visible
- [ ] Active trips monitoring section present
- [ ] User verification queue shown
- [ ] Emergency contact numbers visible for reference
- [ ] Today's statistics showing activity level

---

# TIER 3: Comprehensive Coverage (Figures 11-14)

## Figure 11: Safety Features - SOS & Verification UI

**Location:** Various (SOS button on trip details, verification badges on profiles)  
**Purpose:** Show comprehensive safety infrastructure

### What to Show (Combination View):

**On Trip Details Page:**

**SOS Button (Prominent, Red):**
- Big red circular button: "🆘 SOS" or Emergency icon
- Location: Bottom-right corner of screen
- Hover text: "Press if you need immediate help"
- Below SOS: "Help will arrive in ~5 min" (approximate response time)

**Live Trip Tracking:**
- Map showing:
  - Current user location (blue pin)
  - Travel buddy locations (green pins)
  - Destination (red pin)
  - Route between current and destination
- "📍 Live location sharing enabled"
- "⏱️ Last updated: 30 seconds ago"

**Safety Checklist (Optional but shown):**
- "☑ Emergency contact shared with buddies"
- "☑ Trip itinerary saved"
- "☑ SOS will alert emergency team"
- "☑ Real-time location tracking active"

**On User Profile Page:**

**Safety Badges/Verification:**
- "✅ Email verified"
- "✅ Phone verified"
- "✅ Identity verified (government ID)"
- "✅ Background check passed"
- "✅ 24+ verified trips"

**Trust Score Breakdown:**
- Visual meter: "Safety Score: 95/100"
- Factors:
  - Completion rate: 98%
  - Response time: <2 hours
  - Review rating: 4.8⭐
  - No violations: ✓
  - Days since joined: 450+

**Emergency Contact:**
- Shows that travel buddy has your emergency contact
- "Your emergency: [Name] [Phone]"

### Annotation Strategy:

```
🔴 PRIMARY:
   - SOS button (life-saving feature)
   - Live location map (real-time safety)
   - Verification badges (trust indicators)

🟡 SECONDARY:
   - Safety checklist
   - Trust score breakdown

🟢 SUPPORTING:
   - Emergency contact info
```

### Talking Points (2 minutes):

> "Safety is embedded throughout PartyUp. See this red SOS button? Critical feature. If a user feels unsafe during a trip, they press this. Instantly, our safety team is notified with their exact location. Our average response time is under 5 minutes—we either contact local authorities or send help.

> Live location tracking runs during every trip. All members can see each other on the map. The system continuously updates. If someone goes off-route or stops moving unexpectedly, alerts trigger.

> And look at these verification badges. Every user goes through background checks, identity verification, phone verification. That 95/100 safety score isn't subjective—it's calculated from completion rate, review ratings, days on platform, and whether they've ever violated community rules. Users can instantly see: is this person trustworthy?"

---

## Figure 12: Reviews & Ratings - Social Proof

**Location:** `/reviews` or below user profile  
**Purpose:** Show community feedback and rating system

### What to Show on Screen:

**Overview Header:**
- User name: "Sarah Chen"
- Overall rating: "⭐⭐⭐⭐⭐ 4.8 (47 reviews)"
- Rating breakdown bar chart:
  - 5 stars: ████████ 39 reviews
  - 4 stars: ██ 6 reviews
  - 3 stars: █ 1 review
  - 2 stars: (empty)
  - 1 star: (empty)

**Review Cards (Show 3-4):**

**Review 1 (Most Recent):**
- Reviewer: James M. (with small avatar)
- Rating: ⭐⭐⭐⭐⭐ 5 stars (gold stars)
- Review title: "Amazing travel companion!"
- Review text: "Sarah was organized, fun, and flexible. We had an incredible week in Paris together. Would travel with her again in a heartbeat!"
- Trip: "Paris Adventure - Feb 2026"
- Review date: "2 weeks ago"
- Helpful votes: "👍 23 people found this helpful"
- Verified purchase badge: "✓ Verified traveler"

**Review 2:**
- Reviewer: Michelle K.
- Rating: ⭐⭐⭐⭐⭐ 5 stars
- Review title: "Perfect travel buddy"
- Review text: "Great communication before the trip, punctual, and genuinely kind. Sarah made the whole experience smooth and enjoyable."
- Trip: "Tokyo Cultural Tour - Jan 2026"
- Review date: "1 month ago"
- Helpful votes: "👍 18 people found this helpful"
- Verified purchase badge: "✓ Verified traveler"

**Review 3:**
- Reviewer: David L.
- Rating: ⭐⭐⭐⭐ 4 stars
- Review title: "Good trip, minor issues"
- Review text: "Overall great, but Sarah could have communicated the change in plans a bit earlier. Still had a great time though!"
- Trip: "Bali Beach Adventure - Dec 2025"
- Review date: "2 months ago"
- Helpful votes: "👍 5 people found this helpful"
- Verified purchase badge: "✓ Verified traveler"

**Review 4:**
- Similar format...

**Pagination:**
- "Showing 1-3 of 47 reviews"
- [Load More] or navigation controls

**Sections Below Reviews:**

**Reviewer Trust:**
- "All 47 reviewers are verified travelers"
- "Average reviewer: 12 completed trips, 4.6⭐ rating"

**Response from Sarah (Optional):**
- Show if user has responded to reviews
- Green box: "Sarah replied to David's review 1 month ago: 'Thanks for the feedback! I apologize for the last-minute change...'"

**Filter/Sort Options (Top):**
- Sort by: Newest | Helpful | Rating (Highest/Lowest)
- Filter: All stars | 5 stars only | Recent trips

### Annotation Strategy:

```
🔴 PRIMARY:
   - Overall rating (4.8⭐)
   - Rating distribution chart
   - Review content (what people say)
   - Verified traveler badges

🟡 SECONDARY:
   - Helpful vote count
   - Trip reference
   - Review dates

🟢 SUPPORTING:
   - Filter/sort options
   - Pagination
```

### Talking Points (1-2 minutes):

> "Ratings are crucial for building trust. Sarah has a 4.8-star rating from 47 verified travelers. Note: 'verified travelers'—these aren't strangers leaving fake reviews. Every reviewer went through our verification process and actually traveled with Sarah.

> The rating distribution shows transparency. She has 39 five-star reviews, but also one 3-star review—which actually builds credibility. If everyone rated 5 stars, users would assume reviews are fake. Real ratings include variety.

> The reviews themselves are specific. 'Great communication before the trip, punctual, genuine'—these are concrete observations, not generic praise. And notice Sarah responded to David's 4-star review. She acknowledged his feedback about communication. That responsiveness matters."

---

## Figure 13: Mobile Responsive View - Mobile UX

**Location:** Same features as others, but on mobile screen (375x667px typical)  
**Purpose:** Show mobile-first design philosophy

### What to Show (Pick one feature shown on both desktop and mobile):

**Option A: Discovery Cards on Mobile**

**Desktop Version:**
- 6-column grid of traveler cards
- Each card shows: photo, name, age, percentage, interests, buttons
- Filter panel on side

**Mobile Version (375px wide):**
- Single column stack
- Each card takes full width (minus small margins)
- Swipe gestures indicated (arrows on sides)
- Filter appears as modal/bottom sheet when tapped
- Touch-friendly button sizes (44px minimum)
- Interests wrap naturally instead of fixed grid

**Option B: Registration Form Steps on Mobile**

**Desktop Version:**
- Form takes 400px width centered
- All fields visible
- Multi-step indicator horizontal

**Mobile Version (375px):**
- Form takes full width (16px margins)
- Vertical stacking optimized
- Input fields tap to expand
- Progress bar shows as solid bar at top (easier to see on small screen)
- Key difference: form is thumb-friendly, buttons are large (50px+ height)

**Option C: Chat Interface on Mobile**

**Desktop Version:**
- Chat occupies right 60% of screen
- Sidebar on left 40%
- Large message bubbles

**Mobile Version (375px):**
- Chat takes full screen
- Back arrow to return to match list
- Soft keyboard takes space from bottom
- Message bubbles adapt to narrow width
- Input field sticky at bottom
- Timestamps small but not hidden

### Annotation Strategy:

```
🔴 PRIMARY:
   - Touch-friendly sizes (44-50px buttons)
   - Responsive layout (full-width cards)
   - Bottom sheet for modals

🟡 SECONDARY:
   - Text sizing for readability on small screen
   - Gesture indicators (swipe arrows)

🟢 SUPPORTING:
   - Margins and padding
   - Back navigation patterns
```

### Talking Points (1 minute):

> "PartyUp is mobile-first. Why? Because 85% of users access on phones. Look at the mobile version of our Discovery cards—they stack vertically instead of horizontal grid. Each card takes the full width, thumb-friendly for swiping. Buttons are 50px tall, not 30px—easier to tap on small screens.

> The filter becomes a bottom sheet instead of side panel. Why? On mobile, screen real estate is precious. We optimize every pixel. And notice input fields—on mobile, they auto-focus with large keyboards. On desktop, they're simply text fields. Same feature, different UX for the device."

---

## Figure 14: Notifications Center + Alerts

**Location:** `/notifications` or bell icon in header  
**Purpose:** Show notification system and communication

### What to Show on Screen:

**Mobile View of Notifications (Recommended):**

**Notifications Header:**
- Bell icon with badge: "🔔 14" (14 unread)
- "Notifications" heading
- Settings icon (gear) for notification preferences

**Notification Filters/Tabs:**
- "All" (selected, blue)
- "Matches"
- "Messages"
- "Bookings"
- "Safety"

**Notification List (Chronological - newest first):**

**Notification 1 (Unread - Light background):**
- Type icon: 💬 Message
- Title: "Emma sent you a message"
- Preview: "Hey! Love your profile, especially the photography interest 📸"
- Time: "Just now"
- Action: [View]

**Notification 2 (Unread - Light background):**
- Type icon: ✅ Booking Confirmed
- Title: "Booking confirmed for Paris Adventure"
- Preview: "Your booking for Mar 15-22 in Paris is confirmed. Your payment of $594 was processed."
- Time: "2 hours ago"
- Action: [View Trip]

**Notification 3 (Unread - Light background):**
- Type icon: 🤝 New Match
- Title: "New match: Emma, 23"
- Preview: "92% compatibility! Emma is looking for travel buddies to Tokyo."
- Time: "Yesterday 6:12 PM"
- Action: [View Profile]

**Notification 4 (Read - Normal background):**
- Type icon: ⭐ Review Posted
- Title: "James left a review of your profile"
- Preview: "⭐⭐⭐⭐⭐ 'Amazing travel companion!'"
- Time: "2 days ago"
- Action: [View Review]

**Notification 5:**
- Type icon: 🗺️ Trip Reminder
- Title: "Your trip to Tokyo starts in 5 days"
- Preview: "Get ready! Your trip begins Apr 1, 2026. Review your travel buddies and itinerary."
- Time: "3 days ago"
- Action: [View Trip]

**Notification 6:**
- Type icon: 🛡️ Safety Alert
- Title: "Your emergency contact was updated"
- Preview: "Emergency contact changed to Mom (555-1234). This information is shared with trip members."
- Time: "1 week ago"
- Action: [View]

**Notification 7-14:**
- Similar cards, older timestamps

**Empty State Notice (at bottom if user clears notifications):**
- "You're all caught up!" message

**Notification Center Optional Features:**
- "Mark all as read" link at top
- "Clear old notifications" option
- Settings link for notification preferences
- Snooze individual notifications: "Snooze 8 hours"

### Annotation Strategy:

```
🔴 PRIMARY:
   - Unread badge count (14)
   - First 3 notifications (most recent/important)
   - Notification types with icons (matching, messages, bookings)

🟡 SECONDARY:
   - Time stamps
   - Preview text
   - Notification filters

🟢 SUPPORTING:
   - "Mark all read" link
   - Settings
   - Older notifications
```

### Talking Points (1-2 minutes):

> "Notifications keep users engaged and informed. See this badge: 14 unread. Every match, message, booking confirmation comes through as a notification. Users can tap any notification to take action—view a new match, read a message, review their booking.

> Notice the diversity: matches (🤝), messages (💬), bookings (✅), reviews (⭐), safety alerts (🛡️). Different notification types for different needs. A booking confirmation is more urgent than a trip reminder, so it surfaces higher.

> Users can filter notifications—'Show me only messages' or 'I only want to see booking alerts.' They control their experience. And importantly, every notification is dismissible. We don't spam. We respect user attention."

---

# Complete Screenshot Checklist Summary

**Figure 1:** ✅ Landing Page  
**Figure 2A:** ✅ Register Step 1  
**Figure 2B:** ✅ Register Step 2  
**Figure 2C:** ✅ Register Step 3  
**Figure 3:** ✅ Discovery/Matching  
**Figure 4:** User Profile (NEXT)  
**Figure 5:** Trip Creation Form  
**Figure 6:** Chat Interface  
**Figure 7:** My Trips Dashboard  
**Figure 8:** Carpool/Vehicle Details  
**Figure 9:** Booking/Payment  
**Figure 10:** Admin Dashboard  
**Figure 10B:** Staff/Moderation Dashboard  
**Figure 11:** Safety Features (SOS + Verification)  
**Figure 12:** Reviews & Ratings  
**Figure 13:** Mobile Responsive Design  
**Figure 14:** Notifications Center  

---

# Recommended Presentation Order

**Minimum (6 figures):**
1. Landing Page (value prop)
2. Register Step 1 (OAuth friction reduction)
3. Register Step 2 (safety-first data)
4. Register Step 3 (algorithm input)
5. Discovery/Matching (algorithm output)
6. Chat (conversion to real trip)

**Comprehensive (10 figures):**
Above + User Profile + Trip Creation + My Trips + Booking

**Full Demo (14 figures):**
All of above + Admin + Staff + Safety + Reviews + Mobile + Notifications

**For your presentation:**
- **5 minutes:** Figures 1-3 (value prop + registration)
- **5 minutes:** Figure 4 (profile/trust)
- **5 minutes:** Figures 5-6 (trip creation + chat)
- **5 minutes:** Figure 3 (deep dive on algorithm)

**Total: 20 minutes**

---

# Your Next Steps

1. **Screenshot Figure 4 (User Profile)** - Show real user data with interests, verification, trip history
2. Take screenshot at 1440px width browser window
3. Annotate in PowerPoint:
   - Red circle: Profile photo, name, rating ⭐⭐⭐⭐⭐
   - Yellow box: Verification badges
   - Blue arrow: Interests matching Step 3 selections
4. Move to Figure 5 after profile is captured

Ready?
