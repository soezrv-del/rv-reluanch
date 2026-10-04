#!/usr/bin/env bash
# Morning own-lot run: scrape rvcountry.com, then publish.
#
#   bash scripts/own-lot-daily.sh                # detach, return at once
#   bash scripts/own-lot-daily.sh --no-publish   # scrape only
#   bash scripts/own-lot-daily.sh --status       # print today's status file
#
# The scrape is ~1,400 pages at 2.5s, about an hour. Run inside an agent
# tool call, it dies when that session ends and the publisher never runs
# (Oct 2 and Oct 4). This detaches with setsid/nohup so the scrape and the
# publish finish on their own. If the box or the run is killed anyway,
# run this again: the scraper resumes from $OUT.partial.jsonl (pages
# already fetched in the last 6h are not fetched again, same scraped_at).
# Guards are unchanged: the scraper still
# refuses >2% rows without a spec sheet or under 1,200 units, and the
# publisher still refuses stale, slim, or shrinking snapshots.
#
# Status: $LOG_DIR/scrape-YYYY-MM-DD.status, one line, e.g.
#   running pid=123 started=...
#   done scrape_exit=0 publish_exit=0 ended=...
set -u
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
INV_DIR="${OWN_LOT_INVENTORY_DIR:-/home/box/agent-data/projects/rvfox/inventory}"
OUT="${OWN_LOT_INVENTORY_PATH:-$INV_DIR/own-lot-latest.json}"
LOG_DIR="${OWN_LOT_LOG_DIR:-$INV_DIR/logs}"
DAY="$(TZ=America/Los_Angeles date +%F)"
LOG="$LOG_DIR/scrape-$DAY.log"
STATUS="$LOG_DIR/scrape-$DAY.status"
LOCK="$LOG_DIR/own-lot-daily.lock"
PUBLISH=1
FOREGROUND=0
for arg in "$@"; do
  case "$arg" in
    --no-publish) PUBLISH=0 ;;
    --foreground) FOREGROUND=1 ;;
    --status) cat "$STATUS" 2>/dev/null || echo "no run today ($STATUS)"; exit 0 ;;
    *) echo "unknown flag $arg" >&2; exit 2 ;;
  esac
done
mkdir -p "$LOG_DIR"

if [ "$FOREGROUND" = 0 ]; then
  args=(--foreground)
  [ "$PUBLISH" = 0 ] && args+=(--no-publish)
  setsid nohup bash "$ROOT/scripts/own-lot-daily.sh" "${args[@]}" >>"$LOG" 2>&1 </dev/null &
  echo "own-lot-daily: detached pid=$! log=$LOG status=$STATUS"
  exit 0
fi

exec 9>"$LOCK"
if ! flock -n 9; then
  echo "own-lot-daily: another run holds $LOCK, not starting a second scrape"
  exit 0
fi
stamp() { TZ=America/Los_Angeles date '+%Y-%m-%dT%H:%M:%S%z'; }
echo "running pid=$$ started=$(stamp)" >"$STATUS"
echo "start $(stamp) out=$OUT"
cd "$ROOT" || exit 1
PYTHONUNBUFFERED=1 python3 -u scripts/scrape_rvcountry_rich.py --out "$OUT"
SCRAPE_EXIT=$?
echo "SCRAPE_EXIT=$SCRAPE_EXIT $(stamp)"
PUBLISH_EXIT=skipped
if [ "$SCRAPE_EXIT" = 0 ] && [ "$PUBLISH" = 1 ]; then
  OWN_LOT_INVENTORY_PATH="$OUT" node scripts/publish-own-lot.mjs
  PUBLISH_EXIT=$?
  echo "PUBLISH_EXIT=$PUBLISH_EXIT $(stamp)"
fi
echo "done scrape_exit=$SCRAPE_EXIT publish_exit=$PUBLISH_EXIT ended=$(stamp)" >"$STATUS"
[ "$SCRAPE_EXIT" = 0 ] || exit "$SCRAPE_EXIT"
[ "$PUBLISH_EXIT" = skipped ] || exit "$PUBLISH_EXIT"
