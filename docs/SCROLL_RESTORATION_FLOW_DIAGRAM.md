# Scroll Position Restoration - Flow Diagrams

## Current Navigation Flow (Problematic)

```
┌─────────────────────────────────────────────────────────────────┐
│ USER ON CASES PAGE (index.html)                                 │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ Scrolls down to find "Case 5.3 - Depression"                ││
│ │ Window.scrollY = 1423px                                      ││
│ │ Sidebar scroll position = 234px                              ││
│ └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ Click case card
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ CASE CARD CLICK HANDLER (navigation.js, line 311-314)          │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ localStorage.setItem('scpScrollPosition', 1423)             ││
│ │ ❌ MISSING: sidebar scroll (234) is NOT saved!              ││
│ └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ Navigate to: cases/case5_3.html
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ INDIVIDUAL CASE PAGE (case5_3.html)                             │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ User reads case content, clicks "← Back to Cases"           ││
│ └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ Click back link
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ BACK BUTTON HANDLER (case-interactions.js, line 4-8)           │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ const filter = localStorage.getItem('currentFilter') = 'psychiatry' ││
│ │ const scroll = localStorage.getItem('scpScrollPosition') = 1423 ││
│ │ window.location.href = '../index.html?filter=psychiatry&scroll=1423' ││
│ └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ FULL PAGE RELOAD (flickering!)
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ BACK ON CASES PAGE (index.html) - RESTORATION                  │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ const scroll = urlParams.get('scroll') = 1423               ││
│ │ setTimeout(() => window.scrollTo(0, 1423), 100ms)           ││
│ │ ✅ Main content scrolled to correct position                ││
│ │ ❌ But sidebar scroll is lost (234px -> 0px)!               ││
│ │ ✅ Filter is correct (psychiatry)                            ││
│ └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ RESULT: Partially Restored State                                │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ ✅ Main content: Scrolled to case 5.3 area                  ││
│ │ ❌ Sidebar: At top (user lost place in filters!)            ││
│ │ ✅ Filter: "Psychiatry" is active                           ││
│ │ ⚠️  Page flickered during reload                            ││
│ └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

---

## Proposed Navigation Flow (Improved)

```
┌─────────────────────────────────────────────────────────────────┐
│ USER ON CASES PAGE (index.html)                                 │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ ✓ Main content scroll = 1423px                              ││
│ │ ✓ Sidebar scroll = 234px                                    ││
│ │ ✓ Filter = 'psychiatry'                                     ││
│ └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ Click case card
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ CASE CARD CLICK HANDLER (navigation.js, lines 309-318)         │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ const filter = 'psychiatry'                                 ││
│ │ sessionStorage.setItem('scpScrollPos_psychiatry', 1423)     ││
│ │ sessionStorage.setItem('scpSidebarScroll_psychiatry', 234)  ││
│ │ ✅ BOTH scroll positions saved!                             ││
│ │ (sessionStorage clears on tab close, not persisted)         ││
│ └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ Navigate to: cases/case5_3.html
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ INDIVIDUAL CASE PAGE (case5_3.html)                             │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ User clicks "← Back to Cases"                               ││
│ └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ Click back link
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ BACK BUTTON HANDLER (case-interactions.js, lines 3-14)         │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ const filter = localStorage.getItem('currentFilter')='psych'││
│ │ const mainScroll = sessionStorage.get('scpScrollPos_psych') ││
│ │ const sidebarScroll = sessionStorage.get('scpSidebar_psych')││
│ │                                                              ││
│ │ ✅ Use history.back() INSTEAD of window.location.href      ││
│ │    (No page reload, no flickering!)                         ││
│ │ ✅ Fallback to explicit navigation if needed                ││
│ └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ Browser handles back navigation
                            │ (NO page reload)
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ RESTORATION ON INDEX PAGE (navigation.js, lines 320-333)        │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ DOMContentLoaded event fires                                ││
│ │                                                              ││
│ │ const filter = 'psychiatry'                                 ││
│ │ const mainScroll = sessionStorage.get('scpScrollPos_psych') ││
│ │ const sidebarScroll = sessionStorage.get('scpSidebar_psych')││
│ │                                                              ││
│ │ setTimeout(() => window.scrollTo(0, 1423), 150ms)          ││
│ │ setTimeout(() => sidebar.scrollTop = 234, 150ms)           ││
│ │ ✅ BOTH positions restored with delay!                     ││
│ └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ FINAL RESULT: Full State Restoration                            │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ ✅ Main content: Scrolled to case 5.3 area (1423px)         ││
│ │ ✅ Sidebar: Scrolled to show Psychiatry active (234px)      ││
│ │ ✅ Filter: "Psychiatry" is active & highlighted            ││
│ │ ✅ No page flicker, smooth restoration                      ││
│ └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

