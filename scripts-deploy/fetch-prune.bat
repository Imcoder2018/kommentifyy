@echo off
setlocal enabledelayedexpansion

echo ========================================
echo    Fetch and Prune
echo ========================================
echo.

cd /d "%~dp0.."

if not exist ".git" (
    echo ERROR: Git repository not initialized
    pause
    exit /b 1
)

echo Fetching from all remotes...
git fetch --all --prune

if errorlevel 1 (
    echo ERROR: Fetch failed
    pause
    exit /b 1
)

echo.
echo Fetch complete!
echo.

echo Remote branches:
git branch -r
echo.

echo Local branches:
git branch -v
echo.

pause
