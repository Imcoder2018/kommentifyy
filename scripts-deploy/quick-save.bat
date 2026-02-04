@echo off
setlocal enabledelayedexpansion

echo ========================================
echo    Quick Save (Auto-commit)
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

REM Get current date and time using proper method
set "YEAR=%date:~10,4%"
set "MONTH=%date:~4,2%"
set "DAY=%date:~7,2%"
set "HOUR=%time:~0,2%"
set "MINUTE=%time:~3,2%"
set "SECOND=%time:~6,2%"

REM Handle single digit hour (add leading zero)
if "%HOUR:~0,1%"==" " set "HOUR=0%HOUR:~1,1%"

REM Alternative method using PowerShell for consistent formatting
for /f "delims=" %%a in ('powershell -Command "Get-Date -Format \"yyyy-MM-dd HH:mm:ss\""') do set "DATETIME=%%a"

if "%DATETIME%"=="" (
    REM Fallback if PowerShell fails
    set "COMMIT_MSG=Auto-save: %YEAR%-%MONTH%-%DAY% %HOUR%:%MINUTE%:%SECOND%"
) else (
    set "COMMIT_MSG=Auto-save: %DATETIME%"
)

echo Commit message: %COMMIT_MSG%
echo.

REM Check for changes
echo Current changes:
git status --short

REM Check if there are any changes to commit
git diff --quiet 2>nul
set "HAS_UNSTAGED=%errorlevel%"
git diff --cached --quiet 2>nul
set "HAS_STAGED=%errorlevel%"

if "%HAS_UNSTAGED%"=="0" if "%HAS_STAGED%"=="0" (
    echo.
    echo No changes to commit.
    pause
    exit /b 0
)

echo.
echo Staging all changes...
git add .
if errorlevel 1 (
    echo ERROR: Failed to stage changes
    pause
    exit /b 1
)

echo Committing changes...
git commit -m "%COMMIT_MSG%"
if errorlevel 1 (
    echo.
    echo No changes to commit or commit failed.
    pause
    exit /b 0
)

REM Log the operation
set "LOG_DIR=%~dp0logs"
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"
echo [%DATETIME%] Quick save: %COMMIT_MSG% >> "%LOG_DIR%\operations.log"

echo.
echo Checking network connectivity...
ping -n 1 github.com >nul 2>&1
if errorlevel 1 (
    echo WARNING: Network may be unavailable.
    set /p "TRY_PUSH=Try to push anyway? (Y/N): "
    if /i not "!TRY_PUSH!"=="Y" (
        echo Changes committed locally. Push later with: git push
        pause
        exit /b 0
    )
)

echo Pushing to remote...
git push
if errorlevel 1 (
    echo.
    echo WARNING: Push failed. Checking remote configuration...
    
    REM Try to get current branch
    for /f "delims=" %%i in ('git branch --show-current 2^>nul') do set "CURRENT_BRANCH=%%i"
    
    if not "!CURRENT_BRANCH!"=="" (
        echo Setting upstream branch and pushing...
        git push -u origin !CURRENT_BRANCH!
        if errorlevel 1 (
            echo.
            echo ERROR: Failed to push to remote
            echo Changes are committed locally.
            echo Please check your internet connection and try: git push
            pause
            exit /b 1
        )
    ) else (
        echo ERROR: Could not determine current branch
        pause
        exit /b 1
    )
)

echo.
echo ========================================
echo Changes saved and pushed successfully!
echo ========================================
echo.
pause
