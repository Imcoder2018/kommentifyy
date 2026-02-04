@echo off
setlocal enabledelayedexpansion

echo ========================================
echo    Git Repository Optimizer
echo ========================================
echo.

cd /d "%~dp0.."

if not exist ".git" (
    echo ERROR: Git repository not initialized
    echo Please run init-repo.bat first
    pause
    exit /b 1
)

echo Current repository statistics:
echo ========================================
echo.

REM Get repository size
echo Repository size:
for /f "tokens=3" %%s in ('dir /s .git 2^>nul ^| findstr "bytes" ^| findstr /v "free"') do (
    echo   .git folder: %%s bytes
    goto :got_size
)
:got_size

echo.
echo Object count:
git count-objects -v
echo.
echo ========================================
echo.

echo Select optimization action:
echo.
echo [1] Quick cleanup (gc)
echo [2] Aggressive cleanup (gc --aggressive)
echo [3] Prune unreachable objects
echo [4] Repack repository
echo [5] Verify repository integrity
echo [6] Find large files in history
echo [7] Remove large files from history
echo [8] Optimize for network (thin pack)
echo [9] Full optimization (all of the above)
echo [10] Show optimization recommendations
echo [11] Cancel
echo.
set /p "CHOICE=Enter choice (1-11): "

if "%CHOICE%"=="1" (
    echo.
    echo Running garbage collection...
    git gc
    echo.
    echo Cleanup complete!

) else if "%CHOICE%"=="2" (
    echo.
    echo Running aggressive garbage collection...
    echo This may take a while for large repositories.
    echo.
    git gc --aggressive --prune=now
    echo.
    echo Aggressive cleanup complete!

) else if "%CHOICE%"=="3" (
    echo.
    echo Pruning unreachable objects...
    git prune --expire=now
    echo.
    echo Prune complete!

) else if "%CHOICE%"=="4" (
    echo.
    echo Repacking repository...
    git repack -a -d -f --depth=250 --window=250
    echo.
    echo Repack complete!

) else if "%CHOICE%"=="5" (
    echo.
    echo Verifying repository integrity...
    echo ========================================
    git fsck --full
    echo ========================================
    echo.
    echo Verification complete!

) else if "%CHOICE%"=="6" (
    echo.
    echo Finding large files in repository history...
    echo (This may take a while)
    echo ========================================
    echo.
    
    echo Top 20 largest files ever committed:
    powershell -Command "git rev-list --objects --all | git cat-file --batch-check='%%(objecttype) %%(objectname) %%(objectsize) %%(rest)' | Where-Object { $_ -match '^blob' } | Sort-Object { [int]($_ -split ' ')[2] } -Descending | Select-Object -First 20"
    
    echo ========================================
    echo.
    echo Note: These files may still be in history even if deleted.
    echo Use option [7] to remove them permanently.

) else if "%CHOICE%"=="7" (
    echo.
    echo WARNING: This will rewrite Git history!
    echo Make sure you have a backup before proceeding.
    echo.
    
    set /p "FILE_PATH=Enter file path to remove from history: "
    if "!FILE_PATH!"=="" (
        echo ERROR: File path required
        pause
        exit /b 1
    )
    
    set /p "CONFIRM=This will rewrite history. Type 'REWRITE' to confirm: "
    if "!CONFIRM!"=="REWRITE" (
        echo.
        echo Removing !FILE_PATH! from history...
        git filter-branch --force --index-filter "git rm --cached --ignore-unmatch '!FILE_PATH!'" --prune-empty --tag-name-filter cat -- --all
        
        echo.
        echo Cleaning up...
        git for-each-ref --format="delete %%(refname)" refs/original | git update-ref --stdin
        git reflog expire --expire=now --all
        git gc --prune=now --aggressive
        
        echo.
        echo File removed from history!
        echo Note: You may need to force push: git push --force --all
    ) else (
        echo Operation cancelled.
    )

) else if "%CHOICE%"=="8" (
    echo.
    echo Optimizing for network transfer...
    git repack -a -d -f
    echo.
    echo Network optimization complete!

) else if "%CHOICE%"=="9" (
    echo.
    echo Running full optimization...
    echo This may take several minutes.
    echo.
    
    echo Step 1/5: Pruning...
    git prune --expire=now
    echo Done.
    
    echo Step 2/5: Repacking...
    git repack -a -d -f
    echo Done.
    
    echo Step 3/5: Garbage collection...
    git gc --aggressive --prune=now
    echo Done.
    
    echo Step 4/5: Verifying integrity...
    git fsck --full >nul 2>&1
    if errorlevel 1 (
        echo WARNING: Some integrity issues found
    ) else (
        echo Done.
    )
    
    echo Step 5/5: Final cleanup...
    git reflog expire --expire=now --all
    git gc --prune=now
    echo Done.
    
    echo.
    echo Full optimization complete!

) else if "%CHOICE%"=="10" (
    echo.
    echo Optimization Recommendations:
    echo ========================================
    echo.
    
    REM Check loose object count
    for /f "tokens=2" %%c in ('git count-objects ^| findstr "objects"') do set "LOOSE_COUNT=%%c"
    echo Loose objects: !LOOSE_COUNT!
    if !LOOSE_COUNT! GTR 1000 (
        echo   [!] High number of loose objects. Run gc.
    ) else (
        echo   [OK] Loose object count is fine.
    )
    
    echo.
    
    REM Check pack count
    set "PACK_COUNT=0"
    for /f %%p in ('dir /b .git\objects\pack\*.pack 2^>nul ^| find /c /v ""') do set "PACK_COUNT=%%p"
    echo Pack files: !PACK_COUNT!
    if !PACK_COUNT! GTR 10 (
        echo   [!] Many pack files. Run repack.
    ) else (
        echo   [OK] Pack file count is fine.
    )
    
    echo.
    echo General recommendations:
    echo   - Run 'git gc' weekly for active repositories
    echo   - Run 'git gc --aggressive' monthly
    echo   - Use Git LFS for large binary files
    echo   - Remove large files from history if needed
    echo.
    echo ========================================

) else if "%CHOICE%"=="11" (
    echo Operation cancelled.
    pause
    exit /b 0
) else (
    echo Invalid choice.
    pause
    exit /b 1
)

echo.
echo New repository statistics:
echo ========================================
git count-objects -v
echo ========================================
echo.
pause
