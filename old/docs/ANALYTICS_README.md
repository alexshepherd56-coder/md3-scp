# User Analytics System

## Overview

The SCP Cases platform now includes a comprehensive user analytics system that tracks user activity, session duration, and engagement metrics.

## What Gets Tracked

### User Metrics
- **Last Sign In**: Timestamp of when the user last logged in
- **Last Active**: Most recent activity timestamp
- **Total Time Spent**: Cumulative time spent on the site (in seconds)
- **Session Count**: Total number of sessions
- **Account Creation Date**: When the user registered

### Session Metrics
- **Session Duration**: How long each session lasted
- **Pages Visited**: Which pages were viewed during each session
- **Activity Status**: Whether user is currently active
- **Heartbeat Updates**: Regular updates every 30 seconds while active
- **User Agent & Platform**: Browser and device information

## Features

### Automatic Tracking
- Sessions start automatically when users sign in
- Activity is tracked through mouse movement, keyboard input, and scrolling
- Sessions end when:
  - User signs out
  - Browser tab/window closes
  - 5 minutes of inactivity passes
- Heartbeat mechanism updates session every 30 seconds
- Handles page visibility (tab switching, minimizing)

### Admin Dashboard
Access the admin dashboard at: `/admin.html`

#### Dashboard Features
1. **Statistics Overview**
   - Total Users
   - Active Users (online now)
   - Total Sessions
   - Average Session Time

2. **User Table**
   - Real-time online/offline status
   - Search by email or name
   - Filter by activity status
   - Sort by last active

3. **Export Functionality**
   - Export user data to CSV
   - Includes all metrics and timestamps

## Technical Implementation

### Files Added
- `js/user-analytics.js` - Main analytics tracking system
- `admin.html` - Admin dashboard for viewing analytics

### Files Modified
- `index.html` - Added analytics script
- `cases/*.html` - Added analytics to all case pages
- `firestore.rules` - Updated security rules for sessions collection

### Data Structure

#### Users Collection
```
/users/{userId}
  - email: string
  - displayName: string
  - lastSignIn: timestamp
  - lastActive: timestamp
  - totalTimeSpent: number (seconds)
  - createdAt: timestamp
```

#### Sessions Subcollection
```
/users/{userId}/sessions/{sessionId}
  - startTime: timestamp
  - endTime: timestamp
  - duration: number (seconds)
  - isActive: boolean
  - pages: array of {path, title, timestamp}
  - userAgent: string
  - platform: string
  - lastHeartbeat: timestamp
```

## Firestore Security Rules

The security rules allow:
- Users can read/write their own session data
- All authenticated users can read user profiles (for admin dashboard)
- All authenticated users can read session data (for admin dashboard)

**Note**: In production, you should restrict admin dashboard access to specific admin users.

## Privacy & Compliance

### What We Track
- Sign-in times
- Time spent on the platform
- Pages visited
- Browser/device information

### What We DON'T Track
- Personal browsing history outside the platform
- Keyboard inputs or form data
- Mouse position coordinates
- Screenshots or page content

### GDPR Compliance
Users have the right to:
- Access their data (via admin dashboard)
- Export their data (CSV export)
- Request data deletion (to be implemented)

## Usage Instructions

### For Administrators

1. **Access the Dashboard**
   - Navigate to `/admin.html`
   - Sign in with your account
   - Currently, all authenticated users can access (update for production)

2. **View User Analytics**
   - See total users and active users at a glance
   - View detailed user table with all metrics
   - Filter by activity status or search by name/email

3. **Export Data**
   - Click "Export CSV" to download user data
   - File includes all metrics with timestamps

4. **Refresh Data**
   - Click "Refresh" to update with latest data
   - Page does not auto-refresh (manual refresh required)

### For Developers

#### Accessing Analytics in Code
```javascript
// Get current user's stats
const stats = await window.userAnalytics.getUserStats(userId);

// Track custom page view
window.userAnalytics.trackPageView('/path', 'Page Title');
```

#### Session Management
Sessions are managed automatically, but you can:
- End session manually: `window.userAnalytics.endSession()`
- Update session: `window.userAnalytics.updateSession()`

## Deployment

### Deploy Updated Rules
```bash
firebase deploy --only firestore:rules
```

### Deploy Full Site
```bash
firebase deploy
```

## Future Enhancements

Potential improvements:
- [ ] Restrict admin access to specific emails
- [ ] Real-time dashboard updates (Firebase listeners)
- [ ] More detailed analytics (most visited pages, avg time per page)
- [ ] User engagement metrics (return rate, active days)
- [ ] Data retention policies
- [ ] GDPR data deletion endpoint
- [ ] Analytics API for programmatic access
- [ ] Email reports for admins
- [ ] Custom date range filtering
- [ ] Comparison charts and graphs

## Troubleshooting

### Analytics Not Tracking
1. Check browser console for errors
2. Verify Firebase is initialized: `window.firebaseAuth`
3. Ensure user is signed in
4. Check Firestore rules are deployed

### Dashboard Not Showing Data
1. Verify Firestore security rules are deployed
2. Check browser console for permission errors
3. Ensure Firebase connection is active
4. Refresh the dashboard

### Session Duration Seems Off
- Sessions are measured in seconds
- Inactive time (5+ minutes) pauses tracking
- Hidden pages (minimized tabs) pause heartbeat but resume on visibility

## Support

For issues or questions:
1. Check browser console for errors
2. Verify Firebase project settings
3. Review Firestore rules and permissions
4. Contact development team

---

**Version**: 1.0
**Last Updated**: November 2025
**Author**: ShepTech Development Team
