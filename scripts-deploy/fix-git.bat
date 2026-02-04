@echo off
setlocal enabledelayedexpansion

echo ========================================
echo    Fix Git Connectivity Issues
echo ========================================
echo.

REM Navigate to project root
cd /d "%~dp0.."

echo Running diagnostics...
echo.

REM Check if git is installed
echo [1/5] Checking Git installation...
git --version >nul 2>&1
if errorlevel 1 (
    echo FAILED: Git is not installed or not in PATH
    echo Please install Git from: https://git-scm.com/downloads
    pause
    exit /b 1
)
echo      Git version:
git --version
echo.

REM Check network connectivity
echo [2/5] Checking network connectivity...
ping -n 1 github.com >nul 2>&1
if errorlevel 1 (
    echo WARNING: Cannot reach github.com
    echo Network might be unavailable
) else (
    echo      GitHub: Reachable
)
echo.

REM Check Git configuration
echo [3/5] Checking Git configuration...
for /f "delims=" %%n in ('git config --global user.name 2^>nul') do set "GIT_NAME=%%n"
for /f "delims=" %%e in ('git config --global user.email 2^>nul') do set "GIT_EMAIL=%%e"
if "%GIT_NAME%"=="" (
    echo WARNING: Git user.name not configured
) else (
    echo      Name: %GIT_NAME%
)
if "%GIT_EMAIL%"=="" (
    echo WARNING: Git user.email not configured
) else (
    echo      Email: %GIT_EMAIL%
)
echo.

REM Check if in a repository
echo [4/5] Checking repository...
if exist ".git" (
    echo      Repository: Found
    for /f "delims=" %%b in ('git branch --show-current 2^>nul') do echo      Branch: %%b
    for /f "delims=" %%r in ('git remote get-url origin 2^>nul') do echo      Remote: %%r
) else (
    echo      Repository: Not found (not in a Git repository)
)
echo.

REM Check GitHub CLI
echo [5/5] Checking GitHub CLI...
gh --version >nul 2>&1
if errorlevel 1 (
    echo      GitHub CLI: Not installed (optional)
) else (
    echo      GitHub CLI: Installed
    gh auth status 2>&1 | findstr "Logged in" >nul
    if errorlevel 1 (
        echo      Auth status: Not logged in
    ) else (
        echo      Auth status: Logged in
    )
)

echo.
echo ========================================
echo Diagnostics complete.
echo ========================================
echo.

echo Select an issue to fix:
echo ========================================
echo.
echo [1] Fix remote connection issues
echo [2] Reset Git credentials
echo [3] Fix SSH key issues
echo [4] Clear Git cache
echo [5] Fix line ending issues
echo [6] Recover from detached HEAD
echo [7] Fix merge conflicts
echo [8] Clean untracked files
echo [9] Repair corrupted repository
echo [10] Test GitHub connectivity
echo [11] Configure Git user details
echo [12] Fix all common issues (recommended)
echo [13] Cancel
echo.
set /p "CHOICE=Enter choice (1-13): "

