@echo off
setlocal enabledelayedexpansion

echo ========================================
echo    Cherry-Pick Manager
echo ========================================
echo.

cd /d "%~dp0.."

if not exist ".git" (
    echo ERROR: Git repository not initialized
    pause
    exit /b 1
)

for /f "delims=" %%i in ('git branch --show-current 2^>nul') do set "CURRENT_BRANCH=%%i"
echo Current branch: %CURRENT_BRANCH%
echo.

echo Select action:
echo.
echo [1] Cherry-pick single commit
echo [2] Cherry-pick multiple commits
echo [3] Cherry-pick range of commits
echo [4] Cherry-pick from another branch (interactive)
echo [5] Continue cherry-pick after resolving conflicts
echo [6] Abort cherry-pick in progress
echo [7] Skip current commit and continue
echo [8] View cherry-pick status
echo [9] Cancel
echo.
set /p "CHOICE=Enter choice (1-9): "

if "%CHOICE%"=="1" (
    echo.
    echo Recent commits from all branches:
    git log --all --oneline -20
    echo.
    
    set /p "COMMIT_HASH=Enter commit hash to cherry-pick: "
    if "!COMMIT_HASH!"=="" (
        echo ERROR: Commit hash cannot be empty
        pause
        exit /b 1
    )
    
    echo.
    echo Cherry-picking commit: !COMMIT_HASH!
    git cherry-pick !COMMIT_HASH!
    
    if errorlevel 1 (
        echo.
        echo Cherry-pick encountered conflicts or errors.
        echo.
        echo To resolve:
        echo 1. Fix conflicts in affected files
        echo 2. Run: git add ^<files^>
        echo 3. Run this script and select option [5] to continue
        echo.
        echo Or select option [6] to abort
    ) else (
        echo.
        echo Cherry-pick successful!
    )

) else if "%CHOICE%"=="2" (
    echo.
    echo Recent commits from all branches:
    git log --all --oneline -30
    echo.
    
    echo Enter commit hashes separated by spaces:
    set /p "COMMITS=Commits: "
    if "!COMMITS!"=="" (
        echo ERROR: No commits specified
        pause
        exit /b 1
    )
    
    echo.
    echo Cherry-picking commits: !COMMITS!
    git cherry-pick !COMMITS!
    
    if errorlevel 1 (
        echo.
        echo Cherry-pick encountered issues.
        echo Use options [5], [6], or [7] to manage.
    ) else (
        echo.
        echo All commits cherry-picked successfully!
    )

) else if "%CHOICE%"=="3" (
    echo.
    echo Enter commit range (older..newer format)
    echo Example: abc1234..def5678
    echo.
    
    set /p "RANGE=Commit range: "
    if "!RANGE!"=="" (
        echo ERROR: Range cannot be empty
        pause
        exit /b 1
    )
    
    echo.
    echo Commits in range:
    git log --oneline !RANGE!
    echo.
    
    set /p "CONFIRM=Cherry-pick these commits? (Y/N): "
    if /i "!CONFIRM!"=="Y" (
        git cherry-pick !RANGE!
        
        if errorlevel 1 (
            echo.
            echo Cherry-pick encountered issues.
        ) else (
            echo.
            echo Range cherry-picked successfully!
        )
    )

) else if "%CHOICE%"=="4" (
    echo.
    echo Available branches:
    git branch -a
    echo.
    
    set /p "SOURCE_BRANCH=Enter source branch: "
    if "!SOURCE_BRANCH!"=="" (
        echo ERROR: Branch name cannot be empty
        pause
        exit /b 1
    )
    
    echo.
    echo Recent commits on !SOURCE_BRANCH!:
    git log !SOURCE_BRANCH! --oneline -20
    echo.
    
    set /p "COMMIT_HASH=Enter commit hash to cherry-pick: "
    if "!COMMIT_HASH!"=="" (
        echo ERROR: Commit hash cannot be empty
        pause
        exit /b 1
    )
    
    git cherry-pick !COMMIT_HASH!
    
    if errorlevel 1 (
        echo.
        echo Cherry-pick encountered conflicts.
    ) else (
        echo.
        echo Cherry-pick successful!
    )

) else if "%CHOICE%"=="5" (
    echo.
    echo Continuing cherry-pick...
    git cherry-pick --continue
    
    if errorlevel 1 (
        echo.
        echo Cannot continue. Make sure all conflicts are resolved
        echo and changes are staged (git add).
    ) else (
        echo.
        echo Cherry-pick continued successfully!
    )

) else if "%CHOICE%"=="6" (
    echo.
    set /p "CONFIRM=Abort cherry-pick in progress? (Y/N): "
    if /i "!CONFIRM!"=="Y" (
        git cherry-pick --abort
        echo Cherry-pick aborted.
    )

) else if "%CHOICE%"=="7" (
    echo.
    echo Skipping current commit...
    git cherry-pick --skip
    echo Current commit skipped.

) else if "%CHOICE%"=="8" (
    echo.
    echo Cherry-pick status:
    echo ========================================
    git status
    echo.
    
    if exist ".git\CHERRY_PICK_HEAD" (
        echo Cherry-pick is in progress.
        echo.
        echo Currently cherry-picking:
        git log -1 --oneline CHERRY_PICK_HEAD
    ) else (
        echo No cherry-pick in progress.
    )

) else if "%CHOICE%"=="9" (
    echo Operation cancelled.
    pause
    exit /b 0
) else (
    echo Invalid choice.
)

echo.
pause
