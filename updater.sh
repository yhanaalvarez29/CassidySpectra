#!/bin/bash
# Run with: sh updater.sh
echo "Updating from CassidyRedux like a pro..."
echo "WARNING: This pulls from https://github.com/lianecagara/CassidyRedux."
echo "1. Unrelated histories might merge if your local repo has no shared past. Could get messy."
echo "2. Merge conflicts might pop up if your local changes clash with the remote."
echo "   - To stop: Say 'n' now, or Ctrl+C if it starts."
echo "   - To fix conflicts later: Edit the flagged files, then 'git add' and 'git commit'."
echo "Proceed? (y/n)"
read -r response
if [[ "$response" =~ ^[Yy]$ ]]; then
    git pull --no-ff --no-commit --allow-unrelated-histories https://github.com/lianecagara/CassidyRedux
    if [ $? -eq 0 ]; then
        echo "Pulled clean. You’re good. (Uncommitted changes left to review.)"
    else
        echo "Fuck, something broke. Check the error above."
        echo "If it’s a merge conflict, look for '<<<<<<<' in files."
        echo "Fix: Edit those files, then run 'git add <file>' and 'git commit'."
    fi
else
    echo "Aborted. No changes pulled. Stay safe."
fi