if "%CHOICE%"=="1" (
    echo.
    echo Fixing remote connection issues...
    echo.
    
    REM Check current remote
    echo Current remotes:
    git remote -v
    echo.
    
    set /p "FIX_REMOTE=Do you want to update the remote URL? (Y/N): "
    if /i "!FIX_REMOTE!"=="Y" (
        set /p "NEW_URL=Enter new remote URL: "
        if not "!NEW_URL!"=="" (
            git remote set-url origin !NEW_URL!
            echo Remote URL updated.
        )
    )
    
    echo.
    echo Testing connection...
    git ls-remote origin >nul 2>&1
    if errorlevel 1 (
        echo FAILED: Cannot connect to remote
        echo Please check your internet connection and remote URL
    ) else (
        echo SUCCESS: Connection to remote works!
    )
    
) else if "%CHOICE%"=="2" (
    echo.
    echo Resetting Git credentials...
    echo.
    
    REM Clear credential cache
    git config --global --unset credential.helper 2>nul
    
    REM Set credential helper based on OS
    echo Setting up credential helper...
    git config --global credential.helper manager
    
    echo Credentials reset. You will be prompted for credentials on next push/pull.
    echo.
    
) else if "%CHOICE%"=="3" (
    echo.
    echo Checking SSH configuration...
    echo.
    
    set "SSH_DIR=%USERPROFILE%\.ssh"
    
    if exist "%SSH_DIR%\id_rsa.pub" (
        echo SSH key found at: %SSH_DIR%\id_rsa.pub
        echo.
        echo Your public SSH key:
        echo ========================================
        type "%SSH_DIR%\id_rsa.pub"
        echo.
        echo ========================================
        echo.
        set /p "OPEN_GITHUB=Open GitHub SSH settings in browser? (Y/N): "
        if /i "!OPEN_GITHUB!"=="Y" (
            start https://github.com/settings/keys
        )
    ) else if exist "%SSH_DIR%\id_ed25519.pub" (
        echo SSH key found at: %SSH_DIR%\id_ed25519.pub
        echo.
        echo Your public SSH key:
        echo ========================================
        type "%SSH_DIR%\id_ed25519.pub"
        echo.
        echo ========================================
    ) else (
        echo No SSH key found.
        set /p "CREATE_SSH=Create new SSH key? (Y/N): "
        if /i "!CREATE_SSH!"=="Y" (
            set /p "SSH_EMAIL=Enter your email: "
            if not "!SSH_EMAIL!"=="" (
                echo Creating SSH key...
                ssh-keygen -t ed25519 -C "!SSH_EMAIL!"
                echo.
                echo SSH key created successfully!
                echo.
                echo Your public SSH key:
                type "%SSH_DIR%\id_ed25519.pub"
                echo.
                echo Please add this key to your GitHub account:
                start https://github.com/settings/keys
            )
        )
    )
    
) else if "%CHOICE%"=="4" (
    echo.
    echo Clearing Git cache...
    echo.
    
    if exist ".git" (
        git rm -r --cached . >nul 2>&1
        git add .
        echo Git cache cleared and files re-staged.
        echo.
        echo Note: You may want to commit this change if .gitignore was updated.
    ) else (
        echo Not in a Git repository.
    )
    
) else if "%CHOICE%"=="5" (
    echo.
    echo Fixing line ending issues...
    echo.
    
    git config --global core.autocrlf true
    echo Configured to automatically handle line endings (Windows style).
    echo.
    
    if exist ".git" (
        set /p "NORMALIZE=Normalize all files now? (Y/N): "
        if /i "!NORMALIZE!"=="Y" (
            git add --renormalize .
            echo Files normalized.
        )
    )
    
) else if "%CHOICE%"=="6" (
    echo.
    echo Recovering from detached HEAD state...
    echo.
    
    for /f "delims=" %%i in ('git branch --show-current 2^>nul') do set "CURRENT_BRANCH=%%i"
    
    if "!CURRENT_BRANCH!"=="" (
        echo You are in detached HEAD state.
        echo.
        echo Available branches:
        git branch
        echo.
        set /p "BRANCH_NAME=Enter branch name to switch to (or 'new' to create): "
        if /i "!BRANCH_NAME!"=="new" (
            set /p "NEW_BRANCH=Enter new branch name: "
            git checkout -b !NEW_BRANCH!
            echo Created and switched to: !NEW_BRANCH!
        ) else if not "!BRANCH_NAME!"=="" (
            git checkout !BRANCH_NAME!
            if errorlevel 1 (
                echo Branch not found. Creating it...
                git checkout -b !BRANCH_NAME!
            )
            echo Recovered to branch: !BRANCH_NAME!
        )
    ) else (
        echo Not in detached HEAD state. Current branch: !CURRENT_BRANCH!
    )
    
) else if "%CHOICE%"=="7" (
    echo.
    echo Checking for merge conflicts...
    echo.
    
    git status | findstr "both modified" >nul
    if not errorlevel 1 (
        echo Merge conflicts detected:
        echo.
        git status --short | findstr "UU"
        echo.
        echo Options:
        echo [1] Abort merge and return to previous state
        echo [2] Accept all current changes (ours)
        echo [3] Accept all incoming changes (theirs)
        echo [4] Show conflict instructions
        echo.
        set /p "CONFLICT_ACTION=Select option (1-4): "
        
        if "!CONFLICT_ACTION!"=="1" (
            git merge --abort 2>nul
            git rebase --abort 2>nul
            echo Merge/rebase aborted.
        ) else if "!CONFLICT_ACTION!"=="2" (
            git checkout --ours .
            git add .
            echo Kept all current (ours) changes.
        ) else if "!CONFLICT_ACTION!"=="3" (
            git checkout --theirs .
            git add .
            echo Accepted all incoming (theirs) changes.
        ) else (
            echo.
            echo To resolve conflicts manually:
            echo 1. Open conflicted files
            echo 2. Look for markers: ^<^<^<^<^<^<^< ======= ^>^>^>^>^>^>^>
            echo 3. Edit to keep desired changes
            echo 4. Remove conflict markers
            echo 5. Run: git add ^<filename^>
            echo 6. Run: git commit
        )
    ) else (
        echo No merge conflicts detected.
    )
    
) else if "%CHOICE%"=="8" (
    echo.
    echo Untracked files that will be removed:
    git clean -n -d
    echo.
    set /p "CLEAN_CONFIRM=Delete these files? (Y/N): "
    if /i "!CLEAN_CONFIRM!"=="Y" (
        git clean -fd
        echo Untracked files removed.
    )
    
) else if "%CHOICE%"=="9" (
    echo.
    echo WARNING: This will attempt to repair repository corruption.
    set /p "REPAIR_CONFIRM=Continue? (Y/N): "
    if /i "!REPAIR_CONFIRM!"=="Y" (
        echo.
        echo Verifying repository...
        git fsck --full
        echo.
        echo Running garbage collection...
        git gc --prune=now
        echo.
        echo Repacking objects...
        git repack -a -d -f
        echo.
        echo Repository repair completed.
    )
    
) else if "%CHOICE%"=="10" (
    echo.
    echo Testing GitHub connectivity...
    echo.
    
    echo Testing HTTPS connection...
    git ls-remote https://github.com/github/gitignore.git HEAD >nul 2>&1
    if errorlevel 1 (
        echo HTTPS connection: FAILED
    ) else (
        echo HTTPS connection: SUCCESS
    )
    echo.
    
    echo Testing SSH connection...
    ssh -T git@github.com 2>&1 | findstr "successfully authenticated" >nul
    if errorlevel 1 (
        ssh -T git@github.com 2>&1 | findstr "You've successfully" >nul
        if errorlevel 1 (
            echo SSH connection: FAILED or not configured
        ) else (
            echo SSH connection: SUCCESS
        )
    ) else (
        echo SSH connection: SUCCESS
    )
    echo.
    
) else if "%CHOICE%"=="11" (
    echo.
    echo Configure Git user details:
    echo.
    
    echo Current configuration:
    git config --global user.name
    git config --global user.email
    echo.
    
    set /p "GIT_NAME=Enter your name: "
    set /p "GIT_EMAIL=Enter your email: "
    
    if not "!GIT_NAME!"=="" (
        git config --global user.name "!GIT_NAME!"
        echo Git username set to: !GIT_NAME!
    )
    if not "!GIT_EMAIL!"=="" (
        git config --global user.email "!GIT_EMAIL!"
        echo Git email set to: !GIT_EMAIL!
    )
    echo.
    echo Configuration updated successfully!
    
) else if "%CHOICE%"=="12" (
    echo.
    echo Running comprehensive fix...
    echo.
    
    echo [1/7] Configuring line endings...
    git config --global core.autocrlf true
    echo      Done.
    
    echo [2/7] Setting credential helper...
    git config --global credential.helper manager
    echo      Done.
    
    echo [3/7] Setting default branch name...
    git config --global init.defaultBranch main
    echo      Done.
    
    if exist ".git" (
        echo [4/7] Clearing cache...
        git rm -r --cached . >nul 2>&1
        git add . >nul 2>&1
        echo      Done.
        
        echo [5/7] Running garbage collection...
        git gc --prune=now >nul 2>&1
        echo      Done.
        
        echo [6/7] Verifying repository...
        git fsck >nul 2>&1
        echo      Done.
        
        echo [7/7] Testing connection...
        git ls-remote origin >nul 2>&1
        if errorlevel 1 (
            echo      WARNING: Cannot connect to remote
        ) else (
            echo      Remote connection: OK
        )
    ) else (
        echo [4/7] Skipping cache clear (not in repo)
        echo [5/7] Skipping garbage collection (not in repo)
        echo [6/7] Skipping verification (not in repo)
        echo [7/7] Skipping connection test (not in repo)
    )
    
    echo.
    echo All fixes applied!
    
) else if "%CHOICE%"=="13" (
    echo Operation cancelled.
    pause
    exit /b 0
    
) else (
    echo Invalid choice.
    pause
    exit /b 1
)

echo.
echo ========================================
echo.
pause
