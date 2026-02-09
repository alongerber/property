# DiraLi — דירה לי
## Product Requirements Document v1.0
### Real Estate Purchase Management System
**For:** Alon Gerber | **Built with:** Claude Code
**Tech Stack:** React + Vite + TailwindCSS + Zustand + Supabase
**Date:** February 2026

---

## Table of Contents
1. Project Overview & Architecture
2. Tech Stack & Project Setup
3. Data Models & State Management
4. Module 1: Dashboard
5. Module 2: Property Cards (Kanban Pipeline)
6. Module 3: Equity Manager
7. Module 4: Comparison Engine
8. Module 5: Mortgage Calculator
9. Module 6: Task & Activity Tracker
10. Module 7: AI Advisors
11. Module 8: Timeline & Milestones
12. Module 9: Decision Matrix (part of Compare)
13. Module 10: Scenario Simulator
14. Global Components & Layout
15. Image & Photo Management
16. Design System & Visual Language
17. RTL & Hebrew Considerations
18. Reference: Demo File (apartment-finder.jsx)
19. Implementation Phases
20. File Structure

---

## 1. PROJECT OVERVIEW & ARCHITECTURE

### 1.1 What Is This

DiraLi is a personal real estate purchase management app. It is NOT a generic real estate platform. It is a CRM for the single most important purchase of Alon's life. Every design decision serves one user making one decision in a 2-month window.

### 1.2 Core Problem

Alon is comparing 5-6 apartments in Nesher, Israel. His lease expires April 1, 2026. He needs to:

- Track each property through a pipeline (found → researched → toured → negotiating → contract → closed/dropped)
- Manage dynamic equity from 4 sources (amounts not yet finalized)
- Calculate mortgage scenarios with real Israeli tax brackets (2026)
- Document everything: calls, tours, WhatsApp messages, decisions
- Compare properties with weighted scoring, not just side-by-side
- Get AI-powered insights from 3 specialist personas
- See at a glance where every property stands in 10 seconds

### 1.3 User Context

- **Name:** Alon, 41, divorced, 3 children (50/50 custody)
- **Current:** Renting at Alon 36, Nesher — lease ends 01/04/2026
- **Owns:** Half of an apartment in Duchifat (shared with ex-wife Hila) — offered to sell his half based on 2.9M valuation
- **Income:** 13,700 NIS net + 13th salary at 75% → banking income ~14,556 NIS
- **Inheritance:** Pending from Avtalion (amount unknown)

### 1.4 Design Philosophy

