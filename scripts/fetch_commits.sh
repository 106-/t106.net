#!/bin/bash
# GitHub public events から最新5コミットを取得して data/commits.json に保存する
# cron例: 0 * * * * /path/to/t106.net/scripts/fetch_commits.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
OUTPUT="$SCRIPT_DIR/../data/commits.json"

# PushEvent から (repo, head_sha, date) を取得
PUSHES=$(curl -sf "https://api.github.com/users/106-/events/public" | \
  jq -r '.[] | select(.type == "PushEvent") | [.repo.name, .payload.head, .created_at[:10]] | @tsv')

result="[]"
count=0

while IFS=$'\t' read -r repo sha date; do
  [ "$count" -ge 5 ] && break

  commit=$(curl -sf "https://api.github.com/repos/$repo/commits/$sha") || continue
  message=$(echo "$commit" | jq -r '.commit.message | split("\n") | first')

  # マージコミットを除外
  case "$message" in Merge\ *) continue ;; esac

  result=$(echo "$result" | jq \
    --arg repo "$repo" \
    --arg message "$message" \
    --arg sha "$sha" \
    --arg date "$date" \
    '. + [{repo: $repo, message: $message, sha: $sha, date: $date}]')
  count=$((count + 1))
done <<< "$PUSHES"

echo "$result" > "$OUTPUT"
echo "Updated $OUTPUT"
