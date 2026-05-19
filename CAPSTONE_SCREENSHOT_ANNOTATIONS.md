# PartyUp Capstone - Screenshot Annotation Guide

**Purpose:** Detailed instructions for capturing and annotating the top 3 critical screenshots for capstone presentation.

---

## Screenshot 1: Landing Page (Hero + App Preview)
**File:** `client/src/pages/PublicLanding.tsx`  
**URL:** `/landing`  
**Duration:** Full page view (may need vertical scroll)

### What to Show:
1. **Navigation Header** - Logo (P box), "PartyUp" title with "Travel Buddy" subtitle
2. **Hero Section** - Headline "Find Your Perfect Travel Buddy" + description of matching + carpool
3. **CTA Buttons** - "Learn More" and "Download the App" buttons
4. **Phone Mockup** - Show the Android phone frame with:
   - Status bar (9:41)
   - P logo header inside app
   - Two traveler cards (Sarah 92%, James 85%)
   - Interest tags (Food, Culture, Adventure)
   - Skip/Connect buttons
5. **Download Info Panel** - Detailing key features:
   - Smart matching scores
   - Real-time chat
   - Verified profiles & safety
   - Carpool & cost sharing

### Annotation Points:
- **Circle/highlight the 92% compatibility score** - This is the core algorithm
- **Annotate "Verified Profiles"** - Shows safety emphasis
- **Point to "Real-Time Chat"** - Core communication feature
- **Highlight the download button** - CTA

### Capstone Talking Points:
> "The landing page showcases our core value proposition: AI-powered travel buddy matching with verified safety features. The phone mockup demonstrates the clean UI showing compatibility scores, interests, and real-time matching capabilities."

---

## Screenshot 2: Register Flow (3-Step Form)
**File:** `client/src/pages/Register.tsx`  
**URL:** `/register`  
**Approach:** Take 3 separate screenshots OR 1 composite

### Screenshot 2A: Step 1 - Credentials
**Show:**
- Progress indicator (3 bars, 1st filled)
- "Create Account" heading
- Email input field
- Password input with show/hide toggle
- OAuth buttons (Google, GitHub)
- "Next" button

**Annotation:**
- Circle the **show/hide password toggle** - UX detail
- Highlight **OAuth options** - Reduces friction

### Screenshot 2B: Step 2 - Profile Information
**Show:**
- Progress indicator (3 bars, 2nd filled)
- "Tell Us About You" heading
- Full Name input
- Date of Birth picker with "{your age}" display
- "Safety Context" callout box explaining why DOB is needed
- "Next" button

**Annotation:**
- Point to **Safety Context callout** - Shows transparency
- Highlight **age display** - Instant verification feedback

### Screenshot 2C: Step 3 - Travel Interests (PRIMARY)
**Show:**
- Progress indicator (3 bars, all filled)
- "What Do You Love?" heading
- 12 emoji-labeled interest options with checkboxes:
  - 🎒 Backpacking
  - ✨ Luxury
  - 🏔️ Adventure
  - 🏛️ Cultural
  - 🏖️ Beach
  - ⛰️ Hiking
  - 🏙️ City
  - 🍜 Food
  - 🎉 Nightlife
  - 📸 Photography
  - 🧘 Wellness
  - 💰 Budget
- Selected items highlighted
- "Create Account" button

**Annotation:**
- **Circle 3-4 selected interests** - Shows multi-select capability
- Highlight that **all 12 options are visible** - No scrolling needed
- Point to **emoji labels** - User-friendly, clear categories

### Capstone Talking Points:
> "The 3-step registration form reduces cognitive load and increases completion rates. Step 1 handles authentication with OAuth support (Google, GitHub) and includes a Gmail OTP modal for email verification—users receive a 6-digit code to verify ownership. Step 2 collects safety-critical data (name and age verification). Step 3 is crucial for our matching algorithm—we collect 12 predefined travel interests that feed into our AI-powered compatibility scoring system. Users select multiple interests to create a preference profile."

---

## Screenshot 3: Discovery/Matching Page
**File:** `client/src/pages/Discovery.tsx`  
**URL:** `/discovery`

### What to Show:
**Primary View - Traveler Cards:**
1. **Header** - "Discover Travel Buddies" title + filter icon
2. **Filter Bar** (collapsed) - Shows current filters: Date, Budget, Interests
3. **Traveler Card (Main Focus)** displaying:
   - **Profile photo/avatar**
   - **Name & Age**
   - **Destination & Dates**
   - **✨ Compatibility Score (0-100%)** - Large, prominent
   - **Trip Type badge** (Solo/Group/Budget)
   - **Interests tags** - Matching user's selected interests
   - **Rating stars** - Community trust indicator
   - **Distance** - "45 km away"
   - **Action Buttons:** "Skip" + "Connect" (blue primary button)
