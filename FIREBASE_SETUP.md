# Firebase Authentication & Progress Tracking Setup Guide

This guide will help you set up Firebase Authentication and Firestore for your SCP Cases site.

## Overview

Your site now includes:
- ✅ **Firebase Authentication** - Email/password user accounts
- ✅ **Firestore Database** - Cloud-synced progress tracking
- ✅ **Completion Tracking** - Mark cases as complete across all devices
- ✅ **localStorage Fallback** - Works offline and for non-authenticated users
- ✅ **Auto-migration** - Existing localStorage data syncs to Firestore on login

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter project name (e.g., "MD3-SCP-Cases")
4. **Disable** Google Analytics (not needed for this project)
5. Click **"Create project"**
6. Wait for project to be created (~30 seconds)

## Step 2: Register Your Web App

1. In your Firebase project, click the **web icon** `</>` (Add app)
2. Register app:
   - **App nickname**: `MD3 SCP Cases`
   - ☑️ **Check** "Also set up Firebase Hosting" (optional)
   - Click **"Register app"**

3. **Copy your Firebase configuration**:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc123"
   };
   ```

4. Click **"Continue to console"**

## Step 3: Update Firebase Configuration

1. Open `js/firebase-config.js` in your project
2. Replace the placeholder values with your actual Firebase config:

   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_ACTUAL_API_KEY",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "YOUR_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```

3. Save the file

## Step 4: Enable Authentication

1. In Firebase Console, go to **Authentication** (left sidebar)
2. Click **"Get started"**
3. Click on **"Sign-in method"** tab
4. Click on **"Email/Password"**
5. **Enable** the first toggle (Email/Password)
6. Leave second toggle (Email link) **disabled**
7. Click **"Save"**

## Step 5: Set Up Firestore Database

1. In Firebase Console, go to **Firestore Database** (left sidebar)
2. Click **"Create database"**
3. Select **"Start in production mode"**
4. Choose a location (select the one closest to your users)
5. Click **"Enable"**

## Step 6: Configure Firestore Security Rules

⚠️ **Important**: Set up proper security rules to protect user data.

1. In Firestore, click on **"Rules"** tab
2. Replace the default rules with:

   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Users can only read/write their own data
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;

         // User progress subcollection
         match /progress/{caseId} {
           allow read, write: if request.auth != null && request.auth.uid == userId;
         }
       }
     }
   }
   ```

3. Click **"Publish"**

## Step 7: Test Your Setup

1. **Deploy your site** to Netlify:
   ```bash
   # If using git
   git add .
   git commit -m "Add Firebase authentication and progress tracking"
   git push
   ```

2. **Test authentication**:
   - Visit your live site
   - Click **"Sign In"** button in header
   - Click **"Sign up"** link
   - Create a test account with your email
   - You should receive Firebase auth emails

3. **Test progress tracking**:
   - Sign in to your account
   - Open any case
   - Click **"Mark as Complete"** button
   - Go back to home page
   - You should see:
     - ✅ Green checkmark on completed case
     - Progress bar in sidebar
     - Completion stats (e.g., "1/176 cases - 1%")

4. **Test multi-device sync**:
   - Sign in on a different browser/device
   - Your completed cases should appear
   - Mark another case complete
   - Refresh first browser - should sync automatically

## Database Structure

Your Firestore database will have this structure:

```
users (collection)
  └── {userId} (document)
      ├── email: "user@example.com"
      ├── displayName: "John Doe"
      ├── createdAt: timestamp
      ├── subscriptionStatus: "free"
      └── progress (subcollection)
          ├── 1_1 (document)
          │   └── completedAt: timestamp
          ├── 2_3 (document)
          │   └── completedAt: timestamp
          └── ...
