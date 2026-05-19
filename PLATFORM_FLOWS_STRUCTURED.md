# PartyUp Platform - User Flows Documentation

## Platform Overview
PartyUp is a ride-sharing platform with three user roles: Travelers (regular users), Staff (moderators), and Admins (system managers).

---

## 1. TRAVELER FLOWS

### 1.1 Report a User Flow
**Entry Point:** Home Dashboard → Report Option
- Select User to Report
- Provide Reason for Report
- Submit Report to Staff
- **Outcome:** Report Submitted

### 1.2 Find & Book a Trip Flow
**Two Path Options:**

#### Path A: Browse Discovery
1. Go to Discovery Page
2. Filter trips by:
   - Destination
   - Dates
   - Budget
   - Travel Style
3. View Matching Travelers
4. Check Compatibility Score & Ratings
5. **Decision:** Interested?
   - **No:** Return to filter (loop)
   - **Yes:** Send Match Request

#### Path B: Post Own Trip
1. Fill Trip Details:
   - Origin
   - Destination
   - Date
   - Budget
2. Trip is Created & Confirmed
3. System Notifies Matching Buddies
4. Traveler Receives Match Requests

### 1.3 Match & Coordination Flow
1. Wait for Response / Receive Match Requests
2. **Decision:** Review Buddy Requests?
   - **Yes:** View Buddy Profile & Ratings
     - **Accept?** 
       - No → Reject Request (return to receive)
       - Yes → Chat with Buddy
   - **No:** Skip to Trip Goes Live

3. Chat with Buddy
4. Coordinate Details:
   - Time
   - Location
   - Budget Split
5. **Confirm Trip?**
   - No → Return to Chat
   - Yes → Trip Created & Confirmed

### 1.4 Active Trip Flow
1. Trip Goes Live (Active Trip Status)
2. Track Location on Map
3. Real-time Chat & Location Sharing
4. **Trip Complete?**
   - In Progress → Stay in Real-time Chat
   - Completed → Proceed to Rating

### 1.5 Post-Trip Rating Flow
1. Rate & Review Buddy (1–5 Stars)
2. Write Review
3. **Add to Trusted Circle?**
   - Yes → Save Trusted Contact
   - No → Trip Complete
4. **Outcome:** Trip Complete

---

## 2. STAFF FLOWS

### 2.1 Handle Reported Users Flow

**Entry Point:** Staff Dashboard → Reported Users Queue

#### Investigation Phase:
1. Select Reported User Case
2. View Report Details:
   - Complaint
   - Evidence
3. Review User Profile:
   - History
   - Past Reports
   - Ratings
4. Investigate Reported User
5. Check Evidence:
   - Chat messages
   - Trip history
   - Violations

#### Decision: Evidence of Violation?

**Path A: Yes** → Proceed with Action

**Path B: No** → Request More Info from Reporter
1. Contact Reporter for Clarification
2. Wait for Response (Max 48 Hours)
3. **Decision:** Reply Received?
   - **Yes:** Review New Info
     - **Sufficient Evidence?**
       - Yes → Proceed with Action
       - No → Close Case: No Violation Found
   - **No:** Close Case: Insufficient Evidence

#### Action Decision:
Choose one action:
- **Verify:** Mark User as Verified
- **Suspend:** Suspend User Account
- **Ban:** Permanently Ban User
- **Monitor:** Add to Monitoring List
- **Warning:** Send Warning to User

#### Resolution:
1. Document Action
2. Notify Reported User
3. Notify Reporter
4. Add Notes to User Profile
5. Mark Case as Resolved
6. **Outcome:** Case Complete

---

### 2.2 Vehicle Verification Flow

**Entry Point:** Staff Dashboard → Vehicle Verification Queue

#### Approval Preparation:
1. Select Vehicle
2. View Vehicle Details:
   - Make, Model, Year
   - License Plate, VIN
3. Review Documents:
   - Proof
   - Insurance
   - Registration
   - Photos

#### Document Check:
**Documents Complete?**
- **No:** Request Missing Documents
  - Wait for Response
  - **Documents Received?**
    - Yes → Validate Information
    - No → Reject Vehicle Registration
- **Yes:** Validate Information

#### Validation:
1. Validate Information
2. **Vehicle Valid?**
   - **No:** Reject Vehicle Registration
   - **Yes:** Approve Vehicle

