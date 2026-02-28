# Project Documentation for AI Assistants

## Overview
This is the MD3 SCP Cases web application - a medical case study platform for medical students.

## Technology Stack
- **Framework:** React 19 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router DOM
- **Content:** MDX (Markdown with JSX) for case files
- **Backend:** Firebase (Auth, Firestore)
- **Deployment:** Netlify

## Project Structure

```
/
├── src/                    # Main source code
│   ├── cases/              # MDX case files (case1_1.mdx, etc.)
│   ├── components/         # React components
│   │   ├── layout/         # Layout components (Sidebar, Header)
│   │   └── cases/          # Case-related components
│   ├── contexts/           # React Context providers
│   ├── hooks/              # Custom React hooks
│   ├── pages/              # Page components
│   ├── services/           # Firebase and API services
│   ├── types/              # TypeScript type definitions
│   └── data/               # Static data (weeks, etc.)
├── public/                 # Static assets
├── scripts/                # Build/utility scripts
├── dist/                   # Production build output
├── old/                    # LEGACY CODE - Reference only
│   ├── cases/              # Old HTML case files
│   ├── js/                 # Old JavaScript files
│   ├── css/                # Old CSS files
│   └── ...                 # Other legacy files
├── firebase.json           # Firebase configuration
├── firestore.rules         # Firestore security rules
├── storage.rules           # Firebase Storage rules
├── vite.config.ts          # Vite configuration
├── tailwind.config.js      # Tailwind CSS configuration
└── package.json            # Dependencies and scripts
```

## Important Notes

### The `old/` folder
The `old/` folder contains the **legacy vanilla HTML/JS/CSS version** of the site. This is kept **for reference only**. All new development should be done in the main React application.

**DO NOT:**
- Make changes to files in `old/`
- Reference `old/` files for current implementation
- Deploy from `old/`

**The `old/` folder is useful for:**
- Understanding original feature requirements
- Migrating content or logic to React
- Historical reference

### Development Commands
```bash
npm run dev          # Start development server
npm run build        # Production build
npm run preview      # Preview production build
npm run generate-index  # Regenerate case index
```

### Key Files
- `src/cases/index.ts` - Auto-generated case registry (run `npm run generate-index` to update)
- `src/contexts/` - State management (Auth, Progress, Theme, Search, TextMarkup)
- `src/pages/CasePage.tsx` - Main case display component
- `src/pages/CaseListPage.tsx` - Case grid/list view

### Design System
The app uses a Claude-inspired color palette:
- Background: `#F9F6F1` (cream)
- Text: `#0A0A0A`
- Accent: `#D97757` (burnt orange)
- Border: `#E8E3D9`
- Light accent: `#FBF0ED`

Dark mode is supported via Tailwind's `dark:` classes.
