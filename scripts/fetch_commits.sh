#!/bin/bash
# GitHub search API から最新10コミットを取得して data/commits.json に保存する
# cron例: 0 * * * * /path/to/t106.net/scripts/fetch_commits.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
OUTPUT="$SCRIPT_DIR/../data/commits.json"

gh api "search/commits?q=author:106-+is:public&sort=committer-date&order=desc&per_page=20" \
  --header "Accept: application/vnd.github.cloak-preview+json" | \
jq '[
  .items[]
  | select(.commit.message | startswith("Merge ") | not)
  | {
      repo: .repository.full_name,
      message: (.commit.message | split("\n") | first),
      sha: .sha,
      date: .commit.committer.date[:10]
    }
] | .[0:10]' > "$OUTPUT"

echo "Updated $OUTPUT"
