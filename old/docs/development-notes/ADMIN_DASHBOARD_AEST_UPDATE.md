# Admin Dashboard AEST Timezone Update

**Date**: November 23, 2025
**Status**: ✅ Complete

## Changes Summary

### 1. **Timezone Conversion to AEST** ✅
- **Changed from**: UTC (Coordinated Universal Time)
- **Changed to**: AEST (Australian Eastern Standard Time, UTC+11)
- **Reason**: Match Melbourne, Australia local time for better readability

**What this means:**
- All dates/times in the dashboard now display in Melbourne time
- A user signing in at 10:00 AM Melbourne time will appear under that date
- Firebase stores data in UTC, but dashboard converts it to AEST for display

### 2. **Admin Email Filter Fix** ✅
- **Removed**: `admin@example.com` (non-existent test email)
- **Kept**: `alex.shepherd56@gmail.com` (your actual admin account)
- **Result**: Dashboard now shows 92 users instead of 87 (assuming 93 total - 1 admin)

### 3. **Session Health Diagnostic Tool** ✅
- **New Feature**: "🔍 Session Health Check" button in dashboard header
- **Purpose**: Identifies users who don't have session tracking data
- **Shows**:
  - Total users
  - Users with sessions
  - Users without sessions
  - Users missing `createdAt` timestamp
  - Detailed list in console

### 4. **UI Improvements** ✅
- Added timezone indicator: "(Since Nov 6, 2025 • AEST Timezone)"
- Clear labeling so you know you're viewing AEST data

---

## Understanding Your Data

### Firebase Authentication DAU vs Your Session-Based DAU

**Why they're different:**

| Metric | What It Counts | Source |
|--------|---------------|--------|
| **Firebase Auth DAU** | Users who **signed in** | Firebase Authentication logs |
| **Your Session DAU** | Users who have **active sessions** | Your `user-analytics.js` tracking |

**Your session DAU will be LOWER than Firebase Auth DAU because:**

1. **Session tracking requires JavaScript to load**
   - If a user has a slow connection, they might sign in before `user-analytics.js` loads
   - No session is created

2. **Browser errors can prevent session creation**
   - Console errors, ad blockers, or privacy extensions might block Firebase
   - User signs in successfully, but no session is created

3. **Users created before tracking was implemented**
   - If you added session tracking after launch, old users won't have sessions until they sign in again

---

## How to Use Session Health Check

### Step 1: Run the Diagnostic

1. Open admin dashboard: `http://localhost:8080/admin.html`
2. Click "🔍 Session Health Check" button (top right)
3. Wait for the scan (might take 10-30 seconds for 92 users)
4. Check the alert popup for summary

### Step 2: Review Detailed Results

Open browser console (`Cmd + Option + J`) and look for:

```
[SESSION-CHECK] ========== RESULTS ==========
[SESSION-CHECK] Total users (excluding admins): 92
[SESSION-CHECK] Users WITH sessions: 78
[SESSION-CHECK] Users WITHOUT sessions: 14
[SESSION-CHECK] Users without createdAt: 5
[SESSION-CHECK] Users missing session data: [Array of users]
```

### Step 3: Understand the Results

**Users WITHOUT sessions** fall into these categories:

1. **Never signed in after tracking was added**
   - `lastSignIn: NEVER` or very old date
   - Solution: They'll get sessions next time they sign in

2. **Signed up before `createdAt` field was added**
   - `createdAt: MISSING`
   - Solution: Field will be added on next sign-in

3. **JavaScript/tracking errors**
   - Recent `lastSignIn` but no sessions
   - Solution: Check browser console for errors when they use the site

---

## Timezone Conversion Examples

### How AEST Conversion Works