---

## Storage Strategy Comparison

### Current Implementation (PROBLEMATIC)
```
localStorage (persistent)
├── currentFilter: 'psychiatry'          ✅ Correct
└── scpScrollPosition: 1423              ❌ Main only, sidebar missing
                                         ❌ Overwritten on each visit
```

### Proposed Implementation (IMPROVED)
```
localStorage (persistent) - User Preferences
├── currentFilter: 'psychiatry'          ✅ Filter choice (long-term)

sessionStorage (session-only) - Navigation State
├── scpScrollPos_all: '2341'             ✅ Main content scroll by filter
├── scpScrollPos_psychiatry: '1423'      ✅ Multiple filter positions
├── scpScrollPos_cardiology: '567'       ✅ Restored when visiting filter
│
├── scpSidebarScroll_all: '145'          ✅ Sidebar scroll by filter
├── scpSidebarScroll_psychiatry: '234'   ✅ Shows where user was in sidebar
├── scpSidebarScroll_cardiology: '89'    ✅ Different for each filter
```

### Why This Strategy Works

```
┌────────────────────────────────────────────────────────┐
│ Session Flow Example                                   │
├────────────────────────────────────────────────────────┤
│                                                        │
│ Tab 1: User visits                                    │
│ ├─ All -> scroll 100, sidebar 50 [SAVED]             │
│ ├─ Click case1 -> Back                               │
│ ├─ All -> scroll 100, sidebar 50 [RESTORED] ✅      │
│ └─ Close tab -> sessionStorage cleared               │
│                                                        │
│ Tab 2: Same user, new tab (independent)              │
│ ├─ All -> scroll 0, sidebar 0 (fresh start) ✅      │
│ ├─ Medicine -> scroll 200, sidebar 150 [SAVED]      │
│ ├─ Click case2 -> Back                              │
│ ├─ Medicine -> scroll 200, sidebar 150 [RESTORED] ✅│
│ └─ Close tab -> sessionStorage cleared              │
│                                                        │
│ Result: Each tab has independent history             │
│         But filter preference (localStorage) is shared│
└────────────────────────────────────────────────────────┘
```

---

## Multiple Filter Visits Flow

```
Time →

User Session:
├─ T1: Visit "All" -> scroll 0, sidebar 50
│      sessionStorage['scpScrollPos_all'] = 0
│      sessionStorage['scpSidebarScroll_all'] = 50
│
├─ T2: Click "Cardiology" -> scroll 300, sidebar 120
│      sessionStorage['scpScrollPos_cardiology'] = 300
│      sessionStorage['scpSidebarScroll_cardiology'] = 120
│
├─ T3: Click case -> View case
│      (scroll positions in sessionStorage untouched)
│
├─ T4: Click back -> Restore Cardiology state
│      scroll = sessionStorage['scpScrollPos_cardiology'] = 300 ✅
│      sidebar = sessionStorage['scpSidebarScroll_cardiology'] = 120 ✅
│
├─ T5: Click "Medicine" -> scroll 450, sidebar 200
│      sessionStorage['scpScrollPos_medicine'] = 450
│      sessionStorage['scpSidebarScroll_medicine'] = 200
│
├─ T6: Click "All" -> What to restore?
│      scroll = sessionStorage['scpScrollPos_all'] = 0 ✅
│      sidebar = sessionStorage['scpSidebarScroll_all'] = 50 ✅
│      (Original All position restored!)
│
└─ T7: Close tab
       sessionStorage cleared automatically ✅
```

---

## Browser Back Button Integration

