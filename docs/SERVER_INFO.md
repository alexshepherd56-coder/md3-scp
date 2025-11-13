# What Happens If You Leave the Local Server Running?

## Short Answer
**Nothing bad!** But it will use resources and block port 8000.

## What Actually Happens

### ✅ Safe/Normal Behavior

1. **Server keeps running** in the background
   - Continues serving your files at http://localhost:8000
   - Uses minimal CPU/memory (very lightweight)
   - No security risk (only accessible on your computer)

2. **Still accessible**
   - You can access http://localhost:8000 anytime
   - Works even if you close the browser
   - Works until you restart your computer or stop the server

3. **Port 8000 is occupied**
   - You can't start another server on port 8000
   - Other ports (8001, 8080, 3000, etc.) still available

### ⚠️ Minor Inconveniences

1. **Port blocked**
   - If you try to start another server on port 8000:
     ```
     Error: Address already in use
     ```
   - Solution: Kill the old server or use a different port

2. **Uses resources** (minimal)
   - Takes ~10-20 MB of RAM
   - Negligible CPU usage when idle
   - Not a problem for modern computers

3. **Terminal window**
   - If you close the Terminal window, the server might stop (depends on how it was started)
   - If running in background (with `&`), it keeps running even after closing Terminal

## What Happens When You Restart Your Computer?

**Server automatically stops** - you'll need to start it again.

## Best Practices

### Option 1: Leave It Running While Developing
```bash
# Start server
cd ~/Desktop/SCPProject
python3 -m http.server 8000

# Keep Terminal open, minimize it
# Server runs as long as Terminal is open
```

**Good for:**
- Active development sessions
- Testing changes frequently
- Quick iterations

### Option 2: Stop When Done
```bash
# When finished testing, press Ctrl+C in Terminal
# Or close Terminal window
```

**Good for:**
- When you're done for the day
- Freeing up port 8000
- Clean system state

### Option 3: Background Process (Advanced)
```bash
# Start in background
cd ~/Desktop/SCPProject
python3 -m http.server 8000 > /dev/null 2>&1 &

# Server runs even after closing Terminal
# Kill later with:
lsof -ti:8000 | xargs kill
```

**Good for:**
- Long-term development
- Multiple Terminal sessions
- Keeping server always available

## Common Scenarios

### Scenario 1: "I closed my laptop, came back, and localhost:8000 still works"
✅ **Normal!** Server is still running. Terminal is still open in the background.

### Scenario 2: "I restarted my computer and localhost:8000 doesn't work"
✅ **Normal!** Server stopped. Just restart it:
```bash
cd ~/Desktop/SCPProject && python3 -m http.server 8000
```

### Scenario 3: "I closed Terminal and localhost:8000 stopped working"
✅ **Normal!** Closing Terminal kills the server (unless you ran it in background).

### Scenario 4: "It says port 8000 is already in use"
✅ **Server is already running!** Either:
- Just use it: http://localhost:8000
- Or kill it: `lsof -ti:8000 | xargs kill`

### Scenario 5: "I left it running for a week"
✅ **Totally fine!** Uses minimal resources. No problems.

## Quick Commands Reference

```bash
# Check if server is running on port 8000
lsof -ti:8000

# If you see a number (process ID), it's running
# If you see nothing, it's not running

# Kill the server
lsof -ti:8000 | xargs kill

# Start server
cd ~/Desktop/SCPProject && python3 -m http.server 8000

# Start server in background (runs after closing Terminal)
cd ~/Desktop/SCPProject && python3 -m http.server 8000 > /dev/null 2>&1 &
```

## My Recommendation

**While actively developing:**
- ✅ Leave it running
- ✅ Keep Terminal minimized
- ✅ Just refresh browser to see changes

**When you're done for the day:**
- ✅ Press `Ctrl+C` to stop
- ✅ Or just close Terminal
- ✅ Clean slate for next session

**For long-term projects:**
- ✅ Run in background with `&`
- ✅ Create a start script (see below)

## Pro Tip: Create a Start Script

Create a file called `start-server.sh`:

```bash
#!/bin/bash
cd ~/Desktop/SCPProject
echo "Starting server on http://localhost:8000"
python3 -m http.server 8000
```

Make it executable:
```bash
chmod +x start-server.sh
```

Run it:
```bash
./start-server.sh
```

Or double-click it in Finder (after making it executable)!

## Bottom Line

**Leaving it running is totally safe and often convenient.** The only real issue is that port 8000 stays occupied, but that's easy to fix. Modern computers handle background servers like this without any problem.
