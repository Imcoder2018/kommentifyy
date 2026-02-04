@echo off
setlocal enabledelayedexpansion

echo ========================================
echo    Hard Reset Utility
echo ========================================
echo.
echo WARNING: This will discard ALL uncommitted changes!
echo.

cd /d "%~dp0.."

if not exist ".git" (
    echo ERROR: Git repository not initialized
    pause
    exit /b 1
)

echo Current status:
git status --short
echo.

echo Select reset option:
echo.
echo [1] Discard all uncommitted changes (reset --hard HEAD)
echo [2] Reset to specific commit
echo [3] Reset to remote branch state
echo [4] Clean untracked files too
echo [5] Cancel
echo.
set /p "CHOICE=Enter choice (1-5): "

if "%CHOICE%"=="1" (
    echo.
    set /p "CONFIRM=Type 'DISCARD' to confirm: "
    if "!CONFIRM!"=="DISCARD" (
        git reset --hard HEAD
        echo.
        echo All changes discarded!
    ) else (
        echo Cancelled.
    )

) else if "%CHOICE%"=="2" (
    echo.
    echo Recent commits:
    git log --oneline -15
    echo.
    
    set /p "COMMIT=Enter commit hash: "
    if "!COMMIT!"=="" (
        echo Cancelled.
        pause
        exit /b 0
    )
    
    set /p "CONFIRM=Type 'RESET' to confirm reset to !COMMIT!: "
    if "!CONFIRM!"=="RESET" (
        git reset --hard !COMMIT!
        echo Reset to !COMMIT!!
    ) else (
        echo Cancelled.
    )

) else if "%CHOICE%"=="3" (
    for /f "delims=" %%b in ('git branch --show-current 2^>nul') do set "BRANCH=%%b"
    
    echo.
    echo Fetching remote...
    git fetch origin
    
    echo.
    set /p "CONFIRM=Reset to origin/!BRANCH!? Type 'RESET': "
    if "!CONFIRM!"=="RESET" (
        git reset --hard origin/!BRANCH!
        echo Reset to origin/!BRANCH!!
    ) else (
        echo Cancelled.
    )

) else if "%CHOICE%"=="4" (
    echo.
    echo This will:
    echo 1. Discard all changes (git reset --hard)
    echo 2. Remove all untracked files (git clean -fd)
    echo.
    
    echo Untracked files to be removed:
    git clean -n -d
    echo.
    
    set /p "CONFIRM=Type 'CLEAN ALL' to confirm: "
    if "!CONFIRM!"=="CLEAN ALL" (
        git reset --hard HEAD
        git clean -fd
        echo.
        echo Workspace completely cleaned!
    ) else (
        echo Cancelled.
    )

) else if "%CHOICE%"=="5" (
    echo Cancelled.
) else (
    echo Invalid choice.
)

echo.
echo Current status:
git status --short
echo.
pause
