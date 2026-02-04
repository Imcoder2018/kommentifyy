@echo off
setlocal enabledelayedexpansion

echo ========================================
echo    Git Blame Viewer
echo ========================================
echo.

cd /d "%~dp0.."

if not exist ".git" (
    echo ERROR: Git repository not initialized
    echo Please run init-repo.bat first
    pause
    exit /b 1
)

echo Select action:
echo.
echo [1] Blame specific file
echo [2] Blame specific lines
echo [3] Blame with email addresses
echo [4] Blame ignoring whitespace
echo [5] Show who changed file most
echo [6] Show line-by-line commit info
echo [7] Find when line was added
echo [8] Blame through file renames
echo [9] Cancel
echo.
set /p "CHOICE=Enter choice (1-9): "

if "%CHOICE%"=="1" (
    echo.
    set /p "FILE_PATH=Enter file path: "
    if "!FILE_PATH!"=="" (
        echo ERROR: File path required
        pause
        exit /b 1
    )
    
    if not exist "!FILE_PATH!" (
        echo ERROR: File not found: !FILE_PATH!
        pause
        exit /b 1
    )
    
    echo.
    echo Blame for: !FILE_PATH!
    echo ========================================
    git blame "!FILE_PATH!"

) else if "%CHOICE%"=="2" (
    echo.
    set /p "FILE_PATH=Enter file path: "
    if "!FILE_PATH!"=="" (
        echo ERROR: File path required
        pause
        exit /b 1
    )
    
    set /p "START_LINE=Enter start line number: "
    set /p "END_LINE=Enter end line number: "
    
    if "!START_LINE!"=="" (
        echo ERROR: Start line required
        pause
        exit /b 1
    )
    if "!END_LINE!"=="" set "END_LINE=!START_LINE!"
    
    echo.
    echo Blame for !FILE_PATH! lines !START_LINE!-!END_LINE!:
    echo ========================================
    git blame -L !START_LINE!,!END_LINE! "!FILE_PATH!"

) else if "%CHOICE%"=="3" (
    echo.
    set /p "FILE_PATH=Enter file path: "
    if "!FILE_PATH!"=="" (
        echo ERROR: File path required
        pause
        exit /b 1
    )
    
    echo.
    echo Blame with emails for: !FILE_PATH!
    echo ========================================
    git blame -e "!FILE_PATH!"

) else if "%CHOICE%"=="4" (
    echo.
    set /p "FILE_PATH=Enter file path: "
    if "!FILE_PATH!"=="" (
        echo ERROR: File path required
        pause
        exit /b 1
    )
    
    echo.
    echo Blame (ignoring whitespace changes):
    echo ========================================
    git blame -w "!FILE_PATH!"

) else if "%CHOICE%"=="5" (
    echo.
    set /p "FILE_PATH=Enter file path: "
    if "!FILE_PATH!"=="" (
        echo ERROR: File path required
        pause
        exit /b 1
    )
    
    echo.
    echo Contributors to !FILE_PATH!:
    echo ========================================
    
    REM Use PowerShell to count unique authors
    powershell -Command "git blame --line-porcelain '!FILE_PATH!' 2>$null | Select-String '^author ' | ForEach-Object { $_.Line -replace '^author ', '' } | Group-Object | Sort-Object Count -Descending | ForEach-Object { Write-Host ('{0,4} {1}' -f $_.Count, $_.Name) }"
    
    echo.
    echo (Showing author name frequency by lines)

) else if "%CHOICE%"=="6" (
    echo.
    set /p "FILE_PATH=Enter file path: "
    if "!FILE_PATH!"=="" (
        echo ERROR: File path required
        pause
        exit /b 1
    )
    
    echo.
    echo Detailed blame for: !FILE_PATH!
    echo ========================================
    git blame --show-name --show-number "!FILE_PATH!"

) else if "%CHOICE%"=="7" (
    echo.
    set /p "FILE_PATH=Enter file path: "
    if "!FILE_PATH!"=="" (
        echo ERROR: File path required
        pause
        exit /b 1
    )
    
    set /p "SEARCH_TEXT=Enter text to search for: "
    if "!SEARCH_TEXT!"=="" (
        echo ERROR: Search text required
        pause
        exit /b 1
    )
    
    echo.
    echo Searching for when "!SEARCH_TEXT!" was added to !FILE_PATH!...
    echo ========================================
    git log -S "!SEARCH_TEXT!" --oneline -- "!FILE_PATH!"
    
    echo.
    set /p "SHOW_FULL=Show full details of relevant commits? (Y/N): "
    if /i "!SHOW_FULL!"=="Y" (
        echo.
        git log -S "!SEARCH_TEXT!" -p -- "!FILE_PATH!"
    )

) else if "%CHOICE%"=="8" (
    echo.
    set /p "FILE_PATH=Enter file path: "
    if "!FILE_PATH!"=="" (
        echo ERROR: File path required
        pause
        exit /b 1
    )
    
    echo.
    echo Blame (following renames):
    echo ========================================
    git blame -C -C -C "!FILE_PATH!"
    
    echo.
    echo Note: -C -C -C detects code movement between files

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
