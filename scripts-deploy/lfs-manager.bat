@echo off
setlocal enabledelayedexpansion

echo ========================================
echo    Git LFS (Large File Storage) Manager
echo ========================================
echo.

cd /d "%~dp0.."

REM Check if Git LFS is installed
git lfs version >nul 2>&1
if errorlevel 1 (
    echo Git LFS is NOT installed.
    echo.
    echo To install Git LFS:
    echo 1. Download from: https://git-lfs.github.com/
    echo 2. Or use: winget install GitHub.GitLFS
    echo 3. Run: git lfs install
    echo.
    pause
    exit /b 1
)

echo Git LFS version:
git lfs version
echo.

if not exist ".git" (
    echo WARNING: Not in a Git repository
)

echo Select action:
echo.
echo [1] Initialize LFS in repository
echo [2] Track file pattern
echo [3] Untrack file pattern
echo [4] View tracked patterns
echo [5] View LFS files
echo [6] Pull LFS files
echo [7] Push LFS files
echo [8] Migrate existing files to LFS
echo [9] Show LFS status
echo [10] Prune old LFS files
echo [11] View LFS storage info
echo [12] Cancel
echo.
set /p "CHOICE=Enter choice (1-12): "

if "%CHOICE%"=="1" (
    echo.
    echo Initializing Git LFS...
    git lfs install
    
    if errorlevel 1 (
        echo ERROR: Failed to initialize LFS
    ) else (
        echo Git LFS initialized!
        echo.
        echo Common patterns to track:
        echo   git lfs track "*.psd"
        echo   git lfs track "*.zip"
        echo   git lfs track "*.mp4"
        echo   git lfs track "*.bin"
    )

) else if "%CHOICE%"=="2" (
    echo.
    echo Common large file patterns:
    echo   Images:  *.psd, *.ai, *.png, *.jpg, *.gif
    echo   Video:   *.mp4, *.mov, *.avi
    echo   Audio:   *.mp3, *.wav, *.flac
    echo   Archive: *.zip, *.rar, *.7z, *.tar.gz
    echo   Binary:  *.exe, *.dll, *.so, *.bin
    echo   Data:    *.sqlite, *.db, *.csv (large)
    echo.
    
    set /p "PATTERN=Enter pattern to track (e.g., *.psd): "
    if "!PATTERN!"=="" (
        echo ERROR: Pattern required
        pause
        exit /b 1
    )
    
    git lfs track "!PATTERN!"
    
    if errorlevel 1 (
        echo ERROR: Failed to track pattern
    ) else (
        echo Pattern tracked: !PATTERN!
        echo Don't forget to commit .gitattributes!
    )

) else if "%CHOICE%"=="3" (
    echo.
    echo Currently tracked patterns:
    git lfs track
    echo.
    
    set /p "PATTERN=Enter pattern to untrack: "
    if "!PATTERN!"=="" (
        echo ERROR: Pattern required
        pause
        exit /b 1
    )
    
    git lfs untrack "!PATTERN!"
    
    if errorlevel 1 (
        echo ERROR: Failed to untrack pattern
    ) else (
        echo Pattern untracked: !PATTERN!
    )

) else if "%CHOICE%"=="4" (
    echo.
    echo Tracked patterns (.gitattributes):
    echo ========================================
    git lfs track
    echo ========================================

) else if "%CHOICE%"=="5" (
    echo.
    echo LFS files in repository:
    echo ========================================
    git lfs ls-files
    echo ========================================

) else if "%CHOICE%"=="6" (
    echo.
    echo Pulling LFS files...
    git lfs pull
    
    if errorlevel 1 (
        echo ERROR: LFS pull failed
    ) else (
        echo LFS files pulled!
    )

) else if "%CHOICE%"=="7" (
    echo.
    echo Pushing LFS files...
    git lfs push --all origin
    
    if errorlevel 1 (
        echo ERROR: LFS push failed
    ) else (
        echo LFS files pushed!
    )

) else if "%CHOICE%"=="8" (
    echo.
    echo WARNING: This will rewrite Git history!
    echo Make sure you have a backup before proceeding.
    echo.
    
    set /p "PATTERN=Enter pattern to migrate (e.g., *.psd): "
    if "!PATTERN!"=="" (
        echo ERROR: Pattern required
        pause
        exit /b 1
    )
    
    set /p "CONFIRM=This will rewrite history. Continue? (YES to confirm): "
    if /i "!CONFIRM!"=="YES" (
        echo.
        echo Migrating !PATTERN! to LFS...
        git lfs migrate import --include="!PATTERN!" --everything
        
        if errorlevel 1 (
            echo ERROR: Migration failed
        ) else (
            echo Migration complete!
            echo Note: You may need to force push to update remote.
        )
    )

) else if "%CHOICE%"=="9" (
    echo.
    echo LFS Status:
    echo ========================================
    git lfs status
    echo ========================================

) else if "%CHOICE%"=="10" (
    echo.
    echo Pruning old LFS files...
    git lfs prune
    
    if errorlevel 1 (
        echo ERROR: Prune failed
    ) else (
        echo LFS pruned!
    )

) else if "%CHOICE%"=="11" (
    echo.
    echo LFS Storage Information:
    echo ========================================
    
    echo.
    echo Local LFS objects:
    git lfs ls-files | find /c /v ""
    
    echo.
    echo LFS environment:
    git lfs env
    
    echo ========================================

) else if "%CHOICE%"=="12" (
    echo Operation cancelled.
    pause
    exit /b 0
) else (
    echo Invalid choice.
)

echo.
pause
