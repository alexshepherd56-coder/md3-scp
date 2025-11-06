# SCP Cases Project

A medical student case study platform for Year 3 medical students, organized by specialty and week.

## Project Structure

```
SCPProject/
├── index.html              # Main landing page with navigation and case grid
├── SCP2.html              # Backup of original monolithic file (can be deleted)
├── case-template.html     # Template for creating new case pages
│
├── css/                   # Stylesheets
│   ├── main.css          # Styles for main landing page
│   └── case.css          # Styles for individual case pages
│
├── js/                    # JavaScript files
│   ├── navigation.js     # Filtering, counting, and scroll position logic
│   └── case-interactions.js  # Toggle answers and back navigation
│
├── cases/                 # All case HTML files (176 files)
│   ├── case1_1.html
│   ├── case1_2.html
│   └── ...
│
└── pdfs/                  # PDF resources referenced by some cases
    └── ...
```

## How to Modify

### Changing Styles

**Main page appearance:**
- Edit `css/main.css`
- Changes apply to index.html instantly

**Case page appearance:**
- Edit `css/case.css`
- Changes apply to all 176 case pages instantly

### Changing Navigation Logic

- Edit `js/navigation.js`
- Controls filtering, specialty counting, scroll position

### Changing Case Interactions

- Edit `js/case-interactions.js`
- Controls answer toggles and back button

### Adding a New Case

1. Copy `case-template.html`
2. Rename to `caseX_X.html` and move to `cases/` folder
3. Fill in the content
4. Add a link in `index.html` in the appropriate week section:

```html
<a href="cases/caseX_X.html" class="case-card SPECIALTY"><h3>X.X Case Title</h3></a>
```

Replace `SPECIALTY` with: cardiology, psychiatry, paediatrics, neurology, gastroenterology, endocrinology, renal, respiratory, rheumatology, haematology, og, git, general, breast, ortho, or vascular

## Deployment

This site is ready for deployment:

### Firebase Hosting (Already Configured)

```bash
firebase deploy
```

### Other Static Hosting

Upload the entire folder to:
- GitHub Pages
- Netlify
- Vercel
- Any static web host

## File Size Comparison

**Before restructure:**
- Main page (SCP2.html): 33KB (with embedded CSS/JS)
- Each case page: 3-15KB (with duplicate CSS/JS)

**After restructure:**
- Main page (index.html): 24KB (references external files)
- CSS files: 5.2KB total (shared across all pages)
- JS files: 6KB total (shared across all pages)
- Each case page: ~1-13KB (clean HTML only)

**Token efficiency:** Editing styles now requires loading ~2-3KB instead of 30+ KB

## Benefits

1. **Maintainability:** Change styling in one place, affects all pages
2. **Performance:** Browser caches CSS/JS files across page navigation
3. **Token Efficiency:** AI edits require loading much smaller files
4. **Deployment Ready:** Optimized structure for CDN and static hosting
5. **Scalability:** Easy to add new cases using template
