@echo off
setlocal enabledelayedexpansion

echo ========================================
echo    Git Patch Manager
echo ========================================
echo.

cd /d "%~dp0.."

if not exist ".git" (
    echo ERROR: Git repository not initialized
    echo Please run init-repo.bat first
    pause
    exit /b 1
)

echo Select action:
echo.
echo === Create Patches ===
echo [1] Create patch from last commit
echo [2] Create patches from last N commits
echo [3] Create patch from specific commit
echo [4] Create patch from staged changes
echo [5] Create patch from unstaged changes
echo [6] Create patch between commits
echo.
echo === Apply Patches ===
echo [7] Apply patch file
echo [8] Apply patch with 3-way merge
echo [9] Check if patch applies cleanly
echo [10] Apply patch interactively
echo.
echo === Manage Patches ===
echo [11] View patch content
echo [12] List patch files
echo [13] Cancel
echo.
set /p "CHOICE=Enter choice (1-13): "

if not exist "patches" mkdir patches

if "%CHOICE%"=="1" (
    echo.
    echo Last commit:
    git log -1 --oneline
    echo.
    
    for /f "delims=" %%h in ('git rev-parse --short HEAD') do set "SHORT_HASH=%%h"
    set "PATCH_FILE=patches\!SHORT_HASH!.patch"
    
    git format-patch -1 HEAD -o patches
    
    if errorlevel 1 (
        echo ERROR: Failed to create patch
    ) else (
        echo Patch created in patches folder!
        dir /b patches\*.patch 2>nul | powershell -Command "$input | Select-Object -Last 1"
    )

) else if "%CHOICE%"=="2" (
    echo.
    set /p "NUM_COMMITS=Enter number of commits: "
    if "!NUM_COMMITS!"=="" set "NUM_COMMITS=1"
    
    echo.
    echo Creating patches for last !NUM_COMMITS! commits...
    
    git format-patch -!NUM_COMMITS! -o patches
    
    if errorlevel 1 (
        echo ERROR: Failed to create patches
    ) else (
        echo.
        echo Patches created:
        dir /b patches\*.patch 2>nul | powershell -Command "$input | Select-Object -Last !NUM_COMMITS!"
    )

) else if "%CHOICE%"=="3" (
    echo.
    echo Recent commits:
    git log --oneline -15
    echo.
    
    set /p "COMMIT_HASH=Enter commit hash: "
    if "!COMMIT_HASH!"=="" (
        echo ERROR: Commit hash required
        pause
        exit /b 1
    )
    
    git format-patch -1 !COMMIT_HASH! -o patches
    
    if errorlevel 1 (
        echo ERROR: Failed to create patch
    ) else (
        echo Patch created!
    )

) else if "%CHOICE%"=="4" (
    echo.
    echo Staged changes:
    git diff --staged --stat
    echo.
    
    set /p "PATCH_NAME=Enter patch filename: "
    if "!PATCH_NAME!"=="" set "PATCH_NAME=staged_changes"
    
    git diff --staged > "patches\!PATCH_NAME!.patch"
    
    if errorlevel 1 (
        echo ERROR: Failed to create patch
    ) else (
        echo Patch created: patches\!PATCH_NAME!.patch
    )

) else if "%CHOICE%"=="5" (
    echo.
    echo Unstaged changes:
    git diff --stat
    echo.
    
    set /p "PATCH_NAME=Enter patch filename: "
    if "!PATCH_NAME!"=="" set "PATCH_NAME=unstaged_changes"
    
    git diff > "patches\!PATCH_NAME!.patch"
    
    if errorlevel 1 (
        echo ERROR: Failed to create patch
    ) else (
        echo Patch created: patches\!PATCH_NAME!.patch
    )

) else if "%CHOICE%"=="6" (
    echo.
    echo Recent commits:
    git log --oneline -15
    echo.
    
    set /p "COMMIT1=Enter start commit: "
    set /p "COMMIT2=Enter end commit (default HEAD): "
    if "!COMMIT2!"=="" set "COMMIT2=HEAD"
    
    set /p "PATCH_NAME=Enter patch filename: "
    if "!PATCH_NAME!"=="" set "PATCH_NAME=range_patch"
    
    git diff !COMMIT1!..!COMMIT2! > "patches\!PATCH_NAME!.patch"
    
    if errorlevel 1 (
        echo ERROR: Failed to create patch
    ) else (
        echo Patch created: patches\!PATCH_NAME!.patch
    )

) else if "%CHOICE%"=="7" (
    echo.
    echo Available patches:
    dir /b patches\*.patch 2>nul
    if errorlevel 1 echo   No patches found.
    echo.
    
    set /p "PATCH_FILE=Enter patch filename (or full path): "
    if "!PATCH_FILE!"=="" (
        echo ERROR: Patch file required
        pause
        exit /b 1
    )
    
    REM Check if file exists in patches folder
    if exist "patches\!PATCH_FILE!" (
        set "PATCH_FILE=patches\!PATCH_FILE!"
    )
    
    if not exist "!PATCH_FILE!" (
        echo ERROR: Patch file not found
        pause
        exit /b 1
    )
    
    echo.
    echo Applying patch: !PATCH_FILE!
    git apply "!PATCH_FILE!"
    
    if errorlevel 1 (
        echo.
        echo ERROR: Patch did not apply cleanly
        echo Try option [8] for 3-way merge or [10] for interactive
    ) else (
        echo Patch applied successfully!
    )

) else if "%CHOICE%"=="8" (
    echo.
    echo Available patches:
    dir /b patches\*.patch 2>nul
    if errorlevel 1 echo   No patches found.
    echo.
    
    set /p "PATCH_FILE=Enter patch filename: "
    
    if exist "patches\!PATCH_FILE!" (
        set "PATCH_FILE=patches\!PATCH_FILE!"
    )
    
    if not exist "!PATCH_FILE!" (
        echo ERROR: Patch file not found
        pause
        exit /b 1
    )
    
    echo.
    echo Applying patch with 3-way merge...
    git apply --3way "!PATCH_FILE!"
    
    if errorlevel 1 (
        echo.
        echo Some conflicts may need manual resolution.
    ) else (
        echo Patch applied with 3-way merge!
    )

) else if "%CHOICE%"=="9" (
    echo.
    echo Available patches:
    dir /b patches\*.patch 2>nul
    if errorlevel 1 echo   No patches found.
    echo.
    
    set /p "PATCH_FILE=Enter patch filename: "
    
    if exist "patches\!PATCH_FILE!" (
        set "PATCH_FILE=patches\!PATCH_FILE!"
    )
    
    if not exist "!PATCH_FILE!" (
        echo ERROR: Patch file not found
        pause
        exit /b 1
    )
    
    echo.
    echo Checking if patch applies cleanly...
    git apply --check "!PATCH_FILE!"
    
    if errorlevel 1 (
        echo.
        echo Patch will NOT apply cleanly.
        echo There may be conflicts.
    ) else (
        echo.
        echo Patch WILL apply cleanly!
    )

) else if "%CHOICE%"=="10" (
    echo.
    echo Available patches:
    dir /b patches\*.patch 2>nul
    if errorlevel 1 echo   No patches found.
    echo.
    
    set /p "PATCH_FILE=Enter patch filename: "
    
    if exist "patches\!PATCH_FILE!" (
        set "PATCH_FILE=patches\!PATCH_FILE!"
    )
    
    if not exist "!PATCH_FILE!" (
        echo ERROR: Patch file not found
        pause
        exit /b 1
    )
    
    echo.
    echo Applying patch interactively...
    echo (You will be asked for each hunk)
    git apply --interactive "!PATCH_FILE!"

) else if "%CHOICE%"=="11" (
    echo.
    echo Available patches:
    dir /b patches\*.patch 2>nul
    if errorlevel 1 echo   No patches found.
    echo.
    
    set /p "PATCH_FILE=Enter patch filename: "
    
    if exist "patches\!PATCH_FILE!" (
        set "PATCH_FILE=patches\!PATCH_FILE!"
    )
    
    if not exist "!PATCH_FILE!" (
        echo ERROR: Patch file not found
        pause
        exit /b 1
    )
    
    echo.
    echo Patch content:
    echo ========================================
    type "!PATCH_FILE!"
    echo ========================================

) else if "%CHOICE%"=="12" (
    echo.
    echo Patch files in patches folder:
    echo ========================================
    dir /b patches\*.patch 2>nul
    if errorlevel 1 echo No patch files found.
    echo ========================================

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
pause
