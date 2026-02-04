@echo off
setlocal enabledelayedexpansion

echo ========================================
echo    Switch Branch
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

REM Check for uncommitted changes
git diff --quiet 2>nul
set "HAS_UNSTAGED=%errorlevel%"
git diff --cached --quiet 2>nul
set "HAS_STAGED=%errorlevel%"

set "HAS_CHANGES=0"
if "%HAS_UNSTAGED%"=="1" set "HAS_CHANGES=1"
if "%HAS_STAGED%"=="1" set "HAS_CHANGES=1"

if "%HAS_CHANGES%"=="1" (
    echo WARNING: You have uncommitted changes!
    echo.
    git status --short
    echo.
    echo What would you like to do?
    echo [1] Stash changes and switch
    echo [2] Commit changes and switch
    echo [3] Discard changes and switch
    echo [4] Cancel
    echo.
    set /p "CHANGE_CHOICE=Enter choice (1-4): "
    
    if "!CHANGE_CHOICE!"=="1" (
        echo Stashing changes...
        for /f "delims=" %%a in ('powershell -Command "Get-Date -Format \"yyyy-MM-dd HH:mm:ss\""') do set "DATETIME=%%a"
        git stash push -m "Auto-stash before switch [!DATETIME!]"
        if errorlevel 1 (
            echo ERROR: Failed to stash changes
            pause
            exit /b 1
        )
        set "STASHED=1"
        echo Changes stashed successfully.
        echo.
        
    ) else if "!CHANGE_CHOICE!"=="2" (
        set /p "COMMIT_MSG=Enter commit message: "
        if "!COMMIT_MSG!"=="" (
            echo ERROR: Commit message cannot be empty
            pause
            exit /b 1
        )
        git add .
        git commit -m "!COMMIT_MSG!"
        if errorlevel 1 (
            echo ERROR: Failed to commit changes
            pause
            exit /b 1
        )
        echo Changes committed successfully.
        echo.
        
    ) else if "!CHANGE_CHOICE!"=="3" (
        echo.
        echo WARNING: This will permanently discard all changes!
        set /p "DISCARD_CONFIRM=Type 'DISCARD' to confirm: "
        if "!DISCARD_CONFIRM!"=="DISCARD" (
            git reset --hard
            git clean -fd
            echo Changes discarded.
            echo.
        ) else (
            echo Operation cancelled.
            pause
            exit /b 0
        )
        
    ) else (
        echo Operation cancelled.
        pause
        exit /b 0
    )
)

REM Fetch latest branches
echo Fetching latest branches from remote...
git fetch origin >nul 2>&1

REM Show available branches with info
echo.
echo Available branches:
echo.
echo Local branches:
for /f "delims=" %%b in ('git branch --format="%%(refname:short)"') do (
    set "BRANCH=%%b"
    for /f "delims=" %%d in ('git log -1 --format="%%ar" "%%b" 2^>nul') do set "LAST_COMMIT=%%d"
    if "!BRANCH!"=="%CURRENT_BRANCH%" (
        echo   * !BRANCH! (current) - !LAST_COMMIT!
    ) else (
        echo     !BRANCH! - !LAST_COMMIT!
    )
)
echo.

REM Check for remote branches
git branch -r >nul 2>&1
if not errorlevel 1 (
    echo Remote branches (origin/...):
    git branch -r | head -10
    echo.
)

REM Get target branch
set /p "TARGET_BRANCH=Enter branch name to switch to: "

if "%TARGET_BRANCH%"=="" (
    echo ERROR: Branch name cannot be empty
    if "%STASHED%"=="1" (
        echo.
        echo Restoring stashed changes...
        git stash pop
    )
    pause
    exit /b 1
)

REM Validate branch name
echo %TARGET_BRANCH% | findstr " " >nul
if not errorlevel 1 (
    echo ERROR: Branch name cannot contain spaces
    if "%STASHED%"=="1" git stash pop
    pause
    exit /b 1
)

REM Check if switching to current branch
if "%TARGET_BRANCH%"=="%CURRENT_BRANCH%" (
    echo Already on branch: %TARGET_BRANCH%
    if "%STASHED%"=="1" (
        echo.
        set /p "RESTORE_STASH=Restore stashed changes? (Y/N): "
        if /i "!RESTORE_STASH!"=="Y" git stash pop
    )
    pause
    exit /b 0
)

REM Try to switch to branch
echo.
echo Switching to branch: %TARGET_BRANCH%
git checkout %TARGET_BRANCH% 2>nul

if errorlevel 1 (
    REM Branch might not exist locally, try to create from remote
    echo.
    echo Branch not found locally. Checking remote...
    
    git show-ref --verify --quiet refs/remotes/origin/%TARGET_BRANCH%
    if not errorlevel 1 (
        echo Found on remote. Creating local tracking branch...
        git checkout -b %TARGET_BRANCH% origin/%TARGET_BRANCH%
        
        if errorlevel 1 (
            echo ERROR: Failed to create branch from remote
            if "%STASHED%"=="1" (
                echo.
                echo Restoring stashed changes...
                git stash pop
            )
            pause
            exit /b 1
        )
    ) else (
        echo ERROR: Branch '%TARGET_BRANCH%' not found locally or remotely
        echo.
        set /p "CREATE_NEW=Create new branch '%TARGET_BRANCH%'? (Y/N): "
        if /i "!CREATE_NEW!"=="Y" (
            git checkout -b %TARGET_BRANCH%
            if errorlevel 1 (
                echo ERROR: Failed to create new branch
                if "%STASHED%"=="1" git stash pop
                pause
                exit /b 1
            )
            echo New branch created and checked out.
        ) else (
            if "%STASHED%"=="1" (
                echo.
                echo Restoring stashed changes...
                git stash pop
            )
            pause
            exit /b 1
        )
    )
)

echo.
echo Switched to branch: %TARGET_BRANCH%

REM Log the operation
for /f "delims=" %%a in ('powershell -Command "Get-Date -Format \"yyyy-MM-dd HH:mm:ss\""') do set "DATETIME=%%a"
set "LOG_DIR=%~dp0logs"
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"
echo [%DATETIME%] Switch-Branch: %CURRENT_BRANCH% to %TARGET_BRANCH% >> "%LOG_DIR%\operations.log"

REM Show branch info
echo.
echo Branch information:
git log -1 --format="Last commit: %%h - %%s (%%ar)"
echo.

REM Restore stashed changes if any
if "%STASHED%"=="1" (
    echo.
    set /p "RESTORE_STASH=Restore stashed changes? (Y/N): "
    if /i "!RESTORE_STASH!"=="Y" (
        echo Restoring stashed changes...
        git stash pop
        if errorlevel 1 (
            echo WARNING: Conflicts occurred while restoring stash
            echo Please resolve conflicts manually
            echo.
            echo Conflicted files:
            git status --short | findstr "UU"
        ) else (
            echo Stashed changes restored successfully.
        )
    ) else (
        echo Stashed changes kept. Use stash-changes.bat to manage them.
    )
)

echo.
echo ========================================
echo Current branch: %TARGET_BRANCH%
echo ========================================
echo.
pause