#### Rejection Path:
1. Notify Owner: Rejected
2. Provide Reason for Rejection
3. **Outcome:** Vehicle Rejected

#### Approval Path:
1. Document Verification
2. Notify Owner: Approved
3. Vehicle Active
4. **Outcome:** Vehicle Approved

---

## 3. ADMIN FLOWS

### 3.1 Admin Dashboard Overview
View Platform KPIs:
- Total Users
- Trips
- Safety Score

**Primary Menu Options:**
1. Manage Users
2. Analytics
3. Manage Staff
4. Settings
5. Audit Log

---

### 3.2 User Management Flow

1. Search for User
2. View User Profile:
   - Status
   - Ratings
   - Flags
3. **User has Flags?**
   - **Yes:** Review Flagged Activity
     - **Decision:** Verify, Suspend, Ban, Monitor, or No Action
   - **No:** Take Action Decision?

#### Action Options (same as Staff):
- Verify → Mark as Verified
- Suspend → Suspend User
- Ban → Ban User
- Monitor → Add to Monitoring List
- No Action → Return to Search or Done

1. Log Action
2. Return to Search Another or Go to Dashboard

---

### 3.3 Analytics Flow

1. Select Metric Type:
   - **Trips:** Trip Stats
   - **Users:** User Stats
   - **Reports:** Report Stats
   - **Safety:** Safety Metrics

2. View Trends (for selected metric)
3. **Export?**
   - **Yes:** Download Report → Return to Dashboard
   - **No:** Return to Dashboard

---

### 3.4 Staff Management Flow

1. View All Staff

#### Staff Operations Menu:

**A. Performance Review:**
- View Staff Performance
- Return to Staff List

**B. Create New Staff:**
1. Hire New Staff
2. Fill Information:
   - Name
   - Email
   - Role: Moderator
3. Send Activation Email
4. Log Staff Creation
5. Return to Staff List

**C. Edit Staff Member:**
1. Edit Staff Member Info
2. Change Permissions:
   - Reports handling
   - Verification
   - Suspension authority
3. Log Changes
4. Return to Staff List

**D. Deactivate Staff:**
1. Deactivate Staff
2. **Confirm Deactivation?**
   - **Yes:** Deactivate Account
   - **No:** Return to Staff List
3. Log Deactivation
4. Return to Staff List

---

### 3.5 Settings/Configuration Flow

1. Select Setting to Toggle:
   - **Maintenance:** Enable/Disable Maintenance Mode
   - **Registration:** Allow/Disable Signups
   - **Booking:** Enable/Disable Booking
   - **SOS:** Configure SOS Alerts
   - **Max Reports:** Set Max Reports per User

2. Save Configuration
3. Notify Staff of Changes
4. Return to Dashboard

---

### 3.6 Audit Log Flow

1. Filter Audit Log
2. View Logged Actions
3. **Review Detail?**
   - **Yes:** View Full Details → Return to Dashboard
   - **No:** Return to Dashboard

---

## Key Decision Points Summary

| Flow | Decisions |
|------|-----------|
| Trip Booking | Interested? (loop if no) |
| Trip Confirmation | Confirm Trip? (loop if no) |
| Trip Status | Trip Complete? (loop if ongoing) |
| Match Requests | Review Requests? (Yes/No) |
| Accept Match | Accept Buddy? (Yes/No) |
| Trusted Circle | Add to Trusted? (Yes/No) |
| Report Investigation | Evidence Found? (Yes/No) |
| Evidence Follow-up | Reply Received? (Yes/No) |
| Sufficient Evidence | Sufficient Evidence? (Yes/No) |
| Vehicle Documents | Complete? (Yes/No) |
| Vehicle Received | Documents Received? (Yes/No) |
| Vehicle Valid | Valid? (Yes/No) |
| User Flags | Has Flags? (Yes/No) |
| Action Taken | Take Action? (Yes/No) |
| Analytics Export | Export? (Yes/No) |
| Staff Deactivation | Confirm? (Yes/No) |
| Audit Detail | Review Detail? (Yes/No) |

---

## Color Coding Reference (From Original Diagram)
- **Blue tones:** Traveler flows
- **Orange tones:** Staff flows
- **Purple tones:** Admin flows
- **Darker shades:** Completion/final states

---

## System Outcomes
- **Traveler:** Trip Complete, Report Submitted
- **Staff:** Case Complete, Vehicle Approved/Rejected
- **Admin:** Return to Dashboard, Decisions Logged
