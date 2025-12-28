# Deployment Guide

## Quick Test Locally

To test the site locally before deploying:

```bash
cd ~/Desktop/SCPProject
python3 -m http.server 8888
```

Then open: http://localhost:8888/index.html

## Deploy to Firebase (Recommended)

Your Firebase configuration is already set up. Simply run:

```bash
cd ~/Desktop/SCPProject
firebase deploy
```

## Deploy to Other Platforms

### GitHub Pages

1. Create a new repository on GitHub
2. Push your code:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/scp-cases.git
git push -u origin main
```
3. Go to repository Settings → Pages
4. Select main branch
5. Your site will be live at: `https://YOUR_USERNAME.github.io/scp-cases`

### Netlify

1. Go to https://netlify.com
2. Drag and drop the SCPProject folder
3. Site goes live instantly
4. (Optional) Configure custom domain

### Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel` in the project folder
3. Follow prompts
4. Site goes live instantly

## File Structure for Deployment

Make sure to include:
- ✅ index.html
- ✅ css/ folder
- ✅ js/ folder
- ✅ cases/ folder
- ✅ pdfs/ folder
- ✅ assets/ folder (if you have images)

You can exclude:
- ❌ SCP2.html (backup file)
- ❌ SCP2_backup.html
- ❌ .DS_Store
- ❌ *.py files (build scripts)
- ❌ create_*.sh files

## Optimization for Production (Optional)

### Minify CSS and JS

```bash
# Using npx (no installation needed)
npx minify css/main.css > css/main.min.css
npx minify css/case.css > css/case.min.css
npx minify js/navigation.js > js/navigation.min.js
npx minify js/case-interactions.js > js/case-interactions.min.js
```

Then update references in HTML files to use `.min.css` and `.min.js`

### Enable Compression

Most hosting platforms (Firebase, Netlify, Vercel) automatically enable gzip/brotli compression.

### CDN Configuration

For Firebase Hosting, caching is automatic. For others, configure:
- CSS/JS files: cache for 1 year
- HTML files: cache for 1 hour
- PDF files: cache for 1 week

## Troubleshooting

**Problem:** Links don't work
- Check that all paths are relative (no absolute paths)
- Verify case files are in `cases/` folder

**Problem:** Styling doesn't load
- Open browser console (F12)
- Check for 404 errors on CSS files
- Verify CSS files are in `css/` folder

**Problem:** JavaScript doesn't work
- Check browser console for errors
- Verify JS files are in `js/` folder
- Ensure localStorage is enabled in browser

**Problem:** PDFs don't open
- Check that PDF paths are correct (`../pdfs/...`)
- Verify PDF files exist in `pdfs/` folder