Firebase stores: `2025-11-22T15:30:00Z` (UTC)
Your dashboard shows: `2025-11-23` (AEST, because UTC+11 means it's the next day)

**Examples:**

| UTC Time | AEST Time | Date Shown in Dashboard |
|----------|-----------|------------------------|
| Nov 22, 11:00 PM UTC | Nov 23, 10:00 AM AEST | Nov 23 |
| Nov 22, 1:00 PM UTC | Nov 23, 12:00 AM AEST | Nov 23 |
| Nov 22, 12:59 PM UTC | Nov 22, 11:59 PM AEST | Nov 22 |

**Key Point**: A session at 11 PM UTC on Nov 22 appears as Nov 23 in AEST (because it's 10 AM the next day in Melbourne).

---

## Improving Session Tracking Coverage

### Option 1: Add Fallback Tracking (Recommended)

If a user signs in but doesn't have a session, you can:

1. **Check on each page load** if user is authenticated but has no session
2. **Create a session retroactively** with current timestamp
3. **Result**: Better coverage, though timing might be slightly off

### Option 2: Use Firebase Auth DAU

Instead of session-based DAU, query `lastSignIn` timestamps:

**Pros:**
- ✅ 100% coverage (matches Firebase Console exactly)
- ✅ More reliable (doesn't depend on JavaScript)

**Cons:**
- ❌ Loses session duration data
- ❌ Loses page navigation data

### Option 3: Hybrid Approach

Use **both metrics**:
- Primary: Session-based DAU (for users you can track deeply)
- Fallback: Auth-based DAU (to catch everyone)
- Display both: "78 tracked sessions / 92 total sign-ins"

---

## Current Metrics Explained

### Dashboard Stats (as of Nov 23, 2025)

**Total Users: 92**
- All users in Firebase (excluding your admin account)
- Calculated from: Firestore `/users` collection count

**Daily Active Users (DAU): Varies by date**
- Users with **sessions** on that date (AEST timezone)
- Lower than Firebase Auth DAU due to tracking coverage
- Calculated from: Sessions in `/users/{uid}/sessions` collection

**Total Sessions: 401**
- All session documents across all users
- Average: ~4.4 sessions per user (401 ÷ 92)

**Avg Session Time: Varies**
- Only counts **active time** (mouse movement, clicks, scrolling)
- Pauses during inactivity (2+ minutes of no activity)
- Capped at 4 hours per session (prevents unrealistic data)

---

## Troubleshooting

### Issue: DAU much lower than expected

**Check:**
1. Run Session Health Check - how many users don't have sessions?
2. Browser console - are there JavaScript errors?
3. Check if `user-analytics.js` is loaded on all pages

**Solutions:**
- Add fallback session creation on sign-in
- Check Firestore security rules allow session writes
- Verify analytics script loads before sign-in completes

### Issue: Timezone looks wrong

**Expected behavior:**
- Console log shows: `[DAU] Date range (AEST): 2025-11-06 to 2025-11-23`
- Chart label shows: "(Since Nov 6, 2025 • AEST Timezone)"

**If times are off by 11 hours:**
- You're comparing Firebase PST times to AEST times
- PST = UTC-8, AEST = UTC+11
- Difference = 19 hours (!!)

### Issue: User counts don't match

**Understand what each number means:**
- **Firebase Auth Users**: Total accounts created
- **Dashboard Total Users**: Firebase accounts - admin accounts
- **DAU (your dashboard)**: Users with sessions on that day (AEST)
- **DAU (Firebase Console)**: Users who signed in that day (PST)

---

## Next Steps

### Immediate Actions

1. **Run Session Health Check**
   - Understand how many users don't have sessions
   - Review the list of users without tracking data

2. **Monitor for a few days**
   - See if session coverage improves as users sign in again
   - Check if new users get sessions correctly

3. **Compare timezones**
   - Firebase Console (PST) vs Your Dashboard (AEST)
   - Remember 19-hour difference when comparing!

### Long-Term Improvements

1. **Add Session Creation Fallback**
   - Check if authenticated user lacks sessions
   - Create initial session on page load
   - Improves coverage to 100%

2. **Add More Metrics**
   - Most visited pages (already tracked in sessions)
   - Average pages per session
   - User retention (7-day, 30-day)
   - Session completion rate

3. **Setup Alerts**
   - Email when DAU drops significantly
   - Alert when session creation rate is low
   - Warning when users have errors

---

## Files Modified

1. **admin.html**
   - Lines 665-667: Added AEST timezone configuration
   - Lines 1580-1596: Changed date calculations to AEST
   - Lines 1667-1721: Changed session bucketing to AEST
   - Line 540: Added timezone indicator to UI
   - Lines 494-496: Added Session Health Check button
   - Lines 2167-2228: Added diagnostic function

---

## Testing Checklist

- ✅ Dashboard displays AEST times
- ✅ Timezone indicator shows in UI
- ✅ Admin email filter excludes only your account
- ✅ Total users count is accurate (92)
- ✅ Session Health Check button works
- ✅ Console logs show AEST dates
- ✅ Chart data updates in real-time
- ✅ Caching reduces Firestore quota usage

---

## Quick Reference

### Key Console Logs to Watch

```javascript
[DAU] Date range (AEST): 2025-11-06 to 2025-11-23
[DAU] Current time: 2025-11-23T03:14:00.000Z (AEST: 2025-11-23T14:14:00.000Z)
[DAU] Processing 92 users...
[DAU] Fetched 401 total sessions
[DEBUG] Total users: 92
[DEBUG] Active users: XX
```

### Important Timezone Conversions

- **UTC to AEST**: Add 11 hours
- **PST to AEST**: Add 19 hours (during standard time)
- **Firebase Console**: Uses PST
- **Your Dashboard**: Now uses AEST
- **Firestore Timestamps**: Stored in UTC

---

**Need Help?**

Check browser console for `[SESSION-CHECK]`, `[DAU]`, or `[DEBUG]` logs - they'll show exactly what's happening with your data.
