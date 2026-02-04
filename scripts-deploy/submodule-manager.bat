@echo off
setlocal enabledelayedexpansion

echo ========================================
echo    Git Submodule Manager
echo ========================================
echo.

cd /d "%~dp0.."

if not exist ".git" (
    echo ERROR: Git repository not initialized
    pause
    exit /b 1
)

echo Current submodules:
echo ========================================
if exist ".gitmodules" (
    git submodule status
) else (
    echo No submodules configured.
)
echo.

echo Select action:
echo.
echo [1] Add new submodule
echo [2] Initialize submodules
echo [3] Update all submodules
echo [4] Update specific submodule
echo [5] Remove submodule
echo [6] Sync submodule URLs
echo [7] Change submodule branch
echo [8] Check submodule status
echo [9] Clone repo with submodules
echo [10] Foreach submodule command
echo [11] Cancel
echo.
set /p "CHOICE=Enter choice (1-11): "

if "%CHOICE%"=="1" (
    echo.
    set /p "SUBMODULE_URL=Enter submodule repository URL: "
    if "!SUBMODULE_URL!"=="" (
        echo ERROR: URL required
        pause
        exit /b 1
    )
    
    set /p "SUBMODULE_PATH=Enter path for submodule (e.g., libs/mylib): "
    if "!SUBMODULE_PATH!"=="" (
        echo ERROR: Path required
        pause
        exit /b 1
    )
    
    set /p "BRANCH=Enter branch to track (or Enter for default): "
    
    if "!BRANCH!"=="" (
        git submodule add !SUBMODULE_URL! "!SUBMODULE_PATH!"
    ) else (
        git submodule add -b !BRANCH! !SUBMODULE_URL! "!SUBMODULE_PATH!"
    )
    
    if errorlevel 1 (
        echo ERROR: Failed to add submodule
    ) else (
        echo.
        echo Submodule added at: !SUBMODULE_PATH!
        echo Don't forget to commit the changes!
    )

) else if "%CHOICE%"=="2" (
    echo.
    echo Initializing submodules...
    git submodule init
    echo.
    echo Updating submodules...
    git submodule update
    
    if errorlevel 1 (
        echo ERROR: Failed to initialize submodules
    ) else (
        echo Submodules initialized and updated!
    )

) else if "%CHOICE%"=="3" (
    echo.
    echo Update options:
    echo [a] Update to recorded commit
    echo [b] Update to latest remote (--remote)
    echo [c] Recursive update
    echo.
    set /p "UPDATE_TYPE=Select option (a/b/c): "
    
    if /i "!UPDATE_TYPE!"=="a" (
        git submodule update
    ) else if /i "!UPDATE_TYPE!"=="b" (
        git submodule update --remote
    ) else if /i "!UPDATE_TYPE!"=="c" (
        git submodule update --init --recursive
    ) else (
        echo Invalid option
        pause
        exit /b 1
    )
    
    if errorlevel 1 (
        echo ERROR: Update failed
    ) else (
        echo Submodules updated!
    )

) else if "%CHOICE%"=="4" (
    echo.
    echo Submodules:
    git submodule status
    echo.
    
    set /p "SUBMODULE_PATH=Enter submodule path: "
    if "!SUBMODULE_PATH!"=="" (
        echo ERROR: Path required
        pause
        exit /b 1
    )
    
    git submodule update --remote "!SUBMODULE_PATH!"
    
    if errorlevel 1 (
        echo ERROR: Update failed
    ) else (
        echo Submodule updated!
    )

) else if "%CHOICE%"=="5" (
    echo.
    echo Submodules:
    git submodule status
    echo.
    
    set /p "SUBMODULE_PATH=Enter submodule path to remove: "
    if "!SUBMODULE_PATH!"=="" (
        echo ERROR: Path required
        pause
        exit /b 1
    )
    
    echo.
    echo This will remove the submodule completely.
    set /p "CONFIRM=Continue? (Y/N): "
    
    if /i "!CONFIRM!"=="Y" (
        echo.
        echo Removing submodule: !SUBMODULE_PATH!
        
        REM Deinit submodule
        git submodule deinit -f "!SUBMODULE_PATH!" 2>nul
        
        REM Remove from .git/modules
        if exist ".git\modules\!SUBMODULE_PATH!" (
            rmdir /s /q ".git\modules\!SUBMODULE_PATH!" 2>nul
        )
        
        REM Remove from working tree and .gitmodules
        git rm -f "!SUBMODULE_PATH!" 2>nul
        
        echo.
        echo Submodule removed!
        echo Don't forget to commit the changes.
    )

) else if "%CHOICE%"=="6" (
    echo.
    echo Syncing submodule URLs from .gitmodules...
    git submodule sync --recursive
    
    if errorlevel 1 (
        echo ERROR: Sync failed
    ) else (
        echo Submodule URLs synced!
    )

) else if "%CHOICE%"=="7" (
    echo.
    echo Submodules:
    git submodule status
    echo.
    
    set /p "SUBMODULE_PATH=Enter submodule path: "
    set /p "NEW_BRANCH=Enter new branch to track: "
    
    if "!SUBMODULE_PATH!"=="" (
        echo ERROR: Path required
        pause
        exit /b 1
    )
    if "!NEW_BRANCH!"=="" (
        echo ERROR: Branch required
        pause
        exit /b 1
    )
    
    git config -f .gitmodules submodule.!SUBMODULE_PATH!.branch !NEW_BRANCH!
    git submodule sync
    git submodule update --remote "!SUBMODULE_PATH!"
    
    echo Branch changed to: !NEW_BRANCH!
    echo Don't forget to commit .gitmodules

) else if "%CHOICE%"=="8" (
    echo.
    echo Submodule Status:
    echo ========================================
    git submodule status --recursive
    echo.
    echo ========================================
    echo.
    echo Legend:
    echo   - = Not initialized
    echo   + = Checked out different commit
    echo   U = Merge conflicts

) else if "%CHOICE%"=="9" (
    echo.
    set /p "CLONE_URL=Enter repository URL to clone: "
    if "!CLONE_URL!"=="" (
        echo ERROR: URL required
        pause
        exit /b 1
    )
    
    set /p "CLONE_PATH=Enter destination path (or Enter for default): "
    
    echo.
    echo Cloning with submodules...
    if "!CLONE_PATH!"=="" (
        git clone --recurse-submodules !CLONE_URL!
    ) else (
        git clone --recurse-submodules !CLONE_URL! "!CLONE_PATH!"
    )
    
    if errorlevel 1 (
        echo ERROR: Clone failed
    ) else (
        echo Repository cloned with submodules!
    )

) else if "%CHOICE%"=="10" (
    echo.
    echo Run command in each submodule.
    echo Example: git pull, git status, etc.
    echo.
    
    set /p "SUBMODULE_CMD=Enter command: "
    if "!SUBMODULE_CMD!"=="" (
        echo ERROR: Command required
        pause
        exit /b 1
    )
    
    echo.
    echo Running '!SUBMODULE_CMD!' in each submodule...
    echo ========================================
    git submodule foreach "!SUBMODULE_CMD!"

) else if "%CHOICE%"=="11" (
    echo Operation cancelled.
    pause
    exit /b 0
) else (
    echo Invalid choice.
)

echo.
pause
