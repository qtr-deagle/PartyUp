# PartyUp Capstone - All 14 Figures Detailed Descriptions

## Figure 1: Landing Page

Landing Page: The landing page showcases our core value proposition: AI-powered travel buddy matching with verified safety features. The phone mockup demonstrates the clean UI showing compatibility scores (92%, 85%), interests, and real-time matching capabilities. It highlights the download CTA and key features: smart matching algorithm, real-time chat, verified profiles with safety badges, and trip coordination tools.

---

## Figure 2: Register Flow

Register Flow: The 3-step registration form reduces cognitive load and increases completion rates by breaking data collection into digestible steps. Step 1 handles authentication with OAuth support (Google, GitHub) to reduce friction and password fatigue, with a Gmail OTP modal for email verification—users receive a 6-digit code to confirm account ownership. Step 2 collects safety-critical data including name and date of birth for age verification and safety. Step 3 is crucial for our matching algorithm—we collect 12 predefined travel interests (Backpacking, Food, Adventure, Photography, etc.) that feed into our AI-powered compatibility scoring system. Users select multiple interests to create a preference profile that powers algorithmic matching.

---

## Figure 3: Discovery/Matching Page

Discovery/Matching Page: The Discovery page is the AI-powered matching engine where users browse travel buddy recommendations via an elegant card-stack interface. Each traveler card displays name, age, distance away, route, dates, trip purpose, interests, verification badges, and a real-time compatibility score calculated across five dimensions: interest overlap, date alignment, route compatibility, distance proximity via geofencing, and community trust score. On mobile, users swipe left to skip or right to connect; on desktop, a 3-column grid shows multiple matches simultaneously. The filter modal enables search refinement by location, date range, trip purpose, and compatibility threshold. Sorting options let users rank by compatibility, distance, date overlap, destination priority, or recent activity. This demonstrates PartyUp's algorithmic advantage: users see pre-scored matches ranked by success likelihood instead of random browsing, increasing conversion from match view to connection.

---

## Figure 3.5: Map/Location Discovery

Map/Location Discovery: The Map screen visualizes nearby travel buddy matches in real-time on an interactive Mapbox-style interface. The map displays the user's current location at center with geofence boundaries (safe zone rings), nearby traveler markers with distance badges positioned by direction and proximity, and emergency service locations (police, hospitals). A privacy badge reassures users "Your location is hidden until you match with someone," protecting user safety before mutual connection. Below the map, a "Nearby Travelers" list shows each match with name, distance in kilometers, destination, verification badges, and action buttons (Chat, View Profile). On mobile, the map takes up 2/3 of the screen with the traveler list scrollable below; on desktop, the map dominates the left side with a detailed sidebar on the right showing location status, safe zones, nearby matches, and emergency services. Zoom controls and toggle buttons enable users to show/hide geofence and emergency services. This demonstrates PartyUp's commitment to safety-first discovery: users maintain privacy while being able to find nearby travel buddies, always aware of their safety zone and emergency resources.

---

## Figure 4: Home Dashboard

Home Dashboard: The home dashboard is the live control center users see immediately after login, serving as the real-time command center for active trip management and safety oversight. It prominently displays the active trip section with destination, travel buddy name, pickup time countdown, live traffic status, and compatibility score with visual progress bar—enabling users to execute trips with complete information at a glance. The safety overview section provides real-time metrics including geofence status confirming "Within 5km safe zone," distance from travel buddy live tracking, and trust score with verification badges—ensuring users maintain awareness of safety metrics throughout their journey. The activity feed displays recent notifications with timestamps and icons, keeping users informed of buddy confirmations, trip updates, traffic alerts, and platform notifications. Quick action buttons for "Start Trip," "Share Location," "Find Nearby," and the prominent red SOS emergency button provide immediate access to critical functions. This dashboard demonstrates PartyUp's commitment to live coordination and real-time safety: users have complete visibility into active trips, buddy status, safety metrics, and emergency resources all on one screen, with information hierarchy optimized for mobile-first access where 85% of users engage during actual travel.

