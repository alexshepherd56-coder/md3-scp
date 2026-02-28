# Quick Start Guide - 5 Minutes to Launch

## ⚡ Fast Track Setup

Follow these 5 steps to get your auth system running:

### 1️⃣ Create Firebase Project (2 min)
```
1. Go to: https://console.firebase.google.com/
2. Click "Add project"
3. Name: "MD3-SCP-Cases"
4. Disable Google Analytics
5. Click "Create project"
```

### 2️⃣ Get Your Config (1 min)
```
1. Click web icon </> in Firebase Console
2. Register app nickname: "MD3 SCP Cases"
3. Copy the firebaseConfig object
```

### 3️⃣ Update Code (30 seconds)
```
1. Open: js/firebase-config.js
2. Replace YOUR_API_KEY etc. with your actual values
3. Save file
```

### 4️⃣ Enable Auth & Database (1 min)
```
Firebase Console:
1. Authentication → Get Started → Enable Email/Password
2. Firestore Database → Create → Production mode → Enable
3. Firestore Rules tab → Paste these rules:

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      match /progress/{caseId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}

4. Click Publish
```

### 5️⃣ Deploy (30 seconds)
```bash
git add .
git commit -m "Add auth system"
git push

# Then in Firebase Console:
# Authentication → Settings → Authorized domains
# Add your Netlify domain: md3-scp.netlify.app
```

## ✅ Test It

1. Visit your live site
2. Click "Sign In" button
3. Click "Sign up" → Create account
4. Open a case → Click "Mark as Complete"
5. See progress bar and checkmark ✓

**Done! 🎉**

---

## 🆘 Something Not Working?

### "Firebase is not defined"
→ Check Firebase SDK scripts in `index.html` and case HTML files

### "Permission denied"
→ Check Firestore rules (Step 4 above)

### "Can't sign in"
→ Check Email/Password is enabled in Firebase Console

### "Domain not authorized"
→ Add your domain to Firebase Console → Authentication → Settings → Authorized domains

---

## 📚 Full Documentation

- **Complete Setup**: See `FIREBASE_SETUP.md`
- **Implementation Details**: See `README_IMPLEMENTATION.md`
- **Firebase Docs**: https://firebase.google.com/docs

---

**Total Time: ~5 minutes**
**Cost: $0/month for most usage**
