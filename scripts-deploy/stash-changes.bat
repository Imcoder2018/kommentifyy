@echo off
setlocal enabledelayedexpansion

echo ========================================
echo    Stash Changes Manager
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

echo Current stashes:
echo ========================================
git stash list
if errorlevel 1 (
    echo No stashes found.
)
echo ========================================
echo.

echo Select action:
echo.
echo [1] Stash current changes
echo [2] Stash with message
echo [3] Stash including untracked files
echo [4] Apply latest stash (keep in list)
echo [5] Pop latest stash (remove from list)
echo [6] Apply specific stash
echo [7] Drop specific stash
echo [8] Clear all stashes
echo [9] Show stash contents (diff)
echo [10] Create branch from stash
echo [11] Partial stash (interactive)
echo [12] Cancel
echo.
set /p "STASH_ACTION=Enter choice (1-12): "

if "%STASH_ACTION%"=="1" (
    echo.
    echo Current changes:
    git status --short
    echo.
    
    echo Stashing changes...
    git stash push
    if errorlevel 1 (
        echo ERROR: Failed to stash changes
        echo Make sure you have changes to stash
    ) else (
        echo Changes stashed successfully!
        echo.
        echo Current stashes:
        git stash list
    )
    
) else if "%STASH_ACTION%"=="2" (
    echo.
    echo Current changes:
    git status --short
    echo.
    
    set /p "STASH_MSG=Enter stash message: "
    if "!STASH_MSG!"=="" (
        echo ERROR: Message cannot be empty
    ) else (
        echo Stashing changes with message...
        git stash push -m "!STASH_MSG!"
        if errorlevel 1 (
            echo ERROR: Failed to stash changes
        ) else (
            echo Changes stashed successfully!
            echo.
            git stash list | head -3
        )
    )
    
) else if "%STASH_ACTION%"=="3" (
    echo.
    echo Current changes (including untracked):
    git status --short
    echo.
    
    set /p "STASH_MSG=Enter stash message (optional): "
    if "!STASH_MSG!"=="" (
        git stash push -u
    ) else (
        git stash push -u -m "!STASH_MSG!"
    )
    
    if errorlevel 1 (
        echo ERROR: Failed to stash changes
    ) else (
        echo Changes stashed (including untracked files)!
    )
    
) else if "%STASH_ACTION%"=="4" (
    echo.
    echo Applying latest stash (keeping it in list)...
    git stash apply
    if errorlevel 1 (
        echo ERROR: Failed to apply stash
        echo There might be conflicts or no stashes available
    ) else (
        echo Stash applied successfully!
        echo Note: Stash is still in the list
        echo.
        git status --short
    )
    
) else if "%STASH_ACTION%"=="5" (
    echo.
    echo Popping latest stash (will be removed from list)...
    git stash pop
    if errorlevel 1 (
        echo ERROR: Failed to pop stash
        echo There might be conflicts or no stashes available
        echo.
        echo If conflicts occurred, resolve them and run:
        echo   git stash drop
    ) else (
        echo Stash popped successfully!
        echo.
        git status --short
    )
    
) else if "%STASH_ACTION%"=="6" (
    echo.
    echo Available stashes:
    git stash list
    echo.
    set /p "STASH_INDEX=Enter stash index (e.g., 0 for stash@{0}): "
    if "!STASH_INDEX!"=="" (
        echo ERROR: Index cannot be empty
    ) else (
        echo.
        echo Preview of stash@{!STASH_INDEX!}:
        git stash show stash@{!STASH_INDEX!} --stat
        echo.
        
        set /p "CONFIRM=Apply this stash? (Y/N): "
        if /i "!CONFIRM!"=="Y" (
            git stash apply stash@{!STASH_INDEX|}
            if errorlevel 1 (
                echo ERROR: Failed to apply stash
            ) else (
                echo Stash applied successfully!
            )
        )
    )
    
) else if "%STASH_ACTION%"=="7" (
    echo.
    echo Available stashes:
    git stash list
    echo.
    set /p "STASH_INDEX=Enter stash index to drop (e.g., 0 for stash@{0}): "
    if "!STASH_INDEX!"=="" (
        echo ERROR: Index cannot be empty
    ) else (
        echo.
        echo Stash to drop:
        git stash show stash@{!STASH_INDEX!} --stat
        echo.
        
        set /p "CONFIRM=Are you sure you want to drop stash@{!STASH_INDEX!}? (Y/N): "
        if /i "!CONFIRM!"=="Y" (
            git stash drop stash@{!STASH_INDEX!}
            if errorlevel 1 (
                echo ERROR: Failed to drop stash
            ) else (
                echo Stash dropped successfully!
            )
        ) else (
            echo Operation cancelled.
        )
    )
    
) else if "%STASH_ACTION%"=="8" (
    echo.
    echo WARNING: This will delete ALL stashes!
    echo.
    echo Current stashes:
    git stash list
    echo.
    set /p "CONFIRM=Type 'DELETE ALL' to confirm: "
    if "!CONFIRM!"=="DELETE ALL" (
        git stash clear
        echo All stashes cleared.
    ) else (
        echo Operation cancelled.
    )
    
) else if "%STASH_ACTION%"=="9" (
    echo.
    git stash list
    echo.
    set /p "STASH_INDEX=Enter stash index to view (e.g., 0 for stash@{0}): "
    if "!STASH_INDEX!"=="" (
        set "STASH_INDEX=0"
    )
    echo.
    echo Contents of stash@{!STASH_INDEX!}:
    echo ========================================
    echo.
    echo Summary:
    git stash show stash@{!STASH_INDEX!} --stat
    echo.
    set /p "SHOW_DIFF=Show full diff? (Y/N): "
    if /i "!SHOW_DIFF!"=="Y" (
        echo.
        git stash show -p stash@{!STASH_INDEX!}
    )
    
) else if "%STASH_ACTION%"=="10" (
    echo.
    git stash list
    echo.
    set /p "STASH_INDEX=Enter stash index (e.g., 0): "
    if "!STASH_INDEX!"=="" set "STASH_INDEX=0"
    
    set /p "BRANCH_NAME=Enter new branch name: "
    if "!BRANCH_NAME!"=="" (
        echo ERROR: Branch name required
        pause
        exit /b 1
    )
    
    echo.
    echo Creating branch '!BRANCH_NAME!' from stash@{!STASH_INDEX!}...
    git stash branch !BRANCH_NAME! stash@{!STASH_INDEX!}
    
    if errorlevel 1 (
        echo ERROR: Failed to create branch from stash
    ) else (
        echo Branch created and stash applied!
        echo You are now on branch: !BRANCH_NAME!
    )
    
) else if "%STASH_ACTION%"=="11" (
    echo.
    echo Interactive stash - select which changes to stash
    echo (Press 'y' to stash a hunk, 'n' to skip, 'q' to quit)
    echo.
    git stash push -p
    
    if errorlevel 1 (
        echo Partial stash cancelled or failed.
    ) else (
        echo Partial stash complete!
    )
    
) else if "%STASH_ACTION%"=="12" (
    echo Operation cancelled.
    pause
    exit /b 0
    
) else (
    echo Invalid choice.
    pause
    exit /b 1
)

REM Log significant operations
if "%STASH_ACTION%"=="1" (
    for /f "delims=" %%a in ('powershell -Command "Get-Date -Format \"yyyy-MM-dd HH:mm:ss\""') do set "DATETIME=%%a"
    set "LOG_DIR=%~dp0logs"
    if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"
    echo [!DATETIME!] Stash: Created new stash >> "%LOG_DIR%\operations.log"
)
if "%STASH_ACTION%"=="2" (
    for /f "delims=" %%a in ('powershell -Command "Get-Date -Format \"yyyy-MM-dd HH:mm:ss\""') do set "DATETIME=%%a"
    set "LOG_DIR=%~dp0logs"
    if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"
    echo [!DATETIME!] Stash: %STASH_MSG% >> "%LOG_DIR%\operations.log"
)

echo.
echo ========================================
echo.
pause
