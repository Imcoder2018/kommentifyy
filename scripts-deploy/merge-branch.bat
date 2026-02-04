@echo off
setlocal enabledelayedexpansion

echo ========================================
echo    Merge Branch
echo ========================================
echo.

REM Navigate to project root
cd /d "%~dp0.."

REM Check if git is initialized
if not exist ".git" (
    echo ERROR: Git repository not initialized
    echo Please run init-repo.bat first
    pause
    exit /b 1
)

REM Get current branch
for /f "delims=" %%i in ('git branch --show-current 2^>nul') do set "CURRENT_BRANCH=%%i"

echo Current branch: %CURRENT_BRANCH%
echo This branch will receive the merge.
echo.

REM Check for uncommitted changes
git diff --quiet 2>nul
set "HAS_UNSTAGED=%errorlevel%"
git diff --cached --quiet 2>nul
set "HAS_STAGED=%errorlevel%"

if "%HAS_UNSTAGED%"=="1" (
    echo WARNING: You have uncommitted changes!
    echo Please commit or stash your changes before merging.
    echo.
    git status --short
    echo.
    set /p "STASH_NOW=Stash changes and continue? (Y/N): "
    if /i "!STASH_NOW!"=="Y" (
        git stash push -m "Auto-stash before merge"
        set "STASHED=1"
        echo Changes stashed.
        echo.
    ) else (
        pause
        exit /b 1
    )
)

if "%HAS_STAGED%"=="1" if not "%HAS_UNSTAGED%"=="1" (
    echo WARNING: You have staged but uncommitted changes!
    echo Please commit or stash your changes before merging.
    echo.
    git status --short
    echo.
    pause
    exit /b 1
)

REM Show available branches
echo Available branches to merge from:
echo.
git branch
echo.

REM Get source branch
set /p "SOURCE_BRANCH=Enter branch name to merge FROM: "

if "%SOURCE_BRANCH%"=="" (
    echo ERROR: Branch name cannot be empty
    if "%STASHED%"=="1" git stash pop
    pause
    exit /b 1
)

REM Check if source branch exists
git show-ref --verify --quiet refs/heads/%SOURCE_BRANCH%
if errorlevel 1 (
    REM Try as remote branch
    git show-ref --verify --quiet refs/remotes/origin/%SOURCE_BRANCH%
    if errorlevel 1 (
        echo ERROR: Branch '%SOURCE_BRANCH%' does not exist
        if "%STASHED%"=="1" git stash pop
        pause
        exit /b 1
    ) else (
        set "SOURCE_BRANCH=origin/%SOURCE_BRANCH%"
        echo Using remote branch: !SOURCE_BRANCH!
    )
)

REM Check if trying to merge same branch
if "%SOURCE_BRANCH%"=="%CURRENT_BRANCH%" (
    echo ERROR: Cannot merge a branch into itself
    if "%STASHED%"=="1" git stash pop
    pause
    exit /b 1
)

REM Preview merge
echo.
echo Merge Preview:
echo ========================================
echo Commits to be merged:
git log %CURRENT_BRANCH%..%SOURCE_BRANCH% --oneline 2>nul
echo.
echo Files that will change:
git diff --stat %CURRENT_BRANCH%..%SOURCE_BRANCH% 2>nul
echo ========================================
echo.

echo Merge Strategy:
echo [1] Regular merge (creates merge commit)
echo [2] Squash merge (combines all commits into one)
echo [3] Fast-forward only (fails if not possible)
echo [4] Merge with specific strategy (ours/theirs)
echo [5] Cancel
echo.
set /p "MERGE_STRATEGY=Enter choice (1-5): "

if "%MERGE_STRATEGY%"=="5" (
    echo Merge cancelled.
    if "%STASHED%"=="1" git stash pop
    pause
    exit /b 0
)

echo.
echo You are about to merge:
echo   FROM: %SOURCE_BRANCH%
echo   INTO: %CURRENT_BRANCH%
echo.
set /p "CONFIRM=Continue with merge? (Y/N): "

if /i not "%CONFIRM%"=="Y" (
    echo Merge cancelled.
    if "%STASHED%"=="1" git stash pop
    pause
    exit /b 0
)