---

## Figure 4B: User Profile

User Profile: The user profile is the trust-building hub displaying a complete verified profile. It showcases all verification badges (Email ✓, Phone ✓, Identity ✓, Background Check ✓), star ratings and reviews from past trips, travel interests selected during registration that align with the algorithm, past trip history showing number of members and completion status, and authentic reviews from previous travel buddies. This page demonstrates that safety verification is embedded throughout and builds confidence in community quality.

---

## Figure 5: Trip Creation

Trip Creation: The trip creation form allows users to post a new adventure and attract travel buddies. Key fields include trip title, origin and destination (with map autocomplete), travel dates with duration calculation, trip interests (selecting 3-5 from 12 categories), description of the trip, number of travelers needed, and price per person for cost transparency. The form is intentionally simplified with only required fields to maximize completion rates. Simple forms increase user adoption because people post more trips, creating more matches and network effects.

---

## Figure 6: Chat Interface

Chat Interface: The chat interface is the real-time communication bridge between matched travelers. It displays message threads with user avatars, timestamps, and delivery status (single checkmark = sent, double checkmark = read). Online indicators show if the other person is active. Messages contain text and emojis showing natural conversation flow. This is where the 92% compatibility score from Discovery transforms into concrete trip planning: coordinating dates, discussing interests, building personal trust, and making final commitments before travel.

---

## Figure 7: My Trips Dashboard

My Trips Dashboard: The trips dashboard is the user's trip management hub showing all active, upcoming, and completed trips. Each trip card displays status badges (🟢 In Progress, 🟡 Upcoming, ✅ Completed), trip type badges indicating whether it's a Carpool or Tour, dates and duration, member avatars showing who you're traveling with, destination location, trip interests/purpose, user contribution price, and action buttons (View Details, Chat with Members, View on Map). The dashboard provides complete visibility into the entire trip lifecycle and demonstrates professional trip management capabilities.

---

## Figure 8: Carpool Ride Sharing

Carpool Ride Sharing: The carpool feature enables users to offer rides and find travel companions sharing the same route. Users can post "I'm driving to New York, come with me!" displaying their trip route, departure time, available seats, vehicle details (make/model, seating capacity), and their profile with verification badges. Other users can view nearby carpool offers and request to join. The feature emphasizes community contribution—travelers offering to share their car as a way to reduce environmental impact and help others travel together. No pricing involved; it's purely about matching people heading the same direction. This demonstrates PartyUp's core value: making travel social, economical through shared rides, and building community connections.

---

## Figure 8A: My Carpool Offers

My Carpool Offers: The My Carpool Offers page is the personal management hub for users offering rides. It displays summary metrics showing Active Listings (3), Ride Requests (12), Messages (5), and Trips Offered (8), giving users quick visibility into their carpool activity. The main section lists all offered vehicles with detailed cards showing vehicle photo emoji, model year, ratings from past riders (4.9⭐ with 28 reviews), specifications grid (Seats, Transmission, Fuel, Color), location, availability date ranges, response time (typically replies in X hours), and action buttons (View Details, Edit Listing). Each vehicle card demonstrates the driver's profile credibility through star ratings and review counts. 

The carpool registration process requires document verification for community safety: users must upload Official Receipt/Certificate of Registration (ORCR) and Driver's License. For users not the registered car owner, a Letter of Authorization from the owner is required, confirming permission to share the vehicle. These verification documents are reviewed by staff before the vehicle is approved for carpooling. Users can manage multiple vehicles, track ride requests from interested travelers, respond to inquiries, and maintain availability windows. This demonstrates PartyUp's peer-to-peer economy with safety-first verification: users become drivers, sharing their vehicles with the community and building reputation through ratings and interactions, with no financial transactions—just community contribution.

---

## Figure 8B: Carpool Booking Payment Modal

