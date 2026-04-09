#!/bin/sh

git fetch origin

UPSTREAM=$(git rev-parse @{u} 2>/dev/null)
if [ $? -ne 0 ]; then
  echo "No upstream branch configured, skipping check"
  exit 0
fi

BEHIND=$(git rev-list --count HEAD..@{u})
if [ "$BEHIND" -gt 0 ]; then
  echo "❌ Your branch is $BEHIND commit(s) behind the remote."
  echo "   Please run 'git pull' before committing."
  exit 1
fi
