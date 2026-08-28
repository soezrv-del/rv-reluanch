#!/bin/sh
# Diagnose / free port 8080 conflicts for the live preview.
set -eu
PORT="${1:-8080}"
echo "== Port $PORT debug =="
echo "-- health --"
if curl -sf -o /dev/null --max-time 2 "http://127.0.0.1:${PORT}/"; then
  echo "HEALTHY http://127.0.0.1:${PORT}/"
else
  echo "NOT HEALTHY (no 200 from preview URL)"
fi

echo "-- vite / npm processes --"
found=0
for d in /proc/[0-9]*; do
  pid=${d#/proc/}
  cmd=$(tr '\0' ' ' <"$d/cmdline" 2>/dev/null || true)
  case "$cmd" in
    *vite*|*npm*run*dev*)
      echo "PID $pid: $cmd"
      found=1
      ;;
  esac
done
[ "$found" = 0 ] && echo "(none)"

echo "-- recent EADDRINUSE / port lines in /tmp/app-startup.log --"
if [ -f /tmp/app-startup.log ]; then
  grep -E 'EADDRINUSE|Port .* is already|error when starting|ready in' /tmp/app-startup.log | tail -20 || true
else
  echo "(no log)"
fi

if [ "${2:-}" = "--free" ]; then
  echo "-- freeing port $PORT --"
  for d in /proc/[0-9]*; do
    pid=${d#/proc/}
    cmd=$(tr '\0' ' ' <"$d/cmdline" 2>/dev/null || true)
    case "$cmd" in
      *"/workspace/node_modules/.bin/vite"*|*"vite dev --host"*|*"npm run dev"*)
        echo "kill $pid"
        kill -9 "$pid" 2>/dev/null || true
        ;;
    esac
  done
  sleep 1
  sh /workspace/startup.sh
  echo "-- after restart --"
  curl -s -o /dev/null -w "HTTP %{http_code}\n" --max-time 5 "http://127.0.0.1:${PORT}/" || echo fail
fi