Carpool Booking Payment Modal: The payment modal is the commitment layer for carpool riders, transforming ride browsing into binding reservations with payment commitment. It displays a clean, mobile-optimized modal showing the selected ride summary (route: Makati → Laguna) prominently in the header. The fuel cost section breaks down costs transparently: displaying distance (45 km), available seats (3), and calculating each passenger's fair share (₱360) using the platform's ₱8/km rate split evenly—ensuring pricing is immediately visible and equitable. The payment deadline section uses visual urgency indicators: green for 7+ days remaining (📅 7 days), orange for 3-7 days (⏰ days left), and red for passed deadlines (❌ Deadline Passed). Users see the exact payment deadline date (Pay by 2026-02-18)—establishing clear commitment to prevent no-shows. The payment method selection offers two options (GCash and Maya mobile wallets), allowing users to choose their preferred payment channel suited to Philippine mobile payment preferences. Form inputs are compact (wallet account/phone number only) with real-time validation and secure encryption. The "Confirm & Pay" button makes clear this is both a payment commitment AND a ride request. The info footer clarifies: "Your share of fuel cost split evenly. No commission." This demonstrates PartyUp's anti-scam design: binding payment commitment with fair pricing transparency, deadline enforcement to lock in participation, and streamlined payment options meeting Philippine user preferences (GCash and Maya dominate mobile payments). No pricing surprises, no hidden fees, just equitable cost-sharing with commitment enforcement.

---

## Figure 9: Trip Confirmation

Trip Confirmation: The trip confirmation page is the final commitment step where users confirm their participation in a trip. It displays trip summary (dates, members, destination), traveler information, safety checklist (emergency contact shared, itinerary saved, location sharing active), and action buttons for confirmation. This page ensures all participants are aligned on trip details and safety protocols before travel begins.

---

## Figure 10: Admin Dashboard

Admin Dashboard: The admin dashboard is the system oversight hub for monitoring platform health and growth. It displays 4 key KPI cards: Active Users (3,247, +12% trend), Active Trips (142, +8% trend), Trip Completion Rate (94.2%, +5% trend), and Safety Incidents (2, -50% trend). Additional sections show recent trip activity table, system health alerts, moderation queue, and user statistics. This demonstrates professional infrastructure for scaling: monitoring user growth, trip activity, completion rates, and most importantly—tracking safety performance and incident trends.

---

## Figure 10B: Staff Dashboard

Staff Dashboard: The staff dashboard is the safety and moderation command center where moderators protect the community. The main navigation includes: Dashboard (real-time monitoring hub), User Reports (review community-reported users), and Trip Monitor (track live trips for safety concerns). The dashboard displays urgent SOS alerts prominently at the top (red, immediately visible), prioritized moderation queue with severity levels (P1 emergencies like SOS activations, P2 safety violations like harassment, P3 policy violations), key metrics cards showing pending reports, active reports, and active trips, escalation activity logs showing recent moderator actions, emergency contact shortcuts for rapid response, and daily statistics (trips monitored, SOS calls handled, violations flagged, users banned). This demonstrates commitment to continuous safety: every trip monitored, every violation reviewed, every emergency answered.

---

## Figure 10D: User Reports

User Reports: The User Reports page is where community members report suspicious or inappropriate behavior. It displays a table showing Reporter (user who submitted report), Reported User (profile name and ID), Reason (report category like "Inappropriate behavior," "Safety violation," "Policy breach"), Time (when report was submitted), and Action buttons (Review for investigation). The table shows real-time report details including reporter information, reported user details, and report severity. Staff can click [Review] to examine the reported user's profile, view chat history, check verification status, review previous reports, and take appropriate action (warning, suspension, or removal). Empty state shows when no active reports exist. This demonstrates community-driven safety: users empowered to flag violations, transparent review process, and swift moderation maintaining a safe platform for all travelers.

---

## Figure 10E: Trip Monitoring