4. **Stack of additional cards** - Show multiple matches available

### Optional Secondary View - Filter Modal:
**If space allows, show expanded filter modal:**
- Date range picker
- Budget slider
- Interest checkboxes (compact grid layout)
- Active filters badge count
- Apply/Clear buttons

### Annotation Points:
- **Highlight the Compatibility Score %** - Primary differentiator
  - Annotation: "AI-calculated based on interest overlap, dates, budget alignment"
- **Circle matching interests** - Show algorithm relevance
  - Example: If user likes "Adventure" & "Hiking", highlight these on card
- **Point to "Verified" badge/rating** - Safety feature
- **Show distance** - Geofencing capability
- **Emphasize Card Stack UI** - Multiple matches available

### Capstone Talking Points (IMPORTANT):
> "The Discovery page is where our AI matching algorithm shines. Each traveler card shows a real-time compatibility percentage calculated using:
>
> 1. **Interest Overlap** - Compares the user's selected interests from registration (e.g., Backpacking, Food tours) with this traveler's interests
> 2. **Date Alignment** - Ensures trip dates overlap sufficiently
> 3. **Budget Compatibility** - Matches cost expectations
> 4. **Distance Proximity** - Uses our geofencing technology to show nearby travelers
> 5. **Community Trust Score** - Incorporates ratings and verification status
>
> Users can quickly browse multiple matches (card stack UX) and decide to connect. The 'Connect' action initiates a match request and enables real-time chat through our integrated messaging system."

---

## Screenshot Capture Tips

### Desktop vs Mobile:
- **For Landing Page**: Capture full desktop width (1920px wide recommended)
- **For Register**: Desktop width shows all 12 interests without scrolling (key feature)
- **For Discovery**: Desktop shows card stack effect clearly

### Browser DevTools:
1. Right-click → "Inspect" → Device toggle (Cmd+Shift+M)
2. Set to desktop resolution: 1920x1080 or 1440x900
3. Zoom to 100% (Ctrl+0)
4. Use Lighthouse or disable animations for cleaner screenshots
5. Use "Screenshot" tool in DevTools to capture full page

### Annotation in PowerPoint/Figma:
- Use **arrows** to point to key elements
- Use **circles/boxes** to highlight metrics (92%, 3-step, 100+ interests)
- Use **text callouts** with brief descriptions (3-5 words max)
- Use **color coding**: Red for critical features, blue for supporting details

---

## Visual Hierarchy for Presentation

### Landing Page Focus:
```
🔴 PRIMARY: Phone mockup + Compatibility scores
🟡 SECONDARY: Feature list + Download button
⚪ TERTIARY: Hero text
```

### Register Flow Focus:
```
🔴 PRIMARY: Step 3 with 12 interests + progress bar
🟡 SECONDARY: Step 1 OAuth + Step 2 Safety context
⚪ TERTIARY: Form validation
```

### Discovery Page Focus:
```
🔴 PRIMARY: Compatibility score % + matching interests
🟡 SECONDARY: Traveler card details (name, age, rating)
⚪ TERTIARY: Filter options
```

---

## Presentation Talking Track

**Slide 1 - Landing Page:**
"This is PartyUp's public-facing landing page. It demonstrates our core value: AI-powered travel buddy matching. The phone mockup shows our actual app interface with real matching data—notice the 92% compatibility score between Sarah and her potential travel buddy. This isn't random; it's calculated by our algorithm."

**Slide 2 - Registration:**
"We created a 3-step registration flow to maximize data collection while minimizing user friction. Step 1 handles auth with OAuth support. Step 2 collects safety-critical data. But Step 3 is where the magic happens—we collect 12 predefined travel interests. These interests are the foundation of our matching algorithm."

**Slide 3 - Discovery & Matching:**
"Once registered, users browse the Discovery page. Each card shows a real-time compatibility score calculated from interest overlap, date alignment, budget compatibility, and community trust scores. Users can quickly browse multiple matches and decide to connect, which triggers real-time chat. This is our core matching algorithm in action."

---

## SEO/Accessibility Notes
- Landing page has meta tags for social sharing
- Register form has ARIA labels for accessibility
- Discovery page filtering is keyboard-navigable
- All images have alt text
- High contrast colors meet WCAG AA standards

---

## File Modification Notes
- All screenshots should be of **unmodified production code**
- No debug overlays or console logs visible
- No user data/PII visible (use realistic but non-identifying names)
- Ensure all text is legible in final screenshot size
