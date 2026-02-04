@echo off
setlocal enabledelayedexpansion

echo ========================================
echo    Delete Branch
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

echo Available local branches:
echo.
for /f "delims=" %%b in ('git branch --format="%%(refname:short)"') do (
    set "BRANCH=%%b"
    git branch --merged | findstr "!BRANCH!" >nul
    if errorlevel 1 (
        echo   %%b (unmerged)
    ) else (
        echo   %%b (merged)
    )
)
echo.

echo Select deletion type:
echo [1] Delete local branch
echo [2] Delete remote branch
echo [3] Delete both local and remote branch
echo [4] Batch delete merged branches
echo [5] Archive branch before deleting
echo [6] Cancel
echo.
set /p "DELETE_TYPE=Enter choice (1-6): "

if "%DELETE_TYPE%"=="6" (
    echo Operation cancelled.
    pause
    exit /b 0
)

if "%DELETE_TYPE%"=="4" (
    echo.
    echo Merged branches that can be safely deleted:
    echo ========================================
    git branch --merged | findstr /v "*" | findstr /v /i "main" | findstr /v /i "master" | findstr /v /i "develop"
    echo ========================================
    echo.
    
    set /p "CONFIRM_BATCH=Delete ALL these branches? (YES to confirm): "
    if /i "!CONFIRM_BATCH!"=="YES" (
        for /f "delims=" %%b in ('git branch --merged ^| findstr /v "*" ^| findstr /v /i "main" ^| findstr /v /i "master" ^| findstr /v /i "develop"') do (
            set "BRANCH=%%b"
            set "BRANCH=!BRANCH: =!"
            if not "!BRANCH!"=="" (
                echo Deleting: !BRANCH!
                git branch -d "!BRANCH!" 2>nul
            )
        )
        echo.
        echo Batch deletion complete!
    ) else (
        echo Operation cancelled.
    )
    pause
    exit /b 0
)

echo.
set /p "BRANCH_NAME=Enter branch name to delete: "

if "%BRANCH_NAME%"=="" (
    echo ERROR: Branch name cannot be empty
    pause
    exit /b 1
)

REM Validate branch name
echo %BRANCH_NAME% | findstr " " >nul
if not errorlevel 1 (
    echo ERROR: Invalid branch name
    pause
    exit /b 1
)

REM Check if trying to delete current branch
if "%BRANCH_NAME%"=="%CURRENT_BRANCH%" (
    echo ERROR: Cannot delete the currently checked out branch
    echo Please switch to a different branch first using switch-branch.bat
    pause
    exit /b 1
)

REM Protect main branches with extra confirmation
if /i "%BRANCH_NAME%"=="main" (
    echo.
    echo ========================================
    echo WARNING: You are about to delete the MAIN branch!
    echo This is typically the production branch!
    echo ========================================
    set /p "CONFIRM_MAIN=Type 'DELETE MAIN' to confirm: "
    if not "!CONFIRM_MAIN!"=="DELETE MAIN" (
        echo Operation cancelled.
        pause
        exit /b 0
    )
)

if /i "%BRANCH_NAME%"=="master" (
    echo.
    echo ========================================
    echo WARNING: You are about to delete the MASTER branch!
    echo This is typically the production branch!
    echo ========================================
    set /p "CONFIRM_MASTER=Type 'DELETE MASTER' to confirm: "
    if not "!CONFIRM_MASTER!"=="DELETE MASTER" (
        echo Operation cancelled.
        pause
        exit /b 0
    )
)

if "%DELETE_TYPE%"=="5" (
    echo.
    echo Archiving branch before deletion...
    
    git show-ref --verify --quiet refs/heads/%BRANCH_NAME%
    if errorlevel 1 (
        echo ERROR: Branch '%BRANCH_NAME%' does not exist locally
        pause
        exit /b 1
    )
    
    for /f "delims=" %%a in ('powershell -Command "Get-Date -Format \"yyyyMMdd\""') do set "DATE_STR=%%a"
    set "TAG_NAME=archive/%BRANCH_NAME%_%DATE_STR%"
    
    git tag "!TAG_NAME!" %BRANCH_NAME% -m "Archived branch %BRANCH_NAME%"
    if errorlevel 1 (
        echo ERROR: Failed to create archive tag
        pause
        exit /b 1
    )
    echo Branch archived as tag: !TAG_NAME!
    
    echo Now deleting branch...
    git branch -D %BRANCH_NAME%
    echo Branch deleted. Archived as: !TAG_NAME!
    
    set /p "PUSH_TAG=Push archive tag to remote? (Y/N): "
    if /i "!PUSH_TAG!"=="Y" (
        git push origin !TAG_NAME!
    )
    
    REM Log the operation
    for /f "delims=" %%a in ('powershell -Command "Get-Date -Format \"yyyy-MM-dd HH:mm:ss\""') do set "DATETIME=%%a"
    set "LOG_DIR=%~dp0logs"
    if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"
    echo [!DATETIME!] Delete-Branch: %BRANCH_NAME% (archived as !TAG_NAME!) >> "%LOG_DIR%\operations.log"
    
    pause
    exit /b 0
)

