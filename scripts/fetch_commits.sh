#!/bin/bash
# GitHub public events から最新5コミットを取得して data/commits.json に保存する
# cron例: 0 * * * * /path/to/t106.net/scripts/fetch_commits.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
OUTPUT="$SCRIPT_DIR/../data/commits.json"

curl -sf "https://api.github.com/users/106-/events/public" | \
python3 - <<'EOF'
import json, sys

events = json.load(sys.stdin)
commits = []
for ev in events:
    if ev.get("type") != "PushEvent":
        continue
    repo = ev["repo"]["name"]
    date = ev["created_at"][:10]
    for c in reversed(ev["payload"].get("commits", [])):
        msg = c["message"].split("\n")[0]
        if msg.startswith("Merge "):
            continue
        commits.append({
            "repo": repo,
            "message": msg,
            "sha": c["sha"],
            "date": date
        })
        if len(commits) >= 5:
            break
    if len(commits) >= 5:
        break

print(json.dumps(commits, ensure_ascii=False, indent=2))
EOF > "$OUTPUT"

echo "Updated $OUTPUT"
