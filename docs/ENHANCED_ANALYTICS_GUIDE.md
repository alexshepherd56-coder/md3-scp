# Enhanced Analytics System - Complete Guide

## Overview

Your SCP Cases platform now has a comprehensive analytics system that tracks every aspect of user engagement and behavior. This gives you deep insights into how students use your platform.

## What's Been Implemented

### 1. Core User Analytics ✅
- **Last Sign In**: When users logged in
- **Session Duration**: How long they stay
- **Total Time Spent**: Cumulative study time
- **Activity Tracking**: Real-time online/offline status

### 2. Case Analytics ✅
- **Most Popular Cases**: Which cases get the most views
- **Least Popular Cases**: Which cases need promotion
- **View Counts**: Total views per case
- **Unique Viewers**: How many different users viewed each case
- **Last Viewed**: When each case was last accessed

### 3. Feature Usage Analytics ✅
- **Search Usage**: How often users search and what for
- **Filter Usage**: Which specialties are most popular
- **Flag/Bookmark Usage**: How often users save cases
- **Case Completions**: Which cases are marked as completed

### 4. Retention Metrics ✅
- **DAU (Daily Active Users)**: Active in last 24 hours
- **WAU (Weekly Active Users)**: Active in last 7 days
- **MAU (Monthly Active Users)**: Active in last 30 days
- **Average Sessions per User**: Engagement frequency

### 5. Exam Resource Analytics ✅
- **SAQ vs MCQ Usage**: Which exam type is more popular
- **Year Preferences**: Which exam years students prefer
- **View Counts**: Total views per exam resource
- **Unique Viewers**: How many students use each resource

### 6. Study Pattern Analytics ✅
- **Average Session Duration**: How long study sessions last
- **Median Session Duration**: Typical study session length
- **Total Study Time**: Cumulative across all users
- **Study Patterns**: When users are most active (coming soon)

## Dashboard Access

### Basic Analytics Dashboard
**URL**: `/admin.html`

**Features**:
- User overview table
- Real-time online status
- Last sign-in times
- Session statistics
- CSV export

### Advanced Analytics Dashboard
**URL**: `/analytics-advanced.html`

**Features**:
- Retention metrics (DAU/WAU/MAU)
- Most/least popular cases
- Feature usage statistics
- Exam resource analytics
- Study pattern analysis

## Files Created

### JavaScript Files
1. **`js/user-analytics.js`** - Core analytics engine
   - Session tracking
   - Case view tracking
   - Feature usage tracking
   - Exam resource tracking

2. **`js/analytics-integration.js`** - Automatic tracking
   - Auto-detects case views
   - Auto-detects exam resource views
   - Tracks filter clicks
   - Tracks search queries
   - Tracks flag/bookmark usage

### HTML Dashboards
1. **`admin.html`** - Basic user analytics
2. **`analytics-advanced.html`** - Advanced analytics

### Documentation
1. **`ANALYTICS_README.md`** - Basic setup guide
2. **`ENHANCED_ANALYTICS_GUIDE.md`** - This file

## Data Structure

### Firestore Collections

#### `/users/{userId}`
```javascript
{
  email: string,
  displayName: string,
  lastSignIn: timestamp,
  lastActive: timestamp,
  totalTimeSpent: number, // seconds
  createdAt: timestamp,

  // Analytics fields
  featureUsage: {
    search: number,
    filter: number,
    flag: number,
    case_completion: number
  },
  examResourceViews: {
    "SAQ_2024": number,
    "MCQ_2024": number,
    // etc.
  },
  lastViewedCase: string,
  lastViewedCaseTitle: string,
  lastViewedCaseTime: timestamp
}
```

#### `/users/{userId}/sessions/{sessionId}`
```javascript
{
  startTime: timestamp,
  endTime: timestamp,
  duration: number, // seconds
  isActive: boolean,
  pages: [{
    path: string,
    title: string,
    timestamp: timestamp
  }],
  userAgent: string,
  platform: string,
  lastHeartbeat: timestamp,
  lastCaseViewed: string,
  lastCaseViewedTitle: string
}
```

#### `/users/{userId}/featureUsage/{usageId}`
```javascript
{
  feature: string, // 'search', 'filter', 'flag', etc.
  details: {
    // Feature-specific details
    query: string, // for search
    filterType: string, // for filters
    filterValue: string,
    caseId: string, // for flags
    action: string // 'add' or 'remove'
  },
  timestamp: timestamp
}
```

#### `/caseAnalytics/{caseId}`
```javascript
{
  caseId: string,
  title: string,
  viewCount: number,
  uniqueViewers: [userId1, userId2, ...],
  lastViewed: timestamp
}
```

#### `/examAnalytics/{examType_examYear}`
```javascript
{
  examType: string, // 'SAQ' or 'MCQ'
  examYear: string, // '2024', '2023', etc.
  viewCount: number,
  uniqueViewers: [userId1, userId2, ...],
  lastViewed: timestamp
}
```

## How Tracking Works

### Automatic Tracking

The system automatically tracks:

1. **When a user views a case**:
   - Increments case view count
   - Adds user to unique viewers
   - Updates user's last viewed case

2. **When a user views an exam resource**:
   - Increments exam view count
   - Adds user to unique viewers
   - Updates user's exam preferences

3. **When a user uses search**:
   - Records search query
   - Increments search usage count
   - Tracks search patterns

4. **When a user uses filters**:
   - Records filter type and value
   - Increments filter usage count
   - Identifies popular specialties

5. **When a user flags a case**:
   - Records case ID and action
   - Increments flag usage count

### Session Tracking

Sessions are automatically managed:
- **Start**: When user signs in
- **End**: When user signs out, closes tab, or becomes inactive (5+ min)
- **Heartbeat**: Updates every 30 seconds while active
- **Page Views**: Tracks every page visited during session

