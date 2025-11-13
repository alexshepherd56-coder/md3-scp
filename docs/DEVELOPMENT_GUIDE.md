# Development Guide - Local Testing & Deployment

## Local Development (Testing Before Deploy)

### Starting the Local Server

**Every time you want to test your app**, run this in Terminal:

```bash
cd ~/Desktop/SCPProject
python3 -m http.server 8000
```

Then open: **http://localhost:8000**

### What This Does

- ✅ Runs the app on your computer only (not visible to others)
- ✅ Firebase authentication works properly
- ✅ You can test all changes before deploying
- ✅ Same as the live site, but local

### Stopping the Server

When you're done testing:

**Option 1: In Terminal**
- Press `Ctrl + C` to stop the server

**Option 2: Kill the Process**
```bash
lsof -ti:8000 | xargs kill
```

### Typical Workflow

1. **Make changes** to your HTML/CSS/JS files
2. **Start local server**: `python3 -m http.server 8000`
3. **Test in browser**: Open `http://localhost:8000`
4. **Refresh browser** to see changes (Cmd+R or Ctrl+R)
5. **When satisfied**, deploy to production
6. **Stop server** when done testing

## Deployment (Publishing Live)

When you're ready to make changes live, you need to deploy to your hosting platform.

### If using Netlify (based on your meta tags)

**Option 1: Drag & Drop (Simple)**
1. Go to https://app.netlify.com
2. Drag the entire `SCPProject` folder to Netlify
3. Wait for deployment to complete
4. Your site updates at: https://md3-scp.netlify.app/

**Option 2: Git Deploy (Recommended for updates)**

```bash
cd ~/Desktop/SCPProject

# Initialize git if not already done
git init
git add .
git commit -m "Fixed authentication UI display"

# Push to your repository (if connected)
git push origin main
```

If connected to Netlify via Git, it will auto-deploy.

**Option 3: Netlify CLI**

```bash
# Install Netlify CLI (one time)
npm install -g netlify-cli

# Deploy from project folder
cd ~/Desktop/SCPProject
netlify deploy --prod
```

### If using another host (GitHub Pages, Vercel, etc.)

Each has their own deployment process. Let me know which one you use!

## Quick Reference

### Local Testing Commands

```bash
# Start server
cd ~/Desktop/SCPProject && python3 -m http.server 8000

# Open in browser
open http://localhost:8000

# Stop server
# Press Ctrl+C in terminal
# OR
lsof -ti:8000 | xargs kill
```

### Key Differences: Local vs Production

| Feature | Local (localhost:8000) | Production (md3-scp.netlify.app) |
|---------|------------------------|-----------------------------------|
| Who can access | Only you | Everyone on internet |
| URL | http://localhost:8000 | https://md3-scp.netlify.app |
| Changes | Instant (just refresh) | Need to deploy |
| Firebase | ✅ Works | ✅ Works |
| Testing | Safe to break things | Live for users |

## Pro Tips

1. **Always test locally first** before deploying
2. **Keep the server running** while actively developing
3. **Use hard refresh** (Cmd+Shift+R) to see changes without cache
4. **Check browser console** for errors while testing
5. **Test authentication** works before deploying

## Common Issues

### "Site can't be reached"
- Server isn't running - start it with `python3 -m http.server 8000`

### "Address already in use"
- Port 8000 is busy - kill it: `lsof -ti:8000 | xargs kill`
- Or use a different port: `python3 -m http.server 8001`

### Changes not showing
- Hard refresh: `Cmd + Shift + R` (Mac) or `Ctrl + Shift + R` (Windows)
- Clear browser cache

### Firebase not working
- Make sure you're using `http://localhost:8000` (not `file://`)
- Check console for Firebase errors
