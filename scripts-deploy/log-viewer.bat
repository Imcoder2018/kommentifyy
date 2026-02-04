@echo off
setlocal enabledelayedexpansion

echo ========================================
echo    Git Log Viewer
echo ========================================
echo.

cd /d "%~dp0.."

if not exist ".git" (
    echo ERROR: Git repository not initialized
    pause
    exit /b 1
)

echo Select log format:
echo.
echo [1] Simple (one line per commit)
echo [2] Detailed (full commit info)
echo [3] Graph view (branch visualization)
echo [4] Graph with all branches
echo [5] By author
echo [6] By date range
echo [7] Search by message
echo [8] File history
echo [9] Custom format
echo [10] Cancel
echo.
set /p "CHOICE=Enter choice (1-10): "

if "%CHOICE%"=="1" (
    echo.
    set /p "COUNT=Number of commits (Enter for 20): "
    if "!COUNT!"=="" set "COUNT=20"
    
    echo.
    git log --oneline -!COUNT!

) else if "%CHOICE%"=="2" (
    echo.
    set /p "COUNT=Number of commits (Enter for 5): "
    if "!COUNT!"=="" set "COUNT=5"
    
    echo.
    git log -!COUNT!

) else if "%CHOICE%"=="3" (
    echo.
    git log --graph --oneline --decorate -20

) else if "%CHOICE%"=="4" (
    echo.
    git log --graph --oneline --decorate --all -30

) else if "%CHOICE%"=="5" (
    echo.
    set /p "AUTHOR=Enter author name: "
    if "!AUTHOR!"=="" (
        echo Cancelled.
        pause
        exit /b 0
    )
    
    echo.
    echo Commits by !AUTHOR!:
    git log --oneline --author="!AUTHOR!" -20

) else if "%CHOICE%"=="6" (
    echo.
    echo Date format: YYYY-MM-DD
    set /p "SINCE=From date: "
    set /p "UNTIL=To date (Enter for today): "
    
    echo.
    if "!UNTIL!"=="" (
        git log --oneline --since="!SINCE!" -30
    ) else (
        git log --oneline --since="!SINCE!" --until="!UNTIL!" -30
    )

) else if "%CHOICE%"=="7" (
    echo.
    set /p "SEARCH=Search term: "
    if "!SEARCH!"=="" (
        echo Cancelled.
        pause
        exit /b 0
    )
    
    echo.
    echo Commits matching "!SEARCH!":
    git log --oneline --grep="!SEARCH!" -20

) else if "%CHOICE%"=="8" (
    echo.
    set /p "FILE=File path: "
    if "!FILE!"=="" (
        echo Cancelled.
        pause
        exit /b 0
    )
    
    echo.
    echo History of !FILE!:
    git log --oneline --follow -- "!FILE!"

) else if "%CHOICE%"=="9" (
    echo.
    echo Custom format codes:
    echo   %%h - short hash
    echo   %%H - full hash
    echo   %%an - author name
    echo   %%ae - author email
    echo   %%ar - relative date
    echo   %%s - subject
    echo.
    
    set /p "FORMAT=Enter format string: "
    if "!FORMAT!"=="" set "FORMAT=%%h %%ar %%s"
    
    echo.
    git log --format="!FORMAT!" -20

) else if "%CHOICE%"=="10" (
    echo Cancelled.
    pause
    exit /b 0
) else (
    echo Invalid choice.
)

echo.
pause