Trip Monitoring: The Trip Monitoring page is the real-time safety oversight center for active trips. It displays a searchable table with columns: Trip ID, Trip Location, Type (color-coded badges: blue for carpool, purple for touring), Travelers (participant names), Status (in-progress badge), Safety (Normal in green or Alert in red with warning icon), Time (elapsed duration since trip start), and Action (eye icon for detailed viewing). The search bar enables filtering by trip ID or traveler names. Each row represents a currently active trip being monitored by staff with unique trip identifiers. Example trips include Trip ID #456 Manila to Laguna (carpool, John + Jane, Normal safety), Trip ID #453 Manila → Tagaytay → Batangas (touring, Mike + Sarah, Normal safety), and Trip ID #451 Makati to Antipolo (carpool, Tom + Lisa, Alert safety). All trips are Luzon-based locations. Touring trips display multi-location itineraries showing the complete route. Type badges provide instant visual distinction between carpool and touring trips for efficient monitoring. Staff can click the eye icon to access live location tracking, view member communications, check real-time safety metrics, and escalate if needed. Red "Alert" badges highlight trips with safety concerns (geofencing violations, SOS proximity, communication issues). This demonstrates constant vigilance: every active trip is monitored, every trip type tracked, every safety metric recorded, enabling immediate response to any emerging threats during travel.

---

## Figure 11: Safety Features

Safety Features: Safety infrastructure is embedded throughout the platform. Users see the prominent red SOS button (available during active trips) for emergency response, live location tracking map showing all trip member positions with real-time updates every 30 seconds, and safety checklist confirming (emergency contact shared, itinerary saved, SOS alert team active, location tracking active). On profiles, users see all 5 verification badges (Email, Phone, Identity, Background Check, Trip History), trust score (95/100 example) with detailed breakdown (completion rate %, response time, review rating, violation history, days on platform). This proves safety is not an afterthought but foundational to every interaction.

---

## Figure 12: Reviews & Ratings

Reviews & Ratings: The review system builds community trust through transparent social proof. It displays overall rating (4.8⭐ average), rating distribution breakdown (39 five-star, 6 four-star, 1 three-star—genuine mix showing credibility), and detailed review cards with reviewer names, specific feedback ("Great communication before trip, punctual, and kind"), trip reference and dates, helpful vote counts showing review quality assessment. The presence of mixed ratings (not all 5-stars) and authentic feedback from verified travelers demonstrates genuine community feedback. Users can filter and sort reviews by helpfulness, recency, and rating to inform travel partner decisions.

---

## Figure 13: Mobile Responsive

Mobile Responsive: PartyUp is designed mobile-first because 85% of users access from phones. Comparing desktop (1440px) and mobile (375px) views shows responsive design in action: Discovery cards stack vertically on mobile instead of horizontal grid, filter modal transforms from side panel to collapsible bottom sheet, touch-friendly button sizes (44-50px minimum height for easy tapping), input fields take full width with proper keyboard handling. Text remains readable at mobile scale, gesture indicators show swipe capability, and all core functionality works seamlessly on small screens. This demonstrates we prioritize user reality: mobile is primary, desktop is secondary.

---

## Figure 10G: Admin Staff Management

Admin Staff Management: The Staff Management page is the team administration hub where admins manage moderators and verifiers. It displays a comprehensive table with Name (staff member name and email), Role (Senior Moderator, Moderator, Trip Verifier), Status (active/inactive badges), Joined (onboarding date), Resolved (case resolution count), and Actions (edit/delete icons). The search bar at the top enables quick lookup by name or email. The "Add Staff" button in the top-right allows admins to recruit new moderation team members. This page demonstrates professional team management: transparent view of who's on staff, their specialization, their track record, and streamlined onboarding/offboarding capabilities.

---

## Figure 10G: Admin Analytics Dashboard

