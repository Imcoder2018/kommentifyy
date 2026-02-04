@echo off
setlocal enabledelayedexpansion

echo ========================================
echo    Deploy to Development
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

REM Get current branch
for /f "delims=" %%i in ('git branch --show-current 2^>nul') do set "CURRENT_BRANCH=%%i"

echo Current branch: %CURRENT_BRANCH%
echo.

REM Check network connectivity first
echo Checking network connectivity...
ping -n 1 github.com >nul 2>&1
if errorlevel 1 (
    echo WARNING: Network connectivity issues detected.
    set /p "CONTINUE=Continue anyway? (Y/N): "
    if /i not "!CONTINUE!"=="Y" (
        echo Deployment cancelled.
        pause
        exit /b 0
    )
)
echo Network: OK
echo.

REM Show current status
echo Current changes:
git status --short
echo.

REM Check for changes
git diff --quiet 2>nul
set "HAS_UNSTAGED=%errorlevel%"
git diff --cached --quiet 2>nul
set "HAS_STAGED=%errorlevel%"

if "%HAS_UNSTAGED%"=="0" if "%HAS_STAGED%"=="0" (
    echo No local changes to commit.
    set /p "PUSH_ANYWAY=Push existing commits to remote? (Y/N): "
    if /i not "!PUSH_ANYWAY!"=="Y" (
        pause
        exit /b 0
    )
    goto :push_only
)

REM Get commit message from user
:get_message
set /p "COMMIT_MSG=Enter commit message for development: "

if "%COMMIT_MSG%"=="" (
    echo ERROR: Commit message cannot be empty
    goto :get_message
)

echo.
echo Staging all changes...
git add .
if errorlevel 1 (
    echo ERROR: Failed to stage changes
    pause
    exit /b 1
)

echo Committing with message: [DEV] %COMMIT_MSG%
git commit -m "[DEV] %COMMIT_MSG%"
if errorlevel 1 (
    echo.
    echo No changes to commit or commit failed.
    set /p "PUSH_ANYWAY=Do you want to push anyway? (Y/N): "
    if /i not "!PUSH_ANYWAY!"=="Y" (
        pause
        exit /b 0
    )
)

:push_only

REM Check if development branch exists
echo.
echo Checking for development branch...
git show-ref --verify --quiet refs/heads/development
if errorlevel 1 (
    echo Development branch does not exist.
    set /p "CREATE_DEV=Create development branch? (Y/N): "
    if /i "!CREATE_DEV!"=="Y" (
        echo Creating development branch...
        git checkout -b development
        if errorlevel 1 (
            echo ERROR: Failed to create development branch
            pause
            exit /b 1
        )
        set "CURRENT_BRANCH=development"
    ) else (
        echo Continuing with current branch: %CURRENT_BRANCH%
    )
) else (
    REM Ask if user wants to switch to development branch
    if not "%CURRENT_BRANCH%"=="development" (
        set /p "SWITCH_DEV=Switch to development branch? (Y/N): "
        if /i "!SWITCH_DEV!"=="Y" (
            REM Create backup before switching
            echo Creating backup of current state...
            for /f "delims=" %%a in ('powershell -Command "Get-Date -Format \"yyyyMMdd-HHmmss\""') do set "BACKUP_TIME=%%a"
            git branch "backup/%CURRENT_BRANCH%_!BACKUP_TIME!" 2>nul
            
            echo Switching to development branch...
            git checkout development
            if errorlevel 1 (
                echo ERROR: Failed to switch to development branch
                pause
                exit /b 1
            )
            
            echo Merging changes from %CURRENT_BRANCH%...
            git merge %CURRENT_BRANCH% --no-edit
            if errorlevel 1 (
                echo.
                echo WARNING: Merge conflicts detected
                echo Please resolve conflicts and run this script again
                echo.
                echo To abort merge: git merge --abort
                echo To see conflicts: git status
                pause
                exit /b 1
            )
            set "CURRENT_BRANCH=development"
        )
    )
)

REM Get current branch again (might have changed)
for /f "delims=" %%i in ('git branch --show-current 2^>nul') do set "CURRENT_BRANCH=%%i"

echo.
echo Pushing to remote (%CURRENT_BRANCH%)...

REM Retry mechanism for push
set "RETRY_COUNT=0"
:push_retry
git push -u origin %CURRENT_BRANCH%
if errorlevel 1 (
    set /a RETRY_COUNT+=1
    if !RETRY_COUNT! LSS 3 (
        echo Push failed. Retrying (!RETRY_COUNT!/3)...
        timeout /t 2 >nul
        goto :push_retry
    )
    echo.
    echo ERROR: Failed to push to remote after 3 attempts
    echo Please check your internet connection and remote configuration.
    pause
    exit /b 1
)

REM Log the operation
for /f "delims=" %%a in ('powershell -Command "Get-Date -Format \"yyyy-MM-dd HH:mm:ss\""') do set "DATETIME=%%a"
set "LOG_DIR=%~dp0logs"
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"
echo [%DATETIME%] Deploy-Dev: %COMMIT_MSG% (Branch: %CURRENT_BRANCH%) >> "%LOG_DIR%\operations.log"

echo.
echo ========================================
echo Deployed to development successfully!
echo Branch: %CURRENT_BRANCH%
echo ========================================
echo.
pause
