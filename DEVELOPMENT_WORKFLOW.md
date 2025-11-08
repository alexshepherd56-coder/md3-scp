# Development Workflow Guide

## 🚀 Quick Start

### Start Development Server
```bash
npm run dev
```
This will:
- Start a local server at `http://localhost:3000`
- Auto-reload when you save files
- Show errors in the browser console
- Work exactly like the live site (including Firebase)

### Stop Development Server
Press `Ctrl + C` in the terminal

---

## 📋 Development Workflow

### 1. Before Making Changes
```bash
# Make sure you're on the main branch
git status

# Create a new branch for your feature
git checkout -b feature/my-new-feature
```

### 2. Making Changes
```bash
# Start the dev server
npm run dev

# Edit files in your editor
# Save and check browser - it auto-reloads!
# Test everything thoroughly locally (FREE)
```

### 3. Testing Checklist

Before committing, test these:

- [ ] Sign in/Sign out works
- [ ] Complete case works (check mark appears)
- [ ] Flag case works (bookmark appears)
- [ ] Search works
- [ ] Sidebar filtering works
- [ ] Mobile menu works (resize browser)
- [ ] Check browser console for errors (F12)
- [ ] Test on different browsers if possible

### 4. Committing Changes
```bash
# Check what files changed
git status

# Add files you want to commit
git add .

# Commit with a clear message
git commit -m "Add: description of what you added"
# or
git commit -m "Fix: description of what you fixed"
```

### 5. Deploying to Production

**ONLY deploy when everything works perfectly locally!**

```bash
# Merge your feature back to main
git checkout main
git merge feature/my-new-feature

# Push to GitHub (this triggers Netlify deploy)
git push origin main
```

⚠️ **This uses 1 Netlify build credit** - make sure you tested locally first!

---

## 🌿 Branch Strategy

### Main Branch
- Always production-ready
- Only merge tested features
- This is what deploys to Netlify

### Feature Branches
- Create for each new feature/fix
- Name clearly: `feature/flag-system`, `fix/auth-bug`, etc.
- Test thoroughly before merging
- Delete after merging

### Example Workflow
```bash
# Start new feature
git checkout -b feature/add-dark-mode

# Make changes, test locally
npm run dev

# Commit when done
git add .
git commit -m "Add: dark mode toggle"

# Merge to main when tested
git checkout main
git merge feature/add-dark-mode

# Deploy
git push origin main

# Clean up
git branch -d feature/add-dark-mode
```

---

## 🐛 If Something Goes Wrong

### Code Broke? Undo Your Changes
```bash
# Discard all local changes (CAREFUL!)
git checkout .

# Or go back to a specific commit
git log  # Find the commit ID you want
git reset --hard COMMIT_ID
```

### Server Won't Start?
```bash
# Stop the server (Ctrl + C)
# Clear cache and restart
rm -rf node_modules
npm install --cache /tmp/npm-cache
npm run dev
```

### Accidentally Deployed Broken Code?
```bash
# Revert to previous commit
git log  # Find the last working commit
git revert COMMIT_ID
git push origin main  # This creates a new deploy with the fix
```

---

## 💡 Pro Tips

1. **Commit Often**: Small commits are easier to undo
2. **Test Locally First**: ALWAYS test before deploying (saves credits!)
3. **Clear Commit Messages**: Future you will thank present you
4. **One Feature Per Branch**: Easier to track what broke
5. **Check Console**: F12 in browser shows errors early

---

## 📊 Useful Commands

```bash
# See all branches
git branch

# Switch branches
git checkout branch-name

# See what changed
git diff

# See commit history
git log --oneline

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Create and switch to new branch
git checkout -b feature/new-thing
```

---

## 🎯 Common Development Tasks

### Adding a New Feature
1. `git checkout -b feature/feature-name`
2. `npm run dev`
3. Make changes → Save → Test in browser
4. Repeat until it works
5. `git add . && git commit -m "Add: feature description"`
6. `git checkout main && git merge feature/feature-name`
7. `git push origin main` (ONLY ONCE when perfect!)

### Fixing a Bug
1. `git checkout -b fix/bug-description`
2. `npm run dev`
3. Find the bug → Fix it → Test
4. `git add . && git commit -m "Fix: bug description"`
5. `git checkout main && git merge fix/bug-description`
6. `git push origin main`

### Experimenting
1. `git checkout -b experiment/idea`
2. `npm run dev`
3. Try things out (it's safe!)
4. If it works: merge to main
5. If it doesn't: `git checkout main` (experiment stays in branch)

---

## ⚡ Why This Saves Netlify Credits

**Old way:**
- Make change → Deploy → See error → Fix → Deploy again
- Each deploy = 1 credit wasted

**New way:**
- Make change → Test locally (FREE)
- Find errors → Fix locally (FREE)
- Perfect? → Deploy once (1 credit)

**Result:** 10x fewer deploys = 10x more credits!
