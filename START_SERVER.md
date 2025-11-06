# How to Run the SCP Project with Authentication

## The Problem
Firebase authentication **does not work** when opening HTML files directly (file:// protocol). You need to run a local web server.

## Solution: Start a Local Web Server

### Option 1: Python (Recommended - Works on Mac/Linux/Windows)

**Open Terminal**, navigate to the project folder, and run:

```bash
cd ~/Desktop/SCPProject
python3 -m http.server 8000
```

Then open your browser and go to:
```
http://localhost:8000
```

### Option 2: Python 2 (if Python 3 not available)

```bash
cd ~/Desktop/SCPProject
python -m SimpleHTTPServer 8000
```

Then open: `http://localhost:8000`

### Option 3: Node.js (if you have it installed)

```bash
cd ~/Desktop/SCPProject
npx http-server -p 8000
```

Then open: `http://localhost:8000`

### Option 4: VS Code Live Server

1. Open the project folder in VS Code
2. Install "Live Server" extension
3. Right-click on `index.html`
4. Select "Open with Live Server"

## Why This Is Needed

- Firebase requires `http://` or `https://` protocol
- Opening files directly uses `file://` protocol
- `file://` protocol has security restrictions that prevent Firebase from working
- A local web server provides the proper `http://` protocol

## Quick Test

After starting the server, you should see in the browser console:
```
✓ Firebase initialized successfully
✓ User signed in: [your-email]
```

Instead of errors about "No Firebase App".
