@echo off
setlocal enabledelayedexpansion

echo ========================================
echo    Contributor Statistics
echo ========================================
echo.

cd /d "%~dp0.."

if not exist ".git" (
    echo ERROR: Git repository not initialized
    echo Please run init-repo.bat first
    pause
    exit /b 1
)

echo Select statistics type:
echo.
echo [1] Commit count by author
echo [2] Recent contributors (last 30 days)
echo [3] Commits over time (by month)
echo [4] File ownership statistics
echo [5] Code frequency analysis
echo [6] Author commit timeline
echo [7] Top contributors overall
echo [8] Contribution summary report
echo [9] Cancel
echo.
set /p "CHOICE=Enter choice (1-9): "

if "%CHOICE%"=="1" (
    echo.
    echo Commits by Author:
    echo ========================================
    git shortlog -sn --all
    echo ========================================

) else if "%CHOICE%"=="2" (
    echo.
    echo Contributors in the last 30 days:
    echo ========================================
    git shortlog -sn --since="30 days ago"
    echo ========================================

) else if "%CHOICE%"=="3" (
    echo.
    echo Commits by Month:
    echo ========================================
    powershell -Command "git log --format='%%ad' --date=format:'%%Y-%%m' | Group-Object | Sort-Object Name | ForEach-Object { Write-Host $_.Count $_.Name }"
    echo ========================================

) else if "%CHOICE%"=="4" (
    echo.
    echo Enter file or directory to analyze:
    set /p "FILE_PATH=Path (or Enter for all): "
    
    echo.
    echo File Ownership (by commits):
    echo ========================================
    
    if "!FILE_PATH!"=="" (
        git shortlog -sn
    ) else (
        git shortlog -sn -- "!FILE_PATH!"
    )
    
    echo ========================================

) else if "%CHOICE%"=="5" (
    echo.
    echo Code Frequency Analysis:
    echo ========================================
    echo.
    
    echo Total commits:
    for /f %%c in ('git rev-list --count HEAD 2^>nul') do echo   %%c
    echo.
    
    echo Total contributors:
    for /f %%c in ('git log --format^="%%aN" ^| sort ^| powershell -Command "$input | Select-Object -Unique | Measure-Object | Select-Object -ExpandProperty Count"') do echo   %%c
    echo.
    
    echo Total tracked files:
    for /f %%c in ('git ls-files ^| find /c /v ""') do echo   %%c
    echo.
    
    echo First commit:
    for /f "delims=" %%c in ('git log --reverse --format^="%%ad - %%s" --date^=short ^| powershell -Command "$input | Select-Object -First 1"') do echo   %%c
    echo.
    
    echo Latest commit:
    git log -1 --format="  %%ad - %%s" --date=short
    echo.
    
    echo Most active day of week:
    powershell -Command "git log --format='%%ad' --date=format:'%%A' | Group-Object | Sort-Object Count -Descending | Select-Object -First 1 | ForEach-Object { Write-Host ('  ' + $_.Name + ': ' + $_.Count + ' commits') }"
    echo.

) else if "%CHOICE%"=="6" (
    echo.
    set /p "AUTHOR=Enter author name: "
    if "!AUTHOR!"=="" (
        echo ERROR: Author name required
        pause
        exit /b 1
    )
    
    echo.
    echo Commit Timeline for !AUTHOR! (last 50):
    echo ========================================
    git log --author="!AUTHOR!" --format="%%ad %%s" --date=short -50
    echo ========================================

) else if "%CHOICE%"=="7" (
    echo.
    echo Top 10 Contributors:
    echo ========================================
    echo.
    echo Rank  Commits  Author
    echo ------  -------  ------
    
    set "RANK=0"
    for /f "tokens=1,*" %%a in ('git shortlog -sn --all ^| powershell -Command "$input | Select-Object -First 10"') do (
        set /a "RANK+=1"
        echo !RANK!.    %%a    %%b
    )
    echo.
    echo ========================================

) else if "%CHOICE%"=="8" (
    echo.
    echo ========================================
    echo    CONTRIBUTION SUMMARY REPORT
    echo ========================================
    echo.
    
    for /f "delims=" %%r in ('git rev-parse --show-toplevel 2^>nul') do set "REPO_PATH=%%r"
    for %%r in ("!REPO_PATH!") do echo Repository: %%~nr
    
    for /f "delims=" %%d in ('powershell -Command "Get-Date -Format \"yyyy-MM-dd HH:mm:ss\""') do echo Generated: %%d
    echo.
    
    echo --- Overview ---
    echo.
    
    echo Total Commits:
    for /f %%c in ('git rev-list --count HEAD 2^>nul') do echo   %%c
    
    echo Total Contributors:
    for /f %%c in ('git log --format^="%%aN" ^| sort ^| powershell -Command "$input | Select-Object -Unique | Measure-Object | Select-Object -ExpandProperty Count"') do echo   %%c
    
    echo Total Branches:
    for /f %%c in ('git branch ^| find /c /v ""') do echo   %%c
    
    echo Total Tags:
    for /f %%c in ('git tag 2^>nul ^| find /c /v ""') do echo   %%c
    
    echo.
    echo --- Top Contributors ---
    echo.
    git shortlog -sn --all | powershell -Command "$input | Select-Object -First 10"
    
    echo.
    echo --- Recent Activity (30 days) ---
    echo.
    git shortlog -sn --since="30 days ago" | powershell -Command "$input | Select-Object -First 10"
    
    echo.
    echo --- Commits by Day of Week ---
    echo.
    powershell -Command "git log --format='%%ad' --date=format:'%%A' | Group-Object | Sort-Object Count -Descending | ForEach-Object { Write-Host ('  ' + $_.Count.ToString().PadLeft(4) + ' ' + $_.Name) }"
    
    echo.
    echo ========================================
    echo    END OF REPORT
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