## Using the Analytics

### View User Analytics
```javascript
// Get stats for a specific user
const stats = await window.userAnalytics.getUserStats(userId);

console.log(stats);
// {
//   email: 'user@example.com',
//   lastSignIn: Date,
//   totalTimeSpent: 3600, // seconds
//   sessionCount: 12,
//   featureUsage: { search: 5, filter: 10, ... }
// }
```

### Track Custom Events
```javascript
// Track a case view
window.userAnalytics.trackCaseView('case1_1', 'Chest Pain');

// Track search
window.userAnalytics.trackSearch('diabetes');

// Track filter usage
window.userAnalytics.trackFilter('specialty', 'Medicine');

// Track flag
window.userAnalytics.trackFlag('case1_1', 'add');

// Track exam resource
window.userAnalytics.trackExamResource('SAQ', '2024');

// Track custom feature
window.userAnalytics.trackFeatureUsage('dark_mode', { enabled: true });
```

## Key Insights You Can Get

### Content Performance
- **Which cases are most engaging?** → Focus on similar content
- **Which cases need improvement?** → Review and update unpopular cases
- **What specialties are most popular?** → Expand popular areas

### User Engagement
- **How long do users study?** → Optimize content length
- **How often do they return?** → Measure retention success
- **What features do they use?** → Prioritize feature development

### Learning Patterns
- **When are users most active?** → Schedule updates accordingly
- **What's the typical study session?** → Design content for that duration
- **Which exam resources are preferred?** → Allocate resources

### Growth Metrics
- **DAU/WAU/MAU trends** → Track growth over time
- **User retention rate** → Measure platform stickiness
- **Feature adoption** → See what users value

## Deployment

### Deploy Firestore Rules
```bash
cd ~/Desktop/SCPProject
firebase deploy --only firestore:rules
```

### Deploy Full Site
```bash
firebase deploy
```

### Verify Deployment
1. Visit your site
2. Sign in
3. View a few cases
4. Go to `/admin.html`
5. Check if analytics are being tracked

## Privacy & GDPR

### Data Collected
- Sign-in times
- Time spent on platform
- Pages viewed
- Feature usage
- Search queries (not personal data)
- Browser/device info

### Data NOT Collected
- Passwords
- Email content
- Personal medical data
- Off-platform browsing
- Keyboard inputs (beyond search)

### User Rights
- **Access**: View via admin dashboard
- **Export**: CSV download available
- **Deletion**: Can be implemented on request

## Performance Considerations

### Database Writes
The system creates writes for:
- Session start/end
- Heartbeat updates (every 30s)
- Case views
- Feature usage

**Optimization**:
- Heartbeats batch operations
- Session end is fire-and-forget
- View counts use increment (not read-modify-write)

### Firestore Costs
Estimated writes per user per session:
- 1 session start
- 1 session end
- ~120 heartbeats (1 hour session)
- ~10 case views
- ~5 feature usage events

**Total: ~137 writes per hour of usage**

Free tier: 20,000 writes/day = ~146 user-hours/day

## Troubleshooting

### Analytics Not Tracking

**Check**:
1. Browser console for errors
2. Firebase initialized: `window.firebaseAuth`
3. User is signed in: `firebase.auth().currentUser`
4. Analytics initialized: `window.userAnalytics`

**Fix**:
```javascript
// In browser console
window.userAnalytics.initialize();
```

### Dashboard Shows No Data

**Check**:
1. Firestore rules deployed
2. User has permission
3. Collections exist in Firestore

**Verify**:
```javascript
// Check if data exists
db.collection('caseAnalytics').get().then(snap => {
  console.log('Cases tracked:', snap.size);
});
```

### Sessions Not Ending

**Possible causes**:
- Page refresh too fast
- Browser blocking beforeunload
- Network issues

**Solution**: Sessions will auto-expire based on lastHeartbeat

## Future Enhancements

Possible additions:
- [ ] Heat maps showing popular sections within cases
- [ ] User journey visualization
- [ ] A/B testing framework
- [ ] Automated email reports
- [ ] Engagement scoring algorithm
- [ ] Predictive analytics (exam success correlation)
- [ ] Social features analytics
- [ ] Mobile app analytics
- [ ] Real-time dashboard updates
- [ ] Custom date range filtering
- [ ] Cohort analysis
- [ ] Funnel analysis

## API Reference

### UserAnalytics Class

#### Methods

**`initialize()`**
- Initializes the analytics system
- Auto-called on page load

**`trackCaseView(caseId, caseTitle)`**
- Tracks when a user views a case
- Auto-called on case pages

**`trackFeatureUsage(featureName, details)`**
- Tracks custom feature usage
- details: object with feature-specific data

**`trackFilter(filterType, filterValue)`**
- Tracks filter usage
- Auto-called on filter clicks

**`trackSearch(query)`**
- Tracks search queries
- Auto-called after user stops typing (1s delay)

**`trackFlag(caseId, action)`**
- Tracks flag/bookmark actions
- action: 'add' or 'remove'

**`trackExamResource(examType, examYear)`**
- Tracks exam resource views
- Auto-called on exam pages

**`getUserStats(userId)`**
- Returns analytics for a specific user
- Returns Promise<UserStats>

**`startSession(user)`**
- Starts a new session
- Auto-called on sign-in

**`endSession()`**
- Ends current session
- Auto-called on sign-out/page close

**`updateSession()`**
- Updates session with latest data
- Auto-called every 30s

## Support

For issues or questions:
1. Check browser console
2. Review this documentation
3. Check Firebase console
4. Contact development team

---

**Version**: 2.0
**Last Updated**: November 2025
**Author**: ShepTech Development Team