- **Dark theme only** — no light mode. Slate/Navy backgrounds (#0B1120, #0F172A, #1E293B) with high-contrast text
- **Mobile-responsive but desktop-first** — primary use on desktop browser. Must work on mobile for quick updates
- **RTL-native** — entire app in Hebrew. Direction RTL. All layouts respect this
- **Speed over beauty** — adding a note should take 3 taps max. Changing property status = single drag or click. Must feel faster than a spreadsheet

### 1.5 Architecture

Single-page React application:
- `React 18+` with functional components and hooks only
- `Vite` for build tooling
- `TailwindCSS` for styling (with RTL plugin: tailwindcss-rtl)
- `Zustand` for state management (single store, persist middleware for localStorage)
- `Supabase` for backend (auth, database, storage for images, real-time sync)
- `React Router v6` for navigation
- `Framer Motion` for animations
- `Recharts` for data visualization
- `@hello-pangea/dnd` for Kanban drag-and-drop

**Why Supabase:** Free tier sufficient. Auth, Postgres, file storage, real-time. No server code needed.
**Why Zustand over Redux:** Simpler API, less boilerplate, built-in persist. Ideal for single-user app.

---

## 2. TECH STACK & PROJECT SETUP

### 2.1 Initialization

```bash
npm create vite@latest dirali -- --template react
cd dirali
npm install
```

### 2.2 Dependencies

| Package | Purpose | Version |
|---------|---------|---------|
| react, react-dom | UI framework | ^18.3 |
| react-router-dom | Client-side routing | ^6.x |
| tailwindcss, @tailwindcss/vite | Styling | ^4.x |
| tailwindcss-rtl | RTL support | latest |
| zustand | State management | ^4.x |
| @supabase/supabase-js | Backend | ^2.x |
| framer-motion | Animations | ^11.x |
| recharts | Charts | ^2.x |
| @hello-pangea/dnd | Drag and drop | ^16.x |
| lucide-react | Icons | latest |
| date-fns | Date utilities | ^3.x |
| react-dropzone | Image upload | ^14.x |
| react-hot-toast | Toast notifications | ^2.x |

### 2.3 Supabase Setup

Create a Supabase project with:
- **Tables:** properties, equity_sources, tasks, activity_log, images, decision_scores, scenarios, milestones
- **Storage bucket:** `property-images` (public, max 5MB per file, image/* only)
- **Auth:** Email/password (single user, allows future sharing)
- **RLS:** ON for all tables, policy = auth.uid() matches user_id

**IMPORTANT:** All Supabase config (URL, anon key) goes in `.env`. Never hardcode.

---

## 3. DATA MODELS & STATE MANAGEMENT

### 3.1 Property Model (Central Entity)

```typescript
{
  id: uuid,                    // PK auto-generated
  name: string,                // "דירת המורן"
  street: string,              // Street + neighborhood
  city: string,                // "נשר"
  rooms: number,               // 4.5, 5
  sqm_built: number,           // Built area
  sqm_garden: number | null,   // Garden (0 if none)
  floor: string,               // "1/8", "קרקע"
  parking_spots: number,       // 0, 1, 2
  has_storage: boolean,
  has_elevator: boolean,
  has_mamad: boolean,           // Safe room
  has_accessible: boolean,
  price: number,               // Listed price in ILS
  price_per_sqm: number,       // Calculated: price / sqm_built
  status: enum,                // "pipeline_new" | "researched" | "toured" | "negotiating" | "contract" | "closed" | "dropped"
  status_updated_at: timestamp,
  days_on_market: number | null,
  entry_date: string,          // "גמישה" or date
  broker_name: string,
  broker_phone: string | null,
  broker_license: string | null,
  listing_url: string | null,  // Yad2 link
  condition: string,           // "משופצת קומפלט"
  features: string[],          // ["מעלית", "ממ״ד", ...]
  highlights: string[],        // Positive points
  risks: string[],             // Red flags
  renovation_estimate: number, // Cost estimate
  notes: string,
  color: string,               // Hex for UI (#2D6A4F)
  created_at: timestamp,
  updated_at: timestamp
}
```

### 3.2 Activity Log Model

The activity log is the "memory" of the entire process. Every call, visit, decision, WhatsApp message gets logged.

```typescript
{
  id: uuid,
  property_id: uuid | null,    // null = general
  type: enum,                  // "call" | "visit" | "document" | "decision" | "note" | "whatsapp" | "email" | "negotiation"
  title: string,               // "שיחה עם מתווך"
  content: string,             // Full details
  tags: string[],              // Free tags
  created_at: timestamp
}
```

### 3.3 Equity Source Model

```typescript
{
  id: uuid,
  label: string,               // "מכירת חצי דוכיפת"
  min_amount: number,          // Pessimistic
  max_amount: number,          // Optimistic
  current_estimate: number,    // Working number
  is_confirmed: boolean,       // Amount finalized?
  notes: string,
  sort_order: number
}
```

### 3.4 Task Model

```typescript
{
  id: uuid,
  property_id: uuid | null,
  text: string,
  priority: enum,              // "high" | "medium" | "low"
  is_done: boolean,
  due_date: date | null,
  ai_persona: enum | null,     // "lawyer" | "mortgage" | "appraiser"
  created_at: timestamp,
  completed_at: timestamp | null
}
```

### 3.5 Decision Score Model

For weighted decision matrix. Each property scored per criterion.

```typescript
{
  id: uuid,
  property_id: uuid,
  criterion: string,           // "מחיר" | "מיקום" | "מצב" | "גינה" | "בטיחות" | "פוטנציאל" | "חניות" | "סיכון משפטי"
  score: number,               // 1-10
  weight: number               // 1-10 importance (shared across all properties)
}
```

### 3.6 Image Model

```typescript
{
  id: uuid,
  property_id: uuid,
  url: string,                 // Supabase storage URL
  source: enum,                // "broker" | "personal" | "floorplan" | "map"
  caption: string | null,
  is_primary: boolean,         // Main card image
  sort_order: number
}
```

### 3.7 Scenario Model

```typescript
{
  id: uuid,
  name: string,                // "תרחיש אופטימי"
  equity_overrides: jsonb,     // { ducifat: 1200000, inheritance: 100000, ... }
  mortgage_rate: number,
  mortgage_years: number,
  property_price_overrides: jsonb,  // { [property_id]: negotiated_price }
  notes: string
}
```

### 3.8 Milestone Model

```typescript
{
  id: uuid,
  title: string,               // "סגירת משכנתא"
  target_date: date,
  property_id: uuid | null,
  is_completed: boolean,
  sort_order: number
}
```

### 3.9 Zustand Store Structure

Single store with slices. Persist to localStorage for offline use, sync to Supabase when online.

```javascript
const useStore = create(persist((set, get) => ({
  // Properties slice
  properties: [],
  addProperty: (p) => ...,
  updateProperty: (id, updates) => ...,
  updatePropertyStatus: (id, newStatus) => ...,
  deleteProperty: (id) => ...,

  // Equity slice
  equitySources: [...DEFAULT_EQUITY_SOURCES],
  updateEquitySource: (id, amount) => ...,
  totalEquity: () => get().equitySources.reduce((sum, s) => sum + s.current_estimate, 0),

  // Tasks slice
  tasks: [],
  addTask: (task) => ...,
  toggleTask: (id) => ...,

  // Activity log slice
  activities: [],
  addActivity: (entry) => ...,

  // Mortgage settings (global)
  mortgageYears: 25,
  mortgageRate: 4.5,
  setMortgageYears: (y) => set({ mortgageYears: y }),
  setMortgageRate: (r) => set({ mortgageRate: r }),

  // Income (editable)
  netIncome: 14556,

  // Scenarios, Scores, Milestones...
}), { name: 'dirali-store' }))
```

---

## 4. MODULE 1: DASHBOARD

**Route:** `/` | **File:** `src/pages/Dashboard.jsx`

### 4.1 Purpose

The dashboard is the war room. Alon opens it and in 10 seconds knows: how many days until deadline, where each property stands, what needs attention, and financial situation.

### 4.2 Layout (Top to Bottom)

#### 4.2.1 Deadline Banner

Full-width banner at top of dashboard content.

- **Visual:** Gradient background. If <30 days: red (#7F1D1D → #991B1B). If ≥30 days: blue (#1E3A5F → #1B4965)
- **Left side (RTL: right):** Label "דדליין — סוף חוזה שכירות" + date "01/04/2026" in large white text
- **Right side (RTL: left):** Giant days remaining number. Monospace, 42px. Color by urgency
- **Below:** Progress bar (completed tasks / total). Green fill on dark track. "X/Y משימות הושלמו"
- **Calculation:** `Math.ceil((new Date('2026-04-01') - new Date()) / (1000*60*60*24))`

#### 4.2.2 Quick Stats Row

3 cards in horizontal row (grid: 3 columns).

- **Card 1 — הון עצמי:** totalEquity from store. Color: Green (#10B981). Monospace
- **Card 2 — דירות במעקב:** Count of non-dropped properties. Color: Blue (#3B82F6)
- **Card 3 — משימות דחופות:** Count high-priority undone tasks. Red if >0, Green if 0
- **Styling:** bg #1E293B, rounded-xl, border with accent at 20% opacity. Label uppercase, tiny, #64748B. Value large monospace

#### 4.2.3 Pipeline Overview

Horizontal visualization showing properties grouped by pipeline status.

- Horizontal row of columns, one per status. Each shows status name + count
- Properties appear as small colored pills inside each column
- **Statuses:** `חדשה | נחקרה | סיור | מו״מ | חוזה | נסגרה | נפלה`
- Click property pill → navigates to property detail
- This is a COMPACT OVERVIEW only, not the full Kanban

#### 4.2.4 Property Cards Grid

Grid of property mini-cards. 2-3 per row depending on width.

Each card shows:
- Primary image (or emoji fallback)
- Property name, street
- Price (monospace)
- Stats: rooms | sqm | garden | parking
- Status pill (colored)
- Monthly mortgage estimate + income ratio (color-coded)
- **Days on market badge** if applicable (amber)

Color coding for monthly payment: Green (<28%), Amber (28-35%), Red (>35%)

Click → navigate to full property page.

Last card always: "+ הוסף דירה חדשה" with dashed border. Opens Add Property form.

#### 4.2.5 Urgent Tasks List

Only shown if undone high-priority tasks exist.

- Each task: checkbox (20px circle) + text + property emoji + AI persona icon
- Red right border (3px)
- Click checkbox → toggle with animation

#### 4.2.6 Recent Activity Feed

Last 5 activity log entries across all properties.

- Type icon + relative timestamp ("לפני 3 שעות") + title + property pill
- Type icons: 📞 call | 🚶 visit | 📄 document | ✅ decision | 📝 note | 💬 whatsapp | 📧 email | 💰 negotiation
- Click → expand full content inline
- "צפה בכל" link → Activity tab

---

## 5. MODULE 2: PROPERTY CARDS (KANBAN PIPELINE)

**Route:** `/properties` | **File:** `src/pages/Properties.jsx`

### 5.1 Kanban View (Default)

Full-screen Kanban board with 7 columns. Properties are draggable cards.

#### 5.1.1 Columns

| Status | Hebrew | Color | Description |
|--------|--------|-------|-------------|
| pipeline_new | חדשה | #3B82F6 | Just found |
| researched | נחקרה | #8B5CF6 | Research done |
| toured | סיור | #F59E0B | Visit completed |
| negotiating | מו״מ | #F97316 | Active negotiation |
| contract | חוזה | #10B981 | Contract stage |
| closed | נסגרה | #059669 | Deal closed |
| dropped | נפלה | #EF4444 | Not pursuing |

#### 5.1.2 Kanban Card Content

- Primary image (120px, rounded top) with fallback to colored div + emoji
- Property name (bold, 14px)
- Price (monospace, property color)
- Quick stats: rooms | sqm | garden
- Bottom: days in current status + activity count badge
- Drag handle: left edge, 6 dots, visible on hover

#### 5.1.3 Drag Behavior

- Use `@hello-pangea/dnd` (maintained fork of react-beautiful-dnd)
- Drag between columns → auto-update status + status_updated_at
- Drag to "dropped" → confirmation dialog: "בטוח שאתה רוצה להוציא את הנכס הזה? ניתן לשחזר אחר כך."
- Status change auto-creates activity_log entry: "סטטוס שונה ל: [new status]"

### 5.2 Property Detail Page

**Route:** `/properties/:id` | **File:** `src/pages/PropertyDetail.jsx`

#### 5.2.1 Header

- Full-width gradient in property's color
- Name (24px, white, bold) + street (14px, white/70%)
- Price monospace (28px, white) + price/sqm below
- Status pill (clickable dropdown to change)
- Edit button → edit form modal

#### 5.2.2 Image Gallery

- Horizontal scrollable row below header
- Click → full-screen lightbox with navigation
- "הוסף תמונה" button → file picker / drag-drop
- Each image: small source badge (מתווך | אישי | תוכנית | מפה)
- Long press: set as primary, delete, change source

#### 5.2.3 Specs Grid

4-column grid: rooms, sqm, floor, garden. Dark cards (#0F172A), label on top, big number below.

#### 5.2.4 Features Tags

Horizontal wrap of pill-shaped tags. Property color at 15% opacity background.

#### 5.2.5 Highlights & Risks

Two-column layout:
- **Left: יתרונות** — green border, green header, items with green border-right
- **Right: סיכונים** — red border, red header, items with red border-right
- Both editable: click to edit, + to add, X to remove

#### 5.2.6 Financial Summary Card

Dark card (#0F172A) with full breakdown:

```
מחיר דירה          → property.price
מס רכישה (2026)    → calculated (see tax function below)
שיפוצים משוערים     → property.renovation_estimate
─────────────────────────────────────
עלות כוללת          → sum (bold, larger)
הון עצמי            → from store (green)
משכנתא נדרשת        → total - equity (amber)
החזר חודשי          → calculated, color by income ratio
```

**Tax calculation function (2026 brackets — MUST BE EXACT):**

```javascript
function calcTax(price) {
  if (price <= 1978745) return 0;
  let tax = 0;
  if (price > 1978745) tax += Math.min(price - 1978745, 2347040 - 1978745) * 0.035;
  if (price > 2347040) tax += (price - 2347040) * 0.05;
  return Math.round(tax);
}
```

**Mortgage calculation:**

```javascript
function calcMortgage(principal, annualRate, years) {
  const r = annualRate / 100 / 12;
  const n = years * 12;
  if (r === 0) return principal / n;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}
```

#### 5.2.7 Activity Timeline

Vertical timeline of all activity_log entries for this property, newest first.

- Colored dot on timeline line + type icon + timestamp + title + expandable content
- "+ עדכון מהיר" button at top → quick-add form

#### 5.2.8 Broker Info Footer

Small card: broker name, phone (tel: link), license, listing URL (clickable).

---

## 6. MODULE 3: EQUITY MANAGER

**Route:** `/equity` | **File:** `src/pages/EquityManager.jsx`

### 6.1 Total Equity Hero

Green gradient banner. Total equity in 42px monospace. Below: min/max range.

### 6.2 Source Cards

One card per equity source:
- Label + current amount (right-aligned, green, monospace)
- Note (small, gray)
- Range slider: min to max, step=10,000. Accent: green
- Min/max labels below slider
- Confirmed toggle: if confirmed, checkmark + lock slider. Label → "סופי"

### 6.3 Impact Panel

Below source cards, shows how equity affects each property:
- Property name + emoji + monthly payment + income ratio
- Visual progress bar (ratio relative to 40% threshold)
- Color: green/amber/red
- **Updates in REAL TIME as sliders move** (no submit button)

### 6.4 Default Equity Sources

| ID | Label | Min | Max | Default | Note |
|----|-------|-----|-----|---------|------|
| ducifat | מכירת חצי דוכיפת | 1,200,000 | 1,600,000 | 1,450,000 | בסיס שווי 2.9M |
| inheritance | ירושה מאבטליון | 0 | 500,000 | 200,000 | סכום לא ידוע |
| keren | קרן השתלמות / פיצויים | 0 | 300,000 | 150,000 | |
| savings | חסכונות / פיקדונות | 0 | 200,000 | 80,000 | |

---

## 7. MODULE 4: COMPARISON ENGINE

**Route:** `/compare` | **File:** `src/pages/Compare.jsx`

### 7.1 Two Views

Toggle: "השוואה פשוטה" | "מטריצת החלטה משוקללת"

### 7.2 Simple Comparison Table

Side-by-side table. First column = criteria. One column per property (up to 6).

- Header: property name + color + emoji + primary image thumbnail
- Winner per row highlighted green (#10B981), bold, subtle green bg
- Winner logic per row is automatic
- Bottom row: total wins per property

#### Comparison Criteria:

| Criterion | Winner Logic | Format |
|-----------|-------------|--------|
| מחיר | Lowest wins | Currency |
| חדרים | Highest wins | Number |
| שטח בנוי | Highest wins | sqm |
| גינה | Highest wins | sqm |
| חניות | Highest wins | Number |
| ממ״ד | Has > doesn't | Yes/No |
| מצב | Free text, no auto winner | Text |
| שיפוצים נדרשים | Lowest wins | Currency |
| מס רכישה | Lowest wins | Currency |
| עלות כוללת | Lowest wins | Currency |
| קלף מו״מ | Free text, no auto winner | Text |
| סיכון משפטי | Free text, no auto winner | Text |

### 7.3 Weighted Decision Matrix

This is the real decision tool. User sets weights (importance) per criterion, scores each property.

- **Criteria:** מחיר | מיקום | מצב הדירה | גינה | בטיחות (ממ״ד) | פוטנציאל השבחה | חניות | סיכון משפטי
- **Weight column:** Slider 1-10 per criterion. Shared across all properties
- **Score columns:** One per property. 1-10 input per cell
- **Formula:** `sum(score[i] * weight[i]) / sum(weight[i]) * 10` → final score /100
- **Winner:** Highest total gets gold border (#F59E0B)
- **Below table:** Horizontal bar chart (Recharts) with each property's total. Bars in property colors

---

## 8. MODULE 5: MORTGAGE CALCULATOR

**Route:** `/mortgage` | **File:** `src/pages/MortgageCalc.jsx`

### 8.1 Global Mortgage Bar

Appears on EVERY page (global layout). Sticky below header.

- Two sliders: Years (15-30, default 25) + Rate (3%-6.5%, step 0.1, default 4.5%)
- Values in global Zustand store
- Changing instantly updates ALL mortgage calculations app-wide

### 8.2 Detailed Calculator Page

Select property from dropdown. Full breakdown:

- Property price (from data), equity (from store), additional costs toggle
- **Mortgage amount:** price + tax + renovation - equity
- **Monthly payment:** amortization formula
- **Total interest:** (monthly × months) - principal
- **Total cost of ownership:** price + tax + renovation + total interest

### 8.3 Amortization Schedule

Expandable year-by-year: Year | Opening | Annual Payment | Principal | Interest | Closing

Line chart (Recharts): principal vs interest over time.

### 8.4 Multi-Property Comparison

Bar chart: monthly payment per property. Property-colored bars.
Red dashed horizontal line at 33% income threshold. Label: "תקרת בנק ישראל"

### 8.5 Income Reference

Editable in settings:
- הכנסה נטו: 13,700 ₪
- הכנסה בנקאית: ~14,556 ₪ (כולל משכורת 13)

---

## 9. MODULE 6: TASK & ACTIVITY TRACKER

**Route:** `/tasks` | **File:** `src/pages/Tasks.jsx`

### 9.1 Quick-Add FAB ⚡

**THIS IS THE MOST IMPORTANT UX ELEMENT IN THE APP.**

A floating action button (bottom-left in LTR / bottom-right visually in RTL, 56px circle, blue #3B82F6) visible on EVERY page.

Click opens bottom sheet (mobile) or modal (desktop):

1. **Type selector:** Row of icon buttons: 📞 🚶 📄 ✅ 📝 💬 📧 💰. Default: 📝 (note)
2. **Property selector:** Horizontal pills of active properties + "כללי" option. Auto-select current property if on property page
3. **Text input:** Auto-focused, placeholder "מה קרה?", Hebrew, 16px
4. **Save button:** Green, full-width. Creates activity_log entry + closes. Toast confirmation

**Total interaction:** Tap FAB → type text → tap save. 3 actions, <10 seconds. Smart defaults for type and property.

### 9.2 Tasks View

Grouped by priority (high/medium/low). Each group has colored header.

- Each task: checkbox + text + property tag + AI persona icon + optional due date
- Completed → bottom, 50% opacity, strikethrough
- "+ משימה חדשה" at top: inline form with text, priority, property, due date

### 9.3 Activity Feed View

Tab toggle: "משימות" | "יומן פעילות"

All activity_log entries, newest first. Filterable by:
- Property (dropdown / pills)
- Type (multi-select pills)
- Date range

Each entry:
- Type icon + colored dot
- Relative timestamp ("לפני 2 ימים")
- Title (bold) + property name pill
- Expandable content
- Edit + delete on hover

---

## 10. MODULE 7: AI ADVISORS

**Route:** `/ai` | **File:** `src/pages/AiAdvisors.jsx`

### 10.1 Personas

| ID | Icon | Name | Color | Domain |
|----|------|------|-------|--------|
| lawyer | ⚖️ | עו״ד נדל״ן | #8B1A1A | חריגות בנייה, היתרים, טאבו |
| mortgage | 🏦 | יועץ משכנתאות | #1B4965 | תמהיל, ריביות, כושר החזר |
| appraiser | 📊 | שמאי / אנליסט | #2D6A4F | שווי שוק, מגמות, פוטנציאל |

### 10.2 Card Layout

- **Collapsed:** Icon (52px, rounded, colored bg) + name + description + task count badge
- **Expanded (click toggle):** Insights panel + chat input

### 10.3 Pre-Built Insights (Rule-Based, NOT AI at runtime)

**Lawyer generates:**
- Per property: risk assessment from risks[] array. If "קליניקה" or "בנייה" found → flag "חשד לחריגת בנייה"
- General: legal steps checklist (טאבו, הערכת שמאי, בדיקת חובות, בדיקת תיק בניין)

**Mortgage advisor generates:**
- Max monthly at 33%: ~4,800 ₪/month
- Recommended mix: "פריים + קבועה ל״צ + משתנה 5 שנים"
- Per property: within approval range?

**Appraiser generates:**
- Price/sqm comparison across properties
- Days on market analysis (longer = more leverage)
- Neighborhood trends

### 10.4 Chat Interface

Below insights, chat input. Sends to Anthropic API:

- **System prompt:** Persona role + all property data as JSON + equity + mortgage settings
- **Model:** `claude-sonnet-4-5-20250929`
- **Implementation:** Call Anthropic API from frontend (key in .env). Response in chat bubble
- **History:** In local state per persona. Not persisted

---

## 11. MODULE 8: TIMELINE & MILESTONES

**Route:** `/timeline` | **File:** `src/pages/Timeline.jsx`

### 11.1 Reverse Timeline

Gantt-style chart working BACKWARDS from April 1, 2026:

| Milestone | Target Date | Logic |
|-----------|-------------|-------|
| כניסה לדירה | 01/04/2026 | Fixed |
| חתימת חוזה | deadline - 30d | ~01/03/2026 |
| סגירת משכנתא | deadline - 45d | ~15/02/2026 |
| החלטה סופית על דירה | deadline - 50d | ~10/02/2026 |
| סיורים אחרונים | deadline - 55d | ~05/02/2026 |
| סיום מחקר וסינון | Now | Where you are |

### 11.2 Visual

- Horizontal timeline bar with markers at each milestone
- "Today" = vertical red dashed line
- Past milestones: green if completed, red if missed
- Future milestones: blue
- Click to mark complete or edit
- Add custom milestones

### 11.3 Linked Tasks

Each milestone can have associated tasks. All tasks done → auto-complete milestone.

---

## 12. MODULE 9: DECISION MATRIX

Covered in Section 7.3 (part of Compare module). See Weighted Decision Matrix.

---

## 13. MODULE 10: SCENARIO SIMULATOR

**Route:** `/scenarios` | **File:** `src/pages/Scenarios.jsx`

### 13.1 Purpose

Answer "what if" questions with named scenarios + different assumptions.

### 13.2 Scenario Card

- **Name:** "תרחיש אופטימי", "תרחיש פסימי", "מו״מ אגרסיבי"
- **Overrides:** Different equity, prices, rate/term
- **Results:** Per property: total cost, mortgage, monthly, income ratio

### 13.3 Side-by-Side

Up to 3 scenarios as columns, properties as rows. Monthly payment with color coding.

### 13.4 Create Form

- Name (text)
- Equity overrides (sliders, pre-filled)
- Mortgage overrides (rate + years)
- Property price overrides (per property)
- Notes (free text)

---

## 14. GLOBAL COMPONENTS & LAYOUT

### 14.1 App Shell (`src/App.jsx`)

- **Header (sticky top):** Logo "◈ דירה לי" (blue diamond + text) right (RTL). Equity badge (green pill) left
- **Mortgage bar (sticky below header):** Global rate/years sliders. Always visible
- **Main content:** Scrollable, route content
- **Bottom nav (fixed bottom):** 6 tabs: דשבורד | נכסים | הון עצמי | השוואה | משימות | AI. Icon + label each
- **Quick-Add FAB:** Floating button above bottom nav. Always visible

### 14.2 Add/Edit Property Form

Route: `/properties/new` and `/properties/:id/edit`. Grouped sections:

1. פרטים בסיסיים: name, street, city, listing_url
2. מאפיינים: rooms, sqm, garden, floor, parking
3. תכונות: checkboxes (storage, elevator, mamad, accessible)
4. מחיר: price, condition, renovation, entry_date
5. תיווך: broker name, phone, license
6. תמונות: upload zone (drag & drop)
7. הערכות: highlights (dynamic list), risks, features (tag input), notes

### 14.3 Confirmation Dialogs

Dark backdrop, centered card. Cancel (gray) + Confirm (red). For: delete property, drop property, delete activity.

---

## 15. IMAGE & PHOTO MANAGEMENT

### 15.1 Storage

Supabase Storage bucket `property-images`. Path: `/{property_id}/{filename}`. Max 5MB. Accept: image/*.

### 15.2 Upload Flow

- react-dropzone for drag-and-drop
- Progress indicator during upload
- After upload: create Image record, display in gallery
- Source tag selector: מתווך | אישי | תוכנית | מפה

### 15.3 Display

- Kanban + Dashboard cards: primary image as cover (object-fit: cover)
- Property detail: horizontal scrollable gallery with thumbnails
- Lightbox: full-screen overlay with arrows
- No image fallback: colored div with emoji/initial

---

## 16. DESIGN SYSTEM & VISUAL LANGUAGE

### 16.1 Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| bg-primary | #0B1120 | Page background |
| bg-secondary | #0F172A | Header, modals |
| bg-card | #1E293B | Cards, panels |
| bg-input | #0F172A | Input fields |
| border-default | #334155 | Subtle borders |
| text-primary | #E2E8F0 | Main text |
| text-secondary | #94A3B8 | Labels, subtitles |
| text-muted | #64748B | Hints, timestamps |
| text-disabled | #475569 | Disabled |
| accent-blue | #3B82F6 | Primary UI |
| accent-green | #10B981 | Equity, positive |
| accent-red | #EF4444 | Risks, urgent |
| accent-amber | #F59E0B | Warning, caution |
| accent-purple | #8B5CF6 | "Researched" |
| accent-orange | #F97316 | "Negotiating" |

### 16.2 Typography

- **Body:** System Hebrew: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif. 14px default
- **Monospace (numbers):** 'Courier New', monospace. ALL financial numbers
- **Headings:** H1=22px, H2=18px, H3=16px. All bold
- **No custom web fonts** — system-native for Hebrew speed

### 16.3 Spacing & Radius

- Card radius: 16px (rounded-2xl)
- Button radius: 10px (rounded-xl)
- Pill/badge: 20px (rounded-full)
- Standard gap: 16px cards, 8px inline
- Card padding: 20-24px

### 16.4 Animations (Framer Motion)

- Page transitions: fade + slight slide, 200ms
- Card hover: translateY(-2px) + subtle shadow
- Status changes: color morph, 300ms ease
- Number changes: count-up animation
- FAB: pulse when urgent unlogged items exist

---

## 17. RTL & HEBREW CONSIDERATIONS

- **HTML:** `<html dir="rtl" lang="he">`
- **Tailwind RTL:** Use `rtl:` variants. Replace `left`→`start`, `right`→`end`
- **Text:** Default text-right for Hebrew. text-left for numbers/English
- **Flexbox:** flex-row auto-reverses in RTL. Be aware for icon+text
- **Scroll:** Horizontal containers scroll right-to-left
- **Borders:** `border-right` becomes `border-inline-start`
- **Icons:** Nav arrows mirrored (back points right)
- **Numbers:** `new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' })`
- **Dates:** DD/MM/YYYY. Use date-fns with `he` locale

---

## 18. REFERENCE: DEMO FILE

The file `apartment-finder.jsx` (attached separately) serves as visual and structural reference. It demonstrates:

- Color scheme and dark theme aesthetic
- Property data structure (PROPERTIES array)
- Equity source structure (EQUITY_SOURCES array)
- AI persona structure (AI_PERSONAS array)
- Task structure (TASKS array)
- Financial calculation functions (calcMortgage, calcTax, formatCurrency)
- Tab navigation pattern
- RTL layout patterns

**DO NOT copy this file into the project.** Use it as reference for visual style and data structures only. The production app uses proper file separation, routing, state management, and Supabase.

---

## 19. IMPLEMENTATION PHASES

### Phase 1: Foundation (Days 1-2)
1. Project setup: Vite + React + Tailwind + Zustand
2. Supabase setup: tables, storage bucket, auth
3. App shell: header, bottom nav, router, RTL config
4. Zustand store with persist middleware
5. Global mortgage bar component

### Phase 2: Core Data (Days 3-4)
1. Property CRUD: add/edit/delete forms
2. Property detail page with all sections
3. Image upload and gallery
4. Equity manager with sliders

### Phase 3: Pipeline & Tracking (Days 5-6)
1. Kanban board with drag-and-drop
2. Quick-Add FAB + activity logging
3. Task manager
4. Activity feed with filters

### Phase 4: Analysis (Days 7-8)
1. Comparison table
2. Weighted decision matrix
3. Detailed mortgage calculator with amortization
4. Scenario simulator

### Phase 5: Intelligence & Polish (Days 9-10)
1. AI advisor personas with insights + chat
2. Timeline & milestones
3. Dashboard assembly (all widgets)
4. Animations, transitions, polish
5. Mobile responsive testing

---

## 20. FILE STRUCTURE

```
dirali/
├── public/
├── src/
│   ├── App.jsx                     # Router + Layout shell
│   ├── main.jsx                    # Entry point
│   ├── index.css                   # Tailwind imports + globals
│   ├── store/
│   │   ├── useStore.js             # Zustand store
│   │   └── supabase.js             # Supabase client
│   ├── pages/
│   │   ├── Dashboard.jsx           # Module 1
│   │   ├── Properties.jsx          # Module 2 (Kanban)
│   │   ├── PropertyDetail.jsx      # Module 2 (Detail)
│   │   ├── PropertyForm.jsx        # Add/Edit property
│   │   ├── EquityManager.jsx       # Module 3
│   │   ├── Compare.jsx             # Module 4
│   │   ├── MortgageCalc.jsx        # Module 5
│   │   ├── Tasks.jsx               # Module 6
│   │   ├── AiAdvisors.jsx          # Module 7
│   │   ├── Timeline.jsx            # Module 8
│   │   └── Scenarios.jsx           # Module 10
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.jsx
│   │   │   ├── BottomNav.jsx
│   │   │   ├── MortgageBar.jsx
│   │   │   └── QuickAddFAB.jsx
│   │   ├── property/
│   │   │   ├── PropertyCard.jsx     # Kanban card
│   │   │   ├── PropertyMiniCard.jsx # Dashboard card
│   │   │   ├── ImageGallery.jsx
│   │   │   └── StatusPill.jsx
│   │   ├── shared/
│   │   │   ├── ConfirmDialog.jsx
│   │   │   ├── SliderInput.jsx
│   │   │   └── EmptyState.jsx
│   │   └── ai/
│   │       ├── PersonaCard.jsx
│   │       └── ChatInterface.jsx
│   ├── utils/
│   │   ├── calculations.js         # calcTax, calcMortgage, formatCurrency
│   │   ├── constants.js            # Statuses, personas, default equity
│   │   └── seedData.js             # Initial properties from demo
│   └── hooks/
│       ├── useSupabase.js          # CRUD hooks
│       └── useDeadline.js          # Countdown hook
├── .env                            # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_ANTHROPIC_KEY
├── tailwind.config.js              # RTL plugin, custom colors
├── vite.config.js
└── package.json
```

---

## END OF SPECIFICATION

**This document is the single source of truth for the DiraLi project.** Claude Code should follow it precisely, module by module, phase by phase. The demo file (apartment-finder.jsx) provides visual reference. Every data model, every component, every interaction is specified above. No discretion needed — just build it.

*Generated: February 2026 | Author: Claude (AI) + Alon Gerber | Version: 1.0*