Admin Analytics Dashboard: The Analytics page is the business intelligence hub displaying performance metrics and trends. It shows 4 metric cards (Total Trips: 2,847; New Users: +342; Trip Completion: 94.2%; Avg Resolution: 2.4h) with comparison percentages and trend indicators. The "Weekly Performance" table displays historical data showing Period (Week 1-4), Trips completed with numbers, and Reports reviewed with orange color-coded badges for severity. Below that are "Key Metrics" section with progress bars showing Trip Completion Rate (94.2%), User Retention Rate (92%), and Platform Uptime (99.8%) with visual progress indicators and accurate percentages. The "Top Regions" section shows geographic breakdown of platform activity with specific cities (New York 28.4% / 342 trips, Los Angeles 23.1% / 289 trips, Chicago 17.2% / 215 trips). This demonstrates business intelligence for strategic decision-making: understanding platform health, identifying growth trends, optimizing regional operations, and monitoring critical infrastructure uptime.

---

## Figure 10H: Admin Users Management

Admin Users Management: The Users Management page is the user administration hub where admins manage platform users. It displays a searchable table with User (name and avatar), Email, Role (Traveler), Status (Active/Suspended/Inactive), Verified (checkmark status), and Actions (icons). The search bar filters users by name or email. Status badges indicate user health (Active in green, Suspended in red, Inactive in gray). The Verified column shows verification completion status with checkmarks. Action icons enable quick edit, view profile, or delete operations. This page demonstrates complete user lifecycle management: visibility into user status, verification completion, rapid suspension capability for safety oversight, and administrative controls for user management when needed.

---

## Figure 10I: Admin Trips Management

Admin Trips Management: The Trips Management page is the trip administration hub tracking all platform trips. It displays a table with Type (color-coded badges: blue for carpool, purple for touring), Destination (location with map icon), Organizer (trip creator name), Start Date (journey date), Members (count with people icon), Status (Active/Completed/Planned badges), and Actions (three-dot menu). The search bar filters by destination or organizer. Status badges show trip lifecycle stages in real-time. Member counts provide visibility into trip utilization. Action buttons enable viewing trip details, monitoring active trips, or managing trip access. Example trips include: Carpool to Antipolo (John Doe, 2026-03-15, 3 members, Active), Touring to Manila → Makati → Quezon City (Jane Smith, 2026-04-10, 5 members, Active), Carpool to Laguna (Mike Johnson, 2026-02-20, 2 members, Completed), Touring to Tagaytay → Cavite → Datangas (Sarah Williams, 2026-05-01, 4 members, Active), and Carpool to Baguio (Tom Brown, 2026-06-15, 1 member, Planned). This page demonstrates trip oversight: monitoring trip volume, identifying popular destinations, tracking organizer activity, and intervening when safety concerns arise.

---

## Figure 10J: Admin Reports Management

Admin Reports Management: The Reports Management page is the user report review hub where admins process community reports. It displays a table with Reporter (who flagged the issue), Reported User (subject of complaint), Reason (violation type), Date (report timestamp), Severity (High/Medium/Low color-coded badges), Status (Pending/Resolved/Investigating), and Actions (review/flag/delete icons). The search bar filters by reporter, reported user, or reason. The "Export" button enables data export for audits. Severity badges prioritize critical issues. Status tracking shows progression of investigations. This page demonstrates community trust: responsive report handling, transparent investigation process, and swift action on violations—proving the platform actively protects users.

---

## Figure 10K: Admin Audit Log

Admin Audit Log: The Audit Log page is the compliance and accountability hub tracking all staff actions. It displays a comprehensive table with Staff Member (who took the action), Action (what was done), Target (affected resource), Severity (High/Medium/Low badges), Timestamp (when action occurred). The search bar filters by staff member or action. The "All Severities" filter allows drilling into specific action types. Below the log are summarized cards: "Total Actions (Today)" showing 342 with trend comparison, "High Severity Actions" showing 8 requiring attention, and "Most Active Staff" showing top performer Sarah Johnson with 89 actions this week. This page demonstrates compliance-ready infrastructure: complete audit trail of all moderation decisions, accountability for every action, and transparent governance showing platform safety is systematized and monitored.


