# 🚀 Quick Start - Development Setup

## Your New Development Workflow

### Start Working
```bash
cd ~/Desktop/SCPProject
npm run dev
```

This opens `http://localhost:3000` in your browser automatically.

### Make Changes
1. Edit any file (HTML, CSS, JS)
2. Save the file
3. Browser auto-refreshes with your changes
4. See changes instantly!

### Stop Server
Press `Ctrl + C` in the terminal

---

## 📁 What Got Set Up

### New Files
- `package.json` - Project configuration
- `vite.config.js` - Dev server configuration
- `node_modules/` - Dev server files (ignored by git)
- `DEVELOPMENT_WORKFLOW.md` - Complete workflow guide
- `PRE_DEPLOY_CHECKLIST.md` - Testing checklist

### Commands Available
```bash
npm run dev      # Start local dev server (USE THIS!)
npm run build    # Build for production (optional)
npm run preview  # Preview production build (optional)
```

---

## 🎯 Typical Development Session

### Example: Adding a new feature
```bash
# 1. Start dev server
npm run dev

# 2. Create feature branch
git checkout -b feature/my-feature

# 3. Edit files in your code editor
#    Save → Browser auto-refreshes → Test → Repeat

# 4. When it works perfectly:
git add .
git commit -m "Add: my cool feature"

# 5. Merge and deploy
git checkout main
git merge feature/my-feature
git push origin main  # This deploys to Netlify (1 credit)
```

---

## 💡 Key Benefits

### Before (Old Way)
1. Edit file
2. Deploy to Netlify (1 credit)
3. Wait for deploy
4. Find bug
5. Edit file
6. Deploy again (1 credit)
7. Repeat... (many credits wasted!)

### Now (New Way)
1. Edit file
2. Save → See changes instantly (FREE)
3. Test thoroughly (FREE)
4. Fix all bugs locally (FREE)
5. Deploy once when perfect (1 credit)

**Result: 10x fewer deploys!**

---

## 🐛 Troubleshooting

### Server won't start?
```bash
# Try clearing and reinstalling
rm -rf node_modules
npm install --cache /tmp/npm-cache
npm run dev
```

### Port 3000 already in use?
```bash
# Kill whatever is using port 3000
lsof -ti:3000 | xargs kill
npm run dev
```

### Changes not showing?
- Hard refresh: `Cmd + Shift + R` (Mac) or `Ctrl + Shift + R` (Windows)
- Check browser console (F12) for errors

---

## 📚 Need More Info?

- **Full workflow guide**: See `DEVELOPMENT_WORKFLOW.md`
- **Testing checklist**: See `PRE_DEPLOY_CHECKLIST.md`
- **Git commands**: See `DEVELOPMENT_WORKFLOW.md` bottom section

---

## ✅ You're Ready!

Just run:
```bash
npm run dev
```

And start coding! 🎉
