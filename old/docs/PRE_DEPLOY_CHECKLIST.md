# Pre-Deploy Checklist

Use this checklist BEFORE pushing to production (deploying to Netlify).

## ✅ Functionality Tests

### Authentication
- [ ] Sign in works
- [ ] Sign up works
- [ ] Sign out works
- [ ] User profile shows correct initials
- [ ] Auth modal closes after login
- [ ] Protected content is blurred when logged out

### Case Progress
- [ ] Clicking checkmark completes case
- [ ] Completed cases show green checkmark
- [ ] Progress syncs to Firebase
- [ ] Case counts update correctly

### Flagging System
- [ ] Click bookmark to flag case
- [ ] Flagged cases show bookmark icon
- [ ] "Flagged Cases" section appears/disappears correctly
- [ ] Count shows correct number

### Navigation
- [ ] Sidebar filters work (Medicine, Surgery, etc.)
- [ ] Specialty filters work (Cardiology, etc.)
- [ ] Search finds cases correctly
- [ ] Mobile menu opens/closes
- [ ] Back button works on case pages

### Case Pages
- [ ] Case opens correctly
- [ ] All content displays
- [ ] Complete button works
- [ ] Flag button works
- [ ] Back navigation works

---

## 🔍 Technical Tests

### Browser Console
- [ ] No red errors in console (F12)
- [ ] No failed network requests
- [ ] Firebase loads correctly

### Browser Compatibility
- [ ] Works in Chrome
- [ ] Works in Safari (if on Mac)
- [ ] Works in Firefox (if available)

### Mobile/Responsive
- [ ] Resize browser to mobile size
- [ ] Mobile menu appears
- [ ] Content is readable
- [ ] Buttons are clickable

---

## 🎨 Visual Tests

- [ ] No broken images
- [ ] Styles load correctly
- [ ] Animations work smoothly
- [ ] Text is readable
- [ ] Layout looks correct

---

## 📝 Code Quality

- [ ] No commented-out debug code
- [ ] No `console.log()` left in (or intentional)
- [ ] Files saved
- [ ] No temporary test files in commit

---

## 🚀 Git Status

```bash
# Run these commands and check:
git status          # Shows what will be committed
git diff            # Shows exact changes
```

- [ ] Only intended files are being committed
- [ ] No sensitive data (passwords, keys) in code
- [ ] Commit message is clear

---

## ✨ Final Check

If ALL boxes are checked:
```bash
git add .
git commit -m "Your descriptive message"
git push origin main
```

If ANY box is unchecked:
- Fix the issue
- Test again
- Come back to this checklist

---

## 🎯 Remember

**One failed deploy = 1 wasted credit**

**Five minutes testing locally = Hours of debugging and re-deploys saved**
