# MD3 SCP Cases - Deployment Checklist

## Pre-Deployment Verification

### 1. File Structure Check
- [x] All case files in `cases/` folder (176 files)
- [x] All PDFs in `pdfs/` folder (174 files)
- [x] CSS files in `css/` folder (main.css, case.css)
- [x] JavaScript files in `js/` folder (navigation.js, case-interactions.js)
- [x] Assets in `assets/` folder (ShepTech logo.png)
- [x] Main index.html in root

### 2. Configuration Files
- [x] firebase.json created with proper hosting configuration
- [x] .firebaseignore created to exclude build scripts
- [ ] .firebaserc created (if deploying to specific Firebase project)

### 3. Content Verification
- [x] 117 cases have PDF buttons embedded
- [x] All case links use relative paths (../pdfs/...)
- [x] Search functionality working
- [x] Filter buttons working
- [x] "Back to Cases" navigation working
- [x] Toggle buttons for Q&A working

### 4. Design & Branding
- [x] Claude-inspired color scheme applied
- [x] ShepTech logo in top right
- [x] Title reads "MD3 SCP Cases"
- [x] All case tiles uniform size (280x140px)
- [x] Modal windows widened (1400px max-width)
- [x] Search bar added with proper styling

## Local Testing (Pre-Deploy)

### Run Local Server
```bash
cd ~/Desktop/SCPProject
python3 -m http.server 8888
```
Then visit: http://localhost:8888

### Test These Features:
- [ ] Homepage loads correctly
- [ ] All filter buttons work (All, Medicine, Surgery, Psychiatry, Paediatrics)
- [ ] Search bar filters cases correctly
- [ ] Click on a case tile opens the case page
- [ ] "Back to Cases" returns to correct filter
- [ ] Toggle buttons show/hide answers
- [ ] PDF links open correct PDFs
- [ ] Test at least 3-5 random cases from different weeks
- [ ] Test responsive design (if applicable)

## Firebase Deployment

### Prerequisites
```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login
```

### Initialize Project (First Time Only)
```bash
cd ~/Desktop/SCPProject
firebase init hosting

# Select:
# - Use existing project or create new one
# - Public directory: . (current directory)
# - Single-page app: No
# - Overwrite index.html: No
```

### Deploy to Firebase
```bash
cd ~/Desktop/SCPProject
firebase deploy --only hosting
```

### Expected Output
```
✔ Deploy complete!

Project Console: https://console.firebase.google.com/project/[your-project]/overview
Hosting URL: https://[your-project].web.app
```

## Post-Deployment Testing

### Test on Live Site
- [ ] Homepage loads correctly
- [ ] All filters work
- [ ] Search functionality works
- [ ] Random sample of 10 cases load correctly
- [ ] PDF links work (test 5 different PDFs)
- [ ] Back navigation maintains filter state
- [ ] ShepTech logo displays correctly
- [ ] Test on different browsers (Chrome, Safari, Firefox)
- [ ] Test on mobile device (if applicable)

## Troubleshooting

### Common Issues

**Issue: PDFs not loading**
- Check PDF paths are relative (../pdfs/...)
- Verify PDF files are included in deployment
- Check .firebaseignore doesn't exclude pdfs/

**Issue: CSS/JS not loading**
- Verify paths are relative (../css/, ../js/)
- Clear browser cache
- Check firebase.json headers configuration

**Issue: Case pages return 404**
- Check rewrites in firebase.json
- Verify all case files are in cases/ folder
- Test file paths locally first

**Issue: Images not loading**
- Check assets/ folder included in deployment
- Verify image paths are correct
- Check file names match exactly (including spaces)

## Rollback Procedure

If deployment has critical issues:

```bash
# View deployment history
firebase hosting:channel:list

# Rollback to previous version
firebase hosting:rollback
```

## Files Excluded from Deployment

The following files are automatically excluded via .firebaseignore:
- All .py scripts (build scripts)
- All .sh scripts (shell scripts)
- Backup files (SCP2.html, SCP2_backup.html)
- Status documents (PAEDIATRICS_CASES_STATUS.md)
- System files (.DS_Store, .claude/)
- Log files (*.log)

## Deployment Checklist Summary

✅ Project structure is modular and organized
✅ All 176 case files updated with external CSS/JS
✅ 117 cases have PDF buttons embedded
✅ Claude-inspired design applied
✅ Firebase configuration files created
✅ .firebaseignore excludes unnecessary files

**Status: READY FOR DEPLOYMENT**

---

*Last updated: 2025-10-29*
