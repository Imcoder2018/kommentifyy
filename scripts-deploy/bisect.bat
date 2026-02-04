@echo off
setlocal enabledelayedexpansion

echo ========================================
echo    Git Bisect - Bug Finder
echo ========================================
echo.

cd /d "%~dp0.."

if not exist ".git" (
    echo ERROR: Git repository not initialized
    echo Please run init-repo.bat first
    pause
    exit /b 1
)

REM Check if bisect is already in progress
git bisect log >nul 2>&1
if not errorlevel 1 (
    echo A bisect session is already in progress.
    echo.
    echo Current bisect status:
    git bisect log
    echo.
)

echo Select action:
echo.
echo [1] Start new bisect
echo [2] Mark current commit as BAD
echo [3] Mark current commit as GOOD
echo [4] Skip current commit
echo [5] View bisect log
echo [6] Reset/abort bisect
echo [7] Automated bisect with test
echo [8] Show current status
echo [9] Cancel
echo.
set /p "CHOICE=Enter choice (1-9): "

if "%CHOICE%"=="1" (
    echo.
    echo Starting new bisect session...
    echo.
    
    git bisect reset 2>nul
    git bisect start
    
    echo.
    echo Recent commits (last 30):
    git log --oneline -30
    echo.
    
    set /p "BAD_COMMIT=Enter BAD commit (where bug exists, default HEAD): "
    if "!BAD_COMMIT!"=="" set "BAD_COMMIT=HEAD"
    
    set /p "GOOD_COMMIT=Enter GOOD commit (where bug doesn't exist): "
    if "!GOOD_COMMIT!"=="" (
        echo ERROR: Good commit is required
        git bisect reset
        pause
        exit /b 1
    )
    
    git bisect bad !BAD_COMMIT!
    git bisect good !GOOD_COMMIT!
    
    echo.
    echo Bisect started!
    echo Git has checked out a commit to test.
    echo.
    echo Test this version and then:
    echo   - If bug EXISTS: Run this script, select [2] (bad)
    echo   - If bug is GONE: Run this script, select [3] (good)
    echo   - If cannot test: Run this script, select [4] (skip)
    echo.
    echo Current commit to test:
    git log -1 --oneline

) else if "%CHOICE%"=="2" (
    echo.
    echo Marking current commit as BAD...
    git bisect bad
    
    if errorlevel 1 (
        echo ERROR: No bisect in progress
        echo Start a new bisect session first.
    ) else (
        echo.
        REM Check if bisect is complete
        git bisect log 2>&1 | findstr /c:"first bad commit" >nul
        if not errorlevel 1 (
            echo.
            echo ========================================
            echo BISECT COMPLETE!
            echo ========================================
            echo.
            echo The first bad commit has been found above.
            echo Run option [6] to reset bisect when done.
        ) else (
            echo Next commit to test:
            git log -1 --oneline 2>nul
        )
    )

) else if "%CHOICE%"=="3" (
    echo.
    echo Marking current commit as GOOD...
    git bisect good
    
    if errorlevel 1 (
        echo ERROR: No bisect in progress
        echo Start a new bisect session first.
    ) else (
        echo.
        git bisect log 2>&1 | findstr /c:"first bad commit" >nul
        if not errorlevel 1 (
            echo.
            echo ========================================
            echo BISECT COMPLETE!
            echo ========================================
            echo.
            echo The first bad commit has been found above.
            echo Run option [6] to reset bisect when done.
        ) else (
            echo Next commit to test:
            git log -1 --oneline 2>nul
        )
    )

) else if "%CHOICE%"=="4" (
    echo.
    echo Skipping current commit...
    git bisect skip
    
    if errorlevel 1 (
        echo ERROR: No bisect in progress
    ) else (
        echo.
        echo Next commit to test:
        git log -1 --oneline 2>nul
    )

) else if "%CHOICE%"=="5" (
    echo.
    echo Bisect Log:
    echo ========================================
    git bisect log 2>nul
    if errorlevel 1 (
        echo No bisect in progress.
    )
    echo ========================================

) else if "%CHOICE%"=="6" (
    echo.
    set /p "CONFIRM=Reset bisect session? (Y/N): "
    if /i "!CONFIRM!"=="Y" (
        git bisect reset
        echo Bisect session ended. Returned to original branch.
    ) else (
        echo Operation cancelled.
    )

) else if "%CHOICE%"=="7" (
    echo.
    echo Automated bisect will run a test script for each commit.
    echo The script should exit with 0 for good, non-zero for bad.
    echo.
    
    git bisect reset 2>nul
    
    echo Recent commits (last 30):
    git log --oneline -30
    echo.
    
    set /p "BAD_COMMIT=Enter BAD commit (default HEAD): "
    if "!BAD_COMMIT!"=="" set "BAD_COMMIT=HEAD"
    
    set /p "GOOD_COMMIT=Enter GOOD commit: "
    if "!GOOD_COMMIT!"=="" (
        echo ERROR: Good commit required
        pause
        exit /b 1
    )
    
    echo.
    echo Test command options:
    echo [a] npm test
    echo [b] python -m pytest
    echo [c] make test
    echo [d] Custom command
    echo.
    set /p "TEST_TYPE=Select test (a/b/c/d): "
    
    if /i "!TEST_TYPE!"=="a" (
        set "TEST_CMD=npm test"
    ) else if /i "!TEST_TYPE!"=="b" (
        set "TEST_CMD=python -m pytest"
    ) else if /i "!TEST_TYPE!"=="c" (
        set "TEST_CMD=make test"
    ) else if /i "!TEST_TYPE!"=="d" (
        set /p "TEST_CMD=Enter test command: "
    ) else (
        echo Invalid option
        pause
        exit /b 1
    )
    
    echo.
    echo Starting automated bisect with: !TEST_CMD!
    echo.
    
    git bisect start !BAD_COMMIT! !GOOD_COMMIT!
    git bisect run !TEST_CMD!
    
    echo.
    echo Automated bisect complete!
    echo.
    set /p "RESET=Reset bisect now? (Y/N): "
    if /i "!RESET!"=="Y" git bisect reset

) else if "%CHOICE%"=="8" (
    echo.
    echo Current Status:
    echo ========================================
    
    git bisect log >nul 2>&1
    if errorlevel 1 (
        echo No bisect session in progress.
    ) else (
        echo Bisect is in progress.
        echo.
        echo Current commit being tested:
        git log -1 --oneline
        echo.
        echo Bisect progress:
        git bisect log 2>nul | findstr /c:"git bisect"
    )
    echo ========================================

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
pause
