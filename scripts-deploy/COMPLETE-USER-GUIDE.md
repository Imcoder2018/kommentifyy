# Complete User Guide - Git Deployment Scripts
## When, Why, and How to Use Each Feature

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Repository Management](#repository-management)
3. [Daily Workflow Scripts](#daily-workflow-scripts)
4. [Branch Management](#branch-management)
5. [Deployment Scripts](#deployment-scripts)
6. [History & Recovery](#history--recovery)
7. [Advanced Features](#advanced-features)
8. [Security & Maintenance](#security--maintenance)
9. [Integration Tools](#integration-tools)
10. [Troubleshooting Scripts](#troubleshooting-scripts)

---

## Getting Started

### START-HERE.bat

**What it does:** Provides a guided entry point for new users with common options.

**When to use:**
- First time using these scripts
- When you're unsure which script to run
- Quick access to most common operations

**Why you need it:**
- Reduces confusion for beginners
- Provides a simple starting point
- Shows available options at a glance

**How to use:**
```
Double-click START-HERE.bat
Select from the menu options
```

---

### menu.bat

**What it does:** Main interactive menu with all 20+ basic operations organized by category.

**When to use:**
- When you want to browse all available operations
- When you can't remember the exact script name
- For guided navigation through Git operations

**Why you need it:**
- Central hub for all scripts
- Organized categories make finding features easy
- No need to remember individual script names

**How to use:**
```
Double-click menu.bat
Enter the number of your choice (1-21)
Follow the prompts
```

---

### menu-advanced.bat

**What it does:** Extended menu with 27 advanced Git operations.

**When to use:**
- When you need advanced features like cherry-pick, bisect, or worktrees
- For repository optimization and analysis
- When managing tags, submodules, or hooks

**Why you need it:**
- Access to professional Git features
- Repository maintenance tools
- Advanced debugging and analysis

---

## Repository Management

### init-repo.bat

**What it does:** Initializes a new Git repository and connects it to GitHub.

**When to use:**
- Starting a brand new project
- Converting an existing folder to a Git repository
- Setting up version control for the first time

**Why you need it:**
- Automates the tedious setup process
- Creates proper .gitignore based on project type
- Handles GitHub repository creation
- Sets up remote connection automatically

**How to use:**
```
1. Place scripts-deploy folder in your project
2. Double-click init-repo.bat
3. Enter repository name (or press Enter for folder name)
4. Choose public or private
5. Script handles everything else
```

**Real-world scenarios:**
- "I just started a new web project and need version control"
- "I have code files but no Git setup yet"
- "I need to create a GitHub repo for my project"

---

### clone-repo.bat

**What it does:** Downloads (clones) an existing repository from GitHub or other Git hosts.

**When to use:**
- Downloading someone else's project
- Getting a copy of your own repository on a new computer
- Starting work on an existing team project

**Why you need it:**
- Multiple clone options (shallow, with submodules, specific branch)
- Validates URL before attempting
- Offers to install dependencies after clone
- Handles errors gracefully

**Clone options explained:**
| Option | When to use | Why |
|--------|-------------|-----|
| Normal clone | Most cases | Full history, all features |
| Specific branch | Only need one branch | Faster, less data |
| Shallow clone | Large repos, quick look | Much faster, minimal data |
| With submodules | Project has dependencies | Gets everything needed |
| Mirror | Backup purposes | Complete copy for archival |
| Sparse checkout | Huge monorepos | Only get folders you need |

**How to use:**
```
1. Double-click clone-repo.bat
2. Enter repository URL
3. Choose clone type
4. Wait for download
```

---

### status.bat

**What it does:** Shows comprehensive information about your repository's current state.

**When to use:**
- Before starting work (check what's changed)
- Before committing (verify what will be included)
- When confused about repository state
- Regular check-ins during development

**Why you need it:**
- See uncommitted changes at a glance
- Know which branch you're on
- Check if you're ahead/behind remote
- View recent commits and stashes

**Information displayed:**
- Current branch name
- Remote URLs
- Modified/staged/untracked files
- Last 5 commits
- Local branches
- Stashed changes
- Ahead/behind status

**How to use:**
```
Double-click status.bat
Review the information
Press any key to close
```

---

## Daily Workflow Scripts

### quick-save.bat

**What it does:** Automatically commits all changes with a timestamp message and pushes to remote.

**When to use:**
- Quick saves during development
- When you don't need a specific commit message
- Frequent checkpoints while working
- End of day saves

**Why you need it:**
- Fastest way to save your work
- No typing required
- Automatic timestamp for tracking
- Pushes immediately to remote (backup)

**Commit message format:**
```
Auto-save: 2024-01-15 14:30:45
```

**How to use:**
```
Double-click quick-save.bat
Script automatically:
  1. Stages all changes
  2. Creates timestamped commit
  3. Pushes to remote
```

**Best practices:**
- Use for work-in-progress saves
- Use save-with-message.bat for meaningful milestones
- Don't use for final/release commits

---

### save-with-message.bat

**What it does:** Commits all changes with your custom message and pushes to remote.

**When to use:**
- Completing a feature or fix
- When the commit deserves a descriptive message
- Before switching to different work
- Meaningful project milestones

**Why you need it:**
- Creates meaningful project history
- Easier to find specific changes later
- Professional commit log
- Better for team collaboration

**Good commit messages:**
```
✓ "Add user login functionality"
✓ "Fix navigation bug on mobile"
✓ "Update dependencies to latest versions"

✗ "update"
✗ "fix"
✗ "changes"
```

**How to use:**
```
1. Double-click save-with-message.bat
2. Review shown changes
3. Type your commit message
4. Script commits and pushes
```

---

### quick-commit.bat

**What it does:** Fastest possible commit - accepts message as argument or prompts.

**When to use:**
- Command-line users who want speed
- Scripting and automation
- When you know exactly what message you want

**Why you need it:**
- Can be called with message: `quick-commit.bat "your message"`
- Minimal prompts
- Fastest commit workflow

**How to use:**
```
Method 1: Double-click, enter message when prompted
Method 2: Command line: quick-commit.bat "Fix login bug"
```

---

### pull-latest.bat

**What it does:** Downloads the latest changes from the remote repository.

**When to use:**
- Start of each work session
- Before starting new work
- When teammates have pushed changes
- Before merging branches

**Why you need it:**
- Stay synchronized with team
- Avoid merge conflicts
- Get latest fixes and features
- Prevent pushing outdated code

**Smart features:**
- Automatically stashes your changes if needed
- Restores stashed changes after pull
- Handles merge conflicts gracefully

**How to use:**
```
1. Double-click pull-latest.bat
2. If you have changes, choose to stash them
3. Script pulls latest from remote
4. Optionally restore stashed changes
```

---

## Branch Management

### create-branch.bat

**What it does:** Creates a new Git branch for separate work streams.

**When to use:**
- Starting a new feature
- Working on a bug fix
- Experimenting with changes
- Preparing a release

**Why you need it:**
- Keep different work separate
- Safe experimentation
- Parallel development
- Clean main branch

**Branch naming conventions:**
```
feature/user-authentication    - New features
bugfix/login-error            - Bug fixes
hotfix/security-patch         - Urgent fixes
release/v1.0.0                - Release preparation
experiment/new-design         - Experiments
```

**Create from options:**
| Option | When to use |
|--------|-------------|
| Current branch | Continue from current work |
| Main/Master | Start fresh from production |
| Specific commit | Branch from past state |
| Remote branch | Track someone else's branch |

**How to use:**
```
1. Double-click create-branch.bat
2. Enter branch name (e.g., feature/new-login)
3. Choose what to create from
4. Optionally push to remote
```

---

### switch-branch.bat

**What it does:** Changes to a different branch safely.

**When to use:**
- Moving between features
- Checking another branch's code
- Returning to main branch
- Context switching during work

**Why you need it:**
- Safely handles uncommitted changes
- Fetches remote branches automatically
- Creates tracking branches for remote branches
- Prevents accidental loss of work

**Change handling options:**
| Option | What happens |
|--------|--------------|
| Stash changes | Saves changes, switch, optionally restore |
| Commit changes | Commits first, then switches |
| Discard changes | Permanently removes changes |
| Cancel | Stays on current branch |

**How to use:**
```
1. Double-click switch-branch.bat
2. If you have changes, choose how to handle them
3. Enter target branch name
4. Script switches safely
```

---

### merge-branch.bat

**What it does:** Combines changes from one branch into another.

**When to use:**
- Feature is complete, merge to main
- Incorporating updates from main into feature branch
- Combining work from multiple branches

**Why you need it:**
- Preview before merging
- Multiple merge strategies
- Automatic backup creation
- Conflict detection and guidance

**Merge strategies:**
| Strategy | When to use | Result |
|----------|-------------|--------|
| Regular merge | Default, preserves history | Merge commit created |
| Squash merge | Clean up messy history | Single commit with all changes |
| Fast-forward | Linear history | No merge commit if possible |
| Ours/Theirs | Resolve conflicts automatically | Keeps one side's changes |

**How to use:**
```
1. Switch to the branch that will RECEIVE changes
2. Double-click merge-branch.bat
3. Enter the branch to merge FROM
4. Choose merge strategy
5. Review preview and confirm
```

**Example:**
```
To merge feature into main:
1. Be on 'main' branch
2. Run merge-branch.bat
3. Enter 'feature' as source
4. Feature changes now in main
```

---

### delete-branch.bat

**What it does:** Removes branches that are no longer needed.

**When to use:**
- After merging a feature branch
- Cleaning up old/abandoned branches
- Removing experimental branches

**Why you need it:**
- Safe deletion with checks
- Option to archive before deleting
- Batch delete merged branches
- Protects important branches

**Deletion options:**
| Option | What it does |
|--------|--------------|
| Local only | Removes from your computer |
| Remote only | Removes from GitHub |
| Both | Removes everywhere |
| Batch delete | Remove all merged branches |
| Archive first | Create tag backup, then delete |

**Safety features:**
- Can't delete current branch
- Extra confirmation for main/master
- Warns about unmerged changes
- Archive option preserves history

**How to use:**
```
1. Double-click delete-branch.bat
2. Choose deletion type
3. Enter branch name
4. Confirm deletion
```

---

### compare-branches.bat

**What it does:** Shows differences between two branches.

**When to use:**
- Before merging (see what will change)
- Reviewing someone's work
- Finding when code diverged
- Understanding branch differences

**Why you need it:**
- Preview merge before doing it
- Understand scope of changes
- Find specific differences
- Review code changes

**Comparison types:**
| Type | Shows |
|------|-------|
| Commits in A not B | What A has that B doesn't |
| Commits in B not A | What B has that A doesn't |
| Both differences | Complete picture |
| File differences | Which files changed |
| Detailed diff | Actual code changes |
| Statistics | Summary with line counts |

---

### branch-cleanup.bat

**What it does:** Removes old, merged, or stale branches automatically.

**When to use:**
- Repository has many old branches
- After completing multiple features
- Regular maintenance
- Before repository audits

**Why you need it:**
- Automated cleanup saves time
- Identifies safe-to-delete branches
- Prunes remote tracking branches
- Keeps repository organized

**How to use:**
```
1. Double-click branch-cleanup.bat
2. Choose cleanup action
3. Review branches to delete
4. Confirm deletion
```

---

### branch-rename.bat

**What it does:** Changes the name of a branch locally and/or on remote.

**When to use:**
- Fixing typos in branch names
- Updating to new naming conventions
- Reorganizing branch structure

**Why you need it:**
- Renames locally and remotely in one step
- Updates tracking information
- Handles the complexity automatically

---

## Deployment Scripts

### deploy-dev.bat

**What it does:** Commits, tags, and pushes changes to development environment.

**When to use:**
- Deploying features for testing
- Sharing work with QA team
- Development environment updates
- Pre-production testing

**Why you need it:**
- Standardized deployment process
- Automatic [DEV] prefix in commits
- Creates/uses development branch
- Network checking and retry

**What it does automatically:**
1. Checks network connectivity
2. Shows current changes
3. Commits with [DEV] prefix
4. Creates development branch if needed
5. Pushes with retry on failure
6. Logs the deployment

**How to use:**
```
1. Double-click deploy-dev.bat
2. Enter commit message
3. Script handles deployment
```

---

### deploy-prod.bat

**What it does:** Safely deploys to production with multiple safety checks.

**When to use:**
- Releasing to production
- Publishing stable versions
- Major releases

**Why you need it:**
- Multiple confirmation steps
- Pre-deployment checks
- Automatic backup branch
- Production tags for tracking
- Easy rollback reference

**Safety features:**
1. Network connectivity check
2. Remote access verification
3. Requires typing "YES" to confirm
4. Creates backup branch
5. Creates timestamped tag
6. Logs everything

**Production tag format:**
```
prod-20240115-1430
```

**How to use:**
```
1. Double-click deploy-prod.bat
2. Pass all pre-deployment checks
3. Type "YES" to confirm
4. Enter commit message
5. Script deploys safely
```

---

### deploy-rollback.bat

**What it does:** Reverts a deployment to a previous state.

**When to use:**
- Deployment caused issues
- Need to restore previous version
- Emergency fixes required
- Rolling back bad changes

**Why you need it:**
- Quick recovery from bad deployments
- Multiple rollback options
- Creates backups before rolling back
- Emergency hotfix workflow

**Rollback options:**
| Option | When to use |
|--------|-------------|
| Previous tag | Quick rollback to last deployment |
| Specific tag | Rollback to known good version |
| Specific commit | Precise rollback point |
| Rollback branch | Test rollback before applying |
| Revert commit | Safe for pushed changes |
| Hotfix deployment | Emergency fix workflow |

---

## History & Recovery

### view-history.bat

**What it does:** Browse and search through commit history.

**When to use:**
- Finding when a change was made
- Understanding project evolution
- Finding specific commits
- Code archaeology

**Why you need it:**
- Multiple view formats
- Search capabilities
- File-specific history
- Visual branch graph

**View options:**
| Option | Shows |
|--------|-------|
| Simple (10/20/50) | One-line commit list |
| Detailed | Full commit information |
| Graph | Visual branch structure |
| By author | Specific person's commits |
| By date | Commits in time range |
| By message | Search commit messages |
| File history | Single file's changes |

---

### undo-commit.bat

**What it does:** Reverses the last commit with various options.

**When to use:**
- Made a mistake in last commit
- Forgot to include files
- Wrong commit message
- Need to uncommit changes

**Why you need it:**
- Multiple undo strategies
- Safe options for pushed commits
- Preserves or discards changes as needed

**Undo methods:**
| Method | Changes | Use when |
|--------|---------|----------|
| Soft reset | Kept staged | Fix commit message, add files |
| Mixed reset | Kept unstaged | Reorganize what to commit |
| Hard reset | Deleted | Completely discard commit |
| Revert | New commit | Already pushed to remote |

**IMPORTANT:** Hard reset cannot be undone!

---

### revert-to-commit.bat

**What it does:** Restores entire project to any previous state.

**When to use:**
- Project is broken, need working version
- Undo multiple commits
- Restore to specific point in time
- Emergency recovery

**Why you need it:**
- Full project restoration
- Multiple safety confirmations
- Creates backups automatically
- Search and preview commits

**Revert methods:**
| Method | Effect | Best for |
|--------|--------|----------|
| Hard Reset | Complete revert, loses changes | Emergency restore |
| Soft Reset | Undo commits, keep changes staged | Reorganizing commits |
| Mixed Reset | Undo commits, changes unstaged | Selective recommit |
| Revert Commit | New commit undoing changes | Already pushed |

---

### stash-changes.bat

**What it does:** Temporarily saves uncommitted work.

**When to use:**
- Need to switch branches but not ready to commit
- Want to try something without losing current work
- Pulling changes but have local modifications
- Temporarily shelving work

**Why you need it:**
- Save work without committing
- Multiple named stashes
- Preview before applying
- Create branch from stash

**Stash operations:**
| Operation | What it does |
|-----------|--------------|
| Stash | Save changes, clean working directory |
| Stash with message | Save with description |
| Apply | Restore changes, keep in stash |
| Pop | Restore changes, remove from stash |
| Drop | Delete a stash |
| Branch | Create branch from stashed changes |

---

### reflog-explorer.bat

**What it does:** Explores Git's reflog to recover lost work.

**When to use:**
- Accidentally deleted a branch
- Lost commits after reset
- Need to undo a destructive operation
- Recovery from mistakes

**Why you need it:**
- Git records everything in reflog
- Recover "lost" commits
- Undo almost any mistake
- Last resort recovery

**Recovery capabilities:**
- Recover deleted branches
- Find lost commits
- Undo resets
- Restore previous states

---

## Advanced Features

### cherry-pick.bat

**What it does:** Copies specific commits from one branch to another.

**When to use:**
- Need specific fix from another branch
- Porting features selectively
- Backporting fixes to older versions

**Why you need it:**
- Select exactly which commits to copy
- Avoid merging entire branches
- Precise control over changes

---

### tag-manager.bat

**What it does:** Creates, manages, and pushes Git tags.

**When to use:**
- Marking releases (v1.0.0)
- Creating reference points
- Deployment tracking

**Why you need it:**
- Multiple tag types (lightweight, annotated, signed)
- Push tags to remote
- Delete tags safely
- Release versioning

**Tag types:**
| Type | When to use |
|------|-------------|
| Lightweight | Quick bookmarks |
| Annotated | Releases with notes |
| Signed | Verified releases |

---

### version-bump.bat

**What it does:** Manages semantic versioning (MAJOR.MINOR.PATCH).

**When to use:**
- Preparing a release
- Incrementing version numbers
- Creating release tags

**Why you need it:**
- Automatic version calculation
- Updates package.json if present
- Creates version tags
- Follows semantic versioning

**Version types:**
| Type | When | Example |
|------|------|---------|
| Patch | Bug fixes | 1.0.0 → 1.0.1 |
| Minor | New features | 1.0.0 → 1.1.0 |
| Major | Breaking changes | 1.0.0 → 2.0.0 |

---

### changelog-generate.bat

**What it does:** Automatically creates changelog from commits.

**When to use:**
- Before releases
- Documentation updates
- Tracking changes over time

**Why you need it:**
- Automatic generation saves time
- Multiple formats
- Conventional commit support

---

### worktree-manager.bat

**What it does:** Manages multiple working directories for same repository.

**When to use:**
- Working on multiple branches simultaneously
- Comparing code between branches
- Running tests on one branch while developing another

**Why you need it:**
- No need to stash/switch constantly
- Multiple branches checked out at once
- Better for complex workflows

---

### submodule-manager.bat

**What it does:** Manages Git submodules (repositories within repositories).

**When to use:**
- Project depends on other Git repos
- Sharing code between projects
- Using third-party libraries as Git repos

**Why you need it:**
- Simplifies complex submodule commands
- Update all submodules easily
- Add/remove submodules safely

---

### bisect.bat

**What it does:** Binary search through commits to find when a bug was introduced.

**When to use:**
- Bug exists now but didn't before
- Need to find which commit caused issue
- Debugging regression bugs

**Why you need it:**
- Efficient bug finding (binary search)
- Can automate with test scripts
- Finds exact commit that broke things

**How it works:**
1. Mark a known bad commit
2. Mark a known good commit
3. Git checks out middle commit
4. You test and mark good/bad
5. Repeat until found

---

### blame.bat

**What it does:** Shows who changed each line of a file and when.

**When to use:**
- Finding who wrote specific code
- Understanding why code exists
- Tracking down the author of a bug

**Why you need it:**
- Line-by-line attribution
- Historical context
- Find related commits

---

## Security & Maintenance

### secret-scan.bat

**What it does:** Scans code for accidentally committed secrets.

**When to use:**
- Before pushing code
- Security audits
- Checking existing repositories

**Why you need it:**
- Prevents credential leaks
- Scans for common patterns
- Checks commit history

**What it detects:**
- API keys
- Passwords
- Private keys
- Tokens
- Credentials

---

### hooks-manager.bat

**What it does:** Installs and manages Git hooks.

**When to use:**
- Enforcing code quality
- Running tests before commit
- Validating commit messages

**Why you need it:**
- Automated quality checks
- Prevent bad commits
- Enforce standards

**Available hooks:**
| Hook | When runs | Use for |
|------|-----------|---------|
| pre-commit | Before commit | Lint, tests |
| pre-push | Before push | Tests, checks |
| commit-msg | After message | Validate format |

---

### gc-optimize.bat

**What it does:** Optimizes repository performance and cleans up.

**When to use:**
- Repository is slow
- After lots of activity
- Regular maintenance

**Why you need it:**
- Improves performance
- Reduces repository size
- Cleans up garbage

---

### config-backup.bat

**What it does:** Backs up and restores Git configuration.

**When to use:**
- Before changing settings
- Moving to new computer
- Sharing configuration

**Why you need it:**
- Preserve your settings
- Easy migration
- Disaster recovery

---

## Integration Tools

### github-integration.bat

**What it does:** Integrates with GitHub for PRs, issues, releases.

**When to use:**
- Creating pull requests
- Managing issues
- Creating releases
- Checking CI status

**Why you need it:**
- Command-line GitHub access
- Faster than web interface
- Scriptable operations

**Features:**
- Create/view/merge pull requests
- Create/manage issues
- Create releases
- Trigger workflows

---

### alias-manager.bat

**What it does:** Creates and manages Git command shortcuts.

**When to use:**
- Want shorter commands
- Frequently used operations
- Custom workflows

**Why you need it:**
- Type less
- Consistent shortcuts
- Faster workflow

**Example aliases:**
```
git st    → git status
git co    → git checkout
git cm    → git commit -m
git lg    → git log --oneline --graph
```

---

### ignore-manager.bat

**What it does:** Manages .gitignore files interactively.

**When to use:**
- Setting up new project
- Adding ignore patterns
- Checking what's ignored

**Why you need it:**
- Project-type templates
- Easy pattern management
- Check ignored files

---

### remote-manager.bat

**What it does:** Manages multiple remote repositories.

**When to use:**
- Working with forks
- Multiple deployment targets
- Mirror repositories

**Why you need it:**
- Handle multiple remotes
- Push to multiple places
- Manage upstream repos

---

## Troubleshooting Scripts

### fix-git.bat

**What it does:** Diagnoses and fixes common Git problems.

**When to use:**
- Git commands failing
- Authentication issues
- Repository corruption
- Connection problems

**Why you need it:**
- Automated diagnosis
- Common fixes built-in
- Recovery tools

**Fixes available:**
| Issue | Solution |
|-------|----------|
| Remote connection | Update URLs, test connectivity |
| Credentials | Reset credential helper |
| SSH keys | Create or configure SSH |
| Line endings | Configure autocrlf |
| Detached HEAD | Create/switch to branch |
| Merge conflicts | Resolve or abort |
| Corruption | fsck and gc |

---

### TEST-SCRIPTS.bat

**What it does:** Tests if your system is properly configured.

**When to use:**
- First time setup
- Something not working
- After system changes

**What it checks:**
- Git installed
- GitHub CLI installed
- Authentication status
- Configuration values

---

### DIAGNOSE-NOW.bat

**What it does:** Quick diagnostic check for common issues.

**When to use:**
- Scripts closing immediately
- Quick health check
- Identifying problems fast

---

## Quick Reference Table

| Need to... | Use this script |
|------------|-----------------|
| Start new project | init-repo.bat |
| Download existing project | clone-repo.bat |
| Quick save work | quick-save.bat |
| Save with message | save-with-message.bat |
| Check status | status.bat |
| Create new branch | create-branch.bat |
| Switch branches | switch-branch.bat |
| Merge branches | merge-branch.bat |
| Delete branch | delete-branch.bat |
| Deploy to dev | deploy-dev.bat |
| Deploy to prod | deploy-prod.bat |
| Rollback deployment | deploy-rollback.bat |
| Undo last commit | undo-commit.bat |
| Restore old version | revert-to-commit.bat |
| Save work temporarily | stash-changes.bat |
| View history | view-history.bat |
| Fix Git issues | fix-git.bat |
| Scan for secrets | secret-scan.bat |
| Manage tags | tag-manager.bat |
| Bump version | version-bump.bat |
| Create changelog | changelog-generate.bat |
| Work on multiple branches | worktree-manager.bat |
| Find bug introduction | bisect.bat |
| See who wrote code | blame.bat |
| Optimize repository | gc-optimize.bat |
| GitHub operations | github-integration.bat |

---

## Common Workflows

### Daily Development Workflow
```
1. pull-latest.bat          - Get team's changes
2. create-branch.bat        - Start feature branch
3. [do your work]
4. quick-save.bat           - Save progress frequently
5. save-with-message.bat    - Final commit
6. switch-branch.bat        - Back to main
7. merge-branch.bat         - Merge feature
8. deploy-dev.bat           - Deploy for testing
```

### Release Workflow
```
1. version-bump.bat         - Update version
2. changelog-generate.bat   - Create changelog
3. deploy-prod.bat          - Deploy to production
4. tag-manager.bat          - Create release tag
5. github-integration.bat   - Create GitHub release
```

### Bug Fix Workflow
```
1. create-branch.bat        - Create bugfix branch
2. [fix the bug]
3. save-with-message.bat    - Commit fix
4. merge-branch.bat         - Merge to main
5. deploy-prod.bat          - Deploy fix
6. delete-branch.bat        - Clean up branch
```

### Recovery Workflow
```
1. status.bat               - Assess situation
2. reflog-explorer.bat      - Find lost commits
3. revert-to-commit.bat     - Restore if needed
4. deploy-rollback.bat      - Rollback deployment
```

---

*Document Version: 2.0*
*Last Updated: January 2026*
*Total Scripts Documented: 48+*