```
Browser History Stack:
┌─────────────────────────────────┐
│ Position    URL                 │
├─────────────────────────────────┤
│ -1 (back)   index.html          │ ← User can go back here
│  0 (current) cases/case5_3.html │ ← Currently viewing
│  1 (forward) (empty)            │ ← Can't go forward
└─────────────────────────────────┘

When user clicks "Back to Cases":
    
Before:  window.location.href = '../index.html?...'
         ❌ Creates NEW history entry
         ❌ Forces page reload
         
After:   window.history.back()
         ✅ Uses existing history entry
         ✅ Browser restores page naturally
         ✅ More efficient, smoother UX

History Stack After Fix:
┌─────────────────────────────────┐
│ Position    URL                 │
├─────────────────────────────────┤
│ -1 (back)   (empty)             │ ← Nothing before home
│  0 (current) index.html         │ ← Back to home
│  1 (forward) (empty)            │ ← Nothing forward
└─────────────────────────────────┘
```

---

## Data Flow Diagram

```
INDEX.HTML
│
├─ HEADER (Fixed)
├─ SIDEBAR (Scrollable)
│  ├─ h2[data-group="all"] (click -> save scroll)
│  ├─ h2[data-group="medicine"] (click -> save scroll)
│  │  ├─ .specialty[data-filter="cardiology"]
│  │  ├─ .specialty[data-filter="psychiatry"]
│  │  └─ ... more specialties
│  └─ h2[data-group="surgery"]
│     ├─ .specialty[data-filter="git"]
│     └─ ... more specialties
│
└─ MAIN CONTENT (Scrollable)
   ├─ .week "Week 1 - Cardiology"
   │  └─ .case-grid
   │     ├─ .case-card (click -> SAVE scrolls)
   │     ├─ .case-card
   │     └─ ... more cases
   └─ ... more weeks

EVENTS:
1. Case card click
   └─> Save: scpScrollPos_[filter]
   └─> Save: scpSidebarScroll_[filter]
   └─> Navigate to: cases/case#_#.html

2. Page load (DOMContentLoaded)
   └─> Get filter from URL params
   └─> Restore: scpScrollPos_[filter]
   └─> Restore: scpSidebarScroll_[filter]

3. Back button click
   └─> Use: window.history.back()
   └─> Page restore handled by browser
   └─> DOMContentLoaded fires again
   └─> Scroll positions restored
```

---

## Mobile Responsive Behavior

```
DESKTOP VIEW:
┌─────────────────────┬───────────────────────────┐
│    SIDEBAR          │      MAIN CONTENT         │
│ (280px, scrollable) │ (flex-grow, scrollable)   │
│                     │                           │
│ Two independent     │ Two scroll behaviors:     │
│ scroll axes         │ 1. Sidebar scroll         │
│                     │ 2. Main scroll            │
└─────────────────────┴───────────────────────────┘

MOBILE VIEW (< 768px):
┌──────────────────────────────┐
│    HEADER (FIXED)            │
├──────────────────────────────┤
│ SIDEBAR (HIDDEN or MODAL)    │
│ ☰ Toggle button to show      │
├──────────────────────────────┤
│      MAIN CONTENT            │
│   (Single scroll axis)       │
│                              │
│ Note: Both scroll positions  │
│ still saved/restored         │
│ but sidebar is hidden        │
└──────────────────────────────┘

Mobile Implementation:
- Single scrollable area (main content + sidebar stacked)
- Sidebar becomes collapsible menu (overlay)
- sessionStorage still tracks both scroll positions
- When sidebar is shown, it can scroll independently
- Restoration still applies to both if needed
```

---

## Error Handling Flow

```
┌─────────────────────────────────────────────────┐
│ Restoration Attempt                             │
├─────────────────────────────────────────────────┤
│                                                 │
│ 1. Get filter from URL or default to 'all'     │
│    ↓                                           │
│ 2. Check sessionStorage for scroll position    │
│    ├─ Found? → Restore ✅                     │
│    └─ Not found? → Skip restoration, ok ✓    │
│       (First time visiting filter in session) │
│    ↓                                           │
│ 3. Parse position as integer                   │
│    ├─ Valid? → window.scrollTo() ✅          │
│    └─ Invalid? → Log error, skip ✓           │
│    ↓                                           │
│ 4. Wait 150ms (DOM render time)               │
│    ├─ Complete? → Scroll applied ✅          │
│    └─ Error? → Skip (page still usable) ✓   │
│    ↓                                           │
│ 5. Repeat for sidebar scroll                  │
│                                                 │
│ Result: Graceful degradation                  │
│ Even if restoration fails, page works fine    │
└─────────────────────────────────────────────────┘
```

