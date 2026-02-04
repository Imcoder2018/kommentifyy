@echo off
setlocal enabledelayedexpansion

REM Quick commit utility - Fastest way to commit changes
REM Usage: quick-commit.bat "message" or just double-click for interactive

cd /d "%~dp0.."

if not exist ".git" (
    echo ERROR: Git repository not initialized
    pause
    exit /b 1
)

REM Check if message provided as argument
if not "%~1"=="" (
    set "COMMIT_MSG=%~1"
    goto :do_commit
)

echo ========================================
echo    Quick Commit
echo ========================================
echo.

echo Current changes:
git status --short
echo.

REM Check if there are any changes
git diff --quiet && git diff --cached --quiet
if not errorlevel 1 (
    echo No changes to commit.
    pause
    exit /b 0
)

set /p "COMMIT_MSG=Enter commit message: "

if "%COMMIT_MSG%"=="" (
    echo ERROR: Commit message required
    pause
    exit /b 1
)

:do_commit
echo.
echo Staging all changes...
git add .

echo Committing: %COMMIT_MSG%
git commit -m "%COMMIT_MSG%"

if errorlevel 1 (
    echo ERROR: Commit failed
    pause
    exit /b 1
)

echo.
set /p "PUSH=Push to remote? (Y/N): "
if /i "%PUSH%"=="Y" (
    git push
    if errorlevel 1 (
        for /f "delims=" %%b in ('git branch --show-current 2^>nul') do set "BRANCH=%%b"
        git push -u origin !BRANCH!
    )
    echo Changes pushed!
)

echo.
echo Done!
pause
