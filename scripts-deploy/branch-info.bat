@echo off
setlocal enabledelayedexpansion

echo ========================================
echo    Branch Information
echo ========================================
echo.

cd /d "%~dp0.."

if not exist ".git" (
    echo ERROR: Git repository not initialized
    pause
    exit /b 1
)

for /f "delims=" %%i in ('git branch --show-current 2^>nul') do set "CURRENT_BRANCH=%%i"

echo Current Branch: %CURRENT_BRANCH%
echo.

echo === Branch Details ===
echo.

echo Last commit on this branch:
git log -1 --format="  Hash:    %%h%%n  Author:  %%an%%n  Date:    %%ar%%n  Message: %%s"
echo.

echo Tracking information:
git branch -vv | findstr "*"
echo.

echo === Local Branches ===
echo.
git branch -v
echo.

echo === Remote Branches ===
echo.
git branch -r
echo.

echo === Recent Activity ===
echo.
echo Last 5 commits:
git log --oneline -5
echo.

echo === Uncommitted Changes ===
echo.
git status --short
if errorlevel 0 (
    git diff --quiet && git diff --cached --quiet
    if not errorlevel 1 (
        echo No uncommitted changes.
    )
)
echo.

echo === Stashes ===
echo.
git stash list
if errorlevel 1 (
    echo No stashes.
)
echo.

pause
