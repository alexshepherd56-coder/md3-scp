#!/bin/bash

# Simple development server script for SCP Cases

case "$1" in
  start)
    echo "Starting local development server..."

    # Check if server is already running
    if lsof -ti:8080 > /dev/null 2>&1; then
      echo "❌ Server already running on port 8080"
      echo "Run './dev-server.sh stop' first"
      exit 1
    fi

    # Start Python HTTP server in background
    cd ~/Desktop/SCPProject
    python3 -m http.server 8080 > /tmp/scp-dev-server.log 2>&1 &
    SERVER_PID=$!

    # Save PID for later
    echo $SERVER_PID > /tmp/scp-dev-server.pid

    sleep 1

    if lsof -ti:8080 > /dev/null 2>&1; then
      echo "✅ Development server started!"
      echo ""
      echo "📊 Admin Dashboards:"
      echo "   Basic:    http://localhost:8080/admin.html"
      echo "   Advanced: http://localhost:8080/analytics-advanced.html"
      echo ""
      echo "🏠 Main site: http://localhost:8080/index.html"
      echo ""
      echo "💡 Tip: Open the browser console (F12) to see debug logs"
      echo ""
      echo "To stop: ./dev-server.sh stop"
    else
      echo "❌ Failed to start server"
    fi
    ;;

  stop)
    echo "Stopping development server..."

    # Kill process on port 8080
    if lsof -ti:8080 > /dev/null 2>&1; then
      lsof -ti:8080 | xargs kill
      rm -f /tmp/scp-dev-server.pid
      echo "✅ Server stopped"
    else
      echo "ℹ️  No server running on port 8080"
    fi
    ;;

  restart)
    echo "Restarting development server..."
    $0 stop
    sleep 1
    $0 start
    ;;

  status)
    if lsof -ti:8080 > /dev/null 2>&1; then
      PID=$(lsof -ti:8080)
      echo "✅ Server is running (PID: $PID)"
      echo "   http://localhost:8080"
    else
      echo "❌ Server is not running"
    fi
    ;;

  logs)
    if [ -f /tmp/scp-dev-server.log ]; then
      tail -f /tmp/scp-dev-server.log
    else
      echo "No logs found. Server may not be running."
    fi
    ;;

  *)
    echo "SCP Cases Development Server"
    echo ""
    echo "Usage: ./dev-server.sh {start|stop|restart|status|logs}"
    echo ""
    echo "Commands:"
    echo "  start   - Start the development server"
    echo "  stop    - Stop the development server"
    echo "  restart - Restart the development server"
    echo "  status  - Check if server is running"
    echo "  logs    - View server logs (Ctrl+C to exit)"
    echo ""
    echo "Once started, visit:"
    echo "  http://localhost:8080/admin.html"
    echo "  http://localhost:8080/analytics-advanced.html"
    exit 1
    ;;
esac
