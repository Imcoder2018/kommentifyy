@echo off
setlocal enabledelayedexpansion

echo ========================================
echo    Git Worktree Manager
echo ========================================
echo.

cd /d "%~dp0.."

if not exist ".git" (
    echo ERROR: Git repository not initialized
    pause
    exit /b 1
)

echo Current worktrees:
echo ========================================
git worktree list
echo.

echo Select action:
echo.
echo [1] Add new worktree
echo [2] Add worktree for existing branch
echo [3] Add worktree for new branch
echo [4] Remove worktree
echo [5] Prune stale worktrees
echo [6] Move worktree
echo [7] Lock worktree
echo [8] Unlock worktree
echo [9] Show worktree details
echo [10] Cancel
echo.
set /p "CHOICE=Enter choice (1-10): "

if "%CHOICE%"=="1" (
    echo.
    echo Available branches:
    git branch -a
    echo.
    
    set /p "WORKTREE_PATH=Enter path for new worktree: "
    if "!WORKTREE_PATH!"=="" (
        echo ERROR: Path required
        pause
        exit /b 1
    )
    
    set /p "BRANCH=Enter branch name (or commit/tag): "
    if "!BRANCH!"=="" (
        echo ERROR: Branch required
        pause
        exit /b 1
    )
    
    git worktree add "!WORKTREE_PATH!" !BRANCH!
    
    if errorlevel 1 (
        echo ERROR: Failed to add worktree
    ) else (
        echo.
        echo Worktree created at: !WORKTREE_PATH!
        echo Branch: !BRANCH!
    )

) else if "%CHOICE%"=="2" (
    echo.
    echo Available branches:
    git branch
    echo.
    
    set /p "BRANCH=Enter existing branch name: "
    if "!BRANCH!"=="" (
        echo ERROR: Branch required
        pause
        exit /b 1
    )
    
    set "WORKTREE_PATH=..\worktrees\!BRANCH!"
    set /p "CUSTOM_PATH=Enter custom path (or Enter for !WORKTREE_PATH!): "
    if not "!CUSTOM_PATH!"=="" set "WORKTREE_PATH=!CUSTOM_PATH!"
    
    git worktree add "!WORKTREE_PATH!" !BRANCH!
    
    if errorlevel 1 (
        echo ERROR: Failed to add worktree
    ) else (
        echo.
        echo Worktree created at: !WORKTREE_PATH!
    )

) else if "%CHOICE%"=="3" (
    echo.
    set /p "NEW_BRANCH=Enter new branch name: "
    if "!NEW_BRANCH!"=="" (
        echo ERROR: Branch name required
        pause
        exit /b 1
    )
    
    set "WORKTREE_PATH=..\worktrees\!NEW_BRANCH!"
    set /p "CUSTOM_PATH=Enter custom path (or Enter for !WORKTREE_PATH!): "
    if not "!CUSTOM_PATH!"=="" set "WORKTREE_PATH=!CUSTOM_PATH!"
    
    set /p "BASE_BRANCH=Base branch (Enter for current): "
    
    if "!BASE_BRANCH!"=="" (
        git worktree add -b !NEW_BRANCH! "!WORKTREE_PATH!"
    ) else (
        git worktree add -b !NEW_BRANCH! "!WORKTREE_PATH!" !BASE_BRANCH!
    )
    
    if errorlevel 1 (
        echo ERROR: Failed to create worktree
    ) else (
        echo.
        echo Worktree created at: !WORKTREE_PATH!
        echo New branch: !NEW_BRANCH!
    )

) else if "%CHOICE%"=="4" (
    echo.
    echo Current worktrees:
    git worktree list
    echo.
    
    set /p "WORKTREE_PATH=Enter worktree path to remove: "
    if "!WORKTREE_PATH!"=="" (
        echo ERROR: Path required
        pause
        exit /b 1
    )
    
    set /p "FORCE=Force remove? (Y/N): "
    if /i "!FORCE!"=="Y" (
        git worktree remove "!WORKTREE_PATH!" --force
    ) else (
        git worktree remove "!WORKTREE_PATH!"
    )
    
    if errorlevel 1 (
        echo ERROR: Failed to remove worktree
        echo If worktree has changes, use force option
    ) else (
        echo Worktree removed!
    )

) else if "%CHOICE%"=="5" (
    echo.
    echo Pruning stale worktree references...
    git worktree prune -v
    echo.
    echo Prune complete!

) else if "%CHOICE%"=="6" (
    echo.
    git worktree list
    echo.
    
    set /p "OLD_PATH=Enter current worktree path: "
    set /p "NEW_PATH=Enter new location: "
    
    if "!OLD_PATH!"=="" (
        echo ERROR: Old path required
        pause
        exit /b 1
    )
    if "!NEW_PATH!"=="" (
        echo ERROR: New path required
        pause
        exit /b 1
    )
    
    git worktree move "!OLD_PATH!" "!NEW_PATH!"
    
    if errorlevel 1 (
        echo ERROR: Failed to move worktree
    ) else (
        echo Worktree moved to: !NEW_PATH!
    )

) else if "%CHOICE%"=="7" (
    echo.
    git worktree list
    echo.
    
    set /p "WORKTREE_PATH=Enter worktree path to lock: "
    set /p "REASON=Enter lock reason (optional): "
    
    if "!REASON!"=="" (
        git worktree lock "!WORKTREE_PATH!"
    ) else (
        git worktree lock "!WORKTREE_PATH!" --reason "!REASON!"
    )
    
    if errorlevel 1 (
        echo ERROR: Failed to lock worktree
    ) else (
        echo Worktree locked!
    )

) else if "%CHOICE%"=="8" (
    echo.
    git worktree list
    echo.
    
    set /p "WORKTREE_PATH=Enter worktree path to unlock: "
    
    git worktree unlock "!WORKTREE_PATH!"
    
    if errorlevel 1 (
        echo ERROR: Failed to unlock worktree
    ) else (
        echo Worktree unlocked!
    )

) else if "%CHOICE%"=="9" (
    echo.
    echo Worktree Details:
    echo ========================================
    for /f "tokens=1,2,3" %%a in ('git worktree list --porcelain') do (
        if "%%a"=="worktree" (
            echo.
            echo Path: %%b
        )
        if "%%a"=="HEAD" echo HEAD: %%b
        if "%%a"=="branch" echo Branch: %%b
        if "%%a"=="locked" echo Status: LOCKED
    )
    echo ========================================

) else if "%CHOICE%"=="10" (
    echo Operation cancelled.
    pause
    exit /b 0
) else (
    echo Invalid choice.
)

echo.
echo Current worktrees:
git worktree list
echo.
pause