```

## Features Overview

### For Users:
- **Sign up** with email and password
- **Sign in** across devices
- **Mark cases complete** with one click
- **Track progress** with visual indicators
- **View stats** in sidebar (completed/total/percentage)
- **Auto-sync** across all devices
- **Password reset** via email

### For You (Admin):
- View user data in Firebase Console
- Export user lists
- Monitor authentication
- See completion statistics
- Future: Add payment integration for premium features

## Future Monetization Setup

Your system is already set up with a `subscriptionStatus` field. To add paid access:

### Step 1: Add Stripe Integration
```javascript
// In auth.js, already have:
subscriptionStatus: 'free' // Can be: 'free', 'premium', 'trial'
```

### Step 2: Gate Content
```javascript
// Example: Check subscription in completion-tracker.js
if (user.subscriptionStatus === 'free' && completedCount >= 10) {
  showUpgradeModal();
}
```

### Step 3: Recommended Platforms:
- **Stripe** - Most popular, developer-friendly
- **Paddle** - Handles taxes automatically
- **Lemon Squeezy** - Merchant of record

## Troubleshooting

### Issue: "Firebase not defined"
**Solution**: Check that Firebase SDK scripts are loaded in HTML:
```html
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js"></script>
```

### Issue: "Permission denied" in Firestore
**Solution**: Check Firestore security rules (Step 6)

### Issue: Can't sign in
**Solution**:
1. Check email/password is enabled in Firebase Console
2. Check Firebase config is correct
3. Check browser console for errors

### Issue: Progress not syncing
**Solution**:
1. Check Firestore rules allow user to write
2. Check network tab for Firestore requests
3. Verify user is signed in

### Issue: "Auth domain not authorized"
**Solution**:
1. Go to Firebase Console > Authentication > Settings > Authorized domains
2. Add your Netlify domain (e.g., `md3-scp.netlify.app`)

## Cost Estimates

Firebase offers a **generous free tier**:

### Spark Plan (Free):
- ✅ **Authentication**: 50,000 monthly active users
- ✅ **Firestore**:
  - 50K reads/day
  - 20K writes/day
  - 1 GB storage
- ✅ **Hosting**: 10 GB storage, 360 MB/day transfer

### Expected Usage (100 active students):
- **Reads**: ~5,000/day (well under limit)
- **Writes**: ~500/day (well under limit)
- **Storage**: ~1 MB (negligible)

**Estimated cost: $0/month** for small-medium usage

### When You'd Need to Pay (Blaze Plan):
- 500+ daily active users
- 100K+ daily reads
- Would cost ~$5-25/month

## Security Best Practices

✅ **Already Implemented:**
- Firestore rules restrict users to their own data
- Passwords hashed by Firebase (never stored in plaintext)
- HTTPS enforced on Netlify
- No API keys in client are sensitive (they're meant to be public)

🔒 **Optional Enhancements:**
- Enable email verification (Firebase Console > Authentication > Templates)
- Add reCAPTCHA (protects against bots)
- Set password policies (min length, complexity)

## Support & Resources

- **Firebase Docs**: https://firebase.google.com/docs/web/setup
- **Authentication Guide**: https://firebase.google.com/docs/auth/web/start
- **Firestore Guide**: https://firebase.google.com/docs/firestore/quickstart
- **Firebase Console**: https://console.firebase.google.com/

## File Structure

Your project now includes:

```
SCPProject/
├── index.html (updated with Firebase SDK & auth modal)
├── js/
│   ├── firebase-config.js (⭐ UPDATE THIS WITH YOUR CONFIG)
│   ├── auth.js (handles sign in/up/out)
│   ├── auth-ui.js (handles modal interactions)
│   ├── completion-tracker.js (tracks progress)
│   ├── navigation.js (existing filters)
│   └── case-interactions.js (existing answer toggles)
├── css/
│   ├── main.css (updated with auth & completion styles)
│   └── case.css (updated with completion button styles)
├── cases/
│   └── case*.html (all updated with completion tracking)
└── FIREBASE_SETUP.md (this file)
```

---

## Quick Start Checklist

- [ ] Create Firebase project
- [ ] Register web app
- [ ] Copy Firebase config to `js/firebase-config.js`
- [ ] Enable Email/Password authentication
- [ ] Create Firestore database
- [ ] Set Firestore security rules
- [ ] Deploy to Netlify
- [ ] Add Netlify domain to authorized domains
- [ ] Test sign up
- [ ] Test marking cases complete
- [ ] Test progress syncing across devices

**Once complete, your students can create accounts and track their progress across all devices!** 🎉
