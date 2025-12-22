# Local Development Guide

## Quick Start

### 1. Start the Development Server

```bash
cd ~/Desktop/SCPProject
./dev-server.sh start
```

This starts a local server at **http://localhost:8080**

### 2. Open the Admin Dashboard

Open in your browser:
- Basic dashboard: http://localhost:8080/admin.html
- Advanced analytics: http://localhost:8080/analytics-advanced.html

### 3. Open Browser Console

**Press F12 (or Cmd+Option+I on Mac)** to open Developer Tools and see debug logs.

### 4. Make Changes & Test

1. Edit files (e.g., `admin.html`)
2. Save the file
3. **Refresh the browser** (Cmd+R or F5)
4. Check console for debug output
5. Repeat until working

### 5. Deploy When Ready

```bash
git add .
git commit -m "Your message"
git push origin main
```

Netlify will auto-deploy in 1-3 minutes.

## Dev Server Commands

```bash
# Start server
./dev-server.sh start

# Stop server
./dev-server.sh stop

# Restart server (after changes that need server restart)
./dev-server.sh restart

# Check if running
./dev-server.sh status

# View server logs
./dev-server.sh logs
```

## Debugging Tips

### View Console Logs

All debug messages are prefixed with `[DEBUG]` for easy filtering:

```javascript
console.log('[DEBUG] Your message here');
```

### Check Firestore Data

In browser console:
```javascript
// Get all sessions for current user
const user = firebase.auth().currentUser;
const sessions = await firebase.firestore()
  .collection('users').doc(user.uid)
  .collection('sessions').get();

sessions.forEach(doc => {
  console.log(doc.id, doc.data());
});
```

### Common Issues

**Issue**: Port 8080 already in use
```bash
./dev-server.sh stop
./dev-server.sh start
```

**Issue**: Changes not showing
- Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
- Clear cache in Dev Tools → Network tab → "Disable cache"

**Issue**: Firebase not connecting
- Check you're signed in
- Check browser console for errors
- Verify `firestore.rules` are deployed

## File Locations

### Admin Dashboards
- `/admin.html` - Basic user analytics
- `/analytics-advanced.html` - Advanced analytics

### Analytics Code
- `/js/user-analytics.js` - Core analytics engine
- `/js/analytics-integration.js` - Auto-tracking

### Configuration
- `/firestore.rules` - Firestore security rules
- `/js/firebase-config.js` - Firebase config

## Workflow for Fixing Issues

### Example: Fixing Time Tracking

1. **Start dev server**:
   ```bash
   ./dev-server.sh start
   ```

2. **Open dashboard**: http://localhost:8080/admin.html

3. **Open console** (F12)

4. **Click "Refresh" button** on dashboard

5. **Check console output** - look for `[DEBUG]` messages:
   ```
   [DEBUG] Processing 1 sessions for user test@example.com
   [DEBUG] Session abc123: {isActive: true, storedDuration: 0, ...}
   [DEBUG] Active session - calculated duration: 125s (2m)
   [DEBUG] Added 125s to user total. New total: 125s
   ```

6. **Identify the issue** from the logs

7. **Edit the file** (e.g., `admin.html`)

8. **Save** and **refresh browser** (Cmd+R)

9. **Check console again** to see if fixed

10. **Repeat steps 7-9** until working

11. **Deploy**:
    ```bash
    git add admin.html
    git commit -m "Fix: time tracking calculation"
    git push origin main
    ```

## Testing with Real Data

### Sign in to your site
1. Open http://localhost:8080/index.html
2. Sign in with your account
3. Browse a few cases
4. Leave browser open for a minute

### Check Analytics
1. Open http://localhost:8080/admin.html
2. Click "Refresh"
3. Check console for debug output
4. Verify time is showing correctly

## Removing Debug Logs

Before deploying to production, you can remove debug logs:

```bash
# Search for debug logs
grep -n "console.log.*DEBUG" admin.html

# Remove them manually or with sed
sed -i '' '/console.log.*DEBUG/d' admin.html
```

Or just leave them - they're harmless in production and helpful for debugging.

## Stopping the Server

When done developing:

```bash
./dev-server.sh stop
```

## Pro Tips

1. **Keep console open** - You'll catch errors immediately
2. **Use hard refresh** - Cmd+Shift+R ensures you get latest code
3. **Test as you go** - Don't make many changes before testing
4. **Commit often** - Small commits are easier to debug
5. **Check Firestore console** - Firebase Console → Firestore Database to see actual data

## Need Help?

Common debugging commands in browser console:

```javascript
// Check if Firebase is loaded
typeof firebase

// Check current user
firebase.auth().currentUser

// Check Firestore connection
firebase.firestore().collection('users').limit(1).get()
  .then(snap => console.log('Connected:', snap.size))

// Check sessions
const user = firebase.auth().currentUser;
firebase.firestore()
  .collection('users').doc(user.uid)
  .collection('sessions')
  .where('isActive', '==', true)
  .get()
  .then(snap => {
    snap.forEach(doc => console.log(doc.data()));
  });
```

---

**Happy Developing!** 🚀

Now you can iterate quickly without waiting for deployments.
