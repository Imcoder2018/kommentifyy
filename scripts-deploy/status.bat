@echo off
setlocal enabledelayedexpansion

echo ========================================
echo    Git Repository Status
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

REM Get repository name
for /f "delims=" %%i in ('git remote get-url origin 2^>nul') do set "REMOTE_URL=%%i"
if not "%REMOTE_URL%"=="" (
    for %%i in ("%REMOTE_URL%") do set "REPO_NAME=%%~ni"
    set "REPO_NAME=!REPO_NAME:.git=!"
) else (
    for %%i in ("%CD%") do set "REPO_NAME=%%~ni"
)

echo Repository: %REPO_NAME%
echo.

REM Get current branch
for /f "delims=" %%i in ('git branch --show-current 2^>nul') do set "CURRENT_BRANCH=%%i"
if "%CURRENT_BRANCH%"=="" (
    echo Current Branch: HEAD (detached)
    echo WARNING: You are in detached HEAD state!
) else (
    echo Current Branch: %CURRENT_BRANCH%
)
echo.

REM Show remote URLs
echo Remote URLs:
git remote -v
if errorlevel 1 (
    echo   No remotes configured.
)
echo.

REM Show tracking info
echo Tracking Information:
for /f "delims=" %%t in ('git rev-parse --abbrev-ref --symbolic-full-name @{u} 2^>nul') do set "TRACKING=%%t"
if "%TRACKING%"=="" (
    echo   No upstream branch configured
) else (
    echo   Tracking: %TRACKING%
    
    REM Check ahead/behind
    for /f "tokens=1,2" %%a in ('git rev-list --count --left-right @{u}...HEAD 2^>nul') do (
        set "BEHIND=%%a"
        set "AHEAD=%%b"
    )
    if defined BEHIND if defined AHEAD (
        if not "!BEHIND!"=="0" echo   Behind by: !BEHIND! commits
        if not "!AHEAD!"=="0" echo   Ahead by: !AHEAD! commits
        if "!BEHIND!"=="0" if "!AHEAD!"=="0" echo   Up to date with remote
    )
)
echo.

REM Show status
echo Repository Status:
echo ========================================
git status --short
echo ========================================

REM Check if clean
git diff --quiet 2>nul
set "HAS_UNSTAGED=%errorlevel%"
git diff --cached --quiet 2>nul
set "HAS_STAGED=%errorlevel%"

echo.
if "%HAS_UNSTAGED%"=="1" (
    echo [!] You have unstaged changes
) else if "%HAS_STAGED%"=="1" (
    echo [!] You have staged but uncommitted changes
) else (
    echo [OK] Working directory is clean
)
echo.

REM Show last 5 commits
echo ========================================
echo Last 5 Commits:
echo ========================================
git log --oneline -5 --format="  %%h %%s (%%ar)"
echo.

REM Show branch list
echo ========================================
echo Local Branches:
echo ========================================
for /f "delims=" %%b in ('git branch --format="%%(refname:short)"') do (
    if "%%b"=="%CURRENT_BRANCH%" (
        echo   * %%b
    ) else (
        echo     %%b
    )
)
echo.

REM Show stash list
echo ========================================
echo Stashed Changes:
echo ========================================
git stash list
for /f %%c in ('git stash list ^| find /c /v ""') do set "STASH_COUNT=%%c"
if "%STASH_COUNT%"=="0" (
    echo   No stashed changes
) else (
    echo   Total: %STASH_COUNT% stash(es)
)
echo.

REM Show tags
echo ========================================
echo Recent Tags:
echo ========================================
git tag -l --sort=-version:refname | head -5
for /f %%c in ('git tag ^| find /c /v ""') do set "TAG_COUNT=%%c"
if "%TAG_COUNT%"=="0" (
    echo   No tags
) else (
    echo   Total: %TAG_COUNT% tag(s)
)
echo.

REM Summary
echo ========================================
echo Summary:
echo ========================================
for /f %%c in ('git rev-list --count HEAD 2^>nul') do echo   Total commits: %%c
for /f %%c in ('git branch ^| find /c /v ""') do echo   Local branches: %%c
for /f %%c in ('git remote ^| find /c /v ""') do echo   Remotes: %%c

echo.
pause
