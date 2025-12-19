---
description: Deployment Protocol for Nusion (Google Drive Sync)
---

# 🚀 Nusion Deployment Protocol

**CRITICAL RULE: Always push to remote.**

## Context
This project resides in a `Google Drive` synced folder.
1.  **Local Dev**: You are editing files synced by Drive.
2.  **Vercel Build**: Vercel pulls from **GitHub**, NOT your local Google Drive.
3.  **Conflict Risk**: Google Drive creates lock files inside `.git/` that often block git operations.

## The Protocol

### 1. After Every Significant Change
Once you have modified code and verified it locally:

**You MUST push to GitHub immediately.**
Changes on your machine do **NOT** exist for the live site until they are pushed.

### 2. How to Push (Safe Handling of Locks)
Since Drive locks files, standard `git push` might fail. Use this sequence:

```bash
# 1. Clear Drive-induced locks
find .git -name "*.lock" -delete

# 2. Add, Commit, Push
git add .
git commit -m "feat: description of changes"
git push
```

### 3. Verification
After pushing, always check:
1.  Terminal output: Ensure `git push` succeeded.
2.  Vercel Dashboard: Ensure a new build defaults to "Building".

> **Mantra**: Is it on GitHub? If no, it's not real.