Notifications: The notifications center is the engagement and communication hub keeping users informed throughout their journey. It displays unread badge count (14 unread example), filterable notification types (All/Matches/Messages/Trip Updates/Reminders/Safety). The chronological notification list shows: type icon (💬 Message, ✅ Trip Confirmed, 🤝 New Match, ⭐ Review Posted, 🗺️ Trip Reminder, 🛡️ Safety Alert), title, preview text, timestamp (Just now, 2 hours ago, etc.), and action buttons ([View] [Accept] [Respond]). Unread notifications have distinct styling to guide user attention. This keeps travelers engaged with real-time updates on matches, messages, trip confirmations, trip reminders, and safety alerts—the complete lifecycle of trip planning and execution.

---

## Figure 15: Trusted Circle & Emergency Contact Management

Trusted Circle: The Trusted Circle is PartyUp's safety-first emergency contact management system enabling users to designate trusted people who receive real-time SOS alerts during trips. The mobile-optimized interface displays quick-access statistics (Total Contacts, Alerts Enabled, Verified count) and comprehensive contact cards showing full name, color-coded relationship types (Parent, Friend, Sibling, Spouse, Colleague, Guardian, Other), phone number as primary contact, email address, emergency medical information in yellow-highlighted alert boxes, added date, and dual action buttons to enable/disable SOS notifications or remove contacts. The two-step Add Emergency Contact modal streamlines data collection: Step 1 captures Full Name, Phone Number (with international format validation), optional Email, and Relationship with an informational banner; Step 2 collects optional emergency medical information (200 characters) with a warning banner and contact summary confirmation. A progress bar shows step completion. The page footer includes a "How It Works" section explaining three key capabilities: 🚨 Emergency Alert (tap SOS to instantly alert all enabled contacts), 📍 Real-Time Location (share live location with trusted people), and 🔒 Secure & Private (info only shared in emergencies with verified contacts). This comprehensive feature demonstrates PartyUp's commitment to proactive safety through explicit contact designation, user-controlled alert settings, secure medical information storage, and transparent emergency workflows.

---

## Figure 14: Edit Profile

Edit Profile: The Edit Profile page allows users to update and manage their personal information and travel preferences. It displays a compact sticky header with back and save buttons for easy navigation. Users can edit core profile information including name, age, location, bio, travel style (Budget/Mid-range/Luxury), and budget range. The page features a dynamic interests management section where users can add or remove interests from predefined categories (Hiking, Beaches, Food, Adventure, etc.) that feed into the matching algorithm. Real-time form validation ensures data quality before saving. Save functionality is fully async with toast notifications confirming successful updates, allowing users to continuously refine their profile to improve match quality and attract better travel companions.

---

## Figure 15: Tours Browsing

Tours Browsing: The Tours page is the platform's group travel hub showcasing organized multi-day experiences. It features a tab-based navigation system with three sections: Browse Tours (discover available group journeys), My Tours (tours the user has joined), and Interested (tours saved for later consideration). Each tour card displays comprehensive information including tour title, destination, organizer name with verification badge, star rating (4.6-4.9★), review count, number of current participants, travel dates, price per person (₱1200-5800), and trip interests/themes. A search bar enables filtering by tour title or destination. The favorite/wishlist button (heart icon) allows users to save tours of interest. The "Join Tour" button initiates tour participation with success confirmation. This demonstrates how PartyUp enables travelers to discover, evaluate, and join organized group adventures all in one place, reducing the friction of group trip planning.

---

## Figure 16: Create Tours

Create Tours: The Create Tours page empowers organizers to design and post new group travel experiences. It features a form-based interface with essential fields: trip title, destination, start date, duration in days, maximum participants, price per person, and detailed description. A critical component is the dynamic itinerary builder allowing organizers to add/remove day-by-day activities and highlights for multi-day trips. The interests selection system presents 12 predefined travel categories (Hiking, Museums, Food, Photography, Beaches, Shopping, Nightlife, History, Nature, Art, Adventure, Relaxation) that organizers select to tag their tour and attract matching travelers. Form validation ensures all required fields are completed before submission. Upon successful creation, the organizer is navigated to their tour management dashboard. This demonstrates democratization of tour organizing: empowering regular travelers to become tour leaders and monetize their travel expertise.

