#!/usr/bin/env bash
#
# Stop hook — self-improvement nudge.
# When a turn ends with uncommitted changes, remind (once per session,
# non-blocking) to capture learnings. Stays silent when the tree is clean.
#
# stdin: the Stop-hook JSON payload { session_id, stop_hook_active, ... }
# stdout (optional): { "systemMessage": "..." } — no decision/continue field,
# so it never blocks Claude from stopping; it only surfaces a message.

input=$(cat)

# Extract fields with sed/grep so the hook has no jq dependency (jq is not
# guaranteed to be installed; relying on it would silently degrade the throttle).
sid=$(printf '%s' "$input" | sed -n 's/.*"session_id"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -n1)
[ -z "$sid" ] && sid=default
if printf '%s' "$input" | grep -Eq '"stop_hook_active"[[:space:]]*:[[:space:]]*true'; then
  active=true
else
  active=false
fi

# 1. Loop guard: never re-fire while already continuing from a stop hook.
[ "$active" = "true" ] && exit 0

# 2. Resolve the repo from this script's own location (cwd-independent).
script_dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" 2>/dev/null && pwd) || exit 0
repo=$(git -C "$script_dir" rev-parse --show-toplevel 2>/dev/null) || exit 0

# 3. Stay silent unless there is uncommitted work.
[ -n "$(git -C "$repo" status --porcelain 2>/dev/null)" ] || exit 0

# 4. Throttle to at most once per session.
marker="${TMPDIR:-/tmp}/claude-capture-nudge-${sid}"
[ -e "$marker" ] && exit 0
: > "$marker" 2>/dev/null || true

# 5. Non-blocking nudge.
printf '%s\n' '{"systemMessage":"💡 Uncommitted changes this session — before wrapping up, consider capturing learnings: /remember (session state), /hookify (turn mistakes into guardrails), or /revise-claude-md (fold lessons into CLAUDE.md)."}'
