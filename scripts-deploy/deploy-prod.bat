@echo off
setlocal enabledelayedexpansion

echo ========================================
echo    Deploy to Production
echo ========================================
echo.
echo WARNING: This will deploy to production!
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

REM Pre-deployment checks
echo Running pre-deployment checks...
echo.

REM Check 1: Network connectivity
echo [1/4] Checking network connectivity...
ping -n 1 github.com >nul 2>&1
if errorlevel 1 (
    echo FAILED: Network connectivity issues
    echo Cannot deploy to production without network.
    pause
    exit /b 1
)
echo      Network: OK

REM Check 2: Clean working directory warning
echo [2/4] Checking working directory...
git diff --quiet 2>nul
set "HAS_UNSTAGED=%errorlevel%"
git diff --cached --quiet 2>nul
set "HAS_STAGED=%errorlevel%"

REM Check 3: Verify we can reach remote
echo [3/4] Verifying remote access...
git ls-remote origin >nul 2>&1
if errorlevel 1 (
    echo FAILED: Cannot reach remote repository
    pause
    exit /b 1
)
echo      Remote: OK

REM Check 4: Check for uncommitted changes
echo [4/4] Checking for uncommitted changes...
if "%HAS_UNSTAGED%"=="1" (
    echo      WARNING: You have uncommitted changes
) else if "%HAS_STAGED%"=="1" (
    echo      WARNING: You have staged changes
) else (
    echo      Working directory: Clean
)

echo.
echo Pre-deployment checks complete.
echo.

REM Confirm production deployment
set /p "CONFIRM=Are you sure you want to deploy to PRODUCTION? (YES/NO): "
if /i not "%CONFIRM%"=="YES" (
    echo Production deployment cancelled.
    pause
    exit /b 0
)

echo.
REM Show current status
echo Current changes:
git status --short
echo.

REM Handle uncommitted changes
if "%HAS_UNSTAGED%"=="1" (
    goto :commit_changes
)
if "%HAS_STAGED%"=="1" (
    goto :commit_changes
)
goto :skip_commit

:commit_changes
REM Get commit message from user
:get_message
set /p "COMMIT_MSG=Enter commit message for production: "

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

echo Committing with message: [PROD] %COMMIT_MSG%
git commit -m "[PROD] %COMMIT_MSG%"
if errorlevel 1 (
    echo.
    echo No changes to commit or commit failed.
    set /p "PUSH_ANYWAY=Do you want to push anyway? (Y/N): "
    if /i not "!PUSH_ANYWAY!"=="Y" (
        pause
        exit /b 0
    )
)

:skip_commit

REM Create backup branch before production deployment
echo.
echo Creating backup branch...
for /f "delims=" %%a in ('powershell -Command "Get-Date -Format \"yyyyMMdd-HHmmss\""') do set "BACKUP_TIME=%%a"
set "BACKUP_BRANCH=backup/pre-prod_%BACKUP_TIME%"
git branch "%BACKUP_BRANCH%" 2>nul
if not errorlevel 1 (
    echo Backup created: %BACKUP_BRANCH%
)

REM Check if main/master branch exists
echo.
echo Checking for main/master branch...
git show-ref --verify --quiet refs/heads/main
if not errorlevel 1 (
    set "PROD_BRANCH=main"
) else (
    git show-ref --verify --quiet refs/heads/master
    if not errorlevel 1 (
        set "PROD_BRANCH=master"
    ) else (
        echo Neither main nor master branch exists.
        set /p "CREATE_MAIN=Create main branch for production? (Y/N): "
        if /i "!CREATE_MAIN!"=="Y" (
            echo Creating main branch...
            git checkout -b main
            if errorlevel 1 (
                echo ERROR: Failed to create main branch
                pause
                exit /b 1
            )
            set "PROD_BRANCH=main"
        ) else (
            echo Continuing with current branch: %CURRENT_BRANCH%
            set "PROD_BRANCH=%CURRENT_BRANCH%"
        )
    )
)

REM Switch to production branch if needed
if not "%CURRENT_BRANCH%"=="%PROD_BRANCH%" (
    echo.
    echo Switching to %PROD_BRANCH% branch...
    git checkout %PROD_BRANCH%
    if errorlevel 1 (
        echo ERROR: Failed to switch to %PROD_BRANCH% branch
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
        echo To abort: git merge --abort
        echo To rollback: git checkout %BACKUP_BRANCH%
        pause
        exit /b 1
    )
)

echo.
echo Creating production tag...
for /f "delims=" %%a in ('powershell -Command "Get-Date -Format \"yyyyMMdd-HHmm\""') do set "TAG_TIME=%%a"
set "TAG_NAME=prod-%TAG_TIME%"

if "%COMMIT_MSG%"=="" (
    set "TAG_MSG=Production release %TAG_TIME%"
) else (
    set "TAG_MSG=Production release: %COMMIT_MSG%"
)

git tag -a %TAG_NAME% -m "%TAG_MSG%"

echo.
echo Pushing to remote (%PROD_BRANCH%)...

REM Retry mechanism
set "RETRY_COUNT=0"
:push_retry
git push -u origin %PROD_BRANCH%
if errorlevel 1 (
    set /a RETRY_COUNT+=1
    if !RETRY_COUNT! LSS 3 (
        echo Push failed. Retrying (!RETRY_COUNT!/3)...
        timeout /t 2 >nul
        goto :push_retry
    )
    echo.
    echo ERROR: Failed to push to remote
    echo Rollback available: git checkout %BACKUP_BRANCH%
    pause
    exit /b 1
)

echo Pushing tags...
git push --tags
if errorlevel 1 (
    echo WARNING: Failed to push tags
)

REM Log the operation
for /f "delims=" %%a in ('powershell -Command "Get-Date -Format \"yyyy-MM-dd HH:mm:ss\""') do set "DATETIME=%%a"
set "LOG_DIR=%~dp0logs"
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"
echo [%DATETIME%] Deploy-Prod: %TAG_MSG% (Tag: %TAG_NAME%, Branch: %PROD_BRANCH%) >> "%LOG_DIR%\operations.log"
echo [%DATETIME%] Backup: %BACKUP_BRANCH% >> "%LOG_DIR%\operations.log"

echo.
echo ========================================
echo Deployed to production successfully!
echo Branch: %PROD_BRANCH%
echo Tag: %TAG_NAME%
echo Backup: %BACKUP_BRANCH%
echo ========================================
echo.
pause
