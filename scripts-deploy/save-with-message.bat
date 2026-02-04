@echo off
setlocal

echo ========================================
echo    Save with Custom Message
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

REM Show current status
echo Current changes:
echo.
git status --short

REM Check if there are any changes
git status --porcelain > "%TEMP%\gitstatus.tmp"
for %%A in ("%TEMP%\gitstatus.tmp") do set "FILESIZE=%%~zA"
if "%FILESIZE%"=="0" (
    echo.
    echo No changes to commit.
    del "%TEMP%\gitstatus.tmp" 2>nul
    pause
    exit /b 0
)
del "%TEMP%\gitstatus.tmp" 2>nul

echo.

REM Get commit message from user - simple approach
set COMMIT_MSG=
set /p COMMIT_MSG="Enter commit message: "

REM Check if message was entered
if "%COMMIT_MSG%"=="" (
    echo.
    echo ERROR: Commit message cannot be empty!
    echo Please run the script again and enter a message.
    pause
    exit /b 1
)

echo.
echo Staging all changes...
git add .
if errorlevel 1 (
    echo ERROR: Failed to stage changes
    pause
    exit /b 1
)

echo Committing with message: %COMMIT_MSG%
git commit -m "%COMMIT_MSG%"
if errorlevel 1 (
    echo.
    echo Commit failed or no changes to commit.
    pause
    exit /b 1
)

echo.
echo Pushing to remote...
git push 2>nul
if errorlevel 1 (
    echo.
    echo Push failed. Setting upstream and retrying...
    git push -u origin %CURRENT_BRANCH%
    if errorlevel 1 (
        echo.
        echo WARNING: Push failed. Changes are committed locally.
        echo Run manually: git push
    ) else (
        echo Push successful!
    )
) else (
    echo Push successful!
)

echo.
echo ========================================
echo Changes saved and pushed successfully!
echo ========================================
echo.
pause
exit /b 0