---

## Figure 17: Manage Tours

Manage Tours: The Tours Management page is the organizer's command center for tracking their created tours. It displays an ultra-compact sticky header with embedded statistics showing Active Tours count, Total Participants across all tours, and Average Rating from tour reviews. The main content is divided into two sections: Active Tours and Completed Tours. Each tour card displays the tour title, destination, status badge (Active in green, Completed in gray), current/max participant count, average rating with review count, and action buttons (View Participants, Edit, Delete). The View Participants button shows all joiners with their names and verification status. Edit enables updating tour details. Delete removes completed tours. Statistics cards above provide real-time visibility into organizer performance and activity level, enabling organizers to monitor their tours, respond to participants, and iterate on successful trip designs.

---

## Figure 17A: Tour Participation Details

Tour Participation Details: The Tour Details modal displays comprehensive information for a tour the user has joined or is considering. It prominently shows the tour route (Makati → Laguna), trip status badge (🟢 In Progress, 🟡 Upcoming, ✅ Completed), and key metrics including estimated travel time (25 mins), distance (45 km), and price per person (₱360) displayed in a 3-column grid for immediate visibility. The organizer's profile section shows name, rating with verification badge, and vehicle details (e.g., "Honda Civic: LFB 4321"). The participants section displays current/max capacity (1/3 passengers) with a list of fellow travelers showing names and avatars. A prominent "View Live Map" button enables real-time route tracking. Quick action buttons (Call, Message, Report) provide communication and safety options. This modal serves as the bridge between tour discovery and active participation, giving users all information needed to confidently join and coordinate travel.

---

## Figure 17B: My Participated Tours

My Participated Tours: The My Participated Tours page is the participant's hub for tracking tours they've joined. It displays a tabbed navigation system with sections: Active Tours (currently traveling), Upcoming Tours (scheduled for future), and Completed Tours (past trips). Each tour card shows trip type badge (🚗 Carpool or ✈️ Tour), status indicator (🟢 In Progress, 🟡 Upcoming, ✅ Completed), route information (pick-up location → destination), departure date/time, participant count (current/max), trip interests/purpose, and the participant's financial contribution price per person prominently displayed. Additional details include organizer name with rating, estimated distance, and action buttons (View Details, Chat with Organizer, View on Map). A sticky header provides quick statistics showing Total Tours Joined, Upcoming Count, and Total Amount Contributed. For carpool trips, it displays fuel cost breakdown; for tours, it shows the tour package price. This comprehensive view gives participants complete visibility into their tour participation, enabling coordination and financial tracking across multiple experiences.

---

## Figure 17C: Tour Booking Payment Modal

Tour Booking Payment Modal: The Tour Booking confirmation modal is the commitment layer transforming tour interest into binding reservations with payment confirmation. It displays a clean, mobile-optimized interface showing tour summary prominently: destination, dates, organizer name, available spots remaining, and group size. The pricing section provides full transparency with clearly labeled costs: tour package price per person, number of days, total amount due (price × participants), displayed in distinct highlighted boxes. The payment deadline section uses visual urgency indicators: green for dates with 7+ days remaining (📅 7 days left), orange for 3-7 days (⏰ hurry), and red for imminent deadlines (❌ Payment Due Soon). Users see the exact payment deadline date and a commitment warning: "Spot reserved for 24 hours after payment—cancellation fees apply per tour terms." The payment method selection offers flexible options (Credit/Debit Card, GCash mobile wallet, PayPal) accommodating Philippine user preferences. Form inputs are compact with real-time validation and secure encryption. Dual-action buttons (Cancel, Confirm & Pay) make clear this is both a financial commitment and group participation confirmation. This demonstrates PartyUp's anti-fraud design: binding payment commitment with transparent pricing, deadline enforcement to secure spots, and flexible payment options. No pricing surprises, just clear cost breakdown with group participation commitment.