if "%DELETE_TYPE%"=="1" (
    REM Delete local branch only
    echo.
    echo Deleting local branch: %BRANCH_NAME%
    
    REM Check if branch exists locally
    git show-ref --verify --quiet refs/heads/%BRANCH_NAME%
    if errorlevel 1 (
        echo ERROR: Branch '%BRANCH_NAME%' does not exist locally
        pause
        exit /b 1
    )
    
    REM Check if branch has unmerged changes
    git branch --merged | findstr "%BRANCH_NAME%" >nul
    if errorlevel 1 (
        echo.
        echo WARNING: Branch has unmerged changes
        echo Commits that may be lost:
        git log %CURRENT_BRANCH%..%BRANCH_NAME% --oneline 2>nul
        echo.
        set /p "FORCE_DELETE=Force delete anyway? (Y/N): "
        if /i "!FORCE_DELETE!"=="Y" (
            git branch -D %BRANCH_NAME%
        ) else (
            echo Operation cancelled.
            pause
            exit /b 0
        )
    ) else (
        git branch -d %BRANCH_NAME%
    )
    
    if errorlevel 1 (
        echo ERROR: Failed to delete local branch
        pause
        exit /b 1
    )
    
    echo Local branch deleted successfully!
    
) else if "%DELETE_TYPE%"=="2" (
    REM Delete remote branch only
    echo.
    echo Deleting remote branch: %BRANCH_NAME%
    echo.
    set /p "CONFIRM_REMOTE=Are you sure? This affects the remote repository! (Y/N): "
    if /i not "!CONFIRM_REMOTE!"=="Y" (
        echo Operation cancelled.
        pause
        exit /b 0
    )
    
    git push origin --delete %BRANCH_NAME%
    if errorlevel 1 (
        echo ERROR: Failed to delete remote branch
        echo The branch might not exist on remote or you lack permissions
        pause
        exit /b 1
    )
    
    echo Remote branch deleted successfully!
    
) else if "%DELETE_TYPE%"=="3" (
    REM Delete both local and remote branch
    echo.
    echo Deleting both local and remote branch: %BRANCH_NAME%
    echo.
    set /p "CONFIRM_BOTH=Are you sure? This affects local AND remote! (Y/N): "
    if /i not "!CONFIRM_BOTH!"=="Y" (
        echo Operation cancelled.
        pause
        exit /b 0
    )
    
    REM Delete local branch
    git show-ref --verify --quiet refs/heads/%BRANCH_NAME%
    if not errorlevel 1 (
        echo Deleting local branch...
        git branch --merged | findstr "%BRANCH_NAME%" >nul
        if errorlevel 1 (
            git branch -D %BRANCH_NAME%
        ) else (
            git branch -d %BRANCH_NAME%
        )
        
        if errorlevel 1 (
            echo WARNING: Failed to delete local branch
        ) else (
            echo Local branch deleted successfully!
        )
    ) else (
        echo Branch does not exist locally.
    )
    
    REM Delete remote branch
    echo.
    echo Deleting remote branch...
    git push origin --delete %BRANCH_NAME% 2>nul
    if errorlevel 1 (
        echo WARNING: Failed to delete remote branch or it doesn't exist
    ) else (
        echo Remote branch deleted successfully!
    )
    
) else (
    echo Invalid choice.
    pause
    exit /b 1
)

REM Log the operation
for /f "delims=" %%a in ('powershell -Command "Get-Date -Format \"yyyy-MM-dd HH:mm:ss\""') do set "DATETIME=%%a"
set "LOG_DIR=%~dp0logs"
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"
echo [%DATETIME%] Delete-Branch: %BRANCH_NAME% (type: %DELETE_TYPE%) >> "%LOG_DIR%\operations.log"

echo.
echo ========================================
echo Branch deletion completed!
echo ========================================
echo.
echo Remaining local branches:
git branch
echo.
pause
