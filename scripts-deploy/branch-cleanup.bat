@echo off
setlocal enabledelayedexpansion

echo ========================================
echo    Branch Cleanup Utility
echo ========================================
echo.

cd /d "%~dp0.."

if not exist ".git" (
    echo ERROR: Git repository not initialized
    echo Please run init-repo.bat first
    pause
    exit /b 1
)

for /f "delims=" %%i in ('git branch --show-current 2^>nul') do set "CURRENT_BRANCH=%%i"
echo Current branch: %CURRENT_BRANCH%
echo.

echo Select cleanup action:
echo.
echo [1] List merged branches (safe to delete)
echo [2] List stale branches (no commits in 30+ days)
echo [3] Delete all merged branches (except main/master/develop)
echo [4] Delete specific merged branches interactively
echo [5] Prune remote tracking branches
echo [6] Full cleanup (merged + remote prune)
echo [7] Show branch age report
echo [8] Archive old branches to tags
echo [9] Cancel
echo.
set /p "CHOICE=Enter choice (1-9): "

if "%CHOICE%"=="1" (
    echo.
    echo Merged branches (safe to delete):
    echo ========================================
    git branch --merged | findstr /v /c:"*" | findstr /v /i /c:"main" | findstr /v /i /c:"master" | findstr /v /i /c:"develop"
    echo.
    echo These branches have been fully merged.

) else if "%CHOICE%"=="2" (
    echo.
    echo Checking for stale branches...
    echo ========================================
    echo.
    echo Branches with no commits in 30+ days:
    for /f "delims=" %%b in ('git branch --format="%%(refname:short)"') do (
        for /f "delims=" %%d in ('git log -1 --format="%%cr" "%%b" 2^>nul') do (
            echo %%d | findstr /i "month year" >nul
            if not errorlevel 1 (
                echo   %%b - last commit: %%d
            )
        )
    )

) else if "%CHOICE%"=="3" (
    echo.
    echo Branches to delete:
    git branch --merged | findstr /v /c:"*" | findstr /v /i /c:"main" | findstr /v /i /c:"master" | findstr /v /i /c:"develop"
    echo.
    
    set /p "CONFIRM=Delete ALL these branches? (YES to confirm): "
    if /i "!CONFIRM!"=="YES" (
        for /f "delims=" %%b in ('git branch --merged ^| findstr /v /c:"*" ^| findstr /v /i /c:"main" ^| findstr /v /i /c:"master" ^| findstr /v /i /c:"develop"') do (
            set "BRANCH=%%b"
            set "BRANCH=!BRANCH: =!"
            if not "!BRANCH!"=="" (
                echo Deleting: !BRANCH!
                git branch -d "!BRANCH!" 2>nul
            )
        )
        echo.
        echo Cleanup complete!
    ) else (
        echo Operation cancelled.
    )

) else if "%CHOICE%"=="4" (
    echo.
    echo Merged branches:
    echo.
    set "COUNT=0"
    for /f "delims=" %%b in ('git branch --merged ^| findstr /v /c:"*" ^| findstr /v /i /c:"main" ^| findstr /v /i /c:"master"') do (
        set /a COUNT+=1
        set "BRANCH=%%b"
        set "BRANCH=!BRANCH: =!"
        set /p "DEL_!COUNT!=Delete '!BRANCH!'? (Y/N): "
        if /i "!DEL_%COUNT%!"=="Y" (
            git branch -d "!BRANCH!" 2>nul
            echo   Deleted: !BRANCH!
        ) else (
            echo   Kept: !BRANCH!
        )
    )
    echo.
    echo Interactive cleanup complete!

) else if "%CHOICE%"=="5" (
    echo.
    echo Pruning remote tracking branches...
    git remote prune origin
    echo.
    echo Remote branches pruned!

) else if "%CHOICE%"=="6" (
    echo.
    echo Full cleanup in progress...
    echo.
    
    echo Step 1: Pruning remote tracking branches...
    git remote prune origin
    echo Done.
    echo.
    
    echo Step 2: Deleting merged local branches...
    for /f "delims=" %%b in ('git branch --merged ^| findstr /v /c:"*" ^| findstr /v /i /c:"main" ^| findstr /v /i /c:"master" ^| findstr /v /i /c:"develop"') do (
        set "BRANCH=%%b"
        set "BRANCH=!BRANCH: =!"
        if not "!BRANCH!"=="" (
            git branch -d "!BRANCH!" 2>nul
            echo   Deleted: !BRANCH!
        )
    )
    echo Done.
    echo.
    
    echo Step 3: Running garbage collection...
    git gc --prune=now --quiet
    echo Done.
    echo.
    
    echo Full cleanup complete!

) else if "%CHOICE%"=="7" (
    echo.
    echo Branch Age Report
    echo ========================================
    echo.
    echo Format: Branch Name - Last Commit Date
    echo.
    for /f "delims=" %%b in ('git branch --format="%%(refname:short)"') do (
        for /f "delims=" %%d in ('git log -1 --format="%%ci" "%%b" 2^>nul') do (
            echo %%b: %%d
        )
    )

) else if "%CHOICE%"=="8" (
    echo.
    echo Archive branches to tags before deletion
    echo ========================================
    echo.
    
    for /f "delims=" %%b in ('git branch --merged ^| findstr /v /c:"*" ^| findstr /v /i /c:"main" ^| findstr /v /i /c:"master"') do (
        set "BRANCH=%%b"
        set "BRANCH=!BRANCH: =!"
        if not "!BRANCH!"=="" (
            set /p "ARCHIVE=Archive '!BRANCH!'? (Y/N): "
            if /i "!ARCHIVE!"=="Y" (
                set "TAG_NAME=archive/!BRANCH!"
                git tag "!TAG_NAME!" "!BRANCH!" -m "Archived branch !BRANCH!"
                git branch -d "!BRANCH!" 2>nul
                echo   Archived to tag: !TAG_NAME!
            )
        )
    )
    echo.
    echo Archiving complete!

) else if "%CHOICE%"=="9" (
    echo Operation cancelled.
    pause
    exit /b 0
) else (
    echo Invalid choice.
    pause
    exit /b 1
)

echo.
echo ========================================
echo Remaining branches:
git branch
echo.
pause