---

## Figure 21: Admin Feedback Management

Admin Feedback Management: The Feedback Management page is the admin tool for reviewing and responding to user feedback. It displays real-time statistics cards showing Total Feedback submitted, Unreviewed count requiring attention, Average Rating across all feedback, and Positive Feedback percentage. A compact filtering section enables searching by keyword, filtering by rating (all, 1-star through 5-star), and filtering by status (Unreviewed, Reviewed). Each feedback card displays the author avatar and name, feedback type badge (Trip in blue, Car in purple, Platform in gray), star rating, subject line, full feedback message, submission date, and status indicator. Unreviewed items show a clock icon; reviewed items show a checkmark icon. Action buttons allow Mark as Reviewed to update status and Respond to send feedback to the user. Feedback cards for unreviewed items have a highlighted border drawing attention. This demonstrates systematic feedback collection and response: capturing authentic user sentiment, triaging issues, and closing the loop through admin responses to build user trust.

---

## Figure 22: Admin Payment Issues

Admin Payment Issues: The Payment Issues page is the admin tool for tracking and managing payment-related problems reported by users. It displays key statistic cards including Total Issues reported, Pending Issues count (red badge), Currently Investigating count (blue badge), and Total Amount Affected by all issues (in currency). A search bar enables filtering by reporter name, subject, or related transaction ID. Status filtering allows viewing All, Pending, Investigating, or Resolved issues. Each issue card displays reporter name with avatar, issue subject, detailed description, amount affected, issue status (Pending/Investigating/Resolved with color coding), severity level (High=red, Medium=orange, Low=yellow), submission date, and related transaction identifier. Action buttons enable View Details for full investigation interface, Add Notes for recording progress, and Forward to Admin for escalation. Severity color coding prioritizes critical high-impact issues. This demonstrates financial oversight and dispute resolution: tracking payment problems systematically, enabling staff to investigate and resolve issues, and building user confidence in transaction security and dispute handling.

---

## Quick Navigation

1. Landing Page - ✅ Shows platform value
2. Register Flow - ✅ 3-step onboarding
3. Discovery - ✅ AI algorithm in action
3.5. Map - ✅ Location-based discovery
4. User Profile - ✅ Trust and verification
5. Trip Creation - ✅ User-generated content
6. Chat - ✅ Communication
7. My Trips - ✅ Trip management
8. Carpool Ride Sharing - ✅ Community contribution
8A. My Carpool Offers - ✅ Personal vehicle management
9. Trip Confirmation - ✅ Pre-travel prep
10. Admin Dashboard - ✅ System health
10B. Staff Dashboard - ✅ Safety command center
10C. User Reports - ✅ Community moderation
10D. Trip Monitoring - ✅ Real-time oversight
10E. Admin Staff - ✅ Team management
10F. Admin Analytics - ✅ Business intelligence
10G. Admin Users - ✅ User administration
10H. Admin Trips - ✅ Trip oversight
10I. Admin Reports - ✅ Report review
10J. Admin Audit Log - ✅ Compliance & accountability
11. Safety Features - ✅ Built-in protection
12. Reviews - ✅ Social proof
13. Mobile & Notifications - ✅ User engagement
14. Edit Profile - ✅ Profile customization & preferences
15. Tours Browsing - ✅ Group travel discovery
16. Create Tours - ✅ Organizer empowerment
17. Manage Tours - ✅ Tour lifecycle management
17A. Tour Participation Details - ✅ Tour info modal for participants
17B. My Participated Tours - ✅ Participant's tour management hub
17C. Tour Booking Payment Modal - ✅ Tour payment commitment layer
21. Admin Feedback - ✅ User feedback collection & response
22. Admin Payment Issues - ✅ Payment dispute resolution
