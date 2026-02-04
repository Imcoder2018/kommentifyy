@echo off
setlocal enabledelayedexpansion

echo ========================================
echo    Git Remote Manager
echo ========================================
echo.

cd /d "%~dp0.."

if not exist ".git" (
    echo ERROR: Git repository not initialized
    pause
    exit /b 1
)

echo Current remotes:
echo ========================================
git remote -v
echo ========================================
echo.

echo Select action:
echo.
echo [1] Add new remote
echo [2] Remove remote
echo [3] Rename remote
echo [4] Change remote URL
echo [5] Show remote details
echo [6] Prune stale remote branches
echo [7] Fetch from specific remote
echo [8] Fetch from all remotes
echo [9] Push to specific remote
echo [10] Set default push remote
echo [11] Add mirror remote
echo [12] Cancel
echo.
set /p "CHOICE=Enter choice (1-12): "

if "%CHOICE%"=="1" (
    echo.
    set /p "REMOTE_NAME=Enter remote name (e.g., upstream, backup): "
    if "!REMOTE_NAME!"=="" (
        echo ERROR: Remote name required
        pause
        exit /b 1
    )
    
    set /p "REMOTE_URL=Enter remote URL: "
    if "!REMOTE_URL!"=="" (
        echo ERROR: Remote URL required
        pause
        exit /b 1
    )
    
    git remote add !REMOTE_NAME! !REMOTE_URL!
    
    if errorlevel 1 (
        echo ERROR: Failed to add remote
    ) else (
        echo Remote '!REMOTE_NAME!' added successfully!
        echo.
        echo Fetching from new remote...
        git fetch !REMOTE_NAME!
    )

) else if "%CHOICE%"=="2" (
    echo.
    echo Current remotes:
    git remote
    echo.
    
    set /p "REMOTE_NAME=Enter remote name to remove: "
    if "!REMOTE_NAME!"=="" (
        echo ERROR: Remote name required
        pause
        exit /b 1
    )
    
    set /p "CONFIRM=Remove remote '!REMOTE_NAME!'? (Y/N): "
    if /i "!CONFIRM!"=="Y" (
        git remote remove !REMOTE_NAME!
        
        if errorlevel 1 (
            echo ERROR: Failed to remove remote
        ) else (
            echo Remote '!REMOTE_NAME!' removed!
        )
    )

) else if "%CHOICE%"=="3" (
    echo.
    echo Current remotes:
    git remote
    echo.
    
    set /p "OLD_NAME=Enter current remote name: "
    set /p "NEW_NAME=Enter new remote name: "
    
    if "!OLD_NAME!"=="" (
        echo ERROR: Current name required
        pause
        exit /b 1
    )
    if "!NEW_NAME!"=="" (
        echo ERROR: New name required
        pause
        exit /b 1
    )
    
    git remote rename !OLD_NAME! !NEW_NAME!
    
    if errorlevel 1 (
        echo ERROR: Failed to rename remote
    ) else (
        echo Remote renamed from '!OLD_NAME!' to '!NEW_NAME!'!
    )

) else if "%CHOICE%"=="4" (
    echo.
    echo Current remotes:
    git remote -v
    echo.
    
    set /p "REMOTE_NAME=Enter remote name to update: "
    if "!REMOTE_NAME!"=="" (
        echo ERROR: Remote name required
        pause
        exit /b 1
    )
    
    echo.
    echo URL type:
    echo [1] Set fetch and push URL (same)
    echo [2] Set fetch URL only
    echo [3] Set push URL only
    echo.
    set /p "URL_TYPE=Select (1-3): "
    
    set /p "NEW_URL=Enter new URL: "
    if "!NEW_URL!"=="" (
        echo ERROR: URL required
        pause
        exit /b 1
    )
    
    if "!URL_TYPE!"=="1" (
        git remote set-url !REMOTE_NAME! !NEW_URL!
    ) else if "!URL_TYPE!"=="2" (
        git remote set-url !REMOTE_NAME! !NEW_URL! --fetch
    ) else if "!URL_TYPE!"=="3" (
        git remote set-url --push !REMOTE_NAME! !NEW_URL!
    ) else (
        git remote set-url !REMOTE_NAME! !NEW_URL!
    )
    
    if errorlevel 1 (
        echo ERROR: Failed to update URL
    ) else (
        echo Remote URL updated!
        git remote -v | findstr !REMOTE_NAME!
    )

) else if "%CHOICE%"=="5" (
    echo.
    echo Current remotes:
    git remote
    echo.
    
    set /p "REMOTE_NAME=Enter remote name (or Enter for all): "
    
    echo.
    echo Remote Details:
    echo ========================================
    if "!REMOTE_NAME!"=="" (
        git remote show
    ) else (
        git remote show !REMOTE_NAME!
    )
    echo ========================================

) else if "%CHOICE%"=="6" (
    echo.
    echo Current remotes:
    git remote
    echo.
    
    set /p "REMOTE_NAME=Enter remote name (or Enter for origin): "
    if "!REMOTE_NAME!"=="" set "REMOTE_NAME=origin"
    
    echo.
    echo Pruning stale branches from !REMOTE_NAME!...
    git remote prune !REMOTE_NAME! --dry-run
    
    echo.
    set /p "CONFIRM=Execute prune? (Y/N): "
    if /i "!CONFIRM!"=="Y" (
        git remote prune !REMOTE_NAME!
        echo Prune complete!
    )

) else if "%CHOICE%"=="7" (
    echo.
    echo Current remotes:
    git remote
    echo.
    
    set /p "REMOTE_NAME=Enter remote name: "
    if "!REMOTE_NAME!"=="" (
        echo ERROR: Remote name required
        pause
        exit /b 1
    )
    
    echo.
    echo Fetching from !REMOTE_NAME!...
    git fetch !REMOTE_NAME!
    
    if errorlevel 1 (
        echo ERROR: Fetch failed
    ) else (
        echo Fetch complete!
    )

) else if "%CHOICE%"=="8" (
    echo.
    echo Fetching from all remotes...
    git fetch --all
    
    if errorlevel 1 (
        echo ERROR: Fetch failed
    ) else (
        echo Fetch from all remotes complete!
    )

) else if "%CHOICE%"=="9" (
    echo.
    echo Current remotes:
    git remote
    echo.
    
    set /p "REMOTE_NAME=Enter remote name: "
    if "!REMOTE_NAME!"=="" (
        echo ERROR: Remote name required
        pause
        exit /b 1
    )
    
    for /f "delims=" %%b in ('git branch --show-current 2^>nul') do set "CURRENT_BRANCH=%%b"
    
    set /p "BRANCH=Enter branch to push (Enter for !CURRENT_BRANCH!): "
    if "!BRANCH!"=="" set "BRANCH=!CURRENT_BRANCH!"
    
    echo.
    echo Pushing !BRANCH! to !REMOTE_NAME!...
    git push !REMOTE_NAME! !BRANCH!
    
    if errorlevel 1 (
        echo ERROR: Push failed
    ) else (
        echo Push complete!
    )

) else if "%CHOICE%"=="10" (
    echo.
    echo Current remotes:
    git remote
    echo.
    
    set /p "REMOTE_NAME=Enter default push remote: "
    if "!REMOTE_NAME!"=="" (
        echo ERROR: Remote name required
        pause
        exit /b 1
    )
    
    for /f "delims=" %%b in ('git branch --show-current 2^>nul') do set "CURRENT_BRANCH=%%b"
    
    git push -u !REMOTE_NAME! !CURRENT_BRANCH!
    
    if errorlevel 1 (
        echo ERROR: Failed to set default
    ) else (
        echo Default push remote set to: !REMOTE_NAME!
    )

) else if "%CHOICE%"=="11" (
    echo.
    echo Adding mirror remote (push to multiple remotes)
    echo.
    
    set /p "MIRROR_URL=Enter mirror remote URL: "
    if "!MIRROR_URL!"=="" (
        echo ERROR: URL required
        pause
        exit /b 1
    )
    
    git remote set-url --add --push origin !MIRROR_URL!
    
    if errorlevel 1 (
        echo ERROR: Failed to add mirror
    ) else (
        echo Mirror remote added!
        echo Pushes to origin will now go to both URLs.
        echo.
        git remote -v
    )

) else if "%CHOICE%"=="12" (
    echo Operation cancelled.
    pause
    exit /b 0
) else (
    echo Invalid choice.
)

echo.
echo Current remotes:
git remote -v
echo.
pause