REM Create backup branch before merge
echo.
echo Creating backup branch...
for /f "delims=" %%a in ('powershell -Command "Get-Date -Format \"yyyyMMdd-HHmmss\""') do set "BACKUP_TIME=%%a"
set "BACKUP_BRANCH=backup/%CURRENT_BRANCH%_pre-merge_%BACKUP_TIME%"
git branch "%BACKUP_BRANCH%" 2>nul
if not errorlevel 1 (
    echo Backup created: %BACKUP_BRANCH%
)

echo.
echo Merging %SOURCE_BRANCH% into %CURRENT_BRANCH%...

if "%MERGE_STRATEGY%"=="1" (
    git merge %SOURCE_BRANCH% --no-ff
) else if "%MERGE_STRATEGY%"=="2" (
    git merge %SOURCE_BRANCH% --squash
    if not errorlevel 1 (
        echo.
        set /p "SQUASH_MSG=Enter commit message for squashed merge: "
        if "!SQUASH_MSG!"=="" set "SQUASH_MSG=Merge %SOURCE_BRANCH% into %CURRENT_BRANCH% (squashed)"
        git commit -m "!SQUASH_MSG!"
    )
) else if "%MERGE_STRATEGY%"=="3" (
    git merge %SOURCE_BRANCH% --ff-only
) else if "%MERGE_STRATEGY%"=="4" (
    echo.
    echo Conflict resolution strategy:
    echo [a] ours   - Keep our changes on conflict
    echo [b] theirs - Keep their changes on conflict
    set /p "STRATEGY=Select (a/b): "
    
    if /i "!STRATEGY!"=="a" (
        git merge %SOURCE_BRANCH% -X ours
    ) else if /i "!STRATEGY!"=="b" (
        git merge %SOURCE_BRANCH% -X theirs
    ) else (
        git merge %SOURCE_BRANCH% --no-ff
    )
) else (
    echo Invalid merge strategy, using default...
    git merge %SOURCE_BRANCH% --no-ff
)

if errorlevel 1 (
    echo.
    echo ========================================
    echo MERGE CONFLICT DETECTED!
    echo ========================================
    echo.
    echo Conflicted files:
    git diff --name-only --diff-filter=U
    echo.
    echo To resolve:
    echo 1. Open each conflicted file
    echo 2. Resolve the conflicts (look for ^<^<^<^<^<^<^< markers)
    echo 3. Run: git add ^<filename^>
    echo 4. Run: git commit
    echo.
    echo Or to abort the merge:
    echo   git merge --abort
    echo.
    echo To rollback to backup:
    echo   git reset --hard %BACKUP_BRANCH%
    echo.
    if "%STASHED%"=="1" (
        echo Note: You have stashed changes. Run 'git stash pop' after resolving.
    )
    pause
    exit /b 1
)

REM Log the operation
for /f "delims=" %%a in ('powershell -Command "Get-Date -Format \"yyyy-MM-dd HH:mm:ss\""') do set "DATETIME=%%a"
set "LOG_DIR=%~dp0logs"
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"
echo [%DATETIME%] Merge: %SOURCE_BRANCH% into %CURRENT_BRANCH% (Backup: %BACKUP_BRANCH%) >> "%LOG_DIR%\operations.log"

echo.
echo ========================================
echo Merge completed successfully!
echo ========================================
echo.

REM Restore stashed changes if any
if "%STASHED%"=="1" (
    echo.
    set /p "RESTORE_STASH=Restore stashed changes? (Y/N): "
    if /i "!RESTORE_STASH!"=="Y" (
        git stash pop
        if errorlevel 1 (
            echo WARNING: Conflicts while restoring stash
        ) else (
            echo Stashed changes restored.
        )
    )
)

REM Ask if user wants to push
set /p "PUSH_NOW=Push changes to remote? (Y/N): "
if /i "%PUSH_NOW%"=="Y" (
    echo Pushing to remote...
    git push
    if errorlevel 1 (
        echo WARNING: Failed to push to remote
        echo You can push later using: git push
    ) else (
        echo Changes pushed successfully!
    )
)

echo.
pause
