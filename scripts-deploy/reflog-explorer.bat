@echo off
setlocal enabledelayedexpansion

echo ========================================
echo    Git Reflog Explorer & Recovery
echo ========================================
echo.

cd /d "%~dp0.."

if not exist ".git" (
    echo ERROR: Git repository not initialized
    pause
    exit /b 1
)

echo The reflog records every change to HEAD.
echo Use it to recover lost commits, branches, or undo mistakes.
echo.

echo Select action:
echo.
echo [1] View recent reflog (last 20 entries)
echo [2] View full reflog
echo [3] View reflog for specific branch
echo [4] Search reflog by message
echo [5] Recover lost commit
echo [6] Recover deleted branch
echo [7] Undo last operation
echo [8] View commit at reflog entry
echo [9] Create branch from reflog entry
echo [10] Clear reflog (dangerous!)
echo [11] Cancel
echo.
set /p "CHOICE=Enter choice (1-11): "

if "%CHOICE%"=="1" (
    echo.
    echo Recent Reflog (last 20 entries):
    echo ========================================
    echo.
    echo Format: HEAD@{n} - operation - message
    echo.
    git reflog -20
    echo.
    echo ========================================

) else if "%CHOICE%"=="2" (
    echo.
    echo Full Reflog:
    echo ========================================
    git reflog
    echo ========================================

) else if "%CHOICE%"=="3" (
    echo.
    echo Available branches:
    git branch
    echo.
    
    set /p "BRANCH=Enter branch name: "
    if "!BRANCH!"=="" (
        echo ERROR: Branch name required
        pause
        exit /b 1
    )
    
    echo.
    echo Reflog for !BRANCH!:
    echo ========================================
    git reflog show !BRANCH!
    echo ========================================

) else if "%CHOICE%"=="4" (
    echo.
    set /p "SEARCH=Enter search term: "
    if "!SEARCH!"=="" (
        echo ERROR: Search term required
        pause
        exit /b 1
    )
    
    echo.
    echo Reflog entries matching "!SEARCH!":
    echo ========================================
    git reflog --grep-reflog="!SEARCH!"
    echo ========================================

) else if "%CHOICE%"=="5" (
    echo.
    echo To recover a lost commit, find it in the reflog.
    echo.
    echo Recent reflog:
    git reflog -20
    echo.
    
    set /p "REFLOG_REF=Enter reflog reference (e.g., HEAD@{5} or commit hash): "
    if "!REFLOG_REF!"=="" (
        echo ERROR: Reference required
        pause
        exit /b 1
    )
    
    echo.
    echo Commit details:
    git show !REFLOG_REF! --oneline --stat
    echo.
    
    echo Recovery options:
    echo [1] Cherry-pick commit to current branch
    echo [2] Create new branch at this commit
    echo [3] Reset current branch to this commit (CAREFUL!)
    echo [4] Cancel
    echo.
    set /p "RECOVER_ACTION=Select (1-4): "
    
    if "!RECOVER_ACTION!"=="1" (
        git cherry-pick !REFLOG_REF!
        echo Commit cherry-picked!
    ) else if "!RECOVER_ACTION!"=="2" (
        set /p "NEW_BRANCH=Enter new branch name: "
        git branch !NEW_BRANCH! !REFLOG_REF!
        echo Branch !NEW_BRANCH! created at !REFLOG_REF!
    ) else if "!RECOVER_ACTION!"=="3" (
        set /p "CONFIRM=Reset to !REFLOG_REF!? (YES to confirm): "
        if /i "!CONFIRM!"=="YES" (
            git reset --hard !REFLOG_REF!
            echo Reset complete!
        )
    ) else (
        echo Cancelled.
    )

) else if "%CHOICE%"=="6" (
    echo.
    echo To recover a deleted branch:
    echo 1. Find the last commit on that branch in reflog
    echo 2. Create a new branch at that commit
    echo.
    
    echo Enter the deleted branch name to search:
    set /p "BRANCH_NAME=Branch name: "
    
    echo.
    echo Searching reflog for !BRANCH_NAME!...
    echo.
    git reflog | findstr /i "!BRANCH_NAME!"
    echo.
    
    set /p "COMMIT_REF=Enter commit reference to recover: "
    if "!COMMIT_REF!"=="" (
        echo ERROR: Reference required
        pause
        exit /b 1
    )
    
    set /p "NEW_BRANCH=Enter branch name (default: !BRANCH_NAME!): "
    if "!NEW_BRANCH!"=="" set "NEW_BRANCH=!BRANCH_NAME!"
    
    git branch !NEW_BRANCH! !COMMIT_REF!
    
    if errorlevel 1 (
        echo ERROR: Failed to create branch
    ) else (
        echo Branch !NEW_BRANCH! recovered!
        git branch | findstr !NEW_BRANCH!
    )

) else if "%CHOICE%"=="7" (
    echo.
    echo This will undo the last operation using reflog.
    echo.
    
    echo Current state:
    git log -1 --oneline
    echo.
    
    echo Previous state (HEAD@{1}):
    git log -1 --oneline HEAD@{1}
    echo.
    
    set /p "CONFIRM=Undo last operation and return to HEAD@{1}? (Y/N): "
    if /i "!CONFIRM!"=="Y" (
        git reset --hard HEAD@{1}
        echo.
        echo Undone! Current state:
        git log -1 --oneline
    )

) else if "%CHOICE%"=="8" (
    echo.
    git reflog -15
    echo.
    
    set /p "REFLOG_REF=Enter reflog reference (e.g., HEAD@{3}): "
    if "!REFLOG_REF!"=="" (
        echo ERROR: Reference required
        pause
        exit /b 1
    )
    
    echo.
    echo Commit at !REFLOG_REF!:
    echo ========================================
    git show !REFLOG_REF!
    echo ========================================

) else if "%CHOICE%"=="9" (
    echo.
    git reflog -15
    echo.
    
    set /p "REFLOG_REF=Enter reflog reference: "
    if "!REFLOG_REF!"=="" (
        echo ERROR: Reference required
        pause
        exit /b 1
    )
    
    set /p "BRANCH_NAME=Enter new branch name: "
    if "!BRANCH_NAME!"=="" (
        echo ERROR: Branch name required
        pause
        exit /b 1
    )
    
    git branch !BRANCH_NAME! !REFLOG_REF!
    
    if errorlevel 1 (
        echo ERROR: Failed to create branch
    ) else (
        echo Branch !BRANCH_NAME! created!
        
        set /p "SWITCH=Switch to !BRANCH_NAME!? (Y/N): "
        if /i "!SWITCH!"=="Y" (
            git checkout !BRANCH_NAME!
        )
    )

) else if "%CHOICE%"=="10" (
    echo.
    echo WARNING: This will permanently delete reflog entries!
    echo You will lose the ability to recover using these entries.
    echo.
    
    set /p "CONFIRM=Type 'DELETE REFLOG' to confirm: "
    if "!CONFIRM!"=="DELETE REFLOG" (
        git reflog expire --expire=now --all
        git gc --prune=now
        echo Reflog cleared!
    ) else (
        echo Operation cancelled.
    )

) else if "%CHOICE%"=="11" (
    echo Operation cancelled.
    pause
    exit /b 0
) else (
    echo Invalid choice.
)

echo.
pause